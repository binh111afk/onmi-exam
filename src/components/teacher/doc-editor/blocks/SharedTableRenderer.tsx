/**
 * SharedTableRenderer.tsx
 *
 * Single source of truth for rendering a document table.
 * Used by both TableBlock (editor) and DocPreviewSimulator (preview).
 *
 * Editor mode   → passes resize handles, cell focus/selection props, toolbar and caption handles.
 * Preview mode  → isEditable=false, no interactive handles.
 *
 * Alignment (left / center / right) is driven by block.align.
 */
import React from 'react';
import type { DocBlock, LiveTableResizeState } from '../../../../types/doc-editor';
import { TableCaption } from './TableCaption';

// ─── Shared styling constants ────────────────────────────────────────────────

export const TABLE_BORDER_COLOR = '#CBD5E1'; // slate-300
export const TABLE_HEADER_BG    = '#F1F5F9'; // slate-100
export const TABLE_HEADER_TEXT  = '#312E81'; // indigo-900
export const TABLE_CELL_TEXT    = '#334155'; // slate-700

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ResizeHandles {
  onColResizeStart: (e: React.PointerEvent, colIdx: number) => void;
  onColResizeMove:  (e: React.PointerEvent) => void;
  onColResizeEnd:   (e: React.PointerEvent) => void;
  onRowResizeStart: (e: React.PointerEvent, rowIdx: number) => void;
  onRowResizeMove:  (e: React.PointerEvent) => void;
  onRowResizeEnd:   (e: React.PointerEvent) => void;
  resizingCol: number | null;
  resizingRow: number | null;
}

export interface SelectionHandles {
  onCellPointerDown:  (rIdx: number, cIdx: number, e: React.PointerEvent) => void;
  onCellPointerEnter: (rIdx: number, cIdx: number) => void;
  selectedCells: { r: number; c: number }[];
}

export interface CellEditHandles {
  onChange:   (rIdx: number, cIdx: number, val: string) => void;
  onFocus:    (rIdx: number, cIdx: number) => void;
  onKeyDown:  (e: React.KeyboardEvent<HTMLDivElement>, rIdx: number, cIdx: number) => void;
  onPaste:    (rIdx: number, cIdx: number, e: React.ClipboardEvent) => void;
  focusedRow: number | null;
  focusedCol: number | null;
}

export interface SharedTableRendererProps {
  block: DocBlock;
  /** Render in interactive editor mode */
  isEditable?: boolean;
  resize?:     ResizeHandles;
  selection?:  SelectionHandles;
  cellEdit?:   CellEditHandles;

  liveTableResize?: LiveTableResizeState | null;

  // Toolbar Props
  onAddRow?: () => void;
  onAddColumn?: () => void;
  onDeleteRow?: () => void;
  onDeleteColumn?: () => void;
  onDeleteTable?: () => void;
  isTableActive?: boolean;

  // Caption Props
  onChangeCaption?: (text: string) => void;
  onFocusCaption?: () => void;
  onTableSelect?: () => void;
}

export interface TableLayoutModel {
  isManual: boolean;
  colCount: number;
  rowCount: number;
  columnWidths: number[];
  rowHeights: number[];
  totalWidth: number;
  tableStyle: React.CSSProperties;
  containerStyle: React.CSSProperties;
}

// ─── Single Table Layout Engine ──────────────────────────────────────────────

export function computeTableLayout(
  block: DocBlock,
  liveWidths?: number[],
  liveHeights?: number[]
): TableLayoutModel {
  const rows = block.rows || [['', '', ''], ['', '', ''], ['', '', '']];
  const colCount = rows[0]?.length || 3;
  const rowCount = rows.length;

  const isManual = !!(block.columnWidths && block.columnWidths.length === colCount);
  const baseWidths = isManual ? block.columnWidths! : Array<number>(colCount).fill(120);
  const baseHeights = block.rowHeights && block.rowHeights.length === rowCount
    ? block.rowHeights
    : Array<number>(rowCount).fill(36);

  const columnWidths = liveWidths ?? baseWidths;
  const rowHeights = liveHeights ?? baseHeights;
  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);

  const alignToMargin = (align?: string): string => {
    if (align === 'center') return '0 auto';
    if (align === 'right')  return '0 0 0 auto';
    return '0'; // left (default)
  };

  const containerStyle: React.CSSProperties = isManual
    ? {
        width: '100%',
        maxWidth: `${totalWidth}px`,
        minWidth: `${totalWidth}px`,
        margin: alignToMargin(block.align),
      }
    : {
        width: '100%',
        margin: alignToMargin(block.align),
      };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    tableLayout: 'fixed',
  };

  return {
    isManual,
    colCount,
    rowCount,
    columnWidths,
    rowHeights,
    totalWidth,
    tableStyle,
    containerStyle,
  };
}

// ─── Resize handle ────────────────────────────────────────────────────────────

interface ColResizeHandleProps {
  /** which visual border this handle corresponds to */
  colIdx:     number;
  resize:     ResizeHandles;
}

/**
 * A 7-px wide hit-target centred on a column border.
 * Rendered absolutely inside the <td> so it never affects layout.
 */
const ColResizeHandle: React.FC<ColResizeHandleProps> = ({ colIdx, resize }) => {
  const isActive = resize.resizingCol === colIdx;
  return (
    <div
      onPointerDown={e => resize.onColResizeStart(e, colIdx)}
      onPointerMove={resize.onColResizeMove}
      onPointerUp={resize.onColResizeEnd}
      style={{
        position:       'absolute',
        top:            0,
        bottom:         0,
        right:          -4,
        width:          8,
        cursor:         'col-resize',
        zIndex:         30,
        userSelect:     'none',
        pointerEvents:  'auto',
        backgroundColor: isActive ? '#6366F1' : undefined,
        opacity:         isActive ? 1 : undefined,
      }}
      className={!isActive ? 'opacity-0 hover:opacity-100 hover:bg-indigo-400/40 transition-opacity' : ''}
    />
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export const SharedTableRenderer: React.FC<SharedTableRendererProps> = ({
  block,
  isEditable = false,
  resize,
  selection,
  cellEdit,
  liveTableResize,
  onChangeCaption,
  onFocusCaption,
  onTableSelect,
}) => {
  const rows = block.rows || [['', '', ''], ['', '', ''], ['', '', '']];
  const colCount = rows[0]?.length || 3;

  const isLive = !!(liveTableResize && liveTableResize.blockId === block.id);
  const liveWidths = isLive ? liveTableResize.columnWidths : undefined;
  const liveHeights = isLive ? liveTableResize.rowHeights : undefined;

  const {
    isManual,
    columnWidths,
    rowHeights,
    totalWidth,
    tableStyle,
    containerStyle,
  } = computeTableLayout(block, liveWidths, liveHeights);

  const isDragging = !!(
    liveTableResize &&
    liveTableResize.blockId === block.id &&
    (liveTableResize.resizingCol !== null || liveTableResize.resizingRow !== null)
  );

  const activeResizingRow = liveTableResize && liveTableResize.blockId === block.id ? liveTableResize.resizingRow : null;

  const handleTableClick = (e: React.PointerEvent) => {
    if (!isEditable) return;
    const target = e.target as HTMLElement;
    const isCell = target.closest('td') || target.closest('th');
    if (!isCell) {
      onTableSelect?.();
    }
  };

  return (
    <div
      style={containerStyle}
      onPointerDown={handleTableClick}
      className={`relative transition ${
        isEditable
          ? 'w-full rounded-xl p-1.5'
          : ''
      }`}
    >


      <table
        className="border-collapse text-[10px] font-bold"
        style={{
          ...tableStyle,
          /* left + top outer border — right + bottom come from the last td borders */
          borderTop:  `1px solid ${TABLE_BORDER_COLOR}`,
          borderLeft: `1px solid ${TABLE_BORDER_COLOR}`,
          pointerEvents: isDragging ? 'none' : undefined,
        }}
      >
        <colgroup>
          {columnWidths.map((w, ci) => (
            <col
              key={ci}
              style={{
                width: isManual
                  ? `${(w / totalWidth) * 100}%`
                  : `${100 / colCount}%`,
              }}
            />
          ))}
        </colgroup>

        <tbody>
          {rows.map((row, rIdx) => {
            const rowH = rowHeights[rIdx] ?? 36;
            return (
              <tr key={rIdx} style={{ height: `${rowH}px` }}>
                {row.map((cell, cIdx) => {
                  const isHeader =
                    (rIdx === 0 && !!block.hasHeaderRow) ||
                    (cIdx === 0 && !!block.hasHeaderColumn);
                  const cellStyles = block.cellStyles && block.cellStyles[rIdx]?.[cIdx] ? block.cellStyles[rIdx][cIdx] : {};
                  const isSelected =
                    selection?.selectedCells.some(s => s.r === rIdx && s.c === cIdx) ?? false;

                  const tdStyle: React.CSSProperties = {
                    borderRight:     `1px solid ${TABLE_BORDER_COLOR}`,
                    borderBottom:    `1px solid ${TABLE_BORDER_COLOR}`,
                    height:          `${rowH}px`,
                    verticalAlign:   cellStyles.valign || 'middle',
                    backgroundColor: isHeader ? (cellStyles.bg || TABLE_HEADER_BG) : (cellStyles.bg || 'white'),
                    position:        'relative',
                    ...(isSelected && isEditable
                      ? { outline: '2px solid #6366F1', outlineOffset: '-1px' }
                      : {}),
                  };

                  const innerStyle: React.CSSProperties = {
                    textAlign:  cellStyles.align  || undefined,
                    color:      isHeader ? (cellStyles.color || TABLE_HEADER_TEXT) : (cellStyles.color || TABLE_CELL_TEXT),
                    fontWeight: isHeader ? 800 : 600,
                  };

                  return (
                    <td key={cIdx} style={tdStyle}>
                      {isEditable && cellEdit ? (
                        <EditableCell
                          value={cell}
                          rIdx={rIdx}
                          cIdx={cIdx}
                          isFocused={cellEdit.focusedRow === rIdx && cellEdit.focusedCol === cIdx}
                          innerStyle={innerStyle}
                          cellEdit={cellEdit}
                          selection={selection}
                        />
                      ) : (
                        <ReadonlyCell cell={cell} innerStyle={innerStyle} />
                      )}

                      {/* ── Column resize handle on every right border ── */}
                      {isEditable && resize && (
                        <ColResizeHandle colIdx={cIdx} resize={resize} />
                      )}

                      {/* ── Row resize handle on every bottom border ── */}
                      {isEditable && resize && (
                        <div
                          onPointerDown={e => resize.onRowResizeStart(e, rIdx)}
                          onPointerMove={resize.onRowResizeMove}
                          onPointerUp={resize.onRowResizeEnd}
                          style={{
                            position:       'absolute',
                            left:           0,
                            right:          0,
                            bottom:         -4,
                            height:         8,
                            cursor:         'row-resize',
                            zIndex:         30,
                            userSelect:     'none',
                            pointerEvents:  'auto',
                            backgroundColor: activeResizingRow === rIdx ? '#6366F1' : undefined,
                            opacity:         activeResizingRow === rIdx ? 1 : undefined,
                          }}
                          className={
                            activeResizingRow !== rIdx
                              ? 'opacity-0 hover:opacity-100 hover:bg-indigo-400/40 transition-opacity'
                              : ''
                          }
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <TableCaption
        caption={block.caption || ''}
        isEditable={isEditable}
        onChange={onChangeCaption}
        onFocus={onFocusCaption}
      />
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface EditableCellProps {
  value:      string;
  rIdx:       number;
  cIdx:       number;
  isFocused:  boolean;
  innerStyle: React.CSSProperties;
  cellEdit:   CellEditHandles;
  selection?: SelectionHandles;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value, rIdx, cIdx, isFocused, innerStyle, cellEdit, selection,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  // Sync DOM ↔ prop without caret jump
  React.useEffect(() => {
    if (!ref.current) return;
    const normalise = (s: string) =>
      s.replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/g, ' ').trim();
    if (normalise(ref.current.innerHTML) !== normalise(value)) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  // Auto-focus + caret-to-end
  React.useEffect(() => {
    if (isFocused && ref.current && document.activeElement !== ref.current) {
      ref.current.focus();
      const range = document.createRange();
      const sel   = window.getSelection();
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
      onFocus={() => cellEdit.onFocus(rIdx, cIdx)}
      onInput={e  => cellEdit.onChange(rIdx, cIdx, e.currentTarget.innerHTML)}
      onKeyDown={e => cellEdit.onKeyDown(e, rIdx, cIdx)}
      onPaste={e  => cellEdit.onPaste(rIdx, cIdx, e)}
      onPointerDown={e => selection?.onCellPointerDown(rIdx, cIdx, e)}
      onPointerEnter={() => selection?.onCellPointerEnter(rIdx, cIdx)}
      className="outline-none px-2 py-1 cursor-text select-text w-full h-full min-h-[22px]"
      style={{ ...innerStyle, minWidth: 40 }}
    />
  );
};

const ReadonlyCell: React.FC<{ cell: string; innerStyle: React.CSSProperties }> = ({
  cell, innerStyle,
}) => (
  <div
    className="px-2 py-1 leading-snug"
    style={innerStyle}
    dangerouslySetInnerHTML={{ __html: cell }}
  />
);
