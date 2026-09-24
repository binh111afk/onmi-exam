import React from 'react';
import type { DocBlock } from '../../../../types/doc-editor';
import { CodeBlock as CodeBlockEditor } from './code/CodeBlock';

interface CodeBlockProps {
  block: DocBlock;
  idx: number;
  setActiveBlockIndex: (index: number) => void;
  onUpdateBlock: (index: number, updated: DocBlock) => void;
}

export const CodeBlockComponent: React.FC<CodeBlockProps> = ({ block, idx, setActiveBlockIndex, onUpdateBlock }) => (
  <CodeBlockEditor
    block={block}
    idx={idx}
    isActive
    setActiveBlockIndex={setActiveBlockIndex}
    onUpdateBlock={onUpdateBlock}
  />
);

export const CodeBlock = React.memo(CodeBlockComponent);
