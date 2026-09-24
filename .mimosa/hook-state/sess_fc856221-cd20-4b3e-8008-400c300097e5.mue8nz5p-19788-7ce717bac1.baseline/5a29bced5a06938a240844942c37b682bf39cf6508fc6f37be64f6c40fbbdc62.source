export type PipelineStepName = 'importer' | 'layout' | 'region-planner' | 'crop' | 'ocr-worker' | 'merge' | 'parser' | 'oml-generator';

export interface MemorySnapshot {
  usedJsHeapBytes?: number;
  totalJsHeapBytes?: number;
}

export interface PipelineMemoryTelemetry {
  peakHeapBytes?: number;
  averageHeapBytes?: number;
  peakCanvasBytes?: number;
  peakBase64Bytes?: number;
  garbageCollectionOpportunity?: boolean;
}

export interface PipelineStepTiming {
  name: PipelineStepName;
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  memoryBefore: MemorySnapshot;
  memoryAfter: MemorySnapshot;
}

interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
}

const snapshotMemory = (): MemorySnapshot => {
  const memory = (performance as PerformanceWithMemory).memory;
  return memory ? { usedJsHeapBytes: memory.usedJSHeapSize, totalJsHeapBytes: memory.totalJSHeapSize } : {};
};

export class PipelineTelemetry {
  private readonly pipelineStart = performance.now();
  private readonly steps: PipelineStepTiming[] = [];
  private readonly heapSamples: number[] = [];
  private peakCanvasBytes = 0;
  private peakBase64Bytes = 0;

  async measure<T>(name: PipelineStepName, operation: () => Promise<T> | T): Promise<T> {
    const start = performance.now();
    const memoryBefore = this.captureMemory();
    const result = await operation();
    const end = performance.now();
    this.steps.push({ name, startTimeMs: start - this.pipelineStart, endTimeMs: end - this.pipelineStart, durationMs: end - start, memoryBefore, memoryAfter: this.captureMemory() });
    return result;
  }

  record(name: PipelineStepName, start: number, end: number): void {
    this.steps.push({ name, startTimeMs: start - this.pipelineStart, endTimeMs: end - this.pipelineStart, durationMs: end - start, memoryBefore: this.captureMemory(), memoryAfter: this.captureMemory() });
  }

  recordCanvasPeak(bytes: number): void {
    this.peakCanvasBytes = Math.max(this.peakCanvasBytes, bytes);
  }

  recordBase64Peak(bytes: number): void {
    this.peakBase64Bytes = Math.max(this.peakBase64Bytes, bytes);
  }

  getSteps(): PipelineStepTiming[] {
    return [...this.steps];
  }

  getPeakMemoryBytes(): number | undefined {
    const values = this.steps.flatMap((step) => [step.memoryBefore.usedJsHeapBytes, step.memoryAfter.usedJsHeapBytes]).filter((value): value is number => value !== undefined);
    return values.length > 0 ? Math.max(...values) : undefined;
  }

  getMemoryTelemetry(): PipelineMemoryTelemetry {
    const peakHeapBytes = this.getPeakMemoryBytes();
    const latestHeapBytes = this.heapSamples.at(-1);
    return {
      peakHeapBytes,
      averageHeapBytes: this.heapSamples.length > 0
        ? this.heapSamples.reduce((total, value) => total + value, 0) / this.heapSamples.length
        : undefined,
      peakCanvasBytes: this.peakCanvasBytes || undefined,
      peakBase64Bytes: this.peakBase64Bytes || undefined,
      garbageCollectionOpportunity: peakHeapBytes !== undefined && latestHeapBytes !== undefined && latestHeapBytes < peakHeapBytes
        ? true
        : undefined,
    };
  }

  private captureMemory(): MemorySnapshot {
    const snapshot = snapshotMemory();
    if (snapshot.usedJsHeapBytes !== undefined) this.heapSamples.push(snapshot.usedJsHeapBytes);
    return snapshot;
  }
}
