import React from 'react';
import type { DocBlock, TableCellStyle } from '../../../../../../types/doc-editor';

export function useTableClipboard(
  block: DocBlock,
  idx: number,
  rowCount: number,
  colCount: number,
  isManuallyResized: boolean,
  baseWidths: number[],
  baseHeights: number[],
  onUpdateBlock: (idx: number, updated: DocBlock) => void
) {
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

    const rows = block.rows || [['', '', ''], ['', '', ''], ['', '', '']];
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

  return {
    handleCellPaste,
  };
}
