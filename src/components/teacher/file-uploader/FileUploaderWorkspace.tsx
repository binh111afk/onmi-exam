import React, { useEffect, useRef, useState } from 'react';
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

interface UploadedFileInfo {
  file: File;
  name: string;
  size: string;
  kind: string;
}

const formatFileSize = (file: File) => `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

const getFileKind = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toUpperCase();
  return extension || 'FILE';
};

const OFFICE_FILE_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];

const createUploadedFileInfo = (file: File): UploadedFileInfo => ({
  file,
  name: file.name,
  size: formatFileSize(file),
  kind: getFileKind(file.name),
});

export const FileUploaderWorkspace: React.FC<FileUploaderWorkspaceProps> = ({ 
  setMode,
  initialFile
}) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(() => (
    initialFile ? createUploadedFileInfo(initialFile) : null
  ));

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

  const [previewPage, setPreviewPage] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileExtension = uploadedFile?.name.split('.').pop()?.toLowerCase() ?? '';
  const isPdfFile = uploadedFile
    ? uploadedFile.file.type === 'application/pdf' || uploadedFile.name.toLowerCase().endsWith('.pdf')
    : false;
  const isImageFile = uploadedFile ? uploadedFile.file.type.startsWith('image/') : false;
  const isOfficeFile = OFFICE_FILE_EXTENSIONS.includes(fileExtension);
  const publicPreviewUrl = previewUrl?.startsWith('http') ? previewUrl : null;
  const officePreviewSrc = publicPreviewUrl && isOfficeFile
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicPreviewUrl)}`
    : null;
  // state=100 tương ứng với zoom=60 trong URL (fit-width thực tế)
  const filePreviewSrc = previewUrl && isPdfFile
    ? `${previewUrl}#toolbar=0&page=${previewPage}&zoom=${Math.round(previewZoom * 0.6)}`
    : previewUrl;

  useEffect(() => {
    if (initialFile) {
      setUploadedFile(createUploadedFileInfo(initialFile));
      setPreviewPage(1);
      setPreviewZoom(100);
    }
  }, [initialFile]);

  useEffect(() => {
    if (!uploadedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(uploadedFile.file);
    setPreviewUrl(url);
    return () => { URL.revokeObjectURL(url); };
  }, [uploadedFile]);

  const applySelectedFile = (file: File) => {
    setUploadedFile(createUploadedFileInfo(file));
    setPreviewPage(1);
    setPreviewZoom(100);
    if (docTitle === '' || docTitle === 'Đề cương ôn tập Sinh học 10 học kỳ 2') {
      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) applySelectedFile(e.target.files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) applySelectedFile(e.dataTransfer.files[0]);
  };

  const handleDownloadOriginal = () => {
    if (!previewUrl || !uploadedFile) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = uploadedFile.name;
    link.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewPage(1);
    setPreviewZoom(100);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full h-screen bg-bg-base select-none text-text-primary font-sans animate-fadeIn flex flex-col overflow-hidden">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <h1 className="text-lg font-black text-text-primary">Tải file tài liệu lên</h1>
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
            onClick={() => { alert('Tải lên và lưu tài liệu thành công!'); setMode('dashboard'); }}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100"
          >
            <Upload size={14} /> Tải lên và lưu
          </button>
        </div>
      </header>

      {/* Content Layout — p-8 đều, overflow-hidden */}
      <div className="flex-1 flex gap-8 p-8 h-[calc(100vh-theme(spacing.20))] bg-[#F8FAFC] overflow-hidden min-h-0">

        {/* CỘT TRÁI — 50%, scroll độc lập */}
        <div className="w-[50%] h-full flex flex-col gap-6 overflow-y-auto pr-2 shrink-0 min-w-0">

          {/* 1. Tải file */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-text-primary">1. Tải file tài liệu</h2>

            {/* Drag & drop zone */}
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
                accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.zip"
              />
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm shadow-indigo-100/50">
                <Upload size={20} />
              </div>
              <p className="text-xs font-black text-text-primary text-center">Kéo thả file vào đây</p>
              <p className="text-[10px] text-[#7E8B9B] font-bold text-center mt-1">hoặc</p>
              <span className="mt-2.5 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-black rounded-xl transition cursor-pointer shadow-sm">
                {uploadedFile ? 'Thay đổi file' : 'Chọn file từ máy tính'}
              </span>
              <p className="text-[9px] text-slate-400 font-bold text-center mt-3">
                Hỗ trợ: PDF, DOCX, DOC, PPTX, ZIP (tối đa 50MB)
              </p>
            </div>

            {/* File indicator */}
            {uploadedFile ? (
              <div className="p-3 border border-emerald-100 bg-emerald-50/20 rounded-2xl flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex flex-col items-center justify-center text-[9px] font-black font-sans shrink-0 text-red-500">
                    <File size={16} className="stroke-[2.5]" />
                    <span className="-mt-0.5">{uploadedFile.kind}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-text-primary truncate max-w-[200px] sm:max-w-md">{uploadedFile.name}</h4>
                    <p className="text-[9px] text-[#7E8B9B] font-bold mt-0.5">{uploadedFile.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 size={14} className="stroke-[2.5]" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
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

          {/* 2. Thông tin tài liệu */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-text-primary">2. Thông tin tài liệu</h2>

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
                <label className="text-[10px] font-black text-[#7E8B9B] uppercase tracking-wider">Học kỳ</label>
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

              {/* Có lời giải */}
              <div className="sm:col-span-2 flex items-center justify-between py-2 border-t border-slate-50 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-text-primary">Có lời giải</span>
                  <span className="cursor-help" title="Tài liệu đính kèm có chứa hướng dẫn giải chi tiết">
                    <HelpCircle size={14} className="text-slate-400" />
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{hasSolution ? 'Có' : 'Không'}</span>
                  <button
                    onClick={() => setHasSolution(!hasSolution)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer outline-none ${hasSolution ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${hasSolution ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CỘT PHẢI — 50%, overflow-hidden ngăn tràn */}
        <div className="w-[50%] h-full flex flex-col min-h-0 min-w-0 overflow-hidden shrink-0">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col h-full min-h-0">

            {/* Card header: tiêu đề + tải xuống */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-primary flex flex-col items-center justify-center text-[6px] font-black font-sans shrink-0">
                  <File size={11} className="stroke-[2.5]" />
                  <span className="-mt-0.5">{uploadedFile?.kind ?? 'FILE'}</span>
                </div>
                <span className="text-sm font-black text-text-primary">4. Xem trước file</span>
                {uploadedFile && (
                  <span className="text-[10px] font-bold text-slate-400 truncate max-w-[160px] ml-1">
                    — {uploadedFile.name}
                  </span>
                )}
              </div>
              {uploadedFile && (
                <button
                  onClick={handleDownloadOriginal}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-primary text-[10px] font-black transition cursor-pointer border border-indigo-100"
                >
                  <Download size={12} className="stroke-[2.5]" />
                  Tải xuống
                </button>
              )}
            </div>

            {/* Viewport */}
            {uploadedFile ? (
              <div className="flex-1 relative overflow-hidden rounded-2xl border border-slate-200 min-h-0 bg-slate-100">

                {/* Floating dark pill toolbar — PDF only */}
                {isPdfFile && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-slate-800/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg select-none">
                    <button
                      onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                      disabled={previewPage <= 1}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-200 hover:text-white disabled:opacity-30 transition cursor-pointer"
                    >
                      <ChevronLeft size={14} className="stroke-[2.5]" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        value={previewPage}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          if (!isNaN(v) && v >= 1) setPreviewPage(v);
                        }}
                        className="w-10 text-center bg-slate-900/50 border border-slate-600 rounded text-xs py-0.5 focus:outline-none focus:border-indigo-400 text-white font-black"
                      />
                      <span className="text-slate-400 text-[10px]">trang</span>
                    </div>

                    <button
                      onClick={() => setPreviewPage(p => p + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-200 hover:text-white transition cursor-pointer"
                    >
                      <ChevronRight size={14} className="stroke-[2.5]" />
                    </button>

                    <div className="w-px h-4 bg-slate-600" />

                    <button
                      onClick={() => setPreviewZoom(z => Math.max(10, z - 10))}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-200 hover:text-white font-black text-sm transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-[10px] font-black text-slate-300 min-w-[30px] text-center">
                      {previewZoom}%
                    </span>
                    <button
                      onClick={() => setPreviewZoom(z => Math.min(300, z + 10))}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-200 hover:text-white font-black text-sm transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* PDF iframe */}
                {isPdfFile && filePreviewSrc && (
                  <iframe
                    key={`${previewPage}-${previewZoom}-${uploadedFile.name}`}
                    title={`Xem trước ${uploadedFile.name}`}
                    src={filePreviewSrc}
                    className="w-full h-full border-0 bg-white"
                  />
                )}

                {/* Image */}
                {isImageFile && filePreviewSrc && (
                  <div className="flex h-full items-center justify-center p-4">
                    <img
                      src={filePreviewSrc}
                      alt={uploadedFile.name}
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                  </div>
                )}

                {/* Office with public URL */}
                {isOfficeFile && officePreviewSrc && (
                  <iframe
                    title={`Xem trước ${uploadedFile.name}`}
                    src={officePreviewSrc}
                    className="w-full h-full border-0 bg-white"
                  />
                )}

                {/* Office — no public URL */}
                {isOfficeFile && !officePreviewSrc && (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                      <File size={20} />
                    </div>
                    <p className="max-w-[320px] text-xs font-bold text-text-secondary">
                      Microsoft Office Online Viewer chỉ xem được Word, Excel và PowerPoint khi file đã có URL công khai.
                    </p>
                  </div>
                )}

                {/* Unsupported */}
                {!isPdfFile && !isImageFile && !isOfficeFile && (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-400">
                      <File size={20} />
                    </div>
                    <p className="max-w-[280px] text-xs font-bold text-text-secondary">
                      Trình duyệt không hỗ trợ xem trước định dạng {uploadedFile.kind}. Bạn vẫn có thể tải file gốc để kiểm tra.
                    </p>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center min-h-0">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mb-3">
                  <File size={24} />
                </div>
                <p className="text-xs font-bold text-text-secondary max-w-[200px]">
                  Hãy tải lên một file tài liệu để xem trước nội dung tại đây.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
