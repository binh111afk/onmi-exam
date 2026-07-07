import React from 'react';
import type { QuizQuestion } from './QuizTypes';
import { QuizToolbar } from './QuizToolbar';
import { QuestionCard } from './QuestionCard';

interface QuizEditorProps {
  questions: QuizQuestion[];
  isBlockActive: boolean;
  onAddQuestion: () => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (id: string) => void;
  onMoveQuestion: (id: string, direction: 'up' | 'down') => void;
  onUpdateQuestion: (index: number, updated: QuizQuestion) => void;
}

export const QuizEditorComponent: React.FC<QuizEditorProps> = ({
  questions,
  isBlockActive,
  onAddQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onMoveQuestion,
  onUpdateQuestion,
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <QuizToolbar 
        onAddQuestion={onAddQuestion} 
        isBlockActive={isBlockActive} 
      />

      <div className="flex flex-col gap-3.5 mt-1 w-full">
        {questions.map((question, qIdx) => (
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
        ))}
      </div>
    </div>
  );
};

export const QuizEditor = React.memo(QuizEditorComponent);
