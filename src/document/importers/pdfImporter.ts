import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import '../../config/pdfjsWorker';
import type { DocumentImporter } from '../contracts';
import type { RawDocument, RawTextNode } from '../../types/raw-document';
import { reconstructFormulaLineWithConfidence } from './formulaReconstructor';

const MIN_PAGE_TEXT_LENGTH = 8;

interface PdfTextToken {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName?: string;
}

const getTextToken = (item: unknown): PdfTextToken | null => {
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
  const fontName = 'fontName' in item && typeof item.fontName === 'string' ? item.fontName : undefined;
  return item.str.trim() ? { text: item.str, x, y, width, height, fontName } : null;
};

/**
 * PDF.js commonly returns a whole painted text run as one item. Formula
 * structure, however, is encoded in the position of individual glyphs. When
 * glyph widths are unavailable, distribute the measured run width across its
 * Unicode code points as a deterministic local approximation.
 */
const splitTextRunIntoGlyphs = (token: PdfTextToken): PdfTextToken[] => {
  const characters = Array.from(token.text);
  if (characters.length <= 1) return [token];

  const glyphWidth = token.width / characters.length;
  return characters.flatMap((character, index) => {
    if (/\s/u.test(character)) return [];
    return [{
      ...token,
      text: character,
      x: token.x + glyphWidth * index,
      width: Math.max(0, glyphWidth),
    }];
  });
};

/**
 * Some PDFs paint the same text run twice to simulate a heavier weight or
 * shadow. Keep one copy so duplicated glyphs do not become duplicated words.
 */
const deduplicateTokens = (tokens: PdfTextToken[]): PdfTextToken[] => {
  const seen = new Set<string>();
  return tokens.filter((token) => {
    const key = [
      token.text,
      token.fontName ?? '',
      token.x.toFixed(2),
      token.y.toFixed(2),
      token.width.toFixed(2),
      token.height.toFixed(2),
    ].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Baseline Y-Clustering Engine:
 * Groups tokens on the same logical line using a font-height relative baseline.
 * Handles subscripts (log₂), superscripts (a³), and fractions cleanly without line breaks.
 */
const groupTokensIntoBaselineLines = (tokens: PdfTextToken[]): PdfTextToken[][] => {
  const sortedByY = [...tokens].sort((a, b) => b.height - a.height || b.y - a.y || a.x - b.x);
  const lines: { baseY: number; fontHeight: number; tokens: PdfTextToken[] }[] = [];

  for (const token of sortedByY) {
    const existingLine = lines
      .map((line) => ({
        line,
        distance: Math.abs(token.y - line.baseY),
        tolerance: Math.max(line.fontHeight, token.height) * 0.6,
      }))
      .filter(({ distance, tolerance }) => distance <= tolerance)
      .sort((first, second) => first.distance - second.distance)[0]?.line;

    if (existingLine) {
      existingLine.tokens.push(token);
    } else {
      lines.push({
        baseY: token.y,
        fontHeight: token.height,
        tokens: [token],
      });
    }
  }

  return lines
    .sort((first, second) => second.baseY - first.baseY)
    .map((line) => line.tokens.sort((a, b) => a.x - b.x));
};

interface MergedTextSegment {
  text: string;
  mathConfidence?: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Geometry-Aware Token Merging:
 * Uses exact horizontal gaps to decide:
 * - Micro gap (gap <= avgH * 0.32) -> Concatenate WITHOUT space ("GIÁO D" + "ỤC" -> "GIÁO DỤC")
 * - Word gap (avgH * 0.32 < gap <= avgH * 2.8) -> Single space ("GIÁO" + "VIÊN" -> "GIÁO VIÊN")
 * - Option/Column gap (gap > avgH * 2.8 AND option marker) -> Split into separate RawTextNodes!
 */
const mergeLineTokensWithGeometry = (line: PdfTextToken[]): MergedTextSegment[] => {
  if (line.length === 0) return [];

  const segments: MergedTextSegment[] = [];
  let currentSegmentTokens: PdfTextToken[] = [line[0]];

  for (let i = 1; i < line.length; i += 1) {
    const prev = currentSegmentTokens[currentSegmentTokens.length - 1];
    const curr = line[i];

    const prevRight = prev.x + prev.width;
    const gap = curr.x - prevRight;
    const avgH = (prev.height + curr.height) / 2;

    const optionGapThreshold = Math.max(25, avgH * 2.8);

    // Option boundary detection: if horizontal gap is large AND curr is an option label (e.g. B., C., D.)
    const isOptionStart = /^\s*(?:[A-Da-d]\s*[.:)]|[①②③④])\s*$/u.test(curr.text.trim()) ||
                          /^\s*[B-D]\s*\.\s*/u.test(curr.text.trim());

    if (gap > optionGapThreshold && isOptionStart) {
      // Flush current segment
      segments.push(buildSegmentFromTokens(currentSegmentTokens));
      currentSegmentTokens = [curr];
    } else {
      currentSegmentTokens.push(curr);
    }
  }

  if (currentSegmentTokens.length > 0) {
    segments.push(buildSegmentFromTokens(currentSegmentTokens));
  }

  return segments;
};

const buildSegmentFromTokens = (tokens: PdfTextToken[]): MergedTextSegment => {
  const reconstructedFormula = reconstructFormulaLineWithConfidence(tokens);
  if (reconstructedFormula !== null) {
    const minX = Math.min(...tokens.map((token) => token.x));
    const minY = Math.min(...tokens.map((token) => token.y - token.height));
    const maxX = Math.max(...tokens.map((token) => token.x + token.width));
    const maxY = Math.max(...tokens.map((token) => token.y));
    return {
      text: reconstructedFormula.text,
      mathConfidence: reconstructedFormula.confidence,
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
  }

  if (tokens.length === 1) {
    return {
      text: tokens[0].text.trim(),
      x: tokens[0].x,
      y: tokens[0].y - tokens[0].height,
      width: tokens[0].width,
      height: tokens[0].height,
    };
  }

  let textAcc = tokens[0].text;
  for (let i = 1; i < tokens.length; i += 1) {
    const prev = tokens[i - 1];
    const curr = tokens[i];
    const prevRight = prev.x + prev.width;
    const gap = curr.x - prevRight;
    const sharedHeight = Math.min(prev.height, curr.height);
    const wordGapThreshold = Math.max(0.75, sharedHeight * 0.2);
    const baselineTolerance = Math.max(prev.height, curr.height) * 0.45;
    const staysInWord = gap <= wordGapThreshold && Math.abs(curr.y - prev.y) <= baselineTolerance;

    if (staysInWord) {
      // Contiguous glyph runs form one word.
      textAcc = `${textAcc}${curr.text}`;
    } else {
      // A word gap or baseline shift starts a new word.
      textAcc = `${textAcc} ${curr.text}`;
    }
  }

  const minX = Math.min(...tokens.map((t) => t.x));
  const minY = Math.min(...tokens.map((t) => t.y - t.height));
  const maxX = Math.max(...tokens.map((t) => t.x + t.width));
  const maxY = Math.max(...tokens.map((t) => t.y));

  return {
    text: textAcc.replace(/\s+/g, ' ').trim(),
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
};

export class PdfImporter implements DocumentImporter<File> {
  async import(file: File): Promise<RawDocument> {
    const loadingTask = pdfjsLib.getDocument({ data: await file.arrayBuffer() });
    const nodes: RawTextNode[] = [];
    const ocrCandidates: RawDocument['ocrCandidates'] = [];
    const reviewMarkers: RawDocument['reviewMarkers'] = [];
    let pagesWithText = 0;
    let pdf: PDFDocumentProxy | undefined;
    try {
      pdf = await loadingTask.promise;
      const pageCount = pdf.numPages;
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        try {
          const textContent = await page.getTextContent();
          const tokens = deduplicateTokens(
            textContent.items
              .map(getTextToken)
              .filter((token): token is PdfTextToken => Boolean(token))
              .flatMap(splitTextRunIntoGlyphs),
          );
          const textLength = tokens.reduce((total, token) => total + token.text.length, 0);

          if (textLength >= MIN_PAGE_TEXT_LENGTH) {
            pagesWithText += 1;
            const baselineLines = groupTokensIntoBaselineLines(tokens);

            baselineLines.forEach((line) => {
              const segments = mergeLineTokensWithGeometry(line);
              segments.forEach((seg) => {
                if (seg.text.length > 0) {
                  nodes.push({
                    kind: 'text',
                    text: seg.text,
                    ...(seg.mathConfidence === undefined ? {} : { mathConfidence: seg.mathConfidence }),
                    page: pageNumber,
                    boundingBox: [seg.x, seg.y, seg.width, seg.height],
                    confidence: 1,
                  });
                }
              });
            });
          } else {
            ocrCandidates.push({ page: pageNumber, reason: 'page-without-text-layer' });
            reviewMarkers.push({ status: 'ai-review-required', reason: 'ocr-required', page: pageNumber });
          }
        } finally {
          page.cleanup();
        }
      }

      const ocrRequirement = pagesWithText === pageCount
        ? 'not-required'
        : pagesWithText === 0
          ? 'required'
          : 'partial';

      return {
        version: '1.0',
        source: { name: file.name, mimeType: file.type || 'application/pdf', kind: 'pdf' },
        nodes,
        ocrRequirement,
        ocrCandidates,
        reviewMarkers,
      };
    } finally {
      if (pdf !== undefined) await pdf.cleanup();
      await loadingTask.destroy();
    }
  }
}
