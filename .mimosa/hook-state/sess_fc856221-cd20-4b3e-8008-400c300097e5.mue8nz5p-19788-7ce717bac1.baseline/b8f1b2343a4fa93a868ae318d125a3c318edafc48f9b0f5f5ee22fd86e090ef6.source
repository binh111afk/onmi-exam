export type PipelineMode = 'strict' | 'benchmark';

export type PipelineDocumentStatus = 'pass' | 'partial-success' | 'failed';

export const getPipelineDocumentStatus = (completedRegions: number, failedRegions: number): PipelineDocumentStatus => {
  if (completedRegions === 0 && failedRegions > 0) return 'failed';
  return failedRegions > 0 ? 'partial-success' : 'pass';
};

export const shouldAbortOnOcrFailure = (mode: PipelineMode, failedRegions: number): boolean => (
  mode === 'strict' && failedRegions > 0
);
