#!/usr/bin/env node
//
// Rewrites `{raw}` directives out of QuantEcon lecture sources.
//
// `{raw}` is a Sphinx construct. mystmd parses the directive but renders no
// `raw` node, so a block's own source reaches the reader as escaped text under
// the page title, and the ipynb export drops it. Three shapes appear across the
// lecture repositories, and each has a mystmd-native equivalent or no reason to
// exist:
//
//   * the notebook logo header (`<div id="qe-notebook-header">`), in both
//     `{raw} jupyter` and `{raw} html` form -- deleted, because the header
//     belongs to the ipynb export rather than to a copy in every lecture file
//     (QuantEcon/mystmd#108);
//   * an Our World in Data chart -- the `{iframe}` directive;
//   * a table carrying `colspan`/`rowspan` -- the same HTML with its fence
//     removed, which mystmd's HTML transform turns into a real table.
//
// Any other `{raw}` block is reported and nothing is written at all: an
// unrecognised block is a content decision rather than something to guess at.
//
// Usage:  node scripts/rewrite-raw-blocks.mjs [path...]      (default: ".")

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SKIP_DIRS = new Set(['.git', 'node_modules', '_build', '.deploy']);

// A directive fence opens with three or more backticks or colons, optionally
// indented, and names its directive in braces. A plain code fence (no braces)
// matches too, which is the point: the scanner has to step over one to avoid
// rewriting a `{raw}` block quoted as an example inside it.
const FENCE_OPEN = /^(\s*)(`{3,}|:{3,})\s*(?:\{([a-zA-Z0-9_-]+)\})?\s*(.*)$/;

// The closing fence repeats the opening character at least as many times, which
// is how a longer fence nests a shorter one inside its body.
const closingFence = (marker) =>
  new RegExp(`^\\s*\\${marker[0]}{${marker.length},}\\s*$`);

const joined = (body) => body.join('\n').trim();
const isHeader = (body) => /id\s*=\s*["']qe-notebook-header["']/.test(joined(body));
const isIframe = (body) => /^<iframe\b[^>]*>\s*<\/iframe>$/.test(joined(body));
const isTable = (body) => /^<table[\s>]/.test(joined(body));

/**
 * Rewrites a run of lines, recursing into the body of every other directive.
 *
 * Recursion is what catches a `{raw}` block written inside an `{exercise}` or
 * `{solution}`; `base` is the 1-based line number of `lines[0]` in the file, so
 * a block reported from inside one still names its real line.
 */
function rewriteLines(lines, base, state) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const match = FENCE_OPEN.exec(lines[i]);
    if (!match) {
      out.push(lines[i]);
      i += 1;
      continue;
    }

    const [, indent, marker, name, argument] = match;
    const close = closingFence(marker);
    let end = i + 1;
    while (end < lines.length && !close.test(lines[end])) end += 1;
    if (end >= lines.length) {
      // Unterminated, so not a fence whose extent this script can trust.
      out.push(lines[i]);
      i += 1;
      continue;
    }

    const body = lines.slice(i + 1, end);
    const startLine = base + i;

    if (name !== 'raw') {
      // Recurse into another directive, which is how a `{raw}` block written
      // inside an `{exercise}` or `{solution}` is reached -- but never into a
      // plain code fence, whose content is a listing and may well quote one.
      const inner = name ? rewriteLines(body, startLine + 1, state) : body;
      out.push(lines[i], ...inner, lines[end]);
      i = end + 1;
      continue;
    }

    if (isHeader(body)) {
      state.counts.headers += 1;
      i = end + 1;
      // The blank line below the block goes with it. Lecture files put the
      // header between a target label and the page title, so leaving the blank
      // line would strand the label a paragraph above the heading it names.
      if (lines[i] !== undefined && lines[i].trim() === '') i += 1;
      continue;
    }

    if (isIframe(body)) {
      const src = /src\s*=\s*["']([^"']+)["']/.exec(joined(body));
      if (src) {
        state.counts.iframes += 1;
        // `:width:` carries over the only sizing the raw markup set that the
        // directive also expresses; its own aspect-ratio box supplies the rest.
        out.push(
          `${indent}${marker}{iframe} ${src[1]}`,
          `${indent}:width: 100%`,
          `${indent}${marker}`
        );
        i = end + 1;
        continue;
      }
      state.unknown.push({ line: startLine, reason: '{raw} iframe with no src' });
      out.push(...lines.slice(i, end + 1));
      i = end + 1;
      continue;
    }

    if (isTable(body)) {
      state.counts.tables += 1;
      out.push(...body);
      i = end + 1;
      continue;
    }

    state.unknown.push({ line: startLine, reason: `{raw} ${argument || '(no format)'}` });
    out.push(...lines.slice(i, end + 1));
    i = end + 1;
  }

  return out;
}

/**
 * Rewrites one document. Never throws on content: unclassified blocks come back
 * in `unknown` and are left exactly as they were.
 */
export function rewriteDocument(source) {
  const lines = source.split('\n');
  const state = { counts: { headers: 0, iframes: 0, tables: 0 }, unknown: [] };

  // YAML frontmatter is delimited by `---` rather than a fence, and is passed
  // through untouched.
  let start = 0;
  if (lines[0]?.trim() === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) start = end + 1;
  }

  const head = lines.slice(0, start);
  const body = rewriteLines(lines.slice(start), start + 1, state);
  return { text: [...head, ...body].join('\n'), ...state };
}

function* markdownFiles(root) {
  if (fs.statSync(root).isFile()) {
    if (root.endsWith('.md')) yield root;
    return;
  }
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* markdownFiles(full);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield full;
    }
  }
}

function main(argv) {
  const totals = { files: 0, headers: 0, iframes: 0, tables: 0 };
  const problems = [];
  const pending = [];

  for (const root of argv.length ? argv : ['.']) {
    for (const file of markdownFiles(root)) {
      const source = fs.readFileSync(file, 'utf8');
      if (!source.includes('{raw}')) continue;
      const { text, counts, unknown } = rewriteDocument(source);
      for (const u of unknown) problems.push(`${file}:${u.line}: ${u.reason}`);
      if (text !== source) {
        pending.push([file, text]);
        totals.files += 1;
        totals.headers += counts.headers;
        totals.iframes += counts.iframes;
        totals.tables += counts.tables;
      }
    }
  }

  // All or nothing: a half-rewritten tree is harder to reason about than one
  // that still has every block in it.
  if (problems.length) {
    console.error('Unhandled `{raw}` blocks -- nothing was written:');
    for (const problem of problems) console.error(`  ${problem}`);
    return 1;
  }

  console.log(
    `rewrite-raw-blocks: ${totals.files} file(s) changed; ${totals.headers} header(s) deleted, ` +
      `${totals.iframes} iframe(s) and ${totals.tables} table(s) converted`
  );
  for (const [file, text] of pending) fs.writeFileSync(file, text);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  process.exit(main(process.argv.slice(2)));
}
