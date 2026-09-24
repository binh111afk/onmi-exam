import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createDefaultBlock, generateBlockId } from '../blocks/BlockFactory';
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

  // Layout "Bố cục" (G1) — picker mở TRƯỚC, block chỉ tạo sau onPick (R1: không block mồ côi)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [layoutInsertIndex, setLayoutInsertIndex] = useState<number | null>(null);
  const [layoutInsertMode, setLayoutInsertMode] = useState<'replace' | 'insert' | null>(null);

  const tableCellAlignRef = useRef<((align: 'left' | 'center' | 'right' | 'justify') => void) | null>(null);
  // Block gốc của menu "/" — ref vì activeBlockIndex derived qua activeBlockId có thể stale sau insert
  const slashOriginIndexRef = useRef<number | null>(null);

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

  // Không auto-chọn block khi mở bài — user click 1 lần để chọn, lần 2 mới sửa (spec tương tác 2 click)

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
      setActiveBlockIndex(index);
      slashOriginIndexRef.current = index;
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
    setActiveBlockId,
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
    // Index nguồn của menu "/" — tránh stale derived index (convert nhầm block sau insert)
    const targetIndex = slashOriginIndexRef.current ?? activeBlockIndex;
    slashOriginIndexRef.current = null;

    if (cmdType === 'mindmap') return;

    if (cmdType === 'table') {
      setTableInsertIndex(targetIndex);
      setTableInsertMode('replace');
      setShowTableModal(true);
      return;
    }

    if (cmdType === 'layout') {
      setLayoutInsertIndex(targetIndex);
      setLayoutInsertMode('replace');
      setShowLayoutPicker(true);
      return;
    }

    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => ({
        ...lesson,
        blocks: lesson.blocks.map((b, idx) => {
          if (idx === targetIndex) {
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

    pushHistoryState(nextChapters, false, targetIndex);
    setChapters(nextChapters);
    setActiveBlockIndex(targetIndex);
    focusBlock(targetIndex);
  }, [chapters, activeBlockIndex, patchLessonFn, pushHistoryState, setChapters, setActiveBlockIndex, setTableInsertIndex, setTableInsertMode, setShowTableModal]);

  const openLayoutPicker = useCallback((mode: 'replace' | 'insert', index: number) => {
    setLayoutInsertIndex(index);
    setLayoutInsertMode(mode);
    setShowLayoutPicker(true);
  }, []);

  const closeLayoutPicker = useCallback(() => {
    setShowLayoutPicker(false);
    setLayoutInsertIndex(null);
    setLayoutInsertMode(null);
  }, []);

  /** Tạo block layout sau khi chọn preset (R1 — không block mồ côi) */
  const createLayoutWithPreset = useCallback((columns: number[]) => {
    const targetIndex = layoutInsertIndex !== null ? layoutInsertIndex : activeBlockIndex;
    const newBlock: DocBlock = {
      id: generateBlockId(),
      type: 'layout',
      text: '',
      layoutContent: { columns, slots: columns.map(() => []) },
    };
    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => {
        if (lesson.id !== activeLessonId) return lesson;
        if (layoutInsertMode === 'insert') {
          return {
            ...lesson,
            blocks: [...lesson.blocks.slice(0, targetIndex + 1), newBlock, ...lesson.blocks.slice(targetIndex + 1)],
          };
        }
        return {
          ...lesson,
          blocks: lesson.blocks.map((b, idx) => (idx === targetIndex ? newBlock : b)),
        };
      })),
    }));
    pushHistoryState(nextChapters, false, targetIndex);
    setChapters(nextChapters);
    setActiveBlockIndex(targetIndex);
    setShowLayoutPicker(false);
    setLayoutInsertIndex(null);
    setLayoutInsertMode(null);
  }, [chapters, activeLessonId, activeBlockIndex, layoutInsertIndex, layoutInsertMode, patchLessonFn, pushHistoryState, setChapters, setActiveBlockIndex]);

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
    showLayoutPicker,
    openLayoutPicker,
    closeLayoutPicker,
    createLayoutWithPreset,
    insertBlockAbove,
    handleSelectOtherBlock,
    handleSideToolClick,
    focusBlock,
    handleBodyDrop,
  };
};
