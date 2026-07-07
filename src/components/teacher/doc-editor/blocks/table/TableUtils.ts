import type { TableCellStyle } from '../../../../../types/doc-editor';

export const newStyleRow = (colCount: number) => Array<TableCellStyle>(colCount).fill({});

export const getCellStyles = (
  cellStyles: TableCellStyle[][] | undefined,
  rowCount: number,
  colCount: number
): TableCellStyle[][] => {
  if (
    cellStyles &&
    cellStyles.length === rowCount &&
    cellStyles[0]?.length === colCount
  ) return cellStyles;
  return Array.from({ length: rowCount }, () => Array<TableCellStyle>(colCount).fill({}));
};
