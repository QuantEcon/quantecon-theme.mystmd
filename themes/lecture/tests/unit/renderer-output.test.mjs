/**
 * Unit tests for the renderer's output-directory check (rendererOutput.ts).
 *
 * renderer.ts empties BUILD_DIRECTORY before writing the site into it, so the
 * check must refuse anything that is not a build output -- the filesystem
 * root, the home directory, the working directory, their ancestors, or a
 * directory holding the renderer's own bundle -- and accept the `_build/html`
 * mystmd passes.
 *
 * Plain (erasable) TypeScript, run directly under `node --test` with type
 * stripping, like the other unit tests.
 *
 * Run with: npm run test:unit
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';

import { clearableOutputDirectory } from '../../rendererOutput.ts';

const cwd = path.resolve('/work/lectures/_build/templates/site/myst/quantecon-theme');
const home = path.resolve('/home/reader');
const keep = [path.join(cwd, 'renderer', 'client')];
const opts = { cwd, home, keep };

test('accepts the _build/html directory mystmd passes', () => {
  const out = path.resolve('/work/lectures/_build/html');
  assert.equal(clearableOutputDirectory(out, opts), out);
});

test('resolves a relative directory against the working directory', () => {
  assert.equal(clearableOutputDirectory('out/html', opts), path.join(cwd, 'out', 'html'));
});

test('refuses an unset or blank BUILD_DIRECTORY', () => {
  assert.throws(() => clearableOutputDirectory(undefined, opts), /not set/);
  assert.throws(() => clearableOutputDirectory('', opts), /not set/);
  assert.throws(() => clearableOutputDirectory('   ', opts), /not set/);
});

test('refuses the filesystem root', () => {
  assert.throws(() => clearableOutputDirectory(path.parse(cwd).root, opts), /Refusing/);
});

test('refuses the home directory and its ancestors', () => {
  assert.throws(() => clearableOutputDirectory(home, opts), /Refusing/);
  assert.throws(() => clearableOutputDirectory(path.dirname(home), opts), /Refusing/);
});

test('refuses the working directory and its ancestors', () => {
  assert.throws(() => clearableOutputDirectory('.', opts), /Refusing/);
  assert.throws(() => clearableOutputDirectory(cwd, opts), /Refusing/);
  // The lecture project itself, which holds the theme under _build/templates.
  assert.throws(() => clearableOutputDirectory('/work/lectures', opts), /Refusing/);
});

test("refuses a directory holding the renderer's own bundle", () => {
  const separate = { cwd: path.resolve('/elsewhere'), home, keep };
  assert.throws(() => clearableOutputDirectory(path.join(cwd, 'renderer'), separate), /Refusing/);
});

test('accepts a sibling whose name only starts like a protected one', () => {
  // `/home/reader-site` shares a prefix with `/home/reader` but is not inside it.
  const out = path.resolve('/home/reader-site/html');
  assert.equal(clearableOutputDirectory(out, opts), out);
});
