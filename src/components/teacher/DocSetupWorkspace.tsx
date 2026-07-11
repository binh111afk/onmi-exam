import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Upload, 
  BookOpen, 
  FileText, 
  Activity, 
  Image as ImageIcon 
} from 'lucide-react';
import { Select } from '../Select';

export interface DocSetupMetadata {
  name: string;
  subject: string;
  grade: string;
  docType: string;
  description: string;
  coverImage?: string;
}

interface DocSetupWorkspaceProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor' | 'document-setup') => void;
  metadata?: DocSetupMetadata;
  onSubmit: (meta: DocSetupMetadata) => void;
}

export const DocSetupWorkspace: React.FC<DocSetupWorkspaceProps> = ({
  setMode,
  metadata,
  onSubmit,
}) => {
  const [name, setName] = useState(metadata?.name || '');
  const [subject, setSubject] = useState(metadata?.subject || '');
  const [grade, setGrade] = useState(metadata?.grade || '');
  const [docType, setDocType] = useState(metadata?.docType || '');
  const [description, setDescription] = useState(metadata?.description || '');
  const [coverImage, setCoverImage] = useState<string | undefined>(metadata?.coverImage);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['png', 'jpg', 'jpeg', 'webp'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !validExtensions.includes(ext)) {
        alert('Định dạng file ảnh không hợp lệ. Vui lòng chọn PNG, JPG hoặc WEBP.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 300) {
      setDescription(val);
    }
  };

  const isFormValid = name.trim() !== '' && subject !== '' && grade !== '' && docType !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onSubmit({
      name,
      subject,
      grade,
      docType,
      description,
      coverImage,
    });
  };

  return (
    <div className="w-full min-h-screen bg-bg-base select-none text-text-primary font-sans animate-fadeIn flex flex-col pb-12">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center shrink-0 shadow-sm gap-4">
        <button
          type="button"
          onClick={() => setMode('dashboard')}
          className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
          title="Quay lại Dashboard"
        >
          <ChevronLeft size={18} className="stroke-[2.5]" />
        </button>
        <div>
          <h1 className="text-lg font-black text-text-primary leading-tight">
            Thiết lập tài liệu mới
          </h1>
          <p className="text-xs text-[#7E8B9B] font-bold mt-0.5">
            Nhập thông tin cơ bản của tài liệu trước khi bắt đầu soạn thảo.
          </p>
        </div>
      </header>

      {/* Content Layout */}
      <div className="max-w-[1200px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          
          {/* Document Name */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 block">
              1. Tên tài liệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên tài liệu..."
              className="w-full text-xs animate-none"
              required
            />
          </div>

          {/* Subject & Grade Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subject */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block">
                2. Môn học <span className="text-red-500">*</span>
              </label>
              <Select
                value={subject}
                onChange={setSubject}
                options={['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD', 'Tin học'].map(s => ({ value: s, label: s }))}
                placeholder="Chọn môn học..."
              />
            </div>

            {/* Grade */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block">
                3. Khối lớp <span className="text-red-500">*</span>
              </label>
              <Select
                value={grade}
                onChange={setGrade}
                options={['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map(g => ({ value: g, label: g }))}
                placeholder="Chọn khối lớp..."
              />
            </div>
          </div>

          {/* Document Type Selectable Cards */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 block">
              4. Loại tài liệu <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {/* Type 1: Lý thuyết */}
              <div
                onClick={() => setDocType('Tài liệu lý thuyết')}
                className={`border rounded-2xl p-4 transition-all duration-205 cursor-pointer flex items-center justify-between group ${
                  docType === 'Tài liệu lý thuyết'
                    ? 'border-primary bg-primary-light/30'
                    : 'border-slate-100 hover:border-indigo-200 bg-slate-50/20 hover:bg-white shadow-sm hover:shadow'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    docType === 'Tài liệu lý thuyết' ? 'bg-primary text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Tài liệu lý thuyết</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Bài học, ghi chú, sơ đồ tư duy, kiến thức trọng tâm.
                    </p>
                  </div>
                </div>
                {docType === 'Tài liệu lý thuyết' && <CheckCircle2 size={16} className="text-primary shrink-0 animate-fadeIn" />}
              </div>

              {/* Type 2: Đề thi */}
              <div
                onClick={() => setDocType('Đề thi / Kiểm tra')}
                className={`border rounded-2xl p-4 transition-all duration-205 cursor-pointer flex items-center justify-between group ${
                  docType === 'Đề thi / Kiểm tra'
                    ? 'border-primary bg-primary-light/30'
                    : 'border-slate-100 hover:border-indigo-200 bg-slate-50/20 hover:bg-white shadow-sm hover:shadow'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    docType === 'Đề thi / Kiểm tra' ? 'bg-primary text-white' : 'bg-purple-50 text-primary'
                  }`}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Đề thi / Kiểm tra</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Đề luyện tập, đề kiểm tra, đề thi thử.
                    </p>
                  </div>
                </div>
                {docType === 'Đề thi / Kiểm tra' && <CheckCircle2 size={16} className="text-primary shrink-0 animate-fadeIn" />}
              </div>

              {/* Type 3: Thực hành */}
              <div
                onClick={() => setDocType('Tài liệu thực hành')}
                className={`border rounded-2xl p-4 transition-all duration-205 cursor-pointer flex items-center justify-between group ${
                  docType === 'Tài liệu thực hành'
                    ? 'border-primary bg-primary-light/30'
                    : 'border-slate-100 hover:border-indigo-200 bg-slate-50/20 hover:bg-white shadow-sm hover:shadow'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    docType === 'Tài liệu thực hành' ? 'bg-primary text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Tài liệu thực hành</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      Thực hành, bài tập, hoạt động trên lớp.
                    </p>
                  </div>
                </div>
                {docType === 'Tài liệu thực hành' && <CheckCircle2 size={16} className="text-primary shrink-0 animate-fadeIn" />}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-700 block">
                5. Mô tả ngắn (Tùy chọn)
              </label>
              <span className="text-[9px] text-slate-400 font-bold">
                {description.length}/300 ký tự
              </span>
            </div>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Nhập mô tả ngắn gọn về tài liệu này..."
              rows={3}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:border-primary focus:outline-none transition resize-none font-sans"
            />
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 block">
              6. Ảnh bìa tài liệu (Tùy chọn)
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
            />

            {coverImage ? (
              <div className="relative group rounded-2xl overflow-hidden border border-slate-200 max-h-[160px] aspect-[16/9] flex items-center justify-center bg-slate-50">
                <img
                  src={coverImage}
                  alt="Ảnh bìa preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleImageUploadClick}
                    className="px-3.5 py-1.5 bg-white text-slate-800 text-[10px] font-black rounded-lg hover:bg-slate-50 transition cursor-pointer"
                  >
                    Thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-3.5 py-1.5 bg-red-650 text-white text-[10px] font-black rounded-lg hover:bg-red-700 transition cursor-pointer"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={handleImageUploadClick}
                className="border-2 border-dashed border-indigo-50 hover:border-primary/40 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/20 hover:bg-primary-light/5 transition cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 group-hover:text-primary flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                  <Upload size={16} />
                </div>
                <div className="text-[10px] font-bold text-slate-655 text-center">
                  Click để tải lên ảnh bìa
                </div>
                <div className="text-[9px] text-slate-400 font-bold mt-1 text-center">
                  Hỗ trợ: PNG, JPG, JPEG, WEBP
                </div>
              </div>
            )}
          </div>

          {/* Action CTA button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-2 shadow-sm ${
                isFormValid
                  ? 'bg-primary hover:bg-primary-hover cursor-pointer shadow-indigo-100'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Tạo và bắt đầu soạn
            </button>
          </div>
        </form>

        {/* Right Preview Panel: 5 cols */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Xem trước thông tin hiển thị
          </h3>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            {/* Header Image Area */}
            <div className="aspect-[16/9] w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden shrink-0">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Ảnh bìa preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400/80">
                  <ImageIcon size={36} className="stroke-[1.5]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400/60">Chưa có ảnh bìa</span>
                </div>
              )}

              {/* Floating Subject & Grade badge */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                {subject && (
                  <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-md uppercase shadow-sm">
                    {subject}
                  </span>
                )}
                {grade && (
                  <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded-md uppercase shadow-sm">
                    {grade}
                  </span>
                )}
              </div>
            </div>

            {/* Document Info Body */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                    {docType === 'Tài liệu thực hành' ? (
                      <Activity size={12} />
                    ) : docType === 'Đề thi / Kiểm tra' ? (
                      <FileText size={12} />
                    ) : (
                      <BookOpen size={12} />
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">
                    {docType || 'Loại tài liệu'}
                  </span>
                </div>

                <h2 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">
                  {name || 'Tên tài liệu của bạn'}
                </h2>

                <p className="text-[10px] text-slate-400 font-bold leading-relaxed line-clamp-4">
                  {description || 'Mô tả ngắn về nội dung tài liệu sẽ được hiển thị ở đây để học sinh nắm bắt tổng quan trước khi đọc.'}
                </p>
              </div>

              {/* Card Footer simulation */}
              <div className="pt-4 border-t border-slate-100/60 flex items-center justify-between">
                <span className="text-[8px] font-extrabold text-[#6C5DD3] uppercase flex items-center gap-0.5">
                  Chi tiết tài liệu
                </span>
                <span className="text-[8px] text-slate-400 font-bold">1 phút đọc</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
