import React, { useRef, useEffect } from 'react';

interface TableCaptionProps {
  caption: string;
  placeholder?: string;
  isEditable: boolean;
  /** Mirrors block.align so caption tracks the table's horizontal position */
  align?: 'left' | 'center' | 'right';
  /**
   * When the table has manually-set pixel widths, pass the total pixel width
   * here so the caption is capped at the same width as the table.
   * Pass undefined for fluid (100%-width) tables.
   */
  tableMaxWidth?: number;
  onChange?: (text: string) => void;
  onFocus?: () => void;
}

export const TableCaption: React.FC<TableCaptionProps> = ({
  caption,
  placeholder = 'Nhập chú thích bảng...',
  isEditable,
  align,
  tableMaxWidth,
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

  /** CSS that pins caption width and alignment to the rendered table */
  const containerStyle: React.CSSProperties = {
    display:    'flex',
    marginTop:  '0.5rem',
    marginLeft:  align === 'center' || align === 'right' ? 'auto' : 0,
    marginRight: align === 'center' ? 'auto' : 0,
    maxWidth:    tableMaxWidth ? `${tableMaxWidth}px` : '100%',
    width:       tableMaxWidth ? `${tableMaxWidth}px` : '100%',
    justifyContent:
      align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
  };

  if (!isEditable) {
    if (!caption) return null;
    return (
      <div style={containerStyle}>
        <span className="text-[8px] font-bold text-slate-450 tracking-wide leading-relaxed select-none italic">
          {caption}
        </span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={onFocus}
        onInput={e => onChange?.(e.currentTarget.textContent || '')}
        onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
        className="outline-none text-[8px] italic text-slate-500 font-medium border-b border-transparent hover:border-slate-200 focus:border-indigo-200 focus:bg-indigo-50/10 rounded px-1 py-0.5 min-w-[120px] w-full text-left relative empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:pointer-events-none empty:before:absolute empty:before:not-italic"
      />
    </div>
  );
};
