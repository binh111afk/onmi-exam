import { useCallback } from 'react';
import type { DocBlock } from '../../../../../../types/doc-editor';
import type { DragDropContent, DragDropCard, DragDropZone, DragDropSettings } from '../Types';
import { createDefaultDragDropContent } from '../Utils';

export function useDragDrop(
  block: DocBlock,
  idx: number,
  onUpdateBlock: (idx: number, updated: DocBlock, isDebounced?: boolean) => void
) {
  const content: DragDropContent = block.dragdropContent || createDefaultDragDropContent();

  const updateContent = useCallback((nextContent: DragDropContent) => {
    onUpdateBlock(idx, {
      ...block,
      dragdropContent: nextContent
    }, false);
  }, [block, idx, onUpdateBlock]);

  const updateCards = useCallback((cards: DragDropCard[]) => {
    updateContent({
      ...content,
      cards
    });
  }, [content, updateContent]);

  const updateZones = useCallback((zones: DragDropZone[]) => {
    updateContent({
      ...content,
      zones
    });
  }, [content, updateContent]);

  const updateSettings = useCallback((nextSettings: Partial<DragDropSettings>) => {
    updateContent({
      ...content,
      settings: {
        ...content.settings,
        ...nextSettings
      }
    });
  }, [content, updateContent]);

  const addCard = useCallback((type: DragDropCard['type'] = 'text') => {
    const newCard: DragDropCard = {
      id: `c-${crypto.randomUUID().slice(0, 8)}`,
      type,
      content: type === 'text' ? 'Thẻ mới' : ''
    };
    updateCards([...content.cards, newCard]);
  }, [content.cards, updateCards]);

  const removeCard = useCallback((cardId: string) => {
    const nextCards = content.cards.filter(c => c.id !== cardId);
    const nextZones = content.zones.map(z => ({
      ...z,
      correctCardIds: z.correctCardIds.filter(id => id !== cardId)
    }));
    updateContent({
      ...content,
      cards: nextCards,
      zones: nextZones
    });
  }, [content, updateContent]);

  const updateCard = useCallback((cardId: string, updated: Partial<DragDropCard>) => {
    const nextCards = content.cards.map(c => 
      c.id === cardId ? { ...c, ...updated } : c
    );
    updateCards(nextCards);
  }, [content.cards, updateCards]);

  const addZone = useCallback((type: DragDropZone['type'] = 'text') => {
    const newZone: DragDropZone = {
      id: `z-${crypto.randomUUID().slice(0, 8)}`,
      type,
      content: type === 'text' ? 'Vùng thả mới' : '',
      correctCardIds: []
    };
    updateZones([...content.zones, newZone]);
  }, [content.zones, updateZones]);

  const removeZone = useCallback((zoneId: string) => {
    updateZones(content.zones.filter(z => z.id !== zoneId));
  }, [content.zones, updateZones]);

  const updateZone = useCallback((zoneId: string, updated: Partial<DragDropZone>) => {
    const nextZones = content.zones.map(z => 
      z.id === zoneId ? { ...z, ...updated } : z
    );
    updateZones(nextZones);
  }, [content.zones, updateZones]);

  const toggleCardInZone = useCallback((zoneId: string, cardId: string) => {
    const nextZones = content.zones.map(z => {
      if (z.id === zoneId) {
        const exists = z.correctCardIds.includes(cardId);
        return {
          ...z,
          correctCardIds: exists
            ? z.correctCardIds.filter(id => id !== cardId)
            : [...z.correctCardIds, cardId]
        };
      }
      return z;
    });
    updateZones(nextZones);
  }, [content.zones, updateZones]);

  return {
    content,
    cards: content.cards,
    zones: content.zones,
    settings: content.settings,
    addCard,
    removeCard,
    updateCard,
    addZone,
    removeZone,
    updateZone,
    toggleCardInZone,
    updateSettings,
  };
}
