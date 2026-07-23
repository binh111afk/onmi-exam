export interface FormulaToken {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FormulaReconstruction {
  text: string;
  confidence: number;
  kind: 'symbol' | 'script' | 'fraction';
}

interface TokenRun {
  tokens: FormulaToken[];
}

const SYMBOL_TO_LATEX: Readonly<Record<string, string>> = {
  '∞': '\\infty',
  'π': '\\pi',
  '√': '\\sqrt{}',
  '≤': '\\le',
  '≥': '\\ge',
  '≠': '\\ne',
  '±': '\\pm',
  '×': '\\times',
  '÷': '\\div',
  '∑': '\\sum',
  '∫': '\\int',
};

const MATH_TOKEN = /^(?:[0-9A-Za-z]|log|ln|sin|cos|tan|lim|[=+−\-*/()|]|[∞π√≤≥≠±×÷∑∫])+$/u;
const MATH_SIGNAL = /[=+−\-*/^]|(?:log|ln|sin|cos|tan|lim)|[∞π√≤≥≠±×÷∑∫]/u;
const PROSE_WORD = /\p{L}{3,}/u;

const median = (values: number[]): number => {
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const normalizeSymbols = (text: string): string => Array.from(text, (character) => SYMBOL_TO_LATEX[character] ?? character).join('');

const joinTokens = (tokens: FormulaToken[]): string => tokens
  .map((token) => normalizeSymbols(token.text))
  .join('')
  .replace(/\s+/gu, '');

const makeRuns = (tokens: FormulaToken[], predicate: (token: FormulaToken) => boolean): TokenRun[] => {
  const runs: TokenRun[] = [];
  let current: FormulaToken[] = [];

  tokens.filter(predicate).sort((first, second) => first.x - second.x).forEach((token) => {
    const previous = current.at(-1);
    const gap = previous ? token.x - (previous.x + previous.width) : 0;
    if (previous && gap > Math.max(previous.height, token.height) * 1.25) {
      runs.push({ tokens: current });
      current = [];
    }
    current.push(token);
  });

  if (current.length > 0) runs.push({ tokens: current });
  return runs;
};

const runBounds = (run: TokenRun): { left: number; right: number; center: number } => {
  const left = Math.min(...run.tokens.map((token) => token.x));
  const right = Math.max(...run.tokens.map((token) => token.x + token.width));
  return { left, right, center: (left + right) / 2 };
};

const reconstructScripts = (tokens: FormulaToken[], baselineY: number, baselineHeight: number): string => {
  let output = '';
  let previous: FormulaToken | undefined;

  tokens.forEach((token) => {
    const value = normalizeSymbols(token.text);
    const isSmall = token.height < baselineHeight * 0.88;
    const offset = token.y - baselineY;
    const isSuperscript = isSmall && offset > baselineHeight * 0.22;
    const isSubscript = isSmall && offset < -baselineHeight * 0.22;
    const gap = previous ? token.x - (previous.x + previous.width) : 0;

    if (isSuperscript || isSubscript) {
      output += `${isSuperscript ? '^' : '_'}{${value}}`;
    } else {
      if (previous && gap > Math.max(previous.height, token.height) * 0.45) output += ' ';
      output += value;
    }
    previous = token;
  });

  return output;
};

/**
 * Reconstructs PDF glyph geometry into compact LaTeX while retaining ordinary
 * text exactly as extracted. It deliberately acts only on math-like lines.
 */
export const reconstructFormulaLineWithConfidence = <T extends FormulaToken>(tokens: T[]): FormulaReconstruction | null => {
  if (tokens.length === 0) return null;
  const sorted = [...tokens].sort((first, second) => first.x - second.x);
  const hasMathContext = sorted.some((token) => MATH_SIGNAL.test(token.text));
  if (!hasMathContext) return null;
  const proseTokenCount = sorted.filter((token) => PROSE_WORD.test(token.text) && !MATH_TOKEN.test(token.text)).length;
  if (proseTokenCount > 0) return null;
  const hasSymbolNormalization = sorted.some((token) => normalizeSymbols(token.text) !== token.text);

  const baselineTokens = sorted.filter((token) => token.height >= Math.max(...sorted.map((item) => item.height)) * 0.88);
  const baselineY = median((baselineTokens.length > 0 ? baselineTokens : sorted).map((token) => token.y));
  const baselineHeight = median((baselineTokens.length > 0 ? baselineTokens : sorted).map((token) => token.height));
  const isComparableMathToken = (token: FormulaToken): boolean => MATH_TOKEN.test(token.text) && token.height >= baselineHeight * 0.45;
  const numeratorRuns = makeRuns(sorted, (token) => isComparableMathToken(token) && token.y - baselineY > baselineHeight * 0.3);
  const denominatorRuns = makeRuns(sorted, (token) => isComparableMathToken(token) && baselineY - token.y > baselineHeight * 0.3);
  const fractions = new Map<number, { end: number; latex: string }>();
  const consumed = new Set<number>();

  numeratorRuns.forEach((numerator) => {
    const numeratorBounds = runBounds(numerator);
    const denominator = denominatorRuns
      .filter((candidate) => !candidate.tokens.some((token) => consumed.has(sorted.indexOf(token))))
      .map((candidate) => ({ candidate, bounds: runBounds(candidate) }))
      .filter(({ bounds }) => Math.abs(bounds.center - numeratorBounds.center) <= Math.max(numeratorBounds.right - numeratorBounds.left, baselineHeight) * 0.7)
      .sort((first, second) => Math.abs(first.bounds.center - numeratorBounds.center) - Math.abs(second.bounds.center - numeratorBounds.center))[0]?.candidate;
    if (!denominator) return;

    const fractionIndexes = [...numerator.tokens, ...denominator.tokens].map((token) => sorted.indexOf(token));
    const start = Math.min(...fractionIndexes);
    const end = Math.max(...fractionIndexes);
    const numeratorLatex = reconstructScripts(numerator.tokens, median(numerator.tokens.map((token) => token.y)), median(numerator.tokens.map((token) => token.height)));
    const denominatorLatex = reconstructScripts(denominator.tokens, median(denominator.tokens.map((token) => token.y)), median(denominator.tokens.map((token) => token.height)));
    fractions.set(start, { end, latex: `\\frac{${numeratorLatex}}{${denominatorLatex}}` });
    fractionIndexes.forEach((index) => consumed.add(index));
  });

  if (fractions.size === 0 && !hasSymbolNormalization && !sorted.some((token) => token.height < baselineHeight * 0.88)) return null;

  const output: string[] = [];
  let outputTokens: FormulaToken[] = [];
  const flushOutputTokens = (): void => {
    if (outputTokens.length === 0) return;
    output.push(reconstructScripts(outputTokens, baselineY, baselineHeight));
    outputTokens = [];
  };
  for (let index = 0; index < sorted.length; index += 1) {
    const fraction = fractions.get(index);
    if (fraction) {
      flushOutputTokens();
      output.push(fraction.latex);
      index = fraction.end;
      continue;
    }
    if (!consumed.has(index)) outputTokens.push(sorted[index]);
  }
  flushOutputTokens();

  const text = output.join('');
  if (!text) return null;
  return {
    text,
    confidence: fractions.size > 0 ? 0.93 : hasSymbolNormalization ? 0.99 : 0.97,
    kind: fractions.size > 0 ? 'fraction' : hasSymbolNormalization ? 'symbol' : 'script',
  };
};

export const reconstructFormulaLine = <T extends FormulaToken>(tokens: T[]): string | null => (
  reconstructFormulaLineWithConfidence(tokens)?.text ?? null
);
