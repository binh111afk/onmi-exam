import type { OptionObject, QuestionObject } from '../../types/question-object';
import type { RawTextNode } from '../../types/raw-document';
import type { DocumentRuleEngine } from '../rules/documentRuleEngine';

export type QuestionParserState = 'reading-heading' | 'reading-question' | 'reading-options' | 'reading-answer' | 'awaiting-next-question';

export interface QuestionParserEvent {
  state: QuestionParserState;
  type: 'heading' | 'question-start' | 'option' | 'answer' | 'text';
  text: string;
  confidence: number;
}

export class QuestionStateMachine {
  private state: QuestionParserState = 'reading-heading';
  private readonly rules: DocumentRuleEngine;

  constructor(rules: DocumentRuleEngine) {
    this.rules = rules;
  }

  consume(node: RawTextNode): QuestionParserEvent {
    const matches = this.rules.match(node.text);
    const questionMatch = matches.find((match) => match.kind === 'question');
    const optionMatch = matches.find((match) => match.kind === 'option');
    const answerMatch = matches.find((match) => match.kind === 'answer');
    const headingMatch = matches.find((match) => match.kind === 'heading');

    if (questionMatch) {
      this.state = 'reading-question';
      return { state: this.state, type: 'question-start', text: node.text, confidence: this.rules.confidence('question') };
    }
    if (optionMatch && (this.state === 'reading-question' || this.state === 'reading-options')) {
      this.state = 'reading-options';
      return { state: this.state, type: 'option', text: node.text, confidence: this.rules.confidence('option') };
    }
    if (answerMatch) {
      this.state = 'reading-answer';
      return { state: this.state, type: 'answer', text: node.text, confidence: this.rules.confidence('answer') };
    }
    if (headingMatch) {
      this.state = 'reading-heading';
      return { state: this.state, type: 'heading', text: node.text, confidence: this.rules.confidence('heading') };
    }

    return { state: this.state, type: 'text', text: node.text, confidence: node.confidence };
  }
}

export const createQuestionFromEvent = (event: QuestionParserEvent): QuestionObject | null => {
  if (event.type !== 'question-start') return null;
  const matched = event.text.match(/^\s*Câu\s+(\d+)\s*[.:)]\s*(.*)$/i);
  if (!matched) return null;

  return {
    kind: 'question',
    questionType: 'choice',
    id: Number(matched[1]),
    question: matched[2],
    options: [] as OptionObject[],
    answer: [],
  };
};
