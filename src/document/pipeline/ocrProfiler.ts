import type { OcrRequestProfilerRecord } from '../../types/ocr-profiler';

const percentile = (values: number[], ratio: number): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
};

const statistics = (records: OcrRequestProfilerRecord[], selector: (record: OcrRequestProfilerRecord) => number | null) => {
  const values = records.map(selector).filter((value): value is number => value !== null);
  return {
    average: values.length === 0 ? null : values.reduce((total, value) => total + value, 0) / values.length,
    median: percentile(values, 0.5),
    p95: percentile(values, 0.95),
    p99: percentile(values, 0.99),
  };
};

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
    if (!largest || (record.cropWidth * record.cropHeight) > (largest.width * largest.height)) return { width: record.cropWidth, height: record.cropHeight };
    return largest;
  }, null),
});

export const rankOcrProfilerBottlenecks = (records: OcrRequestProfilerRecord[]) => {
  const categories = [
    ['Crop render', records.reduce((total, record) => total + (record.renderTimeMs ?? 0), 0)],
    ['JPEG encode', records.reduce((total, record) => total + (record.encodeTimeMs ?? 0), 0)],
    ['Base64 encode', records.reduce((total, record) => total + (record.base64EncodeTimeMs ?? 0), 0)],
    ['Upload', records.reduce((total, record) => total + (record.uploadDurationMs ?? 0), 0)],
    ['Provider inference', records.reduce((total, record) => total + (record.providerDurationMs ?? 0), 0)],
    ['Download', records.reduce((total, record) => total + (record.downloadDurationMs ?? 0), 0)],
    ['Response parse', records.reduce((total, record) => total + (record.responseParseTimeMs ?? 0), 0)],
  ] as const;
  const total = categories.reduce((sum, [, duration]) => sum + duration, 0);
  return categories.filter(([, duration]) => duration > 0).sort((first, second) => second[1] - first[1]).map(([name, duration]) => ({ name, duration, percent: total === 0 ? null : (duration / total) * 100 }));
};
