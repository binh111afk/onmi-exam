import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { DocumentImporter } from '../contracts';
import type { RawDocument, RawTextNode } from '../../types/raw-document';

const MIN_PAGE_TEXT_LENGTH = 8;

interface PdfTextToken {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
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
  return item.str.trim() ? { text: item.str, x, y, width, height } : null;
};

const groupTokensIntoLines = (tokens: PdfTextToken[]): PdfTextToken[][] => {
  const lines = new Map<number, PdfTextToken[]>();
  tokens.forEach((token) => {
    const key = Math.round(token.y / Math.max(token.height, 1)) * Math.max(token.height, 1);
    const line = lines.get(key) ?? [];
    line.push(token);
    lines.set(key, line);
  });
  return [...lines.entries()].sort(([first], [second]) => second - first).map(([, line]) => line.sort((first, second) => first.x - second.x));
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
            groupTokensIntoLines(tokens).forEach((line) => {
              const x = Math.min(...line.map((token) => token.x));
              const y = Math.min(...line.map((token) => token.y - token.height));
              const right = Math.max(...line.map((token) => token.x + token.width));
              const bottom = Math.max(...line.map((token) => token.y));
              nodes.push({
                kind: 'text',
                text: line.map((token) => token.text).join(' ').replace(/\s+/g, ' ').trim(),
                page: pageNumber,
                boundingBox: [x, y, Math.max(1, right - x), Math.max(1, bottom - y)],
                confidence: 1,
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
