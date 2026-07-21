import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const corpusDir = 'tests/corpus/pdf-text';
const subjects = ['toan', 'ly', 'khac', 'hoa', 'van', 'anh'];

async function runMergeEngineAudit() {
  const allFiles = [];
  for (const subj of subjects) {
    const dirPath = join(corpusDir, subj);
    try {
      const files = await readdir(dirPath);
      for (const f of files) {
        if (f.endsWith('.pdf')) {
          allFiles.push(join(dirPath, f));
        }
      }
    } catch {}
  }

  console.log(`Auditing ${allFiles.length} PDF files for Multi-Feature Merge Signals...\n`);

  const pairs = [];
  let sampleCount = 0;

  for (const filePath of allFiles.slice(0, 25)) { // Sample 25 PDFs
    try {
      const fileData = await readFile(filePath);
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileData) });
      const pdf = await loadingTask.promise;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const items = textContent.items
          .filter((it) => typeof it === 'object' && it !== null && 'str' in it && typeof it.str === 'string' && it.str.trim())
          .map((it) => ({
            str: it.str,
            x: it.transform ? it.transform[4] : 0,
            y: it.transform ? it.transform[5] : 0,
            width: it.width,
            height: it.height > 0 ? it.height : (it.transform ? Math.abs(it.transform[0]) : 12),
            fontName: it.fontName,
            dir: it.dir,
            hasEOL: it.hasEOL,
          }));

        // Sort items into lines by Y
        const sortedY = [...items].sort((a, b) => b.y - a.y);
        const lines = [];
        for (const it of sortedY) {
          const l = lines.find((line) => Math.abs(it.y - line.baseY) <= Math.max(line.avgH, it.height) * 0.65);
          if (l) {
            l.items.push(it);
          } else {
            lines.push({ baseY: it.y, avgH: it.height, items: [it] });
          }
        }

        lines.forEach((line) => {
          const lineItems = line.items.sort((a, b) => a.x - b.x);
          for (let i = 0; i < lineItems.length - 1; i += 1) {
            const prev = lineItems[i];
            const next = lineItems[i + 1];

            const gap = next.x - (prev.x + prev.width);
            const avgH = (prev.height + next.height) / 2;
            const gapRatio = gap / avgH;

            const prevChar = prev.str[prev.str.length - 1];
            const nextChar = next.str[0];

            const prevUnicode = prevChar ? `U+${prevChar.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}` : '';
            const nextUnicode = nextChar ? `U+${nextChar.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}` : '';

            // Ground truth classification based on Vietnamese & PDF text patterns
            const isGlyphSplit = (
              // Case 1: prev ends with unaccented letter, next is diacritic/vowel (e.g. "GIÁO D" + "ỤC" or "S" + "Ở")
              (/[\p{L}]$/u.test(prev.str) && /^[\u0300-\u036fÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]/u.test(next.str)) ||
              // Case 2: prev ends with incomplete syllable letter (e.g. "T" + "Ổ" or "ĐÀO T" + "ẠO")
              (/[A-ZĐ]$/u.test(prev.str.trim()) && /^[ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]/u.test(next.str.trim())) ||
              (gap <= 1.0 && /[\p{L}]$/u.test(prev.str) && /^[\p{L}]/u.test(next.str))
            );

            pairs.push({
              file: filePath,
              page: pageNum,
              prevStr: prev.str,
              nextStr: next.str,
              prevChar,
              nextChar,
              prevUnicode,
              nextUnicode,
              gap: Number(gap.toFixed(2)),
              gapRatio: Number(gapRatio.toFixed(3)),
              sameFont: prev.fontName === next.fontName,
              deltaY: Number(Math.abs(prev.y - next.y).toFixed(2)),
              isGlyphSplit,
            });

            sampleCount += 1;
          }
        });

        page.cleanup();
      }
      await loadingTask.destroy();
    } catch {}
  }

  console.log(`Analyzed ${sampleCount} adjacent TextItem pairs.`);

  // Feature Analysis
  const glyphSplits = pairs.filter((p) => p.isGlyphSplit);
  const wordBoundaries = pairs.filter((p) => !p.isGlyphSplit);

  console.log(`\n======================================================`);
  console.log(`          FEATURE DISTRIBUTION ANALYSIS               `);
  console.log(`======================================================`);

  console.log(`Glyph Splits Sample Count: ${glyphSplits.length}`);
  console.log(`Word Boundaries Sample Count: ${wordBoundaries.length}`);

  // Gap Distribution for Glyph Splits vs Word Boundaries
  const glyphGaps = glyphSplits.map((p) => p.gap);
  const wordGaps = wordBoundaries.map((p) => p.gap);

  const avgGlyphGap = glyphGaps.length ? (glyphGaps.reduce((a, b) => a + b, 0) / glyphGaps.length).toFixed(2) : 0;
  const avgWordGap = wordGaps.length ? (wordGaps.reduce((a, b) => a + b, 0) / wordGaps.length).toFixed(2) : 0;

  console.log(`\n1. GAP COMPARISON:`);
  console.log(`   Avg Gap for Glyph Splits ("GIÁO D"+"ỤC"): ${avgGlyphGap} px`);
  console.log(`   Avg Gap for Word Boundaries ("TỔ"+"TOÁN"): ${avgWordGap} px`);

  // Accuracy of Gap Alone threshold at various levels
  [0.5, 1.0, 2.0, 3.8].forEach((thresh) => {
    const glyphCorrect = glyphSplits.filter((p) => p.gap <= thresh).length;
    const wordCorrect = wordBoundaries.filter((p) => p.gap > thresh).length;
    const totalAcc = (((glyphCorrect + wordCorrect) / pairs.length) * 100).toFixed(1);
    console.log(`   Threshold ${thresh}px Accuracy: ${totalAcc}% (Glyph split recall: ${((glyphCorrect / (glyphSplits.length || 1)) * 100).toFixed(1)}%, Word boundary accuracy: ${((wordCorrect / (wordBoundaries.length || 1)) * 100).toFixed(1)}%)`);
  });

  // Top 10 Glyph Splits ("GIÁO D"+"ỤC")
  console.log(`\n======================================================`);
  console.log(`  SAMPLE GLYPH SPLITS ("GIÁO D"+"ỤC" -> SHOULD MERGE NO SPACE)`);
  console.log(`======================================================`);
  glyphSplits.slice(0, 15).forEach((p, i) => {
    console.log(`[${i + 1}] "${p.prevStr}" + "${p.nextStr}" | gap=${p.gap}px | gapRatio=${p.gapRatio} | fontMatch=${p.sameFont} | prevCode=${p.prevUnicode} | nextCode=${p.nextUnicode}`);
  });

  // Top 10 Word Boundaries ("TỔ"+"TOÁN")
  console.log(`\n======================================================`);
  console.log(`  SAMPLE WORD BOUNDARIES ("TỔ"+"TOÁN" -> SHOULD MERGE WITH SPACE)`);
  console.log(`======================================================`);
  wordBoundaries.slice(0, 15).forEach((p, i) => {
    console.log(`[${i + 1}] "${p.prevStr}" + "${p.nextStr}" | gap=${p.gap}px | gapRatio=${p.gapRatio} | fontMatch=${p.sameFont} | prevCode=${p.prevUnicode} | nextCode=${p.nextUnicode}`);
  });
}

runMergeEngineAudit();
