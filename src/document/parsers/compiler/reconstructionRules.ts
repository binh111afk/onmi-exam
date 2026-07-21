/**
 * Reconstruction Rules — Pattern matchers & helpers for DocumentReconstructor.
 *
 * RULES:
 * - Pure rule functions. General across all Vietnamese and English exams.
 * - No file-specific hardcoding.
 */

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  'n': 'ⁿ', 'i': 'ⁱ', '+': '⁺', '-': '⁻', '=': '⁼',
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ',
};

// Structural Regex Patterns
const RE_QUESTION_START = /^\s*(?:câu|question|cau|câ\s*u|q)\s*\.?\s*\d{1,3}\s*[:.)-]?\s*/iu;
const RE_QUESTION_BARE = /^\s*\d{1,3}\s*[.)]\s+/u;
const RE_OPTION_START = /^\s*(?:[A-Da-d]\s*[.:),;-]|[①②③④])\s*/u;
const RE_LONE_OPTION_LABEL = /^\s*([A-Da-d]\s*[.:)]|[①②③④])\s*$/u;
const RE_SECTION_HEADING = /^\s*(?:PHẦN|CHƯƠNG|BÀI|SECTION|PART|MODULE)\s+(?:[IVX]+|\d+)\b/iu;
const RE_READING_TRIGGER = /^\s*(?:read\s+the\s+(?:following\s+)?(?:passage|text|extract)|based\s+on\s+the\s+(?:following\s+)?(?:passage|information|text)|đọc\s+(?:đoạn\s+)?(?:văn\s+)?(?:sau|sau\s+đây|dưới\s+đây)|dựa\s+vào\s+(?:(?:các\s+)?thông\s+tin|đoạn\s+văn)|cho\s+(?:đoạn\s+)?(?:văn\s+)?(?:sau|dưới|bảng|hình|biểu\s+đồ))/iu;

const RE_PAGE_NUMBER = /^\s*(?:trang|page)\s*\d{1,4}\s*(?:[/|trên]\s*\d{1,4})?\s*$/iu;
const RE_NOISE = /^\s*(?:compat=|marker\b|generated\s+by\b|https?:\/\/|www\.|mã\s+đề|code:|đề\s+số\b)/iu;

/**
 * 1. Whitespace Recovery: Merges split single-character letters.
 * Example: "T Ổ TOÁN" -> "TỔ TOÁN", "S Ở GIÁO D Ụ C" -> "SỞ GIÁO DỤC", "G I Á O" -> "GIÁO"
 */
export function recoverWhitespace(text: string): { text: string; mergedCount: number } {
  let result = text;
  let mergedCount = 0;

  // Single-character letter sequence merging: finds sequences of single letters separated by space
  // Guard: Lookahead requires a space or end of string so we don't merge option labels like "A B."
  const regex = /(?<=^|[\s"'(])(\p{L}(?:\s+\p{L})+)(?=[\s"']|$)/gu;

  result = result.replace(regex, (match) => {
    const tokens = match.split(/\s+/);
    if (tokens.every((tok) => tok.length === 1)) {
      mergedCount += tokens.length - 1;
      return tokens.join('');
    }
    return match;
  });

  return { text: result, mergedCount };
}

/**
 * 2. Boundary Checks
 */
export function isQuestionStart(text: string): boolean {
  return RE_QUESTION_START.test(text) || RE_QUESTION_BARE.test(text);
}

export function isOptionStart(text: string): boolean {
  return RE_OPTION_START.test(text);
}

export function isLoneOptionLabel(text: string): boolean {
  return RE_LONE_OPTION_LABEL.test(text.trim());
}

export function isSectionHeading(text: string): boolean {
  return RE_SECTION_HEADING.test(text);
}

export function isReadingTrigger(text: string): boolean {
  return RE_READING_TRIGGER.test(text);
}

export function isNoise(text: string): boolean {
  return RE_PAGE_NUMBER.test(text) || RE_NOISE.test(text);
}

/**
 * 3. Superscript & Subscript Recovery
 * Reconstructs:
 *   "a" + "3" -> "a³"
 *   "x" + "2" -> "x²"
 *   "sin" + "2" + "x" -> "sin²x"
 *   "log" + "2" -> "log₂"
 */
export function tryRecoverSuperscriptOrSubscript(
  baseText: string,
  exponentText: string,
): { mergedText: string; type: 'superscript' | 'subscript' | 'fraction' } | null {
  const base = baseText.trim();
  const exp = exponentText.trim();

  // Subscript: "log" + "2" -> "log₂" or "và log" + "2" -> "và log₂"
  if (/log$/iu.test(base) || /lim$/iu.test(base)) {
    if (/^[0-9a-x]{1,3}$/u.test(exp)) {
      const converted = exp.split('').map((char) => SUBSCRIPT_MAP[char] ?? char).join('');
      return { mergedText: `${base}${converted}`, type: 'subscript' };
    }
  }

  // Superscript: base ends with a variable/math term, exp is a small integer or variable (1-3 chars)
  if (
    /^(?:[a-zA-Zxyz\p{L}]|sin|cos|tan|cot|ln|\)|\])$/u.test(base) ||
    /[a-zA-Z\p{L}]\d*$/u.test(base)
  ) {
    if (/^[0-9+n-]{1,3}$/u.test(exp)) {
      const converted = exp.split('').map((char) => SUPERSCRIPT_MAP[char] ?? char).join('');
      return { mergedText: `${base}${converted}`, type: 'superscript' };
    }
  }

  // Vertical Fraction: "x" / "4" / "4" -> "x^4/4" or "1" / "2" -> "1/2"
  if (/^[0-9a-zA-Z\p{L}^+*-]+$/u.test(base) && /^[0-9a-zA-Z\p{L}]+$/u.test(exp)) {
    if (base.length <= 4 && exp.length <= 4 && !/[=.,]/.test(base) && !/[=.,]/.test(exp)) {
      return { mergedText: `${base}/${exp}`, type: 'fraction' };
    }
  }

  return null;
}

/**
 * 4. Math Inline Merge
 * Cleans space around operators: "x + 1 = 0" -> "x+1=0"
 */
export function recoverInlineMath(text: string): { text: string; inlineMathMergedCount: number } {
  let count = 0;
  let result = text;
  let prev = '';

  while (prev !== result) {
    prev = result;
    result = result.replace(
      /([a-zA-Z0-9\p{L}\)])(?:\s+([-+×÷=≤≥≠±])\s*|\s*([-+×÷=≤≥≠±])\s+)([a-zA-Z0-9\p{L}\(])/gu,
      (_match, p1, o1, o2, p2) => {
        count += 1;
        return `${p1}${o1 || o2}${p2}`;
      },
    );
  }

  return { text: result, inlineMathMergedCount: result !== text ? count : 0 };
}
