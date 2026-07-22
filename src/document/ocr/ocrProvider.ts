import { extractGlmText, markdownToOmlJson } from './glmResponseAdapter.ts';
import { adaptGeminiResponse } from './geminiResponseAdapter';
import type { OcrAdapterDiagnostic, OcrHttpDiagnostic, OcrProviderResponseDiagnostic } from '../../types/ocr-diagnostics';

export type OcrProviderId = 'azure-qwen' | 'glm' | 'gpt' | 'gemini' | 'zhipu' | 'auto';

export interface BenchmarkRunOptions {
  providerId: 'openai' | 'google' | 'zhipu';
  model: string;
}

export interface OcrRequest {
  prompt: string;
  images: ReadonlyArray<{ base64Data: string; mimeType: string }>;
}

export interface OcrResult {
  provider: OcrProviderId;
  model: string;
  rawResponse: string;
  text: string;
  requestTokens: number | null;
  responseTokens: number | null;
  costEstimate: number | null;
  http: OcrHttpDiagnostic;
  responseMetadata: OcrProviderResponseDiagnostic;
  adapter: OcrAdapterDiagnostic;
}

export interface OcrProvider {
  readonly id: Exclude<OcrProviderId, 'auto'>;
  readonly displayName: string;
  process(request: OcrRequest): Promise<OcrResult>;
}

type JsonRecord = Record<string, unknown>;
interface HttpResponseData {
  rawResponse: string;
  body: unknown;
  parseError: string | null;
  http: OcrHttpDiagnostic;
}

export class OcrProviderHttpError extends Error {
  constructor(
    message: string,
    readonly http: OcrHttpDiagnostic,
    readonly responseMetadata: OcrProviderResponseDiagnostic,
  ) {
    super(message);
    this.name = 'OcrProviderHttpError';
  }
}

export class OcrProviderAdapterError extends Error {
  constructor(
    message: string,
    readonly http: OcrHttpDiagnostic,
    readonly responseMetadata: OcrProviderResponseDiagnostic,
    readonly adapter: OcrAdapterDiagnostic,
  ) {
    super(message);
    this.name = 'OcrProviderAdapterError';
  }
}

const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null;
const asNumber = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const asStringOrNull = (value: unknown): string | null => typeof value === 'string' ? value : null;

const readHttpResponse = async (response: Response, provider: string, model: string, endpoint: string): Promise<HttpResponseData> => {
  const rawResponse = await response.text();
  let body: unknown = null;
  let parseError: string | null = null;
  try {
    body = JSON.parse(rawResponse);
  } catch (error) {
    parseError = error instanceof Error ? error.message : String(error);
  }
  return {
    rawResponse,
    body,
    parseError,
    http: {
      provider,
      model,
      endpoint,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      rawBody: rawResponse,
      responseBytes: new TextEncoder().encode(rawResponse).byteLength,
    },
  };
};

const metadataFromResponse = (provider: string, model: string, body: unknown): OcrProviderResponseDiagnostic => {
  const record = isRecord(body) ? body : {};
  const candidates = Array.isArray(record.candidates) ? record.candidates : [];
  const candidate = isRecord(candidates[0]) ? candidates[0] : {};
  const content = isRecord(candidate.content) ? candidate.content : {};
  const parts = Array.isArray(content.parts) ? content.parts : [];
  const promptFeedback = record.promptFeedback;
  const promptFeedbackRecord = isRecord(promptFeedback) ? promptFeedback : {};
  return {
    provider,
    model,
    responseId: asStringOrNull(record.responseId ?? record.id),
    modelVersion: asStringOrNull(record.modelVersion ?? record.model),
    finishReason: asStringOrNull(candidate.finishReason ?? record.finish_reason),
    candidateCount: candidates.length,
    partsCount: parts.length,
    blockReason: asStringOrNull(promptFeedbackRecord.blockReason ?? candidate.blockReason),
    safetyRatings: candidate.safetyRatings ?? record.safetyRatings ?? null,
    promptFeedback: promptFeedback ?? null,
    usageMetadata: record.usageMetadata ?? record.usage ?? null,
  };
};

const requireSuccessfulJson = (data: HttpResponseData, provider: string, model: string): JsonRecord => {
  const metadata = metadataFromResponse(provider, model, data.body);
  if (data.http.status !== 200) {
    const responseBody = isRecord(data.body) ? data.body : {};
    const responseError = isRecord(responseBody.error) ? responseBody.error : {};
    const apiMessage = asStringOrNull(responseError.message ?? responseBody.message);
    throw new OcrProviderHttpError(
      `GLM OCR HTTP ${data.http.status} ${data.http.statusText}${apiMessage ? `: ${apiMessage}` : ''}`,
      data.http,
      metadata,
    );
  }
  if (data.parseError !== null || !isRecord(data.body)) {
    throw new OcrProviderHttpError(`Provider response JSON không hợp lệ: ${data.parseError ?? 'response is not an object'}`, data.http, metadata);
  }
  return data.body;
};

const fetchWithDiagnostics = async (endpoint: string, init: RequestInit, provider: string, model: string): Promise<Response> => {
  try {
    return await fetch(endpoint, init);
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    const http: OcrHttpDiagnostic = { provider, model, endpoint, status: 0, statusText: message, headers: {}, rawBody: '', responseBytes: 0 };
    throw new OcrProviderHttpError(`Provider transport error: ${message}`, http, metadataFromResponse(provider, model, null));
  }
};

const openAiText = (body: JsonRecord): string => {
  if (typeof body.output_text === 'string') return body.output_text;
  const output = Array.isArray(body.output) ? body.output : [];
  const outputText = output.flatMap((item) => isRecord(item) && Array.isArray(item.content) ? item.content : [])
    .map((item) => isRecord(item) && typeof item.text === 'string' ? item.text : '').join('');
  if (outputText) return outputText;
  const choice = Array.isArray(body.choices) ? body.choices[0] : undefined;
  return isRecord(choice) && isRecord(choice.message) && typeof choice.message.content === 'string' ? choice.message.content : '';
};

const fileToBase64 = async (file: File): Promise<string> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const chunkSize = 0x8000;
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
};

export const parseFileWithGlmOcr = async (
  file: File,
  onMarkdownReady?: () => void,
): Promise<string> => {
  const endpoint = '/api/glm-ocr';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'glm-ocr',
      file: await fileToBase64(file),
      return_crop_images: false,
      need_layout_visualization: false,
    }),
  });
  const data = await readHttpResponse(response, 'glm-ocr', 'glm-ocr', endpoint);
  const body = requireSuccessfulJson(data, 'glm-ocr', 'glm-ocr');
  const markdown = extractGlmText(body);
  if (!markdown.trim()) {
    const apiMessage = typeof body.message === 'string' ? ` ${body.message}` : '';
    throw new Error(`GLM OCR không trả về md_results.${apiMessage}`);
  }

  onMarkdownReady?.();
  return markdownToOmlJson(markdown);
};

export class GptVisionProvider implements OcrProvider {
  readonly id = 'gpt' as const;
  readonly displayName = 'GPT-5-mini';
  private readonly endpoint = import.meta.env.AZURE_QWEN_ENDPOINT;
  private readonly apiKey = import.meta.env.AZURE_QWEN_KEY;
  private readonly model: string;

  constructor(model?: string) { this.model = model ?? import.meta.env.AZURE_QWEN_MODEL ?? 'gpt-5-mini'; }

  async process(request: OcrRequest): Promise<OcrResult> {
    if (!this.endpoint || !this.apiKey) throw new Error('GPT provider chưa được cấu hình AZURE_QWEN_ENDPOINT/AZURE_QWEN_KEY.');
    const response = await fetchWithDiagnostics(this.endpoint, { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: this.model, input: [{ role: 'user', content: [{ type: 'input_text', text: request.prompt }, ...request.images.map((image) => ({ type: 'input_image', image_url: `data:${image.mimeType};base64,${image.base64Data}` }))] }], text: { format: { type: 'json_object' } } }) }, this.id, this.model);
    const data = await readHttpResponse(response, this.id, this.model, this.endpoint);
    const body = requireSuccessfulJson(data, this.id, this.model);
    const usage = isRecord(body.usage) ? body.usage : {};
    const rawText = openAiText(body);
    let text = rawText;
    try {
      const clean = rawText.replace(/^\`\`\`json\s*/i, '').replace(/\`\`\`\s*$/, '').trim();
      const parsed = JSON.parse(clean);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.content)) {
        text = markdownToOmlJson(rawText);
      }
    } catch {
      text = markdownToOmlJson(rawText);
    }
    return { provider: this.id, model: this.model, rawResponse: data.rawResponse, text, requestTokens: asNumber(usage.input_tokens ?? usage.prompt_tokens), responseTokens: asNumber(usage.output_tokens ?? usage.completion_tokens), costEstimate: null, http: data.http, responseMetadata: metadataFromResponse(this.id, this.model, body), adapter: { provider: this.id, input: data.rawResponse, output: text } };
  }
}

export class GeminiFlashProvider implements OcrProvider {
  readonly id = 'gemini' as const;
  readonly displayName = 'Gemini 3.5 Flash';
  private readonly apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  private readonly model: string;

  constructor(model?: string) { this.model = model ?? import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-3.5-flash'; }

  async process(request: OcrRequest): Promise<OcrResult> {
    if (!this.apiKey) throw new Error('Gemini provider chưa được cấu hình VITE_GEMINI_API_KEY.');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    const response = await fetchWithDiagnostics(endpoint, { method: 'POST', headers: { 'x-goog-api-key': this.apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: request.prompt }, ...request.images.map((image) => ({ inlineData: { mimeType: image.mimeType, data: image.base64Data } }))] }], generationConfig: { responseMimeType: 'application/json' } }) }, this.id, this.model);
    const data = await readHttpResponse(response, this.id, this.model, endpoint);
    requireSuccessfulJson(data, this.id, this.model);
    const metadata = metadataFromResponse(this.id, this.model, data.body);
    try {
      const adapted = adaptGeminiResponse(data.rawResponse, this.model);
      return { ...adapted, http: data.http, responseMetadata: metadata, adapter: { provider: this.id, input: data.rawResponse, output: adapted.text } };
    } catch (error) {
      const adapter = { provider: this.id, input: data.rawResponse, output: null, exception: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
      throw new OcrProviderAdapterError(adapter.exception, data.http, metadata, adapter);
    }
  }
}

export class ZhipuVisionProvider implements OcrProvider {
  readonly id = 'zhipu' as const;
  readonly displayName = 'Zhipu GLM Vision';
  private readonly apiKey = import.meta.env.VITE_GLM_API_KEY;
  private readonly endpoint = import.meta.env.VITE_GLM_API_URL;
  private readonly model: string;

  constructor(model?: string) { this.model = model ?? import.meta.env.VITE_GLM_MODEL ?? 'glm-4.6v-flash'; }

  async process(request: OcrRequest): Promise<OcrResult> {
    if (!this.apiKey || !this.endpoint) throw new Error('GLM provider chưa được cấu hình VITE_GLM_API_KEY/VITE_GLM_API_URL.');
    const response = await fetchWithDiagnostics(this.endpoint, { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: this.model, messages: [{ role: 'user', content: [{ type: 'text', text: request.prompt }, ...request.images.map((image) => ({ type: 'image_url', image_url: { url: image.base64Data } }))] }], response_format: { type: 'json_object' } }) }, this.id, this.model);
    const data = await readHttpResponse(response, this.id, this.model, this.endpoint);
    const body = requireSuccessfulJson(data, this.id, this.model);
    const usage = isRecord(body.usage) ? body.usage : {};
    const text = openAiText(body);
    return { provider: this.id, model: this.model, rawResponse: data.rawResponse, text, requestTokens: asNumber(usage.prompt_tokens), responseTokens: asNumber(usage.completion_tokens), costEstimate: null, http: data.http, responseMetadata: metadataFromResponse(this.id, this.model, body), adapter: { provider: this.id, input: data.rawResponse, output: text } };
  }
}

export class OcrProviderFactory {
  static create(id: OcrProviderId = 'gpt', model?: string): OcrProvider {
    if (id === 'gemini') return new GeminiFlashProvider(model);
    if (id === 'zhipu') return new ZhipuVisionProvider(model);
    if (id === 'gpt' || id === 'azure-qwen') return new GptVisionProvider(model);
    throw new Error(`OCR provider không được hỗ trợ trong giai đoạn này: ${id}.`);
  }
}
