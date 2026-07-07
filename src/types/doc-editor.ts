export interface TableCellStyle {
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  bg?: string;
  color?: string;
}

export interface DocBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'todo-list' | 'callout' | 'quote' | 'divider' | 'image' | 'table' | 'formula' | 'code' | 'quiz' | 'flashcard' | 'mindmap' | 'media';
  level?: 1 | 2 | 3;
  indent?: number;
  text: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  checked?: boolean;
  
  src?: string;
  caption?: string;
  latex?: string;
  display?: 'inline' | 'block';
  language?: string;
  rows?: string[][];
  width?: string;
  alt?: string;
  hasHeaderRow?: boolean;
  hasHeaderColumn?: boolean;
  columnWidths?: number[];
  rowHeights?: number[];
  cellStyles?: TableCellStyle[][];
  quizContent?: QuizContent;
}

export const QuestionType = {
  SINGLE_CHOICE: 'single-choice',
  MULTIPLE_CHOICE: 'multiple-choice',
  TRUE_FALSE: 'true-false',
  FILL_BLANK: 'fill-blank',
  MATCHING: 'matching',
  ORDERING: 'ordering',
  SHORT_ANSWER: 'short-answer'
} as const;

export type QuestionType = typeof QuestionType[keyof typeof QuestionType];

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  options: QuizOption[];
}

export interface QuizSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  passingScore: number;
}

export interface QuizContent {
  version: number;
  questions: QuizQuestion[];
  settings: QuizSettings;
}

export interface Lesson {
  id: string;
  title: string;
  blocks: DocBlock[];
}

export interface Chapter {
  id: string;
  title: string;
  isExpanded?: boolean;
  lessons: Lesson[];
}

export interface LiveTableResizeState {
  blockId: string;
  resizingCol: number | null;
  resizingRow: number | null;
  columnWidths: number[];
  rowHeights: number[];
}

export interface LiveTableActiveCell {
  blockId: string;
  row: number;
  col: number;
}


