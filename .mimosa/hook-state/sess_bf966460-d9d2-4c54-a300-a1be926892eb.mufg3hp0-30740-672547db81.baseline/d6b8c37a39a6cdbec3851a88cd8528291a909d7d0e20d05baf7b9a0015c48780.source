import type { DocumentRule } from './documentRuleEngine';

export const vietnameseExamRules: DocumentRule[] = [
  { id: 'question-number', kind: 'question', pattern: /^\s*Câu\s+(\d+)\s*[.:)]\s*/i, confidence: 0.98 },
  { id: 'question-english', kind: 'question', pattern: /^\s*Question\s+(\d+)\s*[.:)]\s*/i, confidence: 0.96 },
  { id: 'question-decimal', kind: 'question', pattern: /^\s*(\d+)\s*[.)]\s+(?=\S)/u, confidence: 0.78 },
  { id: 'question-roman', kind: 'question', pattern: /^\s*([IVXLCDM]+)\s*[.)]\s+(?=\S)/iu, confidence: 0.7 },
  { id: 'option-latin', kind: 'option', pattern: /^\s*([A-Da-d])\s*[.)]\s*/u, confidence: 0.97 },
  { id: 'option-circled', kind: 'option', pattern: /^\s*([①②③④])\s*/u, confidence: 0.93 },
  { id: 'option-boolean', kind: 'option', pattern: /^\s*(True|False|Đúng|Sai)\b\s*[:.)-]?/iu, confidence: 0.88 },
  { id: 'answer-heading', kind: 'answer', pattern: /^\s*(?:Đáp án|Lời giải)\b/i, confidence: 0.95 },
  { id: 'reading-passage', kind: 'reading-passage', pattern: /^\s*(?:Đọc(?:\s+đoạn)?|Dựa vào(?:\s+đoạn|thông tin)|Cho đoạn văn)\b/i, confidence: 0.86 },
  { id: 'section-heading', kind: 'heading', pattern: /^\s*(?:PHẦN|CHƯƠNG|BÀI)\s+[IVX\d]+\b/i, confidence: 0.9 },
  { id: 'caption', kind: 'caption', pattern: /^\s*(?:Hình|Bảng|Biểu đồ|Sơ đồ)\s*\d*\s*[:.]?/iu, confidence: 0.87 },
  { id: 'list-marker', kind: 'list', pattern: /^\s*(?:[-•–]|\d+[.)])\s+/u, confidence: 0.91 },
  { id: 'formula-token', kind: 'formula', pattern: /(?:\\[a-zA-Z]+|[=±√∑∫∫∂])/u, confidence: 0.72 },
];
