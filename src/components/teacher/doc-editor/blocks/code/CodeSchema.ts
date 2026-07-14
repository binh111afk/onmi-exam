import { z } from 'zod';

export const CodeLanguageSchema = z.enum([
  'typescript', 'javascript', 'python', 'java', 'cpp', 'c',
  'csharp', 'html', 'css', 'sql', 'bash', 'json', 'markdown', 'plaintext',
]);

export const CodeThemeSchema = z.enum(['dark', 'light', 'monokai', 'github']);

export const CodeBlockContentSchema = z.object({
  language: CodeLanguageSchema,
  code: z.string(),
  theme: CodeThemeSchema,
  showLineNumbers: z.boolean(),
  wrapLine: z.boolean(),
});
