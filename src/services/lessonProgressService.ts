import type { LessonProgress, LessonProgressStatus } from '../types/published';

const LOCAL_STORAGE_KEY = 'omni_lesson_progress';

const readAll = (): LessonProgress[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LessonProgress[]) : [];
  } catch (e) {
    console.error('Cannot read lesson progress:', e);
    return [];
  }
};

const writeAll = (list: LessonProgress[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Cannot save lesson progress:', e);
  }
};

const keyOf = (docId: string, chapterIdx: number, lessonIdx: number) =>
  `${docId}::${chapterIdx}::${lessonIdx}`;

export const lessonProgressService = {
  get(docId: string, chapterIdx: number, lessonIdx: number): LessonProgress | undefined {
    return readAll().find(p => keyOf(p.docId, p.chapterIdx, p.lessonIdx) === keyOf(docId, chapterIdx, lessonIdx));
  },

  isCompleted(docId: string, chapterIdx: number, lessonIdx: number): boolean {
    return this.get(docId, chapterIdx, lessonIdx)?.status === 'completed';
  },

  /** Mở bài học: upsert lastAccessedAt; chưa có → in_progress + startedAt */
  touch(docId: string, chapterIdx: number, lessonIdx: number, lessonId: string): void {
    try {
      const list = readAll();
      const k = keyOf(docId, chapterIdx, lessonIdx);
      const existing = list.find(p => keyOf(p.docId, p.chapterIdx, p.lessonIdx) === k);
      if (existing) {
        existing.lastAccessedAt = new Date().toISOString();
      } else {
        list.push({
          docId,
          chapterIdx,
          lessonIdx,
          lessonId,
          status: 'in_progress' as LessonProgressStatus,
          startedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
        });
      }
      writeAll(list);
    } catch (e) {
      console.error('Cannot touch lesson progress:', e);
    }
  },

  setCompleted(docId: string, chapterIdx: number, lessonIdx: number, lessonId: string): void {
    try {
      const list = readAll();
      const k = keyOf(docId, chapterIdx, lessonIdx);
      const existing = list.find(p => keyOf(p.docId, p.chapterIdx, p.lessonIdx) === k);
      if (existing) {
        existing.status = 'completed' as LessonProgressStatus;
        existing.completedAt = new Date().toISOString();
        existing.lastAccessedAt = existing.completedAt;
      } else {
        list.push({
          docId,
          chapterIdx,
          lessonIdx,
          lessonId,
          status: 'completed' as LessonProgressStatus,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
        });
      }
      writeAll(list);
    } catch (e) {
      console.error('Cannot set lesson completed:', e);
    }
  },

  listByDoc(docId: string): LessonProgress[] {
    return readAll().filter(p => p.docId === docId);
  },
};
