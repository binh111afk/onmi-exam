import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { DocBlock } from '../../../types/doc-editor';

interface BlockSelectionContextType {
  selectedBlockIds: string[];
  activeBlockId: string | null;
  selectBlock: (id: string, extend?: boolean, range?: boolean) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

export const BlockSelectionContext = createContext<BlockSelectionContextType | null>(null);

interface BlockSelectionProviderProps {
  blocks: DocBlock[];
  activeBlockIndex: number;
  setActiveBlockIndex: (i: number) => void;
  onDeleteBlocks: (ids: string[]) => void;
  onDuplicateBlocks: (ids: string[]) => void;
  onPasteBlocks: (blocks: DocBlock[], targetBlockId: string | null) => void;
  children: React.ReactNode;
}

export const BlockSelectionProvider: React.FC<BlockSelectionProviderProps> = ({
  blocks,
  activeBlockIndex,
  setActiveBlockIndex,
  onDeleteBlocks,
  onDuplicateBlocks,
  onPasteBlocks,
  children,
}) => {
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const activeBlockId = blocks[activeBlockIndex]?.id || null;

  // Sync activeBlockId to selection list if selection is empty
  useEffect(() => {
    if (activeBlockId && selectedBlockIds.length === 0) {
      setSelectedBlockIds([activeBlockId]);
    }
  }, [activeBlockId, selectedBlockIds]);

  const selectBlock = useCallback((id: string, extend = false, range = false) => {
    const clickIdx = blocks.findIndex(b => b.id === id);
    if (clickIdx === -1) return;

    setActiveBlockIndex(clickIdx);

    if (range && selectedBlockIds.length > 0) {
      // Find the index of the first selected block to anchor the range selection
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
          if (prev.length === 1) return prev; // Keep at least one selected block
          return prev.filter(x => x !== id);
        }
        return [...prev, id];
      });
    } else {
      setSelectedBlockIds([id]);
    }
  }, [blocks, selectedBlockIds, setActiveBlockIndex]);

  const clearSelection = useCallback(() => {
    if (activeBlockId) {
      setSelectedBlockIds([activeBlockId]);
    } else {
      setSelectedBlockIds([]);
    }
  }, [activeBlockId]);

  const isSelected = useCallback((id: string) => {
    return selectedBlockIds.includes(id);
  }, [selectedBlockIds]);

  // Global key listener for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      // Delete/Backspace to delete selected blocks
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteBlocks(selectedBlockIds);
      }

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
    <BlockSelectionContext.Provider value={{ selectedBlockIds, activeBlockId, selectBlock, clearSelection, isSelected }}>
      {children}
    </BlockSelectionContext.Provider>
  );
};
