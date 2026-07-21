import { readdir, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

import { CompilerPipeline } from '../src/document/parsers/compiler/compilerPipeline.ts';

const MIN_PAGE_TEXT_LENGTH = 8;

const getTextToken = (item) => {
  if (typeof item !== 'object' || item === null || !('str' in item) || typeof item.str !== 'string') return null;
  const transform = 'transform' in item && Array.isArray(item.transform) ? item.transform : null;
  const x = transform && typeof transform[4] === 'number' ? transform[4] : 0;
  const y = transform && typeof transform[5] === 'number' ? transform[5] : 0;
  const width = 'width' in item && typeof item.width === 'number' ? item.width : 0;
  const height = 'height' in item && typeof item.height === 'number' && item.height > 0
    ? item.height
    : transform && typeof transform[0] === 'number'
      ? Math.abs(transform[0])
      : 1;
  return item.str.trim() ? { text: item.str, x, y, width, height } : null;
};

const groupTokensIntoLines = (tokens) => {
  const lines = new Map();
  tokens.forEach((token) => {
    const key = Math.round(token.y / Math.max(token.height, 1)) * Math.max(token.height, 1);
    const line = lines.get(key) ?? [];
    line.push(token);
    lines.set(key, line);
  });
  return [...lines.entries()].sort(([a], [b]) => b - a).map(([, line]) => line.sort((a, b) => a.x - b.x));
};

async function importPdfFile(filePath) {
  const data = await readFile(filePath);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
  const nodes = [];
  const pdf = await loadingTask.promise;
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    try {
      const textContent = await page.getTextContent();
      const tokens = textContent.items.map(getTextToken).filter(Boolean);
      const textLength = tokens.reduce((total, token) => total + token.text.length, 0);
      if (textLength >= MIN_PAGE_TEXT_LENGTH) {
        groupTokensIntoLines(tokens).forEach((line) => {
          const x = Math.min(...line.map((t) => t.x));
          const y = Math.min(...line.map((t) => t.y - t.height));
          const right = Math.max(...line.map((t) => t.x + t.width));
          const bottom = Math.max(...line.map((t) => t.y));
          nodes.push({
            kind: 'text',
            text: line.map((t) => t.text).join(' ').replace(/\s+/g, ' ').trim(),
            page: pageNumber,
            boundingBox: [x, y, Math.max(1, right - x), Math.max(1, bottom - y)],
            confidence: 1,
          });
        });
      }
    } finally {
      page.cleanup();
    }
  }
  await loadingTask.destroy();

  const rawDocument = {
    version: '1.0',
    source: { name: basename(filePath), mimeType: 'application/pdf', kind: 'pdf' },
    nodes,
    ocrRequirement: 'not-required',
    ocrCandidates: [],
    reviewMarkers: [],
  };

  const layout = {
    version: '1.0',
    sourceKind: 'pdf',
    pages: [],
    ocrPlan: [],
    nodes: rawDocument.nodes.map((n, i) => ({
      id: `layout-${i}`,
      rawNodeIndex: i,
      page: n.page,
      boundingBox: { x: n.boundingBox[0], y: n.boundingBox[1], width: n.boundingBox[2], height: n.boundingBox[3] },
      hasMeasuredGeometry: true,
      readingOrder: i,
      type: 'paragraph',
      text: n.text,
      confidence: 1,
    })),
  };

  return { rawDocument, layout };
}

function analyzeDocument(doc) {
  let questions = 0;
  let choiceQuestions = 0;
  let essayQuestions = 0;
  let trueFalseQuestions = 0;
  let fillBlankQuestions = 0;
  let groups = 0;
  let groupQuestions = 0;
  let headings = 0;
  let paragraphs = 0;
  let formulas = 0;

  for (const item of doc.content) {
    switch (item.kind) {
      case 'question':
        questions += 1;
        if (item.questionType === 'choice') choiceQuestions += 1;
        else if (item.questionType === 'essay') essayQuestions += 1;
        else if (item.questionType === 'true-false') trueFalseQuestions += 1;
        else if (item.questionType === 'fill-blank') fillBlankQuestions += 1;
        break;
      case 'question-group':
        groups += 1;
        groupQuestions += (item.questions?.length ?? 0);
        for (const q of (item.questions ?? [])) {
          if (q.questionType === 'choice') choiceQuestions += 1;
          else if (q.questionType === 'essay') essayQuestions += 1;
          else if (q.questionType === 'true-false') trueFalseQuestions += 1;
          else if (q.questionType === 'fill-blank') fillBlankQuestions += 1;
        }
        break;
      case 'heading':
        headings += 1;
        break;
      case 'text':
        paragraphs += 1;
        break;
      case 'formula':
        formulas += 1;
        break;
    }
  }

  const totalQuestions = questions + groupQuestions;
  return { questions, choiceQuestions, essayQuestions, trueFalseQuestions, fillBlankQuestions, groups, groupQuestions, totalQuestions, headings, paragraphs, formulas, contentItems: doc.content.length };
}

async function runFullCorpusAudit() {
  const corpusDir = 'tests/corpus/pdf-text';
  const subjects = ['toan', 'ly', 'hoa', 'anh', 'van', 'khac'];
  const pipeline = new CompilerPipeline();

  const subjectResults = {};
  let totalFiles = 0;
  let totalPass = 0;
  let totalFail = 0;
  const failures = [];

  for (const subj of subjects) {
    const dirPath = join(corpusDir, subj);
    let files = [];
    try {
      const entries = await readdir(dirPath);
      files = entries.filter((f) => f.endsWith('.pdf'));
    } catch { continue; }

    const subjStats = {
      total: files.length,
      pass: 0,
      fail: 0,
      totalQuestions: 0,
      choiceQuestions: 0,
      essayQuestions: 0,
      trueFalseQuestions: 0,
      fillBlankQuestions: 0,
      groups: 0,
      groupQuestions: 0,
      headings: 0,
      paragraphs: 0,
      formulas: 0,
      contentItems: 0,
      fileDetails: [],
    };

    for (const f of files) {
      totalFiles += 1;
      const filePath = join(dirPath, f);
      try {
        const { rawDocument, layout } = await importPdfFile(filePath);
        const report = pipeline.compileWithDiagnostics(rawDocument, layout);
        const analysis = analyzeDocument(report.document);

        const pass = analysis.totalQuestions > 0 || analysis.groups > 0;

        subjStats.totalQuestions += analysis.totalQuestions;
        subjStats.choiceQuestions += analysis.choiceQuestions;
        subjStats.essayQuestions += analysis.essayQuestions;
        subjStats.trueFalseQuestions += analysis.trueFalseQuestions;
        subjStats.fillBlankQuestions += analysis.fillBlankQuestions;
        subjStats.groups += analysis.groups;
        subjStats.groupQuestions += analysis.groupQuestions;
        subjStats.headings += analysis.headings;
        subjStats.paragraphs += analysis.paragraphs;
        subjStats.formulas += analysis.formulas;
        subjStats.contentItems += analysis.contentItems;

        if (pass) {
          subjStats.pass += 1;
          totalPass += 1;
        } else {
          subjStats.fail += 1;
          totalFail += 1;
          failures.push({
            file: `${subj}/${f}`,
            contentItems: analysis.contentItems,
            paragraphs: analysis.paragraphs,
            diagnosticsStatus: report.diagnostics.status,
            avgConfidence: report.diagnostics.averageConfidence,
          });
        }

        subjStats.fileDetails.push({
          file: f,
          ...analysis,
          status: pass ? 'PASS' : 'FAIL',
          diagnosticsStatus: report.diagnostics.status,
          avgConfidence: report.diagnostics.averageConfidence,
        });
      } catch (err) {
        subjStats.fail += 1;
        totalFail += 1;
        failures.push({ file: `${subj}/${f}`, error: err.message });
      }
    }

    subjectResults[subj] = subjStats;
  }

  console.log('\n' + '='.repeat(80));
  console.log('  FULL CORPUS AUDIT REPORT — Generic Exam Document Parser');
  console.log('='.repeat(80));

  console.log(`\nTotal PDFs: ${totalFiles}`);
  console.log(`Total PASS: ${totalPass}`);
  console.log(`Total FAIL: ${totalFail}`);
  console.log(`Pass Rate:  ${((totalPass / totalFiles) * 100).toFixed(1)}%`);

  console.log('\n' + '-'.repeat(80));
  console.log('  PER-SUBJECT BREAKDOWN');
  console.log('-'.repeat(80));

  for (const [subj, stats] of Object.entries(subjectResults)) {
    if (stats.total === 0) continue;
    console.log(`\n  ${subj.toUpperCase()} (${stats.total} files)`);
    console.log(`   PASS: ${stats.pass}  |  FAIL: ${stats.fail}  |  Rate: ${((stats.pass / stats.total) * 100).toFixed(1)}%`);
    console.log(`   Total Questions: ${stats.totalQuestions}`);
    console.log(`     Choice:     ${stats.choiceQuestions}`);
    console.log(`     Essay:      ${stats.essayQuestions}`);
    console.log(`     True/False: ${stats.trueFalseQuestions}`);
    console.log(`     Fill-Blank: ${stats.fillBlankQuestions}`);
    console.log(`   Groups:       ${stats.groups} (containing ${stats.groupQuestions} questions)`);
    console.log(`   Headings:     ${stats.headings}`);
    console.log(`   Paragraphs:   ${stats.paragraphs}`);
    console.log(`   Formulas:     ${stats.formulas}`);
    console.log(`   Content Items:${stats.contentItems}`);
  }

  if (failures.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('  FAILURES (0 questions detected)');
    console.log('-'.repeat(80));
    for (const f of failures) {
      console.log(`\n  X ${f.file}`);
      if (f.error) {
        console.log(`    Error: ${f.error}`);
      } else {
        console.log(`    Content items: ${f.contentItems}, Paragraphs: ${f.paragraphs}`);
        console.log(`    Diagnostics: ${f.diagnosticsStatus}, Confidence: ${f.avgConfidence}`);
      }
    }
  }

  console.log('\n' + '-'.repeat(80));
  console.log('  PER-FILE DETAIL');
  console.log('-'.repeat(80));

  for (const [subj, stats] of Object.entries(subjectResults)) {
    if (stats.total === 0) continue;
    console.log(`\n  ${subj.toUpperCase()}`);
    console.log('  File                              | Status | Qs  | Choice | Essay | Groups | Items');
    console.log('  ' + '-'.repeat(90));
    for (const d of stats.fileDetails) {
      const name = d.file.length > 33 ? d.file.slice(0, 30) + '...' : d.file.padEnd(33);
      console.log(`  ${name} | ${d.status.padEnd(6)} | ${String(d.totalQuestions).padStart(3)} | ${String(d.choiceQuestions).padStart(6)} | ${String(d.essayQuestions).padStart(5)} | ${String(d.groups).padStart(6)} | ${String(d.contentItems).padStart(5)}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('  END OF AUDIT');
  console.log('='.repeat(80));
}

runFullCorpusAudit();
