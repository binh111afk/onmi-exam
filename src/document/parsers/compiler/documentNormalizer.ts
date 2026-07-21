/**
 * DocumentNormalizer — Stage 0 of the Compiler Pipeline.
 *
 * Pre-processes RawDocument and DocumentLayout to clean OCR noise, fix Unicode,
 * repair broken words and hyphenations BEFORE tokenization.
 *
 * RULES:
 * - Does NOT parse or create questions.
 * - Pure data sanitization function.
 */
import type { DocumentLayout, DocumentLayoutNode } from '../../../types/document-layout.ts';
import type { RawDocument, RawDocumentNode } from '../../../types/raw-document.ts';
import { normalizeOcrText } from './ocrNoiseDictionary.ts';

export interface NormalizationStats {
  normalizationAppliedCount: number;
  recoveredOcrTokenCount: number;
  lowestNormalizationConfidence: number;
}

export interface NormalizationResult {
  rawDocument: RawDocument;
  layout: DocumentLayout;
  stats: NormalizationStats;
}

export class DocumentNormalizer {
  normalize(rawDocument: RawDocument, layout: DocumentLayout): NormalizationResult {
    let normalizationAppliedCount = 0;
    let recoveredOcrTokenCount = 0;
    let lowestNormalizationConfidence = 1.0;

    // 1. Sanitize RawDocument nodes
    const normalizedRawNodes: RawDocumentNode[] = rawDocument.nodes.map((node) => {
      if (node.kind !== 'text' || !node.text) return node;

      const { text: cleanedText, fixes, confidence } = this.sanitizeText(node.text);
      if (fixes > 0) {
        normalizationAppliedCount += fixes;
        recoveredOcrTokenCount += fixes;
        if (confidence < lowestNormalizationConfidence) {
          lowestNormalizationConfidence = confidence;
        }
      }

      return {
        ...node,
        text: cleanedText,
      };
    });

    // 2. Sanitize DocumentLayout nodes
    const normalizedLayoutNodes: DocumentLayoutNode[] = layout.nodes.map((node) => {
      if (!node.text) return node;

      const { text: cleanedText, fixes, confidence } = this.sanitizeText(node.text);
      if (fixes > 0) {
        normalizationAppliedCount += fixes;
        if (confidence < lowestNormalizationConfidence) {
          lowestNormalizationConfidence = confidence;
        }
      }

      return {
        ...node,
        text: cleanedText,
      };
    });

    const normalizedRawDocument: RawDocument = {
      ...rawDocument,
      nodes: normalizedRawNodes,
    };

    const normalizedPages = layout.pages.map((page) => ({
      ...page,
      nodes: page.nodes.map((node) => {
        if (!node.text) return node;
        const { text: cleanedText } = this.sanitizeText(node.text);
        return { ...node, text: cleanedText };
      }),
    }));

    const normalizedLayout: DocumentLayout = {
      ...layout,
      pages: normalizedPages,
      nodes: normalizedLayoutNodes,
    };

    return {
      rawDocument: normalizedRawDocument,
      layout: normalizedLayout,
      stats: {
        normalizationAppliedCount,
        recoveredOcrTokenCount,
        lowestNormalizationConfidence: lowestNormalizationConfidence === 1.0 ? 1.0 : lowestNormalizationConfidence,
      },
    };
  }

  private sanitizeText(input: string): { text: string; fixes: number; confidence: number } {
    let fixes = 0;
    let confidence = 1.0;

    // A. Unicode Normalization (NFC)
    let text = input.normalize('NFC');

    // B. Whitespace Cleanup
    const initialText = text;
    text = text.replace(/[\u00A0\u200B]/gu, ' '); // Non-breaking space & zero-width space
    text = text.replace(/[ \t]+/gu, ' '); // Multiple spaces/tabs to single space
    text = text.replace(/ *\n */gu, '\n'); // Clean lines
    text = text.trim();

    if (text !== initialText) {
      fixes += 1;
    }

    // C. OCR Noise Dictionary Repairs
    const ocrResult = normalizeOcrText(text);
    text = ocrResult.normalized;
    fixes += ocrResult.fixesCount;
    if (ocrResult.lowestConfidence < confidence) {
      confidence = ocrResult.lowestConfidence;
    }

    return { text, fixes, confidence };
  }
}
