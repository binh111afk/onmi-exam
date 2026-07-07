import React from 'react';


export interface ResizeHandles {
  onColResizeStart: (e: React.PointerEvent, colIdx: number) => void;
  onColResizeMove: (e: React.PointerEvent) => void;
  onColResizeEnd: (e: React.PointerEvent) => void;
  onRowResizeStart: (e: React.PointerEvent, rowIdx: number) => void;
  onRowResizeMove: (e: React.PointerEvent) => void;
  onRowResizeEnd: (e: React.PointerEvent) => void;
  resizingCol: number | null;
  resizingRow: number | null;
}

export interface SelectionHandles {
  onCellPointerDown: (rIdx: number, cIdx: number, e: React.PointerEvent) => void;
  onCellPointerEnter: (rIdx: number, cIdx: number) => void;
  selectedCells: { r: number; c: number }[];
}

export interface CellEditHandles {
  onChange: (rIdx: number, cIdx: number, val: string) => void;
  onFocus: (rIdx: number, cIdx: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, rIdx: number, cIdx: number) => void;
  onPaste: (rIdx: number, cIdx: number, e: React.ClipboardEvent) => void;
  focusedRow: number | null;
  focusedCol: number | null;
}
