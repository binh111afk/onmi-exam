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
 * Baseline Y-Clustering Engine:
 * Groups tokens on the same logical line using a font-height tolerant baseline.
 * Handles subscripts (log₂), superscripts (a³), and fractions cleanly without line breaks.
 */
const groupTokensIntoBaselineLines = (tokens: PdfTextToken[]): PdfTextToken[][] => {
  // Sort tokens by Y descending (top to bottom of page)
  const sortedByY = [...tokens].sort((a, b) => b.y - a.y);
  const lines: { baseY: number; avgHeight: number; tokens: PdfTextToken[] }[] = [];

  for (const token of sortedByY) {
    const existingLine = lines.find((line) => {
      const tolerance = Math.max(line.avgHeight, token.height) * 0.95;
      return Math.abs(token.y - line.baseY) <= tolerance;
    });

    if (existingLine) {
      existingLine.tokens.push(token);
      // Recalculate line parameters
      const totalH = existingLine.tokens.reduce((acc, t) => acc + t.height, 0);
      existingLine.avgHeight = totalH / existingLine.tokens.length;
    } else {
      lines.push({
        baseY: token.y,
        avgHeight: token.height,
        tokens: [token],
      });
    }
  }

  // Sort each line horizontally by X ascending
  return lines.map((line) => line.tokens.sort((a, b) => a.x - b.x));
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
    const avgH = (prev.height + curr.height) / 2;
    const microGapThreshold = Math.max(0.75, avgH * 0.1);

    if (gap <= microGapThreshold) {
      // Micro-gap: concatenate WITHOUT space
      textAcc = `${textAcc}${curr.text}`;
    } else {
      // Normal word gap: concatenate WITH space
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
          const tokens = textContent.items.map(getTextToken).filter((token): token is PdfTextToken => Boolean(token));
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
