import type { DocumentContentNode, DocumentReviewMarker } from '../../types/question-object';
import type { RawDocumentNode } from '../../types/raw-document';
import type { DocumentRuleEngine } from '../rules/documentRuleEngine';

export interface ParserResult<T> {
  value: T;
  confidence: number;
  reviewMarkers: DocumentReviewMarker[];
}

export interface ParserContext {
  rules: DocumentRuleEngine;
}

export interface DocumentNodeParser {
  supports(node: RawDocumentNode): boolean;
  parse(node: RawDocumentNode, context: ParserContext): ParserResult<DocumentContentNode | null>;
}
