import type { CodeBlockContent, CodeLanguage, CodeTheme } from './CodeTypes';

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

export const THEME_STYLES: Record<CodeTheme, { bg: string; text: string; border: string; lineNumBg: string; lineNumText: string }> = {
  dark: {
    bg: '#282a36',
    text: '#f8f8f2',
    border: '#44475a',
    lineNumBg: '#21222c',
    lineNumText: '#6272a4',
  },
  monokai: {
    bg: '#1e1e1e',
    text: '#d4d4d4',
    border: '#333',
    lineNumBg: '#161616',
    lineNumText: '#5a5a5a',
  },
  light: {
    bg: '#f5f5f5',
    text: '#383a42',
    border: '#d0d0d0',
    lineNumBg: '#e8e8e8',
    lineNumText: '#9d9d9d',
  },
  github: {
    bg: '#ffffff',
    text: '#1F2937',
    border: '#E5E7EB',
    lineNumBg: '#f6f8fa',
    lineNumText: '#959da5',
  },
};

export const createDefaultCodeContent = (): CodeBlockContent => ({
  language: 'typescript',
  code: '',
  theme: 'dark',
  showLineNumbers: true,
  wrapLine: false,
});

/** Map CodeLanguage → Prism language alias */
export const PRISM_LANG_MAP: Record<string, string> = {
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
  plaintext: 'plaintext',
};

export const highlightCode = (code: string, language: string): string => {
  const prism = (window as { Prism?: { highlight: (c: string, g: unknown, l: string) => string; languages: Record<string, unknown> } }).Prism;
  if (!prism || !code) return code;
  const lang = PRISM_LANG_MAP[language] || 'plaintext';
  const grammar = prism.languages[lang];
  if (!grammar || lang === 'plaintext') return code;
  try {
    return prism.highlight(code, grammar, lang);
  } catch {
    return code;
  }
};

export const CODE_THEME_CSS = `
/* Dracula (dark) theme token overrides */
.theme-code-dark pre,
.theme-code-dark code,
.theme-code-dark pre[class*="language-"],
.theme-code-dark code[class*="language-"] {
  color: #f8f8f2 !important;
  background: transparent !important;
  text-shadow: none !important;
}
.theme-code-dark .token.comment,
.theme-code-dark .token.prolog,
.theme-code-dark .token.doctype,
.theme-code-dark .token.cdata {
  color: #6272a4 !important;
  font-style: italic !important;
}
.theme-code-dark .token.string,
.theme-code-dark .token.attr-value {
  color: #f1fa8c !important;
}
.theme-code-dark .token.punctuation,
.theme-code-dark .token.operator {
  color: #f8f8f2 !important;
}
.theme-code-dark .token.number,
.theme-code-dark .token.boolean {
  color: #bd93f9 !important;
}
.theme-code-dark .token.keyword,
.theme-code-dark .token.property,
.theme-code-dark .token.tag,
.theme-code-dark .token.selector {
  color: #ff79c6 !important;
}
.theme-code-dark .token.function,
.theme-code-dark .token.class-name {
  color: #50fa7b !important;
}
.theme-code-dark .token.regex,
.theme-code-dark .token.variable,
.theme-code-dark .token.constant {
  color: #ffb86c !important;
}

/* Monokai theme token overrides */
.theme-code-monokai pre,
.theme-code-monokai code,
.theme-code-monokai pre[class*="language-"],
.theme-code-monokai code[class*="language-"] {
  color: #d4d4d4 !important;
  background: transparent !important;
  text-shadow: none !important;
}
.theme-code-monokai .token.comment {
  color: #75715e !important;
  font-style: italic !important;
}
.theme-code-monokai .token.string {
  color: #e6db74 !important;
}
.theme-code-monokai .token.punctuation,
.theme-code-monokai .token.operator {
  color: #f8f8f2 !important;
}
.theme-code-monokai .token.number,
.theme-code-monokai .token.boolean {
  color: #ae81ff !important;
}
.theme-code-monokai .token.keyword,
.theme-code-monokai .token.property,
.theme-code-monokai .token.tag {
  color: #f92672 !important;
}
.theme-code-monokai .token.function,
.theme-code-monokai .token.class-name {
  color: #a6e22e !important;
}
.theme-code-monokai .token.regex,
.theme-code-monokai .token.variable {
  color: #fd971f !important;
}

/* Light theme token overrides */
.theme-code-light pre,
.theme-code-light code,
.theme-code-light pre[class*="language-"],
.theme-code-light code[class*="language-"] {
  color: #383a42 !important;
  background: transparent !important;
  text-shadow: none !important;
}
.theme-code-light .token.comment {
  color: #a0a1a7 !important;
  font-style: italic !important;
}
.theme-code-light .token.string {
  color: #50a14f !important;
}
.theme-code-light .token.punctuation,
.theme-code-light .token.operator {
  color: #383a42 !important;
}
.theme-code-light .token.number,
.theme-code-light .token.boolean {
  color: #986801 !important;
}
.theme-code-light .token.keyword,
.theme-code-light .token.property,
.theme-code-light .token.tag {
  color: #a626a4 !important;
}
.theme-code-light .token.function,
.theme-code-light .token.class-name {
  color: #4078f2 !important;
}
.theme-code-light .token.regex,
.theme-code-light .token.variable {
  color: #986801 !important;
}

/* GitHub Light theme token overrides */
.theme-code-github pre,
.theme-code-github code,
.theme-code-github pre[class*="language-"],
.theme-code-github code[class*="language-"] {
  color: #1F2937 !important;
  background: transparent !important;
  text-shadow: none !important;
}
.theme-code-github .token.comment {
  color: #6A737D !important;
  font-style: italic !important;
}
.theme-code-github .token.string {
  color: #032F62 !important;
}
.theme-code-github .token.punctuation,
.theme-code-github .token.operator {
  color: #24292E !important;
}
.theme-code-github .token.number,
.theme-code-github .token.boolean {
  color: #005CC5 !important;
}
.theme-code-github .token.keyword,
.theme-code-github .token.property,
.theme-code-github .token.tag {
  color: #D73A49 !important;
}
.theme-code-github .token.function,
.theme-code-github .token.class-name {
  color: #6F42C1 !important;
}
.theme-code-github .token.regex,
.theme-code-github .token.variable {
  color: #E36209 !important;
}
`;

