import { z } from 'zod';
import { QuestionType } from './QuizTypes';

export const quizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const quizQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  description: z.string().optional(),
  type: z.nativeEnum(QuestionType),
  options: z.array(quizOptionSchema),
});

export const quizSettingsSchema = z.object({
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  showCorrectAnswers: z.boolean(),
  passingScore: z.number().nonnegative(),
});

export const quizContentSchema = z.object({
  version: z.number(),
  questions: z.array(quizQuestionSchema),
  settings: quizSettingsSchema,
});
