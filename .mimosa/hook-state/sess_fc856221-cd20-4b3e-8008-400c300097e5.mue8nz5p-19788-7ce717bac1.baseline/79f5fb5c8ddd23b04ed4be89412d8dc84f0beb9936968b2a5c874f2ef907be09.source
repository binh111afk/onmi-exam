import React, { useMemo } from 'react';
import type { CodeLanguage, CodeTheme } from './CodeTypes';
import { CODE_THEME_CLASSES, PRISM_LANG_MAP, renderHighlightedCode } from './CodeUtils';

interface CodePreviewProps {
  code: string;
  language: CodeLanguage;
  theme: CodeTheme;
  showLineNumbers: boolean;
  wrapLine: boolean;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ code, language, theme, showLineNumbers, wrapLine }) => {
  const classes = CODE_THEME_CLASSES[theme];
  const lines = code.split('\n');
  const highlighted = useMemo(() => renderHighlightedCode(code, language), [code, language]);

  return (
    <div className={`theme-code-${theme} overflow-hidden rounded-lg border font-mono text-[11px] leading-[1.65] ${classes.container}`}>
      <div className={`flex items-center justify-between border-b px-3 py-1.5 text-[9px] font-black uppercase tracking-widest select-none ${classes.header}`}>
        <span>{language}</span>
        <span className="opacity-60">{lines.length} dòng</span>
      </div>
      <div className="flex overflow-x-auto">
        {showLineNumbers && (
          <div className={`min-w-11 shrink-0 select-none border-r px-3 py-3 text-right ${classes.gutter}`}>
            {lines.map((_, index) => <div key={index}>{index + 1}</div>)}
          </div>
        )}
        <pre className={`m-0 flex-1 p-3 font-mono ${classes.code} ${wrapLine ? 'min-w-0 whitespace-pre-wrap break-all' : 'min-w-max whitespace-pre'}`}>
          <code className={`language-${PRISM_LANG_MAP[language]}`} dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
};
