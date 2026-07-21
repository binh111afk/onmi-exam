/**
 * QuestionGraphBuilder — Stage 5 of the Compiler Pipeline.
 *
 * Converts SemanticBlock[] into a structured DocumentGraph.
 *
 * Key rules:
 * - Questions NEVER copy context. They reference a reading passage by id.
 * - A question group is formed when 2+ questions follow a reading passage.
 * - Standalone questions (not preceded by a reading) are emitted directly.
 * - Sections aggregate their children but are not structural wrappers here;
 *   the OML generator handles section headings as standalone heading blocks.
 * - Math formulas are attached to the preceding question when possible.
 */
import type { QuestionSubtype, SemanticBlock, SemanticOption } from './semanticAnalyzer.ts';

// ---------------------------------------------------------------------------
// Graph node types — internal representation before OML generation
// ---------------------------------------------------------------------------

export interface GraphQuestion {
  kind: 'question';
  id: number;
  subType?: QuestionSubtype;
  stem: string;
  options: SemanticOption[];
  formulas: string[];
  /** If set, this question belongs to the reading passage with this id */
  readingGroupId?: string;
  page: number;
  confidence: number;
}

export interface GraphReadingPassage {
  kind: 'reading';
  /** Deterministic id: "reading-<firstQuestionId>" assigned after group is closed */
  id: string;
  paragraphs: string[];
  questions: GraphQuestion[];
  page: number;
}

export interface GraphHeading {
  kind: 'heading';
  text: string;
  page: number;
}

export interface GraphInstruction {
  kind: 'instruction';
  text: string;
  rangeStart?: number;
  rangeEnd?: number;
  page: number;
}

export interface GraphParagraph {
  kind: 'paragraph';
  text: string;
  page: number;
}

export interface GraphFormula {
  kind: 'formula';
  text: string;
  page: number;
}

export interface GraphImage {
  kind: 'image';
  text: string;
  page: number;
}

export interface GraphTable {
  kind: 'table';
  text: string;
  page: number;
}

export type GraphNode =
  | GraphHeading
  | GraphInstruction
  | GraphParagraph
  | GraphFormula
  | GraphImage
  | GraphTable
  | GraphQuestion
  | GraphReadingPassage;

export interface DocumentGraph {
  nodes: GraphNode[];
}

// ---------------------------------------------------------------------------
// QuestionGraphBuilder
// ---------------------------------------------------------------------------

export class QuestionGraphBuilder {
  build(semanticBlocks: SemanticBlock[]): DocumentGraph {
    const nodes: GraphNode[] = [];
    let pendingReading: {
      paragraphs: string[];
      page: number;
    } | null = null;
    let activeGroup: GraphReadingPassage | null = null;

    const flushPendingReading = () => {
      if (pendingReading === null) return;
      if (pendingReading.paragraphs.length > 0) {
        nodes.push({ kind: 'paragraph', text: pendingReading.paragraphs.join('\n\n'), page: pendingReading.page });
      }
      pendingReading = null;
    };

    const commitGroup = () => {
      if (activeGroup !== null) {
        if (activeGroup.questions.length >= 1) {
          nodes.push(activeGroup);
        } else {
          const { paragraphs, questions, page } = activeGroup;
          if (paragraphs.length > 0) {
            nodes.push({ kind: 'paragraph', text: paragraphs.join('\n\n'), page });
          }
          for (const q of questions) nodes.push(q);
        }
        activeGroup = null;
      }
      flushPendingReading();
    };

    for (const block of semanticBlocks) {
      switch (block.role) {
        case 'section-heading':
          commitGroup();
          nodes.push({ kind: 'heading', text: block.text, page: block.page });
          break;

        case 'instruction':
          commitGroup();
          nodes.push({
            kind: 'instruction',
            text: block.text,
            rangeStart: block.instruction?.rangeStart,
            rangeEnd: block.instruction?.rangeEnd,
            page: block.page,
          });
          break;

        case 'reading-passage':
          commitGroup();
          pendingReading = {
            paragraphs: block.paragraphs ?? [block.text],
            page: block.page,
          };
          break;

        case 'paragraph':
          if (pendingReading !== null) {
            // More reading context before any question — accumulate
            pendingReading.paragraphs.push(block.text);
          } else {
            commitGroup();
            nodes.push({ kind: 'paragraph', text: block.text, page: block.page });
          }
          break;

        case 'formula':
          commitGroup();
          nodes.push({ kind: 'formula', text: block.text, page: block.page });
          break;

        case 'image':
          nodes.push({ kind: 'image', text: block.text, page: block.page });
          break;

        case 'table':
          nodes.push({ kind: 'table', text: block.text, page: block.page });
          break;

        case 'question': {
          if (block.questionId === undefined) break;
          const question: GraphQuestion = {
            kind: 'question',
            id: block.questionId,
            subType: block.subType ?? 'choice',
            stem: block.stem ?? '',
            options: block.options ?? [],
            formulas: block.formulas ?? [],
            page: block.page,
            confidence: block.confidence ?? 1.0,
          };

          if (pendingReading !== null) {
            // Start a new reading group
            const groupId = `reading-${block.questionId}`;
            question.readingGroupId = groupId;
            activeGroup = {
              kind: 'reading',
              id: groupId,
              paragraphs: pendingReading.paragraphs,
              questions: [question],
              page: pendingReading.page,
            };
            pendingReading = null;
          } else if (activeGroup !== null) {
            // Add to existing group
            question.readingGroupId = activeGroup.id;
            activeGroup.questions.push(question);
          } else {
            nodes.push(question);
          }
          break;
        }

        default:
          break;
      }
    }

    commitGroup();
    return { nodes };
  }
}
