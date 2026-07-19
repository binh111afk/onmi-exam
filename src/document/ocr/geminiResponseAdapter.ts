import type { OcrResult } from './ocrProvider';

type JsonRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null;
const numberOrNull = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;

export const adaptGeminiResponse = (rawResponse: string, model: string): OcrResult => {
  const response: unknown = JSON.parse(rawResponse);
  if (!isRecord(response)) throw new Error('Gemini response không phải JSON object.');
  const candidate = Array.isArray(response.candidates) ? response.candidates[0] : undefined;
  const parts = isRecord(candidate) && isRecord(candidate.content) && Array.isArray(candidate.content.parts) ? candidate.content.parts : [];
  const text = parts.map((part) => isRecord(part) && typeof part.text === 'string' ? part.text : '').join('');
  const usage = isRecord(response.usageMetadata) ? response.usageMetadata : {};
  return { provider: 'gemini', model, rawResponse, text, requestTokens: numberOrNull(usage.promptTokenCount), responseTokens: numberOrNull(usage.candidatesTokenCount), costEstimate: null };
};
