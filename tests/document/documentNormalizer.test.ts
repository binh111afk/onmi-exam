import assert from 'node:assert/strict';
import test from 'node:test';
import { DocumentNormalizer, normalizeMathAndText } from '../../src/document/parsers/compiler/documentNormalizer.ts';
import { Tokenizer } from '../../src/document/parsers/compiler/tokenizer.ts';

test('wraps an unwrapped math-only answer option in inline delimiters', () => {
  assert.equal(normalizeMathAndText('C. V_{S.ABCD}=60a^{3}.'), 'C. $V_{S.ABCD}=60a^{3}$.');
});

test('does not replace an uncertain formula with a different hard-coded formula', () => {
  const input = 'Giá trị nhỏ nhất của hàm số: y=4sin2x-3 là';
  assert.equal(normalizeMathAndText(input), 'Giá trị nhỏ nhất của hàm số: $y=4sin2x-3$ là');
});

test('wraps recognized mathematical spans embedded in Vietnamese prose', () => {
  assert.equal(
    normalizeMathAndText('Trong không gian Oxyz, mặt phẳng (α): 2x – y+3z+7=0 đi qua điểm.'),
    'Trong không gian $Oxyz$, mặt phẳng $(\\alpha): 2x - y+3z+7=0$ đi qua điểm.',
  );
  assert.equal(
    normalizeMathAndText('Cho khối chóp S.ABCD có đáy ABCD với BC=3a; CD=4a.'),
    'Cho khối chóp $S.ABCD$ có đáy $ABCD$ với $BC=3a$; $CD=4a$.',
  );
});

test('removes private-use glyphs that otherwise become detached paragraphs', () => {
  const result = new DocumentNormalizer().normalizeText(' u = ; v =');
  assert.equal(result.text, ' u = ; v =');
});

test('classifies a detached incomplete vector fragment as noise', () => {
  const tokens = new Tokenizer().tokenize(
    [{ id: 'layout-1', page: 1, boundingBox: { x: 0, y: 0, width: 1, height: 1 }, hasMeasuredGeometry: true, readingOrder: 0, type: 'paragraph', text: 'u = ; v =', confidence: 1 }],
    { version: '1.0', source: { name: 'test.pdf', mimeType: 'application/pdf', kind: 'pdf' }, nodes: [{ kind: 'text', text: 'u = ; v =', confidence: 1 }], ocrRequirement: 'not-required', ocrCandidates: [], reviewMarkers: [] },
  );
  assert.equal(tokens[0].kind, 'NOISE');
});
