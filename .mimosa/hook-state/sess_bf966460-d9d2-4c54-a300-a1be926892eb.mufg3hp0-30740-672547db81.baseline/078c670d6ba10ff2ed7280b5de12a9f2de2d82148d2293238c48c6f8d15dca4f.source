export type DocumentRuleKind = 'heading' | 'question' | 'option' | 'answer' | 'reading-passage' | 'formula' | 'caption' | 'list';

export interface DocumentRuleMatch {
  kind: DocumentRuleKind;
  text: string;
  groups: string[];
}

export interface DocumentRule {
  id: string;
  kind: DocumentRuleKind;
  pattern: RegExp;
  confidence: number;
}

export class DocumentRuleEngine {
  private readonly rules: DocumentRule[];

  constructor(rules: DocumentRule[]) {
    this.rules = rules;
  }

  match(text: string): DocumentRuleMatch[] {
    return this.rules.flatMap((rule) => {
      const matched = rule.pattern.exec(text);
      return matched ? [{ kind: rule.kind, text: matched[0], groups: matched.slice(1) }] : [];
    });
  }

  confidence(kind: DocumentRuleKind): number {
    return this.rules.find((rule) => rule.kind === kind)?.confidence ?? 0;
  }
}
