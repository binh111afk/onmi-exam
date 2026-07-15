import React, { useState, useCallback } from 'react';
import type { Chapter, Lesson, DocBlock, LiveTableResizeState, LiveTableActiveCell } from '../../../../types/doc-editor';
import { generateBlockId } from '../blocks/BlockFactory';

export const useEditorTableOperations = ({
  chapters,
  setChapters,
  activeLessonId,
  activeBlockIndex,
  patchLessonFn,
  pushHistoryState,
  setActiveBlockIndex,
  focusBlock,
}: {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  activeLessonId: string;
  activeBlockIndex: number;
  patchLessonFn: (lessonMapper: (lesson: Lesson) => Lesson) => (lesson: Lesson) => Lesson;
  pushHistoryState: (newChapters: Chapter[], isDebounced?: boolean, activeIndexOverride?: number) => void;
  setActiveBlockIndex: (index: number | ((prev: number) => number)) => void;
  focusBlock: (index: number) => void;
}) => {
  const [liveTableResize, setLiveTableResize] = useState<LiveTableResizeState | null>(null);
  const [liveTableActiveCell, setLiveTableActiveCell] = useState<LiveTableActiveCell | null>(null);

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableInsertIndex, setTableInsertIndex] = useState<number | null>(null);
  const [tableInsertMode, setTableInsertMode] = useState<'replace' | 'insert' | null>(null);

  const createTableWithDimensions = useCallback((rowsCount: number, colsCount: number, hasHeaderRow: boolean, hasHeaderCol: boolean) => {
    const targetIndex = tableInsertIndex !== null ? tableInsertIndex : activeBlockIndex;
    const tableRows = Array.from({ length: rowsCount }, () => Array(colsCount).fill(''));
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

    const nextIdx = tableInsertMode === 'insert' ? targetIndex + 1 : targetIndex;
    pushHistoryState(nextChapters, false, nextIdx);
    setChapters(nextChapters);

    setActiveBlockIndex(nextIdx);
    focusBlock(nextIdx);

    setShowTableModal(false);
    setTableInsertIndex(null);
    setTableInsertMode(null);
  }, [tableInsertIndex, tableInsertMode, activeBlockIndex, chapters, activeLessonId, patchLessonFn, pushHistoryState, setChapters, setActiveBlockIndex, focusBlock]);

  return {
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
  };
};
