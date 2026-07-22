import type { OcrResult } from './ocrProvider.ts';
import { CompilerPipeline } from '../parsers/compiler/compilerPipeline.ts';
import { questionDocumentToOml } from '../adapters/omlQuestionObjectAdapter.ts';
import type { RawDocument } from '../../types/raw-document.ts';
import type { DocumentLayout } from '../../types/document-layout.ts';

type JsonRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is JsonRecord => typeof value === 'object' && value !== null;
const asText = (value: unknown): string => typeof value === 'string' ? value : '';

export const extractGlmText = (response: unknown): string => {
  if (!isRecord(response)) return '';
  if (typeof response.md_results === 'string') return response.md_results;
  if (typeof response.markdown === 'string') return response.markdown;
  if (typeof response.text === 'string') return response.text;
  if (Array.isArray(response.choices)) {
    const firstChoice = response.choices[0];
    if (isRecord(firstChoice) && isRecord(firstChoice.message)) {
      return asText(firstChoice.message.content);
    }
  }
  const words = Array.isArray(response.words_result) ? response.words_result : [];
  return words.map((word) => isRecord(word) ? asText(word.words) : '').filter(Boolean).join('\n');
};

export const markdownToOmlJson = (markdownText: string): string => {
  const lines = markdownText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const markdownNodes = lines.map((line) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/u);
    let text = headingMatch?.[2] ?? line;
    text = text.replace(/^[-+*]\s+(?=(?:Câu|Question)\s*\d+|[A-Da-d]\s*[.):])/iu, '');
    text = text.replace(/^(?:\*\*|__)((?:Câu|Question)\s*\d+\s*[.):]?)(?:\*\*|__)\s*/iu, '$1 ');
    return {
      text,
      type: headingMatch ? 'heading' as const : 'paragraph' as const,
      headingLevel: headingMatch ? Math.min(3, headingMatch[1].length) : undefined,
    };
  });
  const rawNodes = markdownNodes.map((node) => ({
    kind: 'text' as const,
    text: node.text,
    style: node.type === 'heading' ? 'heading' as const : undefined,
    headingLevel: node.headingLevel,
    page: 1,
  }));

  const rawDoc: RawDocument = {
    version: '1.0',
    source: { name: 'glm-ocr.pdf', mimeType: 'application/pdf', kind: 'pdf' },
    nodes: rawNodes,
    ocrRequirement: 'not-required',
    ocrCandidates: [],
    reviewMarkers: [],
  };

  const layout: DocumentLayout = {
    version: '1.0',
    sourceKind: 'pdf',
    pages: [],
    ocrPlan: [],
    nodes: markdownNodes.map((node, index) => ({
      id: `n-${index}`,
      rawNodeIndex: index,
      page: 1,
      boundingBox: { x: 0, y: index, width: 1, height: 1 },
      hasMeasuredGeometry: true,
      readingOrder: index,
      type: node.type,
      text: node.text,
      confidence: 1,
    })),
  };

  const pipeline = new CompilerPipeline();
  const report = pipeline.compileWithDiagnostics(rawDoc, layout);
  const omlV2 = questionDocumentToOml(report.document);
  return JSON.stringify(omlV2, null, 2);
};

export const adaptGlmOcrResponse = (rawResponse: string, model: string): OcrResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawResponse);
  } catch {
    parsed = undefined;
  }
  const extractedText = extractGlmText(parsed);
  const omlJson = extractedText ? markdownToOmlJson(extractedText) : rawResponse;
  return {
    provider: 'glm',
    model,
    rawResponse,
    text: omlJson,
    requestTokens: null,
    responseTokens: null,
    costEstimate: null,
  };
};
