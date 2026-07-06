import React, { useRef, useEffect } from 'react';

interface TableCellProps {
  value: string;
  onChange: (val: string) => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerEnter?: (e: React.PointerEvent) => void;
  isFocused: boolean;
  rowIdx: number;
  colIdx: number;
  isHeader?: boolean;
  style?: React.CSSProperties;
}

const normalizeHtml = (html: string) => {
  return html
    .replace(/<br\s*\/?>$/i, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

export const TableCell: React.FC<TableCellProps> = ({
  value,
  onChange,
  onFocus,
  onKeyDown,
  onPaste,
  onPointerDown,
  onPointerEnter,
  isFocused,
  isHeader,
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const normalizedDOM = normalizeHtml(ref.current.innerHTML);
      const normalizedProp = normalizeHtml(value);
      if (normalizedDOM !== normalizedProp) {
        ref.current.innerHTML = value;
      }
    }
  }, [value]);

  useEffect(() => {
    if (isFocused && ref.current && document.activeElement !== ref.current) {
      ref.current.focus();
      
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isFocused]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={onFocus}
      onInput={(e) => onChange(e.currentTarget.innerHTML)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      className={`outline-none min-h-[22px] px-2.5 py-1.5 text-[10px] focus:bg-indigo-50/25 cursor-text select-text w-full h-full flex items-center ${
        isHeader 
          ? 'bg-slate-50 text-indigo-900 font-black' 
          : 'bg-white text-slate-800 font-bold'
      }`}
      style={{ minWidth: '60px', ...style }}
    />
  );
};
