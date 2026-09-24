/**
 * OmlGenerator — Stage 6 of the Compiler Pipeline.
 *
 * Converts a validated DocumentGraph into a QuestionDocument
 * (the canonical internal representation used by the rest of the system).
 *
 * Produces:
 * - HeadingNode for section headings
 * - TextNode for paragraphs and instructions
 * - FormulaNode for formula blocks
 * - ImageNode for image blocks
 * - TableNode for table blocks
 * - ChoiceQuestionObject for standalone questions
 * - QuestionGroupNode for grouped reading questions
 */
import type {
  ChoiceQuestionObject,
  DocumentContentNode,
  DocumentMetadata,
  DocumentReviewMarker,
  FutureQuestionObject,
  HeadingNode,
  QuestionDocument,
  QuestionGroupNode,
  QuestionObject,
  TextNode,
} from '../../../types/question-object.ts';
import type { DocumentNormalizer } from './documentNormalizer.ts';
import type {
  DocumentGraph,
  GraphNode,
  GraphQuestion,
  GraphReadingPassage,
} from './questionGraphBuilder.ts';
import type { ValidationDiagnostics } from './validator.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toHeading = (text: string, page: number): HeadingNode => ({
  kind: 'heading',
  level: 1,
  text,
  source: { page },
});

const toParagraph = (text: string, page: number): TextNode => ({
  kind: 'text',
  text,
  source: { page },
});

const toQuestion = (q: GraphQuestion): QuestionObject => {
  const subType = q.subType ?? 'choice';
  const points = subType === 'choice' ? 0.25 : subType === 'true-false' ? 1.0 : subType === 'fill-blank' ? 0.5 : 1.0;
  const difficulty = 'medium';
  const tags = ['Toán Học'];

  if (subType === 'essay') {
    const essayObj: FutureQuestionObject = {
      kind: 'question',
      questionType: 'essay',
      id: q.id,
      question: q.stem,
      points,
      difficulty,
      tags,
      source: { page: q.page, confidence: q.confidence },
    } as any;
    return essayObj;
  }

  const questionType = subType === 'true-false' ? 'true-false' : subType === 'fill-blank' ? 'fill-blank' : 'choice';

  const finalAnswers = q.answers && q.answers.length > 0 ? q.answers : [];

  const choiceObj: ChoiceQuestionObject = {
    kind: 'question',
    questionType: questionType as any,
    id: q.id,
    question: q.stem,
    options: q.options.map((opt) => ({ id: opt.id, content: opt.content })),
    answer: finalAnswers,
    points,
    difficulty,
    tags,
    source: { page: q.page, confidence: q.confidence },
  } as any;
  return choiceObj;
};

const readingToContextNodes = (passage: GraphReadingPassage): DocumentContentNode[] =>
  passage.paragraphs.map((text): TextNode => ({ kind: 'text', text, source: { page: passage.page } }));

// ---------------------------------------------------------------------------
// OmlGenerator
// ---------------------------------------------------------------------------

export class OmlGenerator {
  generate(
    graph: DocumentGraph,
    metadata: DocumentMetadata,
    diagnostics?: ValidationDiagnostics,
    _normStats?: InstanceType<typeof DocumentNormalizer> extends { normalize(...args: any[]): { stats: infer S } } ? S : never,
  ): QuestionDocument {
    const content: DocumentContentNode[] = [];
    const reviewMarkers: DocumentReviewMarker[] = [];

    for (const node of graph.nodes) {
      const emitted = this.emitNode(node);
      content.push(...emitted);
    }

    if (diagnostics) {
      if (diagnostics.status === 'PASS_WITH_RECOVERY' || diagnostics.status === 'WARNING' || diagnostics.averageConfidence < 0.85) {
        reviewMarkers.push({
          status: 'ai-review-required',
          reason: 'low-parser-confidence',
          confidence: diagnostics.averageConfidence,
        });
      }
    }

    return {
      version: '1.0',
      metadata,
      content,
      reviewMarkers,
    };
  }

  private emitNode(node: GraphNode): DocumentContentNode[] {
    switch (node.kind) {
      case 'heading':
        return [toHeading(node.text, node.page)];

      case 'instruction':
        return [toParagraph(node.text, node.page)];

      case 'paragraph':
        return node.text ? [toParagraph(node.text, node.page)] : [];

      case 'formula':
        return node.text
          ? [{ kind: 'formula', latex: node.text, display: 'block', source: { page: node.page } }]
          : [];

      case 'image':
        return [{ kind: 'image', src: '', alt: node.text || 'image', source: { page: node.page } }];

      case 'table':
        return [
          {
            kind: 'table',
            caption: (node as any).caption,
            headers: (node as any).headers ?? [],
            rows: (node as any).rows ?? [],
            source: { page: node.page },
          } as any,
        ];

      case 'question':
        return [toQuestion(node)];

      case 'reading': {
        if (node.questions.length === 0) {
          return readingToContextNodes(node);
        }
        // Group node
        const group: QuestionGroupNode = {
          kind: 'question-group',
          id: node.id,
          context: readingToContextNodes(node),
          questions: node.questions.map(toQuestion),
          source: { page: node.page },
        };
        return [group];
      }

      default:
        return [];
    }
  }
}
