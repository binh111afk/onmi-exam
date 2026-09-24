import type { DocBlock } from './doc-editor';

// Tài liệu đã xuất bản — cầu nối giữa Teacher Studio (draft) và luồng học sinh (B2).
export interface PublishedLesson {
  id: string;
  title: string;
  blocks: DocBlock[];
  /** Phút — giáo viên nhập thủ công; không có thì auto-estimate (điều kiện: manual thắng auto) */
  estimatedDuration?: number;
  /** Liên kết hoạt động luyện tập riêng (KHÔNG đếm quiz block) — UI liên kết ở B2.1 */
  practiceIds: string[];
}

export interface PublishedChapter {
  id: string;
  title: string;
  lessons: PublishedLesson[];
}

export interface PublishedDocument {
  id: string;
  title: string;
  subject: string;
  grade: string;
  chapters: PublishedChapter[];
  publishedAt: string;
}

export type LessonProgressStatus = 'in_progress' | 'completed';

export interface LessonProgress {
  docId: string;
  chapterIdx: number;
  lessonIdx: number;
  lessonId: string;
  status: LessonProgressStatus;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
}
