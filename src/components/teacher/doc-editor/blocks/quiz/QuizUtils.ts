import { QuestionType } from './QuizTypes';
import type { QuizOption, QuizQuestion, QuizContent } from './QuizTypes';
import {
  getDeterministicShuffledItems as getSharedDeterministicShuffledItems,
  shuffleItems,
} from '../interactiveBlockUtils';

export const createQuizId = (): string => crypto.randomUUID();
export const createQuestionId = (): string => crypto.randomUUID();
export const createOptionId = (): string => crypto.randomUUID();

export const createNewOption = (text = '', isCorrect = false): QuizOption => ({
  id: createOptionId(),
  text,
  isCorrect,
});

export const createNewQuestion = (text = '', type = QuestionType.SINGLE_CHOICE): QuizQuestion => ({
  id: createQuestionId(),
  text,
  type,
  options: [
    createNewOption('', true),
    createNewOption('', false),
    createNewOption('', false),
    createNewOption('', false),
  ],
});

export const createNewQuizContent = (): QuizContent => ({
  version: 1,
  questions: [],
  settings: {
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: true,
    passingScore: 50,
  },
});

export const shuffleQuizQuestions = (questions: QuizQuestion[]): QuizQuestion[] => {
  return shuffleItems(questions);
};

export const getDeterministicShuffledItems = <T extends { id: string }>(items: T[], seed: string): T[] => {
  return getSharedDeterministicShuffledItems(items, seed);
};
