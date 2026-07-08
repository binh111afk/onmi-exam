import React from 'react';
import type { QuizQuestion, QuizSettings } from './QuizTypes';
import { QuizToolbar } from './QuizToolbar';
import { QuestionCard } from './QuestionCard';

interface QuizEditorProps {
  questions: QuizQuestion[];
  isBlockActive: boolean;
  onAddQuestion: () => void;
  onShuffleQuestions: () => void;
  settings: QuizSettings;
  onUpdateSettings: (settings: Partial<QuizSettings>) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (id: string) => void;
  onMoveQuestion: (id: string, direction: 'up' | 'down') => void;
  onUpdateQuestion: (index: number, updated: QuizQuestion) => void;
}

export const QuizEditorComponent: React.FC<QuizEditorProps> = ({
  questions,
  isBlockActive,
  onAddQuestion,
  onShuffleQuestions,
  settings,
  onUpdateSettings,
  onDeleteQuestion,
  onDuplicateQuestion,
  onMoveQuestion,
  onUpdateQuestion,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <QuizToolbar 
        onAddQuestion={onAddQuestion} 
        onShuffleQuestions={onShuffleQuestions}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        isBlockActive={isBlockActive} 
      />

      <div className="flex flex-col gap-3.5 mt-1 w-full">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-purple-100 bg-white/70 px-4 py-5 text-center text-[10px] font-bold text-slate-400 select-none">
            Chưa có câu hỏi. Nhấn 'Thêm câu hỏi' để bắt đầu.
          </div>
        ) : (
          questions.map((question, qIdx) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={qIdx}
              onUpdateQuestion={updated => onUpdateQuestion(qIdx, updated)}
              onDelete={() => onDeleteQuestion(question.id)}
              onDuplicate={() => onDuplicateQuestion(question.id)}
              onMove={dir => onMoveQuestion(question.id, dir)}
              canMoveUp={qIdx > 0}
              canMoveDown={qIdx < questions.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const QuizEditor = React.memo(QuizEditorComponent);
