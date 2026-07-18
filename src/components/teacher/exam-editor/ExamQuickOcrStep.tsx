import React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import { parseOML } from '../../ExamEditor/OmlRenderer/parser';
import { OmlPreviewPaper } from '../../ExamEditor/OmlRenderer/OmlPreviewPaper';
import { parseFileToOml } from '../../../services/ocrService';
import type { OmlQuestionBlock } from '../../../types/oml';
import {
  File,
  X,
  ChevronRight,
  Sparkles,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  RefreshCw,
  AlignLeft,
  Upload,
  CheckCircle2
} from 'lucide-react';

interface ExamQuickOcrStepProps {
  quickStep: 1 | 2;
  setQuickStep: React.Dispatch<React.SetStateAction<1 | 2>>;
  isOcrLoading: boolean;
  setIsOcrLoading: React.Dispatch<React.SetStateAction<boolean>>;
  uploadedFile: { name: string; size: string; file?: File } | null;
  setUploadedFile: React.Dispatch<React.SetStateAction<{ name: string; size: string; file?: File } | null>>;
  examJsonCode: string;
  setExamJsonCode: (code: string) => void;
  isJsonInvalid: boolean;
  showLeftSidebar: boolean;
  setShowLeftSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  showLivePreview: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  jsonFileInputRef: React.RefObject<HTMLInputElement | null>;
  quickLineNumbersRef: React.RefObject<HTMLDivElement | null>;
  quickTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleJsonUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleQuickScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  renderExamPreviewColumn: (title?: string) => React.ReactNode;
  onApplyOcrCode: (code: string) => void;
}

const isOmlQuestionBlock = (block: unknown): block is OmlQuestionBlock => (
  typeof block === 'object'
  && block !== null
  && (block as { type?: unknown }).type === 'question'
  && 'id' in block
  && 'question' in block
  && 'answer' in block
);

export const ExamQuickOcrStep: React.FC<ExamQuickOcrStepProps> = ({
  quickStep,
  setQuickStep,
  isOcrLoading,
  setIsOcrLoading,
  uploadedFile,
  setUploadedFile,
  examJsonCode,
  setExamJsonCode,
  isJsonInvalid,
  showLeftSidebar,
  setShowLeftSidebar,
  showLivePreview,
  fileInputRef,
  jsonFileInputRef,
  quickLineNumbersRef,
  quickTextareaRef,
  handleFileChange,
  handleDragOver,
  handleDrop,
  handleJsonUpload,
  handleQuickScroll,
  renderExamPreviewColumn,
  onApplyOcrCode,
}) => {
  const [localJsonCode, setLocalJsonCode] = React.useState(examJsonCode);
  const [isTempOcrMode, setIsTempOcrMode] = React.useState(false);

  const codeLines = localJsonCode.split('\n');
  const quickPreRef = React.useRef<HTMLPreElement>(null);
  const [ocrError, setOcrError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isTempOcrMode) {
      setLocalJsonCode(examJsonCode);
    }
  }, [examJsonCode, isTempOcrMode]);

  React.useEffect(() => {
    if (quickStep === 2 && examJsonCode) {
      setIsTempOcrMode(true);
    }
  }, [examJsonCode, quickStep]);

  const handleOcrSuccess = (newCode: string) => {
    setExamJsonCode(newCode);
    setLocalJsonCode(newCode);
    setIsTempOcrMode(true);
  };

  const runOcrParsing = async (fileToParse?: File): Promise<boolean> => {
    setIsOcrLoading(true);
    setOcrError(null);
    try {
      if (fileToParse) {
        const omlJson = await parseFileToOml(fileToParse);
        if (omlJson) {
          handleOcrSuccess(omlJson);
          return true;
        }
        throw new Error('API trả về kết quả rỗng.');
      }
      throw new Error('Không tìm thấy file để nhận diện OCR.');
    } catch (err: any) {
      console.error('OCR Parsing failed:', err);
      setOcrError(err.message || String(err));
      return false;
    } finally {
      setIsOcrLoading(false);
    }
  };

  const highlightedCode = React.useMemo(() => {
    if (!localJsonCode) return '';
    try {
      let html = Prism.highlight(localJsonCode, Prism.languages.json, 'json');
      html = html.replace(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g, (match) => {
        return `<span class="token-latex">${match}</span>`;
      });
      return html;
    } catch (e) {
      return localJsonCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [localJsonCode]);

  const ocrQuestionStats = React.useMemo(() => {
    const parsed = parseOML(localJsonCode);
    const questions: OmlQuestionBlock[] = [];

    for (const block of parsed.data?.content ?? []) {
      if (isOmlQuestionBlock(block)) {
        questions.push(block);
      } else if (block.type === 'question-group' && 'questions' in block && Array.isArray(block.questions)) {
        questions.push(...block.questions.filter(isOmlQuestionBlock));
      }
    }
    const multipleChoiceCount = questions.filter((question) => (
      question.subType === 'choice' || question.subType === 'true-false'
    )).length;

    return {
      total: questions.length,
      multipleChoice: multipleChoiceCount,
      essay: questions.length - multipleChoiceCount,
    };
  }, [localJsonCode]);

  const handleQuickHorizontalScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (quickPreRef.current) {
      quickPreRef.current.scrollLeft = e.currentTarget.scrollLeft;
      quickPreRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (quickLineNumbersRef.current) {
      quickLineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  if (quickStep === 1) {
    return (
      <div className="flex-1 p-6 overflow-y-auto flex flex-col md:flex-row gap-6 bg-[#F8FAFC] animate-fadeIn relative">
        {/* Simulated OCR loading overlay */}
        {isOcrLoading && (
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-30 flex items-center justify-center animate-fadeIn">
            <div className="bg-white px-8 py-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-3">
              <RefreshCw size={24} className="text-[#6C5DD3] animate-spin" />
              <span className="text-xs font-black text-slate-700">Đang chạy nhận diện OCR...</span>
            </div>
          </div>
        )}

        {/* OCR Error popup modal */}
        {ocrError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
            <div
              className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setOcrError(null)}
            />
            <div className="bg-white rounded-3xl w-full max-w-[420px] p-6 shadow-2xl relative overflow-hidden flex flex-col z-[101] border border-slate-100 animate-scaleUp text-center space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm">
                <X size={24} className="stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                  Lỗi nhận diện OCR
                </h3>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  Đã xảy ra lỗi trong quá trình gửi yêu cầu nhận diện đến Gemini API.
                </p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-left font-mono text-[9px] text-red-650 max-h-[120px] overflow-y-auto mt-2">
                  {ocrError}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setOcrError(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Left Column */}
        <div className="flex-[3] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[480px]">
          <div className="space-y-6">
            <h2 className="text-xs font-black text-[#1E293B] uppercase tracking-wider">
              BƯỚC 1: TẢI FILE ĐỀ THI
            </h2>

            {uploadedFile ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 border border-emerald-100 bg-emerald-50/10 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-655 flex flex-col items-center justify-center text-[9px] font-black font-sans shrink-0">
                      <File size={16} className="stroke-[2.5]" />
                      <span className="-mt-0.5">PDF</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-text-primary truncate max-w-[200px] sm:max-w-md">
                        {uploadedFile.name}
                      </h4>
                      <p className="text-[9px] text-[#7E8B9B] font-bold mt-0.5">
                        {uploadedFile.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <CheckCircle2 size={14} className="stroke-[2.5]" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                      }}
                      className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-655 rounded-lg transition cursor-pointer"
                    >
                      <X size={14} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    const success = await runOcrParsing(uploadedFile.file);
                    if (success) {
                      setQuickStep(2);
                    }
                  }}
                  className="w-full py-2.5 bg-[#6C5DD3] hover:bg-[#5a4db8] text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-150 font-sans disabled:opacity-50"
                  disabled={isOcrLoading}
                >
                  {isOcrLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Đang nhận diện...
                    </>
                  ) : (
                    <>
                      Nhận diện OCR <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-100 hover:border-primary/45 rounded-2xl p-12 flex flex-col items-center justify-center bg-slate-50/20 hover:bg-primary-light/10 transition cursor-pointer group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.pptx,.png,.jpg,.jpeg"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-primary flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm shadow-indigo-100/50">
                  <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="m9 15 3-3 3 3" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-800 text-center">
                  Kéo và thả file đề thi vào đây
                </p>
                <p className="text-[10px] text-slate-400 font-bold text-center mt-1">
                  hoặc
                </p>
                <span className="mt-2.5 px-6 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer shadow-sm">
                  Chọn file từ máy tính
                </span>
                <p className="text-[10px] text-slate-400 font-bold text-center mt-3">
                  Hỗ trợ: PDF, DOCX, DOC, PPTX, PNG, JPG (Dưới 50MB)
                </p>
              </div>
            )}
          </div>

          {/* Sparkle callout */}
          <div className="p-4 border border-[#ECE9FE] bg-[#F5F3FF]/70 rounded-2xl flex gap-3 items-center mt-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md shadow-indigo-100/30 shrink-0 text-primary">
              <Sparkles size={14} className="text-primary-hover" />
            </div>
            <div className="text-xs leading-relaxed text-slate-655 font-medium font-sans">
              <span className="font-bold text-[#1E293B]">Hệ thống sẽ tự động nhận diện nội dung (OCR) và chuyển đổi thành cấu trúc đề thi.</span>
              <p className="text-[10px] text-slate-400 font-bold">Đảm bảo file rõ nét để nhận diện chính xác hơn.</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-[2] bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-4">
              HƯỚNG DẪN
            </h2>
            <ol className="space-y-3 text-xs text-slate-555 font-bold list-decimal pl-4 leading-relaxed font-sans">
              <li>Tải lên file đề thi của bạn (PDF, DOCX, DOC, ảnh rõ nét).</li>
              <li>Hệ thống sẽ tự động nhận diện nội dung bằng OCR.</li>
              <li>Kiểm tra và chỉnh sửa lại cấu trúc đề nếu cần.</li>
              <li>Lưu và chuyển sang bước cấu hình đề thi.</li>
            </ol>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-3">
              MẸO:
            </h3>
            <ul className="space-y-2 text-xs text-slate-555 font-bold list-disc pl-4 leading-relaxed font-sans">
              <li>File PDF text hoặc DOCX sẽ cho kết quả tốt nhất.</li>
              <li>Ảnh chụp đề thi nên rõ nét, không bị nghiêng.</li>
              <li>Kiểm tra kỹ các câu hỏi sau khi hệ thống nhận diện.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Hiệu chỉnh kết quả nhận diện (3-column layout)
  return (
    <div className="flex-1 flex overflow-hidden bg-white border-t border-slate-200 animate-fadeIn relative select-text">
      {/* Simulated OCR loading overlay */}
      {isOcrLoading && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-30 flex items-center justify-center animate-fadeIn">
          <div className="bg-white px-8 py-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-3">
            <RefreshCw size={24} className="text-[#6C5DD3] animate-spin" />
            <span className="text-xs font-black text-slate-700">Đang chạy nhận diện OCR...</span>
          </div>
        </div>
      )}

      {/* OCR Error popup modal */}
      {ocrError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setOcrError(null)}
          />
          <div className="bg-white rounded-3xl w-full max-w-[420px] p-6 shadow-2xl relative overflow-hidden flex flex-col z-[101] border border-slate-100 animate-scaleUp text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm">
              <X size={24} className="stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                Lỗi nhận diện OCR
              </h3>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Đã xảy ra lỗi trong quá trình gửi yêu cầu nhận diện đến Gemini API.
              </p>
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-left font-mono text-[9px] text-red-650 max-h-[120px] overflow-y-auto mt-2">
                {ocrError}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setOcrError(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COLUMN 1: File Info & OCR summary (≈22%) */}
      <div className={`${showLeftSidebar ? 'w-[22%] border-r' : 'w-0 border-none'} bg-slate-50/30 border-slate-200 flex flex-col justify-between shrink-0 overflow-y-auto relative transition-all duration-300`}>
        <div className={`${showLeftSidebar ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
          {/* Header */}
          <div className="h-11 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-slate-50/50">
            <span className="text-[10px] font-black text-slate-700 tracking-wider">FILE ĐÃ TẢI</span>
            <button
              onClick={() => setShowLeftSidebar(false)}
              className="p-1 hover:bg-slate-200 text-slate-550 hover:text-slate-755 rounded transition cursor-pointer"
              title="Đóng bảng thông tin"
            >
              <ChevronLeft size={14} className="stroke-[2.5]" />
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* File item info */}
            {uploadedFile && (
              <div className="p-3 border border-slate-200 bg-white rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-655 flex flex-col items-center justify-center text-[7px] font-black font-sans shrink-0">
                    <File size={12} className="stroke-[2.5]" />
                    <span className="-mt-0.5">PDF</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-black text-text-primary truncate max-w-[90px]">
                      {uploadedFile.name}
                    </h4>
                    <p className="text-[8px] text-[#7E8B9B] font-bold mt-0.5">
                      {uploadedFile.size}
                    </p>
                  </div>
                </div>
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 stroke-[2.5]" />
              </div>
            )}

            {/* Kết quả nhận diện block */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">KẾT QUẢ OCR</h3>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-extrabold uppercase">Thành công</span>
              </div>

              <div className="space-y-2.5 font-sans">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                  <span>Tổng số câu hỏi</span>
                  <span className="text-text-primary font-black">{ocrQuestionStats.total}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                  <span>Câu trắc nghiệm</span>
                  <span className="text-text-primary font-black">{ocrQuestionStats.multipleChoice}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                  <span>Câu tự luận</span>
                  <span className="text-text-primary font-black">{ocrQuestionStats.essay}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                  <span>Độ chính xác ước tính</span>
                  <span className="text-slate-400 font-black">Chưa đánh giá</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 space-y-2 border-t border-slate-100 bg-slate-50/50 ${showLeftSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={async () => {
              await runOcrParsing(uploadedFile?.file);
            }}
            className="w-full py-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-55 text-slate-655 text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer font-sans bg-white shadow-sm"
          >
            <RefreshCw size={12} className="stroke-[2.5]" />
            Nhận diện lại
          </button>
          <button
            onClick={() => setQuickStep(1)}
            className="w-full py-1.5 text-[#7E8B9B] hover:text-slate-655 text-[9px] font-bold rounded-lg text-center transition cursor-pointer font-sans"
          >
            ← Quay lại Bước 1
          </button>
        </div>
      </div>

      {/* COLUMN 2: JSON Editor */}
      <div className={`${showLivePreview
        ? (showLeftSidebar ? 'w-[38%] shrink-0 border-r border-slate-200' : 'w-[60%] shrink-0 border-r border-slate-200')
        : 'flex-1'
        } flex flex-col overflow-hidden bg-white transition-all duration-300`}>
        {/* Header bar */}
        <div className="h-11 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center">
            {!showLeftSidebar && (
              <button
                onClick={() => setShowLeftSidebar(true)}
                className="p-1 hover:bg-slate-200 text-slate-550 hover:text-slate-755 rounded transition cursor-pointer mr-2 shrink-0"
                title="Mở bảng thông tin"
              >
                <ChevronRightIcon size={14} className="stroke-[2.5]" />
              </button>
            )}
            <span className="text-[10px] font-black text-slate-700 tracking-wider">DỮ LIỆU ĐỀ THI (JSON)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                try {
                  const formatted = JSON.stringify(JSON.parse(localJsonCode), null, 2);
                  setLocalJsonCode(formatted);
                  if (!isTempOcrMode) {
                    setExamJsonCode(formatted);
                  }
                } catch (e: any) {
                  setOcrError('Không thể định dạng mã nguồn: Cú pháp JSON đang có lỗi (thiếu dấu ngoặc, phẩy, hoặc sai định dạng). Vui lòng sửa lại trước khi định dạng.');
                }
              }}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-55 text-slate-650 text-[9px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer font-sans bg-white shadow-sm"
            >
              <AlignLeft size={11} /> Format JSON
            </button>

            <input
              type="file"
              ref={jsonFileInputRef}
              onChange={handleJsonUpload}
              className="hidden"
              accept=".json"
            />
            <button
              onClick={() => jsonFileInputRef.current?.click()}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-55 text-slate-650 text-[9px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer font-sans bg-white shadow-sm"
            >
              <Upload size={11} /> Tải lên JSON
            </button>
          </div>
        </div>

        {/* JSON Editor body */}
        <div className="flex-1 flex font-mono text-[11px] bg-slate-50/50 overflow-y-auto relative min-h-0 oml-editor-theme">
          {/* Embedded Theme CSS */}
          <style>{`
            .oml-editor-theme .token.punctuation {
              color: #4338CA !important;
              font-weight: bold;
            }
            .oml-editor-theme .token.property {
              color: #1E1B4B !important;
              font-weight: 600;
            }
            .oml-editor-theme .token.string {
              color: #6D28D9 !important;
            }
            .oml-editor-theme .token.number,
            .oml-editor-theme .token.boolean {
              color: #BE185D !important;
              font-weight: bold;
            }
            .oml-editor-theme .token-latex {
              color: #047857 !important;
              font-weight: 600;
            }
            .oml-editor-theme .oml-editor-pre,
            .oml-editor-theme textarea {
              white-space: pre !important;
              word-wrap: normal !important;
              word-break: keep-all !important;
            }
            .oml-editor-theme .oml-editor-pre::-webkit-scrollbar {
              display: none !important;
              height: 0 !important;
              width: 0 !important;
            }
            .oml-editor-theme .oml-editor-pre {
              scrollbar-width: none !important;
            }
          `}</style>

          <div
            ref={quickLineNumbersRef}
            className="bg-slate-55 text-[#A3AED0] select-none text-right px-2.5 py-4 border-r border-slate-100 flex flex-col font-mono text-[11px] leading-[18px] tracking-wide shrink-0 overflow-hidden min-h-0"
          >
            {codeLines.map((_, idx) => (
              <span key={idx} className="min-w-[20px] h-[18px] block">{idx + 1}</span>
            ))}
          </div>

          <div className="flex-1 relative overflow-hidden min-h-0">
            <pre
              ref={quickPreRef}
              className="absolute inset-0 p-4 m-0 border-none outline-none font-mono text-[11px] leading-[18px] tracking-wide pointer-events-none overflow-hidden select-none text-slate-800 bg-transparent box-border shadow-none oml-editor-pre"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
            <textarea
              ref={quickTextareaRef}
              value={localJsonCode}
              onChange={(e) => {
                setLocalJsonCode(e.target.value);
                if (!isTempOcrMode) {
                  setExamJsonCode(e.target.value);
                }
              }}
              onScroll={handleQuickHorizontalScroll}
              className="absolute inset-0 p-4 m-0 border-none outline-none resize-none leading-[18px] font-mono text-[11px] tracking-wide text-transparent caret-[#6C5DD3] focus:ring-0 focus:outline-none overflow-auto z-10 box-border shadow-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer message */}
        <div className="h-8 border-t border-slate-150 shrink-0 flex items-center justify-between text-[9px] font-bold px-4 bg-slate-50/20">
          {isJsonInvalid ? (
            <span className="text-red-500 font-black">🔴 JSON đang có lỗi cú pháp</span>
          ) : (
            <span className="text-emerald-500 font-black">🟢 OML hợp lệ. Tự động lưu bản nháp.</span>
          )}
          <button
            onClick={() => onApplyOcrCode(localJsonCode)}
            className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-[9px] font-black rounded-lg transition cursor-pointer shadow-sm"
          >
            Hoàn tất và Áp dụng vào đề thi
          </button>
        </div>
      </div>

      {/* COLUMN 3: OML Live Preview (≈40%) */}
      {showLivePreview && (() => {
        if (isTempOcrMode) {
          const res = parseOML(localJsonCode);
          const blocks = res.data?.content ?? [];
          const info = res.data?.info ?? {
            title: 'Đề thi chưa có tiêu đề',
            subject: 'Không rõ',
            grade: 10,
            time: 45,
            type: 'exam',
            difficulty: 'medium',
          };
          return (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC] transition-all duration-300">
              <div className="h-10 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <span className="text-[10px] font-black text-text-primary uppercase tracking-wider">XEM TRƯỚC ĐỀ THI (TẠM THỜI)</span>
              </div>
              <div className="flex-1 overflow-y-auto p-5 flex justify-center items-start">
                <OmlPreviewPaper
                  omlBlocks={blocks}
                  infoMeta={info as any}
                />
              </div>
            </div>
          );
        }
        return renderExamPreviewColumn('XEM TRƯỚC ĐỀ THI');
      })()}
    </div>
  );
};

