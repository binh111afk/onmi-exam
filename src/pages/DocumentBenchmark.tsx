import { Fragment, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, CirclePause, CirclePlay, Copy, Download, FileSearch, FolderOpen, RotateCcw, ShieldAlert, Square } from 'lucide-react';
import { DocumentPipelineDispatcher } from '../document/pipeline/documentPipelineDispatcher';
import type { BenchmarkDocumentCounts, BenchmarkErrorDetails, BenchmarkFileCategory, BenchmarkFileResult, BenchmarkFileSource, BenchmarkPipelineSummary, BenchmarkRunState } from '../types/document-benchmark';
import type { DocumentPipelineResult } from '../document/pipeline/documentPipelineDispatcher';
import type { DocumentContentNode, QuestionDocument } from '../types/question-object';
import { rankOcrProfilerBottlenecks, summarizeOcrProfiler } from '../document/pipeline/ocrProfiler';

interface BenchmarkDirectoryHandle {
  kind: 'directory';
  name: string;
  values(): AsyncIterableIterator<BenchmarkDirectoryHandle | BenchmarkFileHandle>;
}

interface BenchmarkFileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
}

interface DirectoryPickerWindow extends Window {
  showDirectoryPicker?: () => Promise<BenchmarkDirectoryHandle>;
}

const supportedExtensions = new Set(['pdf', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'json', 'oml']);
const categoryFolders = new Set<BenchmarkFileCategory>(['docx', 'pdf-text', 'pdf-scan', 'pdf-hybrid', 'image', 'json', 'oml']);

const getExtension = (name: string): string => name.split('.').pop()?.toLowerCase() ?? '';
const formatBytes = (bytes: number): string => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
const formatOptionalBytes = (bytes?: number): string => bytes === undefined ? '—' : formatBytes(bytes);
const formatMilliseconds = (value?: number): string => value === undefined ? '—' : `${value.toFixed(0)} ms`;
const fileCategoryFromPath = (path: string, extension: string): BenchmarkFileCategory => {
  const pathCategory = path.split('/').find((segment) => categoryFolders.has(segment as BenchmarkFileCategory));
  if (pathCategory !== undefined) return pathCategory as BenchmarkFileCategory;
  if (extension === 'docx') return 'docx';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) return 'image';
  if (extension === 'json') return 'json';
  if (extension === 'oml') return 'oml';
  return extension === 'pdf' ? 'pdf-text' : 'unknown';
};

const fileSubjectFromPath = (path: string): string => {
  const parts = path.split('/');
  const categoryIndex = parts.findIndex((segment) => categoryFolders.has(segment as BenchmarkFileCategory));
  return categoryIndex >= 0 && parts[categoryIndex + 1] ? parts[categoryIndex + 1] : 'unknown';
};

const flattenNodes = (nodes: DocumentContentNode[]): DocumentContentNode[] => nodes.flatMap((node) => {
  if (node.kind === 'question-group') return [node, ...flattenNodes([...node.context, ...node.questions])];
  if (node.kind === 'section') return [node, ...flattenNodes(node.children)];
  return [node];
});

const documentCounts = (document: QuestionDocument | undefined): BenchmarkDocumentCounts => {
  const nodes = document ? flattenNodes(document.content) : [];
  const questions = nodes.filter((node) => node.kind === 'question');
  return {
    question: questions.length,
    option: questions.reduce((total, question) => total + ('options' in question ? question.options.length : 0), 0),
    image: nodes.filter((node) => node.kind === 'image').length,
    table: nodes.filter((node) => node.kind === 'table').length,
    formula: nodes.filter((node) => node.kind === 'formula').length,
    review: document?.reviewMarkers?.length ?? 0,
  };
};

const toPipelineSummary = (pipeline: DocumentPipelineResult): BenchmarkPipelineSummary => ({
  route: pipeline.route,
  trace: pipeline.trace,
  metrics: pipeline.metrics,
  documentCounts: documentCounts(pipeline.document),
});

const releaseBenchmarkObjectUrls = (document: QuestionDocument): void => {
  flattenNodes(document.content)
    .filter((node): node is Extract<DocumentContentNode, { kind: 'image' }> => node.kind === 'image')
    .map((node) => node.src)
    .filter((src) => src.startsWith('blob:'))
    .forEach((src) => URL.revokeObjectURL(src));
};

const resultCounts = (result: BenchmarkFileResult): BenchmarkDocumentCounts => result.pipeline?.documentCounts ?? {
  question: 0,
  option: 0,
  image: 0,
  table: 0,
  formula: 0,
  review: 0,
};

const stepDuration = (result: BenchmarkFileResult, name: string): number | undefined => result.pipeline?.metrics.steps
  .filter((step) => step.name === name)
  .reduce((total, step) => total + step.durationMs, 0);

const pipelineDuration = (result: BenchmarkFileResult): number | undefined => result.pipeline?.metrics.steps.reduce((total, step) => total + step.durationMs, 0);
const percentile = (values: number[], value: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * value) - 1)];
};

const download = (filename: string, type: string, content: string): void => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const errorCauseToText = (cause: unknown): string | undefined => {
  if (cause === undefined) return undefined;
  if (cause instanceof Error) return `${cause.name}: ${cause.message}${cause.stack ? `\n${cause.stack}` : ''}`;
  if (typeof cause === 'string') return cause;
  try {
    return JSON.stringify(cause);
  } catch {
    return String(cause);
  }
};

const captureErrorDetails = (error: unknown): BenchmarkErrorDetails => {
  if (error instanceof Error) {
    const withCause = error as Error & { cause?: unknown; ocrDiagnostics?: import('../types/ocr-diagnostics').OcrDiagnosticReport[] };
    return { name: error.name, message: error.message, stack: error.stack, cause: errorCauseToText(withCause.cause), ocrDiagnostics: withCause.ocrDiagnostics };
  }
  return { name: typeof error, message: String(error) };
};

const errorDetailsText = (error: BenchmarkErrorDetails): string => [
  `name: ${error.name}`,
  `message: ${error.message}`,
  error.cause ? `cause: ${error.cause}` : '',
  error.stack ? `stack:\n${error.stack}` : '',
].filter(Boolean).join('\n');

const copyErrorDetails = async (error: BenchmarkErrorDetails): Promise<void> => {
  await navigator.clipboard.writeText(errorDetailsText(error));
};

const FailureDiagnostics = ({ results }: { results: BenchmarkFileResult[] }) => {
  const failures = results.filter((result) => result.errorDetails !== undefined);
  if (failures.length === 0) return null;
  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm">
      <div className="flex items-center gap-2"><ShieldAlert size={18} className="text-red-700" /><h2 className="text-lg font-black text-slate-900">Exception diagnostics</h2></div>
      <p className="mt-1 text-sm text-slate-600">Thông tin này được lưu từ exception thực tế của dispatcher; benchmark vẫn tiếp tục với file sau.</p>
      <div className="mt-4 space-y-4">
        {failures.map((result) => {
          const error = result.errorDetails as BenchmarkErrorDetails;
          return <article key={`${result.id}-error`} className="rounded-xl border border-red-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-black text-slate-900">{result.relativePath}</p><p className="mt-1 text-sm font-semibold text-red-700">{error.name}: {error.message}</p></div><button onClick={() => void copyErrorDetails(error)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"><Copy size={15} /> Copy exception</button></div>
            <pre className="mt-3 max-h-80 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-100">{errorDetailsText(error)}</pre>
          </article>;
        })}
      </div>
    </section>
  );
};

export const DocumentBenchmark = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<BenchmarkFileResult[]>([]);
  const [runState, setRunState] = useState<BenchmarkRunState>({ status: 'idle' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const pauseRequested = useRef(false);
  const stopRequested = useRef(false);
  const resumeResolver = useRef<(() => void) | null>(null);

  const scanDirectory = async (directory: BenchmarkDirectoryHandle, parentPath = ''): Promise<BenchmarkFileSource[]> => {
    const entries: BenchmarkFileSource[] = [];
    for await (const handle of directory.values()) {
      const relativePath = parentPath ? `${parentPath}/${handle.name}` : handle.name;
      if (handle.kind === 'directory') {
        entries.push(...await scanDirectory(handle, relativePath));
        continue;
      }
      const extension = getExtension(handle.name);
      if (!supportedExtensions.has(extension)) continue;
      const file = await handle.getFile();
      entries.push({
        id: relativePath,
        name: handle.name,
        relativePath,
        category: fileCategoryFromPath(relativePath, extension),
        subject: fileSubjectFromPath(relativePath),
        size: file.size,
        getFile: handle.getFile.bind(handle),
      });
    }
    return entries;
  };

  const pickDirectory = async () => {
    const picker = (window as DirectoryPickerWindow).showDirectoryPicker;
    if (!picker) {
      setScanError('Trình duyệt hiện tại không hỗ trợ chọn thư mục. Hãy dùng trình duyệt Chromium hỗ trợ File System Access API.');
      setRunState({ status: 'idle' });
      return;
    }
    try {
      setScanError(null);
      setRunState({ status: 'scanning' });
      const directory = await picker();
      const files = await scanDirectory(directory);
      setResults(files.sort((first, second) => first.relativePath.localeCompare(second.relativePath)).map((file) => ({ ...file, status: 'pending' })));
      setSelectedIds(new Set());
      setRunState({ status: 'idle' });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') setRunState({ status: 'idle' });
      else {
        setScanError(error instanceof Error ? error.message : String(error));
        setRunState({ status: 'stopped' });
      }
    }
  };

  const waitUntilResumed = async (): Promise<void> => {
    if (!pauseRequested.current) return;
    setRunState((current) => ({ ...current, status: 'paused' }));
    await new Promise<void>((resolve) => { resumeResolver.current = resolve; });
    resumeResolver.current = null;
  };

  const run = async (sourceFiles: BenchmarkFileSource[]) => {
    if (sourceFiles.length === 0) return;
    pauseRequested.current = false;
    stopRequested.current = false;
    setRunState({ status: 'running', startedAt: new Date().toISOString() });
    const dispatcher = new DocumentPipelineDispatcher();
    for (const source of sourceFiles) {
      if (stopRequested.current) break;
      await waitUntilResumed();
      if (stopRequested.current) break;
      setRunState((current) => ({ ...current, status: 'running', currentFileId: source.id }));
      setResults((current) => current.map((result) => result.id === source.id ? { ...result, status: 'running', startedAt: new Date().toISOString(), currentStep: 'Đang khởi tạo...' } : result));
      try {
        const file = await source.getFile();
        const pipeline = await dispatcher.dispatch(file, (currentStep) => {
          setResults((current) => current.map((result) => result.id === source.id ? { ...result, currentStep } : result));
        });
        const summary = toPipelineSummary(pipeline);
        releaseBenchmarkObjectUrls(pipeline.document);
        setResults((current) => current.map((result) => result.id === source.id ? { ...result, status: 'passed', pipeline: summary, finishedAt: new Date().toISOString(), currentStep: 'Hoàn tất' } : result));
      } catch (error) {
        const details = captureErrorDetails(error);
        console.error('Document benchmark pipeline failure:', details);
        setResults((current) => current.map((result) => result.id === source.id ? { ...result, status: 'failed', error: details.message, errorDetails: details, finishedAt: new Date().toISOString(), currentStep: 'Lỗi' } : result));
      }
    }
    setRunState((current) => ({ ...current, status: stopRequested.current ? 'stopped' : 'completed', currentFileId: undefined, completedAt: new Date().toISOString() }));
  };

  const rerunSelected = () => {
    const selected = results.filter((result) => selectedIds.has(result.id));
    setResults((current) => current.map((result) => selectedIds.has(result.id) ? { ...result, status: 'pending', pipeline: undefined, error: undefined, errorDetails: undefined, currentStep: undefined } : result));
    void run(selected);
  };

  const pause = () => { pauseRequested.current = true; };
  const resume = () => { pauseRequested.current = false; resumeResolver.current?.(); };
  const stop = () => { stopRequested.current = true; pauseRequested.current = false; resumeResolver.current?.(); };
  const toggleSelected = (id: string) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const completed = results.filter((result) => result.status === 'passed' || result.status === 'failed' || result.status === 'skipped');
  const pipelineResults = results.filter((result) => result.pipeline !== undefined);
  const ocrProfilerRecords = pipelineResults.flatMap((result) => result.pipeline?.metrics.ocrProfiler ?? []);
  const ocrProfilerSummary = useMemo(() => summarizeOcrProfiler(ocrProfilerRecords), [ocrProfilerRecords]);
  const ocrBottlenecks = useMemo(() => rankOcrProfilerBottlenecks(ocrProfilerRecords), [ocrProfilerRecords]);
  const ocrDiagnostics = pipelineResults.flatMap((result) => result.pipeline?.metrics.ocrDiagnostics ?? []).concat(results.flatMap((result) => result.errorDetails?.ocrDiagnostics ?? []));
  const rejectedBlocks = ocrDiagnostics.flatMap((report) => report.rejectedBlocks);
  const rejectionRanking = Object.entries(rejectedBlocks.reduce<Record<string, number>>((counts, block) => ({ ...counts, [block.reason]: (counts[block.reason] ?? 0) + 1 }), {})).sort((first, second) => second[1] - first[1]);
  const maxOcrRequestTime = Math.max(1, ...ocrProfilerRecords.map((record) => record.totalRequestTimeMs ?? 0));
  const pipelineTimes = pipelineResults.map(pipelineDuration).filter((value): value is number => value !== undefined);
  const average = (values: number[]): number => values.length === 0 ? 0 : values.reduce((total, value) => total + value, 0) / values.length;
  const summary = useMemo(() => ({
    averagePipeline: average(pipelineTimes),
    median: percentile(pipelineTimes, 0.5),
    p95: percentile(pipelineTimes, 0.95),
    p99: percentile(pipelineTimes, 0.99),
    averageOcr: average(pipelineResults.map((result) => result.pipeline?.metrics.ocrTimeMs ?? 0)),
    averageParser: average(pipelineResults.map((result) => stepDuration(result, 'parser') ?? 0)),
    averageLayout: average(pipelineResults.map((result) => stepDuration(result, 'layout') ?? 0)),
    averageImporter: average(pipelineResults.map((result) => stepDuration(result, 'importer') ?? 0)),
    averageSaving: average(pipelineResults.map((result) => result.pipeline?.metrics.estimatedSavingPercent ?? 0)),
    questions: pipelineResults.reduce((total, result) => total + resultCounts(result).question, 0),
    review: pipelineResults.reduce((total, result) => total + resultCounts(result).review, 0),
  }), [pipelineResults, pipelineTimes]);

  const exportJson = () => download('document-benchmark.json', 'application/json', JSON.stringify({ runState, results }, null, 2));
  const exportCsv = () => {
    const csvRow = (values: unknown[]) => values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
    const rows = ['row_type,file,request_id,page,region_id,rejection_id,rejection_type,rejection_reason,rejection_preview'];
    results.forEach((result) => {
      (result.pipeline?.metrics.ocrProfiler ?? []).forEach((record) => rows.push(csvRow(['request', result.relativePath, record.id, record.page, record.regionId, '', '', '', ''])));
      const reports = [...(result.pipeline?.metrics.ocrDiagnostics ?? []), ...(result.errorDetails?.ocrDiagnostics ?? [])];
      reports.forEach((report) => report.rejectedBlocks.forEach((block) => rows.push(csvRow(['rejection', result.relativePath, '', block.page ?? '', '', block.id ?? '', block.type ?? '', block.reason, block.preview]))));
    });
    download('document-ocr-diagnostics.csv', 'text/csv;charset=utf-8', rows.join('\n'));
  };
  const exportMarkdown = () => download('document-benchmark.md', 'text/markdown;charset=utf-8', ['# Document Benchmark', '', `Files: ${results.length}`, `Passed: ${results.filter((result) => result.status === 'passed').length}`, `Failed: ${results.filter((result) => result.status === 'failed').length}`, `Average pipeline: ${formatMilliseconds(summary.averagePipeline)}`, '', '## OCR Profiler Summary', '', `Total requests: ${ocrProfilerSummary.totalRequests}`, '| Phase | Average | Median | P95 | P99 |', '| --- | ---: | ---: | ---: | ---: |', ...[['Request', ocrProfilerSummary.request], ['Crop', ocrProfilerSummary.crop], ['JPEG encode', ocrProfilerSummary.jpegEncode], ['Base64 encode', ocrProfilerSummary.base64Encode], ['Upload', ocrProfilerSummary.upload], ['Provider inference', ocrProfilerSummary.provider], ['Download', ocrProfilerSummary.download], ['Response parse', ocrProfilerSummary.responseParse]].map(([name, metric]) => `| ${name} | ${formatMilliseconds(metric.average ?? undefined)} | ${formatMilliseconds(metric.median ?? undefined)} | ${formatMilliseconds(metric.p95 ?? undefined)} | ${formatMilliseconds(metric.p99 ?? undefined)} |`), '', `Largest image: ${formatOptionalBytes(ocrProfilerSummary.largestImageBytes || undefined)}`, `Largest Base64: ${formatOptionalBytes(ocrProfilerSummary.largestBase64Bytes || undefined)}`, `Largest resolution: ${ocrProfilerSummary.largestResolution ? `${ocrProfilerSummary.largestResolution.width}x${ocrProfilerSummary.largestResolution.height}` : '—'}`, '', '## OCR Bottleneck Ranking', ...ocrBottlenecks.map((item, index) => `${index + 1}. ${item.name}: ${item.percent?.toFixed(1)}%`), '', '## OCR Diagnostics', `Reports: ${ocrDiagnostics.length}`, `Rejected blocks: ${rejectedBlocks.length}`, '| Reason | Count |', '| --- | ---: |', ...rejectionRanking.map(([reason, count]) => `| ${reason} | ${count} |`), '', '## Failure diagnostics', ...results.filter((result) => result.errorDetails !== undefined).flatMap((result) => [`### ${result.relativePath}`, '```text', errorDetailsText(result.errorDetails as BenchmarkErrorDetails), '```']), '', '## Full OCR Diagnostics JSON', '```json', JSON.stringify(ocrDiagnostics, null, 2), '```'].join('\n'));

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 lg:px-8">
      <section className="mx-auto max-w-[1600px] space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Internal tools</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">Document Benchmark Studio</h1>
              <p className="mt-2 text-sm text-slate-600">Chạy dispatcher thật trong browser trên thư mục corpus được chọn.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => void pickDirectory()} disabled={runState.status === 'running' || runState.status === 'paused'} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"><FolderOpen size={16} /> Chọn corpus</button>
              <button onClick={() => void run(results.filter((result) => result.status === 'pending'))} disabled={results.length === 0 || runState.status === 'running' || runState.status === 'paused'} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"><CirclePlay size={16} /> Chạy pending</button>
              <button onClick={rerunSelected} disabled={selectedIds.size === 0 || runState.status === 'running' || runState.status === 'paused'} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"><RotateCcw size={16} /> Chạy lại đã chọn ({selectedIds.size})</button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['Tổng tệp', results.length], ['Đã xử lý', `${completed.length}/${results.length}`], ['Thành công', results.filter((result) => result.status === 'passed').length], ['Lỗi', results.filter((result) => result.status === 'failed').length], ['Còn lại', results.filter((result) => result.status === 'pending').length],
          ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>)}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-sm font-bold text-slate-800">{runState.status === 'running' ? 'Đang chạy' : runState.status === 'paused' ? 'Đã tạm dừng' : 'Trạng thái sẵn sàng'}</p><p className="mt-1 text-sm text-slate-500">{results.find((result) => result.id === runState.currentFileId)?.relativePath ?? 'Chưa có file đang chạy'}</p></div>
            <div className="flex gap-2">
              <button onClick={pause} disabled={runState.status !== 'running'} className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 disabled:opacity-50"><CirclePause size={16} /> Tạm dừng</button>
              <button onClick={resume} disabled={runState.status !== 'paused'} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 disabled:opacity-50"><CirclePlay size={16} /> Tiếp tục</button>
              <button onClick={stop} disabled={runState.status !== 'running' && runState.status !== 'paused'} className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50"><Square size={16} /> Dừng sau file hiện tại</button>
            </div>
          </div>
          <progress className="mt-4 h-2 w-full overflow-hidden rounded-full" value={completed.length} max={Math.max(results.length, 1)}>{completed.length} / {results.length}</progress>
          {scanError && <p className="mt-3 text-sm font-semibold text-red-700">{scanError}</p>}
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {[
            ['Pipeline trung bình', formatMilliseconds(summary.averagePipeline)], ['Median / P95 / P99', `${formatMilliseconds(summary.median)} / ${formatMilliseconds(summary.p95)} / ${formatMilliseconds(summary.p99)}`], ['OCR / Parser', `${formatMilliseconds(summary.averageOcr)} / ${formatMilliseconds(summary.averageParser)}`], ['Layout / Importer', `${formatMilliseconds(summary.averageLayout)} / ${formatMilliseconds(summary.averageImporter)}`], ['OCR saving', `${summary.averageSaving.toFixed(1)}%`], ['Câu hỏi / Review', `${summary.questions} / ${summary.review}`],
          ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-lg font-black text-slate-900">{value}</p></div>)}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-lg font-black text-slate-900">Kết quả từng file</h2><p className="text-sm text-slate-500">Chọn file cần chạy lại hoặc mở trực tiếp trong OCR Editor.</p></div><div className="flex flex-wrap gap-2"><button onClick={exportMarkdown} disabled={results.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"><Download size={15} /> Markdown</button><button onClick={exportJson} disabled={results.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"><Download size={15} /> JSON</button><button onClick={exportCsv} disabled={results.length === 0} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"><Download size={15} /> CSV</button></div></div>
          <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3"><span className="sr-only">Chọn</span></th><th className="px-4 py-3">File</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">OCR vùng</th><th className="px-4 py-3">Câu hỏi</th><th className="px-4 py-3">Pipeline</th><th className="px-4 py-3">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{results.map((result) => { const counts = resultCounts(result); return <Fragment key={result.id}><tr className="bg-white"><td className="px-4 py-3"><input aria-label={`Chọn ${result.name}`} type="checkbox" checked={selectedIds.has(result.id)} onChange={() => toggleSelected(result.id)} /></td><td className="px-4 py-3"><p className="font-bold text-slate-800">{result.name}</p><p className="text-xs text-slate-500">{result.subject} · {formatBytes(result.size)}</p></td><td className="px-4 py-3 text-slate-600">{result.category}</td><td className="px-4 py-3"><span className={result.status === 'passed' ? 'text-emerald-700' : result.status === 'failed' ? 'text-red-700' : result.status === 'running' ? 'text-primary' : 'text-slate-500'}>{result.status}</span></td><td className="px-4 py-3 text-slate-600">{result.pipeline?.route ?? '—'}</td><td className="px-4 py-3 text-slate-600">{result.pipeline ? `${result.pipeline.metrics.ocrRegions}/${result.pipeline.metrics.skippedRegions}` : '—'}</td><td className="px-4 py-3 text-slate-600">{counts.question}</td><td className="px-4 py-3 text-slate-600">{formatMilliseconds(pipelineDuration(result))}</td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => setExpandedId(expandedId === result.id ? null : result.id)} className="inline-flex items-center gap-1 text-xs font-bold text-primary"><BarChart3 size={14} /> Trace</button><button onClick={async () => navigate('/teacher/exam-editor', { state: { benchmarkReviewFile: await result.getFile() } })} className="inline-flex items-center gap-1 text-xs font-bold text-slate-700"><FileSearch size={14} /> Review</button></div></td></tr>{expandedId === result.id && <tr className="bg-slate-50"><td colSpan={9} className="px-6 py-4"><div className="grid gap-4 lg:grid-cols-2"><div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Pipeline trace</p><div className="mt-3 space-y-2">{result.pipeline?.metrics.steps.map((step) => <div key={`${result.id}-${step.name}-${step.startTimeMs}`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="font-semibold text-slate-700">{step.name}</span><span className="font-mono text-xs text-slate-500">{formatMilliseconds(step.durationMs)}</span></div>) ?? <p className="text-sm text-slate-500">Trace xuất hiện sau khi file chạy xong.</p>}</div></div><div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Chi tiết</p><dl className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg bg-white p-3"><dt className="text-slate-500">Options</dt><dd className="font-bold">{counts.option}</dd></div><div className="rounded-lg bg-white p-3"><dt className="text-slate-500">Images / Tables / Formula</dt><dd className="font-bold">{counts.image} / {counts.table} / {counts.formula}</dd></div><div className="rounded-lg bg-white p-3"><dt className="text-slate-500">OCR time / Canvas peak</dt><dd className="font-bold">{formatMilliseconds(result.pipeline?.metrics.ocrTimeMs)} / {formatOptionalBytes(result.pipeline?.metrics.memory.peakCanvasBytes)}</dd></div><div className="rounded-lg bg-white p-3"><dt className="text-slate-500">Peak heap / Base64</dt><dd className="font-bold">{formatOptionalBytes(result.pipeline?.metrics.memory.peakHeapBytes)} / {formatOptionalBytes(result.pipeline?.metrics.memory.peakBase64Bytes)}</dd></div><div className="rounded-lg bg-white p-3"><dt className="text-slate-500">Review markers</dt><dd className="font-bold">{counts.review}</dd></div><div className="rounded-lg bg-white p-3"><dt className="text-slate-500">Error</dt><dd className="font-bold text-red-700">{result.error ?? '—'}</dd></div></dl></div></div></td></tr>}</Fragment>})}{results.length === 0 && <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-500"><ShieldAlert className="mx-auto mb-3" size={24} />Chọn thư mục corpus để bắt đầu benchmark.</td></tr>}</tbody></table></div>
        </section>
        {ocrProfilerRecords.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div><h2 className="text-lg font-black text-slate-900">OCR Profiler</h2><p className="mt-1 text-sm text-slate-500">Timing được thu tại từng request; trường không có telemetry từ browser/provider hiển thị dấu gạch ngang.</p></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Total requests', ocrProfilerSummary.totalRequests], ['Average request', formatMilliseconds(ocrProfilerSummary.request.average ?? undefined)], ['Provider inference', formatMilliseconds(ocrProfilerSummary.provider.average ?? undefined)], ['Largest image', formatOptionalBytes(ocrProfilerSummary.largestImageBytes || undefined)],
            ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 font-black text-slate-900">{value}</p></div>)}
          </div>
          <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Request</th><th className="px-3 py-2">Crop</th><th className="px-3 py-2">JPEG</th><th className="px-3 py-2">Base64</th><th className="px-3 py-2">Upload</th><th className="px-3 py-2">Provider</th><th className="px-3 py-2">Download</th><th className="px-3 py-2">Parse</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Timeline</th></tr></thead><tbody className="divide-y divide-slate-100">{ocrProfilerRecords.map((record) => <tr key={record.id}><td className="px-3 py-2 font-semibold text-slate-700">{record.id}</td><td className="px-3 py-2">{formatMilliseconds(record.renderTimeMs ?? undefined)}</td><td className="px-3 py-2">{formatMilliseconds(record.encodeTimeMs ?? undefined)}</td><td className="px-3 py-2">{formatMilliseconds(record.base64EncodeTimeMs ?? undefined)}</td><td className="px-3 py-2">{formatMilliseconds(record.uploadDurationMs ?? undefined)}</td><td className="px-3 py-2">{formatMilliseconds(record.providerDurationMs ?? undefined)}</td><td className="px-3 py-2">{formatMilliseconds(record.downloadDurationMs ?? undefined)}</td><td className="px-3 py-2">{formatMilliseconds(record.responseParseTimeMs ?? undefined)}</td><td className="px-3 py-2 font-bold">{formatMilliseconds(record.totalRequestTimeMs ?? undefined)}</td><td className="min-w-40 px-3 py-2"><progress className="h-2 w-full" value={record.totalRequestTimeMs ?? 0} max={maxOcrRequestTime}>{record.totalRequestTimeMs ?? 0}</progress></td></tr>)}</tbody></table></div>
          <div className="mt-5"><p className="text-xs font-black uppercase tracking-wide text-slate-500">Bottleneck ranking</p>{ocrBottlenecks.length > 0 ? <ol className="mt-2 space-y-1 text-sm text-slate-700">{ocrBottlenecks.map((item) => <li key={item.name}>{item.name}: {item.percent?.toFixed(1)}%</li>)}</ol> : <p className="mt-2 text-sm text-slate-500">Chưa có metric pha đủ để xếp hạng.</p>}</div>
        </section>}
        {ocrDiagnostics.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-slate-900">OCR Diagnostics</h2><p className="mt-1 text-sm text-slate-500">Raw OCR response, stage snapshots và từng rejection được giữ trong JSON export.</p><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Reports</p><p className="font-black text-slate-900">{ocrDiagnostics.length}</p></div><div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Rejected blocks</p><p className="font-black text-slate-900">{rejectedBlocks.length}</p></div><div className="rounded-xl border border-slate-200 p-3"><p className="text-xs text-slate-500">Top rejection</p><p className="font-black text-slate-900">{rejectionRanking[0]?.[0] ?? '—'}</p></div></div><div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Reason</th><th className="px-3 py-2">Count</th></tr></thead><tbody>{rejectionRanking.map(([reason, count]) => <tr key={reason}><td className="px-3 py-2">{reason}</td><td className="px-3 py-2 font-bold">{count}</td></tr>)}</tbody></table></div></section>}
        <FailureDiagnostics results={results} />
      </section>
    </main>
  );
};
