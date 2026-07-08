import type { DocBlock } from '../../../../types/doc-editor';
import { createNewQuizContent } from './quiz/QuizUtils';
import { createNewFlashcardContent } from './flashcard/FlashcardUtils';
import { createDefaultMindmapData } from './mindmap/MindmapUtils';

export const generateBlockId = (): string => `b-${crypto.randomUUID()}`;

export const createDefaultBlock = (
  type: DocBlock['type'],
  id?: string,
  align?: DocBlock['align'],
  indent?: number,
  level?: 1 | 2 | 3,
  text?: string
): DocBlock => {
  const blockId = id || generateBlockId();
  const blockAlign = align || 'left';
  const blockIndent = indent || 0;

  const base: DocBlock = {
    id: blockId,
    type,
    text: text || '',
    align: blockAlign,
    indent: blockIndent,
  };

  switch (type) {
    case 'heading':
      return {
        ...base,
        level: level ?? 1,
      };

    case 'image':
      return {
        ...base,
        src: '',
        caption: '',
        align: 'center',
        width: '100%',
      };

    case 'table':
      return {
        ...base,
        rows: [
          ['Cột 1', 'Cột 2', 'Cột 3'],
          ['Dữ liệu 1', 'Dữ liệu 2', 'Dữ liệu 3'],
          ['Dữ liệu 4', 'Dữ liệu 5', 'Dữ liệu 6'],
        ],
      };

    case 'formula':
      return {
        ...base,
        latex: 'f(x) = x^2',
        display: 'block',
      };

    case 'quiz':
      return {
        ...base,
        quizContent: createNewQuizContent(),
      };

    case 'flashcard':
      return {
        ...base,
        flashcardContent: createNewFlashcardContent(),
      };

    case 'mindmap':
      return {
        ...base,
        mindmapContent: createDefaultMindmapData(),
      };

    case 'timeline':
      return {
        ...base,
        timelineContent: {
          version: 1,
          events: [],
          settings: {
            layout: 'vertical',
            direction: 'normal',
          },
        },
      };

    case 'flow':
      return {
        ...base,
        flowContent: {
          version: 1,
          steps: [],
          settings: {
            layout: 'horizontal',
            arrowStyle: 'straight',
          },
        },
      };

    case 'tabs':
      return {
        ...base,
        tabsContent: {
          version: 1,
          tabs: [],
          settings: {},
        },
      };

    case 'compare':
      return {
        ...base,
        compareContent: {
          version: 1,
          columns: [],
          settings: {
            themeColor: '#6366f1'
          }
        }
      };

    case 'diagram':
      return {
        ...base,
        diagramContent: {
          version: 1,
          nodes: [],
          settings: {
            layout: 'horizontal',
            arrowStyle: 'straight',
            themeColor: '#6366f1'
          }
        }
      };

    case 'matching':
      return {
        ...base,
        matchingContent: {
          version: 1,
          pairs: [],
          settings: {
            themeColor: '#6366f1'
          }
        }
      };

    case 'code':
      return {
        ...base,
        language: 'typescript',
      };

    case 'paragraph':
    case 'bullet-list':
    case 'numbered-list':
    case 'todo-list':
    case 'callout':
    case 'quote':
    case 'divider':
    case 'media':
    default:
      return base;
  }
};
