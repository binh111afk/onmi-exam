import assert from 'node:assert/strict';
import test from 'node:test';
import { validateLatexOcrCandidate } from '../../src/document/ocr/latexCandidateValidator.ts';

test('accepts a balanced single-line LaTeX expression', () => {
  assert.deepEqual(validateLatexOcrCandidate('  \\frac{3^{x}}{\\log 3} + C  '), {
    valid: true,
    latex: '\\frac{3^{x}}{\\log 3} + C',
  });
});

test('rejects pix2tex layout output before it replaces PDF text', () => {
  const validation = validateLatexOcrCandidate('\\begin{array}{c}x\\end{array}');
  assert.equal(validation.valid, false);
  assert.equal(validation.reason, 'OCR result contains unsupported layout commands');
});

test('rejects a formula with unbalanced delimiters', () => {
  const validation = validateLatexOcrCandidate('\\frac{3^{x}}{\\log 3');
  assert.equal(validation.valid, false);
  assert.equal(validation.reason, 'OCR result has unbalanced delimiters');
});
