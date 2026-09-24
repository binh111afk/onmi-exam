import React, { createContext, useCallback, useEffect } from 'react';
import type { DocBlock } from '../../../types/doc-editor';

interface BlockSelectionContextType {
  selectedBlockIds: string[];
  activeBlockId: string | null;
  selectBlock: (id: string, extend?: boolean, range?: boolean) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  getCommandBlockIds: (fallbackId?: string | null) => string[];
  canMoveCommandBlocks: (ids: string[], direction: 'up' | 'down') => boolean;
  editorMode: 'block' | 'text';
  setEditorMode: (mode: 'block' | 'text') => void;
}

export const BlockSelectionContext = createContext<BlockSelectionContextType | null>(null);

interface BlockSelectionProviderProps {
  blocks: DocBlock[];
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
  selectedBlockIds: string[];
  setSelectedBlockIds: React.Dispatch<React.SetStateAction<string[]>>;
  editorMode: 'block' | 'text';
  setEditorMode: (mode: 'block' | 'text') => void;
  onDeleteBlocks: (ids: string[]) => void;
  onDuplicateBlocks: (ids: string[]) => void;
  onPasteBlocks: (blocks: DocBlock[], targetBlockId: string | null) => void;
  children: React.ReactNode;
}

export const BlockSelectionProvider: React.FC<BlockSelectionProviderProps> = ({
  blocks,
  activeBlockId,
  setActiveBlockId,
  selectedBlockIds,
  setSelectedBlockIds,
  editorMode,
  setEditorMode,
  onDeleteBlocks,
  onDuplicateBlocks,
  onPasteBlocks,
  children,
}) => {
  // Sync activeBlockId to selection list if selection is empty
  useEffect(() => {
    if (activeBlockId && selectedBlockIds.length === 0) {
      setSelectedBlockIds([activeBlockId]);
    }
  }, [activeBlockId, selectedBlockIds, setSelectedBlockIds]);

  const selectBlock = useCallback((id: string, extend = false, range = false) => {
    const clickIdx = blocks.findIndex(b => b.id === id);
    if (clickIdx === -1) return;

    setActiveBlockId(id);

    if (range && selectedBlockIds.length > 0) {
      const startIdx = blocks.findIndex(b => b.id === selectedBlockIds[0]);
      if (startIdx !== -1) {
        const min = Math.min(startIdx, clickIdx);
        const max = Math.max(startIdx, clickIdx);
        const rangeIds = blocks.slice(min, max + 1).map(b => b.id);
        setSelectedBlockIds(rangeIds);
        return;
      }
    }

    if (extend) {
      setSelectedBlockIds(prev => {
        if (prev.includes(id)) {
          if (prev.length === 1) return prev;
          return prev.filter(x => x !== id);
        }
        return [...prev, id];
      });
    } else {
      setSelectedBlockIds([id]);
    }
  }, [blocks, selectedBlockIds, setActiveBlockId, setSelectedBlockIds]);

  const clearSelection = useCallback(() => {
    if (activeBlockId) {
      setSelectedBlockIds([activeBlockId]);
    } else {
      setSelectedBlockIds([]);
    }
  }, [activeBlockId, setSelectedBlockIds]);

  const isSelected = useCallback((id: string) => {
    return selectedBlockIds.includes(id);
  }, [selectedBlockIds]);

  const getCommandBlockIds = useCallback((fallbackId?: string | null) => {
    const blockIds = new Set(blocks.map(block => block.id));
    const targetId = fallbackId ?? activeBlockId;
    if (!targetId || !blockIds.has(targetId)) return [];

    const selectionIds = selectedBlockIds.filter(id => blockIds.has(id));
    if (selectionIds.includes(targetId)) {
      return blocks
        .filter(block => selectionIds.includes(block.id))
        .map(block => block.id);
    }

    return [targetId];
  }, [activeBlockId, blocks, selectedBlockIds]);

  const canMoveCommandBlocks = useCallback((ids: string[], direction: 'up' | 'down') => {
    if (ids.length === 0) return false;
    const selected = new Set(ids);
    const indexes = blocks
      .map((block, index) => selected.has(block.id) ? index : -1)
      .filter(index => index !== -1);

    if (indexes.length === 0) return false;
    return direction === 'up'
      ? Math.min(...indexes) > 0
      : Math.max(...indexes) < blocks.length - 1;
  }, [blocks]);

  // Global key listener for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Never intercept during IME composition
      if (e.isComposing) return;

      const activeEl = document.activeElement;
      const isEditing = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable
      );

      // Bypass shortcut actions if the user is typing in an editor area
      if (isEditing) {
        if (e.key === 'Escape') {
          clearSelection();
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      // Delete/Backspace to delete selected blocks is disabled

      // Ctrl+D (or Command+D) to duplicate blocks
      if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onDuplicateBlocks(selectedBlockIds);
      }

      // Ctrl+C to copy blocks
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const copyList = blocks.filter(b => selectedBlockIds.includes(b.id));
        if (copyList.length > 0) {
          const payload = JSON.stringify({
            source: 'omni-exam-editor',
            blocks: copyList
          });
          navigator.clipboard.writeText(payload);
        }
      }

      // Ctrl+V to paste blocks
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        navigator.clipboard.readText().then(text => {
          try {
            const data = JSON.parse(text);
            if (data && data.source === 'omni-exam-editor' && Array.isArray(data.blocks)) {
              onPasteBlocks(data.blocks, activeBlockId);
            } else {
              // Paste external text as paragraph
              const plainBlock: DocBlock = {
                id: '',
                type: 'paragraph',
                text: text || ''
              };
              onPasteBlocks([plainBlock], activeBlockId);
            }
          } catch {
            const plainBlock: DocBlock = {
              id: '',
              type: 'paragraph',
              text: text || ''
            };
            onPasteBlocks([plainBlock], activeBlockId);
          }
        });
      }

      // Escape to clear multi-selection
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blocks, selectedBlockIds, activeBlockId, onDeleteBlocks, onDuplicateBlocks, onPasteBlocks, clearSelection]);

  return (
    <BlockSelectionContext.Provider value={{
      selectedBlockIds,
      activeBlockId,
      selectBlock,
      clearSelection,
      isSelected,
      getCommandBlockIds,
      canMoveCommandBlocks,
      editorMode,
      setEditorMode
    }}>
      {children}
    </BlockSelectionContext.Provider>
  );
};
