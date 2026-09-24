import assert from 'node:assert/strict';
import test from 'node:test';
import { LayoutQuestionParser } from '../../src/document/parsers/layoutQuestionParser.ts';
import type { DocumentLayout, LayoutNodeType } from '../../src/types/document-layout.ts';
import type { RawDocument } from '../../src/types/raw-document.ts';

const rawDocument: RawDocument = {
  version: '1.0',
  source: { name: 'semantic-parser-fixture.pdf', mimeType: 'application/pdf', kind: 'pdf' },
  nodes: [
    { kind: 'text', text: 'Question 1. Opening passage', confidence: 1, page: 1 },
    { kind: 'text', text: 'The passage continues on a second paragraph.', confidence: 1, page: 1 },
    { kind: 'text', text: 'A. Option A B. Option B', confidence: 1, page: 1 },
    { kind: 'text', text: 'C. Option C', confidence: 1, page: 1 },
    { kind: 'text', text: 'Continuation of option C.', confidence: 1, page: 1 },
    { kind: 'text', text: 'D. Option D', confidence: 1, page: 1 },
    { kind: 'text', text: 'Đọc đoạn văn sau.', confidence: 1, page: 1 },
    { kind: 'text', text: 'Đây là ngữ cảnh dùng chung.', confidence: 1, page: 1 },
    { kind: 'text', text: 'Câu 21. Ý nào đúng?', confidence: 1, page: 1 },
    { kind: 'text', text: 'A. Đúng B. Sai C. Không rõ D. Không có', confidence: 1, page: 1 },
    { kind: 'text', text: 'Câu 22. Ý nào tiếp theo?', confidence: 1, page: 1 },
    { kind: 'text', text: 'A. Một B. Hai C. Ba D. Bốn', confidence: 1, page: 1 },
  ],
  ocrRequirement: 'not-required',
  ocrCandidates: [],
  reviewMarkers: [],
};

const nodeType: LayoutNodeType[] = [
  'question-candidate', 'paragraph', 'option-candidate', 'option-candidate', 'paragraph', 'option-candidate',
  'reading-candidate', 'paragraph', 'question-candidate', 'option-candidate', 'question-candidate', 'option-candidate',
];

const layout: DocumentLayout = {
  version: '1.0',
  sourceKind: 'pdf',
  pages: [],
  ocrPlan: [],
  nodes: rawDocument.nodes.map((node, index) => ({
    id: `layout-${index + 1}`,
    rawNodeIndex: index,
    page: 1,
    boundingBox: { x: 0, y: index, width: 1, height: 1 },
    hasMeasuredGeometry: true,
    readingOrder: index,
    type: nodeType[index],
    text: node.kind === 'text' ? node.text : undefined,
    confidence: 1,
  })),
};

test('semantic parser keeps a multi-paragraph stem and every inline option in one question', () => {
  const document = new LayoutQuestionParser().parse(rawDocument, layout);
  const question = document.content.find((node) => node.kind === 'question');

  assert.ok(question !== undefined);
  assert.equal(question.id, 1);
  assert.match(question.question, /Opening passage/);
  assert.match(question.question, /second paragraph/);
  assert.deepEqual(question.options.map((option) => option.id), ['A', 'B', 'C', 'D']);
  assert.match(question.options[2].content, /Continuation/);
  assert.equal(document.content.some((node) => node.kind === 'question' && (node.id === 'C' || node.id === 'D')), false);
  assert.equal(document.content.some((node) => node.kind === 'text' && /second paragraph/.test(node.text)), false);
});

test('semantic parser emits one question group for a shared reading passage', () => {
  const document = new LayoutQuestionParser().parse(rawDocument, layout);
  const group = document.content.find((node) => node.kind === 'question-group');

  assert.ok(group !== undefined);
  assert.equal(group.questions.length, 2);
  assert.deepEqual(group.questions.map((question) => question.id), [21, 22]);
  assert.equal(group.context.filter((node) => node.kind === 'text').length, 2);
});

test('semantic parser keeps section boundaries, discards page noise, and recovers duplicate question instructions', () => {
  const nodes = [
    { kind: 'text' as const, text: 'PHẦN TIẾNG ANH', confidence: 1, page: 2 },
    { kind: 'text' as const, text: '31-35 Choose the correct answer.', confidence: 1, page: 2 },
    { kind: 'text' as const, text: 'Question 31. Select the correct answer.', confidence: 1, page: 2 },
    { kind: 'text' as const, text: 'A. One B. Two C. Three D. Four', confidence: 1, page: 2 },
    { kind: 'text' as const, text: 'Page 2', confidence: 1, page: 2 },
    { kind: 'text' as const, text: 'Question 31. Repeated instruction.', confidence: 1, page: 2 },
    { kind: 'text' as const, text: 'PHẦN TOÁN', confidence: 1, page: 3 },
    { kind: 'text' as const, text: 'Câu 36. Câu hỏi Toán.', confidence: 1, page: 3 },
    { kind: 'text' as const, text: 'A. Một B. Hai C. Ba D. Bốn', confidence: 1, page: 3 },
  ];
  const types: LayoutNodeType[] = ['heading', 'paragraph', 'question-candidate', 'option-candidate', 'paragraph', 'question-candidate', 'heading', 'question-candidate', 'option-candidate'];
  const document = new LayoutQuestionParser().parse(
    { ...rawDocument, nodes },
    { ...layout, nodes: nodes.map((node, index) => ({ id: `semantic-${index}`, rawNodeIndex: index, page: node.page ?? 1, boundingBox: { x: 0, y: index, width: 1, height: 1 }, hasMeasuredGeometry: true, readingOrder: index, type: types[index], text: node.text, confidence: 1 })) },
  );
  const questions = document.content.filter((node) => node.kind === 'question');

  assert.deepEqual(questions.map((question) => question.id), [31, 36]);
  assert.equal(document.content.some((node) => node.kind === 'text' && /31-35 Choose/.test(node.text)), true);
  assert.equal(document.content.some((node) => node.kind === 'text' && /Page 2/.test(node.text)), false);
  assert.equal(document.content.filter((node) => node.kind === 'heading').length, 2);
});
