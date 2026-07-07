import React, { useEffect, useCallback, useContext } from 'react';
import type { DocBlock, TableCellStyle, LiveTableResizeState, LiveTableActiveCell } from '../../../../../types/doc-editor';
import { BlockWrapperContext } from '../../BlockWrapper';
import { TableToolbar } from './TableToolbar';
import { BlockSelectionContext } from '../../BlockSelectionProvider';
import { SharedTableRenderer } from './SharedTableRenderer';
import type { ResizeHandles, SelectionHandles, CellEditHandles } from './TableTypes';
import { newStyleRow, getCellStyles } from './TableUtils';
import { useTableResize } from './hooks/useTableResize';
import { useTableSelection } from './hooks/useTableSelection';
import { useTableClipboard } from './hooks/useTableClipboard';

interface TableBlockProps {
  block: DocBlock;
  idx: number;
  isActive: boolean;
  setActiveBlockIndex: (i: number) => void;
  onUpdateBlock: (i: number, updated: DocBlock) => void;
  onDeleteBlock: (i: number) => void;
  _tableNumber: number;
  /**
   * Callback so the workspace can route toolbar alignment commands
   * into cells when this table is the active block.
   * The workspace stores the latest handler in a ref.
   */
  onRegisterCellAlignHandler: (fn: ((align: 'left' | 'center' | 'right' | 'justify') => void) | null) => void;

  liveTableResize: LiveTableResizeState | null;
  setLiveTableResize: (state: LiveTableResizeState | null) => void;
  liveTableActiveCell: LiveTableActiveCell | null;
  setLiveTableActiveCell: (state: LiveTableActiveCell | null) => void;
  showUniversalToolbar?: boolean;
}

export const TableBlockComponent: React.FC<TableBlockProps> = ({
  block,
  idx,
  isActive,
  setActiveBlockIndex,
  onUpdateBlock,
  onDeleteBlock,
  _tableNumber: _unusedTableNumber,
  onRegisterCellAlignHandler,
  liveTableResize,
  setLiveTableResize,
  liveTableActiveCell: _unusedLiveTableActiveCell,
  setLiveTableActiveCell,
}) => {
  const wrapperContext = useContext(BlockWrapperContext);
  const selectionContext = useContext(BlockSelectionContext);
  const rows     = block.rows || [['', '', ''], ['', '', ''], ['', '', '']];
  const colCount = rows[0]?.length || 3;
  const rowCount = rows.length;

  // ── Selection Hook ──────────────────────────────────────────────────────────
  const {
    focusedRow,
    setFocusedRow,
    focusedCol,
    setFocusedCol,
    selectedCells,
    setSelectedCells,
    handleCellPointerDown,
    handleCellPointerEnter,
  } = useTableSelection(isActive);

  type TableInteractionMode = 'block' | 'cell';
  const interactionMode: TableInteractionMode = (isActive && (focusedRow !== null || selectedCells.length > 0)) ? 'cell' : 'block';

  const enterCellMode = useCallback((r: number, c: number) => {
    setActiveBlockIndex(idx);
    setFocusedRow(r);
    setFocusedCol(c);
    setLiveTableActiveCell({ blockId: block.id, row: r, col: c });
    selectionContext?.setEditorMode('text');
  }, [idx, block.id, setActiveBlockIndex, setLiveTableActiveCell, selectionContext, setFocusedRow, setFocusedCol]);

  const enterBlockMode = useCallback(() => {
    const activeEl = document.activeElement;
    if (activeEl instanceof HTMLElement && activeEl.closest('td')) {
      activeEl.blur();
    }
    window.getSelection()?.removeAllRanges();
    
    setActiveBlockIndex(idx);
    setFocusedRow(null);
    setFocusedCol(null);
    setSelectedCells([]);
    setLiveTableActiveCell(null);
    selectionContext?.setEditorMode('block');
  }, [idx, setActiveBlockIndex, setLiveTableActiveCell, selectionContext, setFocusedRow, setFocusedCol, setSelectedCells]);

  // ── Layout sizing helpers ──────────────────────────────────────────────────
  const isManuallyResized = !!(block.columnWidths && block.columnWidths.length === colCount);
  const baseWidths  = isManuallyResized ? block.columnWidths! : Array<number>(colCount).fill(120);
  const baseHeights = block.rowHeights && block.rowHeights.length === rowCount
    ? block.rowHeights
    : Array<number>(rowCount).fill(36);

  // ── Resize Hook ─────────────────────────────────────────────────────────────
  const {
    startColResize,
    onColResize,
    endColResize,
    startRowResize,
    onRowResize,
    endRowResize,
    resizingCol,
    resizingRow,
  } = useTableResize(
    block,
    idx,
    colCount,
    isManuallyResized,
    baseWidths,
    baseHeights,
    onUpdateBlock,
    liveTableResize,
    setLiveTableResize
  );

  // ── Clipboard Hook ──────────────────────────────────────────────────────────
  const { handleCellPaste } = useTableClipboard(
    block,
    idx,
    rowCount,
    colCount,
    isManuallyResized,
    baseWidths,
    baseHeights,
    onUpdateBlock
  );

  // ── Cell style updates ──────────────────────────────────────────────────────
  const applyCellStyles = useCallback((updates: Partial<TableCellStyle>) => {
    const targets: { r: number; c: number }[] =
      selectedCells.length > 0
        ? selectedCells
        : focusedRow !== null && focusedCol !== null
          ? [{ r: focusedRow, c: focusedCol }]
          : [];
    if (targets.length === 0) return;

    let styles = getCellStyles(block.cellStyles, rowCount, colCount).map(row => [...row]);
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

  // Register align handler
  useEffect(() => {
    if (isActive && focusedRow !== null && focusedCol !== null) {
      onRegisterCellAlignHandler((align) => {
        if (align !== 'justify') {
          applyCellStyles({ align });
        }
      });
    } else {
      onRegisterCellAlignHandler(null);
    }
    return () => {
      onRegisterCellAlignHandler(null);
    };
  }, [isActive, focusedRow, focusedCol, applyCellStyles, onRegisterCellAlignHandler]);

  // ── Grid mutations ──────────────────────────────────────────────────────────
  const handleAddRow = () => {
    const activeR = focusedRow ?? rows.length - 1;
    const updatedRows    = [...rows.slice(0, activeR + 1), Array<string>(colCount).fill(''), ...rows.slice(activeR + 1)];
    const updatedHeights = [...baseHeights.slice(0, activeR + 1), 36, ...baseHeights.slice(activeR + 1)];
    const updatedStyles  = block.cellStyles
      ? [...block.cellStyles.slice(0, activeR + 1), newStyleRow(colCount), ...block.cellStyles.slice(activeR + 1)]
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

  // Register toolbar custom actions
  useEffect(() => {
    if (wrapperContext && isActive) {
      wrapperContext.registerCustomActions([
        { label: 'Thêm dòng', onTrigger: handleAddRow },
        { label: 'Thêm cột', onTrigger: handleAddColumn },
        { label: 'Xóa dòng', onTrigger: handleDeleteRow },
        { label: 'Xóa cột', onTrigger: handleDeleteColumn },
      ]);
    }
  }, [
    wrapperContext,
    isActive,
    rows.length,
    colCount,
    focusedRow,
    focusedCol,
  ]);

  // ── Keyboard Navigation ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, rIdx: number, cIdx: number) => {
    const appendRow = () => {
      const newRow     = Array<string>(colCount).fill('');
      const updatedH   = [...baseHeights, 36];
      const updatedSt  = block.cellStyles ? [...block.cellStyles, newStyleRow(colCount)] : undefined;
      onUpdateBlock(idx, { ...block, rows: [...rows, newRow], rowHeights: updatedH, cellStyles: updatedSt });
    };

    if (e.key === 'Escape') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
      window.getSelection()?.removeAllRanges();
      enterBlockMode();
      return;
    }

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

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    onUpdateBlock(idx, {
      ...block,
      rows: rows.map((row, ri) => ri === rIdx ? row.map((c, ci) => ci === cIdx ? val : c) : row),
    });
  };

  const handleTableSelect = useCallback(() => {
    enterBlockMode();
  }, [enterBlockMode]);

  // ── Compose Renderer prop bindings ──────────────────────────────────────────
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
    onFocus:   (r, c) => {
      enterCellMode(r, c);
    },
    onKeyDown: handleKeyDown,
    onPaste:   handleCellPaste,
    focusedRow,
    focusedCol,
  };

  return (
    <div className="flex flex-col w-full">
      <TableToolbar
        onAddRow={handleAddRow}
        onAddColumn={handleAddColumn}
        onDeleteRow={handleDeleteRow}
        onDeleteColumn={handleDeleteColumn}
        onDeleteTable={() => onDeleteBlock(idx)}
        isTableActive={isActive && interactionMode === 'block'}
      />
      <SharedTableRenderer
        block={block}
        isEditable={true}
        resize={resizeHandles}
        selection={selectionHandles}
        cellEdit={cellEditHandles}
        liveTableResize={liveTableResize}
        onAddRow={handleAddRow}
        onAddColumn={handleAddColumn}
        onDeleteRow={handleDeleteRow}
        onDeleteColumn={handleDeleteColumn}
        onDeleteTable={() => onDeleteBlock(idx)}
        isTableActive={isActive && interactionMode === 'block'}
        onChangeCaption={text => onUpdateBlock(idx, { ...block, caption: text })}
        onFocusCaption={handleTableSelect}
        onTableSelect={handleTableSelect}
      />
    </div>
  );
};

export const TableBlock = React.memo(TableBlockComponent);
