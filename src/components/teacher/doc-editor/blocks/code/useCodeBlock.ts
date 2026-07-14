import { useCallback } from 'react';
import type { DocBlock } from '../../../../../types/doc-editor';
import type { CodeBlockContent, CodeLanguage, CodeTheme } from './CodeTypes';
import { createDefaultCodeContent } from './CodeUtils';

export const useCodeBlock = (
  block: DocBlock,
  idx: number,
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void,
) => {
  const getContent = useCallback((): CodeBlockContent => {
    if (block.codeContent) return block.codeContent;
    // backward compat: old block had only block.text + block.language
    return {
      ...createDefaultCodeContent(),
      code: block.text || '',
      language: (block.language as CodeLanguage) || 'typescript',
    };
  }, [block]);

  const content = getContent();

  const updateContent = useCallback(
    (patch: Partial<CodeBlockContent>, debounced = false) => {
      const next: CodeBlockContent = { ...content, ...patch };
      onUpdateBlock(idx, { ...block, codeContent: next, text: next.code }, debounced);
    },
    [block, content, idx, onUpdateBlock],
  );

  const handleCodeChange = useCallback(
    (code: string, isDebounced = false) => updateContent({ code }, isDebounced),
    [updateContent],
  );

  const handleLanguageChange = useCallback(
    (language: CodeLanguage) => updateContent({ language }),
    [updateContent],
  );

  const handleThemeChange = useCallback(
    (theme: CodeTheme) => updateContent({ theme }),
    [updateContent],
  );

  const toggleLineNumbers = useCallback(
    () => updateContent({ showLineNumbers: !content.showLineNumbers }),
    [content.showLineNumbers, updateContent],
  );

  const toggleWrapLine = useCallback(
    () => updateContent({ wrapLine: !content.wrapLine }),
    [content.wrapLine, updateContent],
  );

  return {
    code: content.code,
    language: content.language,
    theme: content.theme,
    showLineNumbers: content.showLineNumbers,
    wrapLine: content.wrapLine,
    handleCodeChange,
    handleLanguageChange,
    handleThemeChange,
    toggleLineNumbers,
    toggleWrapLine,
  };
};
