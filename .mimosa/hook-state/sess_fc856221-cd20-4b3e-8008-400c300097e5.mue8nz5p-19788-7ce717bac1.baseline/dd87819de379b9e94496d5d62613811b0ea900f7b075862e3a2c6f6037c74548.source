import React, { useRef, useEffect } from 'react';
import { containsLatexDelimiter, LatexText } from '../common/LatexText';

interface TableCaptionProps {
  caption: string;
  placeholder?: string;
  isEditable: boolean;
  onChange?: (text: string) => void;
  onFocus?: () => void;
}

export const TableCaption: React.FC<TableCaptionProps> = ({
  caption,
  placeholder = 'Nhập chú thích bảng...',
  isEditable,
  onChange,
  onFocus,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Sync prop → DOM as plain text (supports undo/redo)
  useEffect(() => {
    if (ref.current) {
      const current = ref.current.textContent || '';
      if (current !== caption) ref.current.textContent = caption;
    }
  }, [caption]);

  if (!isEditable) {
    if (!caption) return null;
    return (
      <div className="w-full text-center mt-2">
        <span className="text-[8px] font-bold text-slate-455 tracking-wide leading-relaxed select-none italic">
          {containsLatexDelimiter(caption) ? <LatexText value={caption} /> : caption}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full text-center mt-2">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={onFocus}
        onInput={e => onChange?.(e.currentTarget.textContent || '')}
        onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
        className="outline-none text-[8px] italic text-slate-500 font-medium border-b border-transparent hover:border-slate-200 focus:border-indigo-200 focus:bg-indigo-50/10 rounded px-1 py-0.5 min-w-[120px] w-full text-center inline-block relative empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:pointer-events-none empty:before:absolute empty:before:left-0 empty:before:right-0 empty:before:mx-auto empty:before:not-italic"
      />
    </div>
  );
};
