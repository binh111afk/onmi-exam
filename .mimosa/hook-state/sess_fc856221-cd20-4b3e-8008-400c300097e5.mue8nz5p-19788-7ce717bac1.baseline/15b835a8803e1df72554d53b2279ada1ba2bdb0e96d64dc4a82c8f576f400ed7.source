import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CodeLanguage, CodeTheme } from './CodeTypes';
import { CODE_THEME_CLASSES, PRISM_LANG_MAP, renderHighlightedCode } from './CodeUtils';

const AUTO_CLOSE_PAIRS: Record<string, string> = {
  '(': ')',
  '[': ']',
  '{': '}',
  '"': '"',
  "'": "'",
  '`': '`',
};

const CLOSING_CHARACTERS = new Set(Object.values(AUTO_CLOSE_PAIRS));

interface CodeEditorProps {
  code: string;
  theme: CodeTheme;
  showLineNumbers: boolean;
  wrapLine: boolean;
  language: CodeLanguage;
  onChange: (code: string, isDebounced?: boolean) => void;
}

export const CodeEditorComponent: React.FC<CodeEditorProps> = ({ code, theme, showLineNumbers, wrapLine, language, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPropCodeRef = useRef(code);
  const isComposingRef = useRef(false);
  const [localCode, setLocalCode] = useState(code);
  const classes = CODE_THEME_CLASSES[theme];
  const lines = localCode.split('\n');
  const highlighted = useMemo(() => renderHighlightedCode(localCode, language), [localCode, language]);

  useEffect(() => {
    if (code !== lastPropCodeRef.current) {
      setLocalCode(code);
      lastPropCodeRef.current = code;
    }
  }, [code]);

  useEffect(() => () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, []);

  const publishChange = useCallback((value: string, isDebounced: boolean) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = null;
    lastPropCodeRef.current = value;
    onChange(value, isDebounced);
  }, [onChange]);

  const scheduleChange = useCallback((value: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!isComposingRef.current) {
      debounceTimerRef.current = setTimeout(() => publishChange(value, true), 400);
    }
  }, [publishChange]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setLocalCode(value);
    scheduleChange(value);
  }, [scheduleChange]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = event.currentTarget;
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = scrollTop;
  }, []);

  const handleBlur = useCallback(() => {
    if (!isComposingRef.current && localCode !== lastPropCodeRef.current) publishChange(localCode, false);
  }, [localCode, publishChange]);

  const applyEditorEdit = useCallback((nextCode: string, selectionStart: number, selectionEnd = selectionStart) => {
    setLocalCode(nextCode);
    publishChange(nextCode, false);
    requestAnimationFrame(() => textareaRef.current?.setSelectionRange(selectionStart, selectionEnd));
  }, [publishChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd, value } = event.currentTarget;
    const selectedText = value.slice(selectionStart, selectionEnd);

    if (event.key === 'Tab') {
      event.preventDefault();
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineEnd = value.indexOf('\n', selectionEnd);
      const selectedLinesEnd = lineEnd === -1 ? value.length : lineEnd;
      const lines = value.slice(lineStart, selectedLinesEnd).split('\n');
      const editedLines = event.shiftKey
        ? lines.map(line => line.startsWith('  ') ? line.slice(2) : line.startsWith('\t') ? line.slice(1) : line)
        : lines.map(line => `  ${line}`);
      const nextLines = editedLines.join('\n');
      const nextCode = `${value.slice(0, lineStart)}${nextLines}${value.slice(selectedLinesEnd)}`;
      const indentationChange = nextLines.length - value.slice(lineStart, selectedLinesEnd).length;
      const nextStart = selectionStart + (selectionStart === lineStart ? 0 : event.shiftKey ? -Math.min(2, value.slice(lineStart, selectionStart).match(/^\s*/)?.[0].length ?? 0) : 2);
      applyEditorEdit(nextCode, Math.max(lineStart, nextStart), selectionEnd + indentationChange);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const currentLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.slice(currentLineStart, selectionStart);
      const baseIndent = currentLine.match(/^\s*/)?.[0] ?? '';
      const previousCharacter = value[selectionStart - 1];
      const nextCharacter = value[selectionEnd];
      const closesPair = AUTO_CLOSE_PAIRS[previousCharacter] === nextCharacter;
      const insertion = closesPair
        ? `\n${baseIndent}  \n${baseIndent}`
        : `\n${baseIndent}${previousCharacter === '{' ? '  ' : ''}`;
      const caretPosition = selectionStart + 1 + baseIndent.length + (closesPair || previousCharacter === '{' ? 2 : 0);
      applyEditorEdit(`${value.slice(0, selectionStart)}${insertion}${value.slice(selectionEnd)}`, caretPosition);
      return;
    }

    const closingCharacter = AUTO_CLOSE_PAIRS[event.key];
    if (closingCharacter) {
      event.preventDefault();
      applyEditorEdit(
        `${value.slice(0, selectionStart)}${event.key}${selectedText}${closingCharacter}${value.slice(selectionEnd)}`,
        selectionStart + 1,
        selectionStart + 1 + selectedText.length,
      );
      return;
    }

    if (CLOSING_CHARACTERS.has(event.key) && !selectedText && value[selectionStart] === event.key) {
      event.preventDefault();
      applyEditorEdit(value, selectionStart + 1);
      return;
    }

    if (event.key === 'Backspace' && !selectedText && AUTO_CLOSE_PAIRS[value[selectionStart - 1]] === value[selectionStart]) {
      event.preventDefault();
      applyEditorEdit(`${value.slice(0, selectionStart - 1)}${value.slice(selectionStart + 1)}`, selectionStart - 1);
    }
  }, [applyEditorEdit]);

  return (
    <div className={`theme-code-${theme} overflow-hidden rounded-lg border font-mono text-[11px] leading-[1.65] ${classes.container}`}>
      <div className="flex h-[300px] overflow-hidden">
        {showLineNumbers && (
          <div ref={lineNumbersRef} aria-hidden="true" className={`min-w-11 shrink-0 overflow-hidden border-r px-3 py-3 text-right select-none ${classes.gutter}`}>
            {lines.map((_, index) => <div key={index}>{index + 1}</div>)}
          </div>
        )}
        <div className="relative min-w-0 flex-1">
          <pre ref={highlightRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 m-0 overflow-hidden p-3 font-mono ${classes.code} ${wrapLine ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'}`}>
            <code className={`language-${PRISM_LANG_MAP[language]}`} dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
          <textarea
            ref={textareaRef}
            value={localCode}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onScroll={handleScroll}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={(event) => {
              isComposingRef.current = false;
              setLocalCode(event.currentTarget.value);
              publishChange(event.currentTarget.value, true);
            }}
            placeholder="// Nhập mã nguồn tại đây..."
            spellCheck={false}
            className={`relative z-10 h-full w-full resize-none overflow-auto bg-transparent p-3 font-mono text-transparent outline-none selection:bg-primary/30 placeholder:text-slate-500 ${wrapLine ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'} ${classes.caret}`}
          />
        </div>
      </div>
    </div>
  );
};

export const CodeEditor = React.memo(CodeEditorComponent);
