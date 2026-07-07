import React from 'react';
import { Plus, Shuffle, Settings } from 'lucide-react';

interface QuizToolbarProps {
  onAddQuestion: () => void;
  isBlockActive: boolean;
}

const SEP = () => <div className="w-px h-3.5 bg-slate-200 mx-0.5" />;

export const QuizToolbar: React.FC<QuizToolbarProps> = ({
  onAddQuestion,
  isBlockActive
}) => {
  if (!isBlockActive) return null;

  return (
    <div className="mb-2 animate-fadeIn select-none">
      <div className="inline-flex items-center gap-0.5 px-1.5 py-1 bg-white border border-slate-200 rounded-xl shadow-sm">
        <button
          onMouseDown={e => e.preventDefault()}
          onClick={onAddQuestion}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-purple-600 hover:bg-purple-50 transition cursor-pointer"
        >
          <Plus size={12} className="stroke-[2.5]" /> Thêm câu hỏi
        </button>
        
        <SEP />
        
        <button
          onMouseDown={e => e.preventDefault()}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-slate-50 cursor-not-allowed"
          title="Trộn câu hỏi (Tính năng sắp ra mắt)"
          disabled
        >
          <Shuffle size={11} /> Trộn câu hỏi
        </button>
        <button
          onMouseDown={e => e.preventDefault()}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:bg-slate-50 cursor-not-allowed"
          title="Cấu hình Quiz (Tính năng sắp ra mắt)"
          disabled
        >
          <Settings size={11} /> Cấu hình
        </button>
      </div>
    </div>
  );
};
