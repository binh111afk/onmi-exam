import type { DocumentLayout, DocumentLayoutNode } from '../../types/document-layout';
import type { ChoiceQuestionObject, DocumentContentNode, DocumentReviewMarker, QuestionDocument } from '../../types/question-object';
import type { RawDocument, RawDocumentNode } from '../../types/raw-document';
import { OptionDetector } from '../detectors/optionDetector';
import { QuestionDetector } from '../detectors/questionDetector';
import { ReadingDetector } from '../detectors/readingDetector';
import { DocumentRuleEngine } from '../rules/documentRuleEngine';
import { vietnameseExamRules } from '../rules/vietnameseExamRules';

const toSource = (node: DocumentLayoutNode) => ({
  page: node.page,
  boundingBox: [node.boundingBox.x, node.boundingBox.y, node.boundingBox.width, node.boundingBox.height] as [number, number, number, number],
  confidence: node.confidence,
});

const toContentNode = (layoutNode: DocumentLayoutNode, rawNode: RawDocumentNode | undefined): DocumentContentNode | null => {
  const source = toSource(layoutNode);
  switch (layoutNode.type) {
    case 'heading': return { kind: 'heading', level: rawNode?.kind === 'text' && rawNode.headingLevel ? rawNode.headingLevel : 1, text: layoutNode.text ?? '', source };
    case 'paragraph': return { kind: 'text', text: layoutNode.text ?? '', source };
    case 'list': return { kind: 'list', ordered: false, items: [layoutNode.text ?? ''], source };
    case 'image': return rawNode?.kind === 'image' ? { kind: 'image', src: rawNode.src, alt: rawNode.alt, source } : null;
    case 'table': return rawNode?.kind === 'table' ? { kind: 'table', rows: rawNode.rows, source } : null;
    case 'caption': return { kind: 'text', text: layoutNode.text ?? '', source };
    case 'reading-candidate': return { kind: 'text', text: layoutNode.text ?? '', source };
    case 'formula': return { kind: 'text', text: layoutNode.text ?? '', source };
    default: return null;
  }
};

export class LayoutQuestionParser {
  private readonly rules = new DocumentRuleEngine(vietnameseExamRules);
  private readonly questionDetector = new QuestionDetector(this.rules);
  private readonly optionDetector = new OptionDetector(this.rules);
  private readonly readingDetector = new ReadingDetector();

  parse(rawDocument: RawDocument, layout: DocumentLayout): QuestionDocument {
    const contentById = new Map<string, DocumentContentNode>();
    const questionsById = new Map<string, ChoiceQuestionObject>();
    const reviewMarkers: DocumentReviewMarker[] = [...rawDocument.reviewMarkers];
    let activeQuestion: ChoiceQuestionObject | null = null;

    layout.nodes.sort((first, second) => first.readingOrder - second.readingOrder).forEach((layoutNode) => {
      const rawNode = layoutNode.rawNodeIndex === undefined ? undefined : rawDocument.nodes[layoutNode.rawNodeIndex];
      const question = this.questionDetector.detect(layoutNode);
      if (question) {
        const parsedQuestion: ChoiceQuestionObject = {
          kind: 'question',
          questionType: 'choice',
          id: question.questionNumber ?? layoutNode.id,
          question: question.stem,
          options: [],
          answer: [],
          source: toSource(layoutNode),
        };
        questionsById.set(layoutNode.id, parsedQuestion);
        activeQuestion = parsedQuestion;
        return;
      }

      const option = this.optionDetector.detect(layoutNode);
      if (option && activeQuestion) {
        activeQuestion.options.push(option.option);
        return;
      }

      if (layoutNode.type === 'explanation-candidate' && activeQuestion) {
        activeQuestion.explanation = layoutNode.text?.replace(/^\s*(?:Đáp án|Lời giải)\s*[:.-]?\s*/i, '') ?? '';
        return;
      }

      const contentNode = toContentNode(layoutNode, rawNode);
      if (contentNode) contentById.set(layoutNode.id, contentNode);
      if (layoutNode.type === 'formula' || layoutNode.type === 'unknown') {
        reviewMarkers.push({ status: 'ai-review-required', reason: layoutNode.type === 'formula' ? 'low-parser-confidence' : 'unsupported-structure', confidence: layoutNode.confidence, page: layoutNode.page });
      }
    });

    layout.ocrPlan.filter((item) => item.action === 'ai-review').forEach((item) => {
      const node = layout.nodes.find((candidate) => candidate.id === item.nodeId);
      reviewMarkers.push({ status: 'ai-review-required', reason: 'unsupported-structure', confidence: item.confidence, page: node?.page });
    });

    const readingGroups = this.readingDetector.detect([...layout.nodes]);
    const groupedNodeIds = new Set(readingGroups.flatMap((group) => [...group.passageNodeIds, ...group.questionNodeIds]));
    const groupStartNodes = new Map(readingGroups.map((group) => [group.passageNodeIds[0], group]));
    const content: DocumentContentNode[] = [];

    layout.nodes.sort((first, second) => first.readingOrder - second.readingOrder).forEach((node) => {
      const group = groupStartNodes.get(node.id);
      if (group) {
        const context = group.passageNodeIds.map((id) => contentById.get(id)).filter((value): value is DocumentContentNode => Boolean(value));
        const questions = group.questionNodeIds.map((id) => questionsById.get(id)).filter((value): value is ChoiceQuestionObject => Boolean(value));
        if (context.length > 0 && questions.length > 0) content.push({ kind: 'question-group', id: `reading-${node.id}`, context, questions, source: toSource(node) });
        return;
      }
      if (groupedNodeIds.has(node.id)) return;
      const question = questionsById.get(node.id);
      if (question) {
        content.push(question);
        return;
      }
      const contentNode = contentById.get(node.id);
      if (contentNode) content.push(contentNode);
    });

    return { version: '1.0', metadata: { title: rawDocument.source.name.replace(/\.[^.]+$/, '') }, content, reviewMarkers };
  }
}
