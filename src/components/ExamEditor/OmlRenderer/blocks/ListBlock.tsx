import React from 'react';
import type { OmlListBlock } from '../../../../types/oml';
import { renderInlineMarkdown } from '../utils';

interface ListBlockProps {
  block: OmlListBlock;
}

export const ListBlock: React.FC<ListBlockProps> = ({ block }) => {
  const Tag = block.ordered ? 'ol' : 'ul';
  return (
    <Tag className={`text-[11px] text-slate-655 leading-relaxed space-y-1 pl-4 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
      {(block.items ?? []).map((item: string, ii: number) => (
        <li key={ii}>{renderInlineMarkdown(item)}</li>
      ))}
    </Tag>
  );
};
