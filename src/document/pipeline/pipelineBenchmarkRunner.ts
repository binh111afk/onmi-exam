import { questionDocumentToOml } from '../adapters/omlQuestionObjectAdapter';
import { DocumentPipelineDispatcher } from './documentPipelineDispatcher';
import type { DocumentPipelineResult } from './documentPipelineDispatcher';

export interface BenchmarkSample {
  name: string;
  result: DocumentPipelineResult;
  totalLatencyMs: number;
  omlGenerationMs: number;
}

export interface PipelineBenchmarkReport {
  sampleCount: number;
  averageLatencyMs: number;
  medianLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  averageOcrSavingPercent: number;
  samples: BenchmarkSample[];
}

const percentile = (values: number[], percentileValue: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.min(sorted.length - 1, Math.ceil(percentileValue * sorted.length) - 1)];
};

export class PipelineBenchmarkRunner {
  private readonly dispatcher: DocumentPipelineDispatcher;

  constructor(dispatcher = new DocumentPipelineDispatcher()) {
    this.dispatcher = dispatcher;
  }

  async run(files: File[]): Promise<PipelineBenchmarkReport> {
    const samples: BenchmarkSample[] = [];
    for (const file of files) {
      const startedAt = performance.now();
      const result = await this.dispatcher.dispatch(file);
      const totalLatencyMs = performance.now() - startedAt;
      const omlStart = performance.now();
      questionDocumentToOml(result.document);
      const omlGenerationMs = performance.now() - omlStart;
      samples.push({ name: file.name, result, totalLatencyMs, omlGenerationMs });
    }

    const latencies = samples.map((sample) => sample.totalLatencyMs);
    return {
      sampleCount: samples.length,
      averageLatencyMs: latencies.length === 0 ? 0 : latencies.reduce((total, value) => total + value, 0) / latencies.length,
      medianLatencyMs: percentile(latencies, 0.5),
      p95LatencyMs: percentile(latencies, 0.95),
      p99LatencyMs: percentile(latencies, 0.99),
      averageOcrSavingPercent: samples.length === 0 ? 0 : samples.reduce((total, sample) => total + sample.result.metrics.estimatedSavingPercent, 0) / samples.length,
      samples,
    };
  }

  toMarkdown(report: PipelineBenchmarkReport): string {
    return [
      '# Document Pipeline Benchmark',
      '',
      `Samples: ${report.sampleCount}`,
      `Average latency: ${report.averageLatencyMs.toFixed(2)}ms`,
      `Median latency: ${report.medianLatencyMs.toFixed(2)}ms`,
      `P95 latency: ${report.p95LatencyMs.toFixed(2)}ms`,
      `P99 latency: ${report.p99LatencyMs.toFixed(2)}ms`,
      `Average OCR saving: ${report.averageOcrSavingPercent.toFixed(2)}%`,
      '',
      '| File | Total | OML generation | OCR regions | Skipped regions |',
      '| --- | ---: | ---: | ---: | ---: |',
      ...report.samples.map((sample) => `| ${sample.name} | ${sample.totalLatencyMs.toFixed(2)}ms | ${sample.omlGenerationMs.toFixed(2)}ms | ${sample.result.metrics.ocrRegions} | ${sample.result.metrics.skippedRegions} |`),
      '',
      '## Pipeline Breakdown',
      ...report.samples.flatMap((sample) => [
        `### ${sample.name}`,
        ...sample.result.metrics.steps.map((step) => `- ${step.name}: ${step.durationMs.toFixed(2)}ms`),
        `- OCR request time: ${sample.result.metrics.networkRequestTimeMs.toFixed(2)}ms`,
        `- Peak JS heap: ${sample.result.metrics.peakMemoryBytes ?? 'unavailable'}`,
        `- Temporary canvas bytes: ${sample.result.metrics.temporaryCanvasBytes}`,
      ]),
    ].join('\n');
  }
}
