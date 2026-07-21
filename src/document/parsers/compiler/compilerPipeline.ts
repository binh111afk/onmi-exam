/**
 * CompilerPipeline — Orchestrator for the Compiler Architecture.
 *
 * Pipeline:
 *   DocumentLayoutNode[] + RawDocument
 *       ↓  [0] DocumentNormalizer
 *   Normalized RawDocument + Layout
 *       ↓  [0.5] DocumentReconstructor
 *   Reconstructed RawDocument + Layout
 *       ↓  [1] Tokenizer
 *   Token[]
 *       ↓  [2] LogicalBlockBuilder
 *   LogicalBlock[]
 *       ↓  [3] SemanticAnalyzer
 *   SemanticBlock[]
 *       ↓  [4] QuestionGraphBuilder
 *   DocumentGraph
 *       ↓  [5] Validator & Option Recovery
 *   DocumentGraph (validated) + ValidationDiagnostics
 *       ↓  [6] OmlGenerator
 *   QuestionDocument
 *
 * The pipeline is stateless. Each stage is a pure function class.
 */
import type { DocumentLayout } from '../../../types/document-layout.ts';
import type { DocumentMetadata, QuestionDocument } from '../../../types/question-object.ts';
import type { RawDocument } from '../../../types/raw-document.ts';
import { DocumentNormalizer, type NormalizationStats } from './documentNormalizer.ts';
import { DocumentReconstructor, type ReconstructionSummary } from './documentReconstructor.ts';
import { LogicalBlockBuilder } from './logicalBlockBuilder.ts';
import { OmlGenerator } from './omlGenerator.ts';
import { QuestionGraphBuilder } from './questionGraphBuilder.ts';
import { SemanticAnalyzer } from './semanticAnalyzer.ts';
import { Tokenizer } from './tokenizer.ts';
import { Validator, type ValidationDiagnostics } from './validator.ts';

export interface PipelineCompilationReport {
  document: QuestionDocument;
  diagnostics: ValidationDiagnostics;
  normalizationStats: NormalizationStats;
  reconstructionSummary: ReconstructionSummary;
}

export class CompilerPipeline {
  compile(
    rawDocument: RawDocument,
    layout: DocumentLayout,
  ): QuestionDocument {
    return this.compileWithDiagnostics(rawDocument, layout).document;
  }

  compileWithDiagnostics(
    rawDocument: RawDocument,
    layout: DocumentLayout,
  ): PipelineCompilationReport {
    // Stage 0: Normalize document
    const { rawDocument: normRawDoc, layout: normLayout, stats: normStats } =
      new DocumentNormalizer().normalize(rawDocument, layout);

    // Stage 0.5: Reconstruct text & layout boundaries
    const { rawDocument: reconRawDoc, layout: reconLayout, summary: reconSummary } =
      new DocumentReconstructor().reconstruct(normRawDoc, normLayout);

    // Stage 1: Tokenize
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.tokenize(reconLayout.nodes, reconRawDoc);

    // Stage 2: Build logical blocks
    const logicalBlocks = new LogicalBlockBuilder().build(tokens);

    // Stage 3: Semantic analysis
    const semanticBlocks = new SemanticAnalyzer().analyze(logicalBlocks);

    // Stage 4: Build document graph
    const graph = new QuestionGraphBuilder().build(semanticBlocks);

    // Stage 5: Validate & Recover
    const { graph: validatedGraph, diagnostics } = new Validator().validate(graph);

    // Stage 6: Generate QuestionDocument
    const metadata = this.extractDocumentMetadata(rawDocument);
    const document = new OmlGenerator().generate(validatedGraph, metadata, diagnostics, normStats);

    return {
      document,
      diagnostics,
      normalizationStats: normStats,
      reconstructionSummary: reconSummary,
    };
  }

  private extractDocumentMetadata(rawDocument: RawDocument): DocumentMetadata {
    const fallbackTitle = rawDocument.source.name.replace(/\.[^.]+$/, '');
    const headerNodes = rawDocument.nodes.slice(0, 12);
    const allText = headerNodes.map((n) => n.text ?? '').join(' ');

    let title = fallbackTitle;
    const titleMatch = allText.match(/(?:ĐỀ|KIỂM TRA|KHẢO SÁT|ĐỀ THI)[^.\n]+/iu);
    if (titleMatch) {
      title = titleMatch[0]
        .split(/(?:họ\s+và\s+tên|số\s+báo\s+danh|mã\s+đề|trang|họvà\s+tên)/i)[0]
        .replace(/\s+/g, ' ')
        .replace(/[-–—:_,\s]+$/, '')
        .trim();
    }

    let subject: string | undefined;
    if (/môn\s*:\s*toán|môn\s+toán/iu.test(allText)) subject = 'Toán Học';
    else if (/môn\s*:\s*ngữ\s*văn|môn\s+văn/iu.test(allText)) subject = 'Ngữ Văn';
    else if (/môn\s*:\s*vật\s*lý|môn\s+lý/iu.test(allText)) subject = 'Vật Lý';
    else if (/môn\s*:\s*hóa\s*học|môn\s+hóa/iu.test(allText)) subject = 'Hóa Học';
    else if (/môn\s*:\s*tiếng\s*anh|môn\s+anh/iu.test(allText)) subject = 'Tiếng Anh';

    let grade: number | undefined;
    const gradeMatch = allText.match(/lớp\s+(\d{1,2})/iu);
    if (gradeMatch) grade = parseInt(gradeMatch[1], 10);

    let time: number | undefined;
    const timeMatch = allText.match(/thời\s+gian\s*:\s*(\d{2,3})\s*phút/iu);
    if (timeMatch) time = parseInt(timeMatch[1], 10);

    let author: string | undefined;
    const authorMatch = allText.match(/(?:sở\s+giáo\s+dục[^\n-]+|(?:trường\s+thpt|thpt)[^\n-]+)/iu);
    if (authorMatch) author = authorMatch[0].trim();

    return {
      title,
      subject,
      grade,
      time,
      type: 'exam',
      author,
      allowReview: true,
      shuffle: false,
    };
  }
}
