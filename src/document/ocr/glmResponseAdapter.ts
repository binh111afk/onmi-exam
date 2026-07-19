import type { OcrResult } from './ocrProvider';

type JsonRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null;
const asText = (value: unknown): string => typeof value === 'string' ? value : '';

const extractGlmText = (response: unknown): string => {
  if (!isRecord(response)) return '';
  if (typeof response.markdown === 'string') return response.markdown;
  if (typeof response.text === 'string') return response.text;
  const words = Array.isArray(response.words_result) ? response.words_result : [];
  return words.map((word) => isRecord(word) ? asText(word.words) : '').filter(Boolean).join('\n');
};

const toOmlCompatibleJson = (text: string): string => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const content: Array<{ type: 'question'; subType: 'choice'; id: string; question: string; options: Array<{ id: string; content: string }>; answer: string[]; explanation: string }> = [];
  let current: { type: 'question'; subType: 'choice'; id: string; question: string; options: Array<{ id: string; content: string }>; answer: string[]; explanation: string } | undefined;
  for (const line of lines) {
    const question = line.match(/^(?:Câu|Question)\s*(\d+)\s*[:.)-]?\s*(.*)$/i);
    if (question) {
      if (current) content.push(current);
      current = { type: 'question', subType: 'choice', id: question[1], question: question[2], options: [], answer: [], explanation: '' };
      continue;
    }
    const option = line.match(/^([A-D])\s*[.)]\s*(.+)$/i);
    if (current && option) current.options.push({ id: option[1].toUpperCase(), content: option[2] });
    else if (current && current.options.length === 0) current.question = `${current.question} ${line}`.trim();
  }
  if (current) content.push(current);
  return JSON.stringify({ version: '2.0', info: {}, content });
};

export const adaptGlmOcrResponse = (rawResponse: string, model: string): OcrResult => {
  let parsed: unknown;
  try { parsed = JSON.parse(rawResponse); } catch { parsed = undefined; }
  return { provider: 'glm', model, rawResponse, text: toOmlCompatibleJson(extractGlmText(parsed)), requestTokens: null, responseTokens: null, costEstimate: null };
};
