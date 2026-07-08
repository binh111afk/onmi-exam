import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { QuizContent, QuizQuestion, QuizSettings } from '../QuizTypes';
import { createNewQuestion, shuffleQuizQuestions } from '../QuizUtils';

export function useQuiz(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
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

  const updateQuizContent = useCallback((nextQuizContent: QuizContent) => {
    onUpdateBlock(idx, {
      ...block,
      quizContent: nextQuizContent
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateQuestions = useCallback((nextQuestions: QuizQuestion[]) => {
    updateQuizContent({
      ...quizContent,
      questions: nextQuestions
    });
  }, [quizContent, updateQuizContent]);

  const updateQuizSettings = useCallback((nextSettings: Partial<QuizSettings>) => {
    updateQuizContent({
      ...quizContent,
      settings: {
        ...quizContent.settings,
        ...nextSettings
      }
    });
  }, [quizContent, updateQuizContent]);

  const addQuestion = useCallback(() => {
    updateQuestions([...questions, createNewQuestion()]);
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

  const shuffleQuestions = useCallback(() => {
    if (questions.length < 2) return;
    updateQuestions(shuffleQuizQuestions(questions));
  }, [questions, updateQuestions]);

  return {
    questions,
    settings: quizContent.settings,
    addQuestion,
    deleteQuestion,
    duplicateQuestion,
    moveQuestion,
    shuffleQuestions,
    updateQuizContent,
    updateQuizSettings,
    updateQuestions,
  };
}
