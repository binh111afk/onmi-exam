import { z } from 'zod';

export const blankItemSchema = z.object({
  id: z.string(),
  answer: z.string(),
  caseSensitive: z.boolean(),
  hint: z.string(),
  score: z.number().nonnegative(),
  alternativeAnswers: z.array(z.string()),
  width: z.number().optional(),
  placeholder: z.string().optional(),
});

export const fillBlankSettingsSchema = z.object({
  shuffleBlanks: z.boolean(),
  caseSensitive: z.boolean(),
  showHints: z.boolean(),
  showAnswerAfterSubmit: z.boolean(),
  partialScoring: z.boolean(),
  acceptMultipleAnswers: z.boolean(),
  blankStyle: z.enum(['underline', 'box', 'dashed']),
  maxAttempts: z.number().nonnegative(),
  themeColor: z.string().optional(),
});

export const fillBlankParagraphSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const fillBlankContentSchema = z.object({
  version: z.number(),
  paragraphs: z.array(fillBlankParagraphSchema),
  blanks: z.record(z.string(), blankItemSchema),
  settings: fillBlankSettingsSchema,
});
