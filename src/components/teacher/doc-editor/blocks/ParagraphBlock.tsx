import React, { useRef, useEffect } from 'react';
import type { DocBlock } from '../../../../types/doc-editor';

interface ParagraphBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  alignClass: string;
  listIndex?: string;
  setActiveBlockIndex: (i: number) => void;
  updateBlockText: (i: number, val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  toggleTodoChecked: (i: number) => void;
}

const normalizeHtml = (html: string) => {
  return html
    .replace(/<br\s*\/?>$/i, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

export const ParagraphBlockComponent: React.FC<ParagraphBlockProps> = ({
  block,
  idx,
  isActive,
  alignClass,
  listIndex,
  setActiveBlockIndex,
  updateBlockText,
  handleKeyDown,
  toggleTodoChecked,
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
      {/* List indicator prefix */}
      <div className="w-6 flex items-center justify-center shrink-0 select-none h-full pt-1 text-slate-400">
        {block.type === 'bullet-list' && (
          <span className="text-slate-400 font-bold text-xs">•</span>
        )}
        {block.type === 'numbered-list' && (
          <span className="text-primary font-black text-[11px]">{listIndex}</span>
        )}
        {block.type === 'todo-list' && (
          <input 
            type="checkbox" 
            checked={!!block.checked}
            onChange={() => toggleTodoChecked(idx)}
            className="w-3.5 h-3.5 rounded border-slate-300 accent-primary cursor-pointer mt-0.5"
          />
        )}
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
        className={`flex-1 outline-none py-1 text-slate-800 min-h-[24px] cursor-text select-text relative ${alignClass} ${
          block.type === 'todo-list' && block.checked
            ? 'text-xs text-slate-400 line-through font-medium'
            : 'text-xs text-slate-900 leading-relaxed font-bold'
        } ${
          isActive && block.text.trim() === '' ? 'before:content-[attr(data-placeholder)] before:text-slate-300 before:absolute before:left-0 before:top-1 before:pointer-events-none' : ''
        }`}
      />
    </div>
  );
};

export const ParagraphBlock = React.memo(ParagraphBlockComponent);
