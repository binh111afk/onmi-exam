import type { DocBlock } from '../types/doc-editor';
import type { PublishedLesson } from '../types/published';

const INTERACTIVE_TYPES: DocBlock['type'][] = [
  'quiz', 'flashcard', 'fillblank', 'dragdrop', 'sortorder', 'matching',
  'table', 'mindmap', 'timeline', 'flow', 'tabs', 'compare', 'diagram',
];

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, ' ');

/** Heuristic: 200 từ/phút + 1.5 phút mỗi block tương tác; clamp 1..90 phút.
 * R7 (Gatekeeper): block layout đi vào slots với depth guard (layout lồng không duyệt quá 3 cấp). */
export const estimateLessonDuration = (blocks: DocBlock[]): number => {
  let words = 0;
  let interactive = 0;
  const walk = (list: DocBlock[], depth: number) => {
    for (const block of list) {
      if (block.type === 'layout') {
        if (depth < 3 && block.layoutContent) {
          block.layoutContent.slots.forEach(slot => walk(slot, depth + 1));
        }
        continue;
      }
      if (INTERACTIVE_TYPES.includes(block.type)) interactive += 1;
      const text = stripHtml(block.text || '');
      words += text.split(/\s+/).filter(Boolean).length;
    }
  };
  walk(blocks, 0);
  const raw = words / 200 + interactive * 1.5;
  return Math.min(90, Math.max(1, Math.round(raw)));
};

/** Giá trị thủ công luôn thắng auto (điều kiện đã chốt). */
export const resolveDuration = (lesson: PublishedLesson): number =>
  lesson.estimatedDuration ?? estimateLessonDuration(lesson.blocks);
