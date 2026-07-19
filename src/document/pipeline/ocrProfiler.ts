import type { OcrRequestProfilerRecord } from '../../types/ocr-profiler';

export interface DistributionStatistics {
  average: number | null;
  median: number | null;
  stdDev: number | null;
  p50: number | null;
  p90: number | null;
  p95: number | null;
  p99: number | null;
  min: number | null;
  max: number | null;
}

const percentile = (values: number[], ratio: number): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
};

export const distribution = (values: number[]): DistributionStatistics => {
  if (values.length === 0) return { average: null, median: null, stdDev: null, p50: null, p90: null, p95: null, p99: null, min: null, max: null };
  const average = values.reduce((total, value) => total + value, 0) / values.length;
  return { average, median: percentile(values, 0.5), stdDev: Math.sqrt(values.reduce((total, value) => total + ((value - average) ** 2), 0) / values.length), p50: percentile(values, 0.5), p90: percentile(values, 0.9), p95: percentile(values, 0.95), p99: percentile(values, 0.99), min: Math.min(...values), max: Math.max(...values) };
};

const statistics = (records: OcrRequestProfilerRecord[], selector: (record: OcrRequestProfilerRecord) => number | null): DistributionStatistics => distribution(records.map(selector).filter((value): value is number => value !== null));

export const summarizeOcrProfiler = (records: OcrRequestProfilerRecord[]) => ({
  totalRequests: records.length,
  request: statistics(records, (record) => record.totalRequestTimeMs),
  crop: statistics(records, (record) => record.renderTimeMs),
  jpegEncode: statistics(records, (record) => record.encodeTimeMs),
  base64Encode: statistics(records, (record) => record.base64EncodeTimeMs),
  upload: statistics(records, (record) => record.uploadDurationMs),
  provider: statistics(records, (record) => record.providerDurationMs),
  download: statistics(records, (record) => record.downloadDurationMs),
  responseParse: statistics(records, (record) => record.responseParseTimeMs),
  largestImageBytes: Math.max(0, ...records.map((record) => record.imageBytes ?? 0)),
  largestBase64Bytes: Math.max(0, ...records.map((record) => record.base64Bytes ?? 0)),
  largestResolution: records.reduce<{ width: number; height: number } | null>((largest, record) => {
    if (record.cropWidth === null || record.cropHeight === null) return largest;
    if (largest === null || (record.cropWidth * record.cropHeight) > (largest.width * largest.height)) return { width: record.cropWidth, height: record.cropHeight };
    return largest;
  }, null),
});

export const rankOcrProfilerBottlenecks = (records: OcrRequestProfilerRecord[]) => {
  const parentInclusive = records.reduce((total, record) => total + (record.totalRequestTimeMs ?? 0), 0);
  const children = [
    ['Crop', records.reduce((total, record) => total + (record.renderTimeMs ?? 0), 0)],
    ['JPEG encode', records.reduce((total, record) => total + (record.encodeTimeMs ?? 0), 0)],
    ['Base64 encode', records.reduce((total, record) => total + (record.base64EncodeTimeMs ?? 0), 0)],
    ['Upload', records.reduce((total, record) => total + (record.uploadDurationMs ?? 0), 0)],
    ['Provider inference', records.reduce((total, record) => total + (record.providerDurationMs ?? 0), 0)],
    ['Download', records.reduce((total, record) => total + (record.downloadDurationMs ?? 0), 0)],
    ['Response parse', records.reduce((total, record) => total + (record.responseParseTimeMs ?? 0), 0)],
  ] as const;
  const knownChildInclusive = children.reduce((total, [, duration]) => total + duration, 0);
  return [
    { name: 'OCR request', selfTime: Math.max(0, parentInclusive - knownChildInclusive), inclusiveTime: parentInclusive, percent: parentInclusive === 0 ? null : 100 },
    ...children.filter(([, duration]) => duration > 0).map(([name, duration]) => ({ name, selfTime: duration, inclusiveTime: duration, percent: parentInclusive === 0 ? null : (duration / parentInclusive) * 100 })),
  ].sort((first, second) => second.inclusiveTime - first.inclusiveTime);
};

export const analyzeConcurrency = (records: OcrRequestProfilerRecord[]) => {
  const intervals = records.filter((record) => record.uploadStart !== null && record.totalRequestTimeMs !== null).map((record) => ({ start: record.uploadStart as number, end: (record.uploadStart as number) + (record.totalRequestTimeMs as number) }));
  if (intervals.length === 0) return { maxConcurrency: null, averageConcurrency: null, criticalPathMs: null, longestRequestMs: null, shortestRequestMs: null };
  const events = intervals.flatMap((interval) => [{ at: interval.start, delta: 1 }, { at: interval.end, delta: -1 }]).sort((first, second) => first.at - second.at || first.delta - second.delta);
  let concurrency = 0; let maxConcurrency = 0; let weighted = 0; let previous = events[0].at;
  events.forEach((event) => { weighted += concurrency * (event.at - previous); concurrency += event.delta; maxConcurrency = Math.max(maxConcurrency, concurrency); previous = event.at; });
  const criticalPathMs = events.at(-1)!.at - events[0].at;
  return { maxConcurrency, averageConcurrency: weighted / criticalPathMs, criticalPathMs, longestRequestMs: Math.max(...intervals.map((interval) => interval.end - interval.start)), shortestRequestMs: Math.min(...intervals.map((interval) => interval.end - interval.start)) };
};
