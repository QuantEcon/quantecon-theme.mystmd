/**
 * Unit tests for app/longCell.ts: which cell tags collapse the input or the
 * outputs, and when the server is certain a collapsed region overflows. Plain
 * TypeScript with no React, run under `node --test` with type stripping like
 * toc-tree.test.mjs.
 *
 * Run with: npm run test:unit
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  capEms,
  certainlyOverflows,
  longCellSpec,
  outputTextLines,
  sourceLines,
} from '../../app/longCell.ts';

test('a cell with no collapse tag asks for nothing', () => {
  assert.equal(longCellSpec(undefined), null);
  assert.equal(longCellSpec([]), null);
  assert.equal(longCellSpec(['hide-input', 'raises-exception']), null);
  assert.equal(longCellSpec('collapse-20'), null); // tags must be a list
});

test('the scroll tags ask for nothing: the lectures rename them to collapse-output-24', () => {
  assert.equal(longCellSpec(['scroll-output']), null);
  assert.equal(longCellSpec(['output_scroll']), null);
  assert.equal(longCellSpec(['scroll-input']), null);
});

test('collapse-N collapses the input, collapse-output-N the outputs', () => {
  assert.deepEqual(longCellSpec(['collapse-20']), { input: 20 });
  assert.deepEqual(longCellSpec(['collapse-5']), { input: 5 });
  assert.deepEqual(longCellSpec(['collapse-output-24']), { output: 24 });
});

test('an input cap and an output cap are independent', () => {
  assert.deepEqual(longCellSpec(['hide-input', 'collapse-20', 'collapse-output-24']), {
    input: 20,
    output: 24,
  });
});

test('where two tags claim one side, the first wins', () => {
  assert.deepEqual(longCellSpec(['collapse-20', 'collapse-10']), { input: 20 });
  assert.deepEqual(longCellSpec(['collapse-output-24', 'collapse-output-10']), { output: 24 });
});

test('a zero or non-numeric height is ignored', () => {
  assert.equal(longCellSpec(['collapse-0']), null);
  assert.equal(longCellSpec(['collapse-']), null);
  assert.equal(longCellSpec(['collapse-tall']), null);
  assert.equal(longCellSpec(['collapse-output-']), null);
  assert.equal(longCellSpec(['collapse-20em']), null);
});

test('non-string entries in the tag list are skipped', () => {
  assert.deepEqual(longCellSpec([20, null, 'collapse-20']), { input: 20 });
});

test('the cap is N + 0.5 em', () => {
  assert.equal(capEms(20), 20.5);
  assert.equal(capEms(24), 24.5);
});

test('overflow is certain only past N lines', () => {
  assert.equal(certainlyOverflows(21, 20), true);
  assert.equal(certainlyOverflows(20, 20), false);
  assert.equal(certainlyOverflows(0, 24), false);
});

test('source lines ignore a trailing newline', () => {
  assert.equal(sourceLines('a = 1\nb = 2\n'), 2);
  assert.equal(sourceLines('a = 1'), 1);
  assert.equal(sourceLines(''), 0);
  assert.equal(sourceLines(undefined), 0);
});

test('stream and error outputs count their lines, in either nbformat text form', () => {
  const log = Array.from({ length: 30 }, (_, i) => `iteration ${i}\n`);
  assert.equal(outputTextLines([{ output_type: 'stream', name: 'stdout', text: log.join('') }]), 30);
  assert.equal(outputTextLines([{ output_type: 'stream', name: 'stdout', text: log }]), 30);
  assert.equal(
    outputTextLines([{ output_type: 'error', traceback: ['Traceback', 'line 1\nline 2'] }]),
    3,
  );
});

test('a result counts its text only when text/plain is all it holds', () => {
  const plain = { output_type: 'execute_result', data: { 'text/plain': { content: 'a\nb\nc' } } };
  assert.equal(outputTextLines([plain]), 3);
  assert.equal(outputTextLines([{ output_type: 'execute_result', data: { 'text/plain': 'a\nb' } }]), 2);
  // An image or HTML is what renders, and it has no line count.
  const figure = {
    output_type: 'display_data',
    data: { 'image/png': { path: 'x.png' }, 'text/plain': { content: '<Figure>' } },
  };
  assert.equal(outputTextLines([figure]), 0);
  // Text mystmd stored outside the page carries a path, not its content.
  assert.equal(
    outputTextLines([{ output_type: 'execute_result', data: { 'text/plain': { path: 'x.txt' } } }]),
    0,
  );
});

test('the counts add up across outputs, skipping anything malformed', () => {
  const outputs = [
    { output_type: 'stream', name: 'stdout', text: 'one\ntwo\n' },
    null,
    'not an output',
    { output_type: 'display_data', data: { 'image/png': { path: 'x.png' } } },
    { output_type: 'stream', name: 'stdout', text: 'three\n' },
  ];
  assert.equal(outputTextLines(outputs), 3);
});
