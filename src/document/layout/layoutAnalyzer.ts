import type { DocumentLayout, DocumentLayoutNode, LayoutBoundingBox, OcrPlanItem } from '../../types/document-layout';
import type { RawDocument, RawDocumentNode } from '../../types/raw-document';
import { DocumentRuleEngine } from '../rules/documentRuleEngine';
import { vietnameseExamRules } from '../rules/vietnameseExamRules';
import { DocumentNodeClassifier } from './documentNodeClassifier';
import { shouldUseMathOcr } from './formulaOcrPolicy';

const DEFAULT_BOX: LayoutBoundingBox = { x: 0, y: 0, width: 1, height: 1 };

const toBoundingBox = (node: RawDocumentNode, position: number): LayoutBoundingBox => {
  if (node.boundingBox) {
    const [x, y, width, height] = node.boundingBox;
    return { x, y, width, height };
  }
  return { ...DEFAULT_BOX, y: position };
};

const planOcr = (node: DocumentLayoutNode): OcrPlanItem => {
  switch (node.type) {
    case 'formula':
      if (!shouldUseMathOcr(node.mathConfidence)) {
        return { nodeId: node.id, action: 'no-ocr', reason: 'formula reconstructed from PDF glyph geometry', confidence: node.mathConfidence };
      }
      return { nodeId: node.id, action: 'math-ocr', reason: 'formula region requires dedicated math recognition', confidence: node.confidence };
    case 'image':
      return { nodeId: node.id, action: 'text-ocr', reason: 'image may contain instructional or question text', confidence: node.confidence };
    case 'unknown':
      return { nodeId: node.id, action: 'ai-review', reason: 'deterministic classifier could not classify this node', confidence: node.confidence };
    default:
      return { nodeId: node.id, action: 'no-ocr', reason: 'native document content is already available', confidence: node.confidence };
  }
};

export class LayoutAnalyzer {
  private readonly classifier: DocumentNodeClassifier;

  constructor(rules = new DocumentRuleEngine(vietnameseExamRules)) {
    this.classifier = new DocumentNodeClassifier(rules);
  }

  analyze(document: RawDocument): DocumentLayout {
    const nodes = document.nodes.map((rawNode, index) => {
      const classification = this.classifier.classify(rawNode);
      const page = rawNode.page ?? 1;
      return {
        id: `layout-${index + 1}`,
        rawNodeIndex: index,
        page,
        boundingBox: toBoundingBox(rawNode, index),
        hasMeasuredGeometry: rawNode.boundingBox !== undefined,
        readingOrder: index,
        type: classification.type,
        text: rawNode.kind === 'text' ? rawNode.text : undefined,
        confidence: classification.confidence,
        mathConfidence: rawNode.kind === 'text' ? rawNode.mathConfidence : undefined,
      } satisfies DocumentLayoutNode;
    });

    const placeholderNodes = document.ocrCandidates
      .filter((candidate) => !nodes.some((node) => node.page === (candidate.page ?? 1)))
      .map((candidate, index) => ({
        id: `ocr-candidate-${index + 1}`,
        page: candidate.page ?? 1,
        boundingBox: { ...DEFAULT_BOX },
        hasMeasuredGeometry: false,
        readingOrder: nodes.length + index,
        type: 'unknown' as const,
        confidence: 0.25,
      } satisfies DocumentLayoutNode));
    const allNodes = [...nodes, ...placeholderNodes];
    const pages = Array.from(new Set(allNodes.map((node) => node.page))).sort((first, second) => first - second).map((page) => ({
      page,
      nodes: allNodes.filter((node) => node.page === page).sort((first, second) => first.readingOrder - second.readingOrder),
    }));

    return {
      version: '1.0',
      sourceKind: document.source.kind,
      pages,
      nodes: allNodes,
      ocrPlan: allNodes.map(planOcr),
    };
  }
}
