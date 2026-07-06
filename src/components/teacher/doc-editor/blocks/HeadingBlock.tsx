import React, { useRef, useEffect } from 'react';
import type { DocBlock } from '../DocPreviewSimulator';

interface HeadingBlockProps {
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

export const HeadingBlockComponent: React.FC<HeadingBlockProps> = ({
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

  const level = block.level || 1;
  const placeholderText = isActive ? 'Type "/" to insert a block...' : '';

  return (
    <div
      ref={ref}
      id={`block-editor-${idx}`}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholderText}
      onFocus={() => setActiveBlockIndex(idx)}
      onInput={(e) => updateBlockText(idx, e.currentTarget.innerHTML)}
      onKeyDown={handleKeyDown}
      className={`flex-1 outline-none py-1 text-slate-800 min-h-[24px] cursor-text select-text relative ${alignClass} ${
        level === 1
          ? 'text-lg font-black text-primary tracking-tight'
          : level === 2
            ? 'text-md font-bold text-slate-800'
            : 'text-sm font-bold text-slate-700'
      } ${
        isActive && block.text.trim() === '' ? 'before:content-[attr(data-placeholder)] before:text-slate-300 before:absolute before:left-0 before:top-1 before:pointer-events-none' : ''
      }`}
    />
  );
};

export const HeadingBlock = React.memo(HeadingBlockComponent);
