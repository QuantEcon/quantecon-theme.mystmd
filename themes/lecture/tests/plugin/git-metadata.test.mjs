/**
 * End-to-end test of plugins/git-metadata.mjs: builds a throwaway MyST
 * project with the real `myst` CLI and asserts the git history that the
 * transform attaches to each page's AST (`mdast.data.git_metadata`).
 *
 * Requirements (both are present in the `visual` CI job, which installs
 * mystmd and runs `make build-theme` first):
 *   - `myst` on PATH
 *   - a built theme template (THEME_TEMPLATE, default .deploy/quantecon-theme)
 *
 * Run with: npm run test:plugin
 */
import assert from 'node:assert/strict';
import { execFile, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);

// The plugin and the build output live at the repository root, above the
// workspace (themes/lecture/tests/plugin -> four levels up).
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const pluginPath = path.join(repoRoot, 'plugins', 'git-metadata.mjs');
const template =
  process.env.THEME_TEMPLATE ?? path.join(repoRoot, '.deploy', 'quantecon-theme');

function mystAvailable() {
  try {
    execFileSync('myst', ['--version'], { encoding: 'utf8', timeout: 30000 });
    return true;
  } catch {
    return false;
  }
}

function git(cwd, ...args) {
  execFileSync(
    'git',
    ['-c', 'user.email=plugin-test@quantecon.org', '-c', 'user.name=Plugin Test', ...args],
    { cwd, encoding: 'utf8' },
  );
}

const skip = !mystAvailable()
  ? 'myst CLI not on PATH'
  : !fs.existsSync(template)
    ? `theme template not built at ${template} (run \`make build-theme\`)`
    : false;

test('git-metadata plugin injects per-page history into the page AST', { skip }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qe-git-metadata-'));
  try {
    fs.writeFileSync(
      path.join(dir, 'myst.yml'),
      [
        'version: 1',
        'project:',
        '  title: Plugin Test',
        '  github: https://github.com/QuantEcon/plugin-test.myst',
        '  plugins:',
        `    - ${pluginPath}`,
        '  toc:',
        '    - file: page.md',
        '    - file: untracked.md',
        'site:',
        '  title: Plugin Test',
        `  template: ${template}`,
        '',
      ].join('\n'),
    );
    fs.writeFileSync(path.join(dir, 'page.md'), '# Tracked page\n\nFirst version.\n');
    git(dir, 'init', '-q');
    git(dir, 'add', 'page.md');
    git(dir, 'commit', '-qm', 'first commit');
    fs.appendFileSync(path.join(dir, 'page.md'), '\nSecond version.\n');
    git(dir, 'add', 'page.md');
    // Pipe in the subject exercises the `--format` field-splitting in the plugin.
    git(dir, 'commit', '-qm', 'second: keep a|b pipes intact');
    // untracked.md exists on disk but has no git history.
    fs.writeFileSync(path.join(dir, 'untracked.md'), '# Untracked page\n');

    await exec('myst', ['build', '--site'], { cwd: dir, timeout: 180000 });

    // page.md is the first TOC entry, so it becomes the project index.
    const tracked = JSON.parse(
      fs.readFileSync(path.join(dir, '_build', 'site', 'content', 'index.json'), 'utf8'),
    );
    const meta = tracked.mdast?.data?.git_metadata;
    assert.ok(meta, 'tracked page should carry mdast.data.git_metadata');
    assert.equal(meta.changelog.length, 2);
    const [head, initial] = meta.changelog;
    assert.equal(head.message, 'second: keep a|b pipes intact');
    assert.equal(initial.message, 'first commit');
    assert.equal(head.author, 'Plugin Test');
    assert.match(head.hash, /^[0-9a-f]{40}$/);
    assert.match(head.short_hash, /^[0-9a-f]{7,}$/);
    assert.ok(head.hash.startsWith(head.short_hash));
    // %cI is strict ISO 8601 and orders newest-first.
    assert.match(head.date, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(meta.last_modified, head.date);
    assert.ok(new Date(head.date) >= new Date(initial.date));

    const untracked = JSON.parse(
      fs.readFileSync(path.join(dir, '_build', 'site', 'content', 'untracked.json'), 'utf8'),
    );
    assert.equal(
      untracked.mdast?.data?.git_metadata,
      undefined,
      'untracked page should not carry git metadata',
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
