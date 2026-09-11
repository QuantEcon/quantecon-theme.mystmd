/**
 * Unit tests for the notebook launcher URL/path builders
 * (app/components/toolbar/launchUrls.ts).
 *
 * The module is plain (erasable) TypeScript and free of React, so Node's
 * built-in type stripping runs it directly under `node --test` — no build
 * step. Covers the configured notebook repository in both spellings, the
 * `main` branch default, each `launch_notebook_*` option, and the nested
 * lecture-dir path handling.
 *
 * Requires Node >= 23.6 (type stripping of the imported `.ts` is on by
 * default), matching the CI Node 24 runner. The theme runtime itself still
 * supports Node >= 20 (`engines.node`); only this dev test needs the newer
 * Node.
 *
 * Run with: npm run test:unit
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildColabUrl,
  notebookOrgRepo,
  notebookRelPath,
} from '../../app/components/toolbar/launchUrls.ts';

const NOTEBOOKS = 'QuantEcon/lecture-foo.notebooks';

test('the configured repository and the main branch default', () => {
  assert.equal(
    buildColabUrl('/notebook.ipynb', { repo: NOTEBOOKS }),
    'https://colab.research.google.com/github/QuantEcon/lecture-foo.notebooks/blob/main/notebook.ipynb'
  );
});

test('notebookOrgRepo accepts a bare org/repo and a full URL', () => {
  assert.equal(notebookOrgRepo(NOTEBOOKS), NOTEBOOKS);
  assert.equal(notebookOrgRepo(`https://github.com/${NOTEBOOKS}`), NOTEBOOKS);
  assert.equal(notebookOrgRepo(`https://github.com/${NOTEBOOKS}.git`), NOTEBOOKS);
  assert.equal(notebookOrgRepo(`https://github.com/${NOTEBOOKS}/`), NOTEBOOKS);
  assert.equal(notebookOrgRepo(`/${NOTEBOOKS}/`), NOTEBOOKS);
});

test('nothing is derived from the source repository', () => {
  // The `.myst` -> `.notebooks` rule is gone: whatever is configured is used
  // verbatim, so a site cannot end up pointing at a repository it never named.
  assert.equal(notebookOrgRepo('QuantEcon/lecture-python.myst'), 'QuantEcon/lecture-python.myst');
});

test('the page extension is replaced, not every dot', () => {
  assert.equal(notebookRelPath('/lectures/v1.2/intro.md'), 'lectures/v1.2/intro.ipynb');
  assert.equal(notebookRelPath('intro.md'), 'intro.ipynb');
  assert.equal(notebookRelPath('/intro'), 'intro.ipynb');
});

test('launch_notebook_branch overrides the default branch', () => {
  assert.equal(
    buildColabUrl('/intro.md', { repo: NOTEBOOKS, branch: 'publish' }),
    'https://colab.research.google.com/github/QuantEcon/lecture-foo.notebooks/blob/publish/intro.ipynb'
  );
});

test('launch_notebook_dir prefixes the path inside the notebook repo', () => {
  assert.equal(notebookRelPath('/intro.md', { dir: 'notebooks' }), 'notebooks/intro.ipynb');
  assert.equal(notebookRelPath('/intro.md', { dir: '/notebooks/' }), 'notebooks/intro.ipynb');
});

test('launch_notebook_source_dir is stripped from the page path', () => {
  assert.equal(notebookRelPath('/lectures/intro.md', { sourceDir: 'lectures' }), 'intro.ipynb');
  assert.equal(notebookRelPath('/lectures/intro.md', { sourceDir: '/lectures/' }), 'intro.ipynb');
  // A prefix that only looks like the source dir is left alone.
  assert.equal(
    notebookRelPath('/lectures-extra/intro.md', { sourceDir: 'lectures' }),
    'lectures-extra/intro.ipynb'
  );
});

test('combined: source_dir strip + dir + branch + nested lecture dir', () => {
  assert.equal(
    buildColabUrl('/lectures/part1/intro.md', {
      repo: 'https://github.com/QuantEcon/lecture-foo.notebooks',
      branch: 'publish',
      dir: 'notebooks',
      sourceDir: 'lectures',
    }),
    'https://colab.research.google.com/github/QuantEcon/lecture-foo.notebooks/blob/publish/notebooks/part1/intro.ipynb'
  );
});
