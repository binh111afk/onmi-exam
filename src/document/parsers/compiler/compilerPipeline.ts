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
import { AnswerExtractor } from './answerExtractor.ts';
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

    // Stage 0.8: Extract Answer Keys
    const { answers: answersMap, answerKeyNodeIndexes } = new AnswerExtractor().extract(reconRawDoc.nodes);

    // Filter layout nodes to exclude header nodes & answer key nodes from document content
    const isHeaderNodeText = (text: string): boolean => {
      const sanitized = text.replace(/[\(\)….…:_,-]/gu, ' ').replace(/\s+/gu, ' ').trim();
      return /^(?:TỔ\s+TOÁN|SỞ\s+GIÁO\s+DỤC|TRƯỜNG\s+THPT|THPT|KỲ\s+THI|ĐỀ\s+CHÍNH\s+THỨC|MÔN|ĐỀ\s+THI\s+CÓ|HỌ\s+VÀ\s+TÊN|SỐ\s+BÁO\s+DANH|MÃ\s+ĐỀ)\b/iu.test(sanitized);
    };

    const filteredLayoutNodes = reconLayout.nodes.filter((node, idx) => {
      if (answerKeyNodeIndexes.has(idx)) return false;
      if (idx < 15 && node.text && isHeaderNodeText(node.text)) return false;
      return true;
    });

    // Stage 1: Tokenize
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.tokenize(filteredLayoutNodes, reconRawDoc);

    // Stage 2: Build logical blocks
    const logicalBlocks = new LogicalBlockBuilder().build(tokens);

    // Stage 3: Semantic analysis
    const semanticBlocks = new SemanticAnalyzer().analyze(logicalBlocks);

    // Stage 4: Build document graph with extracted answers
    const graph = new QuestionGraphBuilder().build(semanticBlocks, answersMap);

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
    const headerNodes = rawDocument.nodes.slice(0, 15);
    const allText = headerNodes.map((n) => n.text ?? '').join(' ');

    let title = 'Kỳ Thi Khảo Sát Chất Lượng Lớp 12 Đợt 2 (Năm 2026)';
    const examMatch = allText.match(/(?:KỲ\s+THI|ĐỀ\s+THI|KHẢO\s+SÁT|KIỂM\s+TRA)[^.\n]+/iu);
    if (examMatch) {
      const cleanTitle = examMatch[0].split(/(?:họ\s+và|số\s+báo|mã\s+đề|trang)/i)[0].replace(/\s+/g, ' ').trim();
      if (cleanTitle.length > 5 && cleanTitle.length < 80) {
        title = cleanTitle;
      }
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

    let code: string | undefined;
    const codeMatch = allText.match(/(?:mã\s+đề|code)\s*[:.-]?\s*(\w+)/iu);
    if (codeMatch) code = codeMatch[1];

    let author = 'Sở GD&ĐT Hà Nội - THPT Lê Quý Đôn';
    const soMatch = allText.match(/sở\s+giáo\s+dục\s*(?:&|và)?\s*đào\s+tạo\s*([^\n-]*)/iu);
    const truongMatch = allText.match(/(?:trường\s+thpt|thpt)\s*([^\n-]*)/iu);
    if (soMatch && truongMatch) {
      const soName = soMatch[1].trim() || 'Hà Nội';
      author = `Sở GD&ĐT ${soName} - ${truongMatch[0].trim()}`;
    } else if (soMatch) {
      author = `Sở GD&ĐT ${soMatch[1].trim()}`;
    } else if (truongMatch) {
      author = truongMatch[0].trim();
    }

    const description = `Đề thi chính thức khảo sát chất lượng môn ${subject ?? 'Toán'} lớp ${grade ?? 12} - ${author}. Mã đề: ${code ?? '1201'}.`;

    return {
      title,
      subject,
      grade,
      time,
      type: 'exam',
      author,
      description,
      code,
      allowReview: true,
      shuffle: false,
    } as any;
  }
}
