import React from 'react';
import type { DocBlock } from '../DocPreviewSimulator';

interface CodeBlockProps {
  block: DocBlock;
  idx: number;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
}

export const CodeBlockComponent: React.FC<CodeBlockProps> = ({
  block,
  idx,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  return (
    <div 
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 text-white font-mono text-[9px] select-text"
    >
      <div className="flex justify-between items-center text-[8px] text-slate-400 border-b border-slate-800 pb-1.5 select-none">
        <input 
          type="text" 
          value={block.language || 'typescript'} 
          onChange={(e) => onUpdateBlock(idx, { ...block, language: e.target.value })}
          placeholder="Ngôn ngữ..." 
          className="bg-transparent border-none outline-none font-bold text-slate-300 w-20"
        />
        <span>CODE</span>
      </div>
      <textarea 
        value={block.text} 
        onChange={(e) => onUpdateBlock(idx, { ...block, text: e.target.value })}
        placeholder="Nhập code tại đây..."
        className="w-full bg-transparent border-none outline-none resize-none h-20 text-slate-200"
      />
    </div>
  );
};

export const CodeBlock = React.memo(CodeBlockComponent);
