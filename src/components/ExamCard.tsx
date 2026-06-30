import React from 'react';
import { Clock, HelpCircle, Users, Star, ArrowRight, Lock } from 'lucide-react';
import type { Exam } from '../types';

interface ExamCardProps {
  exam: Exam;
  onSelect: (id: string) => void;
  onStartExam?: (id: string) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onSelect, onStartExam }) => {
  // Map difficulty level to subtle color tags
  const difficultyColors = {
    'Dễ': 'bg-success-light text-success border-success/10',
    'Trung bình': 'bg-accent-light text-accent border-accent/10',
    'Khó': 'bg-danger-light text-danger border-danger/10',
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartExam) {
      onStartExam(exam.id);
    } else {
      onSelect(exam.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(exam.id)}
      className="group relative flex flex-col justify-between bg-white border border-slate-100 rounded-card p-5 cursor-pointer notion-shadow notion-card-hover"
    >
      {/* Top row: tags */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
            {exam.subject}
          </span>
          <span className="text-[10px] font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded">
            {exam.grade}
          </span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 border rounded ${difficultyColors[exam.difficulty]}`}>
          {exam.difficulty}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-default line-clamp-2 mb-4 h-10">
        {exam.title}
      </h3>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-1.5 border-t border-slate-50 pt-3.5 mb-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1">
          <HelpCircle size={13} className="text-slate-400" />
          <span>{exam.questionCount} câu hỏi</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={13} className="text-slate-400" />
          <span>{exam.durationMinutes} phút</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={13} className="text-slate-400" />
          <span>{exam.tries.toLocaleString('vi-VN')} lượt làm</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={12} className="text-accent fill-accent" />
          <span className="font-medium text-text-primary">{exam.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-3.5">
        <div className="flex items-center gap-1">
          {exam.isPremium ? (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-accent bg-accent-light px-2 py-0.5 rounded">
              <Lock size={10} /> Premium
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-success bg-success-light px-2 py-0.5 rounded">
              Miễn phí
            </span>
          )}
          {exam.tag && exam.tag !== 'Premium' && exam.tag !== 'Miễn phí' && (
            <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded">
              {exam.tag}
            </span>
          )}
        </div>

        <button
          onClick={handleAction}
          className="flex items-center gap-1 text-[11px] font-bold text-primary opacity-90 hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-default"
        >
          Làm bài
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
