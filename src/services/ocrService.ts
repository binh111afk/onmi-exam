declare const process: {
  env: {
    NEXT_PUBLIC_ILOVEPDF_PUBLIC_KEY?: string;
  };
};

const ILOVEPDF_API_URL = 'https://api.ilovepdf.com/v1';
const ILOVEPDF_POLL_INTERVAL_MS = 500;
const ILOVEPDF_MAX_POLL_ATTEMPTS = 120;

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

export const parseFileToOml = async (file: File): Promise<string> => {
  const isDocx = file.name.toLowerCase().endsWith('.docx');
  const sourceFile: Blob = isDocx ? await convertDocxToPdf(file) : file;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash';

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    throw new Error('Vui lòng cấu hình VITE_GEMINI_API_KEY trong file .env trước khi thực hiện nhận diện.');
  }

  const base64Data = await fileToBase64(sourceFile);
  const mimeType = isDocx ? 'application/pdf' : file.type || 'application/pdf';

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

Các khối (blocks) được phép nằm trong mảng "content":
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.statusText} - ${errText}`);
  }

  const resJson = await response.json();
  const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
};
