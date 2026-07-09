import { z } from 'zod';

export const dragDropCardSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'icon']),
  content: z.string(),
});

export const dragDropZoneSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'icon']),
  content: z.string(),
  correctCardIds: z.array(z.string()),
});

export const dragDropSettingsSchema = z.object({
  shuffleCards: z.boolean(),
  shuffleZones: z.boolean(),
  allowRetry: z.boolean(),
  snapAnimation: z.boolean(),
  showCorrectAnswer: z.boolean(),
  autoCheck: z.boolean(),
  multipleCorrect: z.boolean(),
  randomOrder: z.boolean(),
  themeColor: z.string().optional(),
});

export const dragDropContentSchema = z.object({
  version: z.number(),
  cards: z.array(dragDropCardSchema),
  zones: z.array(dragDropZoneSchema),
  settings: dragDropSettingsSchema,
});
