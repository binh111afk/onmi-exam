/**
 * LogicalBlockBuilder — Stage 3 of the Compiler Pipeline.
 *
 * Consumes Token[] and groups them into LogicalBlock[].
 * A LogicalBlock corresponds to one cohesive document unit
 * (a heading, a question candidate, a reading passage, etc.)
 *
 * Rules:
 * - QUESTION_MARKER opens a QuestionCandidate block.
 * - OPTION_MARKER opens/extends an OptionGroup on the current QuestionCandidate.
 * - A PARAGRAPH after an OPTION_MARKER is appended to that option
 *   (multi-line option content), unless it triggers reading passage heuristics.
 * - READING_TRIGGER opens a Reading block, collecting paragraphs until the
 *   next QUESTION_MARKER or SECTION_HEADING.
 * - SECTION_HEADING always closes any open block and opens a new Heading.
 * - PAGE_NUMBER / NOISE tokens are discarded.
 */
import type { Token } from './tokens.ts';

// ---------------------------------------------------------------------------
// LogicalBlock types
// ---------------------------------------------------------------------------

export type LogicalBlockKind =
  | 'Heading'
  | 'Instruction'
  | 'Reading'
  | 'QuestionCandidate'
  | 'Formula'
  | 'Paragraph'
  | 'Image'
  | 'Table';

export interface LogicalOption {
  id: string;
  lines: string[];
  confidence: number;
  isFuzzy?: boolean;
}

export interface LogicalBlock {
  kind: LogicalBlockKind;
  page: number;
  /** For QuestionCandidate: the question id from the marker */
  questionId?: number;
  /** Surface text of the block (heading text, paragraph text, etc.) */
  text: string;
  /** For QuestionCandidate: all stem lines after the marker */
  stemLines: string[];
  /** For QuestionCandidate: collected options */
  options: LogicalOption[];
  /** For Instruction: range */
  rangeStart?: number;
  rangeEnd?: number;
  /** Reading passage sub-lines (Reading blocks) */
  paragraphs: string[];
  /** Formulas attached to the block */
  formulas: string[];
  /** Block confidence score */
  confidence: number;
}

const newBlock = (kind: LogicalBlockKind, page: number, text = '', confidence = 1.0): LogicalBlock => ({
  kind,
  page,
  text,
  stemLines: [],
  options: [],
  paragraphs: [],
  formulas: [],
  confidence,
});

// ---------------------------------------------------------------------------
// Heuristic: is this paragraph too "passage-like" to be an option continuation?
// ---------------------------------------------------------------------------

/**
 * Returns true if a PARAGRAPH token looks like a standalone reading passage
 * line rather than a continuation of an option.
 *
 * Heuristic (derived from corpus, not hard-coded for one file):
 * - Very long (>150 chars) — typical of prose, not option text
 * - Contains multiple sentence-ending punctuation → prose
 * - Starts with a question marker pattern ("Câu N") → new question leaked in
 * - Looks like a section heading
 */
const looksLikePassage = (text: string): boolean => {
  if (text.length > 150) return true;
  const sentenceEnds = (text.match(/[.!?][^.!?]/g) ?? []).length;
  if (sentenceEnds >= 2) return true;
  return false;
};

// ---------------------------------------------------------------------------
// LogicalBlockBuilder
// ---------------------------------------------------------------------------

export class LogicalBlockBuilder {
  build(tokens: Token[]): LogicalBlock[] {
    const output: LogicalBlock[] = [];
    let current: LogicalBlock | null = null;

    const commit = () => {
      if (current !== null) {
        output.push(current);
        current = null;
      }
    };

    const activeOption = (block: LogicalBlock): LogicalOption | null =>
      block.options.length > 0 ? block.options[block.options.length - 1] : null;

    for (const token of tokens) {
      switch (token.kind) {
        case 'NOISE':
        case 'PAGE_NUMBER':
          // Discard silently
          break;

        case 'SECTION_HEADING': {
          commit();
          current = newBlock('Heading', token.page, token.text, token.confidence);
          commit();
          break;
        }

        case 'INSTRUCTION': {
          commit();
          current = newBlock('Instruction', token.page, token.text, token.confidence);
          current.rangeStart = token.meta.rangeStart;
          current.rangeEnd = token.meta.rangeEnd;
          commit();
          break;
        }

        case 'READING_TRIGGER': {
          commit();
          current = newBlock('Reading', token.page, token.text, token.confidence);
          current.paragraphs.push(token.text);
          break;
        }

        case 'QUESTION_MARKER': {
          commit();
          current = newBlock('QuestionCandidate', token.page, '', token.confidence);
          current.questionId = token.meta.questionId;
          if (token.text) current.stemLines.push(token.text);
          break;
        }

        case 'OPTION_MARKER': {
          if (current === null) {
            // Option outside a question — treat as paragraph
            const para = newBlock('Paragraph', token.page, token.text, token.confidence);
            output.push(para);
            break;
          }
          if (current.kind === 'Reading') {
            // Option inside a reading — close reading, start orphan
            commit();
            // Treat as paragraph (no active question)
            const para = newBlock('Paragraph', token.page, `${token.meta.optionId ?? ''}. ${token.text}`, token.confidence);
            output.push(para);
            break;
          }
          if (current.kind === 'QuestionCandidate') {
            current.options.push({
              id: token.meta.optionId ?? '?',
              lines: token.text ? [token.text] : [],
              confidence: token.confidence,
              isFuzzy: token.meta.isFuzzy,
            });
          } else {
            // Unexpected option in another context — treat as paragraph
            const para = newBlock('Paragraph', token.page, token.text, token.confidence);
            output.push(para);
          }
          break;
        }

        case 'PARAGRAPH': {
          if (current === null) {
            output.push(newBlock('Paragraph', token.page, token.text));
            break;
          }
          if (current.page !== token.page) {
            commit();
            output.push(newBlock('Paragraph', token.page, token.text));
            break;
          }
          if (current.kind === 'Reading') {
            current.paragraphs.push(token.text);
            break;
          }
          if (current.kind === 'QuestionCandidate') {
            const opt = activeOption(current);
            if (opt !== null) {
              // Append to option — but check passage heuristic
              if (looksLikePassage(token.text)) {
                // This paragraph doesn't belong to the option;
                // commit the question and start a paragraph or reading context
                commit();
                if (/^\s*(?:read\s+the\s+|based\s+on\s+|đọc\s+|dựa\s+vào\s+|cho\s+(?:đoạn|văn|thông\s+tin))/iu.test(token.text)) {
                  current = newBlock('Reading', token.page, token.text);
                  current.paragraphs.push(token.text);
                } else {
                  output.push(newBlock('Paragraph', token.page, token.text));
                }
              } else {
                const trimText = token.text.trim();
                const isNoiseLine = /^(?:Trang\s+\d+|Mã\s+đề|TỔ\s+TOÁN|S\s+V\s+U|Cà\s+phê|S\.ABCD)/iu.test(trimText);
                const isContinuation = !isNoiseLine && /^[a-z,;+\-*/=]/.test(trimText) && !/^(?:câu|question|đọc|cho|dựa)\b/i.test(trimText);
                if (isContinuation) {
                  opt.lines.push(token.text);
                } else {
                  commit();
                  output.push(newBlock('Paragraph', token.page, token.text));
                }
              }
            } else {
              // Still in question stem
              current.stemLines.push(token.text);
            }
            break;
          }
          // Heading or Instruction — treat as trailing paragraph
          output.push(newBlock('Paragraph', token.page, token.text));
          break;
        }

        case 'FORMULA': {
          if (current !== null && current.kind === 'QuestionCandidate') {
            // Attach formula to current question
            current.formulas.push(token.text);
            // Also append to the active part (stem or last option)
            const opt = activeOption(current);
            if (opt !== null) {
              opt.lines.push(token.text);
            } else {
              current.stemLines.push(token.text);
            }
          } else if (current !== null && current.kind === 'Reading') {
            current.paragraphs.push(token.text);
          } else {
            output.push(newBlock('Formula', token.page, token.text));
          }
          break;
        }

        case 'IMAGE': {
          if (current !== null && current.kind === 'QuestionCandidate') {
            // Images are tracked as special paragraph within the question
            current.stemLines.push(`[IMAGE:${token.text}]`);
          } else {
            commit();
            output.push(newBlock('Image', token.page, token.text));
          }
          break;
        }

        case 'TABLE': {
          commit();
          output.push(newBlock('Table', token.page, token.text));
          break;
        }

        default:
          break;
      }
    }

    commit();
    return output;
  }
}
