import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { QuizQuestion } from '../QuizTypes';
import { createNewQuestion } from '../QuizUtils';

export function useQuiz(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock) => void
) {
  const quizContent = block.quizContent || {
    version: 1,
    questions: [],
    settings: {
      shuffleQuestions: false,
      shuffleOptions: false,
      showCorrectAnswers: true,
      passingScore: 50
    }
  };
  const questions = quizContent.questions;

  const updateQuestions = useCallback((nextQuestions: QuizQuestion[]) => {
    onUpdateBlock(idx, {
      ...block,
      quizContent: {
        ...quizContent,
        questions: nextQuestions
      }
    });
  }, [block, idx, onUpdateBlock, quizContent]);

  const addQuestion = useCallback(() => {
    updateQuestions([...questions, createNewQuestion('Câu hỏi mới')]);
  }, [questions, updateQuestions]);

  const deleteQuestion = useCallback((qId: string) => {
    updateQuestions(questions.filter(q => q.id !== qId));
  }, [questions, updateQuestions]);

  const duplicateQuestion = useCallback((qId: string) => {
    const qIndex = questions.findIndex(q => q.id === qId);
    if (qIndex === -1) return;
    const target = questions[qIndex];
    const duplicated: QuizQuestion = {
      ...target,
      id: crypto.randomUUID(),
      options: target.options.map(opt => ({
        ...opt,
        id: crypto.randomUUID()
      }))
    };
    const next = [...questions];
    next.splice(qIndex + 1, 0, duplicated);
    updateQuestions(next);
  }, [questions, updateQuestions]);

  const moveQuestion = useCallback((qId: string, direction: 'up' | 'down') => {
    const qIndex = questions.findIndex(q => q.id === qId);
    if (qIndex === -1) return;
    const targetIndex = direction === 'up' ? qIndex - 1 : qIndex + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const next = [...questions];
    const temp = next[qIndex];
    next[qIndex] = next[targetIndex];
    next[targetIndex] = temp;
    updateQuestions(next);
  }, [questions, updateQuestions]);

  return {
    questions,
    settings: quizContent.settings,
    addQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    updateQuestions,
  };
}
