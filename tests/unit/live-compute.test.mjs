/**
 * Unit tests for the per-lecture live-compute resolver (app/liveCompute.ts,
 * #114): page value over site value over an enabled default. Run with
 * `npm run test:unit` (node --test with type stripping, Node >= 23.6).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveLiveCompute } from '../../app/liveCompute.ts';

test('absent everywhere: enabled (today\'s behaviour, project.thebe decides)', () => {
  assert.equal(resolveLiveCompute(undefined, undefined), true);
  assert.equal(resolveLiveCompute({}, {}), true);
});

test('site-wide false turns the default off; a page opts back in', () => {
  assert.equal(resolveLiveCompute({}, { live_compute: false }), false);
  assert.equal(resolveLiveCompute({ live_compute: true }, { live_compute: false }), true);
});

test('page false wins over an enabled site (incremental adoption)', () => {
  assert.equal(resolveLiveCompute({ live_compute: false }, {}), false);
  assert.equal(resolveLiveCompute({ live_compute: false }, { live_compute: true }), false);
});

test('a page that sets other site keys but not this one inherits the site value', () => {
  assert.equal(resolveLiveCompute({ hide_search: true }, { live_compute: false }), false);
  assert.equal(resolveLiveCompute({ hide_search: true }, {}), true);
});

test('string spellings from hand edits are read; garbage falls through', () => {
  assert.equal(resolveLiveCompute({ live_compute: 'false' }, {}), false);
  assert.equal(resolveLiveCompute({ live_compute: 'no' }, {}), false);
  assert.equal(resolveLiveCompute({ live_compute: 'TRUE' }, { live_compute: false }), true);
  assert.equal(resolveLiveCompute({ live_compute: 'maybe' }, { live_compute: false }), false);
  assert.equal(resolveLiveCompute({ live_compute: 'maybe' }, {}), true);
});
