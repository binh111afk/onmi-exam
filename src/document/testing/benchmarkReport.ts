import type { DocumentPipelineResult } from '../pipeline/documentPipelineDispatcher';

export interface BenchmarkValueSummary {
  average: number;
  median: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
}

export interface DocumentBenchmarkSummary {
  pipelineTimeMs: BenchmarkValueSummary;
  importerTimeMs: BenchmarkValueSummary;
  parserTimeMs: BenchmarkValueSummary;
  ocrTimeMs: BenchmarkValueSummary;
  memoryBytes: BenchmarkValueSummary;
  canvasMemoryBytes: BenchmarkValueSummary;
  ocrSavingPercent: BenchmarkValueSummary;
}

const percentile = (values: number[], value: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * value) - 1)];
};

const summarize = (values: number[]): BenchmarkValueSummary => ({
  average: values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length,
  median: percentile(values, 0.5),
  min: values.length === 0 ? 0 : Math.min(...values),
  max: values.length === 0 ? 0 : Math.max(...values),
  p95: percentile(values, 0.95),
  p99: percentile(values, 0.99),
});

const stepDuration = (result: DocumentPipelineResult, stepName: 'importer' | 'parser'): number => result.metrics.steps
  .filter((step) => step.name === stepName)
  .reduce((total, step) => total + step.durationMs, 0);

export const summarizeDocumentBenchmark = (results: DocumentPipelineResult[]): DocumentBenchmarkSummary => ({
  pipelineTimeMs: summarize(results.map((result) => result.metrics.steps.reduce((total, step) => total + step.durationMs, 0))),
  importerTimeMs: summarize(results.map((result) => stepDuration(result, 'importer'))),
  parserTimeMs: summarize(results.map((result) => stepDuration(result, 'parser'))),
  ocrTimeMs: summarize(results.map((result) => result.metrics.ocrTimeMs)),
  memoryBytes: summarize(results.map((result) => result.metrics.peakMemoryBytes ?? 0)),
  canvasMemoryBytes: summarize(results.map((result) => result.metrics.temporaryCanvasBytes)),
  ocrSavingPercent: summarize(results.map((result) => result.metrics.estimatedSavingPercent)),
});
