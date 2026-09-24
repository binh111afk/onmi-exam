import type { DocBlock } from '../types/doc-editor';
import type { PublishedLesson } from '../types/published';

const INTERACTIVE_TYPES: DocBlock['type'][] = [
  'quiz', 'flashcard', 'fillblank', 'dragdrop', 'sortorder', 'matching',
  'table', 'mindmap', 'timeline', 'flow', 'tabs', 'compare', 'diagram',
];

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, ' ');

/** Heuristic: 200 từ/phút + 1.5 phút mỗi block tương tác; clamp 1..90 phút. */
export const estimateLessonDuration = (blocks: DocBlock[]): number => {
  let words = 0;
  let interactive = 0;
  for (const block of blocks) {
    if (INTERACTIVE_TYPES.includes(block.type)) interactive += 1;
    const text = stripHtml(block.text || '');
    words += text.split(/\s+/).filter(Boolean).length;
  }
  const raw = words / 200 + interactive * 1.5;
  return Math.min(90, Math.max(1, Math.round(raw)));
};

/** Giá trị thủ công luôn thắng auto (điều kiện đã chốt). */
export const resolveDuration = (lesson: PublishedLesson): number =>
  lesson.estimatedDuration ?? estimateLessonDuration(lesson.blocks);
