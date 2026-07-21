import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PdfImporter } from '../src/document/importers/pdfImporter.ts';
import { DocumentNormalizer } from '../src/document/parsers/compiler/documentNormalizer.ts';
import { DocumentReconstructor } from '../src/document/parsers/compiler/documentReconstructor.ts';
import { CompilerPipeline } from '../src/document/parsers/compiler/compilerPipeline.ts';

async function runAudit() {
  const corpusDir = 'tests/corpus/pdf-text';
  const subjects = ['toan', 'ly', 'khac', 'hoa', 'van', 'anh'];
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

  console.log(`Auditing ${allFiles.length} PDF files with new geometry-aware PdfImporter...`);

  const issues = [];
  const stats = {
    totalPdfs: allFiles.length,
    processedPdfs: 0,
    splitWordsFound: 0,
    concatenatedWordsFound: 0,
    brokenOptionsFound: 0,
    brokenFormulasFound: 0,
    noiseInContentFound: 0,
    falseReadingGroupsFound: 0,
  };

  const importer = new PdfImporter();
  const normalizer = new DocumentNormalizer();
  const reconstructor = new DocumentReconstructor();
  const pipeline = new CompilerPipeline();

  for (const filePath of allFiles) {
    try {
      const fileData = await readFile(filePath);
      const fakeFile = {
        name: filePath,
        type: 'application/pdf',
        arrayBuffer: async () => fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength),
      };

      const rawDocument = await importer.import(fakeFile);

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

      const normRes = normalizer.normalize(rawDocument, layout);
      const reconRes = reconstructor.reconstruct(normRes.rawDocument, normRes.layout);
      const report = pipeline.compileWithDiagnostics(rawDocument, layout);
      stats.processedPdfs += 1;

      // Inspect reconstructed nodes for specific issue patterns
      rawDocument.nodes.forEach((node, idx) => {
        const text = node.text ?? '';

        // 1. Whitespace split words (e.g. "GIÁO D ỤC", "ĐÀO TẠ O", "T Ố T NGHI Ệ P")
        if (/\b(?:[A-ZĐ]\s+[ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ\p{L}]|\p{L}+\s+[ÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]\p{L}*)\b/gu.test(text)) {
          if (!/^[A-D]\.\s/u.test(text)) {
            stats.splitWordsFound += 1;
            issues.push({
              file: filePath,
              line: idx,
              category: '1. Whitespace Recovery Failure',
              snippet: text,
            });
          }
        }

        // 2. OCR Concatenated Words
        if (/(?:trảlờitừ|chuẩnbị|vớimặt|đoạnvăn|câuhỏi|bàiđọc|chocác|củahàm|trongkhông|giátrị|phươngtrình)/iu.test(text)) {
          stats.concatenatedWordsFound += 1;
          issues.push({
            file: filePath,
            line: idx,
            category: '2. OCR Concatenated Words',
            snippet: text,
          });
        }

        // 3. Option Reconstruction Failure (e.g. multiple options concatenated in 1 line "A. ... B. ... C. ... D. ...")
        if (/A\..*B\..*C\..*D\./u.test(text) && text.length > 40) {
          stats.brokenOptionsFound += 1;
          issues.push({
            file: filePath,
            line: idx,
            category: '3. Option Concatenation Failure',
            snippet: text.slice(0, 120),
          });
        }

        // 4. Formula Reconstruction Failure
        if (/\b[A-Z]{2}=\d+\s+[a-z]\b/u.test(text) || /log\s+\d/iu.test(text) || /sin\s+\d\s*x/iu.test(text) || /cos\s+\d\s*x/iu.test(text)) {
          stats.brokenFormulasFound += 1;
          issues.push({
            file: filePath,
            line: idx,
            category: '4. Formula Reconstruction Failure',
            snippet: text,
          });
        }

        // 5. Noise Leaking Into Content
        if (/\b(?:MAPSTUDY|Mã\s+đề|Đáp\s+án:|Trang\s+\d+[\/\d]*)\b/iu.test(text)) {
          stats.noiseInContentFound += 1;
          issues.push({
            file: filePath,
            line: idx,
            category: '5. Noise Leaked Into Content',
            snippet: text,
          });
        }
      });

    } catch (err) {
      console.error(`Error auditing ${filePath}:`, err.message);
    }
  }

  console.log('\n======================================================');
  console.log('    NEW GEOMETRY-AWARE IMPORTER CORPUS STATS          ');
  console.log('======================================================');
  console.log(JSON.stringify(stats, null, 2));
}

runAudit();
