import React, { useEffect, useRef } from 'react';
import type { CodeLanguage, CodeTheme } from './CodeTypes';
import { THEME_STYLES, PRISM_LANG_MAP, highlightCode } from './CodeUtils';

interface CodePreviewProps {
  code: string;
  language: CodeLanguage;
  theme: CodeTheme;
  showLineNumbers: boolean;
  wrapLine: boolean;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  code,
  language,
  theme,
  showLineNumbers,
  wrapLine,
}) => {
  const preRef = useRef<HTMLPreElement>(null);
  const styles = THEME_STYLES[theme];
  const isDark = theme === 'dark' || theme === 'monokai';
  const prismLang = PRISM_LANG_MAP[language] || 'plaintext';

  // Re-highlight when code or language changes
  useEffect(() => {
    const prism = (window as { Prism?: { highlightElement: (el: Element) => void } }).Prism;
    if (prism && preRef.current) {
      const codeEl = preRef.current.querySelector('code');
      if (codeEl) {
        codeEl.textContent = code || '';
        prism.highlightElement(codeEl);
      }
    }
  }, [code, language, theme]);

  const highlighted = highlightCode(code || '', language);
  const usePrism = highlighted !== (code || '');

  const lines = (code || '').split('\n');

  return (
    <div
      className="rounded-lg overflow-hidden text-[11px] font-mono leading-[1.65]"
      style={{ background: styles.bg, border: `1px solid ${styles.border}` }}
    >
      {/* Language badge header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 text-[9px] font-black uppercase tracking-widest select-none"
        style={{
          background: styles.lineNumBg,
          color: styles.lineNumText,
          borderBottom: `1px solid ${styles.border}`,
        }}
      >
        <span>{language}</span>
        <span className="opacity-60">{lines.length} dòng</span>
      </div>

      <div className="flex overflow-x-auto">
        {/* Line numbers */}
        {showLineNumbers && (
          <div
            className="select-none text-right pr-3 pt-3 pb-3 pl-3 shrink-0"
            style={{
              background: styles.lineNumBg,
              color: styles.lineNumText,
              borderRight: `1px solid ${styles.border}`,
              minWidth: '2.8rem',
            }}
          >
            {lines.map((_, i) => (
              <div key={i} style={{ lineHeight: '1.65' }}>
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Highlighted code */}
        {usePrism ? (
          // Prism not yet loaded → use dangerouslySetInnerHTML result
          <pre
            ref={preRef}
            className={`flex-1 p-3 m-0 overflow-x-auto bg-transparent ${isDark ? 'prism-dark' : ''}`}
            style={{
              whiteSpace: wrapLine ? 'pre-wrap' : 'pre',
              wordBreak: wrapLine ? 'break-all' : undefined,
              color: styles.text,
              background: 'transparent',
            }}
          >
            <code
              className={`language-${prismLang}`}
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        ) : (
          // Prism loaded — use useEffect approach for live highlighting
          <pre
            ref={preRef}
            className={`flex-1 p-3 m-0 overflow-x-auto bg-transparent`}
            style={{
              whiteSpace: wrapLine ? 'pre-wrap' : 'pre',
              wordBreak: wrapLine ? 'break-all' : undefined,
              color: styles.text,
              background: 'transparent',
            }}
          >
            <code className={`language-${prismLang}`}>{code || ''}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
