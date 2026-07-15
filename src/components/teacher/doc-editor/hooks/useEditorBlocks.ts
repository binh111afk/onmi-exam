import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createDefaultBlock } from '../blocks/BlockFactory';
import type { Chapter, Lesson, DocBlock } from '../../../../types/doc-editor';
import { BLOCK_COMMANDS } from '../CommandRegistry';

import { useEditorFormatting } from './useEditorFormatting';
import { useEditorTableOperations } from './useEditorTableOperations';
import { useEditorBlockMutations } from './useEditorBlockMutations';

export const useEditorBlocks = ({
  chapters,
  setChapters,
  activeLessonId,
  currentBlocks,
  patchLessonFn,
  pushHistoryState,
}: {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  activeLessonId: string;
  currentBlocks: DocBlock[];
  patchLessonFn: (lessonMapper: (lesson: Lesson) => Lesson) => (lesson: Lesson) => Lesson;
  pushHistoryState: (newChapters: Chapter[], isDebounced?: boolean, activeIndexOverride?: number) => void;
}) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<'block' | 'text'>('block');

  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashMenuIndex, setSlashMenuIndex] = useState(0);
  const [slashMenuCoords, setSlashMenuCoords] = useState({ top: 0, left: 0 });

  const tableCellAlignRef = useRef<((align: 'left' | 'center' | 'right' | 'justify') => void) | null>(null);

  const activeBlockIndex = useMemo(() => {
    if (!activeBlockId) return 0;
    const idx = currentBlocks.findIndex(b => b.id === activeBlockId);
    return idx !== -1 ? idx : 0;
  }, [currentBlocks, activeBlockId]);

  const setActiveBlockIndex = useCallback((index: number | ((prev: number) => number)) => {
    if (typeof index === 'function') {
      setActiveBlockId(prevId => {
        const prevIdx = prevId ? currentBlocks.findIndex(b => b.id === prevId) : 0;
        const nextIdx = index(prevIdx === -1 ? 0 : prevIdx);
        return currentBlocks[nextIdx]?.id || null;
      });
    } else {
      setActiveBlockId(currentBlocks[index]?.id || null);
    }
  }, [currentBlocks]);

  const activeBlock = useMemo(() => {
    return currentBlocks[activeBlockIndex] || {
      type: 'paragraph',
      align: 'left',
      level: undefined,
      indent: 0
    };
  }, [currentBlocks, activeBlockIndex]);

  // Initialize activeBlockId on load
  useEffect(() => {
    if (!activeBlockId && currentBlocks.length > 0) {
      setActiveBlockId(currentBlocks[0].id);
    }
  }, [currentBlocks, activeBlockId]);

  // Set coordinates for Slash Command menu popover
  useEffect(() => {
    if (showSlashMenu) {
      const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
      if (activeEl) {
        const rect = activeEl.getBoundingClientRect();
        const scrollParent = activeEl.closest('.overflow-y-auto') as HTMLElement;
        if (scrollParent) {
          const parentRect = scrollParent.getBoundingClientRect();
          const top = (rect.bottom - parentRect.top) + scrollParent.scrollTop + 6;
          const left = (rect.left - parentRect.left) + scrollParent.scrollLeft;
          setSlashMenuCoords({ top, left });
        }
      }
    }
  }, [showSlashMenu, activeBlockIndex]);

  const syncBlockCommandState = useCallback((nextActiveId: string | null, nextSelectedIds?: string[]) => {
    setActiveBlockId(nextActiveId);
    setSelectedBlockIds(nextSelectedIds ?? (nextActiveId ? [nextActiveId] : []));
    setEditorMode('block');
    requestAnimationFrame(() => syncFormattingRef.current?.());
  }, []);

  const focusBlock = (index: number) => {
    setTimeout(() => {
      const el = document.getElementById(`block-editor-${index}`);
      if (el) {
        el.focus();
      }
    }, 50);
  };

  // 1. Formatting Sub-hook
  const {
    executeFormat,
    handleColorChange,
    handleHighlightChange,
    applyFontSize,
    syncFormattingRef,
    pendingFontSizeRef,
  } = useEditorFormatting({
    activeBlockIndex,
    updateBlockText: (idx, html) => updateBlockText(idx, html),
  });

  const updateBlockText = useCallback((index: number, newHtml: string) => {
    let cleanHtml = newHtml;
    if (cleanHtml.includes('size="7"') || cleanHtml.includes("size='7'") || cleanHtml.includes("size=7")) {
      const size = pendingFontSizeRef.current;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanHtml;
      const fonts = tempDiv.querySelectorAll('font[size="7"]');
      fonts.forEach(font => {
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
      cleanHtml = tempDiv.innerHTML;
    }

    const plainText = cleanHtml.replace(/<[^>]*>/g, '').trim();
    if (plainText.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashQuery(plainText.substring(1));
    } else {
      setShowSlashMenu(false);
    }

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map((b, idx) =>
                idx === index ? { ...b, text: cleanHtml } : b
              )
            };
          }
          return lesson;
        }))
      }));
      pushHistoryState(nextChapters, true, index);
      return nextChapters;
    });
  }, [activeLessonId, patchLessonFn, pushHistoryState, setChapters, pendingFontSizeRef]);

  // 2. Table Operations Sub-hook
  const {
    liveTableResize,
    setLiveTableResize,
    liveTableActiveCell,
    setLiveTableActiveCell,
    showTableModal,
    setShowTableModal,
    tableInsertIndex,
    setTableInsertIndex,
    tableInsertMode,
    setTableInsertMode,
    createTableWithDimensions,
  } = useEditorTableOperations({
    chapters,
    setChapters,
    activeLessonId,
    activeBlockIndex,
    patchLessonFn,
    pushHistoryState,
    setActiveBlockIndex,
    focusBlock,
  });

  // 3. Block Mutations Sub-hook
  const {
    showOtherBlocksPopup,
    setShowOtherBlocksPopup,
    toggleBlockType,
    applyBlockAlignment,
    toggleBlockAlign,
    indentBlock,
    outdentBlock,
    toggleTodoChecked,
    deleteBlock,
    handleDeleteBlockWithConfirm,
    insertBlockBelow,
    deleteBlocks,
    duplicateBlocks,
    pasteBlocks,
    duplicateBlock,
    convertBlockType,
    handleUpdateBlock,
    moveBlocks,
    handleBackspaceAtStart,
    handleDeleteAtEnd,
    insertBlockAbove,
    handleSelectOtherBlock,
    handleSideToolClick,
    handleBodyDrop,
  } = useEditorBlockMutations({
    chapters,
    setChapters,
    activeLessonId,
    currentBlocks,
    patchLessonFn,
    pushHistoryState,
    activeBlockId,
    selectedBlockIds,
    editorMode,
    activeBlockIndex,
    setActiveBlockIndex,
    activeBlock,
    focusBlock,
    syncBlockCommandState,
    updateBlockText,
    tableCellAlignRef,
    syncFormattingRef,
    setTableInsertIndex,
    setTableInsertMode,
    setShowTableModal,
  });

  const filteredCommands = useMemo(() => {
    if (!slashQuery) return BLOCK_COMMANDS;
    const q = slashQuery.toLowerCase();
    return BLOCK_COMMANDS.filter(opt =>
      opt.label.toLowerCase().includes(q) ||
      opt.type.toLowerCase().includes(q) ||
      opt.desc.toLowerCase().includes(q)
    );
  }, [slashQuery]);

  const handleSelectSlashCommand = useCallback((cmdType: string) => {
    setShowSlashMenu(false);

    if (cmdType === 'mindmap') return;

    if (cmdType === 'table') {
      setTableInsertIndex(activeBlockIndex);
      setTableInsertMode('replace');
      setShowTableModal(true);
      return;
    }

    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => ({
        ...lesson,
        blocks: lesson.blocks.map((b, idx) => {
          if (idx === activeBlockIndex) {
            if (cmdType.startsWith('heading-')) {
              const level = parseInt(cmdType.split('-')[1], 10) as 1 | 2 | 3;
              return createDefaultBlock('heading', b.id, b.align, b.indent, level);
            }
            return createDefaultBlock(cmdType as DocBlock['type'], b.id, b.align, b.indent);
          }
          return b;
        })
      })))
    }));

    pushHistoryState(nextChapters, false, activeBlockIndex);
    setChapters(nextChapters);
    focusBlock(activeBlockIndex);
  }, [chapters, activeBlockIndex, patchLessonFn, pushHistoryState, setChapters, setTableInsertIndex, setTableInsertMode, setShowTableModal]);

  return {
    activeBlockId,
    setActiveBlockId,
    selectedBlockIds,
    setSelectedBlockIds,
    editorMode,
    setEditorMode,
    liveTableResize,
    setLiveTableResize,
    liveTableActiveCell,
    setLiveTableActiveCell,
    showTableModal,
    setShowTableModal,
    showOtherBlocksPopup,
    setShowOtherBlocksPopup,
    tableInsertIndex,
    setTableInsertIndex,
    tableInsertMode,
    setTableInsertMode,
    showSlashMenu,
    setShowSlashMenu,
    slashQuery,
    setSlashQuery,
    slashMenuIndex,
    setSlashMenuIndex,
    slashMenuCoords,
    setSlashMenuCoords,
    activeBlockIndex,
    setActiveBlockIndex,
    activeBlock,
    tableCellAlignRef,
    syncFormattingRef,
    pendingFontSizeRef,
    syncBlockCommandState,
    updateBlockText,
    executeFormat,
    handleColorChange,
    handleHighlightChange,
    applyFontSize,
    createTableWithDimensions,
    toggleBlockType,
    applyBlockAlignment,
    toggleBlockAlign,
    indentBlock,
    outdentBlock,
    toggleTodoChecked,
    deleteBlock,
    handleDeleteBlockWithConfirm,
    insertBlockBelow,
    deleteBlocks,
    duplicateBlocks,
    pasteBlocks,
    duplicateBlock,
    convertBlockType,
    handleUpdateBlock,
    moveBlocks,
    handleBackspaceAtStart,
    handleDeleteAtEnd,
    filteredCommands,
    handleSelectSlashCommand,
    insertBlockAbove,
    handleSelectOtherBlock,
    handleSideToolClick,
    focusBlock,
    handleBodyDrop,
  };
};
