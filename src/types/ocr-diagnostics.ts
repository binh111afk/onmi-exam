export type OcrDiagnosticStageName = 'OCR Response' | 'Normalize' | 'Parse' | 'Filter #1' | 'Merge' | 'Filter #2' | 'Question Object' | 'OML';

export interface OcrRejectedBlock {
  id: string | number | null;
  page: number | null;
  type: string | null;
  preview: string;
  rejected: true;
  reason: 'MissingQuestionNumber' | 'MissingOptions' | 'MissingStem' | 'InvalidChoiceStructure' | 'InvalidOML' | 'UnknownBlock' | 'EmptyText' | 'OcrNoise';
  missingFields: string[];
}

export interface OcrDiagnosticStage {
  stage: OcrDiagnosticStageName;
  input: unknown;
  output: unknown;
  durationMs: number;
  success: boolean;
}

export interface OcrHttpDiagnostic {
  provider: string;
  model: string;
  endpoint: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  rawBody: string;
  responseBytes: number;
}

export interface OcrProviderResponseDiagnostic {
  provider: string;
  model: string;
  responseId: string | null;
  modelVersion: string | null;
  finishReason: string | null;
  candidateCount: number;
  partsCount: number;
  blockReason: string | null;
  safetyRatings: unknown;
  promptFeedback: unknown;
  usageMetadata: unknown;
}

export interface OcrAdapterDiagnostic {
  provider: string;
  input: string;
  output: string | null;
  exception?: string;
}

export interface OcrParseDiagnostic {
  stage: 'provider-json' | 'ocr-json' | 'ocr-schema';
  rawText: string;
  error: string;
  position: number | null;
  rawBlockCount: number;
  acceptedBlockCount: number;
  rejectedBlockCount: number;
}

export interface OcrRequestDiagnostic {
  provider: string;
  model: string;
  endpoint: string | null;
  page: number | null;
  regionId: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  imageBytes: number | null;
  base64Bytes: number;
  mimeTypes: string[];
}

export interface OcrDiagnosticSummary {
  rawBlocks: number;
  normalizedBlocks: number;
  parsedBlocks: number;
  filter1Before: number;
  filter1After: number;
  mergeBefore: number;
  mergeAfter: number;
  filter2Before: number;
  filter2After: number;
  mergedContentLength: number;
  questionCount: number;
  omlBlocks: number;
  questionGroupsDetected: number;
  questionGroupsAccepted: number;
  questionGroupsRejected: number;
  questionsKeptFromGroups: number;
  questionsRemovedFromGroups: number;
}

export interface OcrDiagnosticReport {
  fileName: string;
  provider: string;
  requestCount: number;
  pages: number[];
  regions: string[];
  stages: OcrDiagnosticStage[];
  summary: OcrDiagnosticSummary;
  rejectedBlocks: OcrRejectedBlock[];
  rawResponses: string[];
  requests: OcrRequestDiagnostic[];
  http: OcrHttpDiagnostic[];
  providerResponses: OcrProviderResponseDiagnostic[];
  adapterDiagnostics: OcrAdapterDiagnostic[];
  parseDiagnostics: OcrParseDiagnostic[];
  failedPages?: number[];
  error?: string;
}
