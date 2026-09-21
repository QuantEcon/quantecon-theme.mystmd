/**
 * Unit tests for the long-cell tag parser (app/longCell.ts), the prototype for
 * QuantEcon/quantecon-theme.mystmd#242: which cell tags cap the input or the
 * output, and how. Plain TypeScript with no React, run under `node --test`
 * with type stripping like toc-tree.test.mjs.
 *
 * Run with: npm run test:unit
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SCROLL_EMS, longCellSpec } from '../../app/longCell.ts';

test('a cell with no long-cell tag asks for nothing', () => {
  assert.equal(longCellSpec(undefined), null);
  assert.equal(longCellSpec([]), null);
  assert.equal(longCellSpec(['hide-input', 'raises-exception']), null);
  assert.equal(longCellSpec('collapse-20'), null); // tags must be a list
});

test('collapse-N caps the input behind a bar, at N em', () => {
  assert.deepEqual(longCellSpec(['collapse-20']), { input: { kind: 'collapse', ems: 20 } });
  assert.deepEqual(longCellSpec(['collapse-5']), { input: { kind: 'collapse', ems: 5 } });
});

test('collapse-output-N caps the output behind the same bar', () => {
  assert.deepEqual(longCellSpec(['collapse-output-20']), {
    output: { kind: 'collapse', ems: 20 },
  });
});

test('scroll-input and both scroll-output spellings cap with a scrollbar', () => {
  assert.deepEqual(longCellSpec(['scroll-input']), { input: { kind: 'scroll', ems: SCROLL_EMS } });
  assert.deepEqual(longCellSpec(['scroll-output']), {
    output: { kind: 'scroll', ems: SCROLL_EMS },
  });
  assert.deepEqual(longCellSpec(['output_scroll']), {
    output: { kind: 'scroll', ems: SCROLL_EMS },
  });
});

test('an input cap and an output cap are independent', () => {
  assert.deepEqual(longCellSpec(['hide-input', 'collapse-20', 'scroll-output']), {
    input: { kind: 'collapse', ems: 20 },
    output: { kind: 'scroll', ems: SCROLL_EMS },
  });
});

test('where two tags claim one side, the first wins', () => {
  assert.deepEqual(longCellSpec(['collapse-20', 'scroll-input']), {
    input: { kind: 'collapse', ems: 20 },
  });
  assert.deepEqual(longCellSpec(['scroll-output', 'collapse-output-10']), {
    output: { kind: 'scroll', ems: SCROLL_EMS },
  });
});

test('a zero, negative-looking or non-numeric height is ignored', () => {
  assert.equal(longCellSpec(['collapse-0']), null);
  assert.equal(longCellSpec(['collapse-']), null);
  assert.equal(longCellSpec(['collapse-tall']), null);
  assert.equal(longCellSpec(['collapse-output-']), null);
  assert.equal(longCellSpec(['collapse-20em']), null);
});

test('non-string entries in the tag list are skipped', () => {
  assert.deepEqual(longCellSpec([20, null, 'collapse-20']), {
    input: { kind: 'collapse', ems: 20 },
  });
});
