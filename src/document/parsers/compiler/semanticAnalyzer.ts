/**
 * SemanticAnalyzer — Stage 4 of the Compiler Pipeline.
 *
 * Reads the entire LogicalBlock[] array and assigns semantic roles
 * based on CONTEXT, not just the content of individual blocks.
 *
 * Key context-driven decisions:
 * - A QuestionCandidate without following options → paragraph (recovery)
 * - A QuestionCandidate with duplicate ID → discarded (deduplicated later)
 * - An Instruction block always stays as Instruction (never becomes question)
 * - A Reading block always stays as Reading passage context
 * - A SECTION_HEADING always stays as section (never becomes question)
 */
import { normalizeMathAndText } from './documentNormalizer.ts';
import type { LogicalBlock, LogicalOption } from './logicalBlockBuilder.ts';

// ---------------------------------------------------------------------------
// Semantic types
// ---------------------------------------------------------------------------

export type QuestionSubtype = 'choice' | 'true-false' | 'fill-blank' | 'essay' | 'matching' | 'unknown';

export type SemanticRole =
  | 'section-heading'
  | 'instruction'
  | 'reading-passage'
  | 'question'
  | 'formula'
  | 'paragraph'
  | 'image'
  | 'table';

export interface InstructionObject {
  text: string;
  rangeStart?: number;
  rangeEnd?: number;
}

export interface SemanticOption {
  id: string;
  content: string;
  confidence: number;
  isFuzzy?: boolean;
}

export interface SemanticBlock {
  role: SemanticRole;
  subType?: QuestionSubtype;
  page: number;
  /** Heading or paragraph text */
  text: string;
  /** For 'question': the question number */
  questionId?: number;
  /** For 'question': the full stem text */
  stem?: string;
  /** For 'question': validated options */
  options?: SemanticOption[];
  /** For 'question': attached formula texts */
  formulas?: string[];
  /** For 'instruction': structured instruction */
  instruction?: InstructionObject;
  /** For 'reading-passage': sub-paragraphs */
  paragraphs?: string[];
  /** Overall block/question confidence */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const joinLines = (lines: string[]): string => lines.join('\n\n').trim();

const optionContent = (opt: LogicalOption): string =>
  opt.lines.join('\n').trim();

/**
 * Detects the question subtype (choice, true-false, fill-blank, essay).
 */
export const detectQuestionSubtype = (
  block: LogicalBlock,
  currentSectionHeading?: string,
): QuestionSubtype => {
  const headingLower = (currentSectionHeading ?? '').toLowerCase();

  // 1. Section Heading Context Priority
  if (headingLower.includes('đúng sai') || headingLower.includes('true-false')) {
    return 'true-false';
  }
  if (headingLower.includes('trả lời ngắn') || headingLower.includes('điền') || headingLower.includes('fill-blank') || headingLower.includes('short answer')) {
    return 'fill-blank';
  }
  if (headingLower.includes('tự luận') || headingLower.includes('essay') || headingLower.includes('đọc hiểu') || headingLower.includes('viết')) {
    if (block.options.length < 2) {
      return 'essay';
    }
  }

  // 2. Options structural check
  if (block.options.length >= 2) {
    const isTrueFalse = block.options.every((opt) => {
      const content = opt.lines.join(' ').trim().toLowerCase();
      const isStatementLabel = /^[a-d]\s*[.)]/i.test(content);
      const isAnswerWord = content === 'đúng' || content === 'sai' || content === 'true' || content === 'false' || opt.id === 'Đ' || opt.id === 'S';
      return isStatementLabel || isAnswerWord;
    });
    return isTrueFalse ? 'true-false' : 'choice';
  }

  // 3. Stem patterns check
  const fullStem = block.stemLines.join(' ');
  if (/_{3,}|\[\.\.\.\]|\[blank/iu.test(fullStem)) {
    return 'fill-blank';
  }

  if (block.questionId !== undefined || block.stemLines.length > 0) {
    return 'essay';
  }

  return 'unknown';
};

/**
 * Returns true when a QuestionCandidate has enough structure to be treated as a question.
 * A question is viable if it has a questionId or non-empty stem text.
 */
const isViableQuestion = (block: LogicalBlock): boolean => {
  if (block.questionId !== undefined) return true;
  return block.stemLines.join('').trim().length > 0;
};

// ---------------------------------------------------------------------------
// SemanticAnalyzer
// ---------------------------------------------------------------------------

export class SemanticAnalyzer {
  private lastQuestionId: number | null = null;
  private lastSectionHeading: string | null = null;

  analyze(blocks: LogicalBlock[]): SemanticBlock[] {
    const output: SemanticBlock[] = [];
    const seenIds = new Set<number>();
    let currentSectionHeading = '';
    this.lastQuestionId = null;
    this.lastSectionHeading = null;

    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      if (block.kind === 'Heading') {
        currentSectionHeading = block.text;
      }
      const semantic = this.analyzeBlock(block, seenIds, blocks, index, output, currentSectionHeading);
      if (semantic !== null) output.push(semantic);
    }

    return output;
  }

  private analyzeBlock(
    block: LogicalBlock,
    seenIds: Set<number>,
    _allBlocks: LogicalBlock[],
    _index: number,
    output: SemanticBlock[],
    currentSectionHeading?: string,
  ): SemanticBlock | null {
    const blockConf = block.confidence ?? 1.0;

    switch (block.kind) {
      case 'Heading':
        return { role: 'section-heading', page: block.page, text: block.text, confidence: blockConf };

      case 'Instruction':
        return {
          role: 'instruction',
          page: block.page,
          text: block.text,
          instruction: {
            text: block.text,
            rangeStart: block.rangeStart,
            rangeEnd: block.rangeEnd,
          },
          confidence: blockConf,
        };

      case 'Reading':
        return {
          role: 'reading-passage',
          page: block.page,
          text: block.paragraphs[0] ?? block.text,
          paragraphs: block.paragraphs,
          confidence: blockConf,
        };

      case 'Formula':
        return { role: 'formula', page: block.page, text: block.text, confidence: blockConf };

      case 'Image':
        return { role: 'image', page: block.page, text: block.text, confidence: blockConf };

      case 'Table':
        return { role: 'table', page: block.page, text: block.text, confidence: blockConf };

      case 'Paragraph':
        return { role: 'paragraph', page: block.page, text: block.text, confidence: blockConf };

      case 'QuestionCandidate': {
        if (!isViableQuestion(block)) {
          const text = [
            block.questionId !== undefined
              ? `Câu ${block.questionId}.`
              : '',
            joinLines(block.stemLines),
          ]
            .filter(Boolean)
            .join(' ')
            .trim();
          return text ? { role: 'paragraph', page: block.page, text, confidence: 0.60 } : null;
        }

        let id = block.questionId!;

        // Handle section resets (e.g. Part II / Part III starting at Câu 1 again)
        if (seenIds.has(id)) {
          const maxSeen = seenIds.size > 0 ? Math.max(...Array.from(seenIds)) : 0;
          if (id <= (this.lastQuestionId ?? 0) || (currentSectionHeading && currentSectionHeading !== this.lastSectionHeading)) {
            id = maxSeen + 1;
          } else {
            return null;
          }
        }
        seenIds.add(id);
        this.lastQuestionId = id;
        this.lastSectionHeading = currentSectionHeading ?? null;

        const subType = detectQuestionSubtype(block, currentSectionHeading);
        let stemText = joinLines(block.stemLines).replace(/^\s*\[MAP(?:STUDY)?\]\s*/gi, '').trim();

        // Merge preceding unassigned paragraph blocks for True-False & Fill-Blank
        if (subType === 'true-false' || subType === 'fill-blank') {
          const contextParas: string[] = [];
          while (
            output.length > 0 &&
            output[output.length - 1].role === 'paragraph' &&
            !/^\s*(?:câu|question|cau)\s+\d+\b/iu.test(output[output.length - 1].text) &&
            !/^\s*[a-d][.)]/iu.test(output[output.length - 1].text)
          ) {
            const prev = output.pop()!;
            contextParas.unshift(prev.text);
          }
          if (contextParas.length > 0) {
            stemText = `${contextParas.join('\n\n')}\n\n${stemText}`;
          }
        }

        stemText = normalizeMathAndText(stemText);

        if (subType === 'fill-blank') {
          const blankCount = (stemText.match(/\[blank-\d+\]|___|\[\.\.\.\]/gi) ?? []).length;
          if (blankCount === 0) {
            stemText = `${stemText} [blank-1]`;
          }
        }

        const options = block.options.map((opt) => ({
          id: opt.id,
          content: normalizeMathAndText(optionContent(opt)),
          confidence: opt.confidence ?? 0.95,
          isFuzzy: opt.isFuzzy,
        }));

        const stemConf = blockConf;
        const avgOptConf = options.length > 0
          ? options.reduce((sum, o) => sum + o.confidence, 0) / options.length
          : 0.80;
        const boundaryConf = options.length === 4 ? 1.0 : options.length > 0 ? 0.90 : 0.85;
        const overallConf = Math.round((0.4 * stemConf + 0.4 * avgOptConf + 0.2 * boundaryConf) * 100) / 100;

        return {
          role: 'question',
          subType,
          page: block.page,
          questionId: id,
          stem: stemText,
          options,
          formulas: block.formulas,
          text: '',
          confidence: overallConf,
        };
      }

      default:
        return null;
    }
  }
}
