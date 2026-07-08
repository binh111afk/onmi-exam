import { useCallback } from 'react';
import type { QuizQuestion } from '../QuizTypes';
import { createNewOption } from '../QuizUtils';

export function useQuestion(
  question: QuizQuestion,
  onUpdateQuestion: (updated: QuizQuestion) => void
) {
  const addOption = useCallback(() => {
    onUpdateQuestion({
      ...question,
      options: [...question.options, createNewOption('')]
    });
  }, [question, onUpdateQuestion]);

  const deleteOption = useCallback((oId: string) => {
    onUpdateQuestion({
      ...question,
      options: question.options.filter(o => o.id !== oId)
    });
  }, [question, onUpdateQuestion]);

  const updateOptionText = useCallback((oId: string, text: string) => {
    onUpdateQuestion({
      ...question,
      options: question.options.map(o => o.id === oId ? { ...o, text } : o)
    });
  }, [question, onUpdateQuestion]);

  const selectCorrectOption = useCallback((oId: string) => {
    onUpdateQuestion({
      ...question,
      options: question.options.map(o => ({
        ...o,
        isCorrect: o.id === oId
      }))
    });
  }, [question, onUpdateQuestion]);

  const moveOption = useCallback((oId: string, direction: 'up' | 'down') => {
    const oIndex = question.options.findIndex(o => o.id === oId);
    if (oIndex === -1) return;
    const targetIndex = direction === 'up' ? oIndex - 1 : oIndex + 1;
    if (targetIndex < 0 || targetIndex >= question.options.length) return;
    const nextOpts = [...question.options];
    const temp = nextOpts[oIndex];
    nextOpts[oIndex] = nextOpts[targetIndex];
    nextOpts[targetIndex] = temp;
    onUpdateQuestion({
      ...question,
      options: nextOpts
    });
  }, [question, onUpdateQuestion]);

  return {
    addOption,
    deleteOption,
    updateOptionText,
    selectCorrectOption,
    moveOption,
  };
}
