import { questionDocumentToOml } from '../adapters/omlQuestionObjectAdapter';
import { PipelineBenchmarkRunner, type PipelineBenchmarkReport } from '../pipeline/pipelineBenchmarkRunner';
import { DocumentPipelineDispatcher, type DocumentPipelineResult } from '../pipeline/documentPipelineDispatcher';
import type { OmlDocumentV2 } from '../../types/oml';
import type { QuestionDocument } from '../../types/question-object';
import { summarizeDocumentBenchmark } from './benchmarkReport';
import { compareOmlSemantically, compareSemantically, measureDocumentAccuracy, type DocumentAccuracy, type SemanticComparison } from './semanticComparator';

export interface DocumentRegressionCase {
  id: string;
  file: File;
  expectedDocument: QuestionDocument;
  expectedOml: OmlDocumentV2;
  baseline?: RegressionPerformanceBaseline;
}

export interface RegressionPerformanceBaseline {
  latencyMs: number;
  ocrRegions: number;
  peakMemoryBytes?: number;
}

export interface RegressionThresholds {
  maxLatencyIncreasePercent: number;
  maxOcrRegionIncreasePercent: number;
  maxMemoryIncreasePercent: number;
}

export interface DocumentRegressionResult {
  id: string;
  pipeline: DocumentPipelineResult;
  questionObject: SemanticComparison;
  oml: SemanticComparison;
  accuracy: DocumentAccuracy;
  performance: RegressionPerformanceResult;
}

export interface RegressionPerformanceResult {
  status: 'pass' | 'warning' | 'fail';
  latencyIncreasePercent?: number;
  ocrRegionIncreasePercent?: number;
  memoryIncreasePercent?: number;
  messages: string[];
}

export interface DocumentRegressionReport {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  results: DocumentRegressionResult[];
  benchmark: PipelineBenchmarkReport;
}

export interface DocumentRegressionSnapshot {
  id: string;
  questionObject: QuestionDocument;
  oml: OmlDocumentV2;
  metrics: DocumentPipelineResult['metrics'];
  trace: string[];
}

export const defaultRegressionThresholds: RegressionThresholds = {
  maxLatencyIncreasePercent: 10,
  maxOcrRegionIncreasePercent: 20,
  maxMemoryIncreasePercent: 30,
};

const percentageIncrease = (current: number, baseline: number): number | undefined => baseline === 0 ? undefined : ((current - baseline) / baseline) * 100;

export const evaluatePerformanceRegression = (result: DocumentPipelineResult, baseline: RegressionPerformanceBaseline | undefined, thresholds: RegressionThresholds): RegressionPerformanceResult => {
  if (!baseline) return { status: 'pass', messages: ['No baseline is defined for this corpus entry.'] };
  const latency = result.metrics.steps.reduce((total, step) => total + step.durationMs, 0);
  const latencyIncreasePercent = percentageIncrease(latency, baseline.latencyMs);
  const ocrRegionIncreasePercent = percentageIncrease(result.metrics.ocrRegions, baseline.ocrRegions);
  const memoryIncreasePercent = baseline.peakMemoryBytes === undefined || result.metrics.peakMemoryBytes === undefined ? undefined : percentageIncrease(result.metrics.peakMemoryBytes, baseline.peakMemoryBytes);
  const messages: string[] = [];
  let status: RegressionPerformanceResult['status'] = 'pass';
  if (latencyIncreasePercent !== undefined && latencyIncreasePercent > thresholds.maxLatencyIncreasePercent) {
    status = 'fail';
    messages.push(`Latency increased ${latencyIncreasePercent.toFixed(2)}%.`);
  }
  if (ocrRegionIncreasePercent !== undefined && ocrRegionIncreasePercent > thresholds.maxOcrRegionIncreasePercent) {
    if (status === 'pass') status = 'warning';
    messages.push(`OCR region count increased ${ocrRegionIncreasePercent.toFixed(2)}%.`);
  }
  if (memoryIncreasePercent !== undefined && memoryIncreasePercent > thresholds.maxMemoryIncreasePercent) {
    if (status === 'pass') status = 'warning';
    messages.push(`Peak memory increased ${memoryIncreasePercent.toFixed(2)}%.`);
  }
  return { status, latencyIncreasePercent, ocrRegionIncreasePercent, memoryIncreasePercent, messages };
};

export class DocumentRegressionRunner {
  private readonly dispatcher: DocumentPipelineDispatcher;
  private readonly thresholds: RegressionThresholds;

  constructor(dispatcher = new DocumentPipelineDispatcher(), thresholds = defaultRegressionThresholds) {
    this.dispatcher = dispatcher;
    this.thresholds = thresholds;
  }

  async run(cases: DocumentRegressionCase[]): Promise<DocumentRegressionReport> {
    const results: DocumentRegressionResult[] = [];
    for (const entry of cases) {
      const pipeline = await this.dispatcher.dispatch(entry.file);
      const actualOml = questionDocumentToOml(pipeline.document);
      results.push({
        id: entry.id,
        pipeline,
        questionObject: compareSemantically(entry.expectedDocument, pipeline.document),
        oml: compareOmlSemantically(entry.expectedOml, actualOml),
        accuracy: measureDocumentAccuracy(entry.expectedDocument, pipeline.document),
        performance: evaluatePerformanceRegression(pipeline, entry.baseline, this.thresholds),
      });
    }
    const benchmark = await new PipelineBenchmarkRunner(this.dispatcher).run(cases.map((entry) => entry.file));
    const failed = results.filter((result) => !result.questionObject.equal || !result.oml.equal || result.performance.status === 'fail').length;
    return { total: results.length, passed: results.length - failed, failed, warnings: results.filter((result) => result.performance.status === 'warning').length, results, benchmark };
  }

  createSnapshots(report: DocumentRegressionReport): DocumentRegressionSnapshot[] {
    return report.results.map((result) => ({
      id: result.id,
      questionObject: result.pipeline.document,
      oml: questionDocumentToOml(result.pipeline.document),
      metrics: result.pipeline.metrics,
      trace: result.pipeline.trace,
    }));
  }

  toMarkdown(report: DocumentRegressionReport): string {
    const benchmarkSummary = summarizeDocumentBenchmark(report.results.map((result) => result.pipeline));
    const accuracy = report.results.map((result) => result.accuracy.question.recall);
    const averageQuestionRecall = accuracy.length === 0 ? 0 : accuracy.reduce((total, value) => total + value, 0) / accuracy.length;
    return [
      '# Document Pipeline Regression Report',
      '',
      `Total files: ${report.total}`,
      `Pass: ${report.passed}`,
      `Fail: ${report.failed}`,
      `Warnings: ${report.warnings}`,
      `Question recall: ${(averageQuestionRecall * 100).toFixed(2)}%`,
      `Average latency: ${report.benchmark.averageLatencyMs.toFixed(2)}ms`,
      `Median latency: ${report.benchmark.medianLatencyMs.toFixed(2)}ms`,
      `P95 latency: ${report.benchmark.p95LatencyMs.toFixed(2)}ms`,
      `P99 latency: ${report.benchmark.p99LatencyMs.toFixed(2)}ms`,
      `OCR saving: ${report.benchmark.averageOcrSavingPercent.toFixed(2)}%`,
      '',
      '## Performance summary',
      '| Metric | Average | Median | Min | Max | P95 | P99 |',
      '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
      ...Object.entries(benchmarkSummary).map(([name, value]) => `| ${name} | ${value.average.toFixed(2)} | ${value.median.toFixed(2)} | ${value.min.toFixed(2)} | ${value.max.toFixed(2)} | ${value.p95.toFixed(2)} | ${value.p99.toFixed(2)} |`),
      '',
      '## Per-file result',
      '| File | Question | OML | Performance | OCR regions | Peak memory |',
      '| --- | --- | --- | --- | ---: | ---: |',
      ...report.results.map((result) => `| ${result.id} | ${result.questionObject.equal ? 'pass' : 'fail'} | ${result.oml.equal ? 'pass' : 'fail'} | ${result.performance.status} | ${result.pipeline.metrics.ocrRegions} | ${result.pipeline.metrics.peakMemoryBytes ?? 'unavailable'} |`),
      '',
      '## Failures and diffs',
      ...report.results.flatMap((result) => {
        const differences = [...result.questionObject.differences, ...result.oml.differences];
        return differences.length === 0 ? [] : [`### ${result.id}`, ...differences.map((difference) => `- ${difference.path}: ${difference.message}`)];
      }),
      '',
      '## Pipeline trace',
      ...report.results.flatMap((result) => [`### ${result.id}`, ...result.pipeline.trace.map((trace) => `- ${trace}`)]),
    ].join('\n');
  }
}
