import React from 'react';
import { Clock, HelpCircle, Users, Star, ArrowLeft, Play, Bookmark, Share2, ShieldAlert } from 'lucide-react';
import type { Exam, User } from '../types';

interface ExamDetailProps {
  exam: Exam;
  user: User;
  onBack: () => void;
  onStartExam: (id: string) => void;
  onSaveToggle: (id: string) => void;
  isSaved: boolean;
}

export const ExamDetail: React.FC<ExamDetailProps> = ({
  exam,
  user,
  onBack,
  onStartExam,
  onSaveToggle,
  isSaved,
}) => {
  const difficultyColors = {
    'Dễ': 'bg-success-light text-success border-success/10',
    'Trung bình': 'bg-accent-light text-accent border-accent/10',
    'Khó': 'bg-danger-light text-danger border-danger/10',
  };

  const handleShare = () => {
    alert(`Đã sao chép liên kết đề thi: ${window.location.origin}/exams/${exam.id}`);
  };

  // Preview first 2 questions
  const previewQuestions = exam.questions.slice(0, 2);

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-text-primary transition-default mb-6 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Quay lại kho đề thi
      </button>

      {/* Main details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-primary-light text-primary px-2.5 py-0.5 rounded">
                {exam.subject}
              </span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {exam.grade}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded ${difficultyColors[exam.difficulty]}`}>
                {exam.difficulty}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight leading-snug">
              {exam.title}
            </h1>

            {/* Meta details list */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs text-text-secondary">
              <div className="flex items-center gap-1" title="Số câu hỏi">
                <HelpCircle size={14} />
                <span>{exam.questionCount} câu hỏi</span>
              </div>
              <div className="flex items-center gap-1" title="Thời gian làm bài">
                <Clock size={14} />
                <span>{exam.durationMinutes} phút</span>
              </div>
              <div className="flex items-center gap-1" title="Tổng lượt làm bài">
                <Users size={14} />
                <span>{exam.tries.toLocaleString('vi-VN')} lượt làm</span>
              </div>
              <div className="flex items-center gap-1" title="Đánh giá trung bình">
                <Star size={13} className="text-accent fill-accent" />
                <span className="font-semibold text-text-primary">{exam.rating.toFixed(1)} / 5.0</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-card">
            <button
              onClick={() => onStartExam(exam.id)}
              className="flex items-center justify-center gap-1.5 px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-btn hover:bg-primary-hover shadow-sm transition-default"
            >
              <Play size={14} className="fill-white" />
              Làm bài ngay
            </button>
            
            <button
              onClick={() => onSaveToggle(exam.id)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 border rounded-btn text-xs font-semibold transition-default bg-white ${
                isSaved
                  ? 'border-primary text-primary bg-primary-light/30'
                  : 'border-slate-200 text-text-primary hover:border-slate-300'
              }`}
            >
              <Bookmark size={14} className={isSaved ? 'fill-primary' : ''} />
              {isSaved ? 'Đã lưu đề thi' : 'Lưu đề thi'}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white text-text-primary text-xs font-semibold rounded-btn hover:border-slate-300 transition-default"
            >
              <Share2 size={14} />
              Chia sẻ
            </button>
          </div>

          {/* Question Preview Panel (Not all) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Xem trước câu hỏi đề thi</h3>
            <div className="relative border border-slate-100 rounded-card bg-white p-6 space-y-6 overflow-hidden max-h-[380px]">
              
              {previewQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-3 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="text-xs font-semibold text-text-primary flex items-start gap-1.5">
                    <span className="text-primary whitespace-nowrap">Câu {idx + 1}:</span>
                    <span className="leading-relaxed">{q.text}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      return (
                        <div key={oIdx} className="text-xs text-text-secondary flex items-center gap-1">
                          <span className="font-semibold text-slate-400">{letter}.</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Bottom Fade Gradient for Preview limitation */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent flex flex-col justify-end items-center pb-6">
                <div className="bg-white/95 px-4 py-2 border border-slate-100 rounded-card shadow-sm text-center max-w-[340px] z-10">
                  <p className="text-[10px] text-text-secondary font-medium mb-1">
                    Đăng nhập hoặc Nhấn Làm bài để xem toàn bộ câu hỏi.
                  </p>
                  <button
                    onClick={() => onStartExam(exam.id)}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    Bắt đầu làm bài thi &gt;
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right 1 Column: Exam Rules & Recommendations */}
        <div className="space-y-6">
          {/* Rules Card */}
          <div className="bg-white border border-slate-100 rounded-card p-5 notion-shadow space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary pb-2 border-b border-slate-50">
              Quy chế thi trực tuyến
            </h3>
            
            <ul className="space-y-3 text-xs text-text-secondary leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>Bài thi gồm <strong>{exam.questionCount} câu hỏi</strong> trắc nghiệm khách quan với 4 lựa chọn.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>Thời gian giới hạn là <strong>{exam.durationMinutes} phút</strong>. Đồng hồ đếm ngược sẽ bắt đầu chạy ngay khi làm bài.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>Khi kết thúc thời gian làm bài, hệ thống sẽ tự động nộp bài và đánh giá kết quả ngay lập tức.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                <span>Nhận ngay <strong>+100 XP</strong> và tích lũy chuỗi học tập (streak) sau khi hoàn thành với điểm số &gt;= 5.0.</span>
              </li>
            </ul>

            {exam.isPremium && !user.loggedIn && (
              <div className="flex items-start gap-2 p-2.5 bg-accent-light text-accent rounded-btn text-[10px] leading-snug">
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <span>Đây là đề thi Premium. Vui lòng đăng nhập tài khoản để mở khóa quyền luyện tập.</span>
              </div>
            )}
          </div>

          {/* Teacher Profile Card */}
          <div className="bg-white border border-slate-100 rounded-card p-5 notion-shadow space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary pb-2 border-b border-slate-50">
              Giáo viên biên soạn
            </h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center">
                GV
              </div>
              <div>
                <h4 className="text-xs font-semibold text-text-primary">Tổ chuyên môn Onmi Exam</h4>
                <p className="text-[10px] text-text-secondary">Giáo án chuẩn quốc gia & THPT</p>
              </div>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed pt-1">
              Đề thi được thẩm định kỹ lưỡng về mặt chuyên môn toán học, cập nhật liên tục bám sát ma trận đề thi THPT Quốc gia của Bộ Giáo dục & Đào tạo.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
