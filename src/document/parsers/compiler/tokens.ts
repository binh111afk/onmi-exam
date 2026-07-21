/**
 * Token types produced by the Tokenizer stage.
 *
 * RULE: The Tokenizer NEVER produces a question. It only emits markers.
 * Semantic meaning is assigned by later stages.
 */
export type TokenKind =
  | 'QUESTION_MARKER'   // "Câu 12", "Question 31", "12." (bare number)
  | 'OPTION_MARKER'     // "A.", "B)", "①②③④"
  | 'SECTION_HEADING'   // "PHẦN I", "SECTION A", node.type === 'heading'
  | 'INSTRUCTION'       // "Câu 31-35: Choose…" — range + directive fused
  | 'READING_TRIGGER'   // "Dựa vào…", "Read the passage…", "Questions 31-35"
  | 'PAGE_NUMBER'       // "Trang 5/5", "Page 2", standalone bare integer
  | 'FORMULA'           // LaTeX, √, ∫, Σ, ≤, ≥ …
  | 'PARAGRAPH'         // plain text that doesn't match above
  | 'IMAGE'             // image node
  | 'TABLE'             // table node
  | 'NOISE';            // header/footer/compat/OCR artefact

export interface TokenMeta {
  /** Extracted question number for QUESTION_MARKER */
  questionId?: number;
  /** Extracted option letter for OPTION_MARKER */
  optionId?: string;
  /** For INSTRUCTION: first question in the range */
  rangeStart?: number;
  /** For INSTRUCTION: last question in the range */
  rangeEnd?: number;
  /** True if token was matched using fuzzy patterns */
  isFuzzy?: boolean;
  /** True if token was fixed during OCR normalization */
  isOcrFixed?: boolean;
}

export interface Token {
  kind: TokenKind;
  /** Cleaned surface text (marker stripped for QUESTION_MARKER / OPTION_MARKER) */
  text: string;
  /** Index into RawDocument.nodes */
  rawNodeIndex: number;
  page: number;
  readingOrder: number;
  meta: TokenMeta;
  /** Confidence score between 0.0 and 1.0 */
  confidence: number;
}
