import React, { useState, useEffect, useCallback } from 'react';
import type { DocBlock, TableCellStyle } from '../../../../types/doc-editor';
import { TableToolbar } from './TableToolbar';
import { TableCaption } from './TableCaption';
import {
  SharedTableRenderer,
  type ResizeHandles,
  type SelectionHandles,
  type CellEditHandles,
} from './SharedTableRenderer';

interface TableBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
  onDeleteBlock: (i: number) => void;
  tableNumber: number;
  /**
   * Callback so the workspace can route toolbar alignment commands
   * into cells when this table is the active block.
   * The workspace stores the latest handler in a ref.
   */
  onRegisterCellAlignHandler: (fn: ((align: 'left' | 'center' | 'right' | 'justify') => void) | null) => void;
}

export const TableBlockComponent: React.FC<TableBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
  onDeleteBlock,
  tableNumber,
  onRegisterCellAlignHandler,
}) => {
  const rows     = block.rows || [['', '', ''], ['', '', ''], ['', '', '']];
  const colCount = rows[0]?.length || 3;
  const rowCount = rows.length;

  // ── Focus & selection ───────────────────────────────────────────────────────
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  const [focusedCol, setFocusedCol] = useState<number | null>(null);
  const [selectStart, setSelectStart] = useState<{ r: number; c: number } | null>(null);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);

  // ── Resize state (kept local to avoid layout thrashing) ────────────────────
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  const [startSize,   setStartSize]   = useState(0);
  const [startPos,    setStartPos]    = useState(0);
  const [tempWidths,  setTempWidths]  = useState<number[]>([]);
  const [tempHeights, setTempHeights] = useState<number[]>([]);

  // Helpers
  const isManuallyResized = !!(block.columnWidths && block.columnWidths.length === colCount);
  const baseWidths  = isManuallyResized ? block.columnWidths! : Array<number>(colCount).fill(120);
  const baseHeights = block.rowHeights && block.rowHeights.length === rowCount
    ? block.rowHeights
    : Array<number>(rowCount).fill(36);

  const activeWidths  = resizingCol !== null ? tempWidths  : baseWidths;
  const activeHeights = resizingRow !== null ? tempHeights : baseHeights;


  // ── Grid mutation helpers ───────────────────────────────────────────────────
  const newStyleRow = () => Array<TableCellStyle>(colCount).fill({});

  // ── Cell style helpers (used by toolbar alignment routing) ─────────────────
  const getCellStyles = (): TableCellStyle[][] => {
    if (
      block.cellStyles &&
      block.cellStyles.length === rowCount &&
      block.cellStyles[0]?.length === colCount
    ) return block.cellStyles;
    return Array.from({ length: rowCount }, () => Array<TableCellStyle>(colCount).fill({}));
  };

  const applyCellStyles = useCallback((updates: Partial<TableCellStyle>) => {
    const targets: { r: number; c: number }[] =
      selectedCells.length > 0
        ? selectedCells
        : focusedRow !== null && focusedCol !== null
          ? [{ r: focusedRow, c: focusedCol }]
          : [];
    if (targets.length === 0) return;

    let styles = getCellStyles().map(row => [...row]);
    if (styles.length !== rowCount || styles[0]?.length !== colCount) {
      styles = Array.from({ length: rowCount }, (_, r) =>
        Array.from({ length: colCount }, (_, c) => styles[r]?.[c] || {}),
      );
    }
    const updated = styles.map((row, r) =>
      row.map((s, c) =>
        targets.some(t => t.r === r && t.c === c) ? { ...s, ...updates } : s,
      ),
    );
    onUpdateBlock(idx, { ...block, cellStyles: updated });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block, idx, rowCount, colCount, selectedCells, focusedRow, focusedCol, onUpdateBlock]);

  // Register / deregister the cell-align handler with the workspace whenever
  // this table is (or stops being) the active block.
  useEffect(() => {
    if (isActive) {
      onRegisterCellAlignHandler((align) => applyCellStyles({ align }));
    } else {
      onRegisterCellAlignHandler(null);
    }
    return () => {
      onRegisterCellAlignHandler(null);
    };
  // Include applyCellStyles in deps — it updates whenever block/selection changes
  }, [isActive, applyCellStyles, onRegisterCellAlignHandler]);

  const handleAddRow = () => {
    const activeR = focusedRow ?? rows.length - 1;
    const updatedRows    = [...rows.slice(0, activeR + 1), Array<string>(colCount).fill(''), ...rows.slice(activeR + 1)];
    const updatedHeights = [...baseHeights.slice(0, activeR + 1), 36, ...baseHeights.slice(activeR + 1)];
    const updatedStyles  = block.cellStyles
      ? [...block.cellStyles.slice(0, activeR + 1), newStyleRow(), ...block.cellStyles.slice(activeR + 1)]
      : undefined;
    onUpdateBlock(idx, { ...block, rows: updatedRows, rowHeights: updatedHeights, cellStyles: updatedStyles });
    setFocusedRow(activeR + 1);
    setFocusedCol(focusedCol ?? 0);
  };

  const handleAddColumn = () => {
    const activeC = focusedCol ?? colCount - 1;
    const updatedRows   = rows.map(row => [...row.slice(0, activeC + 1), '', ...row.slice(activeC + 1)]);
    const updatedWidths = isManuallyResized
      ? [...baseWidths.slice(0, activeC + 1), 120, ...baseWidths.slice(activeC + 1)]
      : undefined;
    const updatedStyles = block.cellStyles
      ? block.cellStyles.map(row => [...row.slice(0, activeC + 1), {}, ...row.slice(activeC + 1)])
      : undefined;
    onUpdateBlock(idx, { ...block, rows: updatedRows, columnWidths: updatedWidths, cellStyles: updatedStyles });
    setFocusedCol(activeC + 1);
    setFocusedRow(focusedRow ?? 0);
  };

  const handleDeleteRow = () => {
    if (rows.length <= 1) return;
    const activeR = focusedRow ?? 0;
    onUpdateBlock(idx, {
      ...block,
      rows:       rows.filter((_, i) => i !== activeR),
      rowHeights: baseHeights.filter((_, i) => i !== activeR),
      cellStyles: block.cellStyles?.filter((_, i) => i !== activeR),
    });
    setFocusedRow(Math.min(rows.length - 2, activeR));
    setFocusedCol(focusedCol ?? 0);
  };

  const handleDeleteColumn = () => {
    if (colCount <= 1) return;
    const activeC = focusedCol ?? 0;
    onUpdateBlock(idx, {
      ...block,
      rows:         rows.map(row => row.filter((_, i) => i !== activeC)),
      columnWidths: isManuallyResized ? baseWidths.filter((_, i) => i !== activeC) : undefined,
      cellStyles:   block.cellStyles?.map(row => row.filter((_, i) => i !== activeC)),
    });
    setFocusedCol(Math.min(colCount - 2, activeC));
    setFocusedRow(focusedRow ?? 0);
  };

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, rIdx: number, cIdx: number) => {
    const appendRow = () => {
      const newRow     = Array<string>(colCount).fill('');
      const updatedH   = [...baseHeights, 36];
      const updatedSt  = block.cellStyles ? [...block.cellStyles, newStyleRow()] : undefined;
      onUpdateBlock(idx, { ...block, rows: [...rows, newRow], rowHeights: updatedH, cellStyles: updatedSt });
    };

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        if (cIdx > 0) { setFocusedCol(cIdx - 1); }
        else if (rIdx > 0) { setFocusedRow(rIdx - 1); setFocusedCol(colCount - 1); }
      } else {
        if (cIdx < colCount - 1) { setFocusedCol(cIdx + 1); }
        else if (rIdx < rows.length - 1) { setFocusedRow(rIdx + 1); setFocusedCol(0); }
        else { appendRow(); setFocusedRow(rows.length); setFocusedCol(0); }
      }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (rIdx < rows.length - 1) { setFocusedRow(rIdx + 1); }
      else { appendRow(); setFocusedRow(rows.length); }
      return;
    }
    if (e.key === 'ArrowUp')   { e.preventDefault(); if (rIdx > 0) setFocusedRow(rIdx - 1); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (rIdx < rows.length - 1) setFocusedRow(rIdx + 1); return; }
    if (e.key === 'ArrowLeft') {
      const sel = window.getSelection();
      if (sel?.isCollapsed && sel.anchorOffset === 0) {
        e.preventDefault();
        if (cIdx > 0) setFocusedCol(cIdx - 1);
        else if (rIdx > 0) { setFocusedRow(rIdx - 1); setFocusedCol(colCount - 1); }
      }
      return;
    }
    if (e.key === 'ArrowRight') {
      const sel = window.getSelection();
      if (sel?.isCollapsed && sel.anchorOffset === (e.currentTarget.textContent?.length ?? 0)) {
        e.preventDefault();
        if (cIdx < colCount - 1) setFocusedCol(cIdx + 1);
        else if (rIdx < rows.length - 1) { setFocusedRow(rIdx + 1); setFocusedCol(0); }
      }
      return;
    }
  };

  // ── Cell change & paste ─────────────────────────────────────────────────────
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    onUpdateBlock(idx, {
      ...block,
      rows: rows.map((row, ri) => ri === rIdx ? row.map((c, ci) => ci === cIdx ? val : c) : row),
    });
  };

  const handleCellPaste = (rIdx: number, cIdx: number, e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text || (!text.includes('\t') && !text.includes('\n'))) return;
    e.preventDefault();

    const pRows   = text.split(/\r?\n/).map(r => r.split('\t'));
    const cleaned = pRows.filter(r => r.length > 1 || r[0] !== '');
    if (!cleaned.length) return;

    const pH = cleaned.length;
    const pW = Math.max(...cleaned.map(r => r.length));
    const tH = Math.max(rowCount, rIdx + pH);
    const tW = Math.max(colCount, cIdx + pW);

    const updatedRows = Array.from({ length: tH }, (_, r) => {
      const existing = rows[r] || Array<string>(tW).fill('');
      return Array.from({ length: tW }, (_, c) =>
        r >= rIdx && r < rIdx + pH && c >= cIdx && c < cIdx + pW
          ? (cleaned[r - rIdx]?.[c - cIdx] ?? '')
          : (existing[c] ?? ''),
      );
    });

    const cs = block.cellStyles || Array.from({ length: rowCount }, () => Array<TableCellStyle>(colCount).fill({}));
    onUpdateBlock(idx, {
      ...block,
      rows:         updatedRows,
      cellStyles:   Array.from({ length: tH }, (_, r) => Array.from({ length: tW }, (_, c) => cs[r]?.[c] || {})),
      columnWidths: isManuallyResized ? Array.from({ length: tW }, (_, c) => baseWidths[c] ?? 120) : undefined,
      rowHeights:   Array.from({ length: tH }, (_, r) => baseHeights[r] ?? 36),
    });
  };

  // ── Pointer selection ───────────────────────────────────────────────────────
  const handleCellPointerDown = (rIdx: number, cIdx: number, e: React.PointerEvent) => {
    const el = e.target as HTMLElement;
    if (el.style.cursor === 'col-resize' || el.style.cursor === 'row-resize') return;
    setSelectStart({ r: rIdx, c: cIdx });
    setSelectedCells([{ r: rIdx, c: cIdx }]);
  };

  const handleCellPointerEnter = (rIdx: number, cIdx: number) => {
    if (!selectStart) return;
    const r0 = Math.min(selectStart.r, rIdx), r1 = Math.max(selectStart.r, rIdx);
    const c0 = Math.min(selectStart.c, cIdx), c1 = Math.max(selectStart.c, cIdx);
    const next: { r: number; c: number }[] = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) next.push({ r, c });
    setSelectedCells(next);
  };

  useEffect(() => {
    const up = () => setSelectStart(null);
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, []);

  useEffect(() => {
    if (!isActive) setSelectedCells([]);
  }, [isActive]);

  // ── Column resize ───────────────────────────────────────────────────────────
  const startColResize = (e: React.PointerEvent, colIdx: number) => {
    e.preventDefault(); e.stopPropagation();
    let widths = isManuallyResized ? [...baseWidths] : [];
    if (widths.length !== colCount) {
      const table = (e.currentTarget as HTMLElement).closest('table');
      if (table?.rows[0]?.cells) {
        widths = Array.from(table.rows[0].cells).map(cell => cell.getBoundingClientRect().width);
      }
    }
    if (widths.length !== colCount) widths = Array<number>(colCount).fill(120);
    setResizingCol(colIdx);
    setStartSize(widths[colIdx]);
    setStartPos(e.clientX);
    setTempWidths(widths);
    document.body.classList.add('select-none');
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onColResize = (e: React.PointerEvent) => {
    if (resizingCol === null) return;
    const delta    = e.clientX - startPos;
    const newW     = Math.max(60, startSize + delta);
    const adjusted = newW - startSize;
    const next     = [...tempWidths];
    next[resizingCol] = newW;
    if (resizingCol + 1 < next.length) {
      next[resizingCol + 1] = Math.max(60, tempWidths[resizingCol + 1] - adjusted);
    }
    setTempWidths(next);
  };

  const endColResize = (e: React.PointerEvent) => {
    if (resizingCol === null) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    onUpdateBlock(idx, { ...block, columnWidths: tempWidths });
    setResizingCol(null);
    document.body.classList.remove('select-none');
  };

  // ── Row resize ──────────────────────────────────────────────────────────────
  const startRowResize = (e: React.PointerEvent, rowIdx: number) => {
    e.preventDefault(); e.stopPropagation();
    setResizingRow(rowIdx);
    setStartSize(baseHeights[rowIdx]);
    setStartPos(e.clientY);
    setTempHeights([...baseHeights]);
    document.body.classList.add('select-none');
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onRowResize = (e: React.PointerEvent) => {
    if (resizingRow === null) return;
    const next = [...tempHeights];
    next[resizingRow] = Math.max(25, startSize + (e.clientY - startPos));
    setTempHeights(next);
  };

  const endRowResize = (e: React.PointerEvent) => {
    if (resizingRow === null) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    onUpdateBlock(idx, { ...block, rowHeights: tempHeights });
    setResizingRow(null);
    document.body.classList.remove('select-none');
  };

  // ── Compose prop objects for SharedTableRenderer ────────────────────────────
  const isTableActive = isActive && focusedRow !== null && focusedCol !== null;

  const resizeHandles: ResizeHandles = {
    onColResizeStart: startColResize,
    onColResizeMove:  onColResize,
    onColResizeEnd:   endColResize,
    onRowResizeStart: startRowResize,
    onRowResizeMove:  onRowResize,
    onRowResizeEnd:   endRowResize,
    resizingCol,
    resizingRow,
  };

  const selectionHandles: SelectionHandles = {
    onCellPointerDown:  handleCellPointerDown,
    onCellPointerEnter: handleCellPointerEnter,
    selectedCells,
  };

  const cellEditHandles: CellEditHandles = {
    onChange:  handleCellChange,
    onFocus:   (r, c) => { setActiveBlockIndex(idx); setFocusedRow(r); setFocusedCol(c); },
    onKeyDown: handleKeyDown,
    onPaste:   handleCellPaste,
    focusedRow,
    focusedCol,
  };

  // Total pixel width used by caption to track manual table widths
  const captionTableMaxWidth = isManuallyResized ? activeWidths.reduce((s, w) => s + w, 0) : undefined;
  const captionAlign = (block.align as 'left' | 'center' | 'right' | undefined) ?? 'left';

  return (
    <div className={`w-full rounded-xl p-1.5 transition ${isActive ? 'bg-slate-50/20' : ''}`}>
      <TableToolbar
        onAddRow={handleAddRow}
        onAddColumn={handleAddColumn}
        onDeleteRow={handleDeleteRow}
        onDeleteColumn={handleDeleteColumn}
        onDeleteTable={() => onDeleteBlock(idx)}
        isTableActive={isTableActive}
      />

      {/* Table — NO fixed height, NO overflow-y, grows naturally with content */}
      <SharedTableRenderer
        block={block}
        activeWidths={activeWidths}
        activeHeights={activeHeights}
        isEditable={true}
        resize={resizeHandles}
        selection={selectionHandles}
        cellEdit={cellEditHandles}
      />

      <TableCaption
        caption={block.caption || ''}
        isEditable={true}
        align={captionAlign}
        tableMaxWidth={captionTableMaxWidth}
        onChange={text => onUpdateBlock(idx, { ...block, caption: text })}
        onFocus={() => setActiveBlockIndex(idx)}
      />
    </div>
  );
};

export const TableBlock = React.memo(TableBlockComponent);
