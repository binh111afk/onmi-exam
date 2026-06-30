import React from 'react';
import { HelpCircle, Clock, Star, ArrowRight } from 'lucide-react';
import type { Exam } from '../types';

interface ExamCardProps {
  exam: Exam;
  onSelect: (id: string) => void;
  onStartExam?: (id: string) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onSelect, onStartExam }) => {
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartExam) {
      onStartExam(exam.id);
    } else {
      onSelect(exam.id);
    }
  };

  // Define style mappings based on subject
  const subjectThemes = {
    'Toán học': {
      card: 'bg-blue-50/40 border-blue-100/80 hover:border-blue-300 hover:bg-blue-50/70',
      tag: 'bg-blue-100 text-blue-700',
      btn: 'bg-blue-600 text-white hover:bg-blue-700',
      accentText: 'text-blue-700'
    },
    'Vật lý': {
      card: 'bg-emerald-50/40 border-emerald-100/80 hover:border-emerald-300 hover:bg-emerald-50/70',
      tag: 'bg-emerald-100 text-emerald-700',
      btn: 'bg-emerald-600 text-white hover:bg-emerald-700',
      accentText: 'text-emerald-700'
    },
    'Hóa học': {
      card: 'bg-amber-50/40 border-amber-100/80 hover:border-amber-300 hover:bg-amber-50/70',
      tag: 'bg-amber-100 text-amber-700',
      btn: 'bg-amber-600 text-white hover:bg-amber-700',
      accentText: 'text-amber-700'
    },
    'Sinh học': {
      card: 'bg-teal-50/40 border-teal-100/80 hover:border-teal-300 hover:bg-teal-50/70',
      tag: 'bg-teal-100 text-teal-700',
      btn: 'bg-teal-600 text-white hover:bg-teal-700',
      accentText: 'text-teal-700'
    },
    'Tiếng Anh': {
      card: 'bg-purple-50/40 border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/70',
      tag: 'bg-purple-100 text-purple-700',
      btn: 'bg-purple-600 text-white hover:bg-purple-700',
      accentText: 'text-purple-700'
    }
  };

  const theme = subjectThemes[exam.subject as keyof typeof subjectThemes] || {
    card: 'bg-slate-50 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/50',
    tag: 'bg-slate-200 text-slate-700',
    btn: 'bg-primary text-white hover:bg-primary-hover',
    accentText: 'text-slate-700'
  };

  // Difficulty badge styling
  const difficultyBadges = {
    'Dễ': 'bg-blue-100 text-blue-700 border-blue-200',
    'Trung bình': 'bg-emerald-100 text-emerald-750 border-emerald-200',
    'Khó': 'bg-red-100 text-red-700 border-red-200',
  };

  const diffBadge = difficultyBadges[exam.difficulty] || 'bg-slate-100 text-slate-700';

  return (
    <div
      onClick={() => onSelect(exam.id)}
      className={`group rounded-card border p-5 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md select-none ${theme.card}`}
    >
      <div>
        {/* Top Tag Row */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.tag}`}>
            {exam.subject}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${diffBadge}`}>
            {exam.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xs font-bold text-text-primary group-hover:text-primary transition-default leading-relaxed line-clamp-2 h-9 mb-4">
          {exam.title}
        </h3>

        {/* Info Specs */}
        <div className="flex items-center gap-4 text-[10px] text-text-secondary font-semibold mb-4">
          <div className="flex items-center gap-1">
            <HelpCircle size={12} className="text-slate-400" />
            <span>{exam.questionCount} câu</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-slate-400" />
            <span>{exam.durationMinutes} phút</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
        <div className="flex items-center gap-3 text-[10px] text-text-secondary font-semibold">
          <span>{exam.tries >= 1000 ? `${(exam.tries / 1000).toFixed(1)}K` : exam.tries} lượt làm</span>
          <div className="flex items-center gap-0.5">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-text-primary font-bold">{exam.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Circular Action Button */}
        <button
          onClick={handleAction}
          className={`h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-105 cursor-pointer ${theme.btn}`}
          title="Làm bài"
        >
          <ArrowRight size={13} />
        </button>
      </div>

    </div>
  );
};
