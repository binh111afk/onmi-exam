import React, { useState, useCallback } from 'react';
import type { Chapter, Lesson } from '../../../../types/doc-editor';

export const useEditorDragAndDrop = ({
  chapters,
  setChapters,
  patchLessonFn,
  pushHistoryState,
  setActiveBlockIndex,
  focusBlock,
}: {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  patchLessonFn: (lessonMapper: (lesson: Lesson) => Lesson) => (lesson: Lesson) => Lesson;
  pushHistoryState: (newChapters: Chapter[], isDebounced?: boolean, activeIndexOverride?: number) => void;
  setActiveBlockIndex: (index: number) => void;
  focusBlock: (index: number) => void;
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragPointerCoords, setDragPointerCoords] = useState({ x: 0, y: 0 });
  const [dragIndicatorTop, setDragIndicatorTop] = useState(0);
  const [dragIndicatorVisible, setDragIndicatorVisible] = useState(false);

  const handleBlockDragStart = useCallback((e: React.PointerEvent<HTMLButtonElement>, index: number) => {
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
        const nextChapters = chapters.map(ch => ({
          ...ch,
          lessons: ch.lessons.map(patchLessonFn(lesson => {
            const updatedBlocks = [...lesson.blocks];
            const [movedBlock] = updatedBlocks.splice(index, 1);
            const insertIdx = finalTargetIdx > index ? finalTargetIdx - 1 : finalTargetIdx;
            updatedBlocks.splice(insertIdx, 0, movedBlock);
            return { ...lesson, blocks: updatedBlocks };
          }))
        }));

        const newIdx = finalTargetIdx > index ? finalTargetIdx - 1 : finalTargetIdx;
        pushHistoryState(nextChapters, false, newIdx);
        setChapters(nextChapters);
        setActiveBlockIndex(newIdx);
        focusBlock(newIdx);
      }
    };

    button.addEventListener('pointermove', handlePointerMove);
    button.addEventListener('pointerup', handlePointerUp);
  }, [chapters, patchLessonFn, pushHistoryState, setChapters, setActiveBlockIndex, focusBlock]);

  return {
    draggingIndex,
    dragPointerCoords,
    dragIndicatorTop,
    dragIndicatorVisible,
    handleBlockDragStart,
  };
};
