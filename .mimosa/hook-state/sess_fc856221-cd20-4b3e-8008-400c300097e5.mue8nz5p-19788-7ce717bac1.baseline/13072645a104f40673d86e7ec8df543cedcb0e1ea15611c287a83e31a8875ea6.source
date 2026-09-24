import type { DocumentLayoutNode } from '../../types/document-layout';
import type { DocumentRuleEngine } from '../rules/documentRuleEngine';

export interface QuestionDetection {
  questionNumber?: string;
  stem: string;
  confidence: number;
}

export class QuestionDetector {
  private readonly rules: DocumentRuleEngine;

  constructor(rules: DocumentRuleEngine) {
    this.rules = rules;
  }

  detect(node: DocumentLayoutNode): QuestionDetection | null {
    if (!node.text) return null;
    const match = this.rules.match(node.text).find((candidate) => candidate.kind === 'question');
    if (!match) return null;
    return {
      questionNumber: match.groups[0],
      stem: node.text.slice(match.text.length).trim(),
      confidence: Math.min(node.confidence, this.rules.confidence('question')),
    };
  }
}
