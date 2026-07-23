export interface LatexCandidateValidation {
  valid: boolean;
  latex?: string;
  reason?: string;
}

const UNSUPPORTED_LAYOUT_COMMAND = /\\(?:begin|end|array|matrix|cases|displaystyle|textstyle|scriptstyle|scriptscriptstyle)\b/u;

const isEscaped = (value: string, index: number): boolean => {
  let backslashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor -= 1) backslashCount += 1;
  return backslashCount % 2 === 1;
};

const hasBalancedDelimiters = (latex: string): boolean => {
  const pairs: Record<string, string> = { '}': '{', ']': '[', ')': '(' };
  const opening = new Set(Object.values(pairs));
  const stack: string[] = [];

  for (let index = 0; index < latex.length; index += 1) {
    const character = latex[index];
    if (isEscaped(latex, index)) continue;
    if (opening.has(character)) stack.push(character);
    if (character in pairs && stack.pop() !== pairs[character]) return false;
  }

  return stack.length === 0;
};

/**
 * Rejects OCR output that cannot safely replace a PDF formula without manual review.
 * Visual render comparison is deliberately kept outside this browser-only pipeline.
 */
export const validateLatexOcrCandidate = (candidate: string): LatexCandidateValidation => {
  const latex = candidate.trim().replace(/\s+/gu, ' ');
  if (!latex) return { valid: false, reason: 'empty OCR result' };
  if (latex.length > 1000) return { valid: false, reason: 'OCR result exceeds formula length limit' };
  if (/[\u0000-\u001F\u007F]/u.test(latex)) return { valid: false, reason: 'OCR result contains control characters' };
  if (/\$|\\\\/u.test(latex)) return { valid: false, reason: 'OCR result contains unsupported display delimiters' };
  if (UNSUPPORTED_LAYOUT_COMMAND.test(latex)) return { valid: false, reason: 'OCR result contains unsupported layout commands' };
  if (!hasBalancedDelimiters(latex)) return { valid: false, reason: 'OCR result has unbalanced delimiters' };
  return { valid: true, latex };
};
