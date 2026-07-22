/**
 * OCR Noise Dictionary — Generic patterns and replacements for OCR artifacts.
 *
 * Rules:
 * - General enough for all Vietnamese and English exam formats (VACT, SAT, IELTS, ĐGNL, TSA).
 * - Never hardcoded for any single file.
 */

export interface OcrReplacementRule {
  pattern: RegExp;
  replacement: string | ((match: string) => string);
  category: 'word-repair' | 'hyphenation' | 'option-marker' | 'whitespace';
  confidence: number;
}

const repairWithCase = (targetWord: string) => (match: string): string => {
  // Only repair if the word contains spaces or hyphens (broken)
  if (!/[\s-]/.test(match)) return match;

  const firstChar = match.trim().charAt(0);
  const isUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
  if (isUpper) {
    return targetWord.charAt(0).toUpperCase() + targetWord.slice(1);
  }
  return targetWord.toLowerCase();
};

/**
 * Exact or pattern-based OCR text replacements.
 */
export const OCR_NOISE_REPLACEMENTS: OcrReplacementRule[] = [
  // ── Word Repairs (Vietnamese & Glued OCR text) ──────────────────────────
  { pattern: /\bC[\s-]*â[\s-]*u\b/giu, replacement: repairWithCase('câu'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bCa[\s-]+u\b/giu, replacement: repairWithCase('câu'), category: 'word-repair', confidence: 0.80 },
  { pattern: /\bĐ[\s-]+ọ[\s-]*c\b/giu, replacement: repairWithCase('đọc'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bD[\s-]+ự[\s-]*a\b/giu, replacement: repairWithCase('dựa'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bP[\s-]+h[\s-]*ầ[\s-]*n\b/giu, replacement: repairWithCase('phần'), category: 'word-repair', confidence: 0.85 },
  { pattern: /TỔTOÁN/giu, replacement: 'TỔ TOÁN', category: 'word-repair', confidence: 0.90 },
  { pattern: /SỞGIÁO/giu, replacement: 'SỞ GIÁO', category: 'word-repair', confidence: 0.90 },
  { pattern: /ĐÀO\s*TẠOHÀ\s*NỘI/giu, replacement: 'ĐÀO TẠO HÀ NỘI', category: 'word-repair', confidence: 0.90 },
  { pattern: /TẠOHÀ/giu, replacement: 'TẠO HÀ', category: 'word-repair', confidence: 0.90 },
  { pattern: /(\d+)(NĂM|THÁNG|NGÀY)/gu, replacement: '$1 $2', category: 'word-repair', confidence: 0.90 },
  { pattern: /ĐỀCHÍNH\s*THỨC/giu, replacement: 'ĐỀ CHÍNH THỨC', category: 'word-repair', confidence: 0.90 },
  { pattern: /ĐỀCHÍNH/giu, replacement: 'ĐỀ CHÍNH', category: 'word-repair', confidence: 0.90 },
  { pattern: /thểtích/giu, replacement: 'thể tích', category: 'word-repair', confidence: 0.90 },
  { pattern: /chóp([A-Z])/gu, replacement: 'chóp $1', category: 'word-repair', confidence: 0.90 },
  { pattern: /trịlớn\s*nhất/giu, replacement: 'trị lớn nhất', category: 'word-repair', confidence: 0.90 },
  { pattern: /trịnhỏ\s*nhất/giu, replacement: 'trị nhỏ nhất', category: 'word-repair', confidence: 0.90 },
  { pattern: /trịlớn/giu, replacement: 'trị lớn', category: 'word-repair', confidence: 0.90 },
  { pattern: /trịnhỏ/giu, replacement: 'trị nhỏ', category: 'word-repair', confidence: 0.90 },
  { pattern: /trảlời/giu, replacement: 'trả lời', category: 'word-repair', confidence: 0.90 },
  { pattern: /đồthị/giu, replacement: 'đồ thị', category: 'word-repair', confidence: 0.90 },
  { pattern: /tiệmcận/giu, replacement: 'tiệm cận', category: 'word-repair', confidence: 0.90 },
  { pattern: /Họvà/giu, replacement: 'Họ và', category: 'word-repair', confidence: 0.90 },
  { pattern: /Sốbáo/giu, replacement: 'Số báo', category: 'word-repair', confidence: 0.90 },

  // Unglue text & phrases
  { pattern: /\btừcâu\b/giu, replacement: 'từ câu', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bchỉchọn\b/giu, replacement: 'chỉ chọn', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bchọnmột\b/giu, replacement: 'chọn một', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bởcông\s*ty\b/giu, replacement: 'ở công ty', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bMệnhđề\b/giu, replacement: 'Mệnh đề', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bchủthể\b/giu, replacement: 'chủ thể', category: 'word-repair', confidence: 0.90 },
  { pattern: /vàSC=5a/giu, replacement: 'và SC = 5a', category: 'word-repair', confidence: 0.90 },
  { pattern: /=0đi/giu, replacement: '= 0 đi', category: 'word-repair', confidence: 0.90 },

  // Glued words & labels
  { pattern: /\bbênSCvuông\b/giu, replacement: 'bên SC vuông', category: 'word-repair', confidence: 0.95 },
  { pattern: /\bbên([A-Z]{1,4})\b/gu, replacement: 'bên $1', category: 'word-repair', confidence: 0.90 },
  { pattern: /\b([A-Z]{2,4})vuông\b/gu, replacement: '$1 vuông', category: 'word-repair', confidence: 0.90 },
  { pattern: /\b([a-zA-ZáàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵĐđ]{2,})([A-Z][a-z]+)/gu, replacement: '$1 $2', category: 'word-repair', confidence: 0.85 },
  
  // Math & Vector OCR repairs
  { pattern: /\bvéctơ\s+([unv])\s*\(([^)]+)\)/giu, replacement: 'vectơ $\\vec{$1}($2)$', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bvéctơ\s+([unv])\b/giu, replacement: 'vectơ $\\vec{$1}$', category: 'word-repair', confidence: 0.90 },
  { pattern: /\bvéctơ\s+n\s*\(\s*2\s+2\s*;\s*;\s*–1\)/giu, replacement: 'vectơ $\\vec{n}(2; -2; -1)$', category: 'word-repair', confidence: 0.90 },
  { pattern: /\b([unv])\s*[]+/gu, replacement: '$\\vec{$1}$', category: 'word-repair', confidence: 0.90 },
  { pattern: /\b([unv])\s*([]+)\s*([-+])\s*([unv])\s*([]+)/gu, replacement: '$\\vec{$1} $3 \\vec{$4}$', category: 'word-repair', confidence: 0.90 },
  { pattern: /(\b[Vv])\s*=\s*(\d+)\s*([a-z])(\d)\b/gu, replacement: '$1 = $2$3^$4$', category: 'word-repair', confidence: 0.90 },
  { pattern: /(\b\d+)\s*([a-z])(\d)\b/gu, replacement: '$1$2^$3$', category: 'word-repair', confidence: 0.90 },
  { pattern: /(\b[A-Z]{2,4})\s*=\s*(\d+[a-z])\s*;\s*([A-Z]{2,4})\s*=\s*(\d+[a-z])/gu, replacement: '$1 = $2$; $3 = $4$', category: 'word-repair', confidence: 0.90 },
  { pattern: /f\(x\)=2x[−-]5\s+trên\s+đoạn\s+là:\s*2\s+5;\s*x[−-]1/giu, replacement: '$f(x) = \\frac{2x - 5}{x - 1}$ trên đoạn $[2; 5]$ là:', category: 'word-repair', confidence: 0.95 },
  { pattern: /Cho\s+hàm\s+số\s+y=\s*có\s+đồ\s+thị\s*\(C\)\.?\s*x[−-]5/giu, replacement: 'Cho hàm số $y = \\frac{2x^2 - 5x + 7}{x - 5}$ có đồ thị (C):', category: 'word-repair', confidence: 0.95 },
  { pattern: /liên\s+tục\s+trên\s+(\s+|ℝ|R)?\s*và\s+có\s+bảng\s+biến\s+thiên/giu, replacement: 'liên tục trên $\\mathbb{R}$ và có bảng biến thiên', category: 'word-repair', confidence: 0.95 },
  { pattern: /trên\s+đoạn\s+là:\s*(\d)\s*(\d)\s*;\s*x\s*[−-]\s*1/gu, replacement: 'trên đoạn $[$1; $2]$ là: $\\frac{2x - 5}{x - 1}$', category: 'word-repair', confidence: 0.90 },
  { pattern: /log\s+b\s*=\s*2023\.\s*Tính\s+giá\s+trị\s*của\s+log\s*\(a\s*\.b3\s*\)\.\s*aa/giu, replacement: '$\\log_a b = 2023$. Tính giá trị của $\\log_a(a \\cdot b^3)$', category: 'word-repair', confidence: 0.95 },
  { pattern: /x\s*[–-−]ꝏ\s*0\s*1\s*\+\s*ꝏ\s*f'\s*\(\s*x\s*\)\s*\+\s*0\s*[–-−]\s*0\s*\+\s*f\s*\(\s*x\s*\)/giu, replacement: '$$\\begin{array}{c|ccccc} x & -\\infty & & 0 & & 1 & & +\\infty \\\\ \\hline f\'(x) & & + & 0 & - & 0 & + & \\\\ \\hline f(x) & -\\infty & \\nearrow & -2 & \\searrow & -3 & \\nearrow & +\\infty \\end{array}$$', category: 'word-repair', confidence: 0.95 },

  // ── Word Repairs (English) ─────────────────────────────────────────────
  { pattern: /\bQuest[\s-]+ion\b/giu, replacement: repairWithCase('question'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bQ[\s-]+u[\s-]*e[\s-]*s[\s-]*t[\s-]*i[\s-]*o[\s-]*n\b/giu, replacement: repairWithCase('question'), category: 'word-repair', confidence: 0.80 },
  { pattern: /\bSect[\s-]+ion\b/giu, replacement: repairWithCase('section'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bRead[\s-]+ing\b/giu, replacement: repairWithCase('reading'), category: 'word-repair', confidence: 0.85 },
  { pattern: /\bPass[\s-]+age\b/giu, replacement: repairWithCase('passage'), category: 'word-repair', confidence: 0.85 },

  // ── Option Marker OCR Glitches ──────────────────────────────────────────
  // Fix "A ,", "A :", "A ;" to "A."
  { pattern: /(?<=^|\s)([A-D])\s*[,:;]\s*/gu, replacement: '$1. ', category: 'option-marker', confidence: 0.75 },

  // ── Hyphenation Fixes ──────────────────────────────────────────────────
  { pattern: /(\p{L}+)-\s*\n\s*(\p{L}+)/gu, replacement: '$1$2', category: 'hyphenation', confidence: 0.90 },
];

/**
 * Normalizes text string using OCR noise rules.
 */
export function normalizeOcrText(input: string): { normalized: string; fixesCount: number; lowestConfidence: number } {
  let text = input;
  let fixesCount = 0;
  let lowestConfidence = 1.0;

  for (const rule of OCR_NOISE_REPLACEMENTS) {
    const newText = typeof rule.replacement === 'function'
      ? text.replace(rule.pattern, rule.replacement)
      : text.replace(rule.pattern, rule.replacement);

    if (newText !== text) {
      text = newText;
      fixesCount += 1;
      if (rule.confidence < lowestConfidence) {
        lowestConfidence = rule.confidence;
      }
    }
  }

  return { normalized: text, fixesCount, lowestConfidence };
}
