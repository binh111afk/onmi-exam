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
  '∏': '\\prod',
  '∂': '\\partial',
  '∇': '\\nabla',
  '∈': '\\in',
  '∉': '\\notin',
  '∅': '\\varnothing',
  '⊂': '\\subset',
  '⊆': '\\subseteq',
  '⊃': '\\supset',
  '⊇': '\\supseteq',
  '∪': '\\cup',
  '∩': '\\cap',
  '∀': '\\forall',
  '∃': '\\exists',
  '∧': '\\land',
  '∨': '\\lor',
  '¬': '\\neg',
  '→': '\\to',
  '←': '\\leftarrow',
  '↔': '\\leftrightarrow',
  '⇒': '\\Rightarrow',
  '⇔': '\\Leftrightarrow',
  '≈': '\\approx',
  '≡': '\\equiv',
  '∝': '\\propto',
  '⋅': '\\cdot',
};

const MATH_TOKEN = /^(?:[0-9A-Za-z]|log|ln|sin|cos|tan|cot|lim|[=+−\-*/()|,.:]|[∞π√≤≥≠±×÷∑∫∏∂∇∈∉∅⊂⊆⊃⊇∪∩∀∃∧∨¬→←↔⇒⇔≈≡∝⋅])+$/u;
const MATH_SIGNAL = /[=+−\-*/^]|(?:log|ln|sin|cos|tan|cot|lim)|[∞π√≤≥≠±×÷∑∫∏∂∇∈∉∅⊂⊆⊃⊇∪∩∀∃∧∨¬→←↔⇒⇔≈≡∝⋅]/u;
const MATH_WORDS = new Set(['sin', 'cos', 'tan', 'cot', 'log', 'ln', 'lim']);

const median = (values: number[]): number => {
  const sorted = [...values].sort((first, second) => first - second);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const normalizeSymbols = (text: string): string => Array.from(text, (character) => {
  const latex = SYMBOL_TO_LATEX[character] ?? character;
  return latex !== character && /\\[A-Za-z]+$/u.test(latex) ? `${latex} ` : latex;
}).join('');

const joinTokens = (tokens: FormulaToken[]): string => tokens
  .map((token) => normalizeSymbols(token.text))
  .join('')
  .trim();

const hasNonMathProse = (tokens: FormulaToken[]): boolean => {
  const words: string[] = [];
  let currentWord = '';
  const sorted = [...tokens].sort((first, second) => first.x - second.x);
  sorted.forEach((token, index) => {
    const previous = sorted[index - 1];
    const gap = previous ? token.x - (previous.x + previous.width) : 0;
    if (previous && gap > Math.max(previous.height, token.height) * 0.45) {
      words.push(currentWord);
      currentWord = '';
    }
    currentWord += token.text;
  });
  words.push(currentWord);

  const proseWords = words.flatMap((word) => word.match(/\p{L}{3,}/gu) ?? []);
  return proseWords.some((word) => !MATH_WORDS.has(word.toLocaleLowerCase()));
};

type ScriptRole = 'superscript' | 'subscript' | null;

const scriptRole = (token: FormulaToken, baselineY: number, baselineHeight: number): ScriptRole => {
  if (token.height >= baselineHeight * 0.88) return null;
  const offset = token.y - baselineY;
  if (offset > baselineHeight * 0.22) return 'superscript';
  if (offset < -baselineHeight * 0.22) return 'subscript';
  return null;
};

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
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const role = scriptRole(token, baselineY, baselineHeight);
    const previous = tokens[index - 1];
    const gap = previous ? token.x - (previous.x + previous.width) : 0;

    if (role === null) {
      if (previous && scriptRole(previous, baselineY, baselineHeight) === null && gap > Math.max(previous.height, token.height) * 0.45) output += ' ';
      output += normalizeSymbols(token.text);
      continue;
    }

    const scriptTokens = [token];
    while (index + 1 < tokens.length) {
      const next = tokens[index + 1];
      const nextGap = next.x - (scriptTokens.at(-1)!.x + scriptTokens.at(-1)!.width);
      if (scriptRole(next, baselineY, baselineHeight) !== role || nextGap > Math.max(next.height, scriptTokens.at(-1)!.height) * 0.75) break;
      scriptTokens.push(next);
      index += 1;
    }
    output += `${role === 'superscript' ? '^' : '_'}{${joinTokens(scriptTokens)}}`;
  }

  return output;
};

/**
 * Reconstructs PDF glyph geometry into compact LaTeX while retaining ordinary
 * text exactly as extracted. It deliberately acts only on math-like lines.
 */
export const reconstructFormulaLineWithConfidence = <T extends FormulaToken>(tokens: T[]): FormulaReconstruction | null => {
  if (tokens.length === 0) return null;
  const sorted = [...tokens].sort((first, second) => first.x - second.x);
  const baselineTokens = sorted.filter((token) => token.height >= Math.max(...sorted.map((item) => item.height)) * 0.88);
  const baselineY = median((baselineTokens.length > 0 ? baselineTokens : sorted).map((token) => token.y));
  const baselineHeight = median((baselineTokens.length > 0 ? baselineTokens : sorted).map((token) => token.height));
  const hasScript = sorted.some((token) => scriptRole(token, baselineY, baselineHeight) !== null);
  const hasMathContext = sorted.some((token) => MATH_SIGNAL.test(token.text)) || hasScript;
  if (!hasMathContext || hasNonMathProse(sorted)) return null;
  const hasSymbolNormalization = sorted.some((token) => normalizeSymbols(token.text) !== token.text);
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

  if (fractions.size === 0 && !hasSymbolNormalization && !hasScript) return null;

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
