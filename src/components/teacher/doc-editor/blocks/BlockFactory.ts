import type { DocBlock } from '../../../../types/doc-editor';
import { createNewQuizContent } from './quiz/QuizUtils';
import { createNewFlashcardContent } from './flashcard/FlashcardUtils';
import { createDefaultMindmapData } from './mindmap/MindmapUtils';
import { createDefaultFillBlankContent } from './fillblank/Utils';
import { createDefaultDragDropContent } from './dragdrop/Utils';
import { createDefaultSortOrderContent } from './sortorder/Utils';
import { createDefaultCodeContent } from './code/CodeUtils';

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
    content: {
      text: text || '',
      align: blockAlign,
      indent: blockIndent,
    },
  };

  switch (type) {
    case 'heading': {
      const headingLevel = level ?? 1;
      return {
        ...base,
        level: headingLevel,
        content: {
          ...base.content,
          level: headingLevel,
        },
      };
    }

    case 'image':
      return {
        ...base,
        src: '',
        caption: '',
        align: 'center',
        width: '100%',
        content: {
          ...base.content,
          src: '',
          caption: '',
          align: 'center',
          width: '100%',
        },
      };

    case 'table': {
      const rows = [
        ['Cột 1', 'Cột 2', 'Cột 3'],
        ['Dữ liệu 1', 'Dữ liệu 2', 'Dữ liệu 3'],
        ['Dữ liệu 4', 'Dữ liệu 5', 'Dữ liệu 6'],
      ];
      return {
        ...base,
        rows,
        content: {
          ...base.content,
          rows,
        },
      };
    }

    case 'formula':
      return {
        ...base,
        latex: 'f(x) = x^2',
        display: 'block',
        content: {
          ...base.content,
          latex: 'f(x) = x^2',
          display: 'block',
        },
      };

    case 'quiz': {
      const quizContent = createNewQuizContent();
      return {
        ...base,
        quizContent,
        content: {
          ...base.content,
          quizContent,
        },
      };
    }

    case 'flashcard': {
      const flashcardContent = createNewFlashcardContent();
      return {
        ...base,
        flashcardContent,
        content: {
          ...base.content,
          flashcardContent,
        },
      };
    }

    case 'mindmap': {
      const mindmapContent = createDefaultMindmapData();
      return {
        ...base,
        mindmapContent,
        content: {
          ...base.content,
          mindmapContent,
        },
      };
    }

    case 'timeline': {
      const timelineContent = {
        version: 1,
        events: [],
        settings: {
          layout: 'vertical' as const,
          direction: 'normal' as const,
        },
      };
      return {
        ...base,
        timelineContent,
        content: {
          ...base.content,
          timelineContent,
        },
      };
    }

    case 'flow': {
      const flowContent = {
        version: 1,
        steps: [],
        settings: {
          layout: 'horizontal' as const,
          arrowStyle: 'straight' as const,
        },
      };
      return {
        ...base,
        flowContent,
        content: {
          ...base.content,
          flowContent,
        },
      };
    }

    case 'tabs': {
      const tabsContent = {
        version: 1,
        tabs: [],
        settings: {},
      };
      return {
        ...base,
        tabsContent,
        content: {
          ...base.content,
          tabsContent,
        },
      };
    }

    case 'compare': {
      const compareContent = {
        version: 1,
        columns: [],
        settings: {
          themeColor: '#6366f1',
        },
      };
      return {
        ...base,
        compareContent,
        content: {
          ...base.content,
          compareContent,
        },
      };
    }

    case 'diagram': {
      const diagramContent = {
        version: 1,
        nodes: [],
        settings: {
          layout: 'horizontal' as const,
          arrowStyle: 'straight' as const,
          themeColor: '#6366f1',
        },
      };
      return {
        ...base,
        diagramContent,
        content: {
          ...base.content,
          diagramContent,
        },
      };
    }

    case 'matching': {
      const matchingContent = {
        version: 1,
        pairs: [],
        settings: {
          themeColor: '#6366f1',
        },
      };
      return {
        ...base,
        matchingContent,
        content: {
          ...base.content,
          matchingContent,
        },
      };
    }

    case 'fillblank': {
      const fillblankContent = createDefaultFillBlankContent();
      return {
        ...base,
        fillblankContent,
        content: {
          ...base.content,
          fillblankContent,
        },
      };
    }

    case 'dragdrop': {
      const dragdropContent = createDefaultDragDropContent();
      return {
        ...base,
        dragdropContent,
        content: {
          ...base.content,
          dragdropContent,
        },
      };
    }

    case 'sortorder': {
      const sortorderContent = createDefaultSortOrderContent();
      return {
        ...base,
        sortorderContent,
        content: {
          ...base.content,
          sortorderContent,
        },
      };
    }

    case 'code': {
      const codeContent = createDefaultCodeContent();
      return {
        ...base,
        language: codeContent.language,
        codeContent,
        content: {
          ...base.content,
          language: codeContent.language,
          codeContent,
        },
      };
    }

    case 'media':
      return {
        ...base,
        url: '',
        sourceType: 'upload',
        caption: '',
        content: {
          ...base.content,
          url: '',
          sourceType: 'upload',
          caption: '',
        },
      };

    case 'paragraph':
    case 'bullet-list':
    case 'numbered-list':
    case 'todo-list':
    case 'callout':
    case 'quote':
    case 'divider':
    default:
      return base;
  }
};
