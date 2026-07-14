import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Send,
  X,
  Lock,
  Globe,
  Users,
  Link,
  Copy,
  QrCode,
  Eye,
  EyeOff,
  Calendar,
  Info,
  CheckCircle2,
  Rocket,
  Upload,
  BookOpen,
  FileText,
  Activity,
  Image as ImageIcon
} from 'lucide-react';
import { Checkbox } from '../../Checkbox';
import { Select } from '../../Select';
import { DateTimePicker } from '../../common/DateTimePicker';
import type { DocSetupMetadata } from '../../../types/doc-editor';

interface Lesson {
  id: string;
  title: string;
  blocks: any[];
}

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLesson: Lesson | null;
  onPublishConfirm: () => void;
  metadata?: DocSetupMetadata;
  onChangeMetadata?: (metadata: DocSetupMetadata) => void;
}

const getSubjectCover = (subject: string): string => {
  const mapping: Record<string, string> = {
    'Toán học': '/math_illustration.png',
    'Vật lý': '/physics_illustration.png',
    'Hóa học': '/chemistry_illustration.png',
    'Sinh học': '/biology_illustration.png',
    'Tiếng Anh': '/english_illustration.png',
    'Anh văn': '/english_illustration.png',
    'Công nghệ': '/technology_illustration.png',
    'Tin học': '/it_illustration.png',
    'Lịch sử': '/history_illustration.png',
    'Địa lý': '/geography_illustration.png',
    'Kinh tế pháp luật': '/economics_illustration.png',
  };
  return mapping[subject] || '/biology_illustration.png';
};

const subjectOptions = [
  { value: 'Toán học', label: 'Toán học' },
  { value: 'Vật lý', label: 'Vật lý' },
  { value: 'Hóa học', label: 'Hóa học' },
  { value: 'Sinh học', label: 'Sinh học' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Tin học', label: 'Tin học' },
  { value: 'Lịch sử', label: 'Lịch sử' },
  { value: 'Địa lý', label: 'Địa lý' },
  { value: 'Kinh tế pháp luật', label: 'Kinh tế pháp luật' },
  { value: 'Công nghệ', label: 'Công nghệ' },
];

const gradeOptions = [
  { value: 'Lớp 10', label: 'Lớp 10' },
  { value: 'Lớp 11', label: 'Lớp 11' },
  { value: 'Lớp 12', label: 'Lớp 12' },
];

const docTypeOptions = [
  { value: 'Tài liệu học tập', label: 'Tài liệu học tập' },
  { value: 'Tài liệu thực hành', label: 'Tài liệu thực hành' },
  { value: 'Đề thi / Kiểm tra', label: 'Đề thi / Kiểm tra' },
];

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  activeLesson,
  onPublishConfirm,
  metadata,
  onChangeMetadata,
}) => {
  // State for publish status: 'draft' | 'public' | 'private'
  const [publishStatus, setPublishStatus] = useState<'draft' | 'public' | 'private'>('public');

  // State for access permission: 'all' | 'class' | 'password'
  const [accessLevel, setAccessLevel] = useState<'all' | 'class' | 'password'>('all');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);

  // States for check boxes (Cấu hình học tập)
  const [showAnswer, setShowAnswer] = useState(true);
  const [allowRedo, setAllowRedo] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [autoGrade, setAutoGrade] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [showCorrectOrder, setShowCorrectOrder] = useState(false);
  const [allowDownload, setAllowDownload] = useState(false);

  // States for time settings
  const [startTime, setStartTime] = useState('2026-07-14T08:00');
  const [endTime, setEndTime] = useState('2026-07-28T23:59');
  const [unlimitedTime, setUnlimitedTime] = useState(false);

  // UI state feedback
  const [copied, setCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `https://onmi.vn/doc/${activeLesson?.id || '6HD7KSJ'}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleImageUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file && onChangeMetadata && metadata) {
        try {
          const url = URL.createObjectURL(file);
          onChangeMetadata({ ...metadata, coverImage: url });
        } catch (err) {
          console.error('Failed to load image preview:', err);
        }
      }
    };
    input.click();
  };

  const handleRemoveImage = () => {
    if (onChangeMetadata && metadata) {
      onChangeMetadata({ ...metadata, coverImage: undefined });
    }
  };

  // Generate checklist state based on content & form validity
  const titleExists = !!metadata?.name;
  const contentExists = (activeLesson?.blocks?.length || 0) > 0;
  const subjectSelected = !!metadata?.subject;
  const gradeSelected = !!metadata?.grade;
  const docTypeSelected = !!metadata?.docType;

  const isFormValid = !!(metadata?.name && metadata?.subject && metadata?.grade && metadata?.docType);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Glass Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Surface Container */}
      <div className="bg-[#F8FAFC] rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-[1020px] overflow-hidden z-10 animate-scaleIn select-none flex flex-col max-h-[85vh]">
        {/* Fixed Header */}
        <header className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shadow-sm border border-indigo-100/50">
              <Send size={18} className="stroke-[2.5] text-[#6C5DD3]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">
                Thiết lập & Xuất bản tài liệu
              </h3>
              <p className="text-[10px] font-bold text-slate-400 leading-normal">
                Hoàn thiện thông tin cơ bản và cấu hình quyền học tập trước khi đăng tải
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-xl transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        {/* Scrollable Body Container */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
          {/* Left Column (Inputs & Settings - 7/12) */}
          <div className="lg:col-span-7 space-y-6 overflow-y-auto overflow-x-hidden max-h-[calc(85vh-140px)] pr-3 pb-6 scrollbar-thin">
            
            {/* Part A: Basic Document Info (Setup old fields) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4 shadow-sm">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-wider block border-b border-slate-100 pb-2">
                Thông tin cơ bản tài liệu
              </h4>
              
              {/* Document Title */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                  Tiêu đề tài liệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={metadata?.name || ''}
                  onChange={(e) => onChangeMetadata?.({ ...metadata!, name: e.target.value })}
                  placeholder="Ví dụ: Đề khảo sát giải tích 12 chương 1..."
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-[10px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                />
              </div>

              {/* Subject, Grade, DocType Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                    Môn học <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={metadata?.subject || ''}
                    onChange={(val) => onChangeMetadata?.({ ...metadata!, subject: val })}
                    options={subjectOptions}
                    placeholder="Chọn môn"
                    size="sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                    Khối lớp <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={metadata?.grade || ''}
                    onChange={(val) => onChangeMetadata?.({ ...metadata!, grade: val })}
                    options={gradeOptions}
                    placeholder="Chọn lớp"
                    size="sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                    Loại tài liệu <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={metadata?.docType || ''}
                    onChange={(val) => onChangeMetadata?.({ ...metadata!, docType: val })}
                    options={docTypeOptions}
                    placeholder="Chọn loại"
                    size="sm"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                  Mô tả ngắn
                </label>
                <textarea
                  value={metadata?.description || ''}
                  onChange={(e) => onChangeMetadata?.({ ...metadata!, description: e.target.value })}
                  placeholder="Mô tả tóm tắt nội dung tài liệu..."
                  rows={2}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-[10px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition resize-none"
                />
              </div>

              {/* Custom Cover Uploader */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">
                  Ảnh bìa tài liệu tùy chỉnh
                </label>
                {metadata?.coverImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 h-28 flex items-center justify-center bg-slate-50 shadow-sm animate-fadeIn">
                    <img
                      src={metadata.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleImageUploadClick}
                        className="px-3 py-1 bg-white text-slate-800 text-[9px] font-black rounded hover:bg-slate-50 transition cursor-pointer shadow-sm"
                      >
                        Thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1 bg-red-650 text-white text-[9px] font-black rounded hover:bg-red-700 transition cursor-pointer shadow-sm"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={handleImageUploadClick}
                    className="border border-dashed border-indigo-150 hover:border-primary rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/20 hover:bg-primary/5 transition cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-white text-slate-400 group-hover:text-primary flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 shadow-sm border border-slate-100">
                      <Upload size={14} />
                    </div>
                    <div className="text-[9px] font-bold text-slate-500">
                      Click để tải lên ảnh bìa thiết kế riêng
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Part B: Access & Learning Configurations */}
            
            {/* 1. Trạng thái xuất bản */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Trạng thái xuất bản
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div
                  onClick={() => setPublishStatus('draft')}
                  className={`bg-white rounded-2xl p-4 border transition cursor-pointer relative flex flex-col justify-between h-[92px] ${
                    publishStatus === 'draft'
                      ? 'border-primary bg-[#F1EEFC]/40 shadow-[0_4px_12px_rgba(108,93,211,0.06)]'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${publishStatus === 'draft' ? 'bg-[#F1EEFC] text-primary' : 'bg-slate-50 text-slate-400'}`}>
                      <Lock size={14} className="stroke-[2.5]" />
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      publishStatus === 'draft' ? 'border-primary' : 'border-slate-300'
                    }`}>
                      {publishStatus === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800">Bản nháp</h4>
                    <p className="text-[9px] font-bold text-slate-400 leading-tight">Chỉ bạn có thể xem</p>
                  </div>
                </div>

                <div
                  onClick={() => setPublishStatus('public')}
                  className={`bg-white rounded-2xl p-4 border transition cursor-pointer relative flex flex-col justify-between h-[92px] ${
                    publishStatus === 'public'
                      ? 'border-primary bg-[#F1EEFC]/40 shadow-[0_4px_12px_rgba(108,93,211,0.06)]'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${publishStatus === 'public' ? 'bg-[#F1EEFC] text-primary' : 'bg-slate-50 text-slate-400'}`}>
                      <Globe size={14} className="stroke-[2.5]" />
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      publishStatus === 'public' ? 'border-primary' : 'border-slate-300'
                    }`}>
                      {publishStatus === 'public' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800">Công khai</h4>
                    <p className="text-[9px] font-bold text-slate-400 leading-tight">Bất kỳ ai có liên kết đều xem được</p>
                  </div>
                </div>

                <div
                  onClick={() => setPublishStatus('private')}
                  className={`bg-white rounded-2xl p-4 border transition cursor-pointer relative flex flex-col justify-between h-[92px] ${
                    publishStatus === 'private'
                      ? 'border-primary bg-[#F1EEFC]/40 shadow-[0_4px_12px_rgba(108,93,211,0.06)]'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-lg ${publishStatus === 'private' ? 'bg-[#F1EEFC] text-primary' : 'bg-slate-50 text-slate-400'}`}>
                      <Users size={14} className="stroke-[2.5]" />
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      publishStatus === 'private' ? 'border-primary' : 'border-slate-300'
                    }`}>
                      {publishStatus === 'private' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-800">Riêng tư</h4>
                    <p className="text-[9px] font-bold text-slate-400 leading-tight">Chỉ học sinh trong lớp mới xem được</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Chia sẻ */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Liên kết chia sẻ nhanh
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Link size={13} />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-[11px] font-bold text-slate-800 outline-none select-all font-mono"
                  />
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2.5 border border-primary text-primary hover:bg-[#F1EEFC]/45 text-[10px] font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer shrink-0 bg-white"
                >
                  <Copy size={13} className="stroke-[2.5]" />
                  {copied ? 'Đã chép' : 'Sao chép'}
                </button>
                <button
                  onClick={() => setShowQrCode(true)}
                  className="px-3.5 py-2.5 border border-slate-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-[10px] font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer shrink-0 bg-white"
                >
                  <QrCode size={13} className="stroke-[2.5]" />
                  QR Code
                </button>
              </div>
              <p className="text-[9px] font-bold text-slate-400 leading-normal">
                {publishStatus === 'draft'
                  ? 'Tài liệu đang ở chế độ Bản nháp, học sinh sẽ không truy cập được liên kết này.'
                  : publishStatus === 'private'
                  ? 'Chỉ những học sinh được chỉ định trong lớp học mới có quyền truy cập.'
                  : 'Bất kỳ ai có liên kết đều có thể truy cập tài liệu này.'}
              </p>
            </div>

            {/* 3. Quyền truy cập */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Quyền truy cập chi tiết
              </label>
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
                <div
                  onClick={() => setAccessLevel('all')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50/50 text-indigo-500">
                      <Globe size={13} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-700">Ai có liên kết đều xem được</h4>
                      <p className="text-[9px] font-bold text-slate-400">Không cần đăng nhập</p>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    accessLevel === 'all' ? 'border-primary' : 'border-slate-300'
                  }`}>
                    {accessLevel === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </div>

                <div
                  onClick={() => setAccessLevel('class')}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-50/50 text-indigo-500">
                      <Users size={13} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-700">Chỉ học sinh trong lớp</h4>
                      <p className="text-[9px] font-bold text-slate-400">Chỉ học sinh của lớp mới truy cập được</p>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    accessLevel === 'class' ? 'border-primary' : 'border-slate-300'
                  }`}>
                    {accessLevel === 'class' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </div>

                <div className="transition">
                  <div
                    onClick={() => setAccessLevel('password')}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-indigo-50/50 text-indigo-500">
                        <Lock size={13} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-700">Có mật khẩu bảo mật</h4>
                        <p className="text-[9px] font-bold text-slate-400">Yêu cầu nhập mật khẩu để truy cập</p>
                      </div>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      accessLevel === 'password' ? 'border-primary' : 'border-slate-300'
                    }`}>
                      {accessLevel === 'password' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                  </div>

                  {accessLevel === 'password' && (
                    <div className="px-14 pb-4 animate-fadeIn">
                      <div className="relative max-w-xs">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                          <Lock size={13} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-8 pr-9 py-2 text-[10px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition tracking-widest font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-655 cursor-pointer"
                        >
                          {showPassword ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Cấu hình học tập */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Cấu hình tương tác & chấm điểm
              </label>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-white rounded-2xl p-4 border border-slate-200/80">
                <Checkbox
                  checked={showAnswer}
                  onChange={setShowAnswer}
                  label={<span className="text-[10px] font-black text-slate-600">Hiện đáp án sau khi nộp bài</span>}
                />
                <Checkbox
                  checked={autoGrade}
                  onChange={setAutoGrade}
                  label={<span className="text-[10px] font-black text-slate-600">Tự động chấm điểm</span>}
                />
                <Checkbox
                  checked={allowRedo}
                  onChange={setAllowRedo}
                  label={<span className="text-[10px] font-black text-slate-600">Cho phép làm lại</span>}
                />
                <Checkbox
                  checked={showScore}
                  onChange={setShowScore}
                  label={<span className="text-[10px] font-black text-slate-600">Hiển thị điểm số</span>}
                />
                <Checkbox
                  checked={shuffleQuestions}
                  onChange={setShuffleQuestions}
                  label={<span className="text-[10px] font-black text-slate-600">Xáo trộn câu hỏi</span>}
                />
                <Checkbox
                  checked={showCorrectOrder}
                  onChange={setShowCorrectOrder}
                  label={<span className="text-[10px] font-black text-slate-600">Hiển thị thứ tự đúng</span>}
                />
                <Checkbox
                  checked={shuffleAnswers}
                  onChange={setShuffleAnswers}
                  label={<span className="text-[10px] font-black text-slate-600">Xáo trộn đáp án</span>}
                />
                <Checkbox
                  checked={allowDownload}
                  onChange={setAllowDownload}
                  label={<span className="text-[10px] font-black text-slate-600">Cho phép tải tài liệu</span>}
                />
              </div>
            </div>

            {/* 5. Thời gian (Tùy chọn) */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Thời hạn hiển thị (Tùy chọn)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className={`space-y-1.5 transition-opacity duration-200 ${unlimitedTime ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Bắt đầu</span>
                  <DateTimePicker
                    value={startTime}
                    onChange={setStartTime}
                    disabled={unlimitedTime}
                    align="left"
                  />
                </div>

                <div className={`space-y-1.5 transition-opacity duration-200 ${unlimitedTime ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Kết thúc</span>
                  <DateTimePicker
                    value={endTime}
                    onChange={setEndTime}
                    disabled={unlimitedTime}
                    align="right"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => setUnlimitedTime(prev => !prev)}
                  className={`w-9 h-5 rounded-full relative transition-colors duration-200 outline-none cursor-pointer ${
                    unlimitedTime ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform duration-200 shadow-sm ${
                    unlimitedTime ? 'left-[18px]' : 'left-[2px]'
                  }`} />
                </button>
                <span className="text-[10px] font-bold text-slate-500">Không giới hạn thời gian</span>
              </div>
            </div>

          </div>

          {/* Right Column (Visual Card Preview & Checks - 5/12) */}
          <div className="lg:col-span-5 space-y-5 overflow-y-auto max-h-[calc(85vh-140px)] pr-1 pb-6">
            
            {/* Visual Card Preview */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Xem trước hiển thị</span>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden shrink-0">
                  <img
                    src={metadata?.coverImage || getSubjectCover(metadata?.subject || '')}
                    alt="Subject Cover Illustration"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
                  
                  {/* Floating badges */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                    {metadata?.subject && (
                      <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-md uppercase shadow-sm">
                        {metadata.subject}
                      </span>
                    )}
                    {metadata?.grade && (
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded-md uppercase shadow-sm">
                        {metadata.grade}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                        {metadata?.docType === 'Tài liệu thực hành' ? (
                          <Activity size={12} />
                        ) : metadata?.docType === 'Đề thi / Kiểm tra' ? (
                          <FileText size={12} />
                        ) : (
                          <BookOpen size={12} />
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide">
                        {metadata?.docType || 'Loại tài liệu'}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 leading-snug line-clamp-2">
                      {metadata?.name || 'Tài liệu chưa đặt tên'}
                    </h4>

                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed line-clamp-3">
                      {metadata?.description || 'Mô tả ngắn của tài liệu sẽ hiển thị tại đây giúp học sinh dễ dàng nắm bắt tổng quan trước khi đọc.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between text-[8px] font-bold text-slate-400">
                    <span className="text-[#6C5DD3] uppercase font-extrabold">Chi tiết tài liệu</span>
                    <span>1 phút đọc</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Box */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Checklist điều kiện xuất bản</span>
              <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className={`${titleExists ? 'text-emerald-500' : 'text-slate-300'} stroke-[2.5]`} />
                    <span className={titleExists ? 'text-slate-655' : 'text-slate-400'}>Có tiêu đề tài liệu</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className={`${contentExists ? 'text-emerald-500' : 'text-slate-300'} stroke-[2.5]`} />
                    <span className={contentExists ? 'text-slate-655' : 'text-slate-400'}>Có ít nhất 1 nội dung ({activeLesson?.blocks?.length || 0} blocks)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className={`${subjectSelected ? 'text-emerald-500' : 'text-slate-300'} stroke-[2.5]`} />
                    <span className={subjectSelected ? 'text-slate-655' : 'text-slate-400'}>Đã chọn môn học</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className={`${gradeSelected ? 'text-emerald-500' : 'text-slate-300'} stroke-[2.5]`} />
                    <span className={gradeSelected ? 'text-slate-655' : 'text-slate-400'}>Đã chọn khối lớp</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className={`${docTypeSelected ? 'text-emerald-500' : 'text-slate-300'} stroke-[2.5]`} />
                    <span className={docTypeSelected ? 'text-slate-655' : 'text-slate-400'}>Đã chọn loại tài liệu</span>
                  </div>
                </div>

                {/* Checklist Metal Clip Illustration */}
                <div className="w-[84px] h-[84px] shrink-0 flex items-center justify-center">
                  <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="22" y="24" width="56" height="66" rx="12" fill="#EEF2F6" />
                    <rect x="20" y="20" width="56" height="66" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
                    <rect x="38" y="14" width="20" height="10" rx="3" fill="#CBD5E1" />
                    <circle cx="48" cy="19" r="2" fill="#94A3B8" />
                    <rect x="30" y="32" width="6" height="6" rx="2" fill={titleExists ? '#10B981' : '#CBD5E1'} />
                    <rect x="40" y="34" width="28" height="3" rx="1.5" fill="#E2E8F0" />
                    <rect x="30" y="44" width="6" height="6" rx="2" fill={contentExists ? '#10B981' : '#CBD5E1'} />
                    <rect x="40" y="46" width="24" height="3" rx="1.5" fill="#E2E8F0" />
                    <rect x="30" y="56" width="6" height="6" rx="2" fill={subjectSelected && gradeSelected ? '#10B981' : '#CBD5E1'} />
                    <rect x="40" y="58" width="20" height="3" rx="1.5" fill="#E2E8F0" />
                    <rect x="30" y="68" width="6" height="6" rx="2" fill={docTypeSelected ? '#10B981' : '#CBD5E1'} />
                    <rect x="40" y="70" width="26" height="3" rx="1.5" fill="#E2E8F0" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Note box */}
            <div className="bg-[#F1EEFC] rounded-2xl p-4 border border-[#8F85F3]/10 flex items-start gap-3">
              <div className="text-primary shrink-0 mt-0.5">
                <Info size={14} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h5 className="text-[10px] font-black text-primary uppercase tracking-wide">Lưu ý</h5>
                <p className="text-[9px] font-bold text-slate-500 leading-normal">
                  Sau khi xuất bản, bạn vẫn có thể quay lại chỉnh sửa tài liệu bất kỳ lúc nào. Các thay đổi sẽ tự động đồng bộ.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Fixed Footer */}
        <footer className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-50 text-[10px] font-bold rounded-xl transition cursor-pointer"
          >
            Đóng lại
          </button>
          <button
            onClick={() => {
              if (isFormValid) {
                onPublishConfirm();
                onClose();
              }
            }}
            disabled={!isFormValid}
            className={`px-5 py-2 text-white text-[10px] font-black rounded-xl flex items-center gap-1.5 transition shadow-sm ${
              isFormValid
                ? 'bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover cursor-pointer shadow-indigo-100'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Rocket size={13} className="stroke-[2.5]" />
            Xuất bản tài liệu
          </button>
        </footer>
      </div>

      {/* QR Code Mini-Modal Dialog overlay */}
      {showQrCode && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setShowQrCode(false)}
          />
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-[280px] z-10 flex flex-col items-center text-center space-y-4 animate-scaleIn select-none">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Mã QR truy cập tài liệu
            </h4>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center">
              <svg width="140" height="140" viewBox="0 0 29 29" fill="none" shapeRendering="crispEdges">
                <rect width="29" height="29" fill="#F8FAFC" />
                <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H2z" fill="#1E293B" />
                <path d="M22 0h7v7h-7zm1 1v5h5V1zm1 1h3v3H4z" fill="#1E293B" />
                <path d="M0 22h7v7H0zm1 1v5h5v-5zm1 1h3v3H2z" fill="#1E293B" />
                <path d="M20 20h5v5h-5zm1 1v3h3v-3zm1 1h1v1h-1z" fill="#1E293B" />
                <path d="M8 1h1v1H8zm3 0h2v1h-2zm4 0h1v2h-1zm2 0h2v1h-2zm3 0h1v1h-1zm1 2h1v1h-1zm-4 1h1v1h-1zm-3 1h1v1h-1zm2 1h1v1h-1zm-5 1h1v1H8zm4 0h1v1h-1zm1 1h1v2h-1zm-6 2h1v1H9zm2 0h2v1h-2zm3 0h1v1h-1zm1 1h2v1h-2zm4 0h1v1h-1zm-9 1h1v2H8zm2 0h1v1h-1zm6 0h1v1h-1zm3 0h1v1h-1zm-5 1h2v1h-2zm6 0h1v1h-1zm-10 1h2v1h-2zm4 0h1v1h-1zm2 0h1v1h-1zm1 1h2v1h-2zm3 0h1v1h-1z" fill="#475569" />
                <path d="M0 9h1v1H0zm2 0h1v1H2zm4 0h2v1H6zm3 0h2v1H9zm4 0h1v1h-1zm3 0h1v1h-1zm4 0h2v1h-2zm4 0h1v1h-1zm1 1h1v2h-1zm-7 1h1v1h-1zm-3 1h2v1h-2zm-5 1h1v1H9zm3 0h1v1h-1zm3 0h1v1h-1zm3 0h1v1h-1zm-8 1h2v1h-2zm3 0h1v1h-1zm4 0h1v2h-1zm-8 1h1v1H9zm3 0h1v1h-1zm6 0h1v1h-1zm-8 1h2v1h-2zm4 0h1v1h-1zm2 0h1v1h-1z" fill="#475569" />
                <path d="M12 16h1v1h-1zm3 0h1v1h-1zm4 0h1v1h-1zm1 1h1v1h-1zm-5 1h1v1h-1zm-2 1h1v1h-1zm4 0h1v1h-1zm-7 1h1v1H9zm2 0h1v1h-1zm7 0h1v1h-1zm-6 1h2v1h-2zm4 0h1v1h-1zm1 1h1v1h-1zm-5 1h1v1h-1zm-2 1h1v1h-1zm4 0h1v1h-1zm1 1h2v1h-2zm3 0h1v1h-1z" fill="#475569" />
              </svg>
            </div>
            
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed max-w-[200px]">
              Quét mã QR để truy cập trực tiếp tài liệu này trên thiết bị di động.
            </p>
            
            <button
              onClick={() => setShowQrCode(false)}
              className="w-full py-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-655 hover:text-slate-800 text-[10px] font-black rounded-xl transition cursor-pointer"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
