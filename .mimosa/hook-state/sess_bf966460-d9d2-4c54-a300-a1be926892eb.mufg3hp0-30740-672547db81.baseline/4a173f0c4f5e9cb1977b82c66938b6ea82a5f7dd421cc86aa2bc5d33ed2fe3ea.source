import React from 'react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { QuizEditor } from './QuizEditor';
import { useQuiz } from './hooks/useQuiz';
import { createNewQuizContent } from './QuizUtils';

interface QuizBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
  showUniversalToolbar?: boolean;
}

export const QuizBlockComponent: React.FC<QuizBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const {
    questions,
    settings,
    addQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    shuffleQuestions,
    updateQuizSettings,
    updateQuestions,
  } = useQuiz(block, idx, onUpdateBlock);

  // Initialize with default quiz content if empty and active
  React.useEffect(() => {
    if (!block.quizContent && isActive) {
      onUpdateBlock(idx, {
        ...block,
        quizContent: createNewQuizContent()
      });
    }
  }, [block.quizContent, idx, isActive, onUpdateBlock, block]);

  const handleUpdateQuestion = React.useCallback((qIdx: number, updatedQuestion: any) => {
    const next = [...questions];
    next[qIdx] = updatedQuestion;
    updateQuestions(next);
  }, [questions, updateQuestions]);

  return (
    <div 
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 p-3 border border-purple-100 bg-purple-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
    >
      <div className="flex items-center justify-between text-purple-600 font-extrabold text-[8px] uppercase tracking-wide select-none">
        <span className="flex items-center gap-1">Bộ câu hỏi trắc nghiệm</span>
      </div>

      <QuizEditor
        questions={questions}
        isBlockActive={isActive}
        onAddQuestion={addQuestion}
        onShuffleQuestions={shuffleQuestions}
        settings={settings}
        onUpdateSettings={updateQuizSettings}
        onDeleteQuestion={deleteQuestion}
        onDuplicateQuestion={duplicateQuestion}
        onMoveQuestion={moveQuestion}
        onUpdateQuestion={handleUpdateQuestion}
      />
    </div>
  );
};

export const QuizBlock = React.memo(QuizBlockComponent);
