import { readFile } from 'node:fs/promises';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

import { LayoutAnalyzer } from '../src/document/layout/layoutAnalyzer.ts';
import { DocumentNormalizer } from '../src/document/parsers/compiler/documentNormalizer.ts';
import { DocumentReconstructor } from '../src/document/parsers/compiler/documentReconstructor.ts';
import { Tokenizer } from '../src/document/parsers/compiler/tokenizer.ts';
import { LogicalBlockBuilder } from '../src/document/parsers/compiler/logicalBlockBuilder.ts';
import { SemanticAnalyzer } from '../src/document/parsers/compiler/semanticAnalyzer.ts';
import { QuestionGraphBuilder } from '../src/document/parsers/compiler/questionGraphBuilder.ts';
import { Validator } from '../src/document/parsers/compiler/validator.ts';
import { OmlGenerator } from '../src/document/parsers/compiler/omlGenerator.ts';
import { questionDocumentToOml } from '../src/document/adapters/omlQuestionObjectAdapter.ts';
import { PdfImporter } from '../src/document/importers/pdfImporter.ts';

const testFile = 'tests/corpus/pdf-text/van/g4du39a02jtb.pdf';

async function traceLiteraturePipeline() {
  console.log(`\n======================================================`);
  console.log(`    LITERATURE PDF PIPELINE AUDIT: ${testFile}`);
  console.log(`======================================================\n`);

  const fileData = await readFile(testFile);

  // 1. PDF.js
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileData) });
  const pdf = await loadingTask.promise;
  let pdfTextItems = 0;
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    pdfTextItems += content.items.filter((it) => typeof it === 'object' && it !== null && 'str' in it && typeof it.str === 'string' && it.str.trim()).length;
    page.cleanup();
  }
  console.log(`STAGE 1: PDF.js Extractor`);
  console.log(`  numPages: ${pdf.numPages}, totalTextItems: ${pdfTextItems}\n`);

  // 2. PdfImporter
  const fakeFile = {
    name: 'g4du39a02jtb.pdf',
    type: 'application/pdf',
    arrayBuffer: async () => fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength),
  };
  const importer = new PdfImporter();
  const rawDoc = await importer.import(fakeFile);
  console.log(`STAGE 2: PdfImporter`);
  console.log(`  RawTextNodes count: ${rawDoc.nodes.length}`);
  console.log(`  First 5 nodes:`, rawDoc.nodes.slice(0, 5).map((n) => n.text));
  console.log(`  Last 5 nodes:`, rawDoc.nodes.slice(-5).map((n) => n.text), `\n`);

  // 3. LayoutAnalyzer
  const layoutAnalyzer = new LayoutAnalyzer();
  const initialLayout = layoutAnalyzer.analyze(rawDoc);
  console.log(`STAGE 3: LayoutAnalyzer`);
  console.log(`  LayoutNodes count: ${initialLayout.nodes.length}\n`);

  // 4. DocumentNormalizer
  const normalizer = new DocumentNormalizer();
  const normRes = normalizer.normalize(rawDoc, initialLayout);
  console.log(`STAGE 4: DocumentNormalizer`);
  console.log(`  Nodes count: ${normRes.layout.nodes.length}\n`);

  // 5. DocumentReconstructor
  const reconstructor = new DocumentReconstructor();
  const reconRes = reconstructor.reconstruct(normRes.rawDocument, normRes.layout);
  console.log(`STAGE 5: DocumentReconstructor`);
  console.log(`  Nodes count BEFORE: ${normRes.layout.nodes.length}`);
  console.log(`  Nodes count AFTER:  ${reconRes.layout.nodes.length}`);
  console.log(`  Summary:`, reconRes.summary);
  console.log(`  First 5 reconstructed:`, reconRes.layout.nodes.slice(0, 5).map((n) => n.text));
  console.log(`  Last 5 reconstructed:`, reconRes.layout.nodes.slice(-5).map((n) => n.text), `\n`);

  // 6. Tokenizer
  const tokenizer = new Tokenizer();
  const tokens = tokenizer.tokenize(reconRes.layout.nodes, reconRes.rawDocument);
  console.log(`STAGE 6: Tokenizer`);
  console.log(`  Total Tokens: ${tokens.length}`);
  const tokenBreakdown = tokens.reduce((acc, t) => { acc[t.kind] = (acc[t.kind] ?? 0) + 1; return acc; }, {});
  console.log(`  Token Breakdown:`, tokenBreakdown);
  console.log(`  Tokens sample:`, tokens.slice(0, 10).map((t) => ({ kind: t.kind, text: t.text.slice(0, 40) })), `\n`);

  // 7. LogicalBlockBuilder
  const logicalBuilder = new LogicalBlockBuilder();
  const logicalBlocks = logicalBuilder.build(tokens);
  console.log(`STAGE 7: LogicalBlockBuilder`);
  console.log(`  LogicalBlocks count: ${logicalBlocks.length}`);
  const blockBreakdown = logicalBlocks.reduce((acc, b) => { acc[b.kind] = (acc[b.kind] ?? 0) + 1; return acc; }, {});
  console.log(`  Block Breakdown:`, blockBreakdown);
  console.log(`  LogicalBlocks sample:`, logicalBlocks.map((b) => ({ kind: b.kind, id: b.id, text: 'text' in b ? b.text?.slice(0, 40) : 'N/A' })), `\n`);

  // 8. SemanticAnalyzer
  const semanticAnalyzer = new SemanticAnalyzer();
  const semanticBlocks = semanticAnalyzer.analyze(logicalBlocks);
  console.log(`STAGE 8: SemanticAnalyzer`);
  console.log(`  SemanticBlocks count: ${semanticBlocks.length}`);
  const roleBreakdown = semanticBlocks.reduce((acc, s) => { acc[s.role] = (acc[s.role] ?? 0) + 1; return acc; }, {});
  console.log(`  SemanticRole Breakdown:`, roleBreakdown);
  console.log(`  SemanticBlocks roles:`, semanticBlocks.map((s) => ({ role: s.role, id: s.id, text: 'text' in s ? s.text?.slice(0, 40) : 'N/A' })), `\n`);

  // 9. QuestionGraphBuilder
  const graphBuilder = new QuestionGraphBuilder();
  const graph = graphBuilder.build(semanticBlocks);
  console.log(`STAGE 9: QuestionGraphBuilder`);
  console.log(`  GraphNodes count BEFORE validation: ${graph.nodes.length}`);
  const graphKindBreakdown = graph.nodes.reduce((acc, g) => { acc[g.kind] = (acc[g.kind] ?? 0) + 1; return acc; }, {});
  console.log(`  Graph Nodes Breakdown:`, graphKindBreakdown);
  console.log(`  Graph Nodes:`, graph.nodes.map((g) => ({ kind: g.kind, id: g.id, text: 'stem' in g ? g.stem?.slice(0, 40) : 'text' in g ? g.text?.slice(0, 40) : 'N/A' })), `\n`);

  // 10. Validator
  const validator = new Validator();
  const { graph: validatedGraph, diagnostics } = validator.validate(graph);
  console.log(`STAGE 10: Validator`);
  console.log(`  GraphNodes count AFTER validation: ${validatedGraph.nodes.length}`);
  const valKindBreakdown = validatedGraph.nodes.reduce((acc, g) => { acc[g.kind] = (acc[g.kind] ?? 0) + 1; return acc; }, {});
  console.log(`  Validated Nodes Breakdown:`, valKindBreakdown);
  console.log(`  Validated Nodes:`, validatedGraph.nodes.map((g) => ({ kind: g.kind, id: g.id })), `\n`);

  // 11. OmlGenerator
  const omlGen = new OmlGenerator();
  const omlDoc = omlGen.generate(validatedGraph, { title: 'Đề thi Văn' }, diagnostics, normRes.stats);
  console.log(`STAGE 11: OmlGenerator Output`);
  console.log(`  omlDoc.content.length = ${omlDoc.content.length}`);
  console.log(`  omlDoc.content:`, omlDoc.content);

  await loadingTask.destroy();
}

traceLiteraturePipeline();
