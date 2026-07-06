import React from 'react';
import type { DocBlock } from '../DocPreviewSimulator';

interface FormulaBlockProps {
  block: DocBlock;
  idx: number;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
}

export const FormulaBlockComponent: React.FC<FormulaBlockProps> = ({
  block,
  idx,
  setActiveBlockIndex,
  onUpdateBlock,
}) => {
  const latex = block.latex || 'f(x) = x^2';

  return (
    <div 
      onClick={() => setActiveBlockIndex(idx)}
      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-2 select-none"
    >
      <div className="text-center py-2.5 text-xs font-serif font-black text-slate-800 tracking-wide">
        {latex}
      </div>
      <input 
        type="text" 
        value={block.latex || ''} 
        onChange={(e) => onUpdateBlock(idx, { ...block, latex: e.target.value })} 
        placeholder="Công thức LaTeX (e.g. E = mc^2)..."
        className="w-full text-[9px] bg-white border border-slate-200 rounded-lg px-2.5 py-1 outline-none font-bold text-slate-700 focus:ring-1 focus:ring-primary focus:border-primary"
      />
    </div>
  );
};

export const FormulaBlock = React.memo(FormulaBlockComponent);
