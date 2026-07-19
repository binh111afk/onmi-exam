export type OcrDiagnosticStageName = 'OCR Response' | 'Normalize' | 'Parse' | 'Filter #1' | 'Merge' | 'Filter #2' | 'Question Object' | 'OML';

export interface OcrRejectedBlock {
  id: string | number | null;
  page: number | null;
  type: string | null;
  preview: string;
  rejected: true;
  reason: 'MissingQuestionNumber' | 'MissingOptions' | 'MissingStem' | 'InvalidChoiceStructure' | 'InvalidOML' | 'UnknownBlock' | 'EmptyText' | 'OcrNoise';
}

export interface OcrDiagnosticStage {
  stage: OcrDiagnosticStageName;
  input: unknown;
  output: unknown;
  durationMs: number;
  success: boolean;
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
  questionCount: number;
  omlBlocks: number;
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
  error?: string;
}
