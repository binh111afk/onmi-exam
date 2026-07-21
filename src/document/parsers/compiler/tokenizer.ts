/**
 * Tokenizer — Stage 1 of the Compiler Pipeline.
 *
 * Converts sorted DocumentLayoutNode[] into Token[].
 * NEVER produces a question object. Only assigns surface-level kind.
 *
 * Priority (highest wins):
 *  1. Structural: IMAGE, TABLE
 *  2. NOISE: page numbers, headers, footers, compat markers
 *  3. SECTION_HEADING: explicit heading node type or section keyword
 *  4. INSTRUCTION: range pattern fused with an instruction directive
 *  5. READING_TRIGGER: reading passage triggers
 *  6. FORMULA: LaTeX or math symbol presence
 *  7. QUESTION_MARKER: "Câu N" / "Question N" / bare "N." (with guards)
 *  8. OPTION_MARKER: A–D letter markers (with inline multi-option splitting)
 *  9. PARAGRAPH: everything else
 *
 * A single node may produce multiple tokens (e.g., "A. X B. Y" → 2 OPTION_MARKERs).
 */
import type { DocumentLayoutNode } from '../../../types/document-layout.ts';
import type { RawDocument, RawDocumentNode } from '../../../types/raw-document.ts';
import type { Token } from './tokens.ts';

// ---------------------------------------------------------------------------
// Pattern library — general enough for VACT / SAT / IELTS / ĐGNL / TSA
// ---------------------------------------------------------------------------

/** "Trang N/M", "Trang N trên M", "Page N", standalone page markers */
const RE_PAGE_NUMBER = /^\s*(?:trang|page)\s*\d{1,4}\s*(?:[/|trên]\s*\d{1,4})?\s*$/iu;

/** Bare standalone integer (1–999) — likely a page number if it stands alone */
const RE_BARE_INTEGER = /^\s*\d{1,3}\s*$/u;

/** Header / footer noise: URL, compat markers, doc-generation tags */
const RE_NOISE =
  /^\s*(?:compat=|marker\b|generated\s+by\b|https?:\/\/|www\.|mã\s+đề|code:|đề\s+số\b)/iu;

/** Strings like "ABCDDCBA" — answer key rows from answer tables */
const RE_ANSWER_KEY_ROW = /^[A-Da-d]{5,}$/u;

/**
 * Formula detection — a token is FORMULA if it contains LaTeX commands or
 * common math operator characters that cannot appear in plain prose.
 */
const RE_FORMULA_SIGNAL =
  /(?:\\[a-zA-Z]+\{|\\frac|\\sqrt|\\int|\\sum|\\lim|\\left|\\right|[√∫∑∂∇≤≥≠±×÷∞αβγδεζπθλμσφψω]|\$[^$]+\$|\$\$)/u;

/** Section headings — Vietnamese & English exam formats */
const RE_SECTION_HEADING =
  /^\s*(?:PHẦN|CHƯƠNG|BÀI|SECTION|PART|MODULE)\s+(?:[IVX]+|\d+)\b/iu;

/**
 * Instruction: TWO DISTINCT numbers separated by a range connector,
 * fused with an instructional directive.
 *
 * The question marker guard is critical:
 * "Question 31. Select the correct answer." must NOT become INSTRUCTION.
 * Only "31-35 Choose the correct answer." qualifies.
 */
const RE_QUESTION_VI = /^\s*Câu\s+(\d{1,3})\s*[.:)]\s*(.*)/isu;
const RE_QUESTION_EN = /^\s*Question\s+(\d{1,3})\s*[.:)]\s*(.*)/isu;

const RE_INSTRUCTION_RANGE =
  /^\s*(?:câu|question|câu\s+hỏi)?\s*(\d{1,3})\s*[-–đến\s]+\s*(\d{1,3})\b/iu;

const RE_INSTRUCTION_DIRECTIVE =
  /(?:choose|select|mark|pick|read\s+the\s+(?:following\s+)?(?:passage|text)|đọc\s+(?:đoạn|thông\s+tin)|dựa\s+vào|cho\s+(?:đoạn\s+)?(?:văn\s+)?(?:sau|dưới))/iu;

/**
 * Reading triggers — open a shared context (reading group).
 */
const RE_READING_TRIGGER =
  /^\s*(?:read\s+the\s+(?:following\s+)?(?:passage|text|extract)|based\s+on\s+the\s+(?:following\s+)?(?:passage|information|text)|đọc\s+(?:đoạn\s+)?(?:văn\s+)?(?:sau|sau\s+đây|dưới\s+đây)|dựa\s+vào\s+(?:(?:các\s+)?thông\s+tin|đoạn\s+văn)|cho\s+(?:đoạn\s+)?(?:văn\s+)?(?:sau|dưới))/iu;

/** "Questions 31-35" style — sets up a question group */
const RE_QUESTIONS_RANGE_HEADER =
  /^\s*(?:câu|question(?:s)?)\s+(\d{1,3})\s*[-–]\s*(\d{1,3})\s*[:.)]?\s*$/iu;

/** Bare numbered question "N. stem text" — only if stem is non-empty */
const RE_QUESTION_BARE = /^\s*(\d{1,3})\s*[.)]\s+(\S.*)/su;

/** Fuzzy question pattern — e.g. "Cau 1", "Câ u1", "Q.1" */
const RE_QUESTION_FUZZY = /^\s*(?:câu|question|cau|câ\s*u|q)\s*\.?\s*(\d{1,3})\s*[:.)-]?\s*(.*)/isu;

/** Option markers A–D, a–d, or circled digits ①②③④ */
const RE_OPTION_LETTER = /^\s*([A-Da-d])\s*[.)]\s*/u;
const RE_OPTION_CIRCLED = /^\s*([①②③④])/u;
const RE_OPTION_LETTER_FUZZY = /^\s*([A-Da-d])\s*[,:;-]\s*/u;

// Map circled → letter
const CIRCLED_MAP: Record<string, string> = { '①': 'A', '②': 'B', '③': 'C', '④': 'D' };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const isNoiseText = (text: string): boolean => {
  const trimmed = text.trim();
  if (RE_PAGE_NUMBER.test(trimmed) || RE_NOISE.test(trimmed) || RE_ANSWER_KEY_ROW.test(trimmed)) {
    return true;
  }
  // Diagram labels: single-character sequences separated by spaces (e.g. S V U T Q RP DN A C M B)
  if (/^(?:\s*[a-zA-Z1-9]\s+){3,}[a-zA-Z1-9]?\s*$/u.test(trimmed)) {
    return true;
  }
  // Coordinate labels (e.g. AA/I or B/B)
  if (/^[a-zA-Z]{1,2}\s*[/]\s*[a-zA-Z]{1,2}$/u.test(trimmed)) {
    return true;
  }
  // Diagram flows (e.g. Cà phê Thiết bị Máy xay...)
  if (/^(?:Cà\s+phê|Thiết\s+bị|Máy\s+xay|Dây\s+chuyền|đóng\s+gói|rang\s+hạt)\s+(?:Cà\s+phê|Thiết\s+bị|Máy\s+xay|Dây\s+chuyền|đóng\s+gói|rang\s+hạt)/iu.test(trimmed)) {
    return true;
  }
  return false;
};

const isFormulaText = (text: string): boolean => RE_FORMULA_SIGNAL.test(text);

const isSectionHeadingText = (text: string): boolean => RE_SECTION_HEADING.test(text);

/**
 * Instruction detection: range (N-M, N distinct from M) + directive.
 * Guard: must NOT start with "Câu N." or "Question N." (those are questions).
 */
const detectInstruction = (
  text: string,
): { rangeStart: number; rangeEnd: number } | null => {
  // A question marker takes priority over instruction detection
  if (RE_QUESTION_VI.test(text) || RE_QUESTION_EN.test(text) || RE_QUESTION_FUZZY.test(text)) return null;

  const rangeMatch = RE_INSTRUCTION_RANGE.exec(text);
  if (!rangeMatch) return null;
  const start = parseInt(rangeMatch[1], 10);
  const end = parseInt(rangeMatch[2], 10);
  // Must be a genuine range (start < end)
  if (end <= start) return null;
  if (!RE_INSTRUCTION_DIRECTIVE.test(text)) return null;
  return { rangeStart: start, rangeEnd: end };
};

const detectReadingTrigger = (text: string): boolean => {
  if (RE_READING_TRIGGER.test(text)) return true;
  if (RE_QUESTIONS_RANGE_HEADER.test(text)) return true;
  return false;
};

const detectQuestionMarker = (
  text: string,
): { id: number; stem: string; confidence: number; isFuzzy?: boolean } | null => {
  let m = RE_QUESTION_VI.exec(text);
  if (m) return { id: parseInt(m[1], 10), stem: m[2].trim(), confidence: 0.99 };
  m = RE_QUESTION_EN.exec(text);
  if (m) return { id: parseInt(m[1], 10), stem: m[2].trim(), confidence: 0.99 };
  m = RE_QUESTION_BARE.exec(text);
  if (m) return { id: parseInt(m[1], 10), stem: m[2].trim(), confidence: 0.90 };
  m = RE_QUESTION_FUZZY.exec(text);
  if (m) return { id: parseInt(m[1], 10), stem: m[2].trim(), confidence: 0.75, isFuzzy: true };
  return null;
};

/**
 * Multi-option splitting: "A. X B. Y C. Z D. W" → [{A,X},{B,Y},{C,Z},{D,W}]
 * Returns null if fewer than 2 option markers are found.
 *
 * Uses a lookahead scan: finds each "[A-D]." or "[A-D])" position and slices.
 */
const splitInlineOptions = (
  text: string,
): Array<{ id: string; content: string; confidence: number; isFuzzy?: boolean }> | null => {
  if (!RE_OPTION_LETTER.test(text) && !RE_OPTION_CIRCLED.test(text) && !RE_OPTION_LETTER_FUZZY.test(text)) return null;

  // Match every occurrence of (^|\s)([A-D])[.)], capturing the start index
  const matches = [...text.matchAll(/(?:^|(?<=\s))([A-Da-d])\s*[.:,;-]\s*/gu)];
  if (matches.length < 2) return null;

  const result: Array<{ id: string; content: string; confidence: number; isFuzzy?: boolean }> = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const contentStart = (match.index ?? 0) + match[0].length;
    const nextMatch = matches[i + 1];
    const contentEnd = nextMatch !== undefined ? (nextMatch.index ?? text.length) : text.length;
    const id = match[1].toUpperCase();
    const content = text.slice(contentStart, contentEnd).trim();
    const isFuzzy = match[0].includes(',') || match[0].includes(':') || match[0].includes(';');
    if (content.length > 0) {
      result.push({ id, content, confidence: isFuzzy ? 0.75 : 0.97, isFuzzy });
    }
  }
  return result.length >= 2 ? result : null;
};

const detectSingleOption = (
  text: string,
): { id: string; content: string; confidence: number; isFuzzy?: boolean } | null => {
  let m = RE_OPTION_LETTER.exec(text);
  if (m) return { id: m[1].toUpperCase(), content: text.slice(m[0].length).trim(), confidence: 0.97 };
  m = RE_OPTION_CIRCLED.exec(text);
  if (m) {
    const id = CIRCLED_MAP[m[1]] ?? 'A';
    return { id, content: text.slice(m[0].length).trim(), confidence: 0.85 };
  }
  m = RE_OPTION_LETTER_FUZZY.exec(text);
  if (m) return { id: m[1].toUpperCase(), content: text.slice(m[0].length).trim(), confidence: 0.75, isFuzzy: true };
  return null;
};

// ---------------------------------------------------------------------------
// Tokenizer class
// ---------------------------------------------------------------------------

export class Tokenizer {
  tokenize(
    nodes: DocumentLayoutNode[],
    rawDocument: RawDocument,
  ): Token[] {
    const sorted = [...nodes].sort((a, b) => a.readingOrder - b.readingOrder);
    const tokens: Token[] = [];

    for (const node of sorted) {
      const rawNode: RawDocumentNode | undefined =
        node.rawNodeIndex !== undefined
          ? rawDocument.nodes[node.rawNodeIndex]
          : undefined;

      const emitted = this.tokenizeNode(node, rawNode);
      tokens.push(...emitted);
    }

    return tokens;
  }

  private tokenizeNode(
    node: DocumentLayoutNode,
    rawNode: RawDocumentNode | undefined,
  ): Token[] {
    const base = {
      rawNodeIndex: node.rawNodeIndex ?? -1,
      page: node.page,
      readingOrder: node.readingOrder,
    };

    const nodeConf = node.confidence ?? 1.0;

    const t = (
      kind: Token['kind'],
      text: string,
      meta: Token['meta'] = {},
      conf = 1.0,
    ): Token => ({
      ...base,
      kind,
      text,
      meta,
      confidence: Math.round(Math.min(1.0, Math.max(0.0, nodeConf * conf)) * 100) / 100,
    });

    const single = (
      kind: Token['kind'],
      text: string,
      meta: Token['meta'] = {},
      conf = 1.0,
    ): Token[] => [t(kind, text, meta, conf)];

    // ── 1. Structural nodes ──────────────────────────────────────────────
    if (rawNode?.kind === 'image') return single('IMAGE', rawNode.alt ?? '', {}, 1.0);
    if (rawNode?.kind === 'table') return single('TABLE', '', {}, 1.0);

    const text = node.text?.trim() ?? '';
    if (!text) return single('NOISE', '', {}, 1.0);

    // ── 2. Noise ─────────────────────────────────────────────────────────
    if (isNoiseText(text)) return single('NOISE', text, {}, 1.0);

    // ── 3. Explicit heading node type ────────────────────────────────────
    if (node.type === 'heading') return single('SECTION_HEADING', text, {}, 1.0);

    // ── 4. Section heading by text pattern ───────────────────────────────
    if (isSectionHeadingText(text)) return single('SECTION_HEADING', text, {}, 1.0);

    // ── 5. Reading trigger (explicit candidate hint or text pattern) ────────
    if (node.type === 'reading-candidate' || detectReadingTrigger(text)) {
      return single('READING_TRIGGER', text, {}, 0.95);
    }

    // ── 6. Instruction (range N-M + directive) ────────────────────────────
    const instr = detectInstruction(text);
    if (instr) {
      return single('INSTRUCTION', text, {
        rangeStart: instr.rangeStart,
        rangeEnd: instr.rangeEnd,
      }, 0.95);
    }

    // ── 7. Formula ───────────────────────────────────────────────────────
    // Guard: if text starts with "A." "B)" etc., it is an option line, not a
    // pure formula — even if it contains math symbols like π, ²
    if (
      isFormulaText(text) &&
      !RE_QUESTION_VI.test(text) &&
      !RE_QUESTION_EN.test(text) &&
      !RE_QUESTION_FUZZY.test(text) &&
      !RE_OPTION_LETTER.test(text) &&
      !RE_OPTION_CIRCLED.test(text) &&
      !RE_OPTION_LETTER_FUZZY.test(text)
    ) {
      return single('FORMULA', text, {}, 0.90);
    }

    // ── 8. Question marker ───────────────────────────────────────────────
    if (!RE_BARE_INTEGER.test(text)) {
      const question = detectQuestionMarker(text);
      if (question) {
        return single('QUESTION_MARKER', question.stem, {
          questionId: question.id,
          isFuzzy: question.isFuzzy,
        }, question.confidence);
      }
    }

    // ── 9. Option markers (with inline multi-option splitting) ─────────────
    const inlineOpts = splitInlineOptions(text);
    if (inlineOpts !== null) {
      return inlineOpts.map((opt): Token =>
        t('OPTION_MARKER', opt.content, { optionId: opt.id, isFuzzy: opt.isFuzzy }, opt.confidence),
      );
    }

    const singleOpt = detectSingleOption(text);
    if (singleOpt) {
      return single('OPTION_MARKER', singleOpt.content, { optionId: singleOpt.id, isFuzzy: singleOpt.isFuzzy }, singleOpt.confidence);
    }

    // ── 10. Paragraph ────────────────────────────────────────────────────
    return single('PARAGRAPH', text, {}, 0.90);
  }
}
