import React from 'react';
import type { OmlQuoteBlock } from '../../../../types/oml';
import { renderInlineMarkdown } from '../utils';

interface QuoteBlockProps {
  block: OmlQuoteBlock;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ block }) => {
  return (
    <blockquote className="border-l-4 border-primary/30 pl-3 italic text-[11px] text-slate-600 my-2">
      {renderInlineMarkdown(block.text)}
    </blockquote>
  );
};
