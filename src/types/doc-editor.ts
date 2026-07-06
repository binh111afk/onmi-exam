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
  language?: string;
  rows?: string[][];
  width?: string;
  alt?: string;
  hasHeaderRow?: boolean;
  hasHeaderColumn?: boolean;
  columnWidths?: number[];
  rowHeights?: number[];
  cellStyles?: TableCellStyle[][];
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
