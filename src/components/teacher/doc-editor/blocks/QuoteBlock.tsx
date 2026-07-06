import React, { useRef, useEffect } from 'react';
import type { DocBlock } from '../DocPreviewSimulator';

interface QuoteBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  alignClass: string;
  setActiveBlockIndex: (i: number) => void;
  updateBlockText: (i: number, val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const normalizeHtml = (html: string) => {
  return html
    .replace(/<br\s*\/?>$/i, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

export const QuoteBlockComponent: React.FC<QuoteBlockProps> = ({
  block,
  idx,
  isActive,
  alignClass,
  setActiveBlockIndex,
  updateBlockText,
  handleKeyDown,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const normalizedDOM = normalizeHtml(ref.current.innerHTML);
      const normalizedProp = normalizeHtml(block.text);
      if (normalizedDOM !== normalizedProp) {
        ref.current.innerHTML = block.text;
      }
    }
  }, [block.text]);

  const placeholderText = isActive ? 'Type "/" to insert a block...' : '';

  return (
    <div className="flex-1 flex items-start gap-2.5 min-h-[24px]">
      <div className="w-6 flex items-center justify-center shrink-0 select-none h-full pt-1 text-slate-300 font-serif italic text-base font-black">
        “
      </div>
      <div
        ref={ref}
        id={`block-editor-${idx}`}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholderText}
        onFocus={() => setActiveBlockIndex(idx)}
        onInput={(e) => updateBlockText(idx, e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
        className={`flex-1 outline-none py-1 border-l-4 border-slate-200 pl-3 italic text-xs text-slate-655 font-medium min-h-[24px] cursor-text select-text relative ${alignClass} ${
          isActive && block.text.trim() === '' ? 'before:content-[attr(data-placeholder)] before:text-slate-300 before:absolute before:left-3 before:top-1 before:pointer-events-none' : ''
        }`}
      />
    </div>
  );
};

export const QuoteBlock = React.memo(QuoteBlockComponent);
