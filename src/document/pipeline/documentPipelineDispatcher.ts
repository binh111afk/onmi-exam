import type { QuestionDocument } from '../../types/question-object';
import { DocumentImporterRegistry } from '../importers/documentImporterRegistry';
import { LayoutAnalyzer } from '../layout/layoutAnalyzer';
import { LayoutQuestionParser } from '../parsers/layoutQuestionParser';
import { CropEngine } from './cropEngine';
import { MergeEngine } from './mergeEngine';
import { OcrWorker } from './ocrWorker';
import { RegionPlanner } from './regionPlanner';
import { PipelineTelemetry } from './pipelineTelemetry';
import type { PipelineMemoryTelemetry, PipelineStepTiming } from './pipelineTelemetry';
import type { OcrTask } from './ocrWorker';
import type { OcrRegion, RegionPlanMetrics } from './regionPlanner';
import type { OcrRequestProfilerRecord } from '../../types/ocr-profiler';
import type { OcrDiagnosticReport } from '../../types/ocr-diagnostics';

const FULL_PAGE_BOUNDING_BOX = {
  x: 0,
  y: 0,
  width: Number.MAX_SAFE_INTEGER,
  height: Number.MAX_SAFE_INTEGER,
};

export interface DocumentPipelineMetrics {
  totalRegions: number;
  ocrRegions: number;
  skippedRegions: number;
  ocrTimeMs: number;
  skippedTimeMs: number;
  estimatedSavingPercent: number;
  regionStatistics: {
    mathRegions: number;
    imageRegions: number;
    unknownRegions: number;
    averageOcrRegionArea: number;
    largestOcrRegionArea: number;
    smallestOcrRegionArea: number;
  };
  temporaryCanvasBytes: number;
  peakMemoryBytes?: number;
  memory: PipelineMemoryTelemetry;
  networkRequestTimeMs: number;
  retries: number;
  ocrProfiler: OcrRequestProfilerRecord[];
  ocrDiagnostics: OcrDiagnosticReport[];
  steps: PipelineStepTiming[];
}

export interface DocumentPipelineDispatcherOptions {
  regionConcurrency?: number;
  maxHeapBytes?: number;
}

export interface DocumentPipelineResult {
  document: QuestionDocument;
  route: 'direct-import' | 'targeted-ocr';
  trace: string[];
  metrics: DocumentPipelineMetrics;
}

export class DocumentPipelineDispatcher {
  private readonly importers = new DocumentImporterRegistry();
  private readonly layoutAnalyzer = new LayoutAnalyzer();
  private readonly parser = new LayoutQuestionParser();
  private readonly regionPlanner = new RegionPlanner();
  private readonly cropEngine = new CropEngine();
  private readonly worker = new OcrWorker();
  private readonly mergeEngine = new MergeEngine();
  private readonly regionConcurrency: number;
  private readonly maxHeapBytes?: number;

  constructor(options: DocumentPipelineDispatcherOptions = {}) {
    this.regionConcurrency = Math.max(1, options.regionConcurrency ?? 4);
    this.maxHeapBytes = options.maxHeapBytes;
  }

  async dispatch(file: File, onProgress?: (statusText: string) => void): Promise<DocumentPipelineResult> {
    const telemetry = new PipelineTelemetry();
    onProgress?.('Đang nhập tài liệu...');
    const rawDocument = await telemetry.measure('importer', () => this.importers.import(file));
    const initialLayout = await telemetry.measure('layout', () => this.layoutAnalyzer.analyze(rawDocument));
    const regionPlan = await telemetry.measure('region-planner', () => this.regionPlanner.plan(initialLayout));
    const fallbackRegions = rawDocument.ocrRequirement === 'required' && regionPlan.regions.length === 0
      ? rawDocument.ocrCandidates.map((candidate, index): OcrRegion => ({
        id: `full-page-ocr-${index + 1}`,
        layoutNodeId: `ocr-candidate-${index + 1}`,
        page: candidate.page ?? 1,
        boundingBox: FULL_PAGE_BOUNDING_BOX,
        readingOrder: index,
        action: 'text-ocr',
        confidence: 0.25,
      }))
      : [];
    const ocrRegions = fallbackRegions.length > 0 ? fallbackRegions : regionPlan.regions;
    const regionMetrics: RegionPlanMetrics = fallbackRegions.length > 0
      ? { totalRegions: fallbackRegions.length, ocrRegions: fallbackRegions.length, skippedRegions: 0, estimatedSavingPercent: 0 }
      : regionPlan.metrics;
    const regionAreas = regionPlan.regions.map((region) => region.boundingBox.width * region.boundingBox.height);
    const regionStatistics = {
      mathRegions: regionPlan.regions.filter((region) => region.action === 'math-ocr').length,
      imageRegions: regionPlan.regions.filter((region) => initialLayout.nodes.find((node) => node.id === region.layoutNodeId)?.type === 'image').length,
      unknownRegions: regionPlan.deferredNodeIds.length,
      averageOcrRegionArea: regionAreas.length === 0 ? 0 : regionAreas.reduce((total, area) => total + area, 0) / regionAreas.length,
      largestOcrRegionArea: regionAreas.length === 0 ? 0 : Math.max(...regionAreas),
      smallestOcrRegionArea: regionAreas.length === 0 ? 0 : Math.min(...regionAreas),
    };
    const trace = [
      `importer:${rawDocument.source.kind}`,
      `ocr-requirement:${rawDocument.ocrRequirement}`,
      `regions:total-${regionMetrics.totalRegions}:ocr-${regionMetrics.ocrRegions}:skip-${regionMetrics.skippedRegions}`,
    ];

    regionPlan.deferredNodeIds.forEach((nodeId) => trace.push(`review:geometry-or-confidence:${nodeId}`));
    if (fallbackRegions.length > 0) trace.push(`ocr:fallback-full-page:${fallbackRegions.length}`);
    if (ocrRegions.length === 0) {
      const document = await telemetry.measure('parser', () => this.parser.parse(rawDocument, initialLayout));
      trace.push('route:direct-import');
      return {
        document,
        route: 'direct-import',
        trace,
        metrics: { ...regionMetrics, regionStatistics, temporaryCanvasBytes: 0, peakMemoryBytes: telemetry.getPeakMemoryBytes(), memory: telemetry.getMemoryTelemetry(), networkRequestTimeMs: 0, retries: 0, ocrProfiler: [], ocrDiagnostics: [], ocrTimeMs: 0, skippedTimeMs: 0, steps: telemetry.getSteps() },
      };
    }

    let temporaryCanvasBytes = 0;
    const results = [];
    const ocrProfiler: OcrRequestProfilerRecord[] = [];
    const ocrDiagnostics: OcrDiagnosticReport[] = [];
    for (let start = 0; start < ocrRegions.length; start += this.regionConcurrency) {
      await this.waitForMemoryBudget();
      const regions = ocrRegions.slice(start, start + this.regionConcurrency);
      const cropStartedAt = performance.now();
      let batchCanvasBytes = 0;
      const tasks = await Promise.all(regions.map(async (region): Promise<OcrTask> => {
        if (rawDocument.source.kind === 'pdf') {
          const crop = await this.cropEngine.cropPdfRegion(file, region);
          temporaryCanvasBytes += crop.temporaryCanvasBytes;
          batchCanvasBytes += crop.temporaryCanvasBytes;
          return { file: crop.file, region, reason: 'ocr-required', profiler: crop.profiler };
        }
        return { file: rawDocument.source.kind === 'image' ? file : undefined, region, reason: 'ocr-required' };
      }));
      telemetry.record('crop', cropStartedAt, performance.now());
      telemetry.recordCanvasPeak(batchCanvasBytes);
      onProgress?.(`Đang xử lý vùng OCR ${start + 1}-${start + tasks.length}/${ocrRegions.length}...`);
      const ocrStartedAt = performance.now();
      let batchResults;
      try {
        batchResults = await Promise.all(tasks.map((task) => this.worker.process(task, onProgress, {
          recordBase64Peak: (bytes) => telemetry.recordBase64Peak(bytes),
        }, (record) => ocrProfiler.push(record), (report) => ocrDiagnostics.push(report))));
      } catch (error) {
        const diagnosticError = error instanceof Error ? error : new Error(String(error));
        Object.assign(diagnosticError, { ocrDiagnostics: [...ocrDiagnostics] });
        throw diagnosticError;
      }
      telemetry.record('ocr-worker', ocrStartedAt, performance.now());
      results.push(...batchResults);
    }
    const ocrTimeMs = results.reduce((total, result) => total + result.processingTimeMs, 0);
    const mergedRawDocument = await telemetry.measure('merge', () => this.mergeEngine.merge(rawDocument, results));
    const layout = await telemetry.measure('layout', () => this.layoutAnalyzer.analyze(mergedRawDocument));
    const document = await telemetry.measure('parser', () => this.parser.parse(mergedRawDocument, layout));
    trace.push(...results.map((result) => `ocr-worker:${result.status}:${result.task.region.id}:${Math.round(result.processingTimeMs)}ms`), 'route:targeted-ocr');

    return {
      document,
      route: 'targeted-ocr',
      trace,
      metrics: { ...regionMetrics, regionStatistics, temporaryCanvasBytes, peakMemoryBytes: telemetry.getPeakMemoryBytes(), memory: telemetry.getMemoryTelemetry(), networkRequestTimeMs: results.reduce((total, result) => total + (result.networkRequestTimeMs ?? 0), 0), retries: 0, ocrProfiler, ocrDiagnostics, ocrTimeMs, skippedTimeMs: 0, steps: telemetry.getSteps() },
    };
  }

  private async waitForMemoryBudget(): Promise<void> {
    const performanceMemory = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit?: number } }).memory;
    const limit = this.maxHeapBytes ?? (performanceMemory?.jsHeapSizeLimit ? performanceMemory.jsHeapSizeLimit * 0.7 : undefined);
    if (!performanceMemory || limit === undefined || performanceMemory.usedJSHeapSize <= limit) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 50));
  }
}
