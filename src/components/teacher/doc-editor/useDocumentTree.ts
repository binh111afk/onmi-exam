import { useCallback, useMemo, useState } from 'react';
import type { Chapter, DocBlock, Lesson } from '../../../types/doc-editor';

export interface FlatNode {
  id: string;
  parent: string | null;
  text: string;
  nodeType: 'chapter' | 'lesson';
  order: number;
  isExpanded?: boolean;
  isFolder?: boolean;
  blocks?: DocBlock[];
}

type NodesMap = Record<string, FlatNode>;
type ChaptersUpdater = Chapter[] | ((prev: Chapter[]) => Chapter[]);

const rootParent = null;

const getDescendants = (nodes: FlatNode[], id: string): FlatNode[] => {
  let descendants: FlatNode[] = [];

  const search = (tree: FlatNode[], ids: string[]) => {
    const children = tree.filter((node) => node.parent !== null && ids.includes(node.parent));

    if (children.length > 0) {
      descendants = [...descendants, ...children];
      search(
        tree,
        children.map((node) => node.id),
      );
    }
  };

  search(nodes, [id]);

  return descendants;
};

const createLessonNode = (
  id: string,
  parent: string,
  text: string,
  order: number,
  isFolder: boolean,
): FlatNode => ({
  id,
  parent,
  text,
  nodeType: 'lesson',
  order,
  isFolder,
  blocks: [createDefaultParagraphBlock()],
});

const createDefaultParagraphBlock = (): DocBlock => ({
  id: crypto.randomUUID(),
  type: 'paragraph',
  text: '',
});

const sortNodes = (a: FlatNode, b: FlatNode) => a.order - b.order;

const normalizeSiblingOrder = (nodesMap: NodesMap): NodesMap => {
  const next = { ...nodesMap };
  const parentIds = Array.from(new Set(Object.values(next).map((node) => node.parent)));

  parentIds.forEach((parentId) => {
    Object.values(next)
      .filter((node) => node.parent === parentId)
      .sort(sortNodes)
      .forEach((node, index) => {
        next[node.id] = { ...next[node.id], order: index };
      });
  });

  return next;
};

const toNodesMap = (chapters: Chapter[]): NodesMap => {
  const nodesMap: NodesMap = {};

  const addLesson = (lesson: Lesson, parent: string, order: number) => {
    nodesMap[lesson.id] = {
      id: lesson.id,
      parent,
      text: lesson.title,
      nodeType: 'lesson',
      order,
      isExpanded: lesson.isExpanded,
      isFolder: lesson.isFolder,
      blocks: lesson.blocks,
    };

    lesson.subLessons?.forEach((subLesson, subIndex) => {
      addLesson(subLesson, lesson.id, subIndex);
    });
  };

  chapters.forEach((chapter, chapterIndex) => {
    nodesMap[chapter.id] = {
      id: chapter.id,
      parent: rootParent,
      text: chapter.title,
      nodeType: 'chapter',
      order: chapterIndex,
      isExpanded: chapter.isExpanded,
    };

    chapter.lessons.forEach((lesson, lessonIndex) => {
      addLesson(lesson, chapter.id, lessonIndex);
    });
  });

  return nodesMap;
};

export const buildNestedChapters = (nodesMap: NodesMap): Chapter[] => {
  const nodes = Object.values(nodesMap);
  const childrenByParent = new Map<string | null, FlatNode[]>();

  nodes.forEach((node) => {
    const siblings = childrenByParent.get(node.parent) ?? [];
    siblings.push(node);
    childrenByParent.set(node.parent, siblings);
  });

  childrenByParent.forEach((siblings) => siblings.sort(sortNodes));

  const buildLesson = (node: FlatNode): Lesson => {
    const childLessons = (childrenByParent.get(node.id) ?? [])
      .filter((child) => child.nodeType === 'lesson')
      .map(buildLesson);

    return {
      id: node.id,
      title: node.text,
      blocks: node.blocks ?? [],
      isFolder: node.isFolder,
      isExpanded: node.isExpanded,
      ...((node.isFolder || childLessons.length > 0) ? { subLessons: childLessons } : {}),
    };
  };

  return (childrenByParent.get(rootParent) ?? [])
    .filter((node) => node.nodeType === 'chapter')
    .map((chapter) => ({
      id: chapter.id,
      title: chapter.text,
      isExpanded: chapter.isExpanded,
      lessons: (childrenByParent.get(chapter.id) ?? [])
        .filter((node) => node.nodeType === 'lesson')
        .map(buildLesson),
    }));
};

export const useDocumentTree = (initialChapters: Chapter[]) => {
  const [nodesMap, setNodesMap] = useState<NodesMap>(() => toNodesMap(initialChapters));
  const chapters = useMemo(() => buildNestedChapters(nodesMap), [nodesMap]);

  const setChapters = useCallback((updater: ChaptersUpdater) => {
    setNodesMap((prev) => {
      const currentChapters = buildNestedChapters(prev);
      const nextChapters = typeof updater === 'function' ? updater(currentChapters) : updater;
      return toNodesMap(nextChapters);
    });
  }, []);

  const findLessonById = useCallback((id: string, list: Chapter[] = chapters): Lesson | null => {
    const findInLessons = (lessons: Lesson[]): Lesson | null => {
      for (const lesson of lessons) {
        if (lesson.id === id) return lesson;
        const child = lesson.subLessons ? findInLessons(lesson.subLessons) : null;
        if (child) return child;
      }
      return null;
    };

    for (const chapter of list) {
      const lesson = findInLessons(chapter.lessons);
      if (lesson) return lesson;
    }

    return null;
  }, [chapters]);

  const getNodeTitle = useCallback((id: string) => nodesMap[id]?.text ?? '', [nodesMap]);

  const getDeletedIds = useCallback((id: string) => {
    const node = nodesMap[id];
    if (!node) return [];
    return [id, ...getDescendants(Object.values(nodesMap), id).map((descendant) => descendant.id)];
  }, [nodesMap]);

  const toggleExpand = useCallback((id: string) => {
    setNodesMap((prev) => prev[id]
      ? { ...prev, [id]: { ...prev[id], isExpanded: !prev[id].isExpanded } }
      : prev
    );
  }, []);

  const createChapter = useCallback(() => {
    const id = crypto.randomUUID();
    setNodesMap((prev) => ({
      ...prev,
      [id]: {
        id,
        parent: rootParent,
        text: 'Chương chưa đặt tên',
        nodeType: 'chapter',
        order: Object.values(prev).filter((node) => node.parent === rootParent).length,
        isExpanded: true,
      },
    }));
    return id;
  }, []);

  const createLesson = useCallback((chapterId: string, title = 'Bài học chưa đặt tên', isFolder = false) => {
    if (!nodesMap[chapterId]) return null;
    const id = crypto.randomUUID();
    setNodesMap((prev) => ({
      ...prev,
      [chapterId]: { ...prev[chapterId], isExpanded: true },
      [id]: createLessonNode(
        id,
        chapterId,
        title,
        Object.values(prev).filter((node) => node.parent === chapterId).length,
        isFolder,
      ),
    }));
    return id;
  }, [nodesMap]);

  const createSubLesson = useCallback((lessonId: string, title = 'Thư mục mới', isFolder = true) => {
    if (!nodesMap[lessonId]) return null;
    const id = crypto.randomUUID();
    setNodesMap((prev) => ({
      ...prev,
      [lessonId]: { ...prev[lessonId], isExpanded: true, isFolder: true },
      [id]: createLessonNode(
        id,
        lessonId,
        title,
        Object.values(prev).filter((node) => node.parent === lessonId).length,
        isFolder,
      ),
    }));
    return id;
  }, [nodesMap]);

  const createDocumentInFolder = useCallback((folderId: string) => {
    return createSubLesson(folderId, 'Bài học chưa đặt tên', false);
  }, [createSubLesson]);

  const deleteNode = useCallback((id: string) => {
    const deletedIds = [id, ...getDescendants(Object.values(nodesMap), id).map((node) => node.id)];
    const nextMap = { ...nodesMap };
    deletedIds.forEach((deletedId) => {
      delete nextMap[deletedId];
    });
    const normalizedMap = normalizeSiblingOrder(nextMap);
    setNodesMap(normalizedMap);
    return buildNestedChapters(normalizedMap);
  }, [nodesMap]);

  const renameNode = useCallback((id: string, title: string) => {
    if (!nodesMap[id]) return chapters;
    const next = {
      ...nodesMap,
      [id]: {
        ...nodesMap[id],
        text: title,
        blocks: nodesMap[id].blocks?.map((block, index) =>
          index === 0 && block.type === 'heading' && block.level === 1
            ? { ...block, text: title }
            : block
        ),
      },
    };
    setNodesMap(next);
    return buildNestedChapters(next);
  }, [chapters, nodesMap]);

  const moveLesson = useCallback((sourceLessonId: string, targetParentId: string, targetBeforeId?: string) => {
    const source = nodesMap[sourceLessonId];
    const target = nodesMap[targetParentId];
    if (!source || source.nodeType !== 'lesson' || !target) return chapters;
    if (target.nodeType === 'lesson' && getDescendants(Object.values(nodesMap), sourceLessonId).some((node) => node.id === targetParentId)) return chapters;
    if (target.nodeType === 'lesson' && getDescendants(Object.values(nodesMap), sourceLessonId).length > 0) return chapters;

    const siblings = Object.values(nodesMap)
      .filter((node) => node.parent === targetParentId && node.id !== sourceLessonId)
      .sort(sortNodes);
    const targetIndex = siblings.findIndex((node) => node.id === targetBeforeId);
    const insertIndex = targetIndex === -1 ? siblings.length : targetIndex;
    const reorderedSiblings = [...siblings];
    reorderedSiblings.splice(insertIndex, 0, { ...source, parent: targetParentId });

    const next = { ...nodesMap, [sourceLessonId]: { ...source, parent: targetParentId } };
    Object.values(next)
      .filter((node) => node.parent === source.parent && node.id !== sourceLessonId)
      .sort(sortNodes)
      .forEach((node, index) => {
        next[node.id] = { ...next[node.id], order: index };
      });
    reorderedSiblings.forEach((node, index) => {
      next[node.id] = { ...next[node.id], parent: targetParentId, order: index };
    });
    next[targetParentId] = { ...next[targetParentId], isExpanded: true };
    setNodesMap(next);
    return buildNestedChapters(next);
  }, [chapters, nodesMap]);

  const reorderChapter = useCallback((sourceChapterId: string, targetChapterId: string) => {
    const chaptersOnly = Object.values(nodesMap).filter((node) => node.parent === rootParent).sort(sortNodes);
    const sourceIndex = chaptersOnly.findIndex((node) => node.id === sourceChapterId);
    const targetIndex = chaptersOnly.findIndex((node) => node.id === targetChapterId);
    if (sourceIndex === -1 || targetIndex === -1) return chapters;

    const reordered = [...chaptersOnly];
    const [movedChapter] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, movedChapter);

    const next = { ...nodesMap };
    reordered.forEach((chapter, index) => {
      next[chapter.id] = { ...next[chapter.id], order: index };
    });
    setNodesMap(next);
    return buildNestedChapters(next);
  }, [chapters, nodesMap]);

  return {
    nodesMap,
    chapters,
    setChapters,
    findLessonById,
    getNodeTitle,
    getDeletedIds,
    toggleExpand,
    createChapter,
    createLesson,
    createSubLesson,
    createDocumentInFolder,
    deleteNode,
    renameNode,
    moveLesson,
    reorderChapter,
  };
};
