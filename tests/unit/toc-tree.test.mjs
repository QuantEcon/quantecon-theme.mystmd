/**
 * Unit tests for the landing-page TOC helpers (app/tocTree.ts): manifest
 * headings -> nested tree, section-title anchor ids, render segments, and
 * the "1. Title" label the lecture sites use. Plain TypeScript with no
 * React, run under `node --test` with type stripping like i18n.test.mjs.
 *
 * Run with: npm run test:unit
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildTocTree, tocLabel, tocSegments } from '../../app/tocTree.ts';

test('tocLabel joins enumerator, period, space, title', () => {
  assert.equal(tocLabel({ title: 'About These Lectures', enumerator: '1' }), '1. About These Lectures');
});

test('tocLabel without an enumerator is the bare title', () => {
  assert.equal(tocLabel({ title: 'About These Lectures' }), 'About These Lectures');
});

test('tocLabel leaves a title that starts with a number untouched', () => {
  // The whole point of reading the manifest's separate enumerator field: a
  // string-surgery approach would mangle this into "2008. Financial Crisis".
  assert.equal(tocLabel({ title: '2008 Financial Crisis' }), '2008 Financial Crisis');
});

test('buildTocTree drops the index heading (the landing page never lists itself)', () => {
  const tree = buildTocTree([
    { title: 'Python Programming', slug: 'index', level: 'index' },
    { title: 'About These Lectures', slug: 'about-py', level: 1, enumerator: '1' },
  ]);
  assert.equal(tree.length, 1);
  assert.equal(tree[0].slug, 'about-py');
});

test('buildTocTree groups pages under a captionless section title', () => {
  const tree = buildTocTree([
    { title: 'Introduction to Python', level: 1 },
    { title: 'About These Lectures', slug: 'about-py', level: 2, enumerator: '1' },
    { title: 'Getting Started', slug: 'getting-started', level: 2, enumerator: '2' },
    { title: 'The Scientific Libraries', level: 1 },
    { title: 'NumPy', slug: 'numpy', level: 2, enumerator: '3' },
  ]);
  assert.equal(tree.length, 2);
  assert.equal(tree[0].title, 'Introduction to Python');
  assert.deepEqual(
    tree[0].children.map((c) => c.slug),
    ['about-py', 'getting-started']
  );
  assert.deepEqual(
    tree[1].children.map((c) => c.slug),
    ['numpy']
  );
});

test('buildTocTree gives section titles anchor ids, deduplicated on collision', () => {
  const tree = buildTocTree([
    { title: 'Other Topics', level: 1 },
    { title: 'A', slug: 'a', level: 2 },
    { title: 'Other Topics', level: 1 },
    { title: 'B', slug: 'b', level: 2 },
  ]);
  assert.equal(tree[0].htmlId, 'other-topics');
  assert.equal(tree[1].htmlId, 'other-topics-2');
  // Linked pages need no generated anchor.
  assert.equal(tree[0].children[0].htmlId, undefined);
});

test('buildTocTree nests deeper levels recursively', () => {
  const tree = buildTocTree([
    { title: 'Part I', level: 1 },
    { title: 'Section A', level: 2 },
    { title: 'Lecture', slug: 'lecture', level: 3, enumerator: '1.1' },
    { title: 'Part II', level: 1 },
  ]);
  assert.equal(tree.length, 2);
  assert.equal(tree[0].children[0].title, 'Section A');
  assert.equal(tree[0].children[0].children[0].slug, 'lecture');
  assert.deepEqual(tree[1].children, []);
});

test('tocSegments: a flat numbered toc is one list segment', () => {
  const segments = tocSegments(
    buildTocTree([
      { title: 'Intro', slug: 'index', level: 'index' },
      { title: 'One', slug: 'one', level: 1, enumerator: '1' },
      { title: 'Two', slug: 'two', level: 1, enumerator: '2' },
    ])
  );
  assert.equal(segments.length, 1);
  assert.equal(segments[0].kind, 'list');
  assert.equal(segments[0].entries.length, 2);
});

test('tocSegments: sections become section segments, stray pages merge into list runs', () => {
  const segments = tocSegments(
    buildTocTree([
      { title: 'Preface', slug: 'preface', level: 1 },
      { title: 'Introduction to Python', level: 1 },
      { title: 'About These Lectures', slug: 'about-py', level: 2, enumerator: '1' },
    ])
  );
  assert.deepEqual(
    segments.map((s) => s.kind),
    ['list', 'section']
  );
  assert.equal(segments[1].entry.htmlId, 'introduction-to-python');
});

test('tocSegments of an empty tree is empty (component falls back to the baked list)', () => {
  assert.deepEqual(tocSegments(buildTocTree([])), []);
});
