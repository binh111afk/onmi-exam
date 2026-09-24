import React, { useState, useEffect } from 'react';

export function useTableSelection(isActive: boolean) {
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  const [focusedCol, setFocusedCol] = useState<number | null>(null);
  const [selectStart, setSelectStart] = useState<{ r: number; c: number } | null>(null);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);

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
    if (!isActive) {
      const activeEl = document.activeElement;
      if (activeEl instanceof HTMLElement && activeEl.closest('td')) {
        activeEl.blur();
      }
      window.getSelection()?.removeAllRanges();
      setSelectedCells([]);
      setFocusedRow(null);
      setFocusedCol(null);
    }
  }, [isActive]);

  return {
    focusedRow,
    setFocusedRow,
    focusedCol,
    setFocusedCol,
    selectedCells,
    setSelectedCells,
    handleCellPointerDown,
    handleCellPointerEnter,
  };
}
