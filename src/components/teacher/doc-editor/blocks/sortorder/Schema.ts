import { z } from 'zod';

export const sortOrderItemSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'icon']),
  content: z.string(),
});

export const sortOrderSettingsSchema = z.object({
  shuffleInitialOrder: z.boolean(),
  order: z.enum(['ascending', 'descending']),
  allowRetry: z.boolean(),
  showExplanation: z.boolean(),
  explanationText: z.string().optional(),
  autoCheck: z.boolean(),
  score: z.number().nonnegative(),
  themeColor: z.string().optional(),
});

export const sortOrderContentSchema = z.object({
  version: z.number(),
  items: z.array(sortOrderItemSchema),
  settings: sortOrderSettingsSchema,
});
