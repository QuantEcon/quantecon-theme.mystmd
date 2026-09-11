/**
 * QuantEcon git-metadata plugin for MyST.
 *
 * A `document`-stage transform that runs `git log --follow` on each page's
 * source file during `myst build` / `myst start` and attaches the result to
 * the page AST root as `mdast.data.git_metadata`:
 *
 *   {
 *     last_modified: '2026-06-11T09:30:00+10:00',   // ISO committer date
 *     changelog: [
 *       { hash, short_hash, author, date, message },  // newest first
 *     ],
 *   }
 *
 * The QuantEcon theme renders this as a "Last changed" header control with a
 * changelog dropdown (app/components/PageHeaderHistory.tsx). Pages can also
 * set the same shape manually under `site.git_metadata` in their frontmatter,
 * which takes precedence over the injected data. Write it as a YAML block
 * string (`git_metadata: |` followed by the indented YAML): it is a declared
 * template option, and the CLI can only declare scalar types.
 *
 * Mirrors quantecon-book-theme's get_git_last_modified/get_git_changelog:
 * per-file `git log --follow`, a hard timeout, and a silent no-op when the
 * file is untracked, the project is not a git repository, git is missing, or
 * the command times out. Shallow clones (e.g. CI checkouts with depth 1)
 * yield truncated history rather than an error.
 *
 * Usage in a lecture repo's myst.yml: reference it by URL, with <tag> pinned to
 * the theme release the repo builds with (e.g. v2.3.0), rather than vendoring a
 * copy:
 *
 *   project:
 *     plugins:
 *       - https://raw.githubusercontent.com/QuantEcon/quantecon-theme.mystmd/<tag>/plugins/git-metadata.mjs
 *
 * (A local copy — `- git-metadata.mjs` — also works, e.g. for development.)
 *
 * Configuration (myst-cli does not pass options to transform plugins, so
 * configuration is via environment variables):
 *
 *   QE_GIT_METADATA_MAX  maximum changelog entries per page (default 6)
 *
 * The default is what the header renders, and the header does not scroll — it
 * grows to fit. Raising this makes the expanded changelog taller.
 */
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const GIT_TIMEOUT_MS = 5000;
const MAX_ENTRIES = Number(process.env.QE_GIT_METADATA_MAX) > 0
  ? Number(process.env.QE_GIT_METADATA_MAX)
  : 6;

// %H full hash | %h short hash | %an author | %cI strict-ISO committer date | %s subject
const LOG_FORMAT = '%H|%h|%an|%cI|%s';

async function gitChangelog(file) {
  const { stdout } = await exec(
    'git',
    ['log', `-${MAX_ENTRIES}`, `--format=${LOG_FORMAT}`, '--follow', '--', file],
    { cwd: path.dirname(file), timeout: GIT_TIMEOUT_MS, encoding: 'utf8' },
  );
  return stdout
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const [hash, short_hash, author, date, ...rest] = line.split('|');
      // The subject is last in the format string, so rejoining preserves
      // commit messages that themselves contain `|`.
      return { hash, short_hash, author, date, message: rest.join('|') };
    })
    .filter((entry) => entry.hash && entry.date);
}

const gitMetadataTransform = {
  name: 'qe-git-metadata',
  doc: 'Attach per-page git history (last modified + changelog) to the page AST for the QuantEcon theme.',
  stage: 'document',
  plugin: () => async (tree, vfile) => {
    if (!vfile?.path) return tree;
    try {
      const changelog = await gitChangelog(vfile.path);
      if (changelog.length === 0) return tree; // untracked file
      tree.data = {
        ...(tree.data ?? {}),
        git_metadata: { last_modified: changelog[0].date, changelog },
      };
    } catch {
      // Not a git repository, git unavailable, or git timed out — skip silently.
    }
    return tree;
  },
};

const plugin = {
  name: 'QuantEcon git metadata',
  transforms: [gitMetadataTransform],
};

export default plugin;
