import React from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
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
  uploadedFile: { name: string; size: string } | null;
  setUploadedFile: React.Dispatch<React.SetStateAction<{ name: string; size: string } | null>>;
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
}

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
}) => {
  const codeLines = examJsonCode.split('\n');
  const quickPreRef = React.useRef<HTMLPreElement>(null);

  const highlightedCode = React.useMemo(() => {
    if (!examJsonCode) return '';
    try {
      let html = Prism.highlight(examJsonCode, Prism.languages.json, 'json');
      html = html.replace(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g, (match) => {
        return `<span class="token-latex">${match}</span>`;
      });
      return html;
    } catch (e) {
      return examJsonCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }, [examJsonCode]);

  const handleQuickHorizontalScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (quickPreRef.current) {
      quickPreRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const [quickEditorHeight, setQuickEditorHeight] = React.useState<number | string>('auto');

  React.useEffect(() => {
    const textarea = quickTextareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
      setQuickEditorHeight(scrollHeight);
    }
  }, [examJsonCode]);

  if (quickStep === 1) {
    return (
      <div className="flex-1 p-6 overflow-y-auto flex flex-col md:flex-row gap-6 bg-[#F8FAFC] animate-fadeIn">
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
                  onClick={() => setQuickStep(2)}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm font-sans"
                >
                  Tới bước 2 <ChevronRight size={14} />
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
            <RefreshCw size={24} className="text-primary animate-spin" />
            <span className="text-xs font-black text-text-primary">Đang chạy nhận diện OCR...</span>
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
                  <span className="text-text-primary font-black">50</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                  <span>Câu trắc nghiệm</span>
                  <span className="text-text-primary font-black">50</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                  <span>Câu tự luận</span>
                  <span className="text-text-primary font-black">0</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold border-b border-slate-100 pb-2">
                  <span>Độ chính xác ước tính</span>
                  <span className="text-emerald-500 font-black">98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 space-y-2 border-t border-slate-100 bg-slate-50/50 ${showLeftSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={() => {
              setIsOcrLoading(true);
              setTimeout(() => {
                setIsOcrLoading(false);
                alert('Đã chạy nhận diện lại đề thi thành công!');
              }, 1500);
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
                  const formatted = JSON.stringify(JSON.parse(examJsonCode), null, 2);
                  setExamJsonCode(formatted);
                } catch (e: any) {
                  alert('Không thể format: Cú pháp JSON không hợp lệ!');
                }
              }}
              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[9px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer font-sans bg-white shadow-sm"
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
            className="bg-slate-55 text-[#A3AED0] select-none text-right px-2.5 py-4 border-r border-slate-100 flex flex-col font-mono text-[11px] leading-[18px] tracking-wide shrink-0 overflow-hidden"
            style={{ height: quickEditorHeight }}
          >
            {codeLines.map((_, idx) => (
              <span key={idx} className="min-w-[20px] h-[18px] block">{idx + 1}</span>
            ))}
          </div>

          <div className="flex-1 relative overflow-hidden min-h-0" style={{ height: quickEditorHeight }}>
            <pre
              ref={quickPreRef}
              className="absolute inset-0 p-4 m-0 border-none outline-none font-mono text-[11px] leading-[18px] tracking-wide pointer-events-none overflow-x-auto overflow-y-hidden select-none text-slate-800 bg-transparent box-border shadow-none oml-editor-pre"
              style={{ height: quickEditorHeight }}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
            <textarea
              ref={quickTextareaRef}
              value={examJsonCode}
              onChange={(e) => setExamJsonCode(e.target.value)}
              onScroll={handleQuickHorizontalScroll}
              className="absolute inset-0 p-4 m-0 border-none outline-none resize-none leading-[18px] font-mono text-[11px] tracking-wide text-transparent caret-[#6C5DD3] focus:ring-0 focus:outline-none overflow-x-auto overflow-y-hidden z-10 box-border shadow-none"
              style={{ height: quickEditorHeight }}
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
        </div>
      </div>

      {/* COLUMN 3: OML Live Preview (≈40%) */}
      {showLivePreview && renderExamPreviewColumn('XEM TRƯỚC ĐỀ THI')}
    </div>
  );
};

