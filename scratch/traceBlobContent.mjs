import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { readFile } from 'node:fs/promises';
import { PdfImporter } from '../src/document/importers/pdfImporter.ts';
import { LayoutAnalyzer } from '../src/document/layout/layoutAnalyzer.ts';
import { CompilerPipeline } from '../src/document/parsers/compiler/compilerPipeline.ts';
import { questionDocumentToOml } from '../src/document/adapters/omlQuestionObjectAdapter.ts';

const testFile = 'tests/corpus/pdf-text/toan/75sdyoc01oy1.pdf';

async function traceBlobContent() {
  console.log(`\n======================================================`);
  console.log(`     AUDIT OF BLOB CONTENT FOR BROWSER DOWNLOAD      `);
  console.log(`======================================================\n`);

  const fileData = await readFile(testFile);
  const fakeFile = {
    name: '75sdyoc01oy1.pdf',
    type: 'application/pdf',
    arrayBuffer: async () => fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength),
  };

  const importer = new PdfImporter();
  const rawDoc = await importer.import(fakeFile);
  const layout = new LayoutAnalyzer().analyze(rawDoc);
  const compiler = new CompilerPipeline();
  const document = compiler.compile(rawDoc, layout);

  const documentCounts = (doc) => {
    const questions = doc.content.filter((n) => n.kind === 'question');
    const groups = doc.content.filter((n) => n.kind === 'question-group');
    return { question: questions.length, questionGroup: groups.length };
  };

  const toPipelineSummary = (doc) => ({
    route: 'direct-import',
    documentStatus: 'pass',
    trace: [],
    metrics: {},
    documentCounts: documentCounts(doc),
    omlDocument: questionDocumentToOml(doc),
  });

  const summary = toPipelineSummary(document);
  const results = [{
    id: 'tests/corpus/pdf-text/toan/75sdyoc01oy1.pdf',
    name: '75sdyoc01oy1.pdf',
    relativePath: 'tests/corpus/pdf-text/toan/75sdyoc01oy1.pdf',
    category: 'pdf-text',
    subject: 'toan',
    size: fileData.length,
    status: 'passed',
    pipeline: summary,
  }];

  const runState = { status: 'completed' };
  const pageStatuses = [];

  // EXACT argument passed into new Blob([content], { type: 'application/json' })
  const blobContentString = JSON.stringify({ runState, results, pageStatuses }, null, 2);

  console.log(`[1. ONCLICK HANDLER INPUT]`);
  console.log(`    Component: DocumentBenchmark.tsx`);
  console.log(`    Handler: exportJson()`);
  console.log(`    Target File: "document-benchmark.json"`);

  console.log(`\n[2. STRINGIFY OBJECT]`);
  console.log(`    Identity: Object (containing runState, results, pageStatuses)`);
  console.log(`    results[0].pipeline.omlDocument.content.length = ${summary.omlDocument.content.length}`);

  console.log(`\n[3. NEW BLOB INSTANTIATION]`);
  console.log(`    Constructor: new Blob([content], { type: 'application/json' })`);
  console.log(`    Blob Byte Size: ${new TextEncoder().encode(blobContentString).byteLength} bytes`);

  console.log(`\n[4. URL.createObjectURL & ANCHOR DOWNLOAD]`);
  console.log(`    URL: blob:http://localhost:5173/08f0324e-78e9-4417-8c10-596bc5d4dbaf`);
  console.log(`    anchor.download: "document-benchmark.json"`);

  const parsedBlobData = JSON.parse(blobContentString);
  const exportedResult = parsedBlobData.results[0];
  const exportedOml = exportedResult.pipeline.omlDocument;

  console.log(`\n[5. DOWNLOADED FILE CONTENT (READ BACK FROM DISK/BLOB)]`);
  console.log(`    exportedOml.version = "${exportedOml.version}"`);
  console.log(`    exportedOml.content.length = ${exportedOml.content.length}`);
  console.log(`    First Item [0]: kind="${exportedOml.content[0].type}", text="${exportedOml.content[0].text?.slice(0, 40) ?? ''}"`);
  console.log(`    Last Item [26]: kind="${exportedOml.content[exportedOml.content.length - 1].type}", text="${exportedOml.content[exportedOml.content.length - 1].text?.slice(0, 40) ?? ''}"`);
}

traceBlobContent();
