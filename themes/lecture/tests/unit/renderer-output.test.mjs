/**
 * Unit tests for the renderer's output-directory check (rendererOutput.ts).
 *
 * renderer.ts empties BUILD_DIRECTORY before writing the site into it, so the
 * check must refuse anything that is not a build output -- the filesystem
 * root, the home directory, the working directory and their ancestors, and
 * any part of the theme bundle the renderer runs from -- with symlinks
 * resolved, and accept the `_build/html` mystmd passes.
 *
 * Plain (erasable) TypeScript, run directly under `node --test` with type
 * stripping, like the other unit tests.
 *
 * Run with: npm run test:unit
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { clearableOutputDirectory } from '../../rendererOutput.ts';

// Lexical cases: none of these paths exist, so symlink resolution leaves them
// as they are and the checks are about their shape alone.
const cwd = path.resolve('/work/lectures/_build/templates/site/myst/quantecon-theme');
const home = path.resolve('/nonexistent-home/reader');
const keep = [cwd]; // mystmd runs the renderer from the theme bundle's root
const opts = { cwd, home, keep };

test('accepts the _build/html directory mystmd passes', () => {
  const out = path.resolve('/work/lectures/_build/html');
  assert.equal(clearableOutputDirectory(out, opts), out);
});

test('resolves a relative directory against the working directory', () => {
  const elsewhere = { cwd: path.resolve('/work/lectures'), home, keep };
  assert.equal(
    clearableOutputDirectory('_build/html', elsewhere),
    path.resolve('/work/lectures/_build/html'),
  );
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
  // The lecture project itself, which holds the theme under _build/templates.
  assert.throws(() => clearableOutputDirectory('/work/lectures', opts), /Refusing/);
});

test('refuses any part of the theme bundle, from above or inside', () => {
  const elsewhere = { cwd: path.resolve('/elsewhere'), home, keep };
  assert.throws(() => clearableOutputDirectory(cwd, elsewhere), /Refusing/);
  assert.throws(() => clearableOutputDirectory(path.dirname(cwd), elsewhere), /Refusing/);
  // Inside the bundle: emptying these would delete the renderer or the server.
  assert.throws(() => clearableOutputDirectory('renderer/server', opts), /Refusing/);
  assert.throws(() => clearableOutputDirectory(path.join(cwd, 'server'), elsewhere), /Refusing/);
});

test('accepts a sibling whose name only starts like a protected one', () => {
  // `/nonexistent-home/reader-site` shares a prefix with the home directory
  // but is not inside it.
  const out = path.resolve('/nonexistent-home/reader-site/html');
  assert.equal(clearableOutputDirectory(out, opts), out);
});

// Symlink cases, on a real temporary tree.
function tree() {
  const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'renderer-output-')));
  const real = {
    base,
    home: path.join(base, 'users', 'reader'),
    project: path.join(base, 'project'),
    bundle: path.join(base, 'project', '_build', 'templates', 'theme'),
  };
  for (const dir of [real.home, path.join(real.bundle, 'renderer', 'server')]) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return real;
}

test('sees through a symlinked ancestor to a protected directory', () => {
  const t = tree();
  try {
    const opts = { cwd: t.bundle, home: t.home, keep: [t.bundle] };
    // `alias` -> `<base>/users`, so `alias/reader` is the home directory.
    const alias = path.join(t.base, 'alias');
    fs.symlinkSync(path.join(t.base, 'users'), alias);
    assert.throws(() => clearableOutputDirectory(path.join(alias, 'reader'), opts), /Refusing/);
    // And a link straight at the renderer's own server directory.
    const link = path.join(t.base, 'out-link');
    fs.symlinkSync(path.join(t.bundle, 'renderer', 'server'), link);
    assert.throws(() => clearableOutputDirectory(link, opts), /Refusing/);
  } finally {
    fs.rmSync(t.base, { recursive: true, force: true });
  }
});

test('resolves a not-yet-existing output through its symlinked parent', () => {
  const t = tree();
  try {
    const opts = { cwd: t.bundle, home: t.home, keep: [t.bundle] };
    const alias = path.join(t.base, 'project-link');
    fs.symlinkSync(t.project, alias);
    assert.equal(
      clearableOutputDirectory(path.join(alias, '_build', 'html'), opts),
      path.join(t.project, '_build', 'html'),
    );
  } finally {
    fs.rmSync(t.base, { recursive: true, force: true });
  }
});
