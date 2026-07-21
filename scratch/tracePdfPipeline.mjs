import { readFile } from 'node:fs/promises';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

import { CompilerPipeline } from '../src/document/parsers/compiler/compilerPipeline.ts';
import { DocumentNormalizer } from '../src/document/parsers/compiler/documentNormalizer.ts';
import { DocumentReconstructor } from '../src/document/parsers/compiler/documentReconstructor.ts';

const pdfPath = 'tests/corpus/pdf-text/toan/75sdyoc01oy1.pdf';

async function traceOptionsAndFormulas() {
  const fileData = await readFile(pdfPath);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileData) });
  const pdf = await loadingTask.promise;
  const page1 = await pdf.getPage(1);
  const textContent = await page1.getTextContent();
  
  const rawItems = textContent.items.map((item, i) => {
    if (typeof item !== 'object' || item === null || !('str' in item)) return null;
    return {
      index: i,
      str: item.str,
      transform: item.transform,
      x: item.transform ? item.transform[4] : 0,
      y: item.transform ? item.transform[5] : 0,
      width: item.width,
      height: item.height,
      fontName: item.fontName,
    };
  }).filter(Boolean);

  console.log(`\n======================================================`);
  console.log(`  TRACING OPTIONS & FORMULAS IN 75sdyoc01oy1.pdf`);
  console.log(`======================================================\n`);

  // Trace Option items (e.g. A., B., C., D. items on Page 1)
  console.log(`--- Stage 1: Raw PDF.js TextItems for Options (A., B., C., D.) ---`);
  const optionItems = rawItems.filter(item => /^[A-D]\.$/u.test(item.str.trim()) || /log|x=/i.test(item.str));
  optionItems.slice(0, 15).forEach((item) => {
    console.log(`  Item #${item.index}: str="${item.str}" | x=${item.x.toFixed(2)}, y=${item.y.toFixed(2)}, w=${item.width.toFixed(2)}, h=${item.height.toFixed(2)}`);
  });

  // Importer grouping for options on line
  const linesMap = new Map();
  rawItems.filter(item => item.str.trim().length > 0).forEach((token) => {
    const key = Math.round(token.y / Math.max(token.height, 1)) * Math.max(token.height, 1);
    const line = linesMap.get(key) ?? [];
    line.push(token);
    linesMap.set(key, line);
  });

  const sortedLines = [...linesMap.entries()]
    .sort(([f], [s]) => s - f)
    .map(([, line]) => line.sort((f, s) => f.x - s.x));

  console.log(`\n--- Stage 2: PdfImporter Line Nodes for Options ---`);
  sortedLines.forEach((line, i) => {
    const joined = line.map((t) => t.str).join(' ').replace(/\s+/g, ' ').trim();
    if (/^[A-D]\./u.test(joined) || /[A-D]\.\s+.*[B-D]\./u.test(joined)) {
      console.log(`  Importer Line #${i + 1} (y=${line[0].y.toFixed(1)}): "${joined}"`);
      console.log(`    Token bounding boxes & gap analysis:`);
      for (let t = 0; t < line.length - 1; t++) {
        const curr = line[t];
        const next = line[t + 1];
        const gap = next.x - (curr.x + curr.width);
        console.log(`      Token "${curr.str}" [right=${(curr.x + curr.width).toFixed(1)}] --(gap=${gap.toFixed(1)}px)--> Token "${next.str}" [left=${next.x.toFixed(1)}]`);
      }
    }
  });

  await loadingTask.destroy();
}

traceOptionsAndFormulas();
