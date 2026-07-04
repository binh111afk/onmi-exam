import React from 'react';
import type { OmlFormulaBlock } from '../../../../types/oml';

interface FormulaBlockProps {
  block: OmlFormulaBlock;
}

export const FormulaBlock: React.FC<FormulaBlockProps> = ({ block }) => {
  const katex = (window as any).katex;
  if (katex) {
    try {
      const displayMode = block.display !== 'inline';
      const html = katex.renderToString(block.latex, { displayMode, throwOnError: false });
      return (
        <div 
          className={`my-3 overflow-x-auto ${displayMode ? 'w-full flex justify-center' : 'inline-block'}`}
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      );
    } catch (e) {
      // fallback
    }
  }
  return (
    <div className={`my-2 ${block.display === 'inline' ? 'inline-block' : 'flex justify-center'}`}>
      <code className="font-mono text-[11px] bg-purple-50 text-purple-700 border border-purple-100 rounded-xl px-4 py-2 select-text">
        {block.latex}
      </code>
    </div>
  );
};
