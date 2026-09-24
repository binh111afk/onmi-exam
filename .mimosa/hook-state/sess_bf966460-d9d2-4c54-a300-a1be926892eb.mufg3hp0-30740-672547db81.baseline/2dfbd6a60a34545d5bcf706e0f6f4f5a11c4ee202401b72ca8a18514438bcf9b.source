import React from 'react';
import type { OmlCalloutBlock } from '../../../../types/oml';
import { renderInlineMarkdown } from '../utils';

interface CalloutBlockProps {
  block: OmlCalloutBlock;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ block }) => {
  const variantStyle: Record<string, string> = {
    info:    'bg-indigo-50/70 border-indigo-100 text-indigo-800',
    warning: 'bg-amber-50/70 border-amber-100 text-amber-800',
    success: 'bg-emerald-50/70 border-emerald-100 text-emerald-800',
    error:   'bg-red-50/70 border-red-100 text-red-800',
  };
  const v = block.variant ?? 'info';
  const icon = block.icon ?? 'ℹ️';

  return (
    <div className={`border rounded-xl p-3 flex gap-2.5 items-start ${variantStyle[v] ?? variantStyle.info}`}>
      <span className="text-base leading-none shrink-0 mt-0.5">{icon}</span>
      <div className="text-[10px] leading-relaxed">
        {block.title && <div className="font-black mb-0.5">{block.title}</div>}
        {renderInlineMarkdown(block.content)}
      </div>
    </div>
  );
};
