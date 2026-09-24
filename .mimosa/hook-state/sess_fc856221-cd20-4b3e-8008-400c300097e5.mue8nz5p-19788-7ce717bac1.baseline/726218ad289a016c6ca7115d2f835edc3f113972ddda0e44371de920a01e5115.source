import React from 'react';
import type { OmlParagraphBlock } from '../../../../types/oml';
import { renderInlineMarkdown } from '../utils';

interface ParagraphBlockProps {
  block: OmlParagraphBlock;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ block }) => {
  return (
    <p className="text-[11px] text-slate-655 leading-relaxed font-medium">
      {renderInlineMarkdown(block.text)}
    </p>
  );
};
