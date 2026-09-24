/**
 * Canonical internal representation for imported and authored exam documents.
 * OML is an output format; this model retains document intent independently of
 * any renderer or transport format.
 */
export type QuestionObjectId = string | number;

export interface DocumentMetadata {
  title: string;
  subject?: string;
  grade?: number | string;
  time?: number;
  type?: 'exam' | 'practice' | 'worksheet' | string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  description?: string;
  author?: string;
  allowReview?: boolean;
  shuffle?: boolean;
  totalQuestion?: number;
}

export interface DocumentSourceRef {
  page?: number;
  boundingBox?: [number, number, number, number];
  confidence?: number;
}

interface DocumentNodeBase {
  id?: QuestionObjectId;
  source?: DocumentSourceRef;
}

export interface TextNode extends DocumentNodeBase {
  kind: 'text';
  text: string;
}

export interface HeadingNode extends DocumentNodeBase {
  kind: 'heading';
  level: 1 | 2 | 3;
  text: string;
}

export interface FormulaNode extends DocumentNodeBase {
  kind: 'formula';
  latex: string;
  display: 'inline' | 'block';
}

export interface ImageNode extends DocumentNodeBase {
  kind: 'image';
  src: string;
  alt?: string;
  caption?: string;
  size?: 'small' | 'medium' | 'full';
}

export interface TableNode extends DocumentNodeBase {
  kind: 'table';
  caption?: string;
  headers?: string[];
  rows: string[][];
}

export interface ListNode extends DocumentNodeBase {
  kind: 'list';
  ordered: boolean;
  items: string[];
}

export interface CalloutNode extends DocumentNodeBase {
  kind: 'callout';
  variant: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  content: string;
}

export interface QuoteNode extends DocumentNodeBase {
  kind: 'quote';
  text: string;
  cite?: string;
}

export interface DividerNode extends DocumentNodeBase {
  kind: 'divider';
}

export interface OptionObject {
  id: QuestionObjectId;
  content: string;
}

interface QuestionBase extends DocumentNodeBase {
  kind: 'question';
  questionType: 'choice' | 'true-false' | 'fill-blank' | 'essay' | 'matching' | 'ordering';
  question: string;
  points?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  image?: ImageNode;
  explanation?: string;
}

export interface ChoiceQuestionObject extends QuestionBase {
  questionType: 'choice' | 'true-false';
  options: OptionObject[];
  answer: QuestionObjectId[];
}

export interface FillBlankQuestionObject extends QuestionBase {
  questionType: 'fill-blank';
  answer: string[];
  unit?: string;
  units?: string[];
  showAnswer?: boolean;
}

export interface FutureQuestionObject extends QuestionBase {
  questionType: 'essay' | 'matching' | 'ordering';
}

export type QuestionObject = ChoiceQuestionObject | FillBlankQuestionObject | FutureQuestionObject;

export interface QuestionGroupNode extends DocumentNodeBase {
  kind: 'question-group';
  context: DocumentContentNode[];
  questions: QuestionObject[];
}

/** A semantic section is available for future importers without changing OML. */
export interface SectionNode extends DocumentNodeBase {
  kind: 'section';
  title: string;
  children: DocumentContentNode[];
}

/** Preserves legacy OML blocks that have no Question Object equivalent yet. */
export interface LegacyOmlNode extends DocumentNodeBase {
  kind: 'legacy-oml';
  block: Record<string, unknown>;
}

export type DocumentContentNode =
  | TextNode
  | HeadingNode
  | FormulaNode
  | ImageNode
  | TableNode
  | ListNode
  | CalloutNode
  | QuoteNode
  | DividerNode
  | QuestionObject
  | QuestionGroupNode
  | SectionNode
  | LegacyOmlNode;

export interface QuestionDocument {
  version: '1.0';
  metadata: DocumentMetadata;
  content: DocumentContentNode[];
  reviewMarkers?: DocumentReviewMarker[];
}

export interface DocumentReviewMarker {
  status: 'ai-review-required';
  reason: 'ocr-required' | 'low-parser-confidence' | 'unsupported-structure';
  confidence?: number;
  page?: number;
}

/** Alias retained for teams that prefer the AST terminology. */
export type DocumentAst = QuestionDocument;
