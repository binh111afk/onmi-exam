/**
 * Document Normalizer — Stage 0 of the Compiler Pipeline.
 *
 * It repairs encoding and stable OCR typography only. Reconstructing missing
 * mathematical content belongs to the geometry-aware importer or manual review.
 */

import { normalizeOcrText } from './ocrNoiseDictionary.ts';
import type { DocumentLayout } from '../../../types/document-layout.ts';
import type { RawDocument } from '../../../types/raw-document.ts';

export interface NormalizationStats {
  unicodeFixes: number;
  ocrFixes: number;
  lowestConfidence: number;
}

export class DocumentNormalizer {
  normalizeText(input: string): { text: string; fixes: number; ocrFixes: number; confidence: number } {
    if (!input) return { text: '', fixes: 0, ocrFixes: 0, confidence: 1.0 };

    let text = input;
    let fixes = 0;
    let confidence = 1.0;
    const nfcText = text.normalize('NFC');
    if (nfcText !== text) {
      fixes += 1;
      text = nfcText;
    }

    const sanitized = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uE000-\uF8FF]/gu, '');
    if (sanitized !== text) {
      fixes += 1;
      text = sanitized;
    }

    const ocrResult = normalizeOcrText(text);
    text = normalizeMathAndText(ocrResult.normalized);
    fixes += ocrResult.fixesCount;
    confidence = Math.min(confidence, ocrResult.lowestConfidence);
    return { text, fixes, ocrFixes: ocrResult.fixesCount, confidence };
  }

  normalize(rawDocument: RawDocument, layout: DocumentLayout): { rawDocument: RawDocument; layout: DocumentLayout; stats: NormalizationStats } {
    let unicodeFixes = 0;
    let ocrFixes = 0;
    let lowestConfidence = 1.0;
    const normalizedNodes = rawDocument.nodes.map((node) => {
      if (node.kind !== 'text' || !node.text) return node;
      const result = this.normalizeText(node.text);
      unicodeFixes += result.fixes;
      ocrFixes += result.ocrFixes;
      lowestConfidence = Math.min(lowestConfidence, result.confidence);
      return { ...node, text: result.text };
    });
    const normalizedLayoutNodes = layout.nodes.map((node) => {
      if (!node.text) return node;
      return { ...node, text: this.normalizeText(node.text).text };
    });

    return {
      rawDocument: { ...rawDocument, nodes: normalizedNodes },
      layout: { ...layout, nodes: normalizedLayoutNodes },
      stats: { unicodeFixes, ocrFixes, lowestConfidence },
    };
  }
}

const hasMathSignal = (expression: string): boolean => (
  /\\[a-z]+(?:\b|\{)/iu.test(expression)
  || /(?:[_^{}]|[=<>≤≥≠±×÷])/u.test(expression)
  || /^[A-Z]\s*\([^)]*\d[^)]*\)$/u.test(expression)
);

const normalizeMathExpression = (expression: string): string => expression
  .replace(/α/gu, '\\alpha')
  .replace(/\b(sin|cos|tan|cot|log|ln)\b/giu, '\\$1')
  .replace(/\bu([0-9])\b/gu, 'u_$1')
  .replace(/[−–]/gu, '-');

const wrapMath = (expression: string): string => {
  const match = expression.trim().match(/^(?<body>.*?)(?<punctuation>[.!?;])?$/u);
  const body = match?.groups?.body ?? expression.trim();
  return `$${normalizeMathExpression(body)}$${match?.groups?.punctuation ?? ''}`;
};

const wrapInlineMath = (text: string): string => {
  if ((text.match(/(?:^|\s)[A-Da-d]\s*[.):]/gu) ?? []).length > 1) return text;
  const coordinateExpression = /\b[A-Za-z]\s*=\s*\(\s*[-−–]?\d+(?:\s*[;,]\s*[-−–]?\d+){1,3}\s*\)/gu;
  const assignmentExpression = /\b(?:[A-Z]{1,4}|[a-zA-Z]+\([^)]*\)|[a-zA-Z]+(?:_[A-Za-z0-9{}.]+|\^[A-Za-z0-9{}]+)?)\s*=\s*[-−–]?[0-9A-Za-z\p{No}{}^().,;]+(?:\s*[+−–\-*/]\s*[0-9A-Za-z\p{No}{}^().,;]+)*(?!\s*[+−–\-*/])(?=$|[\s;,.!?])/gu;
  let output = text.replace(coordinateExpression, wrapMath);
  output = output.replace(/\(\s*α\s*\)\s*:\s*[^.,;!?$]+?=\s*[−-]?\d+/gu, wrapMath);
  output = output.split(/(\$[^$]*\$)/u).map((segment) => (
    segment.startsWith('$') ? segment : segment.replace(assignmentExpression, wrapMath)
  )).join('');
  return output.split(/(\$[^$]*\$)/u).map((segment) => {
    if (segment.startsWith('$')) return segment;
    return segment
      .replace(/\bOxyz\b/gu, wrapMath)
      .replace(/\b[A-Z]\.[A-Z]{2,4}\b/gu, wrapMath)
      .replace(/((?:đáy|cạnh|khối|hình)\s+)([A-Z]{2,4})\b/giu, (match, prefix: string, label: string) => (
        label === label.toUpperCase() ? `${prefix}${wrapMath(label)}` : match
      ));
  }).join('');
};

const hasUnbalancedMathDelimiters = (text: string): boolean => (
  (text.match(/\$[^$]*\$/gu) ?? []).some((segment) => {
    const body = segment.slice(1, -1);
    return [...body].filter((character) => character === '(').length !== [...body].filter((character) => character === ')').length
      || [...body].filter((character) => character === '{').length !== [...body].filter((character) => character === '}').length;
  })
);

/** Wraps only a complete, unambiguous math-only line or option. */
export function normalizeMathAndText(input: string): string {
  if (!input) return input;
  let text = input
    .replace(/[\uFFFD]/gu, '')
    .replace(/\uA76F/gu, '\\infty')
    .replace(/\$\$\./gu, '$')
    .replace(/\$\$\+/gu, '$');

  const startsWithLatexCommand = text.trimStart().charCodeAt(0) === 92;
  if (startsWithLatexCommand || /[\p{L}\d)}]\$\s*[+−–-]/u.test(text) || hasUnbalancedMathDelimiters(text)) {
    text = text.split('$').join('');
  }
  const dollars = text.match(/\$/gu)?.length ?? 0;
  if (dollars % 2 !== 0) text = text.replace(/\$/gu, '');
  if (!text.includes('$') && !startsWithLatexCommand) text = wrapInlineMath(text);
  if (text.includes('$')) return text;
  if (/^\s*(?:câu|question|cau)\s*\.?\s*\d+/iu.test(text)) return text;

  const match = text.match(/^(?<prefix>\s*(?:(?:[A-Da-d]\s*[.):]|[①②③④])\s*)?)(?<expression>.*?)(?<suffix>[.!?]\s*)?$/u);
  if (!match?.groups) return text;
  const expression = match.groups.expression.trim();
  if (!expression || !hasMathSignal(expression)) return text;
  if (/(?:[=+*/-]|[;,:])\s*$/u.test(expression) || /(?:=|[+*/-])\s*;/u.test(expression)) return text;

  const containsVietnameseWords = /\p{L}{3,}\s+\p{L}{3,}/u.test(expression.replace(/\\[a-z]+/giu, ''));
  if (containsVietnameseWords) return text;

  return `${match.groups.prefix}${wrapMath(expression)}${match.groups.suffix ?? ''}`;
}
