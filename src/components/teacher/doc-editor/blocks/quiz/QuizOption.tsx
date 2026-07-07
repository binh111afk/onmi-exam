import React from 'react';
import { Trash2, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import type { QuizOption as QuizOptionType } from './QuizTypes';

interface QuizOptionProps {
  option: QuizOptionType;
  index: number;
  isCorrect: boolean;
  onUpdateText: (text: string) => void;
  onSetCorrect: () => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const QuizOptionComponent: React.FC<QuizOptionProps> = ({
  option,
  index,
  isCorrect,
  onUpdateText,
  onSetCorrect,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
}) => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D...

  const stopEditorKeyHandling = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  const stopEditorPointerHandling = (e: React.PointerEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="flex items-center gap-2 group/option hover:bg-slate-50/50 p-1 rounded-lg transition-colors">
      {/* Radio indicator */}
      <div 
        onClick={onSetCorrect}
        className={`w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer shrink-0 transition ${
          isCorrect 
            ? 'border-purple-600 bg-purple-50 text-purple-600' 
            : 'border-slate-300 hover:border-purple-400'
        }`}
      >
        {isCorrect && <div className="w-2 h-2 rounded-full bg-purple-600 animate-scaleUp" />}
      </div>

      <span className="text-[10px] font-black text-slate-400 select-none w-3">{letter}.</span>

      {/* Editable input */}
      <input
        type="text"
        value={option.text}
        onPointerDown={stopEditorPointerHandling}
        onKeyDown={stopEditorKeyHandling}
        onChange={e => onUpdateText(e.target.value)}
        placeholder="Nhập nội dung phương án..."
        className="flex-1 bg-transparent border-none outline-none text-xs text-slate-700 py-0.5 focus:ring-0 focus:border-purple-400 border-b border-transparent hover:border-slate-200 transition-colors"
      />

      {/* Correct answer toggle icon */}
      <button
        type="button"
        onMouseDown={e => e.preventDefault()}
        onClick={onSetCorrect}
        className={`p-1 rounded hover:bg-slate-100 transition cursor-pointer ${
          isCorrect ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500 opacity-0 group-hover/option:opacity-100'
        }`}
        title="Chọn làm đáp án đúng"
      >
        <CheckCircle2 size={12} className={isCorrect ? 'stroke-[2.5]' : ''} />
      </button>

      {/* Reorder actions */}
      <div className="flex items-center opacity-0 group-hover/option:opacity-100 transition-opacity">
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => onMove('up')}
          disabled={!canMoveUp}
          className="p-1 rounded text-slate-355 hover:text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowUp size={11} />
        </button>
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => onMove('down')}
          disabled={!canMoveDown}
          className="p-1 rounded text-slate-355 hover:text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowDown size={11} />
        </button>
      </div>

      {/* Delete option */}
      <button
        type="button"
        onMouseDown={e => e.preventDefault()}
        onClick={onDelete}
        className="p-1 text-slate-300 hover:text-rose-500 rounded hover:bg-rose-50 transition cursor-pointer opacity-0 group-hover/option:opacity-100 w-6 h-6 flex items-center justify-center"
        title="Xóa phương án"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};

export const QuizOption = React.memo(QuizOptionComponent);
