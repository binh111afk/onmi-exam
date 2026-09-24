import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { CompareColumn, CompareContent, CompareSettings } from '../CompareTypes';
import { createDefaultColumn, createNewCompareContent } from '../CompareUtils';

export function useCompare(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const compareContent: CompareContent = block.compareContent || createNewCompareContent();
  const columns = compareContent.columns;

  const updateCompareContent = useCallback((nextContent: CompareContent) => {
    onUpdateBlock(idx, {
      ...block,
      compareContent: nextContent,
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateColumns = useCallback((nextColumns: CompareColumn[]) => {
    updateCompareContent({
      ...compareContent,
      columns: nextColumns,
    });
  }, [compareContent, updateCompareContent]);

  const updateSettings = useCallback((nextSettings: Partial<CompareSettings>) => {
    updateCompareContent({
      ...compareContent,
      settings: {
        ...compareContent.settings,
        ...nextSettings,
      },
    });
  }, [compareContent, updateCompareContent]);

  const addColumn = useCallback(() => {
    if (columns.length >= 4) return;
    updateColumns([...columns, createDefaultColumn(crypto.randomUUID())]);
  }, [columns, updateColumns]);

  const deleteColumn = useCallback((columnId: string) => {
    if (columns.length <= 2) return;
    updateColumns(columns.filter(c => c.id !== columnId));
  }, [columns, updateColumns]);

  const updateColumn = useCallback((columnId: string, updated: CompareColumn) => {
    updateColumns(columns.map(c => c.id === columnId ? updated : c));
  }, [columns, updateColumns]);

  const moveColumn = useCallback((columnId: string, direction: 'left' | 'right') => {
    const colIndex = columns.findIndex(c => c.id === columnId);
    if (colIndex === -1) return;
    const targetIndex = direction === 'left' ? colIndex - 1 : colIndex + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const next = [...columns];
    [next[colIndex], next[targetIndex]] = [next[targetIndex], next[colIndex]];
    updateColumns(next);
  }, [columns, updateColumns]);

  return {
    columns,
    settings: compareContent.settings,
    addColumn,
    deleteColumn,
    updateColumn,
    updateSettings,
    moveColumn,
  };
}
