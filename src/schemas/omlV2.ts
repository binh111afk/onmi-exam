import { z } from 'zod';

const knownContentBlockTypes = [
  'heading',
  'paragraph',
  'divider',
  'quote',
  'callout',
  'image',
  'image-group',
  'formula',
  'table',
  'list',
  'question',
  'question-group',
] as const;

export const omlIdSchema = z.union([z.string().min(1), z.number()]);

export const omlImageSizeSchema = z.enum(['small', 'medium', 'full']).default('medium');

export const omlImageAssetSchema = z.object({
  src: z.string().min(1),
  alt: z.string().optional(),
  caption: z.string().optional(),
  size: omlImageSizeSchema,
}).passthrough();

export const omlInfoSchema = z.object({
  title: z.string().min(1),
  subject: z.string().optional(),
  grade: z.union([z.number(), z.string()]).optional(),
  time: z.number().positive().optional(),
  type: z.string().optional(),
  difficulty: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  allowReview: z.boolean().optional(),
  shuffle: z.boolean().optional(),
  totalQuestion: z.number().int().nonnegative().optional(),
}).passthrough();

export const omlHeadingBlockSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: z.string().min(1),
}).passthrough();

export const omlParagraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  text: z.string().min(1),
}).passthrough();

export const omlDividerBlockSchema = z.object({
  type: z.literal('divider'),
}).passthrough();

export const omlQuoteBlockSchema = z.object({
  type: z.literal('quote'),
  text: z.string().min(1),
  cite: z.string().optional(),
}).passthrough();

export const omlCalloutBlockSchema = z.object({
  type: z.literal('callout'),
  variant: z.enum(['info', 'warning', 'success', 'error']).default('info'),
  icon: z.string().optional(),
  title: z.string().optional(),
  content: z.string().min(1),
}).passthrough();

export const omlImageBlockSchema = omlImageAssetSchema.extend({
  type: z.literal('image'),
  width: z.number().positive().optional(),
});

export const omlImageGroupItemSchema = omlImageAssetSchema;

export const omlImageGroupBlockSchema = z.object({
  type: z.literal('image-group'),
  layout: z.enum(['horizontal', 'vertical', 'grid-2x2']),
  items: z.array(omlImageGroupItemSchema).min(1),
}).passthrough();

export const omlFormulaBlockSchema = z.object({
  type: z.literal('formula'),
  latex: z.string().min(1),
  display: z.enum(['inline', 'block']).default('block'),
}).passthrough();

export const omlTableBlockSchema = z.object({
  type: z.literal('table'),
  caption: z.string().optional(),
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).min(1),
}).passthrough();

export const omlListBlockSchema = z.object({
  type: z.literal('list'),
  ordered: z.boolean().default(false),
  items: z.array(z.string()).min(1),
}).passthrough();

export const omlQuestionOptionSchema = z.object({
  id: omlIdSchema,
  content: z.string().min(1),
}).passthrough();

const omlQuestionBaseSchema = z.object({
  type: z.literal('question'),
  id: omlIdSchema,
  question: z.string().min(1),
  points: z.number().nonnegative().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
  image: omlImageAssetSchema.optional(),
  explanation: z.string().optional(),
}).passthrough();

export const omlChoiceQuestionBlockSchema = omlQuestionBaseSchema.extend({
  subType: z.literal('choice').default('choice'),
  options: z.array(omlQuestionOptionSchema).min(1),
  answer: z.array(omlIdSchema).min(1),
});

export const omlTrueFalseQuestionBlockSchema = omlQuestionBaseSchema.extend({
  subType: z.literal('true-false'),
  options: z.array(omlQuestionOptionSchema).min(1),
  answer: z.array(omlIdSchema),
});

export const omlFillBlankQuestionBlockSchema = omlQuestionBaseSchema.extend({
  subType: z.literal('fill-blank'),
  options: z.array(omlQuestionOptionSchema).default([]),
  answer: z.array(z.string().min(1)).min(1),
  unit: z.string().optional(),
  units: z.array(z.string()).optional(),
  blankUnits: z.array(z.string()).optional(),
  showAnswer: z.boolean().optional(),
});

export const omlEssayQuestionBlockSchema = omlQuestionBaseSchema.extend({
  subType: z.literal('essay'),
  options: z.array(omlQuestionOptionSchema).optional(),
  answer: z.array(z.union([omlIdSchema, z.string().min(1)])).optional(),
});

export const omlQuestionBySubTypeSchema = z.discriminatedUnion('subType', [
  omlChoiceQuestionBlockSchema,
  omlTrueFalseQuestionBlockSchema,
  omlFillBlankQuestionBlockSchema,
  omlEssayQuestionBlockSchema,
]);

const omlQuestionBlockRawSchema = omlQuestionBaseSchema.extend({
  subType: z.enum(['choice', 'true-false', 'fill-blank', 'essay']).default('choice'),
  options: z.array(omlQuestionOptionSchema).default([]),
  answer: z.array(z.union([omlIdSchema, z.string().min(1)])).default([]),
});

export const omlQuestionBlockSchema = omlQuestionBlockRawSchema.superRefine((question, ctx) => {
  if (question.subType === 'choice' && question.options.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['options'],
      message: 'Choice questions require at least one option.',
    });
  }

  if (question.subType === 'true-false' && question.options.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['options'],
      message: 'True/false questions require statement options.',
    });
  }

  if (question.subType === 'fill-blank' && question.answer.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['answer'],
      message: 'Fill-blank questions require at least one accepted answer.',
    });
  }
});

const contextBlockSchemas = [
  omlHeadingBlockSchema,
  omlParagraphBlockSchema,
  omlDividerBlockSchema,
  omlQuoteBlockSchema,
  omlCalloutBlockSchema,
  omlImageBlockSchema,
  omlImageGroupBlockSchema,
  omlFormulaBlockSchema,
  omlTableBlockSchema,
  omlListBlockSchema,
] as const;

export const omlContextBlockSchema = z.discriminatedUnion('type', contextBlockSchemas);

export const omlQuestionGroupBlockSchema = z.object({
  type: z.literal('question-group'),
  id: omlIdSchema,
  context: z.array(omlContextBlockSchema).min(1),
  questions: z.array(omlQuestionBlockRawSchema).min(1),
}).passthrough();

export const omlKnownContentBlockSchema = z.discriminatedUnion('type', [
  ...contextBlockSchemas,
  omlQuestionBlockRawSchema,
  omlQuestionGroupBlockSchema,
]);

export const omlFallbackBlockSchema = z.object({
  type: z.string().min(1),
}).passthrough().superRefine((block, ctx) => {
  if ((knownContentBlockTypes as readonly string[]).includes(block.type)) {
    ctx.addIssue({
      code: 'custom',
      path: ['type'],
      message: 'Known OML block type is malformed and cannot be treated as fallback.',
    });
  }
});

export const omlContentBlockSchema = z.union([
  omlKnownContentBlockSchema,
  omlFallbackBlockSchema,
]);

export const omlDocumentV2Schema = z.object({
  version: z.literal('2.0'),
  info: omlInfoSchema,
  content: z.array(omlContentBlockSchema),
}).passthrough().superRefine((document, ctx) => {
  document.content.forEach((block, blockIndex) => {
    if (block.type === 'question') {
      const result = omlQuestionBlockSchema.safeParse(block);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ['content', blockIndex, ...issue.path],
          });
        });
      }
    }

    if (block.type === 'question-group') {
      const questions = Array.isArray((block as { questions?: unknown }).questions)
        ? ((block as { questions: unknown[] }).questions)
        : [];

      questions.forEach((question: unknown, questionIndex: number) => {
        const result = omlQuestionBlockSchema.safeParse(question);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ['content', blockIndex, 'questions', questionIndex, ...issue.path],
            });
          });
        }
      });
    }
  });
});

export type OmlDocumentV2Input = z.input<typeof omlDocumentV2Schema>;
export type OmlDocumentV2Output = z.output<typeof omlDocumentV2Schema>;



