import React, { useState } from 'react';
import type { DocBlock, LiveTableResizeState } from '../../../../../../types/doc-editor';

export function useTableResize(
  block: DocBlock,
  idx: number,
  colCount: number,
  isManuallyResized: boolean,
  baseWidths: number[],
  baseHeights: number[],
  onUpdateBlock: (idx: number, block: DocBlock) => void,
  liveTableResize: LiveTableResizeState | null,
  setLiveTableResize: (state: LiveTableResizeState | null) => void
) {
  const [startSize, setStartSize] = useState(0);
  const [startPos, setStartPos] = useState(0);

  const isLive = !!(liveTableResize && liveTableResize.blockId === block.id);
  const resizingCol = isLive ? liveTableResize.resizingCol : null;
  const resizingRow = isLive ? liveTableResize.resizingRow : null;

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

    setLiveTableResize({
      blockId: block.id,
      resizingCol: colIdx,
      resizingRow: null,
      columnWidths: widths,
      rowHeights: baseHeights,
    });
    setStartSize(widths[colIdx]);
    setStartPos(e.clientX);
    document.body.classList.add('select-none');
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onColResize = (e: React.PointerEvent) => {
    if (!liveTableResize || liveTableResize.resizingCol === null) return;
    const currentResizingCol = liveTableResize.resizingCol;
    const delta    = e.clientX - startPos;
    const newW     = Math.max(60, startSize + delta);
    const adjusted = newW - startSize;
    const next     = [...liveTableResize.columnWidths];
    next[currentResizingCol] = newW;
    if (currentResizingCol + 1 < next.length) {
      next[currentResizingCol + 1] = Math.max(60, liveTableResize.columnWidths[currentResizingCol + 1] - adjusted);
    }
    setLiveTableResize({
      ...liveTableResize,
      columnWidths: next,
    });
  };

  const endColResize = (e: React.PointerEvent) => {
    if (!liveTableResize || liveTableResize.resizingCol === null) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    onUpdateBlock(idx, { ...block, columnWidths: liveTableResize.columnWidths });
    setLiveTableResize(null);
    document.body.classList.remove('select-none');
  };

  const startRowResize = (e: React.PointerEvent, rowIdx: number) => {
    e.preventDefault(); e.stopPropagation();
    setLiveTableResize({
      blockId: block.id,
      resizingCol: null,
      resizingRow: rowIdx,
      columnWidths: baseWidths,
      rowHeights: [...baseHeights],
    });
    setStartSize(baseHeights[rowIdx]);
    setStartPos(e.clientY);
    document.body.classList.add('select-none');
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onRowResize = (e: React.PointerEvent) => {
    if (!liveTableResize || liveTableResize.resizingRow === null) return;
    const currentResizingRow = liveTableResize.resizingRow;
    const next = [...liveTableResize.rowHeights];
    next[currentResizingRow] = Math.max(25, startSize + (e.clientY - startPos));
    setLiveTableResize({
      ...liveTableResize,
      rowHeights: next,
    });
  };

  const endRowResize = (e: React.PointerEvent) => {
    if (!liveTableResize || liveTableResize.resizingRow === null) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    onUpdateBlock(idx, { ...block, rowHeights: liveTableResize.rowHeights });
    setLiveTableResize(null);
    document.body.classList.remove('select-none');
  };

  return {
    startColResize,
    onColResize,
    endColResize,
    startRowResize,
    onRowResize,
    endRowResize,
    resizingCol,
    resizingRow,
  };
}
