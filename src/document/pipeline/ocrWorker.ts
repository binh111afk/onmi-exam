import type { DocumentContentNode, QuestionDocument } from '../../types/question-object';
import type { RawDocumentNode } from '../../types/raw-document';
import { OcrDiagnosticError, runLegacyOcrToQuestionDocument } from '../../services/ocrService';
import type { LegacyOcrMemoryTelemetry } from '../../services/ocrService';
import type { OcrRegion } from './regionPlanner';
import type { OcrCropProfilerData, OcrRequestProfilerRecord } from '../../types/ocr-profiler';
import type { OcrDiagnosticReport } from '../../types/ocr-diagnostics';
import type { BenchmarkRunOptions } from '../ocr/ocrProvider';
import type { PipelineMode } from './pipelineMode';
import { shouldAbortOnOcrFailure } from './pipelineMode';

export interface OcrTask {
  file?: File;
  region: OcrRegion;
  reason: 'ocr-required' | 'low-parser-confidence' | 'unsupported-structure';
  profiler?: OcrCropProfilerData;
}

export interface OcrWorkerResult {
  status: 'completed' | 'deferred' | 'failed';
  nodes: RawDocumentNode[];
  task: OcrTask;
  processingTimeMs: number;
  networkRequestTimeMs?: number;
  reason?: string;
  diagnostics?: OcrDiagnosticReport[];
}

const toRawNodes = (content: DocumentContentNode[], region: OcrRegion): RawDocumentNode[] => content.flatMap((node) => {
  const sourcePage = node.source?.page ?? region.page;
  const confidence = node.source?.confidence ?? 0.8;
  switch (node.kind) {
    case 'heading': return [{ kind: 'text', text: node.text, style: 'heading', headingLevel: node.level, page: sourcePage, confidence }];
    case 'text': return [{ kind: 'text', text: node.text, page: sourcePage, confidence }];
    case 'list': return node.items.map((item) => ({ kind: 'text' as const, text: `- ${item}`, page: sourcePage, confidence }));
    case 'image': return [{ kind: 'image', src: node.src, alt: node.alt, page: sourcePage, confidence }];
    case 'table': return [{ kind: 'table', rows: node.rows, page: sourcePage, confidence }];
    case 'formula': return [{ kind: 'text', text: node.latex, page: sourcePage, confidence }];
    case 'question': {
      const options = 'options' in node ? node.options : [];
      return [
        { kind: 'text' as const, text: `Câu ${node.id ?? ''}. ${node.question}`, page: sourcePage, confidence },
        ...options.map((option) => ({ kind: 'text' as const, text: `${option.id}. ${option.content}`, page: sourcePage, confidence })),
        ...(node.explanation ? [{ kind: 'text' as const, text: `Lời giải: ${node.explanation}`, page: sourcePage, confidence }] : []),
      ];
    }
    case 'question-group': return [...toRawNodes(node.context, region), ...toRawNodes(node.questions, region)];
    case 'section': return toRawNodes(node.children, region);
    case 'callout': return [{ kind: 'text', text: node.content, page: sourcePage, confidence }];
    case 'quote': return [{ kind: 'text', text: node.text, page: sourcePage, confidence }];
    case 'divider': return [];
    case 'legacy-oml': return [];
  }
});

export class OcrWorker {
  constructor(
    private readonly benchmarkRunOptions?: BenchmarkRunOptions,
    private readonly pipelineMode: PipelineMode = 'strict',
  ) {}

  async process(task: OcrTask, onProgress?: (statusText: string) => void, memoryTelemetry?: LegacyOcrMemoryTelemetry, onRequestProfile?: (record: OcrRequestProfilerRecord) => void, onDiagnostics?: (report: OcrDiagnosticReport) => void): Promise<OcrWorkerResult> {
    const startedAt = performance.now();
    if (!task.file || task.region.action === 'math-ocr') {
      return { status: 'deferred', nodes: [], task, processingTimeMs: performance.now() - startedAt };
    }

    const networkStartedAt = performance.now();
    const profileStartedAtMs = task.profiler?.startedAtMs ?? performance.now();
    try {
      const document: QuestionDocument = await runLegacyOcrToQuestionDocument(task.file, onProgress, memoryTelemetry, (measurement) => {
      onRequestProfile?.({
        id: `ocr-${task.region.id}`,
        page: task.region.page,
        regionId: task.region.id,
        cropWidth: task.profiler?.cropWidth ?? null,
        cropHeight: task.profiler?.cropHeight ?? null,
        imageFormat: task.profiler?.imageFormat ?? task.file?.type ?? null,
        imageQuality: task.profiler?.imageQuality ?? null,
        imageBytes: task.profiler?.imageBytes ?? task.file?.size ?? null,
        renderTimeMs: task.profiler?.renderTimeMs ?? null,
        encodeTimeMs: task.profiler?.encodeTimeMs ?? null,
        totalRequestTimeMs: performance.now() - profileStartedAtMs,
        retryCount: 0,
        ...measurement,
      });
      }, (report) => {
        report.pages = [task.region.page];
        report.regions = [task.region.id];
        report.requests.forEach((request) => {
          request.page = task.region.page;
          request.regionId = task.region.id;
          request.imageWidth = task.profiler?.cropWidth ?? null;
          request.imageHeight = task.profiler?.cropHeight ?? null;
          request.imageBytes = task.profiler?.imageBytes ?? task.file?.size ?? null;
        });
        onDiagnostics?.(report);
      }, this.benchmarkRunOptions, this.pipelineMode);
      const networkRequestTimeMs = performance.now() - networkStartedAt;
      const processingTimeMs = performance.now() - startedAt;
      return { status: 'completed', nodes: toRawNodes(document.content, task.region), task, processingTimeMs, networkRequestTimeMs };
    } catch (error) {
      if (shouldAbortOnOcrFailure(this.pipelineMode, 1)) throw error;
      return {
        status: 'failed',
        nodes: [],
        task,
        processingTimeMs: performance.now() - startedAt,
        networkRequestTimeMs: performance.now() - networkStartedAt,
        reason: error instanceof Error ? error.message : String(error),
        diagnostics: error instanceof OcrDiagnosticError ? error.ocrDiagnostics : [],
      };
    }
  }
}
