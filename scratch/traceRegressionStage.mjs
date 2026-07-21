import { readFile } from 'node:fs/promises';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

import { LayoutAnalyzer } from '../src/document/layout/layoutAnalyzer.ts';
import { CompilerPipeline } from '../src/document/parsers/compiler/compilerPipeline.ts';
import { DocumentNormalizer } from '../src/document/parsers/compiler/documentNormalizer.ts';
import { DocumentReconstructor } from '../src/document/parsers/compiler/documentReconstructor.ts';
import { LogicalBlockBuilder } from '../src/document/parsers/compiler/logicalBlockBuilder.ts';
import { OmlGenerator } from '../src/document/parsers/compiler/omlGenerator.ts';
import { QuestionGraphBuilder } from '../src/document/parsers/compiler/questionGraphBuilder.ts';
import { SemanticAnalyzer } from '../src/document/parsers/compiler/semanticAnalyzer.ts';
import { Tokenizer } from '../src/document/parsers/compiler/tokenizer.ts';
import { Validator } from '../src/document/parsers/compiler/validator.ts';
import { PdfImporter } from '../src/document/importers/pdfImporter.ts';

const testFile = 'tests/corpus/pdf-text/toan/75sdyoc01oy1.pdf';

async function runStageByStageAudit() {
  console.log(`\n======================================================`);
  console.log(`  STAGE-BY-STAGE REGRESSION AUDIT FOR: ${testFile}`);
  console.log(`======================================================\n`);

  const fileData = await readFile(testFile);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileData) });
  const pdf = await loadingTask.promise;

  // ---------------------------------------------------------------------------
  // STAGE 1: PDF.js Raw TextItems
  // ---------------------------------------------------------------------------
  const numPages = pdf.numPages;
  let totalTextItems = 0;
  const pageItemsMap = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items.filter((item) => typeof item === 'object' && item !== null && 'str' in item && typeof item.str === 'string' && item.str.trim());
    totalTextItems += items.length;
    pageItemsMap.push({ pageNum, itemCount: items.length, items });
    page.cleanup();
  }

  console.log(`STAGE 1: PDF.js Extractor`);
  console.log(`  numPages: ${numPages}`);
  pageItemsMap.forEach((p) => console.log(`  Page ${p.pageNum} TextItems: ${p.itemCount}`));
  console.log(`  TOTAL TextItems: ${totalTextItems}\n`);

  // ---------------------------------------------------------------------------
  // STAGE 2: PdfImporter Internal Detailed Audit
  // ---------------------------------------------------------------------------
  const fakeFile = {
    name: '75sdyoc01oy1.pdf',
    type: 'application/pdf',
    arrayBuffer: async () => fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength),
  };

  const importer = new PdfImporter();
  const rawDocument = await importer.import(fakeFile);

  console.log(`STAGE 2: PdfImporter`);
  console.log(`  RawTextNode count: ${rawDocument.nodes.length}`);
  if (rawDocument.nodes.length > 0) {
    console.log(`  First RawTextNode: "${rawDocument.nodes[0].text}"`);
    console.log(`  Last RawTextNode: "${rawDocument.nodes[rawDocument.nodes.length - 1].text}"`);
  }
  console.log(`  Ratio TextItems (${totalTextItems}) -> RawNodes (${rawDocument.nodes.length})\n`);

  // ---------------------------------------------------------------------------
  // STAGE 3: LayoutAnalyzer
  // ---------------------------------------------------------------------------
  const layoutAnalyzer = new LayoutAnalyzer();
  const layout = layoutAnalyzer.analyze(rawDocument);
  const paragraphCount = layout.nodes.filter((n) => n.type === 'paragraph').length;
  const imageCount = layout.nodes.filter((n) => n.type === 'image').length;
  const formulaCount = layout.nodes.filter((n) => n.type === 'formula').length;

  console.log(`STAGE 3: LayoutAnalyzer`);
  console.log(`  LayoutNode count: ${layout.nodes.length}`);
  console.log(`  Paragraph count: ${paragraphCount}`);
  console.log(`  Image count: ${imageCount}`);
  console.log(`  Formula count: ${formulaCount}\n`);

  // ---------------------------------------------------------------------------
  // STAGE 4: DocumentNormalizer
  // ---------------------------------------------------------------------------
  const normalizer = new DocumentNormalizer();
  const normRes = normalizer.normalize(rawDocument, layout);

  console.log(`STAGE 4: DocumentNormalizer`);
  console.log(`  LayoutNode count BEFORE: ${layout.nodes.length}`);
  console.log(`  LayoutNode count AFTER:  ${normRes.layout.nodes.length}`);
  console.log(`  Normalizations applied: ${normRes.stats.normalizationAppliedCount}\n`);

  // ---------------------------------------------------------------------------
  // STAGE 5: DocumentReconstructor
  // ---------------------------------------------------------------------------
  const reconstructor = new DocumentReconstructor();
  const reconRes = reconstructor.reconstruct(normRes.rawDocument, normRes.layout);

  console.log(`STAGE 5: DocumentReconstructor`);
  console.log(`  LayoutNode count BEFORE: ${normRes.layout.nodes.length}`);
  console.log(`  LayoutNode count AFTER:  ${reconRes.layout.nodes.length}`);
  console.log(`  Reconstruction Summary:`, reconRes.summary, `\n`);

  // ---------------------------------------------------------------------------
  // STAGE 6: Tokenizer
  // ---------------------------------------------------------------------------
  const tokenizer = new Tokenizer();
  const tokens = tokenizer.tokenize(reconRes.layout.nodes, reconRes.rawDocument);

  const tokenCountsByKind = tokens.reduce((acc, t) => {
    acc[t.kind] = (acc[t.kind] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`STAGE 6: Tokenizer`);
  console.log(`  Total Tokens: ${tokens.length}`);
  console.log(`  Token Breakdown:`, JSON.stringify(tokenCountsByKind, null, 2), `\n`);

  // ---------------------------------------------------------------------------
  // STAGE 7: LogicalBlockBuilder & SemanticAnalyzer
  // ---------------------------------------------------------------------------
  const logicalBlocks = new LogicalBlockBuilder().build(tokens);
  const blockCountsByKind = logicalBlocks.reduce((acc, b) => {
    acc[b.kind] = (acc[b.kind] ?? 0) + 1;
    return acc;
  }, {});

  const semanticBlocks = new SemanticAnalyzer().analyze(logicalBlocks);
  const semanticCountsByRole = semanticBlocks.reduce((acc, b) => {
    acc[b.role] = (acc[b.role] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`STAGE 7: LogicalBlockBuilder & SemanticAnalyzer`);
  console.log(`  LogicalBlocks count: ${logicalBlocks.length}`);
  console.log(`  LogicalBlock Breakdown:`, JSON.stringify(blockCountsByKind, null, 2));
  console.log(`  SemanticRole Breakdown:`, JSON.stringify(semanticCountsByRole, null, 2), `\n`);

  // ---------------------------------------------------------------------------
  // STAGE 8: QuestionGraphBuilder & Validator
  // ---------------------------------------------------------------------------
  const graph = new QuestionGraphBuilder().build(semanticBlocks);
  const questionNodeCount = graph.nodes.filter((n) => n.kind === 'question').length;
  const readingGroupCount = graph.nodes.filter((n) => n.kind === 'reading').length;
  const graphParagraphCount = graph.nodes.filter((n) => n.kind === 'paragraph').length;

  const { graph: validatedGraph, diagnostics } = new Validator().validate(graph);
  const valQuestionCount = validatedGraph.nodes.filter((n) => n.kind === 'question').length;

  console.log(`STAGE 8: QuestionGraphBuilder & Validator`);
  console.log(`  Graph Nodes BEFORE validation: ${graph.nodes.length} (Questions: ${questionNodeCount}, Groups: ${readingGroupCount}, Paragraphs: ${graphParagraphCount})`);
  console.log(`  Graph Nodes AFTER validation:  ${validatedGraph.nodes.length} (Questions: ${valQuestionCount})`);
  console.log(`  Validation Diagnostics:`, diagnostics, `\n`);

  // ---------------------------------------------------------------------------
  // STAGE 9: OmlGenerator
  // ---------------------------------------------------------------------------
  const omlDoc = new OmlGenerator().generate(validatedGraph, { title: '75sdyoc01oy1' }, diagnostics, normRes.stats);
  const omlQuestions = omlDoc.content.filter((c) => c.kind === 'question').length;
  const omlGroups = omlDoc.content.filter((c) => c.kind === 'group').length;
  const omlParagraphs = omlDoc.content.filter((c) => c.kind === 'text' || c.kind === 'heading').length;

  console.log(`STAGE 9: OmlGenerator Output`);
  console.log(`  Total OML Content Items: ${omlDoc.content.length}`);
  console.log(`  Questions: ${omlQuestions}`);
  console.log(`  Groups: ${omlGroups}`);
  console.log(`  Paragraphs: ${omlParagraphs}`);

  await loadingTask.destroy();
}

runStageByStageAudit();
