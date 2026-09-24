import type { MindmapData } from '../components/teacher/doc-editor/blocks/mindmap/MindmapTypes';
import type { CodeBlockContent } from '../components/teacher/doc-editor/blocks/code/CodeTypes';

export type { CodeBlockContent };

export interface TableCellStyle {
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  bg?: string;
  color?: string;
}

export interface DocBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'todo-list' | 'callout' | 'quote' | 'divider' | 'image' | 'table' | 'formula' | 'code' | 'quiz' | 'flashcard' | 'mindmap' | 'media' | 'timeline' | 'flow' | 'tabs' | 'compare' | 'diagram' | 'matching' | 'fillblank' | 'dragdrop' | 'sortorder';
  order?: number;
  content?: {
    text?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    indent?: number;
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
    flashcardContent?: FlashcardContent;
    mindmapContent?: MindmapData;
    timelineContent?: TimelineContent;
    flowContent?: FlowContent;
    tabsContent?: TabsContent;
    compareContent?: CompareContent;
    diagramContent?: DiagramContent;
    matchingContent?: MatchingContent;
    fillblankContent?: FillBlankContent;
    dragdropContent?: DragDropContent;
    sortorderContent?: SortOrderContent;
    codeContent?: CodeBlockContent;
    level?: 1 | 2 | 3;
    url?: string;
    sourceType?: 'upload' | 'embed';
  };
  
  // Tương thích ngược:
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
  flashcardContent?: FlashcardContent;
  mindmapContent?: MindmapData;
  timelineContent?: TimelineContent;
  flowContent?: FlowContent;
  tabsContent?: TabsContent;
  compareContent?: CompareContent;
  diagramContent?: DiagramContent;
  matchingContent?: MatchingContent;
  fillblankContent?: FillBlankContent;
  dragdropContent?: DragDropContent;
  sortorderContent?: SortOrderContent;
  codeContent?: CodeBlockContent;
  url?: string;
  sourceType?: 'upload' | 'embed';
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

export type FlashcardOrder = 'manual' | 'created';

export interface FlashcardCard {
  id: string;
  front: string;
  back: string;
  note?: string;
  tags?: string[];
}

export interface FlashcardSettings {
  shuffleCards: boolean;
  flipAnimation: boolean;
  autoPlay: boolean;
  showProgress: boolean;
  cardOrder: FlashcardOrder;
}

export interface FlashcardContent {
  version: number;
  settings: FlashcardSettings;
  cards: FlashcardCard[];
}

export interface Lesson {
  id: string;
  title: string;
  blocks: DocBlock[];
  isFolder?: boolean;
  subLessons?: Lesson[];
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface DbChapter {
  id: string;
  title: string;
  document_id: string;
  order: number;
}

export interface DbLesson {
  id: string;
  title: string;
  chapter_id: string | null;
  parent_lesson_id: string | null;
  is_folder: boolean;
  order: number;
}

export interface DbBlock {
  id: string;
  lesson_id: string;
  type: string;
  order: number;
  content: Record<string, any>;
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

// Timeline Block Content Types
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  color: string;
  icon?: string;
}

export interface TimelineSettings {
  layout: 'vertical' | 'horizontal';
  direction: 'normal' | 'reverse';
  themeColor?: string;
  nodeStyle?: 'circle' | 'square' | 'pill';
  connectorStyle?: 'solid' | 'dashed' | 'dotted';
  showDate?: boolean;
  showNumber?: boolean;
  spacing?: 'compact' | 'cozy' | 'comfortable';
  compactMode?: boolean;
}

export interface TimelineContent {
  version: number;
  events: TimelineEvent[];
  settings: TimelineSettings;
}

// Flow / Process Block Content Types
export interface FlowStep {
  id: string;
  title: string;
  description: string;
  color: string;
}

export interface FlowSettings {
  layout: 'vertical' | 'horizontal' | 'zigzag';
  arrowStyle: 'straight' | 'dashed' | 'curved';
  themeColor?: string;
  connectorStyle?: 'solid' | 'dashed' | 'dotted';
  stepNumbering?: 'numbers' | 'roman' | 'alphabet' | 'none';
  cardStyle?: 'flat' | 'bordered' | 'shadow';
  stepSpacing?: 'compact' | 'normal' | 'wide';
}

export interface FlowContent {
  version: number;
  steps: FlowStep[];
  settings: FlowSettings;
}

// Tabs Block Content Types
export interface TabItem {
  id: string;
  title: string;
  content: string;
}

export interface TabsSettings {
  themeColor?: string;
  defaultActiveTab?: string;
  tabStyle?: 'underline' | 'pills' | 'blocks';
  position?: 'top' | 'bottom' | 'left';
  equalWidth?: boolean;
  scrollMode?: boolean;
  roundedTabs?: boolean;
}

export interface TabsContent {
  version: number;
  tabs: TabItem[];
  settings: TabsSettings;
}

// Compare Block Content Types
export interface CompareColumn {
  id: string;
  title: string;
  content: string;
}

export interface CompareSettings {
  themeColor?: string;
  cardStyle?: 'flat' | 'bordered' | 'shadow';
  showBorder?: boolean;
  equalHeight?: boolean;
  columnSpacing?: 'compact' | 'normal' | 'wide';
  headerStyle?: 'filled' | 'minimal' | 'accent';
  responsiveMode?: 'stack' | 'scroll';
}

export interface CompareContent {
  version: number;
  columns: CompareColumn[];
  settings: CompareSettings;
}

// Diagram Block Content Types
export interface DiagramNode {
  id: string;
  title: string;
  description: string;
  color: string;
}

export interface DiagramSettings {
  layout: 'horizontal' | 'vertical' | 'tree' | 'cycle';
  arrowStyle: 'straight' | 'dashed' | 'curved';
  themeColor?: string;
  nodeStyle?: 'rounded' | 'sharp' | 'oval';
  nodeSpacing?: 'compact' | 'normal' | 'wide';
  showArrows?: boolean;
  showDescriptions?: boolean;
}

export interface DiagramContent {
  version: number;
  nodes: DiagramNode[];
  settings: DiagramSettings;
}

// Matching Block Content Types
export interface MatchingPair {
  id: string;
  leftText: string;
  rightText: string;
}

export interface MatchingSettings {
  themeColor?: string;
  shuffleAnswers?: boolean;
  allowRetries?: boolean;
  showScore?: boolean;
  showFeedback?: boolean;
  revealAnswers?: boolean;
  autoCheck?: boolean;
}

export interface MatchingContent {
  version: number;
  pairs: MatchingPair[];
  settings: MatchingSettings;
}

// Fill Blank Block Content Types
export interface BlankItem {
  id: string;
  answer: string;
  caseSensitive: boolean;
  hint: string;
  score: number;
  alternativeAnswers: string[];
  width?: number; // width in pixels
  placeholder?: string;
}

export interface FillBlankSettings {
  shuffleBlanks: boolean;
  caseSensitive: boolean;
  showHints: boolean;
  showAnswerAfterSubmit: boolean;
  partialScoring: boolean;
  acceptMultipleAnswers: boolean;
  blankStyle: 'underline' | 'box' | 'dashed';
  maxAttempts: number;
  themeColor?: string;
}

export interface FillBlankParagraph {
  id: string;
  text: string; // HTML string containing static text and <span data-blank-id="uuid"></span>
}

export interface FillBlankContent {
  version: number;
  paragraphs: FillBlankParagraph[];
  blanks: Record<string, BlankItem>;
  settings: FillBlankSettings;
}

// Drag & Drop Block Content Types
export interface DragDropCard {
  id: string;
  type: 'text' | 'image' | 'icon';
  content: string; // The text content, image URL, or icon name
}

export interface DragDropZone {
  id: string;
  type: 'text' | 'image' | 'icon';
  content: string; // The zone header content
  correctCardIds: string[]; // The cards that map correctly to this zone
}

export interface DragDropSettings {
  shuffleCards: boolean;
  shuffleZones: boolean;
  allowRetry: boolean;
  snapAnimation: boolean;
  showCorrectAnswer: boolean;
  autoCheck: boolean;
  multipleCorrect: boolean;
  randomOrder: boolean;
  themeColor?: string;
}

export interface DragDropContent {
  version: number;
  cards: DragDropCard[];
  zones: DragDropZone[];
  settings: DragDropSettings;
}

// Sort Order Block Content Types
export interface SortOrderItem {
  id: string;
  type: 'text' | 'image' | 'icon';
  content: string; // The text content, image URL, or icon name
}

export interface SortOrderSettings {
  shuffleInitialOrder: boolean;
  order: 'ascending' | 'descending';
  allowRetry: boolean;
  showExplanation: boolean;
  explanationText?: string;
  autoCheck: boolean;
  score: number;
  themeColor?: string;
}

export interface SortOrderContent {
  version: number;
  items: SortOrderItem[];
  settings: SortOrderSettings;
}

export interface DocSetupMetadata {
  name: string;
  subject: string;
  grade: string;
  docType: string;
  description: string;
  coverImage?: string;
}
