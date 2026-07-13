import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  Save,
  Send,
  FileCheck2,
  Brain,
  ImageIcon,
  Table as TableIcon,
  Activity,
  HelpCircle,
  Award,
  Video,
} from 'lucide-react';
import { DocSidebar } from './DocSidebar';
import { DocToolbar } from './DocToolbar';
import { DocPreviewSimulator } from './DocPreviewSimulator';
import { Tooltip } from './Tooltip';
import { useAlert } from '../../common/Alert';
import { BlockRenderer } from './blocks/BlockRenderer';
import { BlockSelectionProvider } from './BlockSelectionProvider';
import { BlockWrapper } from './BlockWrapper';
import { createDefaultBlock, generateBlockId } from './blocks/BlockFactory';
import { uploadImageFile } from '../../../services/imageUploadService';
import type { Chapter, Lesson, DocBlock, LiveTableResizeState, LiveTableActiveCell, DbChapter, DbLesson, DbBlock } from '../../../types/doc-editor';
import { FormattingStateProvider } from './FormattingStateProvider';
import { useDocumentTree } from './useDocumentTree';

// Sprint 5 Additions
import { BLOCK_COMMANDS } from './CommandRegistry';
import { SlashMenu } from './SlashMenu';
import { SelectionContextMenu } from './SelectionContextMenu';
import { TableInsertModal } from './TableInsertModal';
import { PublishModal } from './PublishModal';
import { DragIndicator } from './DragIndicator';
import { BlockDragPreview } from './BlockDragPreview';
import { matchKeyboardShortcut } from './KeyboardShortcutManager';
import { OtherBlocksPopup } from './other-blocks/OtherBlocksPopup';

interface DocEditorWorkspaceProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor' | 'document-setup') => void;
  initialChaptersData?: Chapter[];
  initialActiveLessonId?: string;
  metadata?: {
    name: string;
    subject: string;
    grade: string;
    docType: string;
    description?: string;
    coverImage?: string;
  };
}

const initialChapters: Chapter[] = [];

const findFirstLessonId = (list: Chapter[]): string => {
  const findInLessons = (lessons: Lesson[]): string => {
    for (const lesson of lessons) {
      if (lesson.blocks.length > 0) return lesson.id;
      const childId = lesson.subLessons ? findInLessons(lesson.subLessons) : '';
      if (childId) return childId;
    }
    return '';
  };

  for (const chapter of list) {
    const lessonId = findInLessons(chapter.lessons);
    if (lessonId) return lessonId;
  }

  return '';
};

const getNumberedIndex = (blocks: DocBlock[], index: number): string => {
  const currentBlock = blocks[index];
  if (!currentBlock || currentBlock.type !== 'numbered-list') return '1.';

  let count = 1;
  const currentIndent = currentBlock.indent || 0;

  for (let i = index - 1; i >= 0; i--) {
    const prev = blocks[i];
    if (prev.type !== 'numbered-list') {
      if (prev.type !== 'bullet-list' && prev.type !== 'todo-list') {
        break;
      }
      continue;
    }
    const prevIndent = prev.indent || 0;
    if (prevIndent === currentIndent) {
      count++;
    } else if (prevIndent < currentIndent) {
      break;
    }
  }
  return `${count}.`;
};

const getTableNumber = (blocks: DocBlock[], index: number): number => {
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (blocks[i]?.type === 'table') {
      count++;
    }
  }
  return count;
};



interface HistoryEntry {
  chapters: Chapter[];
  activeIndex: number;
  caretOffset: number;
}

const getCaretOffset = (element: HTMLElement): number => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;
  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  return preCaretRange.toString().length;
};

const setCaretOffset = (element: HTMLElement, offset: number) => {
  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(true);

  const nodeStack: Node[] = [element];
  let currentOffset = 0;
  let found = false;

  while (nodeStack.length > 0) {
    const node = nodeStack.pop()!;
    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.textContent || '';
      const nextOffset = currentOffset + val.length;
      if (offset >= currentOffset && offset <= nextOffset) {
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        found = true;
        break;
      }
      currentOffset = nextOffset;
    } else {
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  if (!found) {
    range.selectNodeContents(element);
    range.collapse(false);
  }

  selection.removeAllRanges();
  selection.addRange(range);
};

export const DocEditorWorkspace: React.FC<DocEditorWorkspaceProps> = ({ 
  setMode,
  initialChaptersData,
  initialActiveLessonId,
  metadata
}) => {
  const { showAlert, showConfirm } = useAlert();
  const [showPreview, setShowPreview] = useState(true);
  const documentTree = useDocumentTree(initialChaptersData || initialChapters);
  const {
    chapters,
    setChapters,
    findLessonById,
    getNodeTitle,
    getDeletedIds,
    toggleExpand,
    expandedNodeIds,
    createChapter,
    createLesson,
    createSubLesson,
    createDocumentInFolder,
    deleteNode,
    renameNode,
    moveLesson,
    reorderChapter,
  } = documentTree;
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    return initialActiveLessonId || initialChaptersData?.[0]?.lessons?.[0]?.id || '';
  });

  const activeLesson = useMemo(() => findLessonById(activeLessonId), [activeLessonId, findLessonById]);
  const canEditActiveLesson = Boolean(activeLesson && !activeLesson.isFolder);
  const currentBlocks = useMemo(() => canEditActiveLesson && activeLesson ? activeLesson.blocks : [], [activeLesson, canEditActiveLesson]);

  const patchLessonFn = useCallback(
    (lessonMapper: (lesson: Lesson) => Lesson) => (lesson: Lesson): Lesson => {
      const mapped = lesson.id === activeLessonId ? lessonMapper(lesson) : lesson;
      return mapped.subLessons?.length
        ? { ...mapped, subLessons: mapped.subLessons.map(patchLessonFn(lessonMapper)) }
        : mapped;
    },
    [activeLessonId]
  );

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [editorMode, setEditorMode] = useState<'block' | 'text'>('block');

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

  // Initialize activeBlockId on load
  useEffect(() => {
    if (!activeBlockId && currentBlocks.length > 0) {
      setActiveBlockId(currentBlocks[0].id);
    }
  }, [currentBlocks, activeBlockId]);
  const [liveTableResize, setLiveTableResize] = useState<LiveTableResizeState | null>(null);
  const [liveTableActiveCell, setLiveTableActiveCell] = useState<LiveTableActiveCell | null>(null);
  const tableCellAlignRef = useRef<((align: 'left' | 'center' | 'right' | 'justify') => void) | null>(null);
  const syncFormattingRef = useRef<(() => void) | null>(null);

  const syncBlockCommandState = useCallback((nextActiveId: string | null, nextSelectedIds?: string[]) => {
    setActiveBlockId(nextActiveId);
    setSelectedBlockIds(nextSelectedIds ?? (nextActiveId ? [nextActiveId] : []));
    setEditorMode('block');
    requestAnimationFrame(() => syncFormattingRef.current?.());
  }, []);

  // Slash Command states
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashMenuIndex, setSlashMenuIndex] = useState(0);
  const [slashMenuCoords, setSlashMenuCoords] = useState({ top: 0, left: 0 });
  const [showOtherBlocksPopup, setShowOtherBlocksPopup] = useState(false);

  // Selection states
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(() => {
    return initialChaptersData?.[0]?.id ?? initialChapters[0]?.id ?? null;
  });
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItems, setNewItems] = useState<string[]>([]);

  // History tracking with structure
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHistoryEntryRef = useRef<HistoryEntry | null>(null);
  const pendingFontSizeRef = useRef<string>('16');
  // Removed tableCellAlignRef definition (defined above)

  // Drag & Drop Pointer Events States
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragPointerCoords, setDragPointerCoords] = useState({ x: 0, y: 0 });
  const [dragIndicatorTop, setDragIndicatorTop] = useState(0);
  const [dragIndicatorVisible, setDragIndicatorVisible] = useState(false);

  // Custom Selection Context Menu States
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [selectionMenuCoords, setSelectionMenuCoords] = useState({ x: 0, y: 0 });

  // Table Creation Dialog States
  const [showTableModal, setShowTableModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [tableInsertIndex, setTableInsertIndex] = useState<number | null>(null);
  const [tableInsertMode, setTableInsertMode] = useState<'replace' | 'insert' | null>(null);

  useEffect(() => {
    if (!canEditActiveLesson) {
      setActiveBlockId(null);
      setSelectedBlockIds([]);
      setEditorMode('block');
      setShowSlashMenu(false);
      setShowSelectionMenu(false);
      setShowOtherBlocksPopup(false);
      setShowTableModal(false);
      setTableInsertIndex(null);
      setTableInsertMode(null);
    }
  }, [canEditActiveLesson]);



  // Pending selection/caret recovery
  const pendingCaretRestoreRef = useRef<{ index: number; offset: number } | null>(null);

  // Initialize history
  useEffect(() => {
    const initialHistory = [{
      chapters: initialChaptersData || initialChapters,
      activeIndex: 0,
      caretOffset: 0
    }];
    historyRef.current = initialHistory;
    historyIndexRef.current = 0;
    setHistory(initialHistory);
    setHistoryIndex(0);
  }, [initialChaptersData]);


  // Restore caret position and focus when chapters change
  useEffect(() => {
    if (pendingCaretRestoreRef.current) {
      const { index, offset } = pendingCaretRestoreRef.current;
      pendingCaretRestoreRef.current = null;
      setTimeout(() => {
        const el = document.getElementById(`block-editor-${index}`);
        if (el) {
          el.focus();
          try {
            setCaretOffset(el, offset);
          } catch (err) {
            // Ignore if caret offset set fails (e.g. empty block)
          }
        }
      }, 60);
    }
  }, [chapters]);

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

  const commitHistoryEntry = useCallback((entry: HistoryEntry) => {
    const nextHistory = [...historyRef.current.slice(0, historyIndexRef.current + 1), entry];
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setHistory(nextHistory);
    setHistoryIndex(historyIndexRef.current);
  }, []);

  const pushHistoryState = useCallback((newChapters: Chapter[], isDebounced = false, activeIndexOverride = activeBlockIndex) => {
    setChapters(newChapters);

    let caretOffset = 0;
    const activeEl = document.getElementById(`block-editor-${activeIndexOverride}`);
    if (activeEl) {
      try {
        caretOffset = getCaretOffset(activeEl);
      } catch (err) { }
    }

    const newEntry: HistoryEntry = {
      chapters: newChapters,
      activeIndex: activeIndexOverride,
      caretOffset
    };

    if (isDebounced) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      pendingHistoryEntryRef.current = newEntry;
      typingTimeoutRef.current = setTimeout(() => {
        if (pendingHistoryEntryRef.current) {
          commitHistoryEntry(pendingHistoryEntryRef.current);
          pendingHistoryEntryRef.current = null;
        }
      }, 400);
    } else {
      commitHistoryEntry(newEntry);
    }
  }, [activeBlockIndex, commitHistoryEntry]);

  const createTableWithDimensions = useCallback((rowsCount: number, colsCount: number, hasHeaderRow: boolean, hasHeaderCol: boolean) => {
    const targetIndex = tableInsertIndex !== null ? tableInsertIndex : activeBlockIndex;
    const tableRows = Array.from({ length: rowsCount }, () => Array(colsCount).fill(''));

    // Set initial custom column widths and row heights
    const columnWidths = Array(colsCount).fill(120);
    const rowHeights = Array(rowsCount).fill(36);

    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => {
        if (lesson.id === activeLessonId) {
          if (tableInsertMode === 'insert') {
            const newBlock: DocBlock = {
              id: generateBlockId(),
              type: 'table',
              text: '',
              rows: tableRows,
              hasHeaderRow,
              hasHeaderColumn: hasHeaderCol,
              columnWidths,
              rowHeights
            };
            return {
              ...lesson,
              blocks: [
                ...lesson.blocks.slice(0, targetIndex + 1),
                newBlock,
                ...lesson.blocks.slice(targetIndex + 1)
              ]
            };
          } else {
            return {
              ...lesson,
              blocks: lesson.blocks.map((b, idx) =>
                idx === targetIndex ? {
                  ...b,
                  type: 'table' as const,
                  text: '',
                  rows: tableRows,
                  hasHeaderRow,
                  hasHeaderColumn: hasHeaderCol,
                  columnWidths,
                  rowHeights
                } : b
              )
            };
          }
        }
        return lesson;
      }))
    }));

    pushHistoryState(nextChapters);
    setChapters(nextChapters);

    const nextIdx = tableInsertMode === 'insert' ? targetIndex + 1 : targetIndex;
    setActiveBlockIndex(nextIdx);
    focusBlock(nextIdx);

    setShowTableModal(false);
    setTableInsertIndex(null);
    setTableInsertMode(null);
  }, [tableInsertIndex, tableInsertMode, activeBlockIndex, chapters, activeLessonId, patchLessonFn, pushHistoryState]);

  const handleUndo = useCallback(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (pendingHistoryEntryRef.current) {
      commitHistoryEntry(pendingHistoryEntryRef.current);
      pendingHistoryEntryRef.current = null;
    }
    if (historyIndexRef.current > 0) {
      const nextIndex = historyIndexRef.current - 1;
      const entry = historyRef.current[nextIndex];
      if (!entry) return;
      const restoredBlocks = findLessonById(activeLessonId, entry.chapters)?.blocks ?? [];
      const nextActiveId = restoredBlocks[entry.activeIndex]?.id ?? restoredBlocks[0]?.id ?? null;
      pendingCaretRestoreRef.current = {
        index: entry.activeIndex,
        offset: entry.caretOffset
      };
      historyIndexRef.current = nextIndex;
      setChapters(entry.chapters);
      setHistoryIndex(nextIndex);
      syncBlockCommandState(nextActiveId);
    }
  }, [activeLessonId, commitHistoryEntry, findLessonById, syncBlockCommandState]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      const nextIndex = historyIndexRef.current + 1;
      const entry = historyRef.current[nextIndex];
      if (!entry) return;
      const restoredBlocks = findLessonById(activeLessonId, entry.chapters)?.blocks ?? [];
      const nextActiveId = restoredBlocks[entry.activeIndex]?.id ?? restoredBlocks[0]?.id ?? null;
      pendingCaretRestoreRef.current = {
        index: entry.activeIndex,
        offset: entry.caretOffset
      };
      historyIndexRef.current = nextIndex;
      setChapters(entry.chapters);
      setHistoryIndex(nextIndex);
      syncBlockCommandState(nextActiveId);
    }
  }, [activeLessonId, findLessonById, syncBlockCommandState]);

  // Removed duplicates of findLessonById, activeLesson, currentBlocks (defined above)
  const activeBlock = currentBlocks[activeBlockIndex] || {
    type: 'paragraph',
    align: 'left',
    level: undefined,
    indent: 0
  };

  // Clear liveTableActiveCell if active block is not a table
  useEffect(() => {
    if (!activeBlock || activeBlock.type !== 'table') {
      setLiveTableActiveCell(null);
    }
  }, [activeBlock]);

  const rgbToHex = (colorVal: string): string => {
    if (!colorVal) return '#1F2C3F';
    const val = colorVal.trim().toLowerCase();
    if (val.startsWith('#')) return val.toUpperCase();
    if (val === 'transparent' || val === 'rgba(0, 0, 0, 0)' || val === 'rgba(0,0,0,0)') return 'transparent';

    const match = val.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
    if (!match) return colorVal;

    const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(match[3], 10).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`.toUpperCase();
  };

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
      pushHistoryState(nextChapters, true);
      return nextChapters;
    });
  }, [activeLessonId, patchLessonFn, pushHistoryState]);

  const executeFormat = useCallback((command: string, value: string = '') => {
    document.execCommand(command, false, value);
    const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
    if (activeEl) {
      updateBlockText(activeBlockIndex, activeEl.innerHTML);
    }
    syncFormattingRef.current?.();
  }, [activeBlockIndex, updateBlockText]);

  const handleColorChange = useCallback((color: string) => {
    let activeColor = document.queryCommandValue('foreColor') || '#1F2C3F';
    activeColor = rgbToHex(activeColor);
    const targetColor = activeColor === rgbToHex(color) ? '#1F2C3F' : color;
    executeFormat('foreColor', targetColor);
  }, [executeFormat]);

  const handleHighlightChange = useCallback((color: string) => {
    let activeHighlight = document.queryCommandValue('backColor') || 'transparent';
    activeHighlight = rgbToHex(activeHighlight);
    const targetHighlight = activeHighlight === rgbToHex(color) ? 'transparent' : color;
    executeFormat('backColor', targetHighlight);
  }, [executeFormat]);

  const applyFontSize = useCallback((size: string) => {
    pendingFontSizeRef.current = size;

    const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
    if (activeEl) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed && activeEl.contains(selection.anchorNode) && activeEl.contains(selection.focusNode)) {
        const range = selection.getRangeAt(0);
        const fragment = range.extractContents();
        fragment.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
          element.style.fontSize = '';
          if (!element.getAttribute('style')) {
            element.removeAttribute('style');
          }
        });
        fragment.querySelectorAll('font[size]').forEach((font) => {
          font.removeAttribute('size');
        });
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        span.appendChild(fragment);
        range.insertNode(span);
        selection.removeAllRanges();
        const nextRange = document.createRange();
        nextRange.selectNodeContents(span);
        selection.addRange(nextRange);
      } else {
        document.execCommand('fontSize', false, '7');
        const fonts = activeEl.querySelectorAll('font[size="7"]');
        fonts.forEach(font => {
          const span = document.createElement('span');
          span.style.fontSize = `${size}px`;
          span.innerHTML = font.innerHTML;
          font.parentNode?.replaceChild(span, font);
        });
      }
      updateBlockText(activeBlockIndex, activeEl.innerHTML);
    }
    syncFormattingRef.current?.();
  }, [activeBlockIndex, updateBlockText]);

  const toggleBlockType = useCallback((type: DocBlock['type'], level?: 1 | 2 | 3) => {
    if (type === 'table') {
      setTableInsertIndex(activeBlockIndex);
      setTableInsertMode('replace');
      setShowTableModal(true);
      return;
    }
    const targetBlockIds = editorMode === 'block' && selectedBlockIds.length > 0
      ? selectedBlockIds
      : [currentBlocks[activeBlockIndex]?.id].filter((id): id is string => Boolean(id));
    const shouldResetType = targetBlockIds.length > 0 && targetBlockIds.every(id => {
      const block = currentBlocks.find(item => item.id === id);
      return block?.type === type && (type !== 'heading' || block.level === level);
    });

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map(block => targetBlockIds.includes(block.id)
                ? { ...block, type: shouldResetType ? 'paragraph' : type, level: shouldResetType || type !== 'heading' ? undefined : level }
                : block)
            };
          }
          return lesson;
        }))
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
    syncFormattingRef.current?.();
  }, [activeBlockIndex, activeLessonId, currentBlocks, editorMode, patchLessonFn, pushHistoryState, selectedBlockIds]);

  const applyBlockAlignment = useCallback((blockIds: string[], align: DocBlock['align']) => {
    const validIds = currentBlocks
      .filter(block => blockIds.includes(block.id))
      .map(block => block.id);
    if (validIds.length === 0) return;

    const nextActiveId = activeBlockId && validIds.includes(activeBlockId)
      ? activeBlockId
      : validIds[0];
    const nextActiveIndex = currentBlocks.findIndex(block => block.id === nextActiveId);

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map(b =>
            validIds.includes(b.id) ? { ...b, align } : b
          )
        })))
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex === -1 ? activeBlockIndex : nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId, validIds);
  }, [activeBlockId, activeBlockIndex, currentBlocks, patchLessonFn, pushHistoryState, syncBlockCommandState]);

  const toggleBlockAlign = useCallback((align: 'left' | 'center' | 'right' | 'justify') => {
    // When a table cell is focused, align the cell text — not the block container
    if (activeBlock.type === 'table' && tableCellAlignRef.current) {
      tableCellAlignRef.current(align);
      return;
    }

    if (editorMode === 'text') {
      const command = align === 'left' ? 'justifyLeft' :
        align === 'center' ? 'justifyCenter' :
          align === 'right' ? 'justifyRight' : 'justifyFull';
      document.execCommand(command, false, '');

      const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
      if (activeEl) {
        updateBlockText(activeBlockIndex, activeEl.innerHTML);
      }
      syncFormattingRef.current?.();
    } else {
      const targetIds = selectedBlockIds.length > 0
        ? selectedBlockIds
        : activeBlockId ? [activeBlockId] : [];
      applyBlockAlignment(targetIds, align);
    }
  }, [activeBlock.type, activeBlockId, activeBlockIndex, editorMode, selectedBlockIds, updateBlockText, applyBlockAlignment]);

  const indentBlock = useCallback((index = activeBlockIndex) => {
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map((b, idx) =>
            idx === index ? { ...b, indent: Math.min(5, (b.indent || 0) + 1) } : b
          )
        })))
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [activeBlockIndex, patchLessonFn, pushHistoryState]);

  const outdentBlock = useCallback((index = activeBlockIndex) => {
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map((b, idx) =>
            idx === index ? { ...b, indent: Math.max(0, (b.indent || 0) - 1) } : b
          )
        })))
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [activeBlockIndex, patchLessonFn, pushHistoryState]);

  const toggleTodoChecked = useCallback((index: number) => {
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map((b, idx) =>
            idx === index ? { ...b, checked: !b.checked } : b
          )
        })))
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [patchLessonFn, pushHistoryState]);

  const focusBlock = (index: number) => {
    setTimeout(() => {
      const el = document.getElementById(`block-editor-${index}`);
      if (el) {
        el.focus();
      }
    }, 50);
  };

  const deleteBlock = useCallback((index: number) => {
    if (currentBlocks.length <= 1) return;
    setChapters(prev => {
      const nextPages = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.filter((_, idx) => idx !== index)
        })))
      }));
      pushHistoryState(nextPages);
      const targetIdx = Math.max(0, index - 1);
      setActiveBlockIndex(targetIdx);
      focusBlock(targetIdx);
      return nextPages;
    });
  }, [currentBlocks.length, patchLessonFn, pushHistoryState]);

  const handleDeleteBlockWithConfirm = useCallback(async (index: number) => {
    const ok = await showConfirm({
      type: 'danger',
      title: 'Xóa block',
      description: 'Bạn có chắc chắn muốn xóa block này không?'
    });
    if (ok) {
      deleteBlock(index);
    }
  }, [deleteBlock, showConfirm]);

  const insertBlockBelow = useCallback((index: number) => {
    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => {
        const newBlock = createDefaultBlock('paragraph', undefined, 'left', lesson.blocks[index]?.indent || 0);
        return {
          ...lesson,
          blocks: [...lesson.blocks.slice(0, index + 1), newBlock, ...lesson.blocks.slice(index + 1)],
        };
      })),
    }));
    pushHistoryState(nextChapters);
    setActiveBlockIndex(index + 1);
    focusBlock(index + 1);
  }, [chapters, patchLessonFn, pushHistoryState]);

  const deleteBlocks = useCallback((ids: string[]) => {
    const validIds = currentBlocks
      .filter(block => ids.includes(block.id))
      .map(block => block.id);
    if (validIds.length === 0) return;

    const firstDeletedIndex = currentBlocks.findIndex(block => block.id === validIds[0]);
    const remainingBlocks = currentBlocks.filter(block => !validIds.includes(block.id));
    const fallbackBlock = remainingBlocks.length === 0 ? createDefaultBlock('paragraph') : null;
    const finalBlocks = fallbackBlock ? [fallbackBlock] : remainingBlocks;
    const nextActiveIndex = Math.min(firstDeletedIndex, finalBlocks.length - 1);
    const nextActiveId = finalBlocks[nextActiveIndex]?.id ?? null;

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({ ...lesson, blocks: finalBlocks })))
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId);
  }, [currentBlocks, patchLessonFn, pushHistoryState, syncBlockCommandState]);

  const duplicateBlocks = useCallback((ids: string[]) => {
    const validIds = currentBlocks
      .filter(block => ids.includes(block.id))
      .map(block => block.id);
    if (validIds.length === 0) return;

    const duplicateIds = new Map(validIds.map(id => [id, generateBlockId()]));
    const nextBlocks: DocBlock[] = [];
    currentBlocks.forEach(block => {
      nextBlocks.push(block);
      const duplicateId = duplicateIds.get(block.id);
      if (duplicateId) {
        nextBlocks.push({
          ...block,
          id: duplicateId,
        });
      }
    });

    const nextSelectedIds = validIds
      .map(id => duplicateIds.get(id))
      .filter((id): id is string => Boolean(id));
    const nextActiveId = activeBlockId && duplicateIds.has(activeBlockId)
      ? duplicateIds.get(activeBlockId) ?? nextSelectedIds[0]
      : nextSelectedIds[0];
    const nextActiveIndex = nextBlocks.findIndex(block => block.id === nextActiveId);

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({ ...lesson, blocks: nextBlocks })))
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex === -1 ? activeBlockIndex : nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId ?? null, nextSelectedIds);
  }, [activeBlockId, activeBlockIndex, currentBlocks, patchLessonFn, pushHistoryState, syncBlockCommandState]);

  const pasteBlocks = useCallback((pasted: DocBlock[], targetBlockId: string | null) => {
    if (pasted.length === 0) return;
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => {
          const idx = targetBlockId ? lesson.blocks.findIndex(b => b.id === targetBlockId) : -1;
          const insertIdx = idx !== -1 ? idx + 1 : lesson.blocks.length;

          const freshBlocks = pasted.map(b => ({
            ...b,
            id: generateBlockId(),
          }));

          const updated = [
            ...lesson.blocks.slice(0, insertIdx),
            ...freshBlocks,
            ...lesson.blocks.slice(insertIdx)
          ];
          return { ...lesson, blocks: updated };
        }))
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [patchLessonFn, pushHistoryState]);

  const duplicateBlock = useCallback((index: number) => {
    const currentBlock = currentBlocks[index];
    if (!currentBlock) return;
    const newBlock: DocBlock = {
      ...currentBlock,
      id: generateBlockId(),
    };
    setChapters(prev => {
      const nextPages = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: [
            ...lesson.blocks.slice(0, index + 1),
            newBlock,
            ...lesson.blocks.slice(index + 1)
          ]
        })))
      }));
      pushHistoryState(nextPages);
      return nextPages;
    });
  }, [currentBlocks, patchLessonFn, pushHistoryState]);

  const convertBlockType = useCallback((index: number, type: DocBlock['type'], level?: 1 | 2 | 3) => {
    if (type === 'mindmap') return;
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({
          ...lesson,
          blocks: lesson.blocks.map((b, idx) => {
            if (idx === index) {
              return createDefaultBlock(type, b.id, b.align, b.indent, level, b.text);
            }
            return b;
          })
        })))
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [patchLessonFn, pushHistoryState]);

  const handleUpdateBlock = useCallback((index: number, updatedBlock: DocBlock, isDebounced = false) => {
    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => ({
        ...lesson,
        blocks: lesson.blocks.map((block, blockIndex) =>
          blockIndex === index ? updatedBlock : block
        ),
      })))
    }));
    pushHistoryState(nextChapters, isDebounced);
  }, [chapters, patchLessonFn, pushHistoryState]);

  const moveBlocks = useCallback((ids: string[], direction: 'up' | 'down') => {
    const validIds = currentBlocks
      .filter(block => ids.includes(block.id))
      .map(block => block.id);
    if (validIds.length === 0) return;

    const selected = new Set(validIds);
    const selectedIndexes = currentBlocks
      .map((block, index) => selected.has(block.id) ? index : -1)
      .filter(index => index !== -1);
    if (selectedIndexes.length === 0) return;

    const firstIndex = Math.min(...selectedIndexes);
    const lastIndex = Math.max(...selectedIndexes);
    if ((direction === 'up' && firstIndex === 0) || (direction === 'down' && lastIndex === currentBlocks.length - 1)) {
      return;
    }

    const selectedBlocks = currentBlocks.filter(block => selected.has(block.id));
    const remainingBlocks = currentBlocks.filter(block => !selected.has(block.id));
    const adjacentId = direction === 'up'
      ? currentBlocks[firstIndex - 1]?.id
      : currentBlocks[lastIndex + 1]?.id;
    const adjacentIndex = remainingBlocks.findIndex(block => block.id === adjacentId);
    const insertIndex = direction === 'up' ? adjacentIndex : adjacentIndex + 1;
    const nextBlocks = [
      ...remainingBlocks.slice(0, insertIndex),
      ...selectedBlocks,
      ...remainingBlocks.slice(insertIndex)
    ];

    const nextActiveId = activeBlockId && selected.has(activeBlockId) ? activeBlockId : validIds[0];
    const nextActiveIndex = nextBlocks.findIndex(block => block.id === nextActiveId);

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(patchLessonFn(lesson => ({ ...lesson, blocks: nextBlocks })))
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex === -1 ? activeBlockIndex : nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId, validIds);
    focusBlock(nextActiveIndex);
  }, [activeBlockId, activeBlockIndex, currentBlocks, patchLessonFn, pushHistoryState, syncBlockCommandState]);
  const handleBackspaceAtStart = useCallback((index: number) => {
    setChapters(prev => {
      let nextPages = prev;
      for (const ch of prev) {
        const lesson = ch.lessons.find(l => l.id === activeLessonId);
        if (lesson) {
          const block = lesson.blocks[index];
          if (!block) return prev;

          if (block.indent && block.indent > 0) {
            nextPages = prev.map(c => ({
              ...c,
              lessons: c.lessons.map(l => {
                if (l.id === activeLessonId) {
                  return {
                    ...l,
                    blocks: l.blocks.map((b, idx) =>
                      idx === index ? { ...b, indent: Math.max(0, (b.indent || 0) - 1) } : b
                    )
                  };
                }
                return l;
              })
            }));
            break;
          }

          if (block.type !== 'paragraph') {
            nextPages = prev.map(c => ({
              ...c,
              lessons: c.lessons.map(l => {
                if (l.id === activeLessonId) {
                  return {
                    ...l,
                    blocks: l.blocks.map((b, idx) =>
                      idx === index ? { ...b, type: 'paragraph' as const, level: undefined } : b
                    )
                  };
                }
                return l;
              })
            }));
            break;
          }

          if (index > 0) {
            const prevBlock = lesson.blocks[index - 1];
            nextPages = prev.map(c => ({
              ...c,
              lessons: c.lessons.map(l => {
                if (l.id === activeLessonId) {
                  const updatedBlocks = l.blocks.filter((_, idx) => idx !== index);
                  updatedBlocks[index - 1] = {
                    ...prevBlock,
                    text: prevBlock.text + block.text
                  };
                  return { ...l, blocks: updatedBlocks };
                }
                return l;
              })
            }));
            setActiveBlockIndex(index - 1);
            setTimeout(() => {
              const prevEl = document.getElementById(`block-editor-${index - 1}`);
              if (prevEl) {
                prevEl.focus();
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(prevEl);
                range.collapse(false);
                selection?.removeAllRanges();
                selection?.addRange(range);
              }
            }, 50);
            break;
          }
        }
      }
      pushHistoryState(nextPages);
      return nextPages;
    });
  }, [activeLessonId, pushHistoryState]);

  const handleDeleteAtEnd = useCallback((index: number) => {
    setChapters(prev => {
      const chs = prev.map(ch => {
        const lesson = ch.lessons.find(l => l.id === activeLessonId);
        if (lesson) {
          if (index < lesson.blocks.length - 1) {
            const currentBlock = lesson.blocks[index];
            const nextBlock = lesson.blocks[index + 1];
            const updatedBlocks = lesson.blocks.filter((_, idx) => idx !== index + 1);
            updatedBlocks[index] = {
              ...currentBlock,
              text: currentBlock.text + nextBlock.text
            };
            return { ...ch, lessons: ch.lessons.map(l => l.id === activeLessonId ? { ...l, blocks: updatedBlocks } : l) };
          }
        }
        return ch;
      });
      pushHistoryState(chs);
      return chs;
    });
  }, [activeLessonId, pushHistoryState]);

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

    pendingCaretRestoreRef.current = {
      index: activeBlockIndex,
      offset: 0
    };
    pushHistoryState(nextChapters);
  }, [chapters, activeBlockIndex, patchLessonFn, pushHistoryState]);

  const insertBlockAbove = useCallback((index: number) => {
    setChapters(prev => {
      let nextPages = prev;
      for (const ch of prev) {
        const lesson = ch.lessons.find(l => l.id === activeLessonId);
        if (lesson) {
          const newBlock = createDefaultBlock('paragraph', undefined, 'left', lesson.blocks[index]?.indent || 0);
          nextPages = prev.map(c => ({
            ...c,
            lessons: c.lessons.map(l => {
              if (l.id === activeLessonId) {
                return {
                  ...l,
                  blocks: [
                    ...l.blocks.slice(0, index),
                    newBlock,
                    ...l.blocks.slice(index)
                  ]
                };
              }
              return l;
            })
          }));
          break;
        }
      }
      pushHistoryState(nextPages);
      setActiveBlockIndex(index);
      focusBlock(index);
      return nextPages;
    });
  }, [activeLessonId, pushHistoryState]);

  const handleBlockDragStart = (e: React.PointerEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault();
    const button = e.currentTarget;
    button.setPointerCapture(e.pointerId);

    setDraggingIndex(index);
    setDragPointerCoords({ x: e.clientX, y: e.clientY });
    setDragIndicatorVisible(true);

    const container = document.getElementById('editor-blocks-container');
    if (!container) return;

    const rows = Array.from(container.querySelectorAll('.block-row-item')) as HTMLElement[];
    const rowRects = rows.map(r => r.getBoundingClientRect());
    const containerRect = container.getBoundingClientRect();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setDragPointerCoords({ x: moveEvent.clientX, y: moveEvent.clientY });

      const clientY = moveEvent.clientY;
      let closestTop = 0;
      let found = false;

      for (let i = 0; i < rowRects.length; i++) {
        const rect = rowRects[i];
        const midY = rect.top + rect.height / 2;
        if (clientY < midY) {
          closestTop = rect.top;
          found = true;
          break;
        }
      }

      if (!found) {
        const lastRect = rowRects[rowRects.length - 1];
        closestTop = lastRect ? lastRect.bottom : 0;
      }

      const relativeTop = closestTop - containerRect.top + container.scrollTop;
      setDragIndicatorTop(relativeTop);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      button.releasePointerCapture(upEvent.pointerId);
      button.removeEventListener('pointermove', handlePointerMove);
      button.removeEventListener('pointerup', handlePointerUp);

      setDraggingIndex(null);
      setDragIndicatorVisible(false);

      const clientY = upEvent.clientY;
      let finalTargetIdx = 0;
      let found = false;

      for (let i = 0; i < rowRects.length; i++) {
        const rect = rowRects[i];
        const midY = rect.top + rect.height / 2;
        if (clientY < midY) {
          finalTargetIdx = i;
          found = true;
          break;
        }
      }
      if (!found) {
        finalTargetIdx = rowRects.length;
      }

      if (index !== finalTargetIdx && index + 1 !== finalTargetIdx) {
        setChapters(prev => {
          const nextChapters = prev.map(ch => ({
            ...ch,
            lessons: ch.lessons.map(patchLessonFn(lesson => {
              const updatedBlocks = [...lesson.blocks];
              const [movedBlock] = updatedBlocks.splice(index, 1);
              const insertIdx = finalTargetIdx > index ? finalTargetIdx - 1 : finalTargetIdx;
              updatedBlocks.splice(insertIdx, 0, movedBlock);
              return { ...lesson, blocks: updatedBlocks };
            }))
          }));
          pushHistoryState(nextChapters);

          const newIdx = finalTargetIdx > index ? finalTargetIdx - 1 : finalTargetIdx;
          setActiveBlockIndex(newIdx);
          focusBlock(newIdx);

          return nextChapters;
        });
      }
    };

    button.addEventListener('pointermove', handlePointerMove);
    button.addEventListener('pointerup', handlePointerUp);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    // Guard: if the event originates from an INPUT or TEXTAREA, let it pass through
    // completely unmodified. Those elements (e.g. EditableText) stop propagation
    // themselves, but a second line of defence here avoids any race conditions.
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    // Guard: never intercept during IME composition (Vietnamese, CJK, etc.)
    if (e.nativeEvent.isComposing) return;

    // 1. Check combinations using matchKeyboardShortcut
    const shortcut = matchKeyboardShortcut(e);
    if (shortcut) {
      e.preventDefault();
      switch (shortcut) {
        case 'bold':
          executeFormat('bold');
          break;
        case 'italic':
          executeFormat('italic');
          break;
        case 'underline':
          executeFormat('underline');
          break;
        case 'ordered-list':
          toggleBlockType('numbered-list');
          break;
        case 'bullet-list':
          toggleBlockType('bullet-list');
          break;
        case 'heading-1':
          toggleBlockType('heading', 1);
          break;
        case 'heading-2':
          toggleBlockType('heading', 2);
          break;
        case 'heading-3':
          toggleBlockType('heading', 3);
          break;
        case 'undo':
          handleUndo();
          break;
        case 'redo':
          handleRedo();
          break;
        case 'duplicate':
          duplicateBlock(index);
          break;
      }
      return;
    }

    // 2. Intercept Slash Menu keys
    if (showSlashMenu && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashMenuIndex(prev => (prev + 1) % filteredCommands.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashMenuIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectSlashCommand(filteredCommands[slashMenuIndex].type);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSlashMenu(false);
        return;
      }
    }

    // 3. Handle Enter (insert block below)
    if (e.key === 'Enter') {
      e.preventDefault();
      insertBlockBelow(index);
      return;
    }

    // 4. Handle Backspace — only intercept at cursor offset 0 for contentEditable blocks
    // INPUT/TEXTAREA elements stop propagation themselves via EditableText
    if (e.key === 'Backspace') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const selection = window.getSelection();
      const cursorOffset = selection?.focusOffset ?? 0;
      if (cursorOffset === 0) {
        // Block is non-empty at start: merge with previous (normal editor behaviour)
        e.preventDefault();
        handleBackspaceAtStart(index);
        return;
      }
    }

    // 5. Handle Delete key — only intercept for contentEditable blocks
    if (e.key === 'Delete') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isAtEnd = range.collapsed &&
          (range.startContainer === e.currentTarget ||
            (range.startContainer.nodeType === Node.TEXT_NODE &&
              range.startOffset === range.startContainer.textContent?.length)
          );
        if (isAtEnd) {
          e.preventDefault();
          handleDeleteAtEnd(index);
          return;
        }
      }
    }

    // 6. Handle Tab for Indent/Outdent
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        outdentBlock(index);
      } else {
        indentBlock(index);
      }
      return;
    }
  }, [
    showSlashMenu,
    filteredCommands,
    slashMenuIndex,
    currentBlocks,
    activeLessonId,
    executeFormat,
    toggleBlockType,
    handleUndo,
    handleRedo,
    duplicateBlock,
    handleSelectSlashCommand,
    deleteBlock,
    handleBackspaceAtStart,
    handleDeleteAtEnd,
    insertBlockBelow,
    indentBlock,
    outdentBlock,
    pushHistoryState
  ]);

  const handlePublish = async () => {
    await showAlert({
      type: 'success',
      title: 'Thành công',
      description: 'Đăng tải tài liệu thành công!'
    });
    setMode('dashboard');
  };

  const handlePasteSelection = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand('insertHTML', false, text);
    } catch {
      // Fallback
    }
  }, []);

  const handleAiSuggest = useCallback(() => {
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            const updated = [...lesson.blocks];
            if (activeLessonId === 'water') {
              updated[1] = {
                ...updated[1],
                text: updated[1].text + ' Nước đóng vai trò là một dung môi vạn năng.'
              };
            } else {
              updated[1] = {
                ...updated[1],
                text: updated[1].text + ' Hãy chú ý đến cấu trúc đặc biệt của mỗi nhóm đại phân tử.'
              };
            }
            return { ...lesson, blocks: updated };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [activeLessonId, pushHistoryState]);

  // Explorer handlers - toggleExpand is now handled directly by onToggleNodeExpand

  const handleCreateChapter = useCallback(() => {
    const newId = createChapter();
    setNewItems(prev => [...prev, newId]);
    setSelectedChapterId(newId);
    setEditingItemId(newId);
  }, [createChapter]);

  const handleDeleteChapter = useCallback(async (chapterId: string) => {
    const title = getNodeTitle(chapterId);
    if (!title) return;
    const ok = await showConfirm({
      type: 'danger',
      title: 'Xóa chương',
      description: `Bạn có chắc chắn muốn xóa chương "${title}" cùng toàn bộ bài học bên trong không?`,
    });
    if (!ok) return;

    const deletedIds = getDeletedIds(chapterId);
    const nextChapters = deleteNode(chapterId);
    pushHistoryState(nextChapters);

    if (deletedIds.includes(activeLessonId)) {
      setActiveLessonId(findFirstLessonId(nextChapters));
      setActiveBlockIndex(0);
    }
  }, [activeLessonId, deleteNode, getDeletedIds, getNodeTitle, pushHistoryState, showConfirm]);

  const handleCreateLesson = useCallback(async (chapterId: string, title = 'Bài học chưa đặt tên', isFolder = false) => {
    if (!chapterId) {
      await showAlert({
        type: 'warning',
        title: 'Thông báo',
        description: 'Vui lòng chọn một Chương trước.'
      });
      return;
    }

    const newId = createLesson(chapterId, title, isFolder);
    if (!newId) return;
    setNewItems(prev => [...prev, newId]);
    setEditingItemId(newId);
    setActiveLessonId(newId);
    setActiveBlockIndex(0);
  }, [createLesson, showAlert]);

  const handleCreateSubLesson = useCallback(async (chapterId: string, lessonId: string) => {
    const newId = createSubLesson(lessonId);
    if (!newId) return;
    setNewItems(prev => [...prev, newId]);
    setEditingItemId(newId);
    setActiveLessonId(newId);
    setActiveBlockIndex(0);
  }, [createSubLesson]);

  const handleCreateDocumentInFolder = useCallback((folderId: string) => {
    const newId = createDocumentInFolder(folderId);
    if (!newId) return;
    setNewItems(prev => [...prev, newId]);
    setEditingItemId(newId);
    setActiveLessonId(newId);
    setActiveBlockIndex(0);
  }, [createDocumentInFolder]);

  const handleDeleteSubLesson = useCallback(async (lessonId: string, subLessonId: string) => {
    const ok = await showConfirm({
      type: 'danger',
      title: 'Xóa mục',
      description: 'Bạn có chắc chắn muốn xóa mục này không?',
    });
    if (!ok) return;
    const deletedIds = getDeletedIds(subLessonId);
    const nextChapters = deleteNode(subLessonId);
    pushHistoryState(nextChapters);
    if (deletedIds.includes(activeLessonId)) {
      setActiveLessonId(findFirstLessonId(nextChapters));
      setActiveBlockIndex(0);
    }
  }, [activeLessonId, deleteNode, getDeletedIds, pushHistoryState, showConfirm]);

  const handleDepthExceeded = useCallback(async () => {
    await showAlert({
      type: 'warning',
      title: 'Không thể tạo thêm',
      description: 'Đã đạt số cấp thư mục tối đa (3 cấp).',
    });
  }, [showAlert]);

  const handleDeleteLesson = useCallback(async (lessonId: string) => {
    const title = getNodeTitle(lessonId);
    if (!title) return;

    const ok = await showConfirm({
      type: 'danger',
      title: 'Xóa bài học',
      description: `Bạn có chắc chắn muốn xóa bài học "${title}" không?`,
    });
    if (!ok) return;

    const deletedIds = getDeletedIds(lessonId);
    const nextChapters = deleteNode(lessonId);
    pushHistoryState(nextChapters);

    if (deletedIds.includes(activeLessonId)) {
      setActiveLessonId(findFirstLessonId(nextChapters));
      setActiveBlockIndex(0);
    }
  }, [activeLessonId, deleteNode, getDeletedIds, getNodeTitle, pushHistoryState, showConfirm]);

  const handleSaveEdit = useCallback((id: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === '') {
      handleCancelEdit(id);
      return;
    }

    const nextChapters = renameNode(id, trimmedTitle);
    pushHistoryState(nextChapters);

    setEditingItemId(null);
    setNewItems(prev => prev.filter(x => x !== id));
  }, [pushHistoryState, renameNode]);

  const handleCancelEdit = useCallback((id: string) => {
    const isNew = newItems.includes(id);

    if (isNew) {
      const deletedIds = getDeletedIds(id);
      const nextChapters = deleteNode(id);
      if (deletedIds.includes(activeLessonId)) {
        setActiveLessonId(findFirstLessonId(nextChapters));
        setActiveBlockIndex(0);
      }
    }

    setEditingItemId(null);
    setNewItems(prev => prev.filter(x => x !== id));
  }, [activeLessonId, deleteNode, getDeletedIds, newItems]);

  const handleMoveLesson = useCallback((sourceLessonId: string, targetParentId: string, targetBeforeId?: string) => {
    const nextChapters = moveLesson(sourceLessonId, targetParentId, targetBeforeId);
    pushHistoryState(nextChapters);
  }, [moveLesson, pushHistoryState]);

  const handleChapterReorder = useCallback((sourceChapterId: string, targetChapterId: string) => {
    const nextChapters = reorderChapter(sourceChapterId, targetChapterId);
    pushHistoryState(nextChapters);
  }, [pushHistoryState, reorderChapter]);

  const handleLessonSelect = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveBlockIndex(0);
  }, []);

  const handleScrollWrapperClick = (e: React.MouseEvent) => {
    setShowSlashMenu(false);
    if (e.target === e.currentTarget) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) {
        (activeEl as HTMLElement).blur();
      }
      window.getSelection()?.removeAllRanges();
      setEditorMode('block');
      if (activeBlockId) {
        setSelectedBlockIds([activeBlockId]);
      } else {
        setSelectedBlockIds([]);
      }
    }
  };

  const handleBodyDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        e.stopPropagation();

        try {
          const uploadedUrl = await uploadImageFile(file);
          const nextChapters = chapters.map(ch => ({
            ...ch,
            lessons: ch.lessons.map(patchLessonFn(lesson => {
              if (lesson.id === activeLessonId) {
                const newBlock: DocBlock = {
                  id: generateBlockId(),
                  type: 'image',
                  text: '',
                  src: uploadedUrl,
                  caption: file.name,
                  align: 'center',
                  width: '100%'
                };

                const currentIdx = activeBlockIndex;
                const updatedBlocks = [
                  ...lesson.blocks.slice(0, currentIdx + 1),
                  newBlock,
                  ...lesson.blocks.slice(currentIdx + 1)
                ];
                return { ...lesson, blocks: updatedBlocks };
              }
              return lesson;
            }))
          }));

          pushHistoryState(nextChapters);
          setActiveBlockIndex(prev => prev + 1);
          focusBlock(activeBlockIndex + 1);
        } catch {
          // Ignore
        }
      }
    }
  }, [chapters, activeLessonId, activeBlockIndex, patchLessonFn, pushHistoryState]);

  const handleSelectOtherBlock = useCallback((type: 'timeline' | 'flow' | 'tabs' | 'compare' | 'diagram' | 'matching' | 'fillblank' | 'dragdrop' | 'sortorder') => {
    setShowOtherBlocksPopup(false);
    const nextChapters = chapters.map(ch => ({
        ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => {
        const newBlock = createDefaultBlock(type);
        return { ...lesson, blocks: [...lesson.blocks.slice(0, activeBlockIndex + 1), newBlock, ...lesson.blocks.slice(activeBlockIndex + 1)] };
      })),
    }));
    pushHistoryState(nextChapters);
  }, [activeBlockIndex, chapters, patchLessonFn, pushHistoryState]);

  const handleSideToolClick = useCallback((label: string) => {
    if (label === 'Khác') {
      setShowOtherBlocksPopup(true);
      return;
    }
    if (label === 'Bảng') {
      setTableInsertIndex(activeBlockIndex);
      setTableInsertMode('insert');
      setShowTableModal(true);
      return;
    }
    let targetType: DocBlock['type'] = 'paragraph';
    if (label === 'Ảnh') targetType = 'image';
    else if (label === 'Bảng') targetType = 'table';
    else if (label === 'Công thức') targetType = 'formula';
    else if (label === 'Quiz') targetType = 'quiz';
    else if (label === 'Flashcard') targetType = 'flashcard';
    else if (label === 'Mindmap') return;
    else if (label === 'Media') targetType = 'media';

    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(patchLessonFn(lesson => {
        const newBlock = createDefaultBlock(targetType);
        return { ...lesson, blocks: [...lesson.blocks.slice(0, activeBlockIndex + 1), newBlock, ...lesson.blocks.slice(activeBlockIndex + 1)] };
      }))
    }));

    pushHistoryState(nextChapters);
    setActiveBlockIndex(prev => prev + 1);
    focusBlock(activeBlockIndex + 1);
  }, [chapters, activeBlockIndex, patchLessonFn, pushHistoryState]);

  return (
    <BlockSelectionProvider
      blocks={currentBlocks}
      activeBlockId={activeBlockId}
      setActiveBlockId={setActiveBlockId}
      selectedBlockIds={selectedBlockIds}
      setSelectedBlockIds={setSelectedBlockIds}
      editorMode={editorMode}
      setEditorMode={setEditorMode}
      onDeleteBlocks={deleteBlocks}
      onDuplicateBlocks={duplicateBlocks}
      onPasteBlocks={pasteBlocks}
    >
      <FormattingStateProvider activeBlock={activeBlock} syncRef={syncFormattingRef}>
        <div className="fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-[#F8FAFC] text-text-primary font-sans animate-fadeIn">

          {/* ========================================== */}
          {/* TOP BAR                                    */}
          {/* ========================================== */}
          <header className="h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-3.5">
              <Tooltip content="Quay lại">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (metadata) {
                      setMode('document-setup');
                    } else {
                      setMode('dashboard');
                    }
                  }}
                  className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
                >
                  <ChevronLeft size={18} className="stroke-[2.5]" />
                </button>
              </Tooltip>
              <div>
                <h1 className="text-xs font-black text-[#1E293B] truncate max-w-sm sm:max-w-md">
                  {metadata?.name || ''}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-primary text-[8px] font-extrabold uppercase">
                    {metadata?.subject || ''}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-extrabold uppercase">
                    {metadata?.grade || ''}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 text-[8px] font-extrabold uppercase">
                    {metadata?.docType || ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Mode Tab List (Soạn thảo | Xem trước) */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-0.5 text-[10px] font-bold text-slate-500 select-none bg-slate-50/50">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPreview(false)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${!showPreview
                    ? 'bg-white text-primary shadow-sm font-black'
                    : 'hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
              >
                Soạn thảo
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPreview(true)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${showPreview
                    ? 'bg-white text-primary shadow-sm font-black'
                    : 'hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
              >
                Xem trước
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                Đã lưu 10:30:45
              </div>

              <div className="flex items-center gap-2">
                <Tooltip content="Lưu nháp">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={async () => {
                      await showAlert({
                        type: 'success',
                        title: 'Thành công',
                        description: 'Đã lưu nháp tài liệu thành công!'
                      });
                    }}
                    className="px-3 py-1.5 border border-slate-200 text-slate-655 hover:bg-slate-50 text-[10px] font-bold rounded-xl flex items-center gap-1 transition cursor-pointer"
                  >
                    <Save size={12} /> Lưu
                  </button>
                </Tooltip>
                <Tooltip content="Xuất bản tài liệu">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPublishModal(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover text-white text-[10px] font-black rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm shadow-indigo-100"
                  >
                    <Send size={12} /> Xuất bản
                  </button>
                </Tooltip>
              </div>
            </div>
          </header>

          {/* ========================================== */}
          {/* MAIN BODY LAYOUT (Left, Center, Right)    */}
          {/* ========================================== */}
          <div className="flex-1 flex overflow-hidden w-full">

            {/* 1. LEFT SIDEBAR */}
            <DocSidebar
              chapters={chapters}
              activeLessonId={activeLessonId}
              onLessonSelect={handleLessonSelect}
              expandedNodeIds={expandedNodeIds}
              onToggleNodeExpand={toggleExpand}
              selectedChapterId={selectedChapterId}
              onSelectChapter={setSelectedChapterId}
              selectedLessonId={selectedLessonId}
              onSelectLesson={setSelectedLessonId}
              editingItemId={editingItemId}
              onStartEditing={setEditingItemId}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onCreateChapter={handleCreateChapter}
              onCreateLesson={handleCreateLesson}
              onCreateSubLesson={handleCreateSubLesson}
              onCreateDocumentInFolder={handleCreateDocumentInFolder}
              onDeleteChapter={handleDeleteChapter}
              onDeleteLesson={handleDeleteLesson}
              onDeleteSubLesson={handleDeleteSubLesson}
              onMoveLesson={handleMoveLesson}
              onChapterReorder={handleChapterReorder}
              onDepthExceeded={handleDepthExceeded}
              metadata={metadata}
            />

            {/* 2. CENTER PANEL: Rich Editor Workspace */}
            <main className="flex-1 bg-white border-r border-slate-100 flex flex-col overflow-hidden">

              {/* Rich Editor Toolbar */}
              {canEditActiveLesson && (
                <DocToolbar
                  onAiSuggest={handleAiSuggest}
                  onBold={() => executeFormat('bold')}
                  onItalic={() => executeFormat('italic')}
                  onUnderline={() => executeFormat('underline')}
                  onStrikethrough={() => executeFormat('strikeThrough')}
                  onColorChange={handleColorChange}
                  onHighlightChange={handleHighlightChange}
                  onBlockTypeChange={toggleBlockType}
                  onAlignChange={toggleBlockAlign}
                  onIndent={() => indentBlock()}
                  onOutdent={() => outdentBlock()}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                  onFontSizeChange={applyFontSize}
                />
              )}

              {canEditActiveLesson ? (
                <>
                  {/* Editable Block Content List */}
                  <div
                    id="editor-blocks-container"
                    onKeyDown={(e) => handleKeyDown(e, activeBlockIndex)}
                    onClick={handleScrollWrapperClick}
                    onContextMenu={(e) => {
                      const sel = window.getSelection();
                      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
                        const container = e.currentTarget;
                        if (container.contains(sel.anchorNode)) {
                          e.preventDefault();
                          setSelectionMenuCoords({ x: e.clientX, y: e.clientY });
                          setShowSelectionMenu(true);
                        }
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={handleBodyDrop}
                    className="flex-1 p-8 overflow-auto space-y-4 select-text relative"
                  >
                    {currentBlocks.map((block, idx) => {
                  const alignClass = block.align === 'center'
                    ? 'text-center'
                    : block.align === 'right'
                      ? 'text-right'
                      : block.align === 'justify'
                        ? 'text-justify'
                        : 'text-left';

                  const listIndex = block.type === 'numbered-list' ? getNumberedIndex(currentBlocks, idx) : undefined;
                  const tableNumber = block.type === 'table' ? getTableNumber(currentBlocks, idx) : undefined;

                  return (
                    <MemoizedBlockRow
                      key={block.id}
                      block={block}
                      idx={idx}
                      alignClass={alignClass}
                      indent={block.indent || 0}
                      isActive={activeBlockIndex === idx}
                      listIndex={listIndex}
                      tableNumber={tableNumber}
                      setActiveBlockIndex={setActiveBlockIndex}
                      updateBlockText={updateBlockText}
                      handleKeyDown={handleKeyDown}
                      toggleTodoChecked={toggleTodoChecked}
                      onDeleteBlock={handleDeleteBlockWithConfirm}
                      onDeleteBlocks={deleteBlocks}
                      onDuplicateBlocks={duplicateBlocks}
                      onConvertBlock={convertBlockType}
                      onUpdateBlock={handleUpdateBlock}
                      onInsertAbove={insertBlockAbove}
                      onInsertBelow={insertBlockBelow}
                      onDragStart={handleBlockDragStart}
                      moveBlocks={moveBlocks}
                      onRegisterCellAlignHandler={(fn) => { tableCellAlignRef.current = fn; }}
                      liveTableResize={liveTableResize}
                      setLiveTableResize={setLiveTableResize}
                      liveTableActiveCell={liveTableActiveCell}
                      setLiveTableActiveCell={setLiveTableActiveCell}
                      applyBlockAlignment={applyBlockAlignment}
                    />
                  );
                    })}

                    {/* Visual insertion indicator for block dragging */}
                    <DragIndicator top={dragIndicatorTop} visible={dragIndicatorVisible} />

                    {/* Floating visual preview of the block being dragged */}
                    <BlockDragPreview
                      text={draggingIndex !== null ? (currentBlocks[draggingIndex]?.text || '') : ''}
                      type={draggingIndex !== null ? (currentBlocks[draggingIndex]?.type || '') : ''}
                      coords={dragPointerCoords}
                      visible={draggingIndex !== null}
                    />

                    {/* Presentation-only floating Slash Command Menu */}
                    <SlashMenu
                      isOpen={showSlashMenu}
                      commands={filteredCommands}
                      selectedIndex={slashMenuIndex}
                      coords={slashMenuCoords}
                      onSelect={handleSelectSlashCommand}
                      onClose={() => setShowSlashMenu(false)}
                    />

                    {/* Custom selection right click context menu */}
                    <SelectionContextMenu
                      isOpen={showSelectionMenu}
                      onClose={() => setShowSelectionMenu(false)}
                      coords={selectionMenuCoords}
                      onCopy={() => document.execCommand('copy')}
                      onCut={() => document.execCommand('cut')}
                      onPaste={handlePasteSelection}
                      onFormat={executeFormat}
                      onConvertBlock={(type, lvl) => convertBlockType(activeBlockIndex, type, lvl)}
                    />

                    {/* Custom table dimension creation modal */}
                    <TableInsertModal
                      isOpen={showTableModal}
                      onClose={() => {
                        setShowTableModal(false);
                        setTableInsertIndex(null);
                        setTableInsertMode(null);
                      }}
                      onConfirm={createTableWithDimensions}
                    />

                    {showOtherBlocksPopup && (
                      <OtherBlocksPopup
                        onClose={() => setShowOtherBlocksPopup(false)}
                        onSelectBlock={handleSelectOtherBlock}
                      />
                    )}
                  </div>

                  <div className="h-8 border-t border-slate-50 px-6 flex items-center text-[10px] text-slate-400 font-bold select-none bg-white">
                    Nhấn Enter để thêm dòng mới, Tab để thụt lề, Backspace để xóa/gộp dòng, "/" để mở menu block
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-white text-[11px] font-bold text-text-muted select-none">
                  Chọn một file để soạn thảo nội dung
                </div>
              )}

              <PublishModal
                isOpen={showPublishModal}
                onClose={() => setShowPublishModal(false)}
                activeLesson={activeLesson}
                onPublishConfirm={handlePublish}
              />
            </main>

            {/* 3. RIGHT SIDEBAR: Live Student Preview Simulator */}
            {showPreview && (
              <DocPreviewSimulator
                documentTree={chapters}
                currentDocumentId={activeLessonId}
                documentTitle={metadata ? `${metadata.subject} ${metadata.grade.replace(/Lop\s+/i, '').replace(/L\u1edbp\s+/i, '')}` : ''}
                liveTableResize={liveTableResize}
              />
            )}

            {/* 4. FAR-RIGHT NARROW TOOLBAR */}
            {canEditActiveLesson && (
              <aside className="w-16 bg-white border-l border-slate-100 flex flex-col items-center py-4 justify-between shrink-0 select-none overflow-y-auto">
                <div className="w-full space-y-4 flex flex-col items-center">
                  {[
                    { icon: <FileCheck2 size={16} />, label: 'Block' },
                    { icon: <Brain size={16} />, label: 'AI' },
                    { icon: <ImageIcon size={16} />, label: 'Ảnh' },
                    { icon: <TableIcon size={16} />, label: 'Bảng' },
                    { icon: <Activity size={16} />, label: 'Công thức' },
                    { icon: <HelpCircle size={16} />, label: 'Quiz' },
                    { icon: <Award size={16} />, label: 'Flashcard' },
                    { icon: <Video size={16} />, label: 'Media' },
                    { icon: <HelpCircle size={16} />, label: 'Khác' },
                  ].map((tool, i) => (
                    <Tooltip key={i} content={tool.label}>
                      <button
                        onClick={() => handleSideToolClick(tool.label)}
                        className="w-12 h-12 flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:bg-primary-light rounded-xl transition cursor-pointer select-none"
                      >
                        {tool.icon}
                        <span className="text-[7px] font-bold mt-1 text-slate-500">{tool.label}</span>
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </aside>
            )}

          </div>



        </div>
      </FormattingStateProvider>
    </BlockSelectionProvider>
  );
};

interface BlockRowProps {
  block: DocBlock;
  idx: number;
  alignClass: string;
  indent: number;
  isActive: boolean;
  listIndex?: string;
  setActiveBlockIndex: (i: number) => void;
  updateBlockText: (i: number, val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, i: number) => void;
  toggleTodoChecked: (i: number) => void;
  onDeleteBlock: (i: number) => void;
  onDeleteBlocks: (ids: string[]) => void;
  onDuplicateBlocks: (ids: string[]) => void;
  onConvertBlock: (index: number, type: DocBlock['type'], level?: 1 | 2 | 3) => void;
  onUpdateBlock: (index: number, updated: DocBlock, isDebounced?: boolean) => void;
  onInsertAbove: (i: number) => void;
  onInsertBelow: (i: number) => void;
  onDragStart: (e: React.PointerEvent<HTMLButtonElement>, i: number) => void;
  moveBlocks: (ids: string[], direction: 'up' | 'down') => void;
  tableNumber?: number;
  onRegisterCellAlignHandler: (fn: ((align: 'left' | 'center' | 'right' | 'justify') => void) | null) => void;
  liveTableResize: LiveTableResizeState | null;
  setLiveTableResize: (state: LiveTableResizeState | null) => void;
  liveTableActiveCell: LiveTableActiveCell | null;
  setLiveTableActiveCell: (state: LiveTableActiveCell | null) => void;
  applyBlockAlignment?: (blockIds: string[], align: DocBlock['align']) => void;
}

const BlockRowComponent: React.FC<BlockRowProps> = ({
  block,
  idx,
  alignClass,
  indent,
  isActive,
  listIndex,
  setActiveBlockIndex,
  updateBlockText,
  handleKeyDown,
  toggleTodoChecked,
  onDeleteBlock,
  onDeleteBlocks,
  onDuplicateBlocks,
  onConvertBlock,
  onUpdateBlock,
  onInsertAbove,
  onInsertBelow,
  onDragStart,
  moveBlocks,
  tableNumber,
  onRegisterCellAlignHandler,
  liveTableResize,
  setLiveTableResize,
  liveTableActiveCell,
  setLiveTableActiveCell,
  applyBlockAlignment,
}) => {
  const indentStyle = { paddingLeft: `${indent * 24}px` };

  const handleKeyDownLocal = (e: React.KeyboardEvent<HTMLDivElement>) => {
    handleKeyDown(e, idx);
  };

  return (
    <div style={indentStyle} className="w-full block-row-item">
      <BlockWrapper
        block={block}
        idx={idx}
        onDeleteBlocks={onDeleteBlocks}
        onDuplicateBlocks={onDuplicateBlocks}
        onConvertBlock={onConvertBlock}
        onInsertAbove={onInsertAbove}
        onInsertBelow={onInsertBelow}
        moveBlocks={moveBlocks}
        onDragStart={onDragStart}
        applyBlockAlignment={applyBlockAlignment}
      >
        <BlockRenderer
          block={block}
          idx={idx}
          isActive={isActive}
          alignClass={alignClass}
          listIndex={listIndex}
          setActiveBlockIndex={setActiveBlockIndex}
          updateBlockText={updateBlockText}
          handleKeyDown={handleKeyDownLocal}
          toggleTodoChecked={toggleTodoChecked}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          tableNumber={tableNumber}
          onRegisterCellAlignHandler={onRegisterCellAlignHandler}
          liveTableResize={liveTableResize}
          setLiveTableResize={setLiveTableResize}
          liveTableActiveCell={liveTableActiveCell}
          setLiveTableActiveCell={setLiveTableActiveCell}
        />
      </BlockWrapper>
    </div>
  );
};

const MemoizedBlockRow = React.memo(BlockRowComponent);

// ==========================================
// DATABASE ADAPTERS FOR SUPABASE
// ==========================================

export const transformDbToClientState = (
  dbChapters: DbChapter[],
  dbLessons: DbLesson[],
  dbBlocks: DbBlock[]
): Chapter[] => {
  // Sắp xếp các mảng phẳng theo thuộc tính order để đảm bảo tính nhất quán của dữ liệu
  const sortedDbChapters = [...dbChapters].sort((a, b) => a.order - b.order);
  const sortedDbLessons = [...dbLessons].sort((a, b) => a.order - b.order);
  const sortedDbBlocks = [...dbBlocks].sort((a, b) => a.order - b.order);

  // Group blocks theo lesson_id
  const blocksByLesson: Record<string, DocBlock[]> = {};
  sortedDbBlocks.forEach((dbBlock) => {
    if (!blocksByLesson[dbBlock.lesson_id]) {
      blocksByLesson[dbBlock.lesson_id] = [];
    }
    // Bung content ra ngoài để tương thích ngược với client,
    // đồng thời giữ content lồng.
    const clientBlock: DocBlock = {
      id: dbBlock.id,
      type: dbBlock.type as DocBlock['type'],
      order: dbBlock.order,
      content: dbBlock.content,
      ...dbBlock.content,
    } as unknown as DocBlock;
    
    blocksByLesson[dbBlock.lesson_id].push(clientBlock);
  });

  // Dựng các bài học đệ quy
  const buildLessonTree = (lesson: DbLesson): Lesson => {
    const subDbLessons = sortedDbLessons.filter((l) => l.parent_lesson_id === lesson.id);
    const subLessons = subDbLessons.map(buildLessonTree);

    return {
      id: lesson.id,
      title: lesson.title,
      isFolder: lesson.is_folder,
      blocks: blocksByLesson[lesson.id] || [],
      ...(subLessons.length > 0 ? { subLessons } : {}),
    };
  };

  // Ánh xạ lesson vào chapter
  return sortedDbChapters.map((ch) => {
    const chapterLessons = sortedDbLessons
      .filter((l) => l.chapter_id === ch.id && l.parent_lesson_id === null)
      .map(buildLessonTree);

    return {
      id: ch.id,
      title: ch.title,
      lessons: chapterLessons,
    };
  });
};

export const transformClientToDbPayload = (
  lessonId: string,
  clientBlocks: DocBlock[]
): DbBlock[] => {
  return clientBlocks.map((block, idx) => {
    // Tách các trường meta
    const { id, type, order, content, ...specificProperties } = block;

    // Gom các trường phẳng đặc thù vào content
    const mergedContent = {
      ...(content || {}),
      ...specificProperties,
    };

    return {
      id,
      lesson_id: lessonId,
      type,
      order: idx,
      content: mergedContent,
    };
  });
};
