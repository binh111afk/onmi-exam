import React from 'react';
import type { OmlHeadingBlock } from '../../../../types/oml';

interface HeadingBlockProps {
  block: OmlHeadingBlock;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block }) => {
  const sizes: Record<number, string> = {
    1: 'text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2',
    2: 'text-xs font-black text-slate-700 uppercase tracking-wider',
    3: 'text-[11px] font-black text-slate-600 uppercase tracking-wider',
  };
  return (
    <div className={`${sizes[block.level] ?? sizes[3]} mt-5 mb-1`}>
      {block.text}
    </div>
  );
};
