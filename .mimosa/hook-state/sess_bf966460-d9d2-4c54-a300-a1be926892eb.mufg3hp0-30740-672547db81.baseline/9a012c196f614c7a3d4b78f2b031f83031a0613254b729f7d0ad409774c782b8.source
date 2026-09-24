export interface OcrRequestProfilerRecord {
  id: string;
  page: number;
  regionId: string;
  cropWidth: number | null;
  cropHeight: number | null;
  imageFormat: string | null;
  imageQuality: number | null;
  imageBytes: number | null;
  base64Bytes: number | null;
  renderTimeMs: number | null;
  encodeTimeMs: number | null;
  base64EncodeTimeMs: number | null;
  uploadStart: number | null;
  uploadEnd: number | null;
  uploadDurationMs: number | null;
  providerStart: number | null;
  providerEnd: number | null;
  providerDurationMs: number | null;
  downloadDurationMs: number | null;
  responseParseTimeMs: number | null;
  totalRequestTimeMs: number | null;
  success: boolean;
  retryCount: number;
  responseHeadersAt: number | null;
  timeToFirstByteMs: number | null;
}

export interface OcrCropProfilerData {
  startedAtMs: number;
  cropWidth: number;
  cropHeight: number;
  imageFormat: 'image/jpeg';
  imageQuality: number;
  imageBytes: number;
  renderTimeMs: number;
  encodeTimeMs: number;
}
