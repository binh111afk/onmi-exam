import type { OmlDocumentV2 } from '../types/oml';
import type { QuestionDocument } from '../types/question-object';
import type { RawDocument } from '../types/raw-document';
import type { DocumentLayout } from '../types/document-layout';

export interface DocumentImporter<Input> {
  import(input: Input): Promise<RawDocument>;
}

export interface DocumentParser<Input> {
  parse(input: Input): QuestionDocument;
}

export interface DocumentLayoutAnalyzer {
  analyze(input: RawDocument): DocumentLayout;
}

export interface QuestionParser {
  parseQuestions(input: RawDocument): QuestionDocument;
}

export interface OmlGenerator {
  generate(document: QuestionDocument): OmlDocumentV2;
}

export interface QuestionSerializer {
  serialize(document: QuestionDocument): string;
}

export interface QuestionDeserializer {
  deserialize(serialized: string): QuestionDocument;
}
