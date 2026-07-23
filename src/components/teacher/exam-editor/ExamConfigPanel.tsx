import React from 'react';
import { Select } from '../../Select';
import {
  CheckCircle2,
  FileText,
  ChevronDown,
  Sliders,
  Shuffle,
  RefreshCw,
  Timer,
  Eye,
  CheckSquare,
  BookOpen,
  Trophy,
  ClipboardList,
  Image,
  Grid,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import { NextIcon } from '../doc-editor/DocEditorHeader';

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ id, checked, onChange }) => {
  return (
    <button
      type="button"
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${checked ? 'bg-[#6C5DD3]' : 'bg-[#E2E8F0]'
        }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'
          }`}
      />
    </button>
  );
};

interface ExamConfigPanelProps {
  infoMeta: any;
  updateJsonField: (key: string, value: any) => void;
  lastSavedTime: string | null;
  formatSavedTime: (isoString: string | null) => string;
  handlePublishExam: () => void;
  previewQuestions: any[];
  questionTypesCount: {
    choice: number;
    'true-false': number;
    'fill-blank': number;
    essay: number;
  };
  counts: {
    images: number;
    tables: number;
    formulas: number;
    paragraphs: number;
  };
}

export const ExamConfigPanel: React.FC<ExamConfigPanelProps> = ({
  infoMeta,
  updateJsonField,
  lastSavedTime,
  formatSavedTime,
  handlePublishExam,
  previewQuestions,
  questionTypesCount,
  counts,
}) => {
  const subjectOptions = [
    { value: 'Sinh học', label: 'Sinh học' },
    { value: 'Toán học', label: 'Toán học' },
    { value: 'Vật lý', label: 'Vật lý' },
    { value: 'Hóa học', label: 'Hóa học' },
    { value: 'Tiếng Anh', label: 'Tiếng Anh' },
    { value: 'Ngữ văn', label: 'Ngữ văn' },
    { value: 'Lịch sử', label: 'Lịch sử' },
    { value: 'Địa lý', label: 'Địa lý' },
  ];

  const gradeOptions = [
    { value: '6', label: 'Khối 6' },
    { value: '7', label: 'Khối 7' },
    { value: '8', label: 'Khối 8' },
    { value: '9', label: 'Khối 9' },
    { value: '10', label: 'Khối 10' },
    { value: '11', label: 'Khối 11' },
    { value: '12', label: 'Khối 12' },
  ];

  const timeOptions = [
    { value: '15', label: '15 phút' },
    { value: '30', label: '30 phút' },
    { value: '45', label: '45 phút' },
    { value: '60', label: '60 phút' },
    { value: '90', label: '90 phút' },
    { value: '120', label: '120 phút' },
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Dễ (Easy)' },
    { value: 'medium', label: 'Trung bình (Medium)' },
    { value: 'hard', label: 'Khó (Hard)' },
  ];

  const getDifficultyLabel = (diff?: string) => {
    if (!diff) return 'Trung bình';
    const d = diff.toLowerCase();
    if (d === 'easy') return 'Dễ';
    if (d === 'hard') return 'Khó';
    return 'Trung bình';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[#F8FAFC] animate-fadeIn">
      {/* Config Header */}
      <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-sm font-black text-slate-800 leading-tight">
              Cấu hình đề thi
            </h1>
            <p className="text-[10px] text-slate-400 font-bold -mt-0.5 font-sans">
              Thiết lập thông tin và quy tắc cho đề thi của bạn
            </p>
          </div>
        </div>

        {/* Right side status & action */}
        <div className="flex items-center gap-2.5">
          {/* Auto Save Status */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] font-sans mr-2">
            <CheckCircle2 size={13} className="text-emerald-500 stroke-[2.5]" />
            <span>Đã tự động lưu {lastSavedTime ? formatSavedTime(lastSavedTime) : 'mới đây'}</span>
          </div>

          {/* Publish Button - only action needed in config */}
          <button
            onClick={handlePublishExam}
            className="px-5 py-2 bg-[#6C5DD3] hover:bg-[#5C4DB3] text-white text-[10px] font-black rounded-xl flex items-center gap-2 transition cursor-pointer font-sans shadow-md shadow-indigo-150"
          >
            <NextIcon />
            Tiếp theo
          </button>
        </div>
      </header>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column - Configurations (2/3) */}
          <div className="flex-1 lg:flex-[2.1] w-full space-y-6">

            {/* Card 1: Thông tin cơ bản */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100/80 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6C5DD3] flex items-center justify-center shrink-0">
                  <FileText size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide font-sans">
                    1. Thông tin cơ bản
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold -mt-0.5 font-sans">
                    Nhập thông tin chính của đề thi
                  </p>
                </div>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                {/* Tên đề thi */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                    Tên đề thi
                  </label>
                  <input
                    type="text"
                    value={infoMeta.title || ''}
                    onChange={(e) => updateJsonField('title', e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] focus:border-[#6C5DD3] rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none transition cursor-text placeholder:text-slate-400 focus:ring-2 focus:ring-[#6C5DD3]/10"
                    placeholder="Nhập tên đề thi..."
                  />
                </div>

                {/* 4 Dropdowns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Môn học */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                      Môn học
                    </label>
                    <Select
                      value={infoMeta.subject || 'Sinh học'}
                      onChange={(val) => updateJsonField('subject', val)}
                      options={subjectOptions}
                    />
                  </div>

                  {/* Khối lớp */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                      Khối lớp
                    </label>
                    <Select
                      value={String(infoMeta.grade || 10)}
                      onChange={(val) => updateJsonField('grade', parseInt(val) || 10)}
                      options={gradeOptions}
                    />
                  </div>

                  {/* Thời gian làm bài */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                      Thời gian làm bài
                    </label>
                    <Select
                      value={String(infoMeta.time || 60)}
                      onChange={(val) => updateJsonField('time', parseInt(val) || 60)}
                      options={timeOptions}
                    />
                  </div>

                  {/* Độ khó */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                      Độ khó
                    </label>
                    <Select
                      value={infoMeta.difficulty || 'medium'}
                      onChange={(val) => updateJsonField('difficulty', val)}
                      options={difficultyOptions}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Chế độ làm bài */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100/80 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6C5DD3] flex items-center justify-center shrink-0">
                  <Sliders size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide font-sans">
                    2. Chế độ làm bài
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold -mt-0.5 font-sans">
                    Thiết lập các tùy chọn khi học sinh làm bài
                  </p>
                </div>
              </div>

              {/* Options list */}
              <div className="divide-y divide-slate-100/60">
                {/* Row 1 */}
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                      <Shuffle size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Xáo trộn thứ tự câu hỏi
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                        Mỗi học sinh sẽ nhận đề với thứ tự câu hỏi khác nhau
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="shuffle-questions"
                    checked={infoMeta.shuffle !== false}
                    onChange={(checked) => updateJsonField('shuffle', checked)}
                  />
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                      <RefreshCw size={13} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Xáo trộn thứ tự đáp án
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                        Mỗi học sinh sẽ nhận đề với thứ tự đáp án khác nhau
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="shuffle-answers"
                    checked={infoMeta.shuffleAnswers !== false}
                    onChange={(checked) => updateJsonField('shuffleAnswers', checked)}
                  />
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                      <Timer size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Hiển thị đồng hồ đếm ngược
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                        Học sinh có thể theo dõi thời gian còn lại khi làm bài
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="show-countdown"
                    checked={infoMeta.showCountdown !== false}
                    onChange={(checked) => updateJsonField('showCountdown', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Hiển thị kết quả */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100/80 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#6C5DD3] flex items-center justify-center shrink-0">
                  <Eye size={16} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide font-sans">
                    3. Hiển thị kết quả
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold -mt-0.5 font-sans">
                    Thiết lập những gì học sinh có thể xem sau khi nộp bài
                  </p>
                </div>
              </div>

              {/* Options list */}
              <div className="divide-y divide-slate-100/60">
                {/* Row 1 */}
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                      <CheckSquare size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Hiển thị đáp án đúng
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                        Cho phép học sinh xem đáp án sau khi nộp bài
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="show-answers"
                    checked={infoMeta.allowReview !== false}
                    onChange={(checked) => updateJsonField('allowReview', checked)}
                  />
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                      <BookOpen size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Hiển thị lời giải
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                        Cho phép học sinh xem lời giải chi tiết sau khi nộp bài
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="show-explanation"
                    checked={infoMeta.showExplanation !== false}
                    onChange={(checked) => updateJsonField('showExplanation', checked)}
                  />
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6C5DD3] flex items-center justify-center shrink-0">
                      <Trophy size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Hiển thị bảng xếp hạng
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold font-sans mt-0.5">
                        Hiển thị bảng xếp hạng khi kết thúc bài làm (chỉ áp dụng với đề luyện tập)
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="show-leaderboard"
                    checked={infoMeta.showLeaderboard === true}
                    onChange={(checked) => updateJsonField('showLeaderboard', checked)}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Summary Sidebar (1/3) */}
          <div className="w-full lg:flex-1 space-y-6 lg:sticky lg:top-0">

            {/* Overview Card */}
            <div className="bg-gradient-to-b from-[#5E51E8] to-[#6C5DD3] rounded-[24px] p-6 text-white shadow-xl flex flex-col justify-between">

              <div>
                {/* Card Header */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                    <ClipboardList size={16} />
                  </div>
                  <h3 className="text-xs font-black tracking-wider uppercase font-sans">
                    Tổng quan đề thi
                  </h3>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-1 text-center mt-6 select-none border-b border-white/15 pb-5">
                  <div>
                    <div className="text-lg font-black">{previewQuestions.length}</div>
                    <div className="text-[8px] opacity-75 font-semibold uppercase mt-0.5 tracking-wider font-sans">Câu hỏi</div>
                  </div>
                  <div className="border-r border-white/20 h-7 self-center" />
                  <div>
                    <div className="text-lg font-black">{infoMeta.time || 60} phút</div>
                    <div className="text-[8px] opacity-75 font-semibold uppercase mt-0.5 tracking-wider font-sans">Thời gian</div>
                  </div>
                  <div className="border-r border-white/20 h-7 self-center" />
                  <div>
                    <div className="text-lg font-black">
                      {previewQuestions.reduce((sum, q) => sum + (Number(q.points) || 0), 0).toFixed(2)}
                    </div>
                    <div className="text-[8px] opacity-75 font-semibold uppercase mt-0.5 tracking-wider font-sans">Điểm</div>
                  </div>
                  <div className="border-r border-white/20 h-7 self-center" />
                  <div>
                    <div className="text-lg font-black">
                      {getDifficultyLabel(infoMeta.difficulty)}
                    </div>
                    <div className="text-[8px] opacity-75 font-semibold uppercase mt-0.5 tracking-wider font-sans">Độ khó</div>
                  </div>
                </div>

                {/* Section 1: Question Type Distribution */}
                <div className="mt-5">
                  <h4 className="text-[9px] font-black uppercase tracking-wider opacity-85 mb-3 font-sans">
                    Phân bố câu hỏi
                  </h4>

                  <div className="space-y-2.5">
                    {/* Trắc nghiệm */}
                    <div className="flex items-center justify-between text-xs font-bold font-sans">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C3B8FF]" />
                        <span className="opacity-95 font-semibold">Trắc nghiệm</span>
                      </div>
                      <span className="font-bold">{questionTypesCount.choice}</span>
                    </div>

                    {/* Đúng / Sai */}
                    <div className="flex items-center justify-between text-xs font-bold font-sans">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F43]" />
                        <span className="opacity-95 font-semibold">Đúng / Sai</span>
                      </div>
                      <span className="font-bold">{questionTypesCount['true-false']}</span>
                    </div>

                    {/* Điền khuyết */}
                    <div className="flex items-center justify-between text-xs font-bold font-sans">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F]" />
                        <span className="opacity-95 font-semibold">Điền khuyết</span>
                      </div>
                      <span className="font-bold">{questionTypesCount['fill-blank']}</span>
                    </div>

                    {/* Tự luận */}
                    <div className="flex items-center justify-between text-xs font-bold font-sans">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#EA5455]" />
                        <span className="opacity-95 font-semibold">Tự luận</span>
                      </div>
                      <span className="font-bold">{questionTypesCount.essay}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Content Breakdown */}
                <div className="mt-6 pt-5 border-t border-white/15">
                  <h4 className="text-[9px] font-black uppercase tracking-wider opacity-85 mb-3 font-sans">
                    Nội dung đề thi
                  </h4>

                  <div className="space-y-2.5">
                    {/* Hình ảnh */}
                    <div className="flex items-center gap-2.5 text-xs font-bold font-sans opacity-95">
                      <Image size={14} className="opacity-80" />
                      <span>{counts.images} hình ảnh</span>
                    </div>

                    {/* Bảng biểu */}
                    <div className="flex items-center gap-2.5 text-xs font-bold font-sans opacity-95">
                      <Grid size={14} className="opacity-80" />
                      <span>{counts.tables} bảng biểu</span>
                    </div>

                    {/* Công thức */}
                    <div className="flex items-center gap-2.5 text-xs font-bold font-sans opacity-95">
                      <Calculator size={14} className="opacity-80" />
                      <span>{counts.formulas} công thức</span>
                    </div>

                    {/* Đoạn văn bản */}
                    <div className="flex items-center gap-2.5 text-xs font-bold font-sans opacity-95">
                      <BookOpen size={14} className="opacity-80" />
                      <span>{counts.paragraphs} đoạn văn bản</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Action validation card */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 mt-6 transition duration-150 flex items-center gap-3 cursor-pointer select-none">
                <ShieldCheck size={20} className="text-white shrink-0" />
                <div className="flex-1">
                  <h5 className="text-[10px] font-black text-white font-sans leading-tight">
                    Kiểm tra trước khi xuất bản
                  </h5>
                  <p className="text-[8px] opacity-75 font-semibold font-sans mt-0.5 leading-none">
                    Đảm bảo đề thi hợp lệ và sẵn sàng
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
