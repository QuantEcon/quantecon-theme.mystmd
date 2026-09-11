/**
 * Unit tests for the notebook launcher URL/path builders
 * (app/components/toolbar/launchUrls.ts).
 *
 * The module is plain (erasable) TypeScript and free of React, so Node's
 * built-in type stripping runs it directly under `node --test` — no build
 * step. Covers the `.notebooks` suffix and `main` branch defaults, each
 * `launch_*` override, and the nested lecture-dir path handling.
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

const SOURCE = 'QuantEcon/lecture-foo';

test('defaults reproduce the historical Colab URL (backward-compat)', () => {
  assert.equal(
    buildColabUrl(SOURCE, '/notebook.ipynb'),
    'https://colab.research.google.com/github/QuantEcon/lecture-foo.notebooks/blob/main/notebook.ipynb',
  );
});

test('a source markdown page maps to the .ipynb in the notebook repo', () => {
  assert.equal(
    buildColabUrl(SOURCE, '/intro.md'),
    'https://colab.research.google.com/github/QuantEcon/lecture-foo.notebooks/blob/main/intro.ipynb',
  );
});

test('nested lecture dirs are preserved in the path', () => {
  assert.equal(
    notebookRelPath('/dynamic_programming/mccall_model.md'),
    'dynamic_programming/mccall_model.ipynb',
  );
  assert.equal(
    buildColabUrl(SOURCE, '/dynamic_programming/mccall_model.md'),
    'https://colab.research.google.com/github/QuantEcon/lecture-foo.notebooks/blob/main/dynamic_programming/mccall_model.ipynb',
  );
});

test('only the trailing extension is stripped (dots in dir names survive)', () => {
  // Splitting at the first dot (`location.split('.')[0]`) would truncate
  // this to `/python`.
  assert.equal(notebookRelPath('/python.programming/intro.md'), 'python.programming/intro.ipynb');
});

test('launch_source_path strips the path_to_docs prefix', () => {
  const config = { sourcePath: 'lectures' };
  assert.equal(notebookRelPath('/lectures/dynamic/mccall.md', config), 'dynamic/mccall.ipynb');
  // A page outside the prefix is left untouched.
  assert.equal(notebookRelPath('/other/page.md', config), 'other/page.ipynb');
  // Slashes around the configured prefix are tolerated.
  assert.equal(notebookRelPath('/lectures/intro.md', { sourcePath: '/lectures/' }), 'intro.ipynb');
});

test('launch_notebooks_path prepends the nb_path_to_notebooks subdir', () => {
  assert.equal(
    notebookRelPath('/intro.md', { notebooksPath: 'notebooks' }),
    'notebooks/intro.ipynb',
  );
  assert.equal(
    notebookRelPath('/intro.md', { notebooksPath: '/notebooks/' }),
    'notebooks/intro.ipynb',
  );
});

test('launch_branch overrides the default branch', () => {
  assert.equal(
    buildColabUrl(SOURCE, '/intro.md', { branch: 'dev' }),
    'https://colab.research.google.com/github/QuantEcon/lecture-foo.notebooks/blob/dev/intro.ipynb',
  );
});

test('launch_repo_suffix overrides the .notebooks suffix', () => {
  assert.equal(notebookOrgRepo(SOURCE, { repoSuffix: '-notebooks' }), 'QuantEcon/lecture-foo-notebooks');
  // An empty suffix means the notebook repo is the source repo itself.
  assert.equal(notebookOrgRepo(SOURCE, { repoSuffix: '' }), 'QuantEcon/lecture-foo');
});

test('launch_repo_url overrides the derived notebook repo (full URL)', () => {
  assert.equal(
    notebookOrgRepo(SOURCE, { repoUrl: 'https://github.com/OtherOrg/custom-nb' }),
    'OtherOrg/custom-nb',
  );
  assert.equal(
    notebookOrgRepo(SOURCE, { repoUrl: 'https://github.com/OtherOrg/custom-nb.git' }),
    'OtherOrg/custom-nb',
  );
});

test('launch_repo_url also accepts a bare org/repo string', () => {
  assert.equal(notebookOrgRepo(SOURCE, { repoUrl: 'OtherOrg/custom-nb' }), 'OtherOrg/custom-nb');
});

test('combined config: source_path strip + notebooks_path + branch + nested dir', () => {
  const config = {
    sourcePath: 'lectures',
    notebooksPath: 'nb',
    branch: 'release',
  };
  assert.equal(
    buildColabUrl(SOURCE, '/lectures/topic/page.md', config),
    'https://colab.research.google.com/github/QuantEcon/lecture-foo.notebooks/blob/release/nb/topic/page.ipynb',
  );
});
