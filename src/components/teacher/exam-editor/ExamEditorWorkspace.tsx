import React, { useState, useRef } from 'react';
import { 
  Edit, 
  Cloud, 
  Save, 
  Eye, 
  Code, 
  Database, 
  Check, 
  HelpCircle, 
  File, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ChevronDown, 
  Send, 
  Link, 
  Copy, 
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  AlignLeft,
  RefreshCw,
  FileCode2,
  Upload
} from 'lucide-react';
import { ExamSidebar } from './ExamSidebar';
import { ExamLivePreview } from './ExamLivePreview';
import { QuestionBankWorkspace } from './QuestionBankWorkspace';

interface ExamEditorWorkspaceProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  examSubView: 'edit' | 'config' | 'publish';
  setExamSubView: (v: 'edit' | 'config' | 'publish') => void;
  examTab: 'code' | 'quick' | 'bank';
  setExamTab: (t: 'code' | 'quick' | 'bank') => void;
  examJsonCode: string;
  setExamJsonCode: (code: string) => void;
  selectedQuestionId: number;
  setSelectedQuestionId: (id: number) => void;
  examSearchQuery: string;
  setExamSearchQuery: (q: string) => void;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  setViewportMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export const ExamEditorWorkspace: React.FC<ExamEditorWorkspaceProps> = ({
  setMode,
  examSubView,
  setExamSubView,
  examTab,
  setExamTab,
  examJsonCode,
  setExamJsonCode,
  selectedQuestionId,
  setSelectedQuestionId,
  examSearchQuery,
  setExamSearchQuery,
  // viewportMode,
  // setViewportMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [quickStep, setQuickStep] = useState<1 | 2>(1);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);

  // Local OCR upload file state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>({
    name: 'Đề cương ôn tập Sinh học 10 học kỳ 2.pdf',
    size: '2.45 MB'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Parse JSON code safely
  let parsedData: any = null;
  let parseError: string | null = null;
  try {
    parsedData = JSON.parse(examJsonCode);
  } catch (e: any) {
    parseError = e.message;
  }

  const previewQuestions = parsedData?.questions || [
    {
      id: 1,
      question: "Phát biểu nào sau đây đúng về nước?",
      options: [
        { key: "A", content: "Nước là dung môi phân cực cực tốt" },
        { key: "B", content: "Nước không tham gia phản ứng sinh hóa" },
        { key: "C", content: "Nước được cấu tạo từ 3 nguyên tử H và 1 nguyên tử O" },
        { key: "D", content: "Nước không có khả năng điều hòa nhiệt độ" }
      ],
      answer: "A",
      explanation: "Nước là dung môi phân cực cực tốt nên hòa tan được nhiều chất phân cực trong tế bào.",
      level: "easy",
      tags: ["nước", "thành phần hóa học"]
    },
    {
      id: 2,
      question: "Cho hình vẽ cấu trúc của phân tử nước. Góc liên kết H-O-H là bao nhiêu?",
      options: [
        { key: "A", content: "104.5°" },
        { key: "B", content: "90°" },
        { key: "C", content: "120°" },
        { key: "D", content: "180°" }
      ],
      answer: "A",
      explanation: "Do 2 cặp electron tự do trên nguyên tử O đẩy nhau làm góc liên kết nhỏ hơn 109.5°, giá trị thực tế là 104.5°.",
      level: "medium",
      tags: ["nước", "cấu trúc"]
    }
  ];

  const infoMeta = parsedData?.info || {
    title: 'Đề cương ôn tập Sinh học 10 học kỳ 2',
    subject: "Sinh học",
    grade: 10,
    time: 90,
    totalQuestion: 50,
    type: "trac_nghiem"
  };

  const codeLines = examJsonCode.split('\n');

  // Height calculations to ensure exactly 1 scrollbar in editor columns
  const codeEditorHeight = Math.max(codeLines.length * 20 + 32, 480);
  const quickEditorHeight = Math.max(codeLines.length * 18 + 32, 480);

  const handleCheckCode = () => {
    try {
      JSON.parse(examJsonCode);
      alert('Cú pháp JSON hoàn toàn hợp lệ!');
    } catch (e: any) {
      alert('Lỗi cú pháp JSON: ' + e.message);
    }
  };

  const handleSaveExam = () => {
    alert('Đã lưu nháp đề thi thành công!');
  };

  const handlePublishExam = () => {
    alert('Đăng tải đề thi thành công!');
    setMode('dashboard');
  };

  const updateJsonField = (key: string, value: any) => {
    try {
      const data = JSON.parse(examJsonCode);
      if (!data.info) data.info = {};
      data.info[key] = value;
      setExamJsonCode(JSON.stringify(data, null, 2));
    } catch (e) {
      // Ignore if JSON is currently invalid
    }
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const questionsList = Array.from({ length: 12 }, (_, i) => i + 1);
  const filteredQuestions = questionsList.filter(qNum => 
    examSearchQuery === '' || `Câu ${qNum}`.toLowerCase().includes(examSearchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeMB} MB`
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeMB} MB`
      });
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setExamJsonCode(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex overflow-hidden font-sans text-text-primary select-none animate-fadeIn">
      {/* LEFT SIDEBAR */}
      <ExamSidebar 
        examSubView={examSubView}
        setExamSubView={setExamSubView}
        setMode={setMode}
        selectedQuestionId={selectedQuestionId}
        setSelectedQuestionId={setSelectedQuestionId}
        examSearchQuery={examSearchQuery}
        setExamSearchQuery={setExamSearchQuery}
        filteredQuestions={filteredQuestions}
      />

      {/* MAIN WORKSPACE AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black text-[#1E293B] truncate max-w-xs sm:max-w-md">
                Tạo đề: {infoMeta.title}
              </h1>
              <button className="p-1 text-slate-400 hover:text-slate-655 rounded transition cursor-pointer font-sans">
                <Edit size={12} />
              </button>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold font-sans">
              <Cloud size={14} className="stroke-[2.5]" />
              <span>Chưa lưu</span>
            </div>
          </div>

          {/* Actions buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSaveExam}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer font-sans"
            >
              <Save size={12} /> Lưu
            </button>
            <button 
              onClick={() => {
                if (examSubView !== 'edit') {
                  setExamSubView('edit');
                  setShowLivePreview(true);
                } else {
                  setShowLivePreview(!showLivePreview);
                }
              }}
              className={`px-3.5 py-1.5 border text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer font-sans ${
                (examSubView === 'edit' && showLivePreview) 
                  ? 'bg-primary-light border-primary/20 text-primary hover:bg-primary-light/80' 
                  : 'border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Eye size={12} /> Xem thử đề
            </button>
          </div>
        </header>

        {/* Sub-header Tab Bar */}
        {examSubView === 'edit' && (
          <div className="h-12 bg-white border-b border-slate-100 px-6 flex items-center gap-6 shrink-0 select-none z-10">
            <button 
              onClick={() => { setExamSubView('edit'); setExamTab('code'); setQuickStep(1); }}
              className={`h-full flex items-center gap-1.5 text-xs font-black border-b-2 px-1 transition ${
                examSubView === 'edit' && examTab === 'code' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Code size={14} /> Soạn bằng mã
            </button>
            <button 
              onClick={() => { setExamSubView('edit'); setExamTab('quick'); }}
              className={`h-full flex items-center gap-1.5 text-xs font-black border-b-2 px-1 transition ${
                examSubView === 'edit' && examTab === 'quick' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Edit size={14} /> Soạn nhanh
            </button>
            <button 
              onClick={() => { setExamSubView('edit'); setExamTab('bank'); setQuickStep(1); }}
              className={`h-full flex items-center gap-1.5 text-xs font-black border-b-2 px-1 transition ${
                examSubView === 'edit' && examTab === 'bank' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Database size={14} /> Ngân hàng câu hỏi
            </button>
          </div>
        )}

        {/* Main workspace layout */}
        {examSubView === 'edit' && examTab === 'code' && (
          <div className="flex-1 flex overflow-hidden animate-fadeIn">
            {/* LEFT COLUMN: Code Editor */}
            <div className={`${showLivePreview ? 'w-1/2 border-r border-slate-100' : 'w-full'} bg-white flex flex-col overflow-hidden transition-all duration-300`}>
              <div className="h-10 px-4 border-b border-slate-50 flex items-center justify-between shrink-0 bg-slate-50/20">
                <span className="text-[10px] font-black text-text-primary uppercase tracking-wider">Soạn đề bằng mã</span>
                <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 transition">
                  <HelpCircle size={12} /> Hướng dẫn
                </button>
              </div>

              {/* Editor Workspace */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/10">
                <div className="flex font-mono text-[11px] bg-slate-50/70 border border-slate-100 rounded-2xl overflow-hidden min-h-[480px]">
                  {/* Line numbers */}
                  <div 
                    className="bg-slate-100/50 text-[#A3AED0] select-none text-right px-3 py-4 border-r border-slate-200/50 flex flex-col font-mono leading-[20px] tracking-wide shrink-0"
                    style={{ height: `${codeEditorHeight}px` }}
                  >
                    {codeLines.map((_, idx) => (
                      <span key={idx} className="min-w-[24px]">{idx + 1}</span>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={examJsonCode}
                    onChange={(e) => setExamJsonCode(e.target.value)}
                    className="flex-1 p-4 bg-transparent outline-none border-none resize-none leading-[20px] font-mono text-slate-800 focus:ring-0 focus:outline-none overflow-hidden"
                    style={{ height: `${codeEditorHeight}px` }}
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Editor Footer Status */}
              <div className="h-11 border-t border-slate-50 px-4 flex items-center justify-between shrink-0 bg-white">
                <button 
                  onClick={handleCheckCode}
                  className="px-3 py-1.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-success text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer font-sans"
                >
                  <Check size={12} /> Kiểm tra mã
                </button>
                
                {parseError ? (
                  <span className="text-[10px] font-black text-red-500 truncate max-w-[200px] font-sans">
                    Lỗi cú pháp JSON!
                  </span>
                ) : (
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold font-sans">
                    <span>{infoMeta.totalQuestion || 50} câu hỏi</span>
                    <span>{infoMeta.time || 90} phút</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-extrabold uppercase">Trắc nghiệm</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Live Preview */}
            {showLivePreview && (
              <ExamLivePreview 
                infoMeta={infoMeta}
                previewQuestions={previewQuestions}
                selectedQuestionId={selectedQuestionId}
                setSelectedQuestionId={setSelectedQuestionId}
              />
            )}
          </div>
        )}

        {/* Ngân hàng câu hỏi workspace layout */}
        {examSubView === 'edit' && examTab === 'bank' && (
          <QuestionBankWorkspace />
        )}

        {/* Soạn nhanh tab view */}
        {examSubView === 'edit' && examTab === 'quick' && (
          <>
            {quickStep === 1 ? (
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
            ) : (
              // STEP 2: Hiệu chỉnh kết quả nhận diện (3-column layout)
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
                        className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-755 rounded transition cursor-pointer"
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
                <div className={`${
                  showLivePreview 
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
                          <ChevronRight size={14} className="stroke-[2.5]" />
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
                        className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-55 text-slate-600 text-[9px] font-bold rounded-lg flex items-center gap-1 transition cursor-pointer font-sans bg-white shadow-sm"
                      >
                        <Upload size={11} /> Tải lên JSON
                      </button>
                    </div>
                  </div>

                  {/* JSON Editor body */}
                  <div className="flex-1 overflow-y-auto flex font-mono text-[11px] bg-white">
                    <div 
                      className="bg-slate-50/60 text-[#A3AED0] select-none text-right px-2.5 py-4 border-r border-slate-100 flex flex-col leading-[18px] shrink-0 font-mono"
                      style={{ height: `${quickEditorHeight}px` }}
                    >
                      {codeLines.map((_, idx) => (
                        <span key={idx} className="min-w-[20px]">{idx + 1}</span>
                      ))}
                    </div>
                    <textarea
                      value={examJsonCode}
                      onChange={(e) => setExamJsonCode(e.target.value)}
                      className="flex-1 p-4 bg-transparent outline-none border-none resize-none leading-[18px] font-mono text-slate-800 focus:ring-0 focus:outline-none overflow-hidden"
                      style={{ height: `${quickEditorHeight}px` }}
                      spellCheck={false}
                    />
                  </div>

                  {/* Footer message */}
                  <div className="h-8 border-t border-slate-150 shrink-0 flex items-center justify-between text-[9px] text-[#A3AED0] font-bold px-4 bg-slate-50/20">
                    {parseError ? (
                      <span className="text-red-500">Lỗi cú pháp JSON! {parseError}</span>
                    ) : (
                      <span className="text-emerald-500">✓ Cú pháp hợp lệ. Tự động lưu bản nháp.</span>
                    )}
                  </div>
                </div>

                {/* COLUMN 3: Live Preview (≈40%) */}
                {showLivePreview && (
                  <div className="flex-1 flex flex-col overflow-hidden bg-white transition-all duration-300">
                    {/* Header bar */}
                    <div className="h-11 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-slate-50/50">
                      <span className="text-[10px] font-black text-slate-700 tracking-wider">XEM TRƯỚC ĐỀ THI</span>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50/30 p-5 md:p-6 flex justify-center items-start">
                      <div className="w-full bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col h-fit">
                        {/* Paper Header inside the simulator */}
                        <div className="border-b border-slate-150 pb-4 mb-6">
                          <h2 className="text-sm font-black text-text-primary uppercase tracking-wide">
                            {infoMeta.title}
                          </h2>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold mt-2 font-sans">
                            <span className="flex items-center gap-1">
                              <FileCode2 size={12} /> {previewQuestions.length} câu hỏi
                            </span>
                            <span className="flex items-center gap-1">
                              <HelpCircle size={12} /> {infoMeta.time || 90} phút
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-[8px] font-extrabold uppercase tracking-wider">
                              TRẮC NGHIỆM
                            </span>
                          </div>
                        </div>

                        {/* Questions Render List */}
                        <div className="space-y-6">
                          {previewQuestions.map((q: any, qIdx: number) => {
                            const isActive = selectedQuestionId === q.id;
                            return (
                              <div 
                                key={q.id || qIdx}
                                onClick={() => setSelectedQuestionId(q.id)}
                                className={`p-4 border rounded-xl transition duration-150 cursor-pointer ${
                                  isActive 
                                    ? 'border-primary/30 bg-primary-light/5 shadow-sm' 
                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                }`}
                              >
                                <div className="text-[11px] leading-relaxed font-bold">
                                  <span className="font-black text-primary">Câu {q.id}.</span> {q.question}
                                </div>

                                {/* Water molecule SVG */}
                                {q.id === 2 && (
                                  <div className="flex justify-center py-4 my-3 bg-slate-50/50 rounded-xl border border-slate-100">
                                    <svg width="220" height="130" viewBox="0 0 220 130" className="overflow-visible select-none">
                                      {/* Covalent bonds */}
                                      <line x1="110" y1="50" x2="60" y2="96" stroke="#1E293B" strokeWidth="2.5" />
                                      <line x1="110" y1="50" x2="160" y2="96" stroke="#1E293B" strokeWidth="2.5" />

                                      {/* Oxygen atom */}
                                      <circle cx="110" cy="50" r="18" fill="white" stroke="#6C5DD3" strokeWidth="2.5" />
                                      <text x="110" y="54" textAnchor="middle" fontSize="12" fontWeight="black" fill="#6C5DD3" fontFamily="sans-serif">O</text>

                                      {/* Hydrogen left */}
                                      <circle cx="60" cy="96" r="12" fill="white" stroke="#1E293B" strokeWidth="2" />
                                      <text x="60" y="100" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1E293B" fontFamily="sans-serif">H</text>

                                      {/* Hydrogen right */}
                                      <circle cx="160" cy="96" r="12" fill="white" stroke="#1E293B" strokeWidth="2" />
                                      <text x="160" y="100" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1E293B" fontFamily="sans-serif">H</text>

                                      {/* Lone pairs */}
                                      <circle cx="102" cy="26" r="2.2" fill="#6C5DD3" />
                                      <circle cx="108" cy="22" r="2.2" fill="#6C5DD3" />
                                      <circle cx="118" cy="22" r="2.2" fill="#6C5DD3" />
                                      <circle cx="124" cy="26" r="2.2" fill="#6C5DD3" />

                                      {/* Angle curve */}
                                      <path d="M 98,62 A 16,16 0 0,0 122,62" fill="none" stroke="#6C5DD3" strokeWidth="1" strokeDasharray="2 1.5" />
                                      <text x="110" y="78" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6C5DD3" fontFamily="sans-serif">104.5°</text>
                                    </svg>
                                  </div>
                                )}

                                {/* Options grid */}
                                <div className={`mt-3.5 space-y-2.5 font-sans ${q.id === 2 ? 'grid grid-cols-2 gap-3 space-y-0' : ''}`}>
                                  {q.options?.map((opt: any) => {
                                    const isChecked = q.answer === opt.key;
                                    const letter = opt.key;
                                    
                                    let optClass = 'border-[#E8EAF3] bg-white hover:border-[#6366F1]/40 hover:bg-[#6366F1]/5';
                                    let badgeClass = 'bg-slate-100 text-[#64748B] border border-slate-200';

                                    if (isChecked) {
                                      optClass = 'border-[#6366F1] bg-[#6366F1]/10 text-primary';
                                      badgeClass = 'bg-[#6366F1] text-white border-[#6366F1]';
                                    }

                                    return (
                                      <div 
                                        key={opt.key}
                                        className={`w-full flex items-center justify-between gap-3 p-3.5 border rounded-2xl text-left text-xs transition duration-150 ${optClass}`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${badgeClass}`}>
                                            {letter}
                                          </span>
                                          <span className="font-semibold text-slate-700 leading-relaxed">{opt.content}</span>
                                        </div>
                                        {isChecked && (
                                          <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
                                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Explanation and difficulty */}
                                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-[9px]">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-primary">Giải thích:</span>
                                    <span className={`font-black text-[8px] ${q.level === 'easy' ? 'text-success' : 'text-amber-500'}`}>
                                      Độ khó: {q.level === 'easy' ? 'Dễ' : 'Trung bình'}
                                    </span>
                                  </div>
                                  <p className="text-text-secondary leading-relaxed font-bold">
                                    {q.explanation}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Cấu hình đề thi */}
        {examSubView === 'config' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto w-full space-y-6 animate-fadeIn">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wide border-b border-slate-100 pb-3 mb-6 font-sans">
              Cấu hình đề thi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Form fields card */}
              <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-[#1E293B] uppercase tracking-wider mb-2 font-sans">Thông tin cơ bản</h3>
                
                {/* Tên đề thi */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                    Tên đề thi
                  </label>
                  <input 
                    type="text" 
                    value={infoMeta.title || ''}
                    onChange={(e) => updateJsonField('title', e.target.value)}
                    className="text-xs font-bold text-text-primary"
                    placeholder="Nhập tên đề thi..."
                  />
                </div>

                {/* Tên môn học */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                    Tên môn học
                  </label>
                  <div className="relative">
                    <select 
                      value={infoMeta.subject || 'Sinh học'}
                      onChange={(e) => updateJsonField('subject', e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                    >
                      <option value="Sinh học">Sinh học</option>
                      <option value="Toán học">Toán học</option>
                      <option value="Vật lý">Vật lý</option>
                      <option value="Hóa học">Hóa học</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>

                {/* Thời gian làm bài & Độ khó */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Thời gian */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                      Thời gian làm bài (phút)
                    </label>
                    <input 
                      type="number" 
                      value={infoMeta.time || 90}
                      onChange={(e) => updateJsonField('time', parseInt(e.target.value) || 0)}
                      className="text-xs font-bold text-text-primary"
                      placeholder="Nhập thời gian..."
                    />
                  </div>

                  {/* Độ khó */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                      Độ khó đề thi
                    </label>
                    <div className="relative">
                      <select 
                        value={infoMeta.level || 'trung_binh'}
                        onChange={(e) => updateJsonField('level', e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                      >
                        <option value="easy">Dễ (Easy)</option>
                        <option value="medium">Trung bình (Medium)</option>
                        <option value="hard">Khó (Hard)</option>
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setExamSubView('edit')}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition shadow-sm cursor-pointer font-sans"
                  >
                    Quay lại soạn đề
                  </button>
                </div>
              </div>

              {/* Score Stats card */}
              <div className="bg-gradient-to-br from-primary to-[#8F85F3] rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between h-fit min-h-[300px]">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm shadow-inner">
                    <Database size={22} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-black tracking-wider uppercase opacity-75">Thống kê điểm số</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{previewQuestions.length}</span>
                      <span className="text-xs font-bold opacity-75">câu hỏi</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/20" />

                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-wider opacity-75">Điểm mỗi câu</span>
                    <div className="text-lg font-black font-mono">
                      {(10 / previewQuestions.length).toFixed(2)} điểm
                    </div>
                    <p className="text-[9px] opacity-75 font-medium leading-relaxed pt-1 font-sans">
                      Hệ thống tự động phân chia đều điểm số của tất cả các câu hỏi trên thang điểm 10 chuẩn.
                    </p>
                  </div>
                </div>

                <div className="pt-6 text-[9px] font-extrabold uppercase bg-white/10 px-3.5 py-2 rounded-xl text-center backdrop-blur-sm mt-4">
                  Thang điểm: 10 • Điểm chuẩn hóa
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Xem và xuất bản */}
        {examSubView === 'publish' && (
          <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-6 animate-fadeIn">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-wide border-b border-slate-100 pb-3 mb-6 font-sans">
              Xem và xuất bản đề thi
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Publish Info summary */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-[#10B981] uppercase tracking-wider">Đề thi sẵn sàng xuất bản</span>
                </div>

                <div className="space-y-3.5">
                  <h3 className="text-sm font-black text-text-primary leading-tight font-sans">
                    {infoMeta.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-text-secondary font-sans border-t border-b border-slate-50 py-3">
                    <div>Môn học: <span className="text-text-primary">{infoMeta.subject}</span></div>
                    <div>Khối lớp: <span className="text-text-primary">Khối {infoMeta.grade || 10}</span></div>
                    <div>Thời gian: <span className="text-text-primary">{infoMeta.time || 90} phút</span></div>
                    <div>Số câu hỏi: <span className="text-text-primary">{previewQuestions.length} câu</span></div>
                    <div>Độ khó: <span className="text-text-primary font-black uppercase text-primary text-[8px] px-1.5 py-0.5 rounded bg-primary-light border border-primary/10">{infoMeta.level === 'easy' ? 'Dễ' : infoMeta.level === 'hard' ? 'Khó' : 'Trung bình'}</span></div>
                    <div>Điểm mỗi câu: <span className="text-text-primary font-mono">{(10 / previewQuestions.length).toFixed(2)} đ</span></div>
                  </div>

                  <p className="text-[10px] text-text-secondary leading-relaxed font-medium font-sans">
                    Nhấp vào nút **Xuất bản đề thi** dưới đây để lưu tất cả dữ liệu đề thi lên máy chủ và kích hoạt liên kết cho học sinh tham gia kiểm tra.
                  </p>
                  <button 
                    onClick={handlePublishExam}
                    className="w-full mt-3 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100 font-sans"
                  >
                    <Send size={14} /> Xuất bản đề thi
                  </button>
                </div>
              </div>

              {/* Share link card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between min-h-[250px]">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-primary flex items-center justify-center shadow-sm">
                    <Link size={18} />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">Đường liên kết tới đề thi</h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-normal font-sans">
                      Học sinh có thể truy cập liên kết này để làm bài kiểm tra trực tuyến.
                    </p>
                  </div>

                  {/* Copy Link field container */}
                  <div className="flex gap-2 items-center bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                    <input 
                      type="text" 
                      readOnly
                      value={`http://localhost:5174/exams/${slugify(infoMeta.title || 'de-thi')}`}
                      className="bg-transparent border-none text-[10px] font-mono text-primary font-bold focus:ring-0 p-0 flex-1 select-all cursor-text overflow-x-auto"
                    />
                    <button 
                      onClick={() => {
                        const linkText = `http://localhost:5174/exams/${slugify(infoMeta.title || 'de-thi')}`;
                        navigator.clipboard.writeText(linkText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`p-2 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer ${
                        copied 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' 
                          : 'bg-white hover:bg-slate-50 text-slate-655 border border-slate-200 shadow-sm'
                      }`}
                      title="Sao chép liên kết"
                    >
                      {copied ? <Check size={14} className="stroke-[2.5]" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a 
                    href={`http://localhost:5174/exams/${slugify(infoMeta.title || 'de-thi')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl text-center flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100 font-sans"
                  >
                    <ExternalLink size={14} /> Mở liên kết đề thi
                  </a>
                </div>
              </div>
            </div>

            {/* Copy toast indicator */}
            {copied && (
              <div className="fixed bottom-6 right-6 bg-[#10B981] text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-100/20 text-xs font-black flex items-center gap-2 animate-bounce z-50">
                <CheckCircle2 size={16} className="stroke-[2.5]" />
                <span>Đã sao chép liên kết vào bộ nhớ tạm!</span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
