import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import type { CodeBlockContent, CodeLanguage, CodeTheme } from './CodeTypes';
import './CodeTheme.css';

export const SUPPORTED_LANGUAGES: { value: CodeLanguage; label: string }[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'plaintext', label: 'Văn bản thuần' },
];

export const SUPPORTED_THEMES: { value: CodeTheme; label: string }[] = [
  { value: 'dark', label: 'Tối (Dracula)' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'light', label: 'Sáng' },
  { value: 'github', label: 'GitHub' },
];

export const CODE_THEME_CLASSES: Record<CodeTheme, { container: string; header: string; gutter: string; code: string; caret: string }> = {
  dark: {
    container: 'border-slate-700 bg-slate-800 text-slate-100',
    header: 'border-slate-700 bg-slate-900 text-slate-400',
    gutter: 'border-slate-700 bg-slate-900 text-slate-500',
    code: 'text-slate-100',
    caret: 'caret-slate-100',
  },
  monokai: {
    container: 'border-slate-800 bg-slate-900 text-slate-200',
    header: 'border-slate-800 bg-black text-slate-500',
    gutter: 'border-slate-800 bg-black text-slate-600',
    code: 'text-slate-200',
    caret: 'caret-slate-200',
  },
  light: {
    container: 'border-slate-300 bg-slate-50 text-slate-700',
    header: 'border-slate-300 bg-slate-100 text-slate-500',
    gutter: 'border-slate-300 bg-slate-100 text-slate-400',
    code: 'text-slate-700',
    caret: 'caret-slate-700',
  },
  github: {
    container: 'border-slate-200 bg-white text-slate-800',
    header: 'border-slate-200 bg-slate-50 text-slate-500',
    gutter: 'border-slate-200 bg-slate-50 text-slate-400',
    code: 'text-slate-800',
    caret: 'caret-slate-800',
  },
};

export const createDefaultCodeContent = (): CodeBlockContent => ({
  language: 'typescript',
  code: '',
  theme: 'dark',
  showLineNumbers: true,
  wrapLine: false,
});

export const PRISM_LANG_MAP: Record<CodeLanguage, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'csharp',
  html: 'markup',
  css: 'css',
  sql: 'sql',
  bash: 'bash',
  json: 'json',
  markdown: 'markdown',
  plaintext: 'plain',
};

export const renderHighlightedCode = (code: string, language: CodeLanguage): string => {
  if (!code || language === 'plaintext') return Prism.util.encode(code) as string;

  const prismLanguage = PRISM_LANG_MAP[language];
  const grammar = Prism.languages[prismLanguage];
  return grammar
    ? Prism.highlight(code, grammar, prismLanguage) as string
    : Prism.util.encode(code) as string;
};
