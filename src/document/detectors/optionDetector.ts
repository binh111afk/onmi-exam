import type { DocumentLayoutNode } from '../../types/document-layout';
import type { OptionObject } from '../../types/question-object';
import type { DocumentRuleEngine } from '../rules/documentRuleEngine';

const circledOptionIds: Record<string, string> = { '①': 'A', '②': 'B', '③': 'C', '④': 'D' };

export class OptionDetector {
  private readonly rules: DocumentRuleEngine;

  constructor(rules: DocumentRuleEngine) {
    this.rules = rules;
  }

  detect(node: DocumentLayoutNode): { option: OptionObject; confidence: number } | null {
    if (!node.text) return null;
    const match = this.rules.match(node.text).find((candidate) => candidate.kind === 'option');
    if (!match) return null;
    const label = match.groups[0] ?? match.text.trim();
    return {
      option: { id: circledOptionIds[label] ?? label.toUpperCase(), content: node.text.slice(match.text.length).trim() },
      confidence: Math.min(node.confidence, this.rules.confidence('option')),
    };
  }
}
