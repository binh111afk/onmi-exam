import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chapter, Lesson } from '../../../../types/doc-editor';

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

export const useEditorHistory = ({
  chapters,
  setChapters,
  activeLessonId,
  findLessonById,
  initialChaptersData,
}: {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  activeLessonId: string;
  findLessonById: (lessonId: string, chaptersList?: Chapter[]) => Lesson | undefined;
  initialChaptersData?: Chapter[];
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyIndexRef = useRef(-1);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingHistoryEntryRef = useRef<HistoryEntry | null>(null);
  const pendingCaretRestoreRef = useRef<{ index: number; offset: number } | null>(null);

  // Initialize history
  useEffect(() => {
    const initialHistory = [{
      chapters: initialChaptersData || [],
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

  const commitHistoryEntry = useCallback((entry: HistoryEntry) => {
    const nextHistory = [...historyRef.current.slice(0, historyIndexRef.current + 1), entry];
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setHistory(nextHistory);
    setHistoryIndex(historyIndexRef.current);
  }, []);

  const pushHistoryState = useCallback((newChapters: Chapter[], isDebounced = false, activeIndexOverride?: number) => {
    setChapters(newChapters);

    let caretOffset = 0;
    if (activeIndexOverride !== undefined) {
      const activeEl = document.getElementById(`block-editor-${activeIndexOverride}`);
      if (activeEl) {
        try {
          caretOffset = getCaretOffset(activeEl);
        } catch (err) { }
      }
    }

    const newEntry: HistoryEntry = {
      chapters: newChapters,
      activeIndex: activeIndexOverride ?? 0,
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
  }, [commitHistoryEntry, setChapters]);

  const handleUndo = useCallback((syncBlockCommandState: (nextActiveId: string | null, nextSelectedIds?: string[]) => void) => {
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
  }, [activeLessonId, commitHistoryEntry, findLessonById, setChapters]);

  const handleRedo = useCallback((syncBlockCommandState: (nextActiveId: string | null, nextSelectedIds?: string[]) => void) => {
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
  }, [activeLessonId, findLessonById, setChapters]);

  const resetHistory = useCallback((newChapters: Chapter[]) => {
    const restoredHistory = [{
      chapters: newChapters,
      activeIndex: 0,
      caretOffset: 0
    }];
    historyRef.current = restoredHistory;
    historyIndexRef.current = 0;
    setHistory(restoredHistory);
    setHistoryIndex(0);
  }, []);

  return {
    history,
    historyIndex,
    pushHistoryState,
    handleUndo,
    handleRedo,
    resetHistory,
  };
};
