import type {
  Chapter,
  Lesson,
  DocBlock,
  DbChapter,
  DbLesson,
  DbBlock,
} from '../../../../types/doc-editor';

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

export const transformChaptersToDb = (
  chapters: Chapter[],
  documentId: string
): { dbChapters: DbChapter[]; dbLessons: DbLesson[]; dbBlocks: DbBlock[] } => {
  const dbChapters: DbChapter[] = [];
  const dbLessons: DbLesson[] = [];
  const dbBlocks: DbBlock[] = [];

  chapters.forEach((chapter, chIdx) => {
    dbChapters.push({
      id: chapter.id,
      title: chapter.title,
      document_id: documentId,
      order: chIdx,
    });

    const traverseLessons = (lessons: Lesson[], parentLessonId: string | null, chapterId: string | null) => {
      lessons.forEach((lesson, lesIdx) => {
        dbLessons.push({
          id: lesson.id,
          title: lesson.title,
          chapter_id: chapterId,
          parent_lesson_id: parentLessonId,
          is_folder: !!lesson.isFolder,
          order: lesIdx,
        });

        const blocks = transformClientToDbPayload(lesson.id, lesson.blocks || []);
        dbBlocks.push(...blocks);

        if (lesson.subLessons && lesson.subLessons.length > 0) {
          traverseLessons(lesson.subLessons, lesson.id, null);
        }
      });
    };

    traverseLessons(chapter.lessons, null, chapter.id);
  });

  return { dbChapters, dbLessons, dbBlocks };
};
