import { z } from 'zod';

export const flashcardCardSchema = z.object({
  id: z.string(),
  front: z.string(),
  back: z.string(),
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const flashcardSettingsSchema = z.object({
  shuffleCards: z.boolean(),
  flipAnimation: z.boolean(),
  autoPlay: z.boolean(),
  showProgress: z.boolean(),
  cardOrder: z.enum(['manual', 'created']),
});

export const flashcardContentSchema = z.object({
  version: z.number(),
  settings: flashcardSettingsSchema,
  cards: z.array(flashcardCardSchema),
});
