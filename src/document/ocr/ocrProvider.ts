import { adaptGeminiResponse } from './geminiResponseAdapter';

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
}

export interface OcrProvider {
  readonly id: Exclude<OcrProviderId, 'auto'>;
  readonly displayName: string;
  process(request: OcrRequest): Promise<OcrResult>;
}

type JsonRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null;
const asNumber = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;

const readJson = async (response: Response): Promise<{ rawResponse: string; body: JsonRecord }> => {
  const rawResponse = await response.text();
  let value: unknown;
  try { value = JSON.parse(rawResponse); } catch { throw new Error(`Provider trả JSON không hợp lệ: ${rawResponse}`); }
  if (!isRecord(value)) throw new Error('Provider trả response không phải JSON object.');
  if (!response.ok) throw new Error(`Provider error ${response.status}: ${rawResponse}`);
  return { rawResponse, body: value };
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

export class GptVisionProvider implements OcrProvider {
  readonly id = 'gpt' as const;
  readonly displayName = 'GPT-5-mini';
  private readonly endpoint = import.meta.env.AZURE_QWEN_ENDPOINT;
  private readonly apiKey = import.meta.env.AZURE_QWEN_KEY;
  private readonly model: string;

  constructor(model?: string) { this.model = model ?? import.meta.env.AZURE_QWEN_MODEL ?? 'gpt-5-mini'; }

  async process(request: OcrRequest): Promise<OcrResult> {
    if (!this.endpoint || !this.apiKey) throw new Error('GPT provider chưa được cấu hình AZURE_QWEN_ENDPOINT/AZURE_QWEN_KEY.');
    const response = await fetch(this.endpoint, { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: this.model, input: [{ role: 'user', content: [{ type: 'input_text', text: request.prompt }, ...request.images.map((image) => ({ type: 'input_image', image_url: `data:${image.mimeType};base64,${image.base64Data}` }))] }], text: { format: { type: 'json_object' } } }) });
    const { rawResponse, body } = await readJson(response);
    const usage = isRecord(body.usage) ? body.usage : {};
    return { provider: this.id, model: this.model, rawResponse, text: openAiText(body), requestTokens: asNumber(usage.input_tokens ?? usage.prompt_tokens), responseTokens: asNumber(usage.output_tokens ?? usage.completion_tokens), costEstimate: null };
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
    const response = await fetch(endpoint, { method: 'POST', headers: { 'x-goog-api-key': this.apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: request.prompt }, ...request.images.map((image) => ({ inlineData: { mimeType: image.mimeType, data: image.base64Data } }))] }], generationConfig: { responseMimeType: 'application/json' } }) });
    const { rawResponse, body } = await readJson(response);
    return adaptGeminiResponse(rawResponse, this.model);
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
    const response = await fetch(this.endpoint, { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: this.model, messages: [{ role: 'user', content: [{ type: 'text', text: request.prompt }, ...request.images.map((image) => ({ type: 'image_url', image_url: { url: image.base64Data } }))] }], response_format: { type: 'json_object' } }) });
    const { rawResponse, body } = await readJson(response);
    const usage = isRecord(body.usage) ? body.usage : {};
    return { provider: this.id, model: this.model, rawResponse, text: openAiText(body), requestTokens: asNumber(usage.prompt_tokens), responseTokens: asNumber(usage.completion_tokens), costEstimate: null };
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
