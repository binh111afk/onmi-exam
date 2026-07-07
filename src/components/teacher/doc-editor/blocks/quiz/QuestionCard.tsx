import React from 'react';
import { Trash2, Copy, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import type { QuizQuestion as QuizQuestionType } from './QuizTypes';
import { QuizOption } from './QuizOption';
import { QuizQuestion } from './QuizQuestion';
import { useQuestion } from './hooks/useQuestion';

interface QuestionCardProps {
  question: QuizQuestionType;
  index: number;
  onUpdateQuestion: (updated: QuizQuestionType) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const QuestionCardComponent: React.FC<QuestionCardProps> = ({
  question,
  index,
  onUpdateQuestion,
  onDelete,
  onDuplicate,
  onMove,
  canMoveUp,
  canMoveDown,
}) => {
  const {
    addOption,
    deleteOption,
    updateOptionText,
    selectCorrectOption,
    moveOption,
  } = useQuestion(question, onUpdateQuestion);

  return (
    <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col gap-3 relative group/question hover:border-purple-200 transition-colors w-full">
      {/* Header controls for question */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg select-none">
          Câu {index + 1} (Trắc nghiệm)
        </span>

        {/* Lightweight toolbar actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover/question:opacity-100 transition-opacity">
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => onMove('up')}
            disabled={!canMoveUp}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Di chuyển lên"
          >
            <ArrowUp size={12} />
          </button>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => onMove('down')}
            disabled={!canMoveDown}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Di chuyển xuống"
          >
            <ArrowDown size={12} />
          </button>
          <div className="w-px h-3 bg-slate-200 mx-1" />
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={onDuplicate}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded transition cursor-pointer"
            title="Nhân bản"
          >
            <Copy size={12} />
          </button>
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={onDelete}
            className="p-1 text-slate-450 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
            title="Xóa câu hỏi"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Title & Description inputs */}
      <QuizQuestion question={question} onUpdateQuestion={onUpdateQuestion} />

      {/* Options list */}
      <div className="flex flex-col gap-1 pl-1">
        {question.options.map((option, oIdx) => (
          <QuizOption
            key={option.id}
            option={option}
            index={oIdx}
            isCorrect={option.isCorrect}
            onUpdateText={text => updateOptionText(option.id, text)}
            onSetCorrect={() => selectCorrectOption(option.id)}
            onDelete={() => deleteOption(option.id)}
            onMove={dir => moveOption(option.id, dir)}
            canMoveUp={oIdx > 0}
            canMoveDown={oIdx < question.options.length - 1}
          />
        ))}

        {/* Add option link */}
        <div className="flex items-center gap-2 pl-1.5 mt-1 select-none">
          <div className="w-4 h-4 rounded-full border border-dashed border-slate-350 shrink-0" />
          <button
            type="button"
            onClick={addOption}
            className="text-[10px] font-bold text-purple-500 hover:text-purple-700 transition cursor-pointer flex items-center gap-0.5"
          >
            <Plus size={10} /> Thêm phương án mới
          </button>
        </div>
      </div>
    </div>
  );
};

export const QuestionCard = React.memo(QuestionCardComponent);
