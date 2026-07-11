import React, { useState, useRef } from 'react';
import { 
  Upload, 
  File, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  HelpCircle, 
  Download, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface FileUploaderWorkspaceProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
  initialFile?: File | null;
}

export const FileUploaderWorkspace: React.FC<FileUploaderWorkspaceProps> = ({ 
  setMode,
  initialFile
}) => {
  // Uploaded file state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(() => {
    if (initialFile) {
      const sizeMB = (initialFile.size / (1024 * 1024)).toFixed(2);
      return {
        name: initialFile.name,
        size: `${sizeMB} MB`
      };
    }
    return {
      name: 'Đề cương ôn tập Sinh học 10 học kỳ 2.pdf',
      size: '2.45 MB'
    };
  });

  // Upload form states
  const [docTitle, setDocTitle] = useState(() => {
    if (initialFile) {
      return initialFile.name.replace(/\.[^/.]+$/, "");
    }
    return 'Đề cương ôn tập Sinh học 10 học kỳ 2';
  });
  const [docType, setDocType] = useState('Tài liệu đề thi');
  const [docSubject, setDocSubject] = useState('Sinh học');
  const [docSemester, setDocSemester] = useState('Học kỳ 2');
  const [docClass, setDocClass] = useState('Lớp 10');
  const [hasSolution, setHasSolution] = useState(true);
  const [docDescription, setDocDescription] = useState('');
  
  // Tag state
  const [tagInput, setTagInput] = useState('');
  const [docTags, setDocTags] = useState<string[]>(['ôn tập', 'sinh học 10', 'học kỳ 2', 'đề cương']);

  // PDF Preview states
  const [previewPage, setPreviewPage] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(100);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!docTags.includes(tagInput.trim())) {
        setDocTags([...docTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDocTags(docTags.filter(t => t !== tagToRemove));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({
        name: file.name,
        size: `${sizeMB} MB`
      });
      if (docTitle === '' || docTitle === 'Đề cương ôn tập Sinh học 10 học kỳ 2') {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setDocTitle(cleanName);
      }
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
      if (docTitle === '' || docTitle === 'Đề cương ôn tập Sinh học 10 học kỳ 2') {
        const cleanName = file.name.replace(/\.[^/.]+$/, "");
        setDocTitle(cleanName);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-bg-base select-none text-text-primary font-sans animate-fadeIn flex flex-col pb-12">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <h1 className="text-lg font-black text-text-primary">
            Tải file tài liệu lên
          </h1>
          <p className="text-xs text-[#7E8B9B] font-bold mt-1">
            Tải lên tài liệu để chia sẻ với học sinh và cộng đồng Onmi Exam.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMode('dashboard')}
            className="px-5 py-2 border border-[#E2E8F0] hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => {
              alert('Tải lên và lưu tài liệu thành công!');
              setMode('dashboard');
            }}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100"
          >
            <Upload size={14} /> Tải lên và lưu
          </button>
        </div>
      </header>

      {/* Content Layout */}
      <div className="max-w-[1400px] mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* CỘT TRÁI (60% width on desktop) */}
        <div className="w-full lg:w-[55%] space-y-6">
          
          {/* 1. TẢI FILE TÀI LIỆU */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-text-primary flex items-center gap-2">
              1. Tải file tài liệu
            </h2>
            
            {/* Drag drop zone */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-100 hover:border-primary/40 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/20 hover:bg-primary-light/10 transition cursor-pointer group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf,.docx,.doc,.pptx,.zip"
              />
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm shadow-indigo-100/50">
                <Upload size={20} />
              </div>
              <p className="text-xs font-black text-text-primary text-center">
                Kéo thả file vào đây
              </p>
              <p className="text-[10px] text-[#7E8B9B] font-bold text-center mt-1">
                hoặc
              </p>
              <span className="mt-2.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-black rounded-xl transition cursor-pointer shadow-sm">
                Chọn file từ máy tính
              </span>
              <p className="text-[9px] text-slate-400 font-bold text-center mt-3">
                Hỗ trợ: PDF, DOCX, DOC, PPTX, ZIP (tối đa 50MB)
              </p>
            </div>

            {/* Uploaded file indicator */}
            {uploadedFile ? (
              <div className="p-3 border border-emerald-100 bg-emerald-50/20 rounded-2xl flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-650 flex flex-col items-center justify-center text-[9px] font-black font-sans shrink-0">
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
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                  >
                    <X size={14} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-text-secondary font-bold">
                Chưa có file nào được chọn. Hãy chọn một file tài liệu.
              </div>
            )}
          </div>

          {/* 2. THÔNG TIN TÀI LIỆU */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-text-primary">
              2. Thông tin tài liệu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tên tài liệu */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                  Tên tài liệu <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="text-xs font-bold text-text-primary"
                  placeholder="Nhập tên tài liệu..."
                />
              </div>

              {/* Loại tài liệu */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                  Loại tài liệu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                  >
                    <option value="Tài liệu đề thi">Tài liệu đề thi</option>
                    <option value="Tài liệu lý thuyết">Tài liệu lý thuyết</option>
                    <option value="Sổ tay công thức">Sổ tay công thức</option>
                    <option value="Khác">Khác</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Môn học */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                  Môn học <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={docSubject}
                    onChange={(e) => setDocSubject(e.target.value)}
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

              {/* Học kỳ */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                  Học kỳ
                </label>
                <div className="relative">
                  <select 
                    value={docSemester}
                    onChange={(e) => setDocSemester(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                  >
                    <option value="Học kỳ 1">Học kỳ 1</option>
                    <option value="Học kỳ 2">Học kỳ 2</option>
                    <option value="Cả năm">Cả năm</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Lớp */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                  Lớp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={docClass}
                    onChange={(e) => setDocClass(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs font-bold text-text-primary appearance-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition cursor-pointer"
                  >
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              {/* Có lời giải Toggle */}
              <div className="sm:col-span-2 flex items-center justify-between py-2 border-t border-slate-50 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-text-primary">Có lời giải</span>
                  <span className="cursor-help" title="Tài liệu đính kèm có chứa hướng dẫn giải chi tiết">
                    <HelpCircle size={14} className="text-slate-400" />
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    {hasSolution ? 'Có' : 'Không'}
                  </span>
                  <button 
                    onClick={() => setHasSolution(!hasSolution)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer outline-none ${
                      hasSolution ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        hasSolution ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. THÔNG TIN BỔ SUNG */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-text-primary">
              3. Thông tin bổ sung <span className="text-slate-400 font-bold text-xs">(không bắt buộc)</span>
            </h2>

            <div className="space-y-4">
              {/* Mô tả */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                  Mô tả tài liệu
                </label>
                <textarea 
                  rows={4}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  className="w-full p-3.5 border border-[#E2E8F0] rounded-xl text-xs font-bold text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-none outline-none font-sans"
                  placeholder="Nhập mô tả về tài liệu..."
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">
                  Tags
                </label>
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="text-xs font-bold text-text-primary"
                  placeholder="Thêm tag và nhấn Enter"
                />
                
                {/* Tag display list */}
                {docTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {docTags.map((tag) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold border border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        {tag}
                        <X size={10} className="stroke-[2.5]" />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* CỘT PHẢI (45% width on desktop) */}
        <div className="w-full lg:w-[45%]">
          
          {/* 4. XEM TRƯỚC FILE */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col h-full min-h-[600px]">
            <h2 className="text-sm font-black text-text-primary">
              4. Xem trước file
            </h2>

            {uploadedFile ? (
              <div className="flex-1 flex flex-col space-y-4">
                {/* File header status */}
                <div className="p-3 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-650 flex flex-col items-center justify-center text-[7px] font-black font-sans shrink-0">
                      <File size={12} className="stroke-[2.5]" />
                      <span className="-mt-0.5">PDF</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-black text-text-primary truncate max-w-[140px] sm:max-w-xs">
                        {uploadedFile.name}
                      </h4>
                      <p className="text-[9px] text-[#7E8B9B] font-bold mt-0.5">
                        {uploadedFile.size}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert('Đang tải file gốc...')}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer shrink-0 font-sans"
                  >
                    <Download size={12} /> Tải file gốc
                  </button>
                </div>

                {/* Navigation controls */}
                <div className="flex items-center justify-between px-2 select-none">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                      disabled={previewPage <= 1}
                      className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded transition cursor-pointer text-slate-600"
                    >
                      <ChevronLeft size={16} className="stroke-[2.5]" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 px-2 min-w-[64px] text-center font-sans">
                      {previewPage} / 32
                    </span>
                    <button 
                      onClick={() => setPreviewPage(p => Math.min(32, p + 1))}
                      disabled={previewPage >= 32}
                      className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded transition cursor-pointer text-slate-600"
                    >
                      <ChevronRight size={16} className="stroke-[2.5]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 font-sans">
                    <button 
                      onClick={() => setPreviewZoom(z => Math.max(50, z - 10))}
                      className="w-6 h-6 hover:bg-slate-100 rounded-lg text-xs font-black text-slate-500 flex items-center justify-center transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-black text-slate-600 min-w-[40px] text-center">
                      {previewZoom}%
                    </span>
                    <button 
                      onClick={() => setPreviewZoom(z => Math.min(200, z + 10))}
                      className="w-6 h-6 hover:bg-slate-100 rounded-lg text-xs font-black text-slate-500 flex items-center justify-center transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Mock Paper View */}
                <div className="flex-1 bg-slate-100/40 border border-slate-200/50 rounded-2xl p-4 overflow-auto flex justify-center items-start min-h-[450px]">
                  <div 
                    style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
                    className="bg-white border border-slate-200/50 p-6 shadow-sm w-full max-w-[500px] text-text-primary text-[10px] leading-relaxed select-text space-y-4 font-serif transition-transform duration-100"
                  >
                    {/* Document Header */}
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3 font-sans">
                      <div className="space-y-0.5 font-bold uppercase tracking-tight text-[#1F2C3F] text-[8px]">
                        <div>SỞ GIÁO DỤC VÀ ĐÀO TẠO</div>
                        <div>TRƯỜNG THPT CHUYÊN LÊ HỒNG PHONG</div>
                      </div>
                      <div className="text-right space-y-0.5 font-bold uppercase tracking-tight text-[#1F2C3F] text-[8px]">
                        <div>ĐỀ KHẢO SÁT CHẤT LƯỢNG LỚP 12</div>
                        <div>MÔN: TOÁN HỌC - GIẢI TÍCH</div>
                        <div className="inline-block border border-slate-800 px-1 py-0.2 mt-0.5 font-sans font-black text-[7px]">
                          MÃ ĐỀ: 101
                        </div>
                      </div>
                    </div>

                    <div className="text-center font-bold italic mt-1 text-slate-600 font-sans text-[8px]">
                      (Đề thi gồm 06 trang)
                    </div>

                    {/* Part 1 */}
                    <div className="space-y-3 font-sans text-[9px]">
                      <div className="font-bold text-[#1E293B] text-[9.5px]">
                        PHẦN I. CÂU HỎI TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN.
                      </div>

                      {/* Question 1 */}
                      <div className="space-y-1.5">
                        <div>
                          <span className="font-bold">Câu 1.</span> Cho hàm số f(x) = x³ - 3x². Đạo hàm f'(x) bằng:
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-slate-700 font-medium pl-2">
                          <div>A. 3x² - 6x.</div>
                          <div>B. x² - 6x.</div>
                          <div>C. 3x² - 3x.</div>
                          <div>D. x³ - 6x.</div>
                        </div>
                      </div>

                      {/* Question 2 */}
                      <div className="space-y-3">
                        <div>
                          <span className="font-bold">Câu 2.</span> Cho khối chóp S.ABC có đáy ABC là tam giác đều cạnh a. SA vuông góc với đáy và SA = a√2. Thể tích khối chóp bằng:
                        </div>

                        {/* Geometry SVG diagram */}
                        <div className="flex justify-center py-2 bg-slate-50/50 rounded-xl border border-slate-100">
                          <svg width="220" height="150" viewBox="0 0 220 150" className="overflow-visible select-none">
                            {/* Hidden/Dashed Line AC */}
                            <line x1="40" y1="120" x2="180" y2="120" stroke="#64748B" strokeWidth="1.2" strokeDasharray="4 3" />
                            
                            {/* Dashed Line SA */}
                            <line x1="40" y1="20" x2="40" y2="120" stroke="#64748B" strokeWidth="1.2" strokeDasharray="4 3" />

                            {/* Solid line AB */}
                            <line x1="40" y1="120" x2="110" y2="140" stroke="#1E293B" strokeWidth="1.5" />
                            
                            {/* Solid line BC */}
                            <line x1="110" y1="140" x2="180" y2="120" stroke="#1E293B" strokeWidth="1.5" />

                            {/* Solid Line SB */}
                            <line x1="40" y1="20" x2="110" y2="140" stroke="#1E293B" strokeWidth="1.5" />

                            {/* Solid Line SC */}
                            <line x1="40" y1="20" x2="180" y2="120" stroke="#1E293B" strokeWidth="1.5" />

                            {/* Right-angle indicator at A for SA perpendicular to base */}
                            <path d="M 40,110 L 48,110 L 48,120" fill="none" stroke="#64748B" strokeWidth="0.8" />
                            <path d="M 40,114 L 45,116 L 45,122" fill="none" stroke="#64748B" strokeWidth="0.8" strokeDasharray="1 1" />

                            {/* Vertex Labels */}
                            <text x="35" y="15" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">S</text>
                            <text x="25" y="125" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">A</text>
                            <text x="108" y="152" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">B</text>
                            <text x="186" y="125" fill="#1E293B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">C</text>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2.5">
                  <File size={20} />
                </div>
                <p className="text-xs font-bold text-text-secondary max-w-[200px]">
                  Hãy tải lên một file tài liệu để xem trước nội dung hiển thị tại đây.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
