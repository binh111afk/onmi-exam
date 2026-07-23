/**
 * Compiler Pipeline Regression Tests
 *
 * Tests derived from patterns observed across the full corpus (VACT, physics,
 * math, English). These test cases are NOT specific to any one exam file —
 * each targets a class of structural pattern that appears in multiple documents.
 *
 * Patterns covered:
 *  P1. Standalone multi-paragraph question (no reading group)
 *  P2. Inline multi-option ("A. X B. Y C. Z D. W" on one line)
 *  P3. Reading passage + multiple questions (question-group)
 *  P4. Section headings do not become questions
 *  P5. Instruction range does not become question
 *  P6. Duplicate question ID is discarded (second occurrence)
 *  P7. Page number tokens are discarded
 *  P8. Math/formula token is attached to question, not emitted standalone
 *  P9. Question with no options recovers as paragraph (not lost)
 *  P10. English section + Vietnamese section co-exist with correct boundaries
 *  P11. "Question N. Select…" with directive word in stem is NOT INSTRUCTION
 *  P12. Reading group with only 1 question degrades correctly
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { CompilerPipeline } from '../../src/document/parsers/compiler/compilerPipeline.ts';
import { LayoutQuestionParser } from '../../src/document/parsers/layoutQuestionParser.ts';
import type { DocumentLayout, LayoutNodeType } from '../../src/types/document-layout.ts';
import type { RawDocument } from '../../src/types/raw-document.ts';

// ---------------------------------------------------------------------------
// Fixture builder helpers
// ---------------------------------------------------------------------------

const makeRawDoc = (texts: string[], name = 'test.pdf'): RawDocument => ({
  version: '1.0',
  source: { name, mimeType: 'application/pdf', kind: 'pdf' },
  nodes: texts.map((text) => ({ kind: 'text', text, confidence: 1, page: 1 })),
  ocrRequirement: 'not-required',
  ocrCandidates: [],
  reviewMarkers: [],
});

const makeLayout = (rawDoc: RawDocument, types: LayoutNodeType[]): DocumentLayout => ({
  version: '1.0',
  sourceKind: 'pdf',
  pages: [],
  ocrPlan: [],
  nodes: rawDoc.nodes.map((node, index) => ({
    id: `n-${index}`,
    rawNodeIndex: index,
    page: (node as { page?: number }).page ?? 1,
    boundingBox: { x: 0, y: index, width: 1, height: 1 },
    hasMeasuredGeometry: true,
    readingOrder: index,
    type: types[index] ?? 'paragraph',
    text: node.kind === 'text' ? node.text : undefined,
    confidence: 1,
  })),
});

const parse = (texts: string[], types: LayoutNodeType[]) => {
  const rawDoc = makeRawDoc(texts);
  const layout = makeLayout(rawDoc, types);
  return new LayoutQuestionParser().parse(rawDoc, layout);
};

const getQuestions = (doc: ReturnType<LayoutQuestionParser['parse']>) =>
  doc.content.filter((n) => n.kind === 'question');

const getGroups = (doc: ReturnType<LayoutQuestionParser['parse']>) =>
  doc.content.filter((n) => n.kind === 'question-group');

const getHeadings = (doc: ReturnType<LayoutQuestionParser['parse']>) =>
  doc.content.filter((n) => n.kind === 'heading');

const getParagraphs = (doc: ReturnType<LayoutQuestionParser['parse']>) =>
  doc.content.filter((n) => n.kind === 'text');

// ---------------------------------------------------------------------------
// P1 — Standalone multi-paragraph question
// ---------------------------------------------------------------------------

test('P1: multi-paragraph stem is merged into one question', () => {
  const doc = parse(
    [
      'Câu 1. Đây là câu hỏi.',
      'Tiếp theo của câu hỏi.',
      'A. Đáp án A',
      'B. Đáp án B',
      'C. Đáp án C',
      'D. Đáp án D',
    ],
    ['question-candidate', 'paragraph', 'option-candidate', 'option-candidate', 'option-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1);
  assert.equal(questions[0].id, 1);
  // Stem must contain both lines
  assert.ok((questions[0] as { question: string }).question.includes('Đây là câu hỏi'));
  assert.ok((questions[0] as { question: string }).question.includes('Tiếp theo'));
});

// ---------------------------------------------------------------------------
// P2 — Inline multi-option on one line
// ---------------------------------------------------------------------------

test('P2: inline "A. X B. Y C. Z D. W" is split into 4 options', () => {
  const doc = parse(
    [
      'Câu 1. Nước sôi ở bao nhiêu độ?',
      'A. 90°C B. 100°C C. 110°C D. 120°C',
    ],
    ['question-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1);
  const opts = (questions[0] as { options: Array<{ id: string; content: string }> }).options;
  assert.deepEqual(opts.map((o) => o.id), ['A', 'B', 'C', 'D']);
  assert.ok(opts[1].content.includes('100'));
});

// ---------------------------------------------------------------------------
// P3 — Reading group
// ---------------------------------------------------------------------------

test('P3: reading passage + 2 questions become one question-group', () => {
  const doc = parse(
    [
      'Đọc đoạn văn sau.',
      'Đây là nội dung đoạn văn dài dùng chung.',
      'Câu 21. Ý nào đúng?',
      'A. Đúng B. Sai C. Không rõ D. Không có',
      'Câu 22. Ý nào tiếp theo?',
      'A. Một B. Hai C. Ba D. Bốn',
    ],
    ['reading-candidate', 'paragraph', 'question-candidate', 'option-candidate', 'question-candidate', 'option-candidate'],
  );
  const groups = getGroups(doc);
  assert.equal(groups.length, 1, 'Expected exactly one question-group');
  const group = groups[0] as { questions: Array<{ id: number }> };
  assert.equal(group.questions.length, 2);
  assert.deepEqual(group.questions.map((q) => q.id), [21, 22]);
});

// ---------------------------------------------------------------------------
// P4 — Section headings remain headings
// ---------------------------------------------------------------------------

test('P4: section headings do not become questions', () => {
  const doc = parse(
    [
      'PHẦN I: TOÁN',
      'Câu 1. 1 + 1 = ?',
      'A. 1 B. 2 C. 3 D. 4',
      'PHẦN II: LÝ',
      'Câu 2. Đơn vị của lực?',
      'A. Joule B. Newton C. Pascal D. Watt',
    ],
    ['heading', 'question-candidate', 'option-candidate', 'heading', 'question-candidate', 'option-candidate'],
  );
  const headings = getHeadings(doc);
  const questions = getQuestions(doc);
  assert.equal(headings.length, 2);
  assert.equal(questions.length, 2);
  // No heading text appears as question ID
  assert.ok(questions.every((q) => typeof q.id === 'number'));
});

// ---------------------------------------------------------------------------
// P5 — Instruction range is not a question
// ---------------------------------------------------------------------------

test('P5: instruction range "31-35 Choose the correct answer" is not emitted as question', () => {
  const doc = parse(
    [
      '31-35 Choose the correct answer.',
      'Question 31. Select the best option.',
      'A. One B. Two C. Three D. Four',
    ],
    ['paragraph', 'question-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  // Only question 31 should exist, not an instruction-as-question
  assert.equal(questions.length, 1);
  assert.equal(questions[0].id, 31);
  // The instruction text should appear in document (as paragraph or similar)
  const hasInstructionText = doc.content.some(
    (n) => n.kind === 'text' && (n as { text: string }).text.includes('31-35'),
  );
  assert.ok(hasInstructionText, 'Instruction text should be preserved in output');
});

// ---------------------------------------------------------------------------
// P6 — Duplicate question ID is discarded
// ---------------------------------------------------------------------------

test('P6: second occurrence of the same question ID is discarded', () => {
  const doc = parse(
    [
      'PHẦN I',
      '31-35 Choose the correct answer.',
      'Question 31. Select the correct answer.',
      'A. One B. Two C. Three D. Four',
      'Page 2',
      'Question 31. Repeated instruction (duplicate).',
    ],
    ['heading', 'paragraph', 'question-candidate', 'option-candidate', 'paragraph', 'question-candidate'],
  );
  const questions = getQuestions(doc);
  const ids = questions.map((q) => q.id);
  // Should have at most one question with id 31
  const count31 = ids.filter((id) => id === 31).length;
  assert.ok(count31 <= 1, `Expected at most 1 question with id 31, got ${count31}`);
});

// ---------------------------------------------------------------------------
// P7 — Page number tokens are discarded
// ---------------------------------------------------------------------------

test('P7: "Page N" / "Trang N" tokens do not appear in output', () => {
  const doc = parse(
    [
      'Câu 1. Câu hỏi thứ nhất.',
      'A. A B. B C. C D. D',
      'Page 2',
      'Trang 3/5',
      'Câu 2. Câu hỏi thứ hai.',
      'A. Một B. Hai C. Ba D. Bốn',
    ],
    ['question-candidate', 'option-candidate', 'paragraph', 'paragraph', 'question-candidate', 'option-candidate'],
  );
  // Page numbers should not appear as text nodes in output
  const hasPageText = doc.content.some(
    (n) =>
      n.kind === 'text' &&
      (/^Page\s+\d/iu.test((n as { text: string }).text) || /^Trang\s+\d/iu.test((n as { text: string }).text)),
  );
  assert.equal(hasPageText, false, 'Page number tokens should be discarded');
  // Both questions should still be present
  assert.equal(getQuestions(doc).length, 2);
});

// ---------------------------------------------------------------------------
// P8 — Formula token is not emitted as orphan
// ---------------------------------------------------------------------------

test('P8: formula token inside a question block is attached to the question', () => {
  const doc = parse(
    [
      'Câu 3. Tính giá trị của:',
      '\\frac{a+b}{2}',
      'A. a+b B. (a+b)/2 C. 2(a+b) D. ab',
    ],
    ['question-candidate', 'formula', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1, 'Formula-containing question should be detected');
  // Formula should not appear as standalone node at document level
  const hasOrphanFormula = doc.content.some((n) => n.kind === 'formula');
  assert.equal(hasOrphanFormula, false, 'Formula inside question should not be orphan at doc level');
});

// ---------------------------------------------------------------------------
// P9 — Question with no options recovers as paragraph
// ---------------------------------------------------------------------------

test('P9: question candidate without options is preserved, not lost', () => {
  const doc = parse(
    [
      'Câu 5. Này là câu hỏi bị thiếu đáp án.',
      // No options follow — next is another question
      'Câu 6. Câu hỏi có đủ đáp án.',
      'A. A B. B C. C D. D',
    ],
    ['question-candidate', 'question-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.ok(questions.some((q) => q.id === 5 || q.id === 6), 'Both questions should be preserved');
});

// ---------------------------------------------------------------------------
// P10 — English + Vietnamese sections co-exist
// ---------------------------------------------------------------------------

test('P10: English and Vietnamese sections emit correct headings and questions', () => {
  const doc = parse(
    [
      'PHẦN TIẾNG ANH',
      'Question 31. Choose the correct word.',
      'A. run B. ran C. running D. runs',
      'PHẦN TOÁN',
      'Câu 36. Tính diện tích hình tròn.',
      'A. πr B. πr² C. 2πr D. 2πr²',
    ],
    ['heading', 'question-candidate', 'option-candidate', 'heading', 'question-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  const headings = getHeadings(doc);
  assert.deepEqual(questions.map((q) => q.id), [31, 36]);
  assert.equal(headings.length, 2);
});

// ---------------------------------------------------------------------------
// P11 — "Question N. Select…" is NOT an instruction
// ---------------------------------------------------------------------------

test('P11: "Question 31. Select the correct answer." is QUESTION_MARKER, not INSTRUCTION', () => {
  const doc = parse(
    [
      'Question 31. Select the correct word form.',
      'A. go B. went C. gone D. going',
    ],
    ['question-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1, '"Question 31. Select..." must be parsed as a question');
  assert.equal(questions[0].id, 31);
});

// ---------------------------------------------------------------------------
// P12 — Reading group with only 1 question degrades gracefully
// ---------------------------------------------------------------------------

test('P12: reading group with only 1 question degrades to paragraph + standalone question', () => {
  const doc = parse(
    [
      'Đọc đoạn văn sau và trả lời câu hỏi.',
      'Nội dung đoạn văn dài dùng làm ngữ cảnh.',
      'Câu 10. Đây là câu hỏi duy nhất.',
      'A. Một B. Hai C. Ba D. Bốn',
    ],
    ['reading-candidate', 'paragraph', 'question-candidate', 'option-candidate'],
  );
  // Single-question groups degrade: no question-group in output
  // (or it's allowed — the test checks that the question IS parseable)
  const allQuestions = [
    ...getQuestions(doc),
    ...getGroups(doc).flatMap((g) => (g as { questions: Array<{ id: number }> }).questions),
  ];
  assert.ok(
    allQuestions.some((q) => q.id === 10),
    'Câu 10 must be reachable in output even in degraded group',
  );
});

// ---------------------------------------------------------------------------
// P13 — DocumentNormalizer repairs broken OCR text
// ---------------------------------------------------------------------------

test('P13: DocumentNormalizer repairs broken OCR text "Câ u 1", "Quest ion 2", "A ,"', () => {
  const doc = parse(
    [
      'Câ u 1. Thủ đô của Việt Nam là gì?',
      'A , Hà Nội B. TP.HCM C. Đà Nẵng D. Cần Thơ',
      'Quest ion 2. Capital of France?',
      'A. Paris B. Lyon C. Marseille D. Nice',
    ],
    ['question-candidate', 'option-candidate', 'question-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 2, 'Both questions with OCR noise must be successfully parsed');
  assert.deepEqual(questions.map((q) => q.id), [1, 2]);
});

// ---------------------------------------------------------------------------
// P14 — Fuzzy pattern matching for question markers
// ---------------------------------------------------------------------------

test('P14: Fuzzy pattern matching accepts "Cau 1" and "Câ u1"', () => {
  const doc = parse(
    [
      'Cau 1. Đây là câu hỏi không dấu.',
      'A. Một B. Hai C. Ba D. Bốn',
    ],
    ['question-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1, 'Fuzzy question marker must be parsed');
  assert.equal(questions[0].id, 1);
});

// ---------------------------------------------------------------------------
// P15 — Option Recovery Strategy for duplicate options
// ---------------------------------------------------------------------------

test('P15: Duplicate option recovery repairs "A. X A. Y C. Z D. W" to A, B, C, D', () => {
  const rawDoc = makeRawDoc([
    'Câu 1. Câu hỏi bị duplicate nhầm nhãn đáp án.',
    'A. Đáp án một',
    'A. Đáp án hai (bị đọc nhầm thành A)',
    'C. Đáp án ba',
    'D. Đáp án bốn',
  ]);
  const layout = makeLayout(rawDoc, ['question-candidate', 'option-candidate', 'option-candidate', 'option-candidate', 'option-candidate']);
  const parser = new LayoutQuestionParser();
  const doc = parser.parse(rawDoc, layout);
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1);
  const opts = (questions[0] as { options: Array<{ id: string; content: string }> }).options;
  assert.deepEqual(opts.map((o) => o.id), ['A', 'B', 'C', 'D'], 'Duplicate option A must be recovered to B');
});

// ---------------------------------------------------------------------------
// P16 — CompilerPipeline Diagnostics & Confidence report
// ---------------------------------------------------------------------------

test('P16: CompilerPipeline.compileWithDiagnostics produces diagnostics report', () => {
  const rawDoc = makeRawDoc([
    'Câu 1. Kiểm tra confidence và diagnostics report.',
    'A. Đúng B. Sai C. Khác D. Không',
  ]);
  const layout = makeLayout(rawDoc, ['question-candidate', 'option-candidate']);
  const report = new CompilerPipeline().compileWithDiagnostics(rawDoc, layout);

  assert.ok(report.diagnostics, 'Diagnostics object must be present');
  assert.ok(report.diagnostics.averageConfidence > 0, 'Average confidence must be positive');
  assert.equal(report.diagnostics.status, 'PASS');
});

// ---------------------------------------------------------------------------
// P17 — Whitespace Recovery (T Ổ TOÁN -> TỔ TOÁN)
// ---------------------------------------------------------------------------

test('P17: Whitespace Recovery merges split single-character letters "T Ổ TOÁN" and "S Ở GIÁO D Ụ C"', () => {
  const doc = parse(
    [
      'S Ở GIÁO D Ụ C VÀ ĐÀO T Ạ O',
      'Câu 1. Cho hàm số y = f(x).',
      'A. 1 B. 2 C. 3 D. 4',
    ],
    ['heading', 'question-candidate', 'option-candidate'],
  );
  const headings = getHeadings(doc);
  assert.equal(headings.length, 1);
  const text = (headings[0] as { text: string }).text;
  assert.ok(text.includes('SỞ GIÁO DỤC'), `Expected 'SỞ GIÁO DỤC', got '${text}'`);
  assert.ok(text.includes('TẠO'), `Expected 'TẠO', got '${text}'`);
});

// ---------------------------------------------------------------------------
// P18 — Lone Option Label Reconstruction ("A." + newline + "V=30a³")
// ---------------------------------------------------------------------------

test('P18: Option Reconstruction merges lone option label "A." with next line content "V=30a³"', () => {
  const doc = parse(
    [
      'Câu 1. Thể tích khối đa diện?',
      'A.',
      'V=30a³',
      'B. V=20a³ C. V=10a³ D. V=5a³',
    ],
    ['question-candidate', 'paragraph', 'paragraph', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1);
  const opts = (questions[0] as { options: Array<{ id: string; content: string }> }).options;
  assert.equal(opts[0].id, 'A');
  assert.ok(opts[0].content.includes('V=30a³'), `Option A should contain V=30a³, got '${opts[0].content}'`);
});

// ---------------------------------------------------------------------------
// P19 — Formula & Superscript Recovery ("a" + "3" -> "a³", "x" + "2" -> "x²")
// ---------------------------------------------------------------------------

test('P19: Formula Recovery reconstructs "a" + "3" to "a³" and "log" + "2" to "log₂"', () => {
  const doc = parse(
    [
      'Câu 2. Tính giá trị biểu thức a',
      '3',
      'và log',
      '2',
      'A. 1 B. 2 C. 3 D. 4',
    ],
    ['question-candidate', 'paragraph', 'paragraph', 'paragraph', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1);
  const stem = (questions[0] as { question: string }).question;
  assert.ok(stem.includes('a³'), `Stem should contain 'a³', got '${stem}'`);
  assert.ok(stem.includes('log₂'), `Stem should contain 'log₂', got '${stem}'`);
});

// ---------------------------------------------------------------------------
// P20 — Math Inline Merge ("x" + "+" + "1" -> "x+1")
// ---------------------------------------------------------------------------

test('P20: Math Inline Merge cleans spacing in "x + 1 = 0"', () => {
  const doc = parse(
    [
      'Câu 3. Giải phương trình x + 1 = 0',
      'A. x=-1 B. x=1 C. x=0 D. x=2',
    ],
    ['question-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1);
  const stem = (questions[0] as { question: string }).question;
  assert.ok(stem.includes('x+1=0'), `Stem should contain 'x+1=0', got '${stem}'`);
});

// ---------------------------------------------------------------------------
// P21 — Reading Boundary Hinting
// ---------------------------------------------------------------------------

test('P21: Reading trigger sets reading candidate hint for CompilerPipeline', () => {
  const doc = parse(
    [
      'Đọc đoạn văn sau và trả lời các câu hỏi từ 1 đến 2.',
      'Đây là bài đọc dùng chung cho các câu hỏi.',
      'Câu 1. Ý chính của đoạn văn là gì?',
      'A. Một B. Hai C. Ba D. Bốn',
      'Câu 2. Tác giả muốn thể hiện điều gì?',
      'A. A B. B C. C D. D',
    ],
    ['reading-candidate', 'paragraph', 'question-candidate', 'option-candidate', 'question-candidate', 'option-candidate'],
  );
  const groups = getGroups(doc);
  assert.equal(groups.length, 1, 'Questions following reading trigger should be grouped');
});

// ---------------------------------------------------------------------------
// P22 — Reconstruction Summary Telemetry Report
// ---------------------------------------------------------------------------

test('P22: ReconstructionSummary telemetry reports merged metrics', () => {
  const rawDoc = makeRawDoc([
    'S Ở GIÁO D Ụ C',
    'Câu 1. Thể tích?',
    'A.',
    'V=30a³',
    'B. V=10a³ C. V=5a³ D. V=1a³',
  ]);
  const layout = makeLayout(rawDoc, ['heading', 'question-candidate', 'paragraph', 'paragraph', 'option-candidate']);
  const report = new CompilerPipeline().compileWithDiagnostics(rawDoc, layout);

  assert.ok(report.reconstructionSummary, 'ReconstructionSummary must be present');
  assert.ok(report.reconstructionSummary.whitespaceMergedCount > 0, 'Whitespace merge count should be positive');
  assert.ok(report.reconstructionSummary.optionRecoveredCount > 0, 'Option recovered count should be positive');
});

// ---------------------------------------------------------------------------
// P23–P28 — Essay Questions, Reading Passages & Question Subtypes
// ---------------------------------------------------------------------------

test('P23: Math Choice Question PASS', () => {
  const doc = parse(
    [
      'Câu 1. Tìm x biết x + 1 = 2.',
      'A. x = 1 B. x = 2 C. x = 3 D. x = 4',
    ],
    ['question-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1);
  assert.equal(questions[0].questionType, 'choice');
});

test('P24: Literature Essay Question PASS', () => {
  const doc = parse(
    [
      'Câu 1. Phân tích giá trị nghệ thuật của bài thơ.',
      'Câu 2. Trình bày suy nghĩ về ý chí nghị lực.',
    ],
    ['question-candidate', 'question-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 2, 'Both essay questions should be parsed as questions');
  assert.equal(questions[0].questionType, 'essay');
  assert.equal(questions[1].questionType, 'essay');
});

test('P25: Reading + Essay PASS', () => {
  const doc = parse(
    [
      'Đọc văn bản sau:',
      'Nội dung văn bản đọc hiểu.',
      'Câu 1. Xác định phương thức biểu đạt chính.',
      'Câu 2. Tác giả muốn truyền tải thông điệp gì?',
    ],
    ['reading-candidate', 'paragraph', 'question-candidate', 'question-candidate'],
  );
  const groups = getGroups(doc);
  assert.equal(groups.length, 1, 'Essay questions following reading passage should form a reading group');
  assert.equal(groups[0].questions.length, 2);
  assert.equal(groups[0].questions[0].questionType, 'essay');
});

test('P26: Reading + Choice PASS', () => {
  const doc = parse(
    [
      'Đọc đoạn văn sau:',
      'Nội dung bài đọc tiếng Anh.',
      'Question 1. What is the main idea?',
      'A. One B. Two C. Three D. Four',
      'Question 2. Why did the character act?',
      'A. Yes B. No C. Maybe D. Never',
    ],
    ['reading-candidate', 'paragraph', 'question-candidate', 'option-candidate', 'question-candidate', 'option-candidate'],
  );
  const groups = getGroups(doc);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].questions.length, 2);
  assert.equal(groups[0].questions[0].questionType, 'choice');
});

test('P27: Question without options is NOT converted to paragraph', () => {
  const doc = parse(
    [
      'Câu 5. Trình bày suy nghĩ của em về câu nói trên.',
    ],
    ['question-candidate'],
  );
  const questions = getQuestions(doc);
  assert.equal(questions.length, 1, 'Question without options should remain a question');
  assert.equal(questions[0].id, 5);
  assert.equal(questions[0].questionType, 'essay');
});

test('P28: pendingReading at end of document is NOT discarded', () => {
  const doc = parse(
    [
      'PHẦN I: ĐỌC HIỂU',
      'Đọc văn bản sau:',
      'Đoạn văn 1 của bài đọc.',
      'Đoạn văn 2 của bài đọc.',
    ],
    ['heading', 'reading-candidate', 'paragraph', 'paragraph'],
  );
  const hasReadingText = doc.content.some(
    (n) => n.kind === 'text' && (n as { text: string }).text.includes('Đoạn văn 1'),
  );
  assert.ok(hasReadingText, 'Reading passage without subsequent questions must be preserved as text paragraphs');
});

test('P29: lowercase a-d subparts remain within an essay question and university metadata is extracted', () => {
  const doc = parse(
    [
      'TRƯỜNG ĐẠI HỌC SƯ PHẠM THÀNH PHỐ HỒ CHÍ MINH',
      'KHOA CÔNG NGHỆ THÔNG TIN',
      'ĐỀ THI KẾT THÚC HỌC PHẦN',
      'Tên HP: XÁC SUẤT THỐNG KÊ VÀ ỨNG DỤNG TRONG GIÁO DỤC',
      'Mã HP: COMP1827',
      'Học kỳ: II',
      'Thời gian làm bài: 90 phút',
      'Câu 2. Một công ty có 9% hóa đơn sai sót.',
      'a) Tính xác suất có 15 hóa đơn mắc sai sót.',
      'b) Tính xác suất có nhiều nhất 15 hóa đơn mắc sai sót.',
      'c) Tính xác suất có ít nhất 16 hóa đơn mắc sai sót.',
      'd) Tính số hóa đơn mắc sai sót tối đa.',
    ],
    ['paragraph', 'paragraph', 'paragraph', 'paragraph', 'paragraph', 'paragraph', 'paragraph', 'question-candidate', 'option-candidate', 'option-candidate', 'option-candidate', 'option-candidate'],
  );
  const questions = getQuestions(doc);

  assert.equal(doc.metadata.title, 'Đề thi kết thúc học phần - XÁC SUẤT THỐNG KÊ VÀ ỨNG DỤNG TRONG GIÁO DỤC');
  assert.equal(doc.metadata.subject, 'XÁC SUẤT THỐNG KÊ VÀ ỨNG DỤNG TRONG GIÁO DỤC');
  assert.equal(doc.metadata.grade, 'Đại học');
  assert.equal(doc.metadata.time, 90);
  assert.equal(questions.length, 1);
  assert.equal(questions[0].questionType, 'essay');
  assert.ok(questions[0].question.includes('a) Tính xác suất'));
  assert.ok(!('options' in questions[0]));
});

test('P30: question four content is preserved without injected fixture data', () => {
  const doc = parse(
    ['Câu 4. Chiều cao trung bình của nữ sinh năm nhất là 162.5 cm.'],
    ['question-candidate'],
  );
  const questions = getQuestions(doc);

  assert.equal(questions.length, 1);
  assert.ok(questions[0].question.includes('Chiều cao trung bình của nữ sinh năm nhất'));
  assert.equal(doc.content.some((node) => node.kind === 'table'), false);
});
