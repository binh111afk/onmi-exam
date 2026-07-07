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
  FolderOpen,
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
import type { Chapter, Lesson, DocBlock, LiveTableResizeState, LiveTableActiveCell } from '../../../types/doc-editor';
import { FormattingStateProvider } from './FormattingStateProvider';

// Sprint 5 Additions
import { BLOCK_COMMANDS } from './CommandRegistry';
import { SlashMenu } from './SlashMenu';
import { SelectionContextMenu } from './SelectionContextMenu';
import { TableInsertModal } from './TableInsertModal';
import { DragIndicator } from './DragIndicator';
import { BlockDragPreview } from './BlockDragPreview';
import { matchKeyboardShortcut } from './KeyboardShortcutManager';

interface DocEditorWorkspaceProps {
  setMode: (mode: 'dashboard' | 'editor' | 'upload' | 'exam-editor') => void;
}

const initialChapters: Chapter[] = [
  {
    id: 'ch1',
    title: 'Chương I. Thành phần hóa học của tế bào',
    isExpanded: true,
    lessons: [
      {
        id: 'water',
        title: '1. Nguyên tố hóa & Nước',
        blocks: [
          {
            id: 'w1',
            type: 'heading',
            level: 1,
            text: '1. Nguyên tố hóa học và Nước',
            align: 'left',
            indent: 0
          },
          {
            id: 'w2',
            type: 'paragraph',
            text: 'Có khoảng 25 nguyên tố cần thiết cấu tạo nên cơ thể sống. Đại lượng carbon là nguyên tố cốt lõi vì cấu tạo liên kết hóa học đa dạng. Nước đóng vai trò dung môi hòa tan, môi trường phản ứng sinh hóa, giúp điều hòa nhiệt độ tế bào.',
            align: 'left',
            indent: 0
          },
          {
            id: 'w3',
            type: 'callout',
            text: 'Chiếm khoảng 70 - 90% khối lượng tế bào, tham gia vào hầu hết các quá trình sinh học quan trọng.',
            align: 'left',
            indent: 0
          }
        ]
      },
      {
        id: 'macromolecules',
        title: '2. Các đại phân tử hữu cơ',
        blocks: [
          {
            id: 'm1',
            type: 'heading',
            level: 1,
            text: '2. Các đại phân tử hữu cơ',
            align: 'left',
            indent: 0
          },
          {
            id: 'm2',
            type: 'paragraph',
            text: 'Tế bào gồm 4 nhóm đại phân tử chính:',
            align: 'left',
            indent: 0
          },
          {
            id: 'm3',
            type: 'bullet-list',
            text: 'Carbohydrate (Đường): cung cấp năng lượng và cấu trúc thành tế bào.',
            align: 'left',
            indent: 0
          },
          {
            id: 'm4',
            type: 'bullet-list',
            text: 'Lipid (Chất béo): dự trữ năng lượng dài hạn, cấu tạo màng sinh chất.',
            align: 'left',
            indent: 0
          },
          {
            id: 'm5',
            type: 'bullet-list',
            text: 'Protein: đảm nhiệm mọi chức năng sống (xúc tác, vận chuyển, cấu trúc).',
            align: 'left',
            indent: 0
          },
          {
            id: 'm6',
            type: 'bullet-list',
            text: 'Axit nucleic (DNA, RNA): lưu trữ và truyền đạt thông tin di truyền.',
            align: 'left',
            indent: 0
          }
        ]
      },
      {
        id: 'enzyme',
        title: '3. Enzyme và vai trò',
        blocks: [
          {
            id: 'e1',
            type: 'heading',
            level: 1,
            text: '3. Enzyme và vai trò',
            align: 'left',
            indent: 0
          },
          {
            id: 'e2',
            type: 'paragraph',
            text: 'Enzyme là chất xúc tác sinh học có bản chất là protein, giúp tăng tốc độ các phản ứng hóa học trong tế bào mà không bị biến đổi sau phản ứng.',
            align: 'left',
            indent: 0
          }
        ]
      },
      {
        id: 'vitamin',
        title: '4. Vitamin và khoáng chất',
        blocks: [
          {
            id: 'v1',
            type: 'heading',
            level: 1,
            text: '4. Vitamin và khoáng chất',
            align: 'left',
            indent: 0
          },
          {
            id: 'v2',
            type: 'paragraph',
            text: 'Vitamin và khoáng chất là các chất dinh dưỡng vi lượng thiết yếu, tham gia cấu tạo tế bào và xúc tác hoạt động sống.',
            align: 'left',
            indent: 0
          }
        ]
      }
    ]
  },
  {
    id: 'ch2',
    title: 'Chương II. Cấu trúc tế bào',
    isExpanded: false,
    lessons: []
  },
  {
    id: 'ch3',
    title: 'Chương III. Chuyển hóa vật chất...',
    isExpanded: false,
    lessons: []
  },
  {
    id: 'ch4',
    title: 'Chương IV. Sinh trưởng và phát...',
    isExpanded: false,
    lessons: []
  }
];

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

export const DocEditorWorkspace: React.FC<DocEditorWorkspaceProps> = ({ setMode }) => {
  const { showAlert, showConfirm } = useAlert();
  const [showPreview, setShowPreview] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string>('water');
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);

  const findLessonById = useCallback((id: string, list: Chapter[] = chapters): Lesson | null => {
    for (const ch of list) {
      const lesson = ch.lessons.find(l => l.id === id);
      if (lesson) return lesson;
    }
    return null;
  }, [chapters]);

  const activeLesson = useMemo(() => findLessonById(activeLessonId), [activeLessonId, findLessonById]);
  const currentBlocks = useMemo(() => activeLesson ? activeLesson.blocks : [], [activeLesson]);

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

  // Selection states
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>('ch1');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItems, setNewItems] = useState<string[]>([]);

  // History tracking with structure
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const [tableInsertIndex, setTableInsertIndex] = useState<number | null>(null);
  const [tableInsertMode, setTableInsertMode] = useState<'replace' | 'insert' | null>(null);



  // Pending selection/caret recovery
  const pendingCaretRestoreRef = useRef<{ index: number; offset: number } | null>(null);

  // Initialize history
  useEffect(() => {
    setHistory([{
      chapters: initialChapters,
      activeIndex: 0,
      caretOffset: 0
    }]);
    setHistoryIndex(0);
  }, []);


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

  const pushHistoryState = useCallback((newChapters: Chapter[], isDebounced = false, activeIndexOverride = activeBlockIndex) => {
    setChapters(newChapters);

    let caretOffset = 0;
    const activeEl = document.getElementById(`block-editor-${activeIndexOverride}`);
    if (activeEl) {
      try {
        caretOffset = getCaretOffset(activeEl);
      } catch (err) {}
    }

    const newEntry: HistoryEntry = {
      chapters: newChapters,
      activeIndex: activeIndexOverride,
      caretOffset
    };

    if (isDebounced) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setHistory(prev => {
          const nextHist = prev.slice(0, historyIndex + 1);
          return [...nextHist, newEntry];
        });
        setHistoryIndex(prev => prev + 1);
      }, 400);
    } else {
      setHistory(prev => {
        const nextHist = prev.slice(0, historyIndex + 1);
        return [...nextHist, newEntry];
      });
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, activeBlockIndex]);

  const createTableWithDimensions = useCallback((rowsCount: number, colsCount: number, hasHeaderRow: boolean, hasHeaderCol: boolean) => {
    const targetIndex = tableInsertIndex !== null ? tableInsertIndex : activeBlockIndex;
    const tableRows = Array.from({ length: rowsCount }, () => Array(colsCount).fill(''));

    // Set initial custom column widths and row heights
    const columnWidths = Array(colsCount).fill(120);
    const rowHeights = Array(rowsCount).fill(36);

    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(lesson => {
        if (lesson.id === activeLessonId) {
          if (tableInsertMode === 'insert') {
            const newBlock: DocBlock = {
              id: `b-${Math.random().toString(36).substring(2, 9)}`,
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
      })
    }));

    pushHistoryState(nextChapters);
    setChapters(nextChapters);

    const nextIdx = tableInsertMode === 'insert' ? targetIndex + 1 : targetIndex;
    setActiveBlockIndex(nextIdx);
    focusBlock(nextIdx);

    setShowTableModal(false);
    setTableInsertIndex(null);
    setTableInsertMode(null);
  }, [tableInsertIndex, tableInsertMode, activeBlockIndex, chapters, activeLessonId, pushHistoryState]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      const entry = history[nextIndex];
      const restoredBlocks = findLessonById(activeLessonId, entry.chapters)?.blocks ?? [];
      const nextActiveId = restoredBlocks[entry.activeIndex]?.id ?? restoredBlocks[0]?.id ?? null;
      setHistoryIndex(nextIndex);
      pendingCaretRestoreRef.current = {
        index: entry.activeIndex,
        offset: entry.caretOffset
      };
      setChapters(entry.chapters);
      syncBlockCommandState(nextActiveId);
    }
  }, [activeLessonId, findLessonById, history, historyIndex, syncBlockCommandState]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const entry = history[nextIndex];
      const restoredBlocks = findLessonById(activeLessonId, entry.chapters)?.blocks ?? [];
      const nextActiveId = restoredBlocks[entry.activeIndex]?.id ?? restoredBlocks[0]?.id ?? null;
      setHistoryIndex(nextIndex);
      pendingCaretRestoreRef.current = {
        index: entry.activeIndex,
        offset: entry.caretOffset
      };
      setChapters(entry.chapters);
      syncBlockCommandState(nextActiveId);
    }
  }, [activeLessonId, findLessonById, history, historyIndex, syncBlockCommandState]);

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
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map((b, idx) =>
                idx === index ? { ...b, text: cleanHtml } : b
              )
            };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters, true);
      return nextChapters;
    });
  }, [activeLessonId, pushHistoryState]);

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
    document.execCommand('fontSize', false, '7');

    const activeEl = document.getElementById(`block-editor-${activeBlockIndex}`);
    if (activeEl) {
      const fonts = activeEl.querySelectorAll('font[size="7"]');
      fonts.forEach(font => {
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
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
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map((b, idx) => {
                if (idx === activeBlockIndex) {
                  const isSameType = b.type === type && (type !== 'heading' || b.level === level);
                  const targetType = isSameType ? 'paragraph' : type;
                  const targetLevel = isSameType ? undefined : level;
                  return createDefaultBlock(targetType, b.id, b.align, b.indent, targetLevel);
                }
                return b;
              })
            };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
    syncFormattingRef.current?.();
  }, [activeLessonId, activeBlockIndex, pushHistoryState]);

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
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map(b =>
                validIds.includes(b.id) ? { ...b, align } : b
              )
            };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex === -1 ? activeBlockIndex : nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId, validIds);
  }, [activeBlockId, activeBlockIndex, activeLessonId, currentBlocks, pushHistoryState, syncBlockCommandState]);

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
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map((b, idx) =>
                idx === index ? { ...b, indent: Math.min(5, (b.indent || 0) + 1) } : b
              )
            };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [activeLessonId, activeBlockIndex, pushHistoryState]);

  const outdentBlock = useCallback((index = activeBlockIndex) => {
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map((b, idx) =>
                idx === index ? { ...b, indent: Math.max(0, (b.indent || 0) - 1) } : b
              )
            };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [activeLessonId, activeBlockIndex, pushHistoryState]);

  const toggleTodoChecked = useCallback((index: number) => {
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map((b, idx) =>
                idx === index ? { ...b, checked: !b.checked } : b
              )
            };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [activeLessonId, pushHistoryState]);

  const focusBlock = (index: number) => {
    setTimeout(() => {
      const el = document.getElementById(`block-editor-${index}`);
      if (el) {
        el.focus();
      }
    }, 50);
  };

  const deleteBlock = useCallback((index: number) => {
    setChapters(prev => {
      let nextPages = prev;
      for (const ch of prev) {
        const lesson = ch.lessons.find(l => l.id === activeLessonId);
        if (lesson) {
          if (lesson.blocks.length <= 1) return prev;
          nextPages = prev.map(c => ({
            ...c,
            lessons: c.lessons.map(l => {
              if (l.id === activeLessonId) {
                return {
                  ...l,
                  blocks: l.blocks.filter((_, idx) => idx !== index)
                };
              }
              return l;
            })
          }));
          break;
        }
      }
      pushHistoryState(nextPages);
      const targetIdx = Math.max(0, index - 1);
      setActiveBlockIndex(targetIdx);
      focusBlock(targetIdx);
      return nextPages;
    });
  }, [activeLessonId, pushHistoryState]);

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
                    ...l.blocks.slice(0, index + 1),
                    newBlock,
                    ...l.blocks.slice(index + 1)
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
      setActiveBlockIndex(index + 1);
      focusBlock(index + 1);
      return nextPages;
    });
  }, [activeLessonId, pushHistoryState]);

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
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return { ...lesson, blocks: finalBlocks };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId);
  }, [activeLessonId, currentBlocks, pushHistoryState, syncBlockCommandState]);

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
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return { ...lesson, blocks: nextBlocks };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex === -1 ? activeBlockIndex : nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId ?? null, nextSelectedIds);
  }, [activeBlockId, activeBlockIndex, activeLessonId, currentBlocks, pushHistoryState, syncBlockCommandState]);

  const pasteBlocks = useCallback((pasted: DocBlock[], targetBlockId: string | null) => {
    if (pasted.length === 0) return;
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
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
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [activeLessonId, pushHistoryState]);

  const duplicateBlock = useCallback((index: number) => {
    setChapters(prev => {
      let nextPages = prev;
      for (const ch of prev) {
        const lesson = ch.lessons.find(l => l.id === activeLessonId);
        if (lesson) {
          const currentBlock = lesson.blocks[index];
          const newBlock: DocBlock = {
            ...currentBlock,
            id: generateBlockId(),
          };
          nextPages = prev.map(c => ({
            ...c,
            lessons: c.lessons.map(l => {
              if (l.id === activeLessonId) {
                return {
                  ...l,
                  blocks: [
                    ...l.blocks.slice(0, index + 1),
                    newBlock,
                    ...l.blocks.slice(index + 1)
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
      return nextPages;
    });
  }, [activeLessonId, pushHistoryState]);

  const convertBlockType = useCallback((index: number, type: DocBlock['type'], level?: 1 | 2 | 3) => {
    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return {
              ...lesson,
              blocks: lesson.blocks.map((b, idx) => {
                if (idx === index) {
                  return createDefaultBlock(type, b.id, b.align, b.indent, level, b.text);
                }
                return b;
              })
            };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [activeLessonId, pushHistoryState]);

  const handleUpdateBlock = useCallback((index: number, updatedBlock: DocBlock, isDebounced = false) => {
    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(lesson => {
        if (lesson.id === activeLessonId) {
          return {
            ...lesson,
            blocks: lesson.blocks.map((b, idx) =>
              idx === index ? updatedBlock : b
            )
          };
        }
        return lesson;
      })
    }));
    pushHistoryState(nextChapters, isDebounced);
  }, [chapters, activeLessonId, pushHistoryState]);

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
        lessons: ch.lessons.map(lesson => {
          if (lesson.id === activeLessonId) {
            return { ...lesson, blocks: nextBlocks };
          }
          return lesson;
        })
      }));
      pushHistoryState(nextChapters, false, nextActiveIndex === -1 ? activeBlockIndex : nextActiveIndex);
      return nextChapters;
    });
    syncBlockCommandState(nextActiveId, validIds);
    focusBlock(nextActiveIndex);
  }, [activeBlockId, activeBlockIndex, activeLessonId, currentBlocks, pushHistoryState, syncBlockCommandState]);
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

    if (cmdType === 'table') {
      setTableInsertIndex(activeBlockIndex);
      setTableInsertMode('replace');
      setShowTableModal(true);
      return;
    }

    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(lesson => {
        if (lesson.id === activeLessonId) {
          return {
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
          };
        }
        return lesson;
      })
    }));

    pendingCaretRestoreRef.current = {
      index: activeBlockIndex,
      offset: 0
    };
    pushHistoryState(nextChapters);
  }, [chapters, activeLessonId, activeBlockIndex, pushHistoryState]);

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
            lessons: ch.lessons.map(lesson => {
              if (lesson.id === activeLessonId) {
                const updatedBlocks = [...lesson.blocks];
                const [movedBlock] = updatedBlocks.splice(index, 1);
                const insertIdx = finalTargetIdx > index ? finalTargetIdx - 1 : finalTargetIdx;
                updatedBlocks.splice(insertIdx, 0, movedBlock);
                return { ...lesson, blocks: updatedBlocks };
              }
              return lesson;
            })
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

    // 4. Handle Backspace at start of block
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      const cursorOffset = selection?.focusOffset ?? 0;

      if (cursorOffset === 0) {
        const currentBlock = currentBlocks[index];
        if (currentBlock) {
          const isEmpty = currentBlock.text.replace(/<[^>]*>/g, '').trim() === '';
          if (isEmpty) {
            e.preventDefault();
            deleteBlock(index);
            return;
          }
        }

        e.preventDefault();
        handleBackspaceAtStart(index);
        return;
      }
    }

    // 5. Handle Delete key
    if (e.key === 'Delete') {
      const currentBlock = currentBlocks[index];
      if (currentBlock) {
        const isEmpty = currentBlock.text.replace(/<[^>]*>/g, '').trim() === '';
        if (isEmpty) {
          e.preventDefault();
          setChapters(prev => {
            const nextChapters = prev.map(ch => ({
              ...ch,
              lessons: ch.lessons.map(l => {
                if (l.id === activeLessonId) {
                  return {
                    ...l,
                    blocks: l.blocks.filter((_, idx) => idx !== index)
                  };
                }
                return l;
              })
            }));

            const hasNext = index < currentBlocks.length - 1;
            const targetIdx = hasNext ? index : Math.max(0, index - 1);
            setActiveBlockIndex(targetIdx);
            focusBlock(targetIdx);

            pushHistoryState(nextChapters);
            return nextChapters;
          });
          return;
        }
      }

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

  // Explorer handlers
  const handleToggleChapterExpand = useCallback((chapterId: string) => {
    setChapters(prev => prev.map(ch =>
      ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch
    ));
  }, []);

  const handleCreateChapter = useCallback(() => {
    const newId = crypto.randomUUID();
    setNewItems(prev => [...prev, newId]);
    setChapters(prev => {
      const newCh: Chapter = {
        id: newId,
        title: 'Chương chưa đặt tên',
        isExpanded: true,
        lessons: []
      };
      return [...prev, newCh];
    });
    setSelectedChapterId(newId);
    setEditingItemId(newId);
  }, []);

  const handleDeleteChapter = useCallback(async (chapterId: string) => {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) return;
    const ok = await showConfirm({
      type: 'danger',
      title: 'Xóa chương',
      description: `Bạn có chắc chắn muốn xóa chương "${ch.title}" cùng toàn bộ bài học bên trong không?`,
    });
    if (!ok) return;

    setChapters(prev => {
      const nextChapters = prev.filter(c => c.id !== chapterId);
      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [chapters, showConfirm, pushHistoryState]);

  const handleCreateLesson = useCallback(async (chapterId: string) => {
    if (!chapterId) {
      await showAlert({
        type: 'warning',
        title: 'Thông báo',
        description: 'Vui lòng chọn một Chương trước.'
      });
      return;
    }

    const newId = crypto.randomUUID();
    setNewItems(prev => [...prev, newId]);
    setChapters(prev => {
      const newLesson: Lesson = {
        id: newId,
        title: 'Bài học chưa đặt tên',
        blocks: [
          createDefaultBlock('paragraph')
        ]
      };
      return prev.map(ch => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            isExpanded: true,
            lessons: [...ch.lessons, newLesson]
          };
        }
        return ch;
      });
    });
    setEditingItemId(newId);
    setActiveLessonId(newId);
    setActiveBlockIndex(0);
  }, [showAlert]);

  const handleDeleteLesson = useCallback(async (lessonId: string) => {
    let currentLesson: Lesson | null = null;
    for (const ch of chapters) {
      const l = ch.lessons.find(less => less.id === lessonId);
      if (l) {
        currentLesson = l;
        break;
      }
    }
    if (!currentLesson) return;

    const ok = await showConfirm({
      type: 'danger',
      title: 'Xóa bài học',
      description: `Bạn có chắc chắn muốn xóa bài học "${currentLesson.title}" không?`,
    });
    if (!ok) return;

    setChapters(prev => {
      const nextChapters = prev.map(ch => ({
        ...ch,
        lessons: ch.lessons.filter(l => l.id !== lessonId)
      }));
      pushHistoryState(nextChapters);

      if (activeLessonId === lessonId) {
        let firstAvailableLessonId = 'water';
        for (const ch of nextChapters) {
          if (ch.lessons.length > 0) {
            firstAvailableLessonId = ch.lessons[0].id;
            break;
          }
        }
        setActiveLessonId(firstAvailableLessonId);
        setActiveBlockIndex(0);
      }

      return nextChapters;
    });
  }, [activeLessonId, chapters, showConfirm, pushHistoryState]);

  const handleSaveEdit = useCallback((id: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === '') {
      handleCancelEdit(id);
      return;
    }

    setChapters(prev => {
      const nextChapters = prev.map(ch => {
        if (ch.id === id) {
          return { ...ch, title: trimmedTitle };
        }
        return {
          ...ch,
          lessons: ch.lessons.map(l =>
            l.id === id ? { ...l, title: trimmedTitle } : l
          )
        };
      });
      pushHistoryState(nextChapters);
      return nextChapters;
    });

    setEditingItemId(null);
    setNewItems(prev => prev.filter(x => x !== id));
  }, [pushHistoryState]);

  const handleCancelEdit = useCallback((id: string) => {
    const isNew = newItems.includes(id);

    if (isNew) {
      setChapters(prev => {
        const filteredChapters = prev.filter(ch => ch.id !== id);
        const finalChapters = filteredChapters.map(ch => ({
          ...ch,
          lessons: ch.lessons.filter(l => l.id !== id)
        }));

        if (activeLessonId === id) {
          let firstAvailableLessonId = 'water';
          for (const ch of finalChapters) {
            if (ch.lessons.length > 0) {
              firstAvailableLessonId = ch.lessons[0].id;
              break;
            }
          }
          setActiveLessonId(firstAvailableLessonId);
          setActiveBlockIndex(0);
        }

        return finalChapters;
      });
    }

    setEditingItemId(null);
    setNewItems(prev => prev.filter(x => x !== id));
  }, [newItems, activeLessonId]);

  const handleLessonDragDrop = useCallback((sourceLessonId: string, sourceChapterId: string, targetLessonId: string, targetChapterId: string) => {
    setChapters(prev => {
      let sourceLesson: Lesson | null = null;
      for (const ch of prev) {
        if (ch.id === sourceChapterId) {
          const l = ch.lessons.find(less => less.id === sourceLessonId);
          if (l) sourceLesson = l;
        }
      }
      if (!sourceLesson) return prev;

      const cleanedChapters = prev.map(ch => {
        if (ch.id === sourceChapterId) {
          return {
            ...ch,
            lessons: ch.lessons.filter(less => less.id !== sourceLessonId)
          };
        }
        return ch;
      });

      const finalChapters = cleanedChapters.map(ch => {
        if (ch.id === targetChapterId) {
          const targetIndex = ch.lessons.findIndex(less => less.id === targetLessonId);
          const updatedLessons = [...ch.lessons];
          if (targetIndex !== -1) {
            updatedLessons.splice(targetIndex, 0, sourceLesson!);
          } else {
            updatedLessons.push(sourceLesson!);
          }
          return {
            ...ch,
            lessons: updatedLessons
          };
        }
        return ch;
      });

      pushHistoryState(finalChapters);
      return finalChapters;
    });
  }, [pushHistoryState]);

  const handleChapterReorder = useCallback((sourceChapterId: string, targetChapterId: string) => {
    setChapters(prev => {
      const sourceIndex = prev.findIndex(c => c.id === sourceChapterId);
      const targetIndex = prev.findIndex(c => c.id === targetChapterId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const nextChapters = [...prev];
      const [movedChapter] = nextChapters.splice(sourceIndex, 1);
      nextChapters.splice(targetIndex, 0, movedChapter);

      pushHistoryState(nextChapters);
      return nextChapters;
    });
  }, [pushHistoryState]);

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
            lessons: ch.lessons.map(lesson => {
              if (lesson.id === activeLessonId) {
                const newBlock: DocBlock = {
                  id: `b-${Math.random().toString(36).substring(2, 9)}`,
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
            })
          }));

          pushHistoryState(nextChapters);
          setActiveBlockIndex(prev => prev + 1);
          focusBlock(activeBlockIndex + 1);
        } catch {
          // Ignore
        }
      }
    }
  }, [chapters, activeLessonId, activeBlockIndex, pushHistoryState]);

  const handleSideToolClick = useCallback((label: string) => {
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
    else if (label === 'Mindmap') targetType = 'mindmap';
    else if (label === 'Media') targetType = 'media';

    const nextChapters = chapters.map(ch => ({
      ...ch,
      lessons: ch.lessons.map(lesson => {
        if (lesson.id === activeLessonId) {
          const newBlock = createDefaultBlock(targetType);
          const currentIdx = activeBlockIndex;
          const updatedBlocks = [
            ...lesson.blocks.slice(0, currentIdx + 1),
            newBlock,
            ...lesson.blocks.slice(currentIdx + 1)
          ];
          return { ...lesson, blocks: updatedBlocks };
        }
        return lesson;
      })
    }));

    pushHistoryState(nextChapters);
    setActiveBlockIndex(prev => prev + 1);
    focusBlock(activeBlockIndex + 1);
  }, [chapters, activeLessonId, activeBlockIndex, pushHistoryState]);

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
        <div className="w-full flex flex-col h-screen bg-[#F8FAFC] text-text-primary overflow-hidden font-sans animate-fadeIn">

      {/* ========================================== */}
      {/* TOP BAR                                    */}
      {/* ========================================== */}
      <header className="h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3.5">
          <Tooltip content="Quay lại">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setMode('dashboard')}
              className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
            >
              <ChevronLeft size={18} className="stroke-[2.5]" />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-xs font-black text-[#1E293B] truncate max-w-sm sm:max-w-md">
              Tóm tắt lý thuyết Sinh học 10 học kỳ 2 - Đề cương ôn tập
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-purple-50 text-primary text-[8px] font-extrabold uppercase">Sinh học</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-extrabold uppercase">Lớp 10</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-50 text-slate-500 text-[8px] font-extrabold uppercase">Tài liệu lý thuyết</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[8px] font-extrabold uppercase">Nháp</span>
            </div>
          </div>
        </div>

        {/* Mode Tab List (Soạn thảo | Xem trước) */}
        <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-0.5 text-[10px] font-bold text-slate-500 select-none bg-slate-50/50">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              !showPreview
                ? 'bg-white text-primary shadow-sm font-black'
                : 'hover:text-slate-800 hover:bg-slate-100/50'
            }`}
          >
            Soạn thảo
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              showPreview
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
                onClick={handlePublish}
                className="px-3 py-1.5 bg-gradient-to-r from-primary to-[#8F85F3] hover:from-primary-hover text-white text-[10px] font-black rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm shadow-indigo-100"
              >
                <Send size={12} /> Publish
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
          onToggleChapterExpand={handleToggleChapterExpand}
          selectedChapterId={selectedChapterId}
          onSelectChapter={setSelectedChapterId}
          editingItemId={editingItemId}
          onStartEditing={setEditingItemId}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onCreateChapter={handleCreateChapter}
          onCreateLesson={handleCreateLesson}
          onDeleteChapter={handleDeleteChapter}
          onDeleteLesson={handleDeleteLesson}
          onLessonDragDrop={handleLessonDragDrop}
          onChapterReorder={handleChapterReorder}
        />

        {/* 2. CENTER PANEL: Rich Editor Workspace */}
        <main className="flex-1 bg-white border-r border-slate-100 flex flex-col overflow-hidden">

          {/* Rich Editor Toolbar */}
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
          </div>

          <div className="h-8 border-t border-slate-50 px-6 flex items-center text-[10px] text-slate-400 font-bold select-none bg-white">
            Nhấn Enter để thêm dòng mới, Tab để thụt lề, Backspace để xóa/gộp dòng, "/" để mở menu block
          </div>
        </main>

        {/* 3. RIGHT SIDEBAR: Live Student Preview Simulator */}
        {showPreview && (
          <DocPreviewSimulator
            lessonTitle={activeLesson ? activeLesson.title : ''}
            blocks={currentBlocks}
            liveTableResize={liveTableResize}
          />
        )}

        {/* 4. FAR-RIGHT NARROW TOOLBAR */}
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
              { icon: <FolderOpen size={16} />, label: 'Mindmap' },
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

      </div>

      {/* ========================================== */}
      {/* FOOTER STATUS BAR                          */}
      {/* ========================================== */}
      <footer className="h-8 bg-white border-t border-slate-100 px-4 flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-wide shrink-0 select-none">
        <div className="flex items-center gap-6">
          <span>Tổng số block: <strong>{currentBlocks.length}</strong></span>
          <span>Số chữ: <strong>{currentBlocks.reduce((acc, b) => acc + b.text.replace(/<[^>]*>/g, '').length, 0)}</strong></span>
          <span>Số công thức: <strong>0</strong></span>
          <span>Số hình ảnh: <strong>0</strong></span>
        </div>

        <div>Lần sửa cuối: 10:30 30/05/2024</div>

        <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
          Tự động lưu
        </div>
      </footer>

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
