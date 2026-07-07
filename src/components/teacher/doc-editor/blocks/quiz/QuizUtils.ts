import { QuestionType } from './QuizTypes';
import type { QuizOption, QuizQuestion, QuizContent } from './QuizTypes';

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
    createNewOption('Phương án A', true),
    createNewOption('Phương án B', false),
    createNewOption('Phương án C', false),
    createNewOption('Phương án D', false),
  ],
});

export const createNewQuizContent = (): QuizContent => ({
  version: 1,
  questions: [createNewQuestion('Câu hỏi trắc nghiệm số 1')],
  settings: {
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: true,
    passingScore: 50,
  },
});
