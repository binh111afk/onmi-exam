import React from 'react';
import type { QuizQuestion as QuizQuestionType } from './QuizTypes';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onUpdateQuestion: (updated: QuizQuestionType) => void;
}

export const QuizQuestionComponent: React.FC<QuizQuestionProps> = ({
  question,
  onUpdateQuestion,
}) => {
  const stopEditorKeyHandling = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  const stopEditorPointerHandling = (e: React.PointerEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Title area */}
      <textarea
        rows={1}
        value={question.text}
        onPointerDown={stopEditorPointerHandling}
        onKeyDown={stopEditorKeyHandling}
        onChange={e => onUpdateQuestion({ ...question, text: e.target.value })}
        placeholder="Nhập câu hỏi..."
        className="w-full bg-transparent border-none outline-none font-bold text-xs text-slate-800 focus:ring-0 resize-y min-h-[24px] placeholder-slate-400 p-0"
      />
      {/* Description area */}
      <textarea
        rows={1}
        value={question.description || ''}
        onPointerDown={stopEditorPointerHandling}
        onKeyDown={stopEditorKeyHandling}
        onChange={e => onUpdateQuestion({ ...question, description: e.target.value })}
        placeholder="Nhập hướng dẫn / giải thích câu hỏi (không bắt buộc)..."
        className="w-full bg-transparent border-none outline-none text-[10px] text-slate-500 focus:ring-0 resize-y min-h-[18px] placeholder-slate-350 p-0"
      />
    </div>
  );
};

export const QuizQuestion = React.memo(QuizQuestionComponent);
