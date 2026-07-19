import type { DocumentPipelineMetrics, DocumentPipelineResult } from '../document/pipeline/documentPipelineDispatcher';
import type { OcrDiagnosticReport } from './ocr-diagnostics';

export type BenchmarkFileCategory = 'docx' | 'pdf-text' | 'pdf-scan' | 'pdf-hybrid' | 'image' | 'json' | 'oml' | 'unknown';
export type BenchmarkFileStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';

export interface BenchmarkErrorDetails {
  name: string;
  message: string;
  stack?: string;
  cause?: string;
  ocrDiagnostics?: OcrDiagnosticReport[];
}

export interface BenchmarkFileSource {
  id: string;
  name: string;
  relativePath: string;
  category: BenchmarkFileCategory;
  subject: string;
  size: number;
  getFile: () => Promise<File>;
}

export interface BenchmarkDocumentCounts {
  question: number;
  questionGroup: number;
  questionInGroup: number;
  option: number;
  image: number;
  table: number;
  formula: number;
  review: number;
}

export interface BenchmarkPipelineSummary {
  route: DocumentPipelineResult['route'];
  trace: string[];
  metrics: DocumentPipelineMetrics;
  documentCounts: BenchmarkDocumentCounts;
}

export interface BenchmarkFileResult extends BenchmarkFileSource {
  status: BenchmarkFileStatus;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  errorDetails?: BenchmarkErrorDetails;
  pipeline?: BenchmarkPipelineSummary;
  currentStep?: string;
}

export interface BenchmarkRunState {
  status: 'idle' | 'scanning' | 'running' | 'paused' | 'stopped' | 'completed';
  currentFileId?: string;
  startedAt?: string;
  completedAt?: string;
}
