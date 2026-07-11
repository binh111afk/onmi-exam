import React, { useState } from 'react';
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
  Rocket
} from 'lucide-react';
import { Checkbox } from '../../Checkbox';

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
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  activeLesson,
  onPublishConfirm,
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
  const [startTime, setStartTime] = useState('2025-05-29T08:00');
  const [endTime, setEndTime] = useState('2025-06-12T23:59');
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

  // Generate checklist state based on content
  const titleExists = !!activeLesson?.title;
  const contentExists = (activeLesson?.blocks?.length || 0) > 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Glass Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Surface Container */}
      <div className="bg-[#F8FAFC] rounded-[24px] border border-slate-100 shadow-2xl w-full max-w-[1020px] overflow-hidden z-10 animate-scaleIn select-none flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <header className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center shadow-sm border border-indigo-100/50">
              <Send size={18} className="stroke-[2.5] text-[#6C5DD3]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">
                Xuất bản tài liệu
              </h3>
              <p className="text-[10px] font-bold text-slate-400 leading-normal">
                Chia sẻ tài liệu với học sinh và bắt đầu hành trình học tập
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Configurations - 7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Trạng thái xuất bản */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                1. Trạng thái xuất bản
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Draft Option */}
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

                {/* Public Option */}
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

                {/* Private Option */}
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
                2. Chia sẻ
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
                3. Quyền truy cập
              </label>
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
                {/* Access: Anyone with link */}
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

                {/* Access: Only students in class */}
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

                {/* Access: Password */}
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
                        <h4 className="text-[11px] font-black text-slate-700">Có mật khẩu</h4>
                        <p className="text-[9px] font-bold text-slate-400">Yêu cầu nhập mật khẩu để truy cập</p>
                      </div>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      accessLevel === 'password' ? 'border-primary' : 'border-slate-300'
                    }`}>
                      {accessLevel === 'password' && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                  </div>

                  {/* Password Input Panel */}
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
                4. Cấu hình học tập
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
                5. Thời gian (Tùy chọn)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className={`space-y-1.5 transition-opacity duration-200 ${unlimitedTime ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Bắt đầu</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={13} />
                    </div>
                    <input
                      type="datetime-local"
                      value={startTime}
                      disabled={unlimitedTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2 text-[10px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className={`space-y-1.5 transition-opacity duration-200 ${unlimitedTime ? 'opacity-40 pointer-events-none' : ''}`}>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Kết thúc</span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar size={13} />
                    </div>
                    <input
                      type="datetime-local"
                      value={endTime}
                      disabled={unlimitedTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2 text-[10px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle switch for unlimited time */}
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

          {/* Right Column (Preview & Checklist - 5/12) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Document Preview */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Xem trước tài liệu</span>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="h-32 bg-[#F1EEFC] relative overflow-hidden shrink-0">
                  <img
                    src="/biology_illustration.png"
                    alt="Biology Cover Illustration"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback visual in case image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Styled backup header view */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/25 to-[#8F85F3]/30 mix-blend-multiply" />
                </div>
                <div className="p-4 space-y-3">
                  <span className="px-2.5 py-0.5 bg-[#FFF0F2] text-accent text-[9px] font-black rounded-lg uppercase tracking-wide inline-block">
                    SINH HỌC 10
                  </span>
                  
                  <h4 className="text-xs font-black text-slate-800 leading-tight">
                    {activeLesson?.title?.replace(/^\d+\.\s*/, '') || 'Nguyên tố hóa học và Nước'}
                  </h4>
                  
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Bài học về cấu trúc, tính chất và vai trò của nguyên tố hóa học và nước trong cơ thể sống.
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-50 text-[9px] font-bold text-slate-450">
                    <span className="bg-slate-50 px-2 py-1 rounded-lg">Giáo viên: Nguyễn Văn An</span>
                    <span className="bg-slate-50 px-2 py-1 rounded-lg">Cập nhật: 29/05/2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist before publishing */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Checklist trước khi xuất bản</span>
              <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                    <span className={titleExists ? 'text-slate-655' : 'text-slate-400'}>Có tiêu đề tài liệu</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                    <span className={contentExists ? 'text-slate-655' : 'text-slate-400'}>Có ít nhất 1 nội dung</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                    <span className="text-slate-655">Không có block lỗi</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                    <span className="text-slate-655">Quiz hợp lệ (đã có đáp án)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                    <span className="text-slate-655">Timeline hợp lệ</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                    <span className="text-slate-655">Flashcard hợp lệ</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                    <span className="text-slate-655">Fill Blank đã có đáp án</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
                    <span className="text-slate-655">Có ảnh bìa</span>
                  </div>
                </div>

                {/* SVG clipboard illustration */}
                <div className="w-[100px] h-[100px] shrink-0 flex items-center justify-center">
                  <svg width="84" height="84" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Plate / Clipboard shadow */}
                    <rect x="22" y="24" width="56" height="66" rx="12" fill="#EEF2F6" />
                    <rect x="20" y="20" width="56" height="66" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
                    
                    {/* Metal Clip at Top */}
                    <rect x="38" y="14" width="20" height="10" rx="3" fill="#CBD5E1" />
                    <circle cx="48" cy="19" r="2" fill="#94A3B8" />

                    {/* Paper lines / Mock checkboxes */}
                    <rect x="30" y="32" width="6" height="6" rx="2" fill="#10B981" />
                    <rect x="40" y="34" width="28" height="3" rx="1.5" fill="#E2E8F0" />
                    
                    <rect x="30" y="44" width="6" height="6" rx="2" fill="#10B981" />
                    <rect x="40" y="46" width="24" height="3" rx="1.5" fill="#E2E8F0" />
                    
                    <rect x="30" y="56" width="6" height="6" rx="2" fill="#10B981" />
                    <rect x="40" y="58" width="20" height="3" rx="1.5" fill="#E2E8F0" />
                    
                    <rect x="30" y="68" width="6" height="6" rx="2" fill="#10B981" />
                    <rect x="40" y="70" width="26" height="3" rx="1.5" fill="#E2E8F0" />

                    {/* Pen illustration overlapping at bottom right */}
                    <g transform="translate(10, 0)">
                      <path d="M72 58L78 52C79.5 50.5 82 50.5 83.5 52C85 53.5 85 56 83.5 57.5L77.5 63.5L72 58Z" fill="#F472B6" />
                      <path d="M54 76L72 58L77.5 63.5L59.5 81.5L52 82L54 76Z" fill="#818CF8" />
                      <polygon points="52,82 50,84 54,82" fill="#312E81" />
                      {/* Pen eraser tip */}
                      <path d="M81 50.5L83.5 53L82 54.5L79.5 52L81 50.5Z" fill="#F43F5E" />
                    </g>
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
                  Sau khi xuất bản, bạn vẫn có thể chỉnh sửa tài liệu. Các thay đổi sẽ được cập nhật cho người học.
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
            Lưu bản nháp
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-850 hover:bg-slate-50 text-[10px] font-bold rounded-xl transition cursor-pointer"
          >
            Xem trước
          </button>
          <button
            onClick={() => {
              onPublishConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover text-white text-[10px] font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-100"
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
            
            {/* Draw QR Code manually using SVG */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center">
              <svg width="140" height="140" viewBox="0 0 29 29" fill="none" shapeRendering="crispEdges">
                {/* QR Code finder patterns & data squares */}
                {/* Background */}
                <rect width="29" height="29" fill="#F8FAFC" />
                
                {/* Top-Left Finder */}
                <path d="M0 0h7v7H0zm1 1v5h5V1zm1 1h3v3H2z" fill="#1E293B" />
                {/* Top-Right Finder */}
                <path d="M22 0h7v7h-7zm1 1v5h5V1zm1 1h3v3H4z" fill="#1E293B" />
                {/* Bottom-Left Finder */}
                <path d="M0 22h7v7H0zm1 1v5h5v-5zm1 1h3v3H2z" fill="#1E293B" />
                
                {/* Alignment Pattern */}
                <path d="M20 20h5v5h-5zm1 1v3h3v-3zm1 1h1v1h-1z" fill="#1E293B" />
                
                {/* Pixelated Data Squares */}
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
