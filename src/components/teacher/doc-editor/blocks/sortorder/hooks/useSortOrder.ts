import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { SortOrderContent, SortOrderItem, SortOrderSettings } from '../Types';
import { createDefaultSortOrderContent } from '../Utils';

export function useSortOrder(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const content: SortOrderContent = block.sortorderContent || createDefaultSortOrderContent();

  const updateContent = useCallback((nextContent: SortOrderContent) => {
    onUpdateBlock(idx, {
      ...block,
      sortorderContent: nextContent
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateItems = useCallback((items: SortOrderItem[]) => {
    updateContent({
      ...content,
      items
    });
  }, [content, updateContent]);

  const updateSettings = useCallback((nextSettings: Partial<SortOrderSettings>) => {
    updateContent({
      ...content,
      settings: {
        ...content.settings,
        ...nextSettings
      }
    });
  }, [content, updateContent]);

  const addItem = useCallback((type: SortOrderItem['type'] = 'text') => {
    const newItem: SortOrderItem = {
      id: `s-${crypto.randomUUID().slice(0, 8)}`,
      type,
      content: type === 'text' ? 'Mục mới' : ''
    };
    updateItems([...content.items, newItem]);
  }, [content.items, updateItems]);

  const removeItem = useCallback((itemId: string) => {
    updateItems(content.items.filter(item => item.id !== itemId));
  }, [content.items, updateItems]);

  const updateItem = useCallback((itemId: string, updated: Partial<SortOrderItem>) => {
    const nextItems = content.items.map(item =>
      item.id === itemId ? { ...item, ...updated } : item
    );
    updateItems(nextItems);
  }, [content.items, updateItems]);

  const duplicateItem = useCallback((itemId: string) => {
    const index = content.items.findIndex(item => item.id === itemId);
    if (index === -1) return;
    const target = content.items[index];
    const duplicated: SortOrderItem = {
      ...target,
      id: `s-${crypto.randomUUID().slice(0, 8)}`
    };
    const next = [...content.items];
    next.splice(index + 1, 0, duplicated);
    updateItems(next);
  }, [content.items, updateItems]);

  const reorderItems = useCallback((startIndex: number, endIndex: number) => {
    if (startIndex === endIndex) return;
    const next = [...content.items];
    const [removed] = next.splice(startIndex, 1);
    next.splice(endIndex, 0, removed);
    updateItems(next);
  }, [content.items, updateItems]);

  return {
    content,
    items: content.items,
    settings: content.settings,
    addItem,
    removeItem,
    updateItem,
    duplicateItem,
    reorderItems,
    updateSettings,
  };
}
