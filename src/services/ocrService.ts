import * as pdfjsLib from 'pdfjs-dist';
import type {
  OmlContentBlock,
  OmlDocumentV2,
  OmlInfo,
  OmlQuestionBlock,
  OmlQuestionGroupBlock,
  OmlQuestionOption,
} from '../types/oml';
import { omlToQuestionDocument, questionDocumentToOml } from '../document/adapters/omlQuestionObjectAdapter';
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import type { QuestionDocument } from '../types/question-object';
import type { OcrDiagnosticReport, OcrRejectedBlock } from '../types/ocr-diagnostics';
import { OcrProviderAdapterError, OcrProviderFactory, OcrProviderHttpError, parseFileWithGlmOcr } from '../document/ocr/ocrProvider';
import type { BenchmarkRunOptions, OcrProviderId } from '../document/ocr/ocrProvider';
import { shouldAbortOnOcrFailure } from '../document/pipeline/pipelineMode';
import type { PipelineMode } from '../document/pipeline/pipelineMode';

declare const process: {
  env: {
    NEXT_PUBLIC_ILOVEPDF_PUBLIC_KEY?: string;
  };
};

const ILOVEPDF_API_URL = 'https://api.ilovepdf.com/v1';
const ILOVEPDF_POLL_INTERVAL_MS = 500;
const ILOVEPDF_MAX_POLL_ATTEMPTS = 120;

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const containsOcrNoise = (value: unknown): boolean => {
  if (typeof value === 'string') {
    const text = value.trim();
    return /(?:trang\s*\d+\s*(?:\/|trên)\s*\d+|mã\s*đề\s*(?:thi)?)/i.test(text)
      || /(?:^|[^A-Za-z])[A-D]{5,}(?=$|[^A-Za-z])/.test(text);
  }

  if (Array.isArray(value)) {
    return value.some(containsOcrNoise);
  }

  return isRecord(value) && Object.values(value).some(containsOcrNoise);
};

const isValidOcrOption = (value: unknown): value is OmlQuestionOption => (
  isRecord(value)
  && (typeof value.id === 'string' || typeof value.id === 'number')
  && typeof value.content === 'string'
  && value.content.trim().length > 0
  && !containsOcrNoise(value.content)
);

const isValidOcrQuestionBlock = (value: unknown): value is OmlQuestionBlock => {
  if (
    !isRecord(value)
    || value.type !== 'question'
    || (typeof value.id !== 'string' && typeof value.id !== 'number')
    || typeof value.question !== 'string'
    || value.question.trim().length === 0
    || !Array.isArray(value.options)
    || value.options.length === 0
    || !value.options.every(isValidOcrOption)
    || !Array.isArray(value.answer)
    || containsOcrNoise(value)
  ) {
    return false;
  }

  return value.subType === undefined || value.subType === 'choice' || value.subType === 'true-false';
};

type OcrFilteredBlock = OmlQuestionBlock | OmlQuestionGroupBlock;

interface OcrQuestionGroupFilterStats {
  detected: number;
  accepted: number;
  rejected: number;
  questionsKept: number;
  questionsRemoved: number;
}

interface OcrFilterResult {
  content: OcrFilteredBlock[];
  rejected: OcrRejectedBlock[];
  questionGroups: OcrQuestionGroupFilterStats;
}

const diagnosticPreview = (value: unknown): string => {
  try { return JSON.stringify(value).slice(0, 500); } catch { return String(value).slice(0, 500); }
};

const diagnoseRejectedOcrBlock = (value: unknown): OcrRejectedBlock => {
  const block = isRecord(value) ? value : {};
  const id = typeof block.id === 'string' || typeof block.id === 'number' ? block.id : null;
  const type = typeof block.type === 'string' ? block.type : null;
  const missingFields: string[] = [];
  if (!isRecord(value)) missingFields.push('Invalid block');
  else {
    if (type !== 'question') missingFields.push('Invalid type');
    if (id === null) missingFields.push('Missing id');
    if (typeof block.question !== 'string' || block.question.trim().length === 0) missingFields.push('Missing question');
    if (!Array.isArray(block.options) || block.options.length === 0) missingFields.push('Missing options');
    else if (!block.options.every(isValidOcrOption)) missingFields.push('Invalid option');
    if (!Array.isArray(block.answer)) missingFields.push('Missing answer');
  }
  let reason: OcrRejectedBlock['reason'] = 'InvalidOML';
  if (!isRecord(value)) reason = 'InvalidOML';
  else if (type !== 'question') reason = 'UnknownBlock';
  else if (id === null) reason = 'MissingQuestionNumber';
  else if (typeof block.question !== 'string' || block.question.trim().length === 0) reason = 'MissingStem';
  else if (!Array.isArray(block.options) || block.options.length === 0) reason = 'MissingOptions';
  else if (!block.options.every(isValidOcrOption) || (block.subType !== undefined && block.subType !== 'choice' && block.subType !== 'true-false')) reason = 'InvalidChoiceStructure';
  else if (!Array.isArray(block.answer)) reason = 'InvalidOML';
  else if (containsOcrNoise(value)) reason = 'OcrNoise';
  return { id, page: null, type, preview: diagnosticPreview(value), rejected: true, reason, missingFields };
};

const isOcrQuestionGroup = (value: unknown): value is OmlQuestionGroupBlock => (
  isRecord(value)
  && value.type === 'question-group'
  && (typeof value.id === 'string' || typeof value.id === 'number')
  && Array.isArray(value.context)
  && Array.isArray(value.questions)
);

const filterValidOcrQuestions = (content: unknown[]): OcrFilterResult => {
  const result: OcrFilterResult = {
    content: [],
    rejected: [],
    questionGroups: { detected: 0, accepted: 0, rejected: 0, questionsKept: 0, questionsRemoved: 0 },
  };

  content.forEach((block) => {
    if (isValidOcrQuestionBlock(block)) {
      result.content.push(block);
      return;
    }

    if (isRecord(block) && block.type === 'question-group') {
      result.questionGroups.detected += 1;
      const questions = Array.isArray(block.questions) ? block.questions : [];
      const validQuestions = questions.filter(isValidOcrQuestionBlock);
      const rejectedQuestions = questions.filter((question) => !isValidOcrQuestionBlock(question));
      result.questionGroups.questionsKept += validQuestions.length;
      result.questionGroups.questionsRemoved += rejectedQuestions.length;
      result.rejected.push(...rejectedQuestions.map(diagnoseRejectedOcrBlock));

      if (isOcrQuestionGroup(block) && validQuestions.length > 0) {
        result.questionGroups.accepted += 1;
        result.content.push({ ...block, questions: validQuestions });
        return;
      }

      result.questionGroups.rejected += 1;
      result.rejected.push(diagnoseRejectedOcrBlock(block));
      return;
    }

    result.rejected.push(diagnoseRejectedOcrBlock(block));
  });

  return result;
};

const getQuestionOrder = (question: OmlQuestionBlock): number | null => {
  if (typeof question.id === 'number' && Number.isFinite(question.id)) {
    return question.id;
  }

  const matchedNumber = String(question.id).match(/\d+/);
  return matchedNumber ? Number.parseInt(matchedNumber[0], 10) : null;
};

const getOcrBlockOrder = (block: OcrFilteredBlock): number | null => (
  block.type === 'question'
    ? getQuestionOrder(block)
    : getQuestionOrder(block.questions[0])
);

interface IlovePdfTaskResponse {
  server?: string;
  task?: string;
  status?: string;
  error?: string;
  message?: string;
  download_filename?: string;
}

interface IlovePdfAuthResponse {
  token?: string;
}

interface IlovePdfUploadResponse {
  server_filename?: string;
  filename?: string;
  files?: IlovePdfUploadResponse[];
}

export const fileToBase64 = async (file: Blob): Promise<string> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const chunkSize = 0x8000;
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
};

const wait = (milliseconds: number) => new Promise<void>((resolve) => {
  window.setTimeout(resolve, milliseconds);
});

const getIlovePdfError = async (response: Response, fallback: string): Promise<Error> => {
  const body = await response.text();
  return new Error(`${fallback}: ${body || response.statusText}`);
};

const getIlovePdfServerUrl = (server: string): string => (
  server.startsWith('http') ? server : `https://${server}`
);

const getBearerHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
});

const getUploadedFiles = (upload: IlovePdfUploadResponse): IlovePdfUploadResponse[] => (
  upload.files ?? [upload]
);

const isCompleteIlovePdfTask = (task: IlovePdfTaskResponse): boolean => (
  task.status?.toLowerCase() === 'tasksuccess'
  || task.status?.toLowerCase() === 'success'
  || task.status?.toLowerCase() === 'completed'
  || Boolean(task.download_filename)
);

const isFailedIlovePdfTask = (task: IlovePdfTaskResponse): boolean => (
  task.status?.toLowerCase() === 'taskerror'
  || task.status?.toLowerCase() === 'error'
  || task.status?.toLowerCase() === 'failed'
  || task.status?.toLowerCase() === 'cancelled'
);

const convertDocxToPdf = async (file: File): Promise<Blob> => {
  const publicKey = process.env.NEXT_PUBLIC_ILOVEPDF_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('Vui lòng cấu hình NEXT_PUBLIC_ILOVEPDF_PUBLIC_KEY trong file .env trước khi chuyển đổi DOCX.');
  }

  const authResponse = await fetch(`${ILOVEPDF_API_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: publicKey }),
  });
  if (!authResponse.ok) throw await getIlovePdfError(authResponse, 'Không thể xác thực iLovePDF');

  const auth = await authResponse.json() as IlovePdfAuthResponse;
  if (!auth.token) {
    throw new Error('iLovePDF không trả về token xác thực.');
  }

  const startResponse = await fetch(`${ILOVEPDF_API_URL}/start/officepdf`, {
    headers: getBearerHeaders(auth.token),
  });
  if (!startResponse.ok) throw await getIlovePdfError(startResponse, 'Không thể khởi tạo tác vụ iLovePDF');

  const startTask = await startResponse.json() as IlovePdfTaskResponse;
  if (!startTask.task || !startTask.server) {
    throw new Error('iLovePDF không trả về task hoặc server cho tác vụ chuyển đổi DOCX.');
  }

  const serverUrl = getIlovePdfServerUrl(startTask.server);
  const uploadForm = new FormData();
  uploadForm.append('task', startTask.task);
  uploadForm.append('file', file, file.name);

  const uploadResponse = await fetch(`${serverUrl}/v1/upload`, {
    method: 'POST',
    headers: getBearerHeaders(auth.token),
    body: uploadForm,
  });
  if (!uploadResponse.ok) throw await getIlovePdfError(uploadResponse, 'Không thể tải DOCX lên iLovePDF');

  const uploadedFiles = getUploadedFiles(await uploadResponse.json() as IlovePdfUploadResponse);
  if (uploadedFiles.some((uploadedFile) => !uploadedFile.server_filename)) {
    throw new Error('iLovePDF không trả về tên tệp DOCX đã tải lên.');
  }

  const processResponse = await fetch(`${serverUrl}/v1/process`, {
    method: 'POST',
    headers: {
      ...getBearerHeaders(auth.token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task: startTask.task,
      tool: 'officepdf',
      files: uploadedFiles.map((uploadedFile) => ({
        server_filename: uploadedFile.server_filename,
        filename: uploadedFile.filename || file.name,
      })),
    }),
  });
  if (!processResponse.ok) throw await getIlovePdfError(processResponse, 'iLovePDF không thể chuyển đổi DOCX');

  let taskStatus = await processResponse.json() as IlovePdfTaskResponse;
  for (let attempt = 0; !isCompleteIlovePdfTask(taskStatus); attempt += 1) {
    if (isFailedIlovePdfTask(taskStatus)) {
      throw new Error(taskStatus.message || taskStatus.error || 'Tác vụ chuyển đổi DOCX của iLovePDF thất bại.');
    }
    if (attempt >= ILOVEPDF_MAX_POLL_ATTEMPTS) {
      throw new Error('Chuyển đổi DOCX mất quá nhiều thời gian. Vui lòng thử lại.');
    }

    await wait(ILOVEPDF_POLL_INTERVAL_MS);
    const statusResponse = await fetch(`${ILOVEPDF_API_URL}/task/${startTask.task}`, {
      headers: getBearerHeaders(auth.token),
    });
    if (!statusResponse.ok) throw await getIlovePdfError(statusResponse, 'Không thể kiểm tra trạng thái iLovePDF');
    taskStatus = await statusResponse.json() as IlovePdfTaskResponse;
  }

  const downloadResponse = await fetch(`${serverUrl}/v1/download/${startTask.task}`, {
    headers: getBearerHeaders(auth.token),
  });
  if (!downloadResponse.ok) throw await getIlovePdfError(downloadResponse, 'Không thể tải PDF đã chuyển đổi từ iLovePDF');

  return downloadResponse.blob();
};

export interface LegacyOcrMemoryTelemetry {
  recordBase64Peak(bytes: number): void;
}

export interface LegacyOcrRequestMeasurement {
  base64Bytes: number | null;
  base64EncodeTimeMs: number | null;
  uploadStart: number | null;
  uploadEnd: number | null;
  uploadDurationMs: number | null;
  providerStart: number | null;
  providerEnd: number | null;
  providerDurationMs: number | null;
  downloadDurationMs: number | null;
  responseParseTimeMs: number | null;
  success: boolean;
  responseHeadersAt: number | null;
  timeToFirstByteMs: number | null;
}

export type LegacyOcrDiagnosticsSink = (report: OcrDiagnosticReport) => void;

export class OcrDiagnosticError extends Error {
  readonly ocrDiagnostics: OcrDiagnosticReport[];

  constructor(message: string, report: OcrDiagnosticReport, cause?: unknown) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'OcrDiagnosticError';
    this.ocrDiagnostics = [report];
  }
}

export const runLegacyOcrToQuestionDocument = async (
  file: File,
  onProgress?: (statusText: string) => void,
  memoryTelemetry?: LegacyOcrMemoryTelemetry,
  onRequestMeasurement?: (measurement: LegacyOcrRequestMeasurement) => void,
  onDiagnostics?: LegacyOcrDiagnosticsSink,
  providerOptions?: BenchmarkRunOptions,
  pipelineMode: PipelineMode = 'strict',
): Promise<QuestionDocument> => {
  const selectedProvider = OcrProviderFactory.create(providerOptions?.providerId === 'google' ? 'gemini' : providerOptions?.providerId === 'zhipu' ? 'zhipu' : 'gpt', providerOptions?.model);
  const aiApiUrl = import.meta.env.AZURE_QWEN_ENDPOINT;
  const aiModel = import.meta.env.AZURE_QWEN_MODEL;
  const aiApiKey = import.meta.env.AZURE_QWEN_KEY;
  const diagnostics: OcrDiagnosticReport = {
    fileName: file.name,
    provider: selectedProvider.displayName,
    requestCount: 0,
    pages: [],
    regions: [],
    stages: [],
    summary: { rawBlocks: 0, normalizedBlocks: 0, parsedBlocks: 0, filter1Before: 0, filter1After: 0, mergeBefore: 0, mergeAfter: 0, filter2Before: 0, filter2After: 0, mergedContentLength: 0, questionCount: 0, omlBlocks: 0, questionGroupsDetected: 0, questionGroupsAccepted: 0, questionGroupsRejected: 0, questionsKeptFromGroups: 0, questionsRemovedFromGroups: 0 },
    rejectedBlocks: [],
    rawResponses: [],
    requests: [],
    http: [],
    providerResponses: [],
    adapterDiagnostics: [],
    parseDiagnostics: [],
  };
  let diagnosticsEmitted = false;
  const emitDiagnostics = (): void => {
    if (diagnosticsEmitted) return;
    diagnosticsEmitted = true;
    onDiagnostics?.(diagnostics);
  };
  const failWithDiagnostics = (message: string, cause?: unknown): never => {
    diagnostics.error = message;
    emitDiagnostics();
    throw new OcrDiagnosticError(message, diagnostics, cause);
  };
  const recordProviderFailure = (error: unknown): void => {
    if (error instanceof OcrProviderHttpError) {
      diagnostics.http.push(error.http);
      diagnostics.providerResponses.push(error.responseMetadata);
      return;
    }
    if (error instanceof OcrProviderAdapterError) {
      diagnostics.http.push(error.http);
      diagnostics.providerResponses.push(error.responseMetadata);
      diagnostics.adapterDiagnostics.push(error.adapter);
    }
  };
  const isDocx = file.name.toLowerCase().endsWith('.docx');
  let sourceFile: Blob = file;

  if (isDocx) {
    if (onProgress) onProgress('Đang chuyển đổi tài liệu DOCX sang PDF...');
    try {
      sourceFile = await convertDocxToPdf(file);
    } catch (error) {
      failWithDiagnostics('Không thể chuyển đổi tài liệu DOCX trước khi OCR.', error);
    }
  }

  const isPdf = file.name.toLowerCase().endsWith('.pdf') || isDocx || sourceFile.type === 'application/pdf';

  interface OcrPageData {
    base64Data: string;
    mimeType: string;
  }

  interface ParsedOcrPage {
    info: Partial<OmlInfo>;
    content: OmlContentBlock[];
  }

  interface OcrPageResult {
    pageIndex: number;
    page?: ParsedOcrPage;
    error?: Error;
  }

  let loadingTask: PDFDocumentLoadingTask | undefined;
  let pdf: PDFDocumentProxy | undefined;
  let pdfPageCount = 0;
  if (isPdf) {
    if (onProgress) onProgress('Đang phân tích cấu trúc tài liệu...');
    try {
      loadingTask = pdfjsLib.getDocument({ data: await sourceFile.arrayBuffer() });
      pdf = await loadingTask.promise;
    } catch (error) {
      if (loadingTask !== undefined) await loadingTask.destroy();
      failWithDiagnostics('Không thể mở PDF để OCR.', error);
    }
    pdfPageCount = pdf.numPages;
    if (onProgress) onProgress(`Đang trích xuất ${pdfPageCount} trang từ file PDF...`);
    if (pdfPageCount > 100 && onProgress) onProgress(`Tài liệu có ${pdfPageCount} trang; đang xử lý theo lô để giới hạn bộ nhớ.`);
  }

  const prompt = `Bạn là một chuyên gia chuyển đổi tài liệu giáo dục và đề thi từ PDF/ảnh sang ngôn ngữ đánh dấu OML v2.0 (Omni Markup Language) dưới dạng JSON.
 
Hãy phân tích kỹ tệp đính kèm và xuất ra dữ liệu JSON tuân thủ nghiêm ngặt đặc tả cấu trúc OML v2.0 dưới đây:
 
### 1. QUY TẮC BIÊN DỊCH VÀ CHUYỂN ĐỔI CHỮ:
- Giữ nguyên văn tiếng Việt có dấu, không dịch thuật, không tóm tắt, không sửa lỗi chính tả gốc của đề thi.
- TỰ ĐỘNG CHUYỂN ĐỔI: Toàn bộ công thức toán học, vật lý, hóa học, ký hiệu đặc biệt hoặc phân số bắt buộc phải được chuyển đổi sang mã LaTeX chuẩn.
  + Công thức nằm trong dòng văn bản: Kẹp giữa cặp dấu $ (Ví dụ: $f(x) = ax^2 + bx + c$).
  + Công thức độc lập nằm riêng một dòng: Dùng cấu trúc block \`formula\` hoặc kẹp giữa cặp dấu $$ (Ví dụ: $$\\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$).
- XỬ LÝ HÌNH ẢNH: Nếu trong tài liệu gốc có hình ảnh, hình vẽ minh họa, đồ thị mà bạn không thể tự tạo link, hãy để thuộc tính "src" của đối tượng ảnh là chuỗi rỗng "". Tuyệt đối không được bỏ qua block ảnh hoặc tự bịa ra link ảnh.
- KHÔNG GIẢI BÀI: Để trống giá trị cho thuộc tính "explanation" (luôn là chuỗi rỗng ""). Không mất thời gian viết giải thích hay giải bài tập.
- KHÔNG TỰ GIẢI ĐÁP ÁN: Mặc định luôn để trống thuộc tính "answer" là mảng rỗng [] cho mọi câu hỏi. TUYỆT ĐỐI không tự suy luận giải câu hỏi để điền đáp án, TRỪ KHI trong tài liệu gốc có đánh dấu rõ ràng đáp án đúng bằng cách: in đậm, in nghiêng, gạch chân (underline), viết hoa đáp án đậm, hoặc tô màu chữ khác biệt... thì mới được trích xuất đáp án được đánh dấu đó vào mảng "answer" (ví dụ: ["A"]). Nếu không có đánh dấu rõ ràng như vậy, bắt buộc phải để trống mảng "answer" là [].

### 1.1. PHẠM VI NHẬN DIỆN BẮT BUỘC:
- CHỈ trích xuất các câu hỏi thi thực tế được đánh số rõ ràng (ví dụ: "Câu 1", "Câu 2"). Không tạo block cho tiêu đề, đoạn văn, chân trang, bảng biểu hoặc dữ liệu phụ.
- BỎ QUA HOÀN TOÀN bảng đáp án, ma trận mã đề, bảng liệt kê đáp án và đáp án ở cuối trang/cuối tài liệu. Các bảng này không được xuất hiện trong mảng "content" dưới bất kỳ dạng block nào.
- BỎ QUA mọi chân trang/đầu trang như "Trang 5/5", "Mã đề thi...", số trang, mã tài liệu và chữ lặp lại do quét ảnh.
- Mỗi block trong "content" bắt buộc phải có "type": "question" cùng đầy đủ "id", "question", "options" và "answer". "options" phải là mảng các object có đủ "id" và "content"; không tạo câu hỏi nếu không thể bóc tách đầy đủ các lựa chọn.
- Giữ nguyên số thứ tự "Câu N" của tài liệu gốc trong trường "id". Không đánh số lại theo từng trang; các câu trả về trong một trang phải theo thứ tự tăng dần của số Câu.
- Công thức Toán, Lý, Hóa trong nội dung câu hỏi hoặc lựa chọn phải được bọc bằng dấu $ theo LaTeX chuẩn.
- TUYỆT ĐỐI không tạo hoặc chép chuỗi đáp án gộp chỉ gồm các ký tự A/B/C/D như "CAAADA" hoặc "ACCBCDC" vào bất kỳ thuộc tính nào của JSON. Đây là dữ liệu bảng đáp án phải bị bỏ qua.
 
### 2. ĐẶC TẢ CHI TIẾT CẤU TRÚC OML v2.0 (JSON SCHEMA):
Dữ liệu trả về phải là một Object JSON có dạng:
{
  "version": "2.0",
  "info": {
    "title": "Tên đề thi hoặc tiêu đề tài liệu",
    "subject": "Môn học (nếu có)",
    "grade": "Khối lớp (Số hoặc Chuỗi, ví dụ: 10, 11, 12 hoặc 'Đại học')",
    "time": 60,
    "type": "exam",
    "difficulty": "medium",
    "description": "Mô tả ngắn gọn về tài liệu"
  },
  "content": [
    // Danh sách các khối nội dung theo đúng thứ tự xuất hiện trong PDF/ảnh
  ]
}
 
Các khối (blocks) được phép nằm trong mảng "content" (chỉ dùng khối Question theo phạm vi nhận diện bắt buộc ở trên):
- Khối Heading (Tiêu đề phân đoạn):
  { "type": "heading", "level": 1, "text": "PHẦN I: TRẮC NGHIỆM" } // level chỉ được nhận giá trị 1, 2, hoặc 3
 
- Khối Paragraph (Đoạn văn thường):
  { "type": "paragraph", "text": "Đoạn văn bản..." }
 
- Khối Divider (Đường kẻ phân cách phân đoạn):
  { "type": "divider" }
 
- Khối Formula (Công thức toán độc lập):
  { "type": "formula", "latex": "a^2 + b^2 = c^2", "display": "block" }
 
- Khối Table (Bảng dữ liệu):
  {
    "type": "table",
    "caption": "Tên bảng (nếu có)",
    "headers": ["Cột 1", "Cột 2"],
    "rows": [ ["Hàng 1 ô 1", "Hàng 1 ô 2"] ]
  }
 
- Khối List (Danh sách):
  { "type": "list", "ordered": false, "items": ["Ý 1", "Ý 2"] }
 
- Khối Callout (Hộp thông tin nổi bật):
  { "type": "callout", "variant": "info", "content": "Nội dung lưu ý" } // variant: 'info' | 'warning' | 'success' | 'error'
 
- Khối Image (Hình ảnh):
  { "type": "image", "src": "", "alt": "Mô tả ảnh", "size": "medium" } // size: 'small' | 'medium' | 'full'
 
- Khối Question (Câu hỏi đơn lẻ):
  Yêu cầu bắt buộc phải có thuộc tính "subType" để phân loại:
  a) Câu hỏi Trắc nghiệm chọn đáp án (subType: "choice"):
     {
       "type": "question",
       "subType": "choice",
       "id": 1,
       "question": "Nội dung câu hỏi...",
       "points": 0.25,
       "options": [
         { "id": "A", "content": "Nội dung đáp án A" },
         { "id": "B", "content": "Nội dung đáp án B" }
       ],
       "answer": [],
       "explanation": ""
     }
  b) Câu hỏi Đúng / Sai nhiều lựa chọn (subType: "true-false"):
     {
       "type": "question",
       "subType": "true-false",
       "id": 2,
       "question": "Nội dung câu phát biểu chung...",
       "options": [
         { "id": "A", "content": "Phát biểu 1" },
         { "id": "B", "content": "Phát biểu 2" }
       ],
       "answer": [],
       "explanation": ""
     }
  c) Câu hỏi Điền khuyết (subType: "fill-blank"):
     {
       "type": "question",
       "subType": "fill-blank",
       "id": 3,
       "question": "Điền vào chỗ trống: Thủ đổ của Việt Nam là [blank]...",
       "answer": [],
       "explanation": ""
     }
 
- Khối Question Group (Nhóm câu hỏi chung ngữ cảnh):
  {
    "type": "question-group",
    "id": "group_1",
    "context": [
      { "type": "paragraph", "text": "Đoạn văn ngữ cảnh..." }
    ],
    "questions": [
      // Danh sách các khối Question (trắc nghiệm, đúng sai, điền khuyết)
    ]
  }
 
### 3. YÊU CẦU ĐẦU RA:
- CHỈ TRẢ VỀ một chuỗi JSON hợp lệ duy nhất khớp hoàn toàn với schema OML v2.0.
- Không bọc JSON trong bất kỳ câu chữ giao tiếp nào khác (Không ghi: 'Dưới đây là JSON...', 'Đây là kết quả nhận diện...').
- Không sử dụng các ký tự đặc biệt ngoài định dạng JSON tiêu chuẩn.
- QUY ĐỊNH BẮT BUỘC VỀ ĐỊNH DẠNG XUẤT (MINIFIED JSON):
  + Mọi dữ liệu JSON trả về BẮT BUỘC phải ở dạng nén (Minified JSON) trên một dòng duy nhất.
  + KHÔNG sử dụng ký tự xuống dòng (\\n), KHÔNG sử dụng dấu cách (spaces) hay khoảng tab để thụt lề thụ động (No indentation).
  + Việc này giúp tối ưu hóa số lượng token đầu ra và tăng tốc độ phản hồi của API. Chuỗi JSON phải dính liền nhau (Ví dụ: {"version":"2.0","info":{...},"content":[...]}).
  + KHÔNG bọc chuỗi bằng các ký tự \`\`\`json ở đầu và cuối. Chỉ xuất ra chuỗi ký tự JSON thuần túy để hệ thống có thể nhận diện lập tức.`;

  const parseOcrPage = (rawText: string, pageIndex: number): ParsedOcrPage => {
    const parseStartedAt = performance.now();
    const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const position = Number.parseInt(message.match(/position\s+(\d+)/i)?.[1] ?? '', 10);
      diagnostics.parseDiagnostics.push({ stage: 'ocr-json', rawText, error: message, position: Number.isFinite(position) ? position : null, rawBlockCount: 0, acceptedBlockCount: 0, rejectedBlockCount: 0 });
      throw error;
    }

    if (
      typeof parsed !== 'object'
      || parsed === null
      || !Array.isArray((parsed as { content?: unknown }).content)
    ) {
      const error = new Error(`AI trả về cấu trúc OML không hợp lệ tại trang ${pageIndex + 1}.`);
      diagnostics.parseDiagnostics.push({ stage: 'ocr-schema', rawText, error: error.message, position: null, rawBlockCount: 0, acceptedBlockCount: 0, rejectedBlockCount: 0 });
      throw error;
    }

    const rawContent = (parsed as { content: unknown[] }).content;
    const filterStartedAt = performance.now();
    const filterResult = filterValidOcrQuestions(rawContent);
    const { content: filteredContent, rejected } = filterResult;
    const rejectionCounts = rejected.reduce<Record<string, number>>((counts, block) => {
      counts[block.reason] = (counts[block.reason] ?? 0) + 1;
      return counts;
    }, {});
    const filterRuntime = {
      rawCount: rawContent.length,
      acceptedCount: filteredContent.length,
      rejectedCount: rejected.length,
      firstBlock: rawContent[0] ?? null,
      lastBlock: rawContent.at(-1) ?? null,
      firstRejected: rejected[0] ?? null,
      topRejections: Object.entries(rejectionCounts).sort((first, second) => second[1] - first[1]),
    };
    diagnostics.summary.rawBlocks += rawContent.length;
    diagnostics.summary.normalizedBlocks += rawContent.length;
    diagnostics.summary.parsedBlocks += rawContent.length;
    diagnostics.summary.filter1Before += rawContent.length;
    diagnostics.summary.filter1After += filteredContent.length;
    diagnostics.summary.questionGroupsDetected += filterResult.questionGroups.detected;
    diagnostics.summary.questionGroupsAccepted += filterResult.questionGroups.accepted;
    diagnostics.summary.questionGroupsRejected += filterResult.questionGroups.rejected;
    diagnostics.summary.questionsKeptFromGroups += filterResult.questionGroups.questionsKept;
    diagnostics.summary.questionsRemovedFromGroups += filterResult.questionGroups.questionsRemoved;
    diagnostics.rejectedBlocks.push(...rejected);
    diagnostics.parseDiagnostics.push({ stage: 'ocr-schema', rawText, error: '', position: null, rawBlockCount: rawContent.length, acceptedBlockCount: filteredContent.length, rejectedBlockCount: rejected.length });
    diagnostics.stages.push(
      { stage: 'Normalize', input: rawContent, output: rawContent, durationMs: 0, success: true },
      { stage: 'Parse', input: cleanJson, output: rawContent, durationMs: performance.now() - parseStartedAt, success: true },
      { stage: 'Filter #1', input: filterRuntime, output: filteredContent, durationMs: performance.now() - filterStartedAt, success: true },
    );
    const parsedInfo = (parsed as { info?: unknown }).info;
    return {
      info: typeof parsedInfo === 'object' && parsedInfo !== null
        ? parsedInfo as Partial<OmlInfo>
        : {},
      content: filteredContent,
    };
  };

  const ocrWholeDocument = async (pages: OcrPageData[], base64EncodeTimeMs: number | null): Promise<ParsedOcrPage> => {
    const requestBase64Bytes = pages.reduce((total, page) => total + page.base64Data.length, 0);
    diagnostics.requests.push({ provider: selectedProvider.id, model: selectedProvider.id === 'gemini' ? (providerOptions?.model ?? 'gemini-3.5-flash') : (aiModel ?? selectedProvider.id), endpoint: selectedProvider.id === 'gemini' ? `https://generativelanguage.googleapis.com/v1beta/models/${providerOptions?.model ?? 'gemini-3.5-flash'}:generateContent` : aiApiUrl, page: null, regionId: null, imageWidth: null, imageHeight: null, imageBytes: null, base64Bytes: requestBase64Bytes, mimeTypes: pages.map((page) => page.mimeType) });
    if (selectedProvider.id === 'gemini' || selectedProvider.id === 'zhipu') {
      const uploadStart = performance.timeOrigin + performance.now();
      const requestStartedAt = performance.now();
      try {
        const result = await selectedProvider.process({ prompt, images: pages });
        diagnostics.requestCount += 1;
        diagnostics.rawResponses.push(result.rawResponse);
        diagnostics.http.push(result.http);
        diagnostics.providerResponses.push(result.responseMetadata);
        diagnostics.adapterDiagnostics.push(result.adapter);
        diagnostics.stages.push({ stage: 'OCR Response', input: { provider: result.provider, model: result.model, imageCount: pages.length }, output: result.rawResponse, durationMs: performance.now() - requestStartedAt, success: true });
        const parseStartedAt = performance.now();
        const parsed = parseOcrPage(result.text, 0);
        onRequestMeasurement?.({ base64Bytes: pages.reduce((total, page) => total + page.base64Data.length, 0), base64EncodeTimeMs, uploadStart, uploadEnd: null, uploadDurationMs: null, providerStart: null, providerEnd: null, providerDurationMs: null, downloadDurationMs: null, responseParseTimeMs: performance.now() - parseStartedAt, success: true, responseHeadersAt: performance.timeOrigin + performance.now(), timeToFirstByteMs: null });
        return parsed;
      } catch (error) {
        recordProviderFailure(error);
        onRequestMeasurement?.({ base64Bytes: pages.reduce((total, page) => total + page.base64Data.length, 0), base64EncodeTimeMs, uploadStart, uploadEnd: null, uploadDurationMs: null, providerStart: null, providerEnd: null, providerDurationMs: null, downloadDurationMs: null, responseParseTimeMs: null, success: false, responseHeadersAt: null, timeToFirstByteMs: null });
        failWithDiagnostics(error instanceof Error ? error.message : String(error), error);
      }
    }
    const isResponsesApi = /\/responses(?:\?|$)/i.test(aiApiUrl);
    const imageParts = pages.map((pageData) => {
      const base64String = pageData.base64Data.replace(/^data:[^,]+,/, '');
      return {
        type: isResponsesApi ? 'input_image' as const : 'image_url' as const,
        ...(isResponsesApi
          ? { image_url: `data:${pageData.mimeType};base64,${base64String}` }
          : { image_url: { url: `data:${pageData.mimeType};base64,${base64String}` } }),
      };
    });
    const requestContent = isResponsesApi
      ? [{ type: 'input_text' as const, text: `${prompt}\n\nBạn là chuyên gia OCR đề thi. Hãy bóc tách toàn bộ các ảnh trang được đính kèm thành một định dạng OML JSON sạch, giữ đúng thứ tự câu hỏi giữa các trang. Chỉ trả về chuỗi JSON thuần.` }, ...imageParts]
      : [{ type: 'text' as const, text: `${prompt}\n\nBạn là chuyên gia OCR đề thi. Hãy bóc tách toàn bộ các ảnh trang được đính kèm thành một định dạng OML JSON sạch, giữ đúng thứ tự câu hỏi giữa các trang. Chỉ trả về chuỗi JSON thuần, không bọc trong markdown, không kèm lời giải thích.` }, ...imageParts];
    const uploadStart = performance.timeOrigin + performance.now();
    const requestStartedAt = performance.now();
    let responseHeadersAt: number | null = null;
    let legacyHttpRecorded = false;
    try {
      const response = await fetch(aiApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${aiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: aiModel,
          ...(isResponsesApi ? { input: [{ role: 'user', content: requestContent }] } : { messages: [{ role: 'user', content: requestContent }] }),
          ...(isResponsesApi
            ? { text: { format: { type: 'json_object' } } }
            : { response_format: { type: 'json_object' } }),
        }),
      });
      responseHeadersAt = performance.timeOrigin + performance.now();

      const responseTextStartedAt = performance.now();
      const responseText = await response.text();
      const downloadDurationMs = performance.now() - responseTextStartedAt;
      diagnostics.requestCount += 1;
      diagnostics.rawResponses.push(responseText);
      const responseHeaders = Object.fromEntries(response.headers.entries());
      diagnostics.http.push({ provider: selectedProvider.id, model: aiModel ?? selectedProvider.id, endpoint: aiApiUrl, status: response.status, statusText: response.statusText, headers: responseHeaders, rawBody: responseText, responseBytes: new TextEncoder().encode(responseText).byteLength });
      legacyHttpRecorded = true;
      diagnostics.stages.push({ stage: 'OCR Response', input: { imageCount: pages.length }, output: responseText, durationMs: performance.now() - requestStartedAt, success: response.ok });
      if (!response.ok) throw new Error(`Azure Qwen error: ${response.status} ${response.statusText} - ${responseText}`);

      const parseStartedAt = performance.now();
      let responseBody: {
        choices?: Array<{ message?: { content?: string } }>;
        output_text?: string;
        output?: Array<{ content?: Array<{ text?: string }> }>;
        usage?: unknown;
        id?: unknown;
        model?: unknown;
      };
      try {
        responseBody = JSON.parse(responseText) as typeof responseBody;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const position = Number.parseInt(message.match(/position\s+(\d+)/i)?.[1] ?? '', 10);
        diagnostics.parseDiagnostics.push({ stage: 'provider-json', rawText: responseText, error: message, position: Number.isFinite(position) ? position : null, rawBlockCount: 0, acceptedBlockCount: 0, rejectedBlockCount: 0 });
        throw error;
      }
      diagnostics.providerResponses.push({ provider: selectedProvider.id, model: aiModel ?? selectedProvider.id, responseId: typeof responseBody.id === 'string' ? responseBody.id : null, modelVersion: typeof responseBody.model === 'string' ? responseBody.model : null, finishReason: null, candidateCount: Array.isArray(responseBody.choices) ? responseBody.choices.length : 0, partsCount: Array.isArray(responseBody.output) ? responseBody.output.reduce((count, item) => count + (item.content?.length ?? 0), 0) : 0, blockReason: null, safetyRatings: null, promptFeedback: null, usageMetadata: responseBody.usage ?? null });
      const rawText = responseBody.output_text
        || responseBody.output?.flatMap((item) => item.content || []).map((item) => item.text || '').join('')
        || responseBody.choices?.[0]?.message?.content
        || '';
      const parsed = parseOcrPage(rawText, 0);
      onRequestMeasurement?.({
        base64Bytes: pages.reduce((total, page) => total + page.base64Data.length, 0),
        base64EncodeTimeMs,
        uploadStart,
        uploadEnd: null,
        uploadDurationMs: null,
        providerStart: null,
        providerEnd: null,
        providerDurationMs: null,
        downloadDurationMs,
        responseParseTimeMs: performance.now() - parseStartedAt,
        success: true,
        responseHeadersAt,
        timeToFirstByteMs: responseHeadersAt - uploadStart,
      });
      return parsed;
    } catch (error) {
      if (!legacyHttpRecorded) {
        const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        diagnostics.http.push({ provider: selectedProvider.id, model: aiModel ?? selectedProvider.id, endpoint: aiApiUrl, status: 0, statusText: message, headers: {}, rawBody: '', responseBytes: 0 });
      }
      onRequestMeasurement?.({ base64Bytes: pages.reduce((total, page) => total + page.base64Data.length, 0), base64EncodeTimeMs, uploadStart, uploadEnd: null, uploadDurationMs: null, providerStart: null, providerEnd: null, providerDurationMs: null, downloadDurationMs: null, responseParseTimeMs: null, success: false, responseHeadersAt, timeToFirstByteMs: responseHeadersAt === null ? null : responseHeadersAt - uploadStart });
      if (error instanceof OcrDiagnosticError) throw error;
      failWithDiagnostics(error instanceof Error ? error.message : String(error), error);
    }
  };

  const renderPdfPage = async (pageNumber: number): Promise<OcrPageData> => {
    if (!pdf) throw new Error('PDF document is unavailable.');
    const page = await pdf.getPage(pageNumber);
    const canvas = document.createElement('canvas');
    try {
      const viewport = page.getViewport({ scale: 1.5 });
      const context = canvas.getContext('2d');
      if (!context) throw new Error(`Không thể tạo canvas cho trang ${pageNumber}.`);
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      const base64Data = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
      if (!base64Data) throw new Error(`Không thể mã hóa trang ${pageNumber}.`);
      return { base64Data, mimeType: 'image/jpeg' };
    } finally {
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
    }
  };

  const pagesResults: OcrPageResult[] = [];
  try {
    const totalPages = isPdf ? pdfPageCount : 1;
    const batchSize = pdfPageCount > 100 ? 10 : 4;
    for (let batchStart = 0; batchStart < totalPages; batchStart += batchSize) {
      const pageCount = Math.min(batchSize, totalPages - batchStart);
      const batch: OcrPageData[] = [];
      let base64EncodeTimeMs: number | null = null;
      if (isPdf) {
        for (let offset = 0; offset < pageCount; offset += 1) {
          batch.push(await renderPdfPage(batchStart + offset + 1));
        }
      } else {
        const base64StartedAt = performance.now();
        batch.push({ base64Data: await fileToBase64(sourceFile), mimeType: sourceFile.type || 'image/jpeg' });
        memoryTelemetry?.recordBase64Peak(batch.reduce((total, page) => total + (page.base64Data.length * 2), 0));
        base64EncodeTimeMs = performance.now() - base64StartedAt;
      }
      if (onProgress) onProgress(`Đang phân tích nhóm trang ${batchStart + 1}-${batchStart + batch.length}/${totalPages}...`);
      memoryTelemetry?.recordBase64Peak(batch.reduce((total, page) => total + (page.base64Data.length * 2), 0));

      try {
        pagesResults.push({ pageIndex: batchStart, page: await ocrWholeDocument(batch, base64EncodeTimeMs) });
      } catch (error: unknown) {
        const batchError = error instanceof Error ? error : new Error(String(error));
        console.error(`Thất bại tại nhóm trang ${batchStart + 1}-${batchStart + batch.length}:`, batchError);
        pagesResults.push({ pageIndex: batchStart, error: batchError });
      }
      batch.length = 0;
    }
  } catch (error: unknown) {
    failWithDiagnostics(`Không thể hoàn tất nhận diện toàn bộ tài liệu: ${error instanceof Error ? error.message : String(error)}`, error);
  } finally {
    if (pdf !== undefined) await pdf.cleanup();
    if (loadingTask !== undefined) await loadingTask.destroy();
  }

  if (onProgress) onProgress('Đang tổng hợp kết quả nhận diện...');

  const orderedPageResults = [...pagesResults].sort((a, b) => a.pageIndex - b.pageIndex);
  const failedPages = orderedPageResults.filter((result) => result.error);
  const successfulPages = orderedPageResults.filter((result): result is OcrPageResult & { page: ParsedOcrPage } => Boolean(result.page));

  if (failedPages.length > 0) {
    const failedPageNumbers = failedPages.map((result) => result.pageIndex + 1).join(', ');
    diagnostics.failedPages = failedPages.map((result) => result.pageIndex + 1);
    if (shouldAbortOnOcrFailure(pipelineMode, failedPages.length)) {
      failWithDiagnostics(
        `Azure Qwen không thể xử lý một hoặc nhiều trang. Không tạo đề thi thiếu câu. Các trang lỗi: ${failedPageNumbers}.`,
        failedPages[0].error,
      );
    }
  }

  if (successfulPages.length === 0) {
    failWithDiagnostics('Không thể nhận diện bất kỳ trang nào trong tài liệu. Vui lòng thử lại.');
  }

  const firstPageInfo = successfulPages.find((result) => result.page.info.title)?.page.info;
  const mergedInfo: OmlInfo = {
    title: firstPageInfo?.title || 'Đề thi nhận diện OCR',
    ...firstPageInfo,
  };
  const mergeInput = successfulPages.flatMap((result) => result.page.content);
  diagnostics.summary.mergeBefore = mergeInput.length;
  diagnostics.summary.mergeAfter = mergeInput.length;
  diagnostics.stages.push({ stage: 'Merge', input: mergeInput, output: mergeInput, durationMs: 0, success: true });
  const filter2StartedAt = performance.now();
  const filter2Result = filterValidOcrQuestions(mergeInput);
  const { content: filter2Content } = filter2Result;
  diagnostics.summary.filter2Before = mergeInput.length;
  diagnostics.summary.filter2After = filter2Content.length;
  diagnostics.rejectedBlocks.push(...filter2Result.rejected);
  diagnostics.stages.push({ stage: 'Filter #2', input: mergeInput, output: filter2Content, durationMs: performance.now() - filter2StartedAt, success: true });
  const mergedContent = filter2Content
    .map((block, originalIndex) => ({
      block,
      originalIndex,
      questionOrder: getOcrBlockOrder(block),
    }))
    .sort((first, second) => {
      if (first.questionOrder === null || second.questionOrder === null) {
        return first.originalIndex - second.originalIndex;
      }

      return first.questionOrder - second.questionOrder || first.originalIndex - second.originalIndex;
    })
    .map(({ block }) => block);
  diagnostics.summary.mergedContentLength = mergedContent.length;

  if (mergedContent.length === 0) {
    const filterStage = diagnostics.stages.find((stage) => stage.stage === 'Filter #1');
    console.error('OCR runtime filter diagnostics:', filterStage?.input);
    failWithDiagnostics('Không tìm thấy câu hỏi có cấu trúc hợp lệ sau khi lọc dữ liệu OCR.');
  }

  const finalOml: OmlDocumentV2 = {
    version: '2.0',
    info: mergedInfo,
    content: mergedContent,
  };
  let questionDocument: QuestionDocument;
  try {
    // The legacy OCR provider still returns OML-shaped JSON. Normalize it through
    // the canonical Question Object before compiling the renderer output.
    questionDocument = omlToQuestionDocument(finalOml);
  } catch (error) {
    diagnostics.stages.push({ stage: 'Question Object', input: finalOml, output: null, durationMs: 0, success: false });
    failWithDiagnostics('Không thể chuyển OML OCR sang Question Object.', error);
  }
  diagnostics.summary.questionCount = mergedContent.reduce((total, block) => (
    total + (block.type === 'question' ? 1 : block.type === 'question-group' ? block.questions.length : 0)
  ), 0);
  diagnostics.summary.omlBlocks = finalOml.content.length;
  diagnostics.stages.push(
    { stage: 'Question Object', input: finalOml, output: questionDocument, durationMs: 0, success: true },
    { stage: 'OML', input: questionDocument, output: finalOml, durationMs: 0, success: true },
  );
  emitDiagnostics();
  return questionDocument;
}

/** Public compatibility entry point used by the existing Teacher Studio UI. */
export const parseFileToOml = async (
  file: File,
  onProgress?: (statusText: string) => void,
): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const isGlmOcrFile = extension === 'pdf'
    || extension === 'png'
    || extension === 'jpg'
    || extension === 'jpeg'
    || file.type === 'application/pdf'
    || file.type === 'image/png'
    || file.type === 'image/jpeg';

  if (isGlmOcrFile) {
    onProgress?.('Đang nhận diện tài liệu bằng GLM OCR...');
    const omlJson = await parseFileWithGlmOcr(
      file,
      () => onProgress?.('Đang chuyển Markdown sang OML...'),
    );
    return omlJson;
  }

  const { DocumentPipelineDispatcher } = await import('../document/pipeline/documentPipelineDispatcher');
  const result = await new DocumentPipelineDispatcher().dispatch(file, onProgress);
  return JSON.stringify(questionDocumentToOml(result.document), null, 2);
};
