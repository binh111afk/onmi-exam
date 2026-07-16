import type { OmlContentBlock, OmlDocumentV2, OmlInfo } from '../../../types/oml';

export interface OmlValidationError {
  type: 'syntax' | 'schema';
  message: string;
  line?: number;
  column?: number;
  path?: string;
  detail?: string;
}

export interface OmlParseResult {
  success: boolean;
  data: OmlDocumentV2 | null;
  errors: OmlValidationError[];
  warnings: string[];
  metadata: {
    title: string;
    subject: string;
    grade: number | string;
    time: number;
    questionCount: number;
    version: string;
  };
}

export const translateJsonError = (msg: string): string => {
  const lower = msg.toLowerCase();
  
  if (lower.includes("expected ',' or '}' after property value")) {
    return "Thiếu dấu phẩy ',' hoặc dấu đóng ngoặc nhọn '}' sau giá trị thuộc tính.";
  }
  if (lower.includes('expected double-quoted property name')) {
    return 'Tên thuộc tính (Key) trong cấu trúc JSON bắt buộc phải được bao bởi dấu ngoặc kép đôi ".';
  }
  if (lower.includes('unexpected end of json input') || lower.includes('unexpected end of input')) {
    return 'Dữ liệu JSON chưa được đóng ngoặc đầy đủ hoặc bị ngắt quãng giữa chừng.';
  }
  if (lower.includes('unexpected token') || lower.includes('unexpected identifier')) {
    return 'Ký tự không hợp lệ hoặc không đúng vị trí cấu trúc JSON.';
  }
  if (lower.includes('unexpected string')) {
    return 'Chuỗi ký tự đặt sai vị trí. Có thể bạn đã quên dấu phẩy "," phân tách giữa các trường.';
  }
  if (lower.includes('unexpected number')) {
    return 'Số đặt sai vị trí. Có thể bạn đã quên dấu phẩy "," phân tách giữa các trường.';
  }
  if (lower.includes('unterminated string')) {
    return 'Chuỗi ký tự chưa được đóng. Có thể thiếu dấu nháy kép " ở cuối chuỗi.';
  }
  return `Lỗi phân tích cú pháp JSON: ${msg}`;
};

export const parseErrorLocation = (error: Error, json: string): { line: number; column: number } => {
  // Check for native Firefox properties
  if ('lineNumber' in error && typeof (error as any).lineNumber === 'number') {
    return {
      line: (error as any).lineNumber,
      column: typeof (error as any).columnNumber === 'number' ? (error as any).columnNumber : 1,
    };
  }

  const message = error.message;
  
  // Match "line X column Y" or "line X, column Y" or "(line X column Y)"
  const lineColMatch = message.match(/line\s+(\d+).*?col(?:umn)?\s+(\d+)/i);
  if (lineColMatch) {
    return {
      line: parseInt(lineColMatch[1], 10),
      column: parseInt(lineColMatch[2], 10),
    };
  }

  // Match position index: "at position X"
  const posMatch = message.match(/at position (\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    const textBefore = json.slice(0, pos);
    const lines = textBefore.split(/\r?\n/);
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  return { line: 1, column: 1 };
};

const validateQuestionBlock = (block: any, path: string, errors: OmlValidationError[], label: string | number) => {
  if (block.id === undefined || block.id === '') {
    errors.push({
      type: 'schema',
      message: `Câu hỏi số ${label} thiếu thuộc tính định danh "id".`,
      path: `${path}.id`,
    });
  }

  if (!block.question || typeof block.question !== 'string') {
    errors.push({
      type: 'schema',
      message: `Câu hỏi số ${label} (ID: ${block.id || 'không rõ'}) thiếu trường nội dung câu hỏi "question".`,
      path: `${path}.question`,
    });
  }

  const subType = block.subType ?? 'choice';
  if (subType !== 'fill-blank') {
    if (!block.options || !Array.isArray(block.options)) {
      errors.push({
        type: 'schema',
        message: `Câu hỏi số ${label} (ID: ${block.id || 'không rõ'}) thiếu danh sách các lựa chọn "options".`,
        path: `${path}.options`,
      });
    }
  }

  if (!block.answer || !Array.isArray(block.answer)) {
    errors.push({
      type: 'schema',
      message: `Câu hỏi số ${label} (ID: ${block.id || 'không rõ'}) thiếu đáp án "answer" (phải là một mảng).`,
      path: `${path}.answer`,
    });
  }
};

export const validateOmlSchema = (data: any): OmlValidationError[] => {
  const errors: OmlValidationError[] = [];

  if (typeof data !== 'object' || data === null) {
    errors.push({
      type: 'schema',
      message: 'Dữ liệu gốc phải là một đối tượng JSON.',
      path: 'root',
    });
    return errors;
  }

  // 1. Check version
  if (data.version && data.version !== '2.0' && data.version !== '1.0') {
    errors.push({
      type: 'schema',
      message: `Phiên bản OML không được hỗ trợ (chỉ chấp nhận "1.0" hoặc "2.0"). Nhận được: "${data.version}".`,
      path: 'root.version',
    });
  }

  // 2. Check info
  if (!data.info) {
    errors.push({
      type: 'schema',
      message: 'Thiếu trường thông tin chung "info".',
      path: 'root.info',
    });
  } else if (typeof data.info !== 'object') {
    errors.push({
      type: 'schema',
      message: 'Trường "info" phải là một đối tượng JSON.',
      path: 'root.info',
    });
  } else {
    if (!data.info.title || typeof data.info.title !== 'string') {
      errors.push({
        type: 'schema',
        message: 'Thiếu trường tiêu đề đề thi "title" trong "info".',
        path: 'root.info.title',
      });
    }
  }

  // 3. Check content
  if (!data.content && !data.questions) {
    errors.push({
      type: 'schema',
      message: 'Thiếu trường danh sách nội dung đề thi "content".',
      path: 'root.content',
    });
  } else {
    const content = data.content ?? data.questions;
    if (!Array.isArray(content)) {
      errors.push({
        type: 'schema',
        message: 'Trường "content" phải là một mảng các block.',
        path: 'root.content',
      });
    } else {
      content.forEach((block: any, idx: number) => {
        if (typeof block !== 'object' || block === null) {
          errors.push({
            type: 'schema',
            message: `Block số ${idx + 1} phải là một đối tượng JSON hợp lệ.`,
            path: `root.content[${idx}]`,
          });
          return;
        }

        if (!block.type || typeof block.type !== 'string') {
          errors.push({
            type: 'schema',
            message: `Block số ${idx + 1} thiếu trường phân loại "type".`,
            path: `root.content[${idx}].type`,
          });
          return;
        }

        // Validate type details
        if (block.type === 'question') {
          validateQuestionBlock(block, `root.content[${idx}]`, errors, idx + 1);
        } else if (block.type === 'question-group') {
          if (block.id === undefined || block.id === '') {
            errors.push({
              type: 'schema',
              message: `Nhóm câu hỏi số ${idx + 1} thiếu trường định danh "id".`,
              path: `root.content[${idx}].id`,
            });
          }
          if (!block.context || !Array.isArray(block.context)) {
            errors.push({
              type: 'schema',
              message: `Nhóm câu hỏi số ${idx + 1} (ID: ${block.id || 'không rõ'}) thiếu trường ngữ liệu "context".`,
              path: `root.content[${idx}].context`,
            });
          }
          if (!block.questions || !Array.isArray(block.questions)) {
            errors.push({
              type: 'schema',
              message: `Nhóm câu hỏi số ${idx + 1} (ID: ${block.id || 'không rõ'}) thiếu danh sách câu hỏi con "questions".`,
              path: `root.content[${idx}].questions`,
            });
          } else {
            block.questions.forEach((q: any, qIdx: number) => {
              validateQuestionBlock(q, `root.content[${idx}].questions[${qIdx}]`, errors, `${idx + 1}.${qIdx + 1}`);
            });
          }
        }
      });
    }
  }

  return errors;
};

const collectQuestionBlocksCount = (blocks: OmlContentBlock[]): number => {
  let count = 0;
  blocks.forEach((block) => {
    if (block?.type === 'question') {
      count++;
    } else if (block?.type === 'question-group') {
      count += (block as any).questions?.length ?? 0;
    }
  });
  return count;
};

export const parseOML = (jsonCode: string): OmlParseResult => {
  const errors: OmlValidationError[] = [];
  const warnings: string[] = [];
  let parsedData: any = null;
  let success = false;

  // Step 1: JSON Syntax Check
  try {
    parsedData = JSON.parse(jsonCode);
    success = true;
  } catch (e: any) {
    const loc = parseErrorLocation(e, jsonCode);
    const translatedMessage = translateJsonError(e.message);
    errors.push({
      type: 'syntax',
      message: translatedMessage,
      detail: e.message,
      line: loc.line,
      column: loc.column,
    });
  }

  // Step 2: Schema validation (only if JSON syntax is correct)
  if (success && parsedData) {
    const schemaErrors = validateOmlSchema(parsedData);
    if (schemaErrors.length > 0) {
      errors.push(...schemaErrors);
      success = false;
    }
  }

  // Build metadata
  const infoMeta: OmlInfo = parsedData?.info ?? {
    title: 'Đề thi chưa có tiêu đề',
    subject: 'Không rõ',
    grade: 10,
    time: 45,
  };
  const omlBlocks: OmlContentBlock[] = parsedData?.content ?? [];
  const questionCount = parsedData ? (omlBlocks.length > 0 ? collectQuestionBlocksCount(omlBlocks) : (parsedData.questions?.length ?? 0)) : 0;

  return {
    success,
    data: success ? parsedData : null,
    errors,
    warnings,
    metadata: {
      title: infoMeta.title,
      subject: infoMeta.subject ?? 'Không rõ',
      grade: infoMeta.grade ?? 10,
      time: infoMeta.time ?? 45,
      questionCount,
      version: parsedData?.version ?? '2.0',
    },
  };
};
