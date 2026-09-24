import React, { useState } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { subjectToSlug } from '../data/mockData';

interface PracticeQuickProps {
  subjects: string[];
  onStart: (practiceId: string) => void;
  onBack: () => void;
}

const QUICK_LENGTHS = [10, 20];

export const PracticeQuick: React.FC<PracticeQuickProps> = ({ subjects, onStart, onBack }) => {
  const [subject, setSubject] = useState(subjects[0] || '');
  const [count, setCount] = useState(QUICK_LENGTHS[0]);

  const start = () => {
    const slug = subjectToSlug(subject);
    if (slug) onStart(`quick-${slug}-${count}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 antialiased">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors cursor-pointer mb-5"
      >
        <ArrowLeft size={14} /> Luyện tập
      </button>

      <header className="mb-6">
        <h1 className="text-2xl font-black text-text-primary">Luyện nhanh</h1>
        <p className="text-xs text-text-secondary font-medium mt-1">
          Vài phút mỗi ngày — chọn môn và số câu rồi bắt đầu ngay
        </p>
      </header>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-text-secondary mb-2">Môn học</label>
          <div className="flex flex-wrap gap-2">
            {subjects.map((item) => (
              <button
                key={item}
                onClick={() => setSubject(item)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  subject === item
                    ? 'bg-primary text-white shadow-[0_4px_12px_rgba(108,93,211,0.25)]'
                    : 'bg-slate-50 text-text-secondary hover:bg-primary-light hover:text-primary'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-text-secondary mb-2">Số câu hỏi</label>
          <div className="flex gap-2">
            {QUICK_LENGTHS.map((item) => (
              <button
                key={item}
                onClick={() => setCount(item)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  count === item
                    ? 'bg-primary text-white shadow-[0_4px_12px_rgba(108,93,211,0.25)]'
                    : 'bg-slate-50 text-text-secondary hover:bg-primary-light hover:text-primary'
                }`}
              >
                {item} câu
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={start}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
        >
          <Zap size={14} /> Bắt đầu luyện {count} câu
        </button>
      </div>
    </div>
  );
};
