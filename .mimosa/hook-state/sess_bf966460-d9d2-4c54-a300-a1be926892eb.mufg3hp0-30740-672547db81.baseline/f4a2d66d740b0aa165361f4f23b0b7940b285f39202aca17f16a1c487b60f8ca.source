import type { DocumentLayoutNode, LayoutNodeType } from '../../types/document-layout';
import type { RawDocumentNode } from '../../types/raw-document';
import type { DocumentRuleEngine } from '../rules/documentRuleEngine';

export interface NodeClassification {
  type: LayoutNodeType;
  confidence: number;
}

const priority: Array<LayoutNodeType> = [
  'explanation-candidate',
  'question-candidate',
  'option-candidate',
  'reading-candidate',
  'caption',
  'formula',
  'list',
  'heading',
];

const isFormulaDominant = (text: string): boolean => {
  const proseWords = text.match(/\p{L}{3,}/gu) ?? [];
  const mathWords = proseWords.filter((word) => /^(?:sin|cos|tan|cot|log|ln|lim)$/iu.test(word));
  return proseWords.length - mathWords.length <= 1;
};

export class DocumentNodeClassifier {
  private readonly rules: DocumentRuleEngine;

  constructor(rules: DocumentRuleEngine) {
    this.rules = rules;
  }

  classify(node: RawDocumentNode): NodeClassification {
    if (node.kind === 'image') return { type: 'image', confidence: 1 };
    if (node.kind === 'table') return { type: 'table', confidence: 1 };
    if (node.kind === 'serialized') return { type: 'unknown', confidence: 0.25 };
    if (node.style === 'heading' || node.headingLevel !== undefined) return { type: 'heading', confidence: node.confidence };

    const matchedKinds = this.rules.match(node.text)
      .map((match) => match.kind)
      .filter((kind) => kind !== 'formula' || isFormulaDominant(node.text));
    const matched = priority.find((type) => {
      const expectedRuleKind = type.replace('-candidate', '').replace('explanation', 'answer').replace('reading', 'reading-passage') as typeof matchedKinds[number];
      return matchedKinds.includes(expectedRuleKind);
    });

    if (!matched) return { type: 'paragraph', confidence: node.confidence };

    const ruleKind = matched === 'explanation-candidate'
      ? 'answer'
      : matched === 'reading-candidate'
        ? 'reading-passage'
        : matched.replace('-candidate', '') as Parameters<DocumentRuleEngine['confidence']>[0];
    return { type: matched, confidence: Math.min(node.confidence, this.rules.confidence(ruleKind)) };
  }

  classifyLayoutNode(node: DocumentLayoutNode): NodeClassification {
    if (!node.text) return { type: node.type, confidence: node.confidence };
    return this.classify({ kind: 'text', text: node.text, confidence: node.confidence });
  }
}
