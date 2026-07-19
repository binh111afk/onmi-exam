import type { QuestionDocument } from '../types/question-object';
import type { DocumentLayout } from '../types/document-layout';
import { DocumentImporterRegistry } from './importers/documentImporterRegistry';
import { LayoutAnalyzer } from './layout/layoutAnalyzer';
import { LayoutQuestionParser } from './parsers/layoutQuestionParser';

/**
 * Framework entry point. It imports and parses only; OCR and AI execution are
 * intentionally outside this phase and represented by review markers.
 */
export class DocumentUnderstandingPipeline {
  private readonly importers: DocumentImporterRegistry;
  private readonly layoutAnalyzer: LayoutAnalyzer;
  private readonly parser: LayoutQuestionParser;

  constructor(
    importers = new DocumentImporterRegistry(),
    layoutAnalyzer = new LayoutAnalyzer(),
    parser = new LayoutQuestionParser(),
  ) {
    this.importers = importers;
    this.layoutAnalyzer = layoutAnalyzer;
    this.parser = parser;
  }

  async understand(file: File): Promise<QuestionDocument> {
    const result = await this.understandWithLayout(file);
    return result.document;
  }

  async understandWithLayout(file: File): Promise<{ document: QuestionDocument; layout: DocumentLayout }> {
    const rawDocument = await this.importers.import(file);
    const layout = this.layoutAnalyzer.analyze(rawDocument);
    return { document: this.parser.parse(rawDocument, layout), layout };
  }
}
