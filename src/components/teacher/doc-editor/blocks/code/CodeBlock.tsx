import React, { useState } from 'react';
import { Code2 } from 'lucide-react';
import type { DocBlock } from '../../../../../types/doc-editor';
import { useCodeBlock } from './useCodeBlock';
import { CodeToolbar } from './CodeToolbar';
import { CodeEditor } from './CodeEditor';
import { CodeSettingsDialog } from './CodeSettingsDialog';
import { createDefaultCodeContent } from './CodeUtils';

interface CodeBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock, isDebounced?: boolean) => void;
}

const CodeBlockComponent: React.FC<CodeBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    code,
    language,
    theme,
    showLineNumbers,
    wrapLine,
    handleCodeChange,
    handleLanguageChange,
    handleThemeChange,
    toggleLineNumbers,
    toggleWrapLine,
  } = useCodeBlock(block, idx, onUpdateBlock);

  // Initialize codeContent if block was created without it
  React.useEffect(() => {
    if (!block.codeContent) {
      onUpdateBlock(idx, {
        ...block,
        codeContent: { ...createDefaultCodeContent(), code: block.text || '' },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        onClick={() => setActiveBlockIndex(idx)}
        className="flex-1 p-3 border border-violet-100 bg-violet-50/20 rounded-xl my-1 flex flex-col gap-2 cursor-default select-text"
      >
        {/* Badge header */}
        <div className="flex items-center justify-between text-violet-600 font-extrabold text-[8px] uppercase tracking-wide select-none">
          <span className="flex items-center gap-1">
            <Code2 size={10} className="stroke-[2.5]" /> Khối Mã nguồn
          </span>
          <span className="text-violet-400 font-medium normal-case tracking-normal text-[9px]">
            {language}
          </span>
        </div>

        {/* Toolbar (visible when active) */}
        <CodeToolbar
          isBlockActive={isActive}
          language={language}
          theme={theme}
          showLineNumbers={showLineNumbers}
          wrapLine={wrapLine}
          onLanguageChange={handleLanguageChange}
          onThemeChange={handleThemeChange}
          onToggleLineNumbers={toggleLineNumbers}
          onToggleWrapLine={toggleWrapLine}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Editor */}
        <CodeEditor
          code={code}
          language={language}
          theme={theme}
          showLineNumbers={showLineNumbers}
          wrapLine={wrapLine}
          onChange={handleCodeChange}
        />
      </div>

      {/* Settings dialog — rendered outside block to avoid z-index issues */}
      <CodeSettingsDialog
        isOpen={isSettingsOpen}
        language={language}
        theme={theme}
        showLineNumbers={showLineNumbers}
        wrapLine={wrapLine}
        onLanguageChange={handleLanguageChange}
        onThemeChange={handleThemeChange}
        onToggleLineNumbers={toggleLineNumbers}
        onToggleWrapLine={toggleWrapLine}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export const CodeBlock = React.memo(CodeBlockComponent);
