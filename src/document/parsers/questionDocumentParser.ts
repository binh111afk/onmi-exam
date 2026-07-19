import type { DocumentParser, QuestionParser as QuestionParserContract } from '../contracts';
import type { DocumentContentNode, DocumentReviewMarker, QuestionDocument } from '../../types/question-object';
import type { RawDocument, RawDocumentNode, RawTextNode } from '../../types/raw-document';
import { DocumentRuleEngine } from '../rules/documentRuleEngine';
import { vietnameseExamRules } from '../rules/vietnameseExamRules';
import { FormulaParser, HeadingParser, ImageParser, QuestionParser, ReadingParser, TableParser } from './nodeParsers';
import { QuestionStateMachine } from './questionStateMachine';

export class QuestionDocumentParser implements DocumentParser<RawDocument>, QuestionParserContract {
  private readonly rules = new DocumentRuleEngine(vietnameseExamRules);

  parse(input: RawDocument): QuestionDocument {
    return this.parseQuestions(input);
  }

  parseQuestions(input: RawDocument): QuestionDocument {
    const content: DocumentContentNode[] = [];
    const reviewMarkers: DocumentReviewMarker[] = [...input.reviewMarkers];
    const nodeParsers = [new HeadingParser(), new TableParser(), new ImageParser(), new FormulaParser(), new ReadingParser()];
    const stateMachine = new QuestionStateMachine(this.rules);
    const questionParser = new QuestionParser();

    input.nodes.forEach((node) => {
      if (node.kind === 'text') {
        const event = stateMachine.consume(node as RawTextNode);
        const parsedQuestion = questionParser.parse(event.text, event.confidence);
        if (parsedQuestion.value) {
          content.push(parsedQuestion.value);
          reviewMarkers.push(...parsedQuestion.reviewMarkers);
          return;
        }
      }

      const parser = nodeParsers.find((candidate) => candidate.supports(node as RawDocumentNode));
      if (!parser) {
        reviewMarkers.push({ status: 'ai-review-required', reason: 'unsupported-structure', confidence: node.confidence, page: node.page });
        return;
      }

      const parsed = parser.parse(node, { rules: this.rules });
      if (parsed.value) content.push(parsed.value);
      reviewMarkers.push(...parsed.reviewMarkers);
    });

    return {
      version: '1.0',
      metadata: { title: input.source.name.replace(/\.[^.]+$/, '') },
      content,
      reviewMarkers,
    };
  }
}
