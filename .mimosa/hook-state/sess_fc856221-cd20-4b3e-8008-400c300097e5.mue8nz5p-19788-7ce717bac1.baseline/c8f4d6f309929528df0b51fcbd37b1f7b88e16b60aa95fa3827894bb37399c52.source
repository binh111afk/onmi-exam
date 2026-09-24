export type OmlId = string | number;

export type OmlImageSize = 'small' | 'medium' | 'full';

export type OmlQuestionSubType = 'choice' | 'true-false' | 'fill-blank' | 'essay' | 'matching' | 'unknown';

export type OmlDifficulty = 'easy' | 'medium' | 'hard';

export interface OmlInfo {
  title: string;
  subject?: string;
  grade?: number | string;
  time?: number;
  type?: 'exam' | 'practice' | 'worksheet' | string;
  difficulty?: OmlDifficulty | string;
  description?: string;
  author?: string;
  allowReview?: boolean;
  shuffle?: boolean;
  totalQuestion?: number;
}

export interface OmlImageAsset {
  src: string;
  alt?: string;
  caption?: string;
  /**
   * Preview engines should default to "medium" when omitted.
   * small ~= max-w-xs, medium ~= max-w-xl, full ~= w-full.
   */
  size?: OmlImageSize;
}

export interface OmlHeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3;
  text: string;
}

export interface OmlParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface OmlDividerBlock {
  type: 'divider';
}

export interface OmlQuoteBlock {
  type: 'quote';
  text: string;
  cite?: string;
}

export interface OmlCalloutBlock {
  type: 'callout';
  variant?: 'info' | 'warning' | 'success' | 'error';
  icon?: string;
  title?: string;
  content: string;
}

export interface OmlImageBlock extends OmlImageAsset {
  type: 'image';
  width?: number;
}

export interface OmlImageGroupItem extends OmlImageAsset {}

export interface OmlImageGroupBlock {
  type: 'image-group';
  layout: 'horizontal' | 'vertical' | 'grid-2x2';
  items: OmlImageGroupItem[];
}

export interface OmlFormulaBlock {
  type: 'formula';
  latex: string;
  display?: 'inline' | 'block';
}

export interface OmlTableBlock {
  type: 'table';
  caption?: string;
  headers?: string[];
  rows: string[][];
}

export interface OmlListBlock {
  type: 'list';
  ordered?: boolean;
  items: string[];
}

export interface OmlQuestionOption {
  id: OmlId;
  content: string;
}

export interface OmlQuestionBaseBlock {
  type: 'question';
  id: OmlId;
  question: string;
  points?: number;
  difficulty?: OmlDifficulty;
  tags?: string[];
  image?: OmlImageAsset;
  explanation?: string;
}

export interface OmlChoiceQuestionBlock extends OmlQuestionBaseBlock {
  subType?: 'choice';
  options: OmlQuestionOption[];
  answer: OmlId[];
}

export interface OmlTrueFalseQuestionBlock extends OmlQuestionBaseBlock {
  subType: 'true-false';
  options: OmlQuestionOption[];
  /** IDs of statements marked true. Missing IDs are interpreted as false. */
  answer: OmlId[];
}

export interface OmlFillBlankQuestionBlock extends OmlQuestionBaseBlock {
  subType: 'fill-blank';
  options?: OmlQuestionOption[];
  /** Exact accepted blank values, ordered by blank token such as [blank-1]. */
  answer: string[];
  /** Optional unit displayed outside the answer input, e.g. "eV". */
  unit?: string;
  /** Optional per-blank units for multi-blank questions. */
  units?: string[];
  blankUnits?: string[];
  /** Preview hint: false renders student input mode, true renders answer mode. */
  showAnswer?: boolean;
}

export interface OmlEssayQuestionBlock extends OmlQuestionBaseBlock {
  subType: 'essay';
  options?: OmlQuestionOption[];
  answer?: OmlId[];
}

export type OmlQuestionBlock =
  | OmlChoiceQuestionBlock
  | OmlTrueFalseQuestionBlock
  | OmlFillBlankQuestionBlock
  | OmlEssayQuestionBlock;

export type OmlContextBlock =
  | OmlHeadingBlock
  | OmlParagraphBlock
  | OmlDividerBlock
  | OmlQuoteBlock
  | OmlCalloutBlock
  | OmlImageBlock
  | OmlImageGroupBlock
  | OmlFormulaBlock
  | OmlTableBlock
  | OmlListBlock;

export interface OmlQuestionGroupBlock {
  type: 'question-group';
  id: OmlId;
  context: OmlContextBlock[];
  questions: OmlQuestionBlock[];
}

export interface OmlFallbackBlock {
  type: string;
  [key: string]: unknown;
}

export type OmlContentBlock =
  | OmlContextBlock
  | OmlQuestionBlock
  | OmlQuestionGroupBlock
  | OmlFallbackBlock;

export interface OmlDocumentV2 {
  version: '2.0';
  info: OmlInfo;
  content: OmlContentBlock[];
}
