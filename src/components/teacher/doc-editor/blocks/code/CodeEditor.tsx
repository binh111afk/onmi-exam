import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { CodeTheme } from './CodeTypes';
import { THEME_STYLES, highlightCode, CODE_THEME_CSS } from './CodeUtils';

interface CodeEditorProps {
  code: string;
  theme: CodeTheme;
  showLineNumbers: boolean;
  wrapLine: boolean;
  language?: string;
  onChange: (code: string, isDebounced?: boolean) => void;
}

export const CodeEditorComponent: React.FC<CodeEditorProps> = ({
  code,
  theme,
  showLineNumbers,
  wrapLine,
  language = 'typescript',
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [localCode, setLocalCode] = useState(code);
  const lastPropCodeRef = useRef(code);
  const isComposingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (code !== lastPropCodeRef.current) {
      setLocalCode(code);
      lastPropCodeRef.current = code;
    }
  }, [code]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const triggerChange = useCallback((value: string, isDebounced: boolean) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onChange(value, isDebounced);
    lastPropCodeRef.current = value;
  }, [onChange]);

  const scheduleChange = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (!isComposingRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        triggerChange(value, true);
      }, 400);
    }
  }, [triggerChange]);

  const handleChange = useCallback((val: string) => {
    setLocalCode(val);
    scheduleChange(val);
  }, [scheduleChange]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLTextAreaElement>) => {
    isComposingRef.current = false;
    const val = e.currentTarget.value;
    setLocalCode(val);
    triggerChange(val, true);
  }, [triggerChange]);

  const handleBlur = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (!isComposingRef.current && localCode !== lastPropCodeRef.current) {
      triggerChange(localCode, false);
    }
  }, [triggerChange, localCode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const indent = '  ';
      const newVal = ta.value.substring(0, start) + indent + ta.value.substring(end);
      
      setLocalCode(newVal);
      triggerChange(newVal, false);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + indent.length;
          textareaRef.current.selectionEnd = start + indent.length;
        }
      });
    }
  }, [triggerChange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const pre = preRef.current;
    if (pre) {
      pre.scrollTop = e.currentTarget.scrollTop;
      pre.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  const fontStyles: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '11px',
    lineHeight: '1.65',
    padding: '12px',
    margin: 0,
    border: 0,
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
  };

  const styles = THEME_STYLES[theme];
  const highlighted = useMemo(() => highlightCode(localCode, language), [localCode, language]);

  return (
    <div
      className={`theme-code-${theme} relative rounded-lg overflow-hidden`}
      style={{ background: styles.bg, border: `1px solid ${styles.border}` }}
    >
      <style>{CODE_THEME_CSS}</style>
      <div className="flex overflow-hidden">
        {showLineNumbers && (
          <div
            className="select-none text-right shrink-0"
            style={{
              ...fontStyles,
              background: styles.lineNumBg,
              color: styles.lineNumText,
              borderRight: `1px solid ${styles.border}`,
              minWidth: '2.8rem',
            }}
          >
            {localCode.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            {localCode === '' && <div>1</div>}
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
            style={{ ...fontStyles, whiteSpace: wrapLine ? 'pre-wrap' : 'pre', wordBreak: 'break-all' }}
            dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
          />
          <textarea
            ref={textareaRef}
            value={localCode}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onScroll={handleScroll}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            spellCheck={false}
            className="relative w-full h-[300px] bg-transparent resize-y outline-none"
            style={{
              ...fontStyles,
              color: 'transparent',
              caretColor: styles.text,
              whiteSpace: wrapLine ? 'pre-wrap' : 'pre',
              wordBreak: 'break-all',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const CodeEditor = React.memo(CodeEditorComponent);
