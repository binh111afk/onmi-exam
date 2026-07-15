import React, { useCallback } from 'react';
import { useAlert } from '../../../common/Alert';
import type { Chapter, Lesson } from '../../../../types/doc-editor';

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

export const useEditorSidebarActions = ({
  documentTree,
  activeLessonId,
  setActiveLessonId,
  pushHistoryState,
  setChapters,
  newItems,
  setNewItems,
  setEditingItemId,
  setActiveBlockIndex,
}: {
  documentTree: {
    getNodeTitle: (id: string) => string | undefined;
    getDeletedIds: (id: string) => string[];
    deleteNode: (id: string) => Chapter[];
    createChapter: () => string;
    createLesson: (chapterId: string, title?: string, isFolder?: boolean) => string | null;
    createSubLesson: (lessonId: string) => string | null;
    createDocumentInFolder: (folderId: string) => string | null;
    renameNode: (id: string, title: string) => Chapter[];
    moveLesson: (sourceId: string, parentId: string, beforeId?: string) => Chapter[];
    reorderChapter: (sourceId: string, targetId: string) => Chapter[];
    setExpandedNodeIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    nodesMap: Record<string, any>;
  };
  activeLessonId: string;
  setActiveLessonId: (id: string) => void;
  pushHistoryState: (newChapters: Chapter[], isDebounced?: boolean, activeIndexOverride?: number) => void;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  newItems: string[];
  setNewItems: React.Dispatch<React.SetStateAction<string[]>>;
  setEditingItemId: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveBlockIndex: (index: number) => void;
}) => {
  const { showAlert, showConfirm } = useAlert();

  const {
    createChapter,
    createLesson,
    createSubLesson,
    createDocumentInFolder,
    deleteNode,
    renameNode,
    moveLesson,
    reorderChapter,
    getNodeTitle,
    getDeletedIds,
  } = documentTree;

  const handleCreateChapter = useCallback(() => {
    const newId = createChapter();
    setNewItems(prev => [...prev, newId]);
    setEditingItemId(newId);
  }, [createChapter, setEditingItemId, setNewItems]);

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
    setChapters(nextChapters);

    if (deletedIds.includes(activeLessonId)) {
      setActiveLessonId(findFirstLessonId(nextChapters));
      setActiveBlockIndex(0);
    }
  }, [activeLessonId, deleteNode, getDeletedIds, getNodeTitle, pushHistoryState, showConfirm, setChapters, setActiveLessonId, setActiveBlockIndex]);

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
  }, [createLesson, showAlert, setEditingItemId, setNewItems, setActiveLessonId, setActiveBlockIndex]);

  const handleCreateSubLesson = useCallback(async (_chapterId: string, lessonId: string) => {
    const newId = createSubLesson(lessonId);
    if (!newId) return;
    setNewItems(prev => [...prev, newId]);
    setEditingItemId(newId);
    setActiveLessonId(newId);
    setActiveBlockIndex(0);
  }, [createSubLesson, setEditingItemId, setNewItems, setActiveLessonId, setActiveBlockIndex]);

  const handleCreateDocumentInFolder = useCallback((folderId: string) => {
    const newId = createDocumentInFolder(folderId);
    if (!newId) return;
    setNewItems(prev => [...prev, newId]);
    setEditingItemId(newId);
    setActiveLessonId(newId);
    setActiveBlockIndex(0);
  }, [createDocumentInFolder, setEditingItemId, setNewItems, setActiveLessonId, setActiveBlockIndex]);

  const handleDeleteSubLesson = useCallback(async (_lessonId: string, subLessonId: string) => {
    const ok = await showConfirm({
      type: 'danger',
      title: 'Xóa mục',
      description: 'Bạn có chắc chắn muốn xóa mục này không?',
    });
    if (!ok) return;
    const deletedIds = getDeletedIds(subLessonId);
    const nextChapters = deleteNode(subLessonId);
    pushHistoryState(nextChapters);
    setChapters(nextChapters);
    if (deletedIds.includes(activeLessonId)) {
      setActiveLessonId(findFirstLessonId(nextChapters));
      setActiveBlockIndex(0);
    }
  }, [activeLessonId, deleteNode, getDeletedIds, pushHistoryState, showConfirm, setChapters, setActiveLessonId, setActiveBlockIndex]);

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
    setChapters(nextChapters);

    if (deletedIds.includes(activeLessonId)) {
      setActiveLessonId(findFirstLessonId(nextChapters));
      setActiveBlockIndex(0);
    }
  }, [activeLessonId, deleteNode, getDeletedIds, getNodeTitle, pushHistoryState, showConfirm, setChapters, setActiveLessonId, setActiveBlockIndex]);

  const handleCancelEdit = useCallback((id: string) => {
    const isNew = newItems.includes(id);

    if (isNew) {
      const deletedIds = getDeletedIds(id);
      const nextChapters = deleteNode(id);
      setChapters(nextChapters);
      if (deletedIds.includes(activeLessonId)) {
        setActiveLessonId(findFirstLessonId(nextChapters));
        setActiveBlockIndex(0);
      }
    }

    setEditingItemId(null);
    setNewItems(prev => prev.filter(x => x !== id));
  }, [activeLessonId, deleteNode, getDeletedIds, newItems, setChapters, setActiveLessonId, setActiveBlockIndex, setEditingItemId, setNewItems]);

  const handleSaveEdit = useCallback((id: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === '') {
      handleCancelEdit(id);
      return;
    }

    const nextChapters = renameNode(id, trimmedTitle);
    pushHistoryState(nextChapters);
    setChapters(nextChapters);

    setEditingItemId(null);
    setNewItems(prev => prev.filter(x => x !== id));
  }, [pushHistoryState, renameNode, handleCancelEdit, setChapters, setEditingItemId, setNewItems]);

  const handleMoveLesson = useCallback((sourceLessonId: string, targetParentId: string, targetBeforeId?: string) => {
    const nextChapters = moveLesson(sourceLessonId, targetParentId, targetBeforeId);
    pushHistoryState(nextChapters);
    setChapters(nextChapters);
  }, [moveLesson, pushHistoryState, setChapters]);

  const handleChapterReorder = useCallback((sourceChapterId: string, targetChapterId: string) => {
    const nextChapters = reorderChapter(sourceChapterId, targetChapterId);
    pushHistoryState(nextChapters);
    setChapters(nextChapters);
  }, [pushHistoryState, reorderChapter, setChapters]);

  return {
    handleCreateChapter,
    handleDeleteChapter,
    handleCreateLesson,
    handleCreateSubLesson,
    handleCreateDocumentInFolder,
    handleDeleteSubLesson,
    handleDeleteLesson,
    handleSaveEdit,
    handleCancelEdit,
    handleMoveLesson,
    handleChapterReorder,
    handleDepthExceeded,
  };
};
