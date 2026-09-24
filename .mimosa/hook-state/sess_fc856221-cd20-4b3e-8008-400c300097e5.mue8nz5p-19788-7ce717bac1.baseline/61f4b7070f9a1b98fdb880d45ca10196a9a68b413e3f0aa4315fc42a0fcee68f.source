import assert from 'node:assert/strict';
import test from 'node:test';
import { reconstructFormulaLine, reconstructFormulaLineWithConfidence, type FormulaToken } from '../../src/document/importers/formulaReconstructor.ts';
import { shouldUseMathOcr } from '../../src/document/layout/formulaOcrPolicy.ts';

const token = (text: string, x: number, y: number, height = 12): FormulaToken => ({ text, x, y, width: text.length * 8, height });

test('reconstructs superscript and mathematical symbols from glyph geometry', () => {
  const latex = reconstructFormulaLine([
    token('x', 0, 100, 14),
    token('2', 9, 106, 8),
    token('=', 24, 100, 14),
    token('π', 40, 100, 14),
  ]);

  assert.equal(latex, 'x^{2} = \\pi');
});

test('reconstructs an aligned numerator and denominator as a fraction', () => {
  const latex = reconstructFormulaLine([
    token('=', 0, 100, 14),
    token('3', 18, 108, 10),
    token('x', 26, 114, 7),
    token('log', 18, 87, 10),
    token('3', 42, 87, 10),
    token('+', 58, 100, 14),
    token('C', 74, 100, 14),
  ]);

  assert.equal(latex, '=\\frac{3^{x}}{log3}+ C');
});

test('assigns high confidence to a reconstructed fraction', () => {
  const result = reconstructFormulaLineWithConfidence([
    token('=', 0, 100, 14),
    token('3', 18, 108, 10),
    token('x', 26, 114, 7),
    token('log', 18, 87, 10),
    token('3', 42, 87, 10),
  ]);

  assert.deepEqual(result, { text: '=\\frac{3^{x}}{log3}', confidence: 0.93, kind: 'fraction' });
});

test('uses math OCR only below the reconstruction confidence threshold', () => {
  assert.equal(shouldUseMathOcr(0.93), false);
  assert.equal(shouldUseMathOcr(0.89), true);
  assert.equal(shouldUseMathOcr(), true);
});
