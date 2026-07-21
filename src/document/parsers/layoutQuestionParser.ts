/**
 * LayoutQuestionParser — public adapter over the Compiler Pipeline.
 *
 * This file is intentionally thin. All parsing logic lives in:
 *   src/document/parsers/compiler/
 *
 * The public signature `parse(rawDocument, layout): QuestionDocument`
 * is unchanged so that DocumentPipelineDispatcher and all callers
 * continue to work without modification.
 */
import type { DocumentLayout } from '../../types/document-layout.ts';
import type { QuestionDocument } from '../../types/question-object.ts';
import type { RawDocument } from '../../types/raw-document.ts';
import { CompilerPipeline } from './compiler/compilerPipeline.ts';

export class LayoutQuestionParser {
  private readonly pipeline: CompilerPipeline;

  constructor() {
    this.pipeline = new CompilerPipeline();
  }

  parse(rawDocument: RawDocument, layout: DocumentLayout): QuestionDocument {
    return this.pipeline.compile(rawDocument, layout);
  }
}
