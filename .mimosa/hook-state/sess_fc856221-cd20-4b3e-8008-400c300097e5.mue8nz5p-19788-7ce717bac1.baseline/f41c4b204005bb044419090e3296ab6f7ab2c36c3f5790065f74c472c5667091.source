import assert from 'node:assert/strict';
import test from 'node:test';
import { getPipelineDocumentStatus, shouldAbortOnOcrFailure } from '../../src/document/pipeline/pipelineMode.ts';

test('10 completed OCR regions is a pass', () => {
  assert.equal(getPipelineDocumentStatus(10, 0), 'pass');
});

test('9 completed and 1 failed OCR region is partial-success', () => {
  assert.equal(getPipelineDocumentStatus(9, 1), 'partial-success');
  assert.equal(shouldAbortOnOcrFailure('benchmark', 1), false);
  assert.equal(shouldAbortOnOcrFailure('strict', 1), true);
});

test('0 completed and 10 failed OCR regions is failed', () => {
  assert.equal(getPipelineDocumentStatus(0, 10), 'failed');
});
