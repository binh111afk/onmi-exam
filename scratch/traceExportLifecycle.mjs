import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile } from 'node:fs/promises';
import { PdfImporter } from '../src/document/importers/pdfImporter.ts';
import { LayoutAnalyzer } from '../src/document/layout/layoutAnalyzer.ts';
import { CompilerPipeline } from '../src/document/parsers/compiler/compilerPipeline.ts';
import { QuestionGraphBuilder } from '../src/document/parsers/compiler/questionGraphBuilder.ts';
import { Validator } from '../src/document/parsers/compiler/validator.ts';
import { OmlGenerator } from '../src/document/parsers/compiler/omlGenerator.ts';
import { questionDocumentToOml } from '../src/document/adapters/omlQuestionObjectAdapter.ts';
import { DocumentPipelineDispatcher } from '../src/document/pipeline/documentPipelineDispatcher.ts';

const testFile = 'tests/corpus/pdf-text/toan/75sdyoc01oy1.pdf';

async function traceExportLifecycle() {
  console.log(`\n======================================================`);
  console.log(`     EXPORT LIFECYCLE RUNTIME TRACE AUDIT            `);
  console.log(`======================================================\n`);

  const fileData = await readFile(testFile);
  const fakeFile = {
    name: '75sdyoc01oy1.pdf',
    type: 'application/pdf',
    arrayBuffer: async () => fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength),
  };

  // 1. Direct Pipeline Run (CompilerPipeline + OmlGenerator)
  const importer = new PdfImporter();
  const rawDoc = await importer.import(fakeFile);
  const layoutAnalyzer = new LayoutAnalyzer();
  const layout = layoutAnalyzer.analyze(rawDoc);

  const compiler = new CompilerPipeline();
  const questionDoc = compiler.compile(rawDoc, layout);

  console.log(`1. QuestionDocument (from CompilerPipeline.compile)` );
  console.log(`   document.content.length = ${questionDoc.content.length}`);
  const qDocQuestions = questionDoc.content.filter((c) => c.kind === 'question').length;
  const qDocParagraphs = questionDoc.content.filter((c) => c.kind === 'text' || c.kind === 'heading').length;
  const qDocGroups = questionDoc.content.filter((c) => c.kind === 'question-group').length;
  console.log(`   Breakdown -> Questions: ${qDocQuestions}, Groups: ${qDocGroups}, Paragraphs: ${qDocParagraphs}`);

  // 2. QuestionDocument -> OML (via questionDocumentToOml)
  const omlDoc = questionDocumentToOml(questionDoc);
  console.log(`\n2. OmlDocumentV2 (from questionDocumentToOml)`);
  console.log(`   omlDoc.content.length = ${omlDoc.content.length}`);
  const omlQuestions = omlDoc.content.filter((c) => c.type === 'question').length;
  const omlParagraphs = omlDoc.content.filter((c) => c.type === 'paragraph' || c.type === 'heading').length;
  const omlGroups = omlDoc.content.filter((c) => c.type === 'question-group').length;
  console.log(`   Breakdown -> Questions: ${omlQuestions}, Groups: ${omlGroups}, Paragraphs: ${omlParagraphs}`);

  // 3. JSON.stringify(omlDoc)
  const jsonString = JSON.stringify(omlDoc, null, 2);
  const parsedJson = JSON.parse(jsonString);
  console.log(`\n3. JSON.stringify & JSON.parse Verification`);
  console.log(`   JSON String Length: ${jsonString.length} bytes`);
  console.log(`   parsedJson.content.length = ${parsedJson.content.length}`);

  // 4. DocumentPipelineDispatcher.dispatch
  console.log(`\n4. DocumentPipelineDispatcher.dispatch(file)`);
  const dispatcher = new DocumentPipelineDispatcher();
  const dispatchResult = await dispatcher.dispatch(fakeFile);
  console.log(`   dispatchResult.document.content.length = ${dispatchResult.document.content.length}`);
  const dispQuestions = dispatchResult.document.content.filter((c) => c.kind === 'question').length;
  const dispParagraphs = dispatchResult.document.content.filter((c) => c.kind === 'text' || c.kind === 'heading').length;
  console.log(`   Breakdown -> Questions: ${dispQuestions}, Paragraphs: ${dispParagraphs}`);

  // 5. Benchmark export (toPipelineSummary & exportJson)
  console.log(`\n5. DocumentBenchmark Studio exportJson`);
  const toPipelineSummary = (pipeline) => ({
    route: pipeline.route,
    documentStatus: pipeline.documentStatus,
    trace: pipeline.trace,
    metrics: pipeline.metrics,
    documentCounts: {
      question: pipeline.document.content.filter((c) => c.kind === 'question').length,
    },
  });
  const summary = toPipelineSummary(dispatchResult);
  const benchmarkExport = JSON.stringify({ summary }, null, 2);
  console.log(`   Benchmark Export JSON stringified without document.content!`);
  console.log(`   benchmarkExport includes documentCounts:`, summary.documentCounts);

  // 6. Inspect if any filter or fallback in omlQuestionObjectAdapter drops nodes
  console.log(`\n6. First 5 content items in QuestionDocument:`);
  questionDoc.content.slice(0, 5).forEach((item, i) => console.log(`   [${i}] kind=${item.kind}, id=${'id' in item ? item.id : 'N/A'}`));
  console.log(`   Last 5 content items in QuestionDocument:`);
  questionDoc.content.slice(-5).forEach((item, i) => console.log(`   [${i}] kind=${item.kind}, id=${'id' in item ? item.id : 'N/A'}`));
}

traceExportLifecycle();
