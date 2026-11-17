/**
 * The book structure the navigation is drawn from (app/bookNav.ts).
 * Requires Node >= 23.6 (type stripping of the imported `.ts`).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildBook, hasContentsPage, fileSlug, groupKind, locate, neighbours, toRoman } from '../../app/bookNav.ts';

// The shape of Economic Networks' manifest (QuantEcon/book-networks.mystmd),
// trimmed to the fields the module reads.
const networks = {
  index: 'index',
  toc: [
    { file: 'index.md' },
    {
      title: 'Front Matter',
      section: 'frontmatter',
      children: [
        { file: 'ch_preface.md', title: 'Preface' },
        { file: 'common_symbols.md', title: 'Common Symbols' },
      ],
    },
    {
      title: 'Chapters',
      section: 'chapters',
      children: [
        { file: 'ch_intro.md', title: 'Introduction' },
        { file: 'ch_production.md', title: 'Production' },
      ],
    },
    { title: 'Appendices', section: 'parts', children: [{ file: 'appendix.md', title: 'Appendix' }] },
  ],
  pages: [
    { slug: 'ch-preface', title: 'Preface', level: 0 },
    { slug: 'common-symbols', title: 'Common Symbols', level: 0 },
    { slug: 'ch-intro', title: 'Introduction', level: 0, enumerator: '1' },
    { slug: 'ch-production', title: 'Production', level: 0, enumerator: '2', description: 'Input-output analysis.' },
    { level: -1, title: 'Part I — Appendices' },
    { slug: 'appendix', title: 'Appendix', level: 0, enumerator: '3' },
  ],
};

test('groups follow myst.yml, pages follow reading order', () => {
  const book = buildBook(networks);
  assert.deepEqual(
    book.groups.map((g) => [g.title, g.kind, g.chapters.map((c) => `${c.num} ${c.slug}`)]),
    [
      ['Front Matter', 'matter', ['i ch-preface', 'ii common-symbols']],
      ['Chapters', 'part', ['1 ch-intro', '2 ch-production']],
      ['Appendices', 'appendix', ['3 appendix']],
    ],
  );
  assert.equal(book.order.length, 5);
  assert.equal(book.groups[1].chapters[1].description, 'Input-output analysis.');
});

test('a single numbered part gets no "Part I" label; several do', () => {
  assert.equal(buildBook(networks).groups[1].label, undefined);
  const two = {
    ...networks,
    toc: [
      { title: 'Foundations', children: [{ file: 'a.md' }] },
      { title: 'Decisions', children: [{ file: 'b.md' }] },
    ],
    pages: [{ slug: 'a', title: 'A', enumerator: '1' }, { slug: 'b', title: 'B', enumerator: '2' }],
  };
  assert.deepEqual(buildBook(two).groups.map((g) => g.label), ['Part I', 'Part II']);
});

test('without a toc every page is one unnamed group', () => {
  const book = buildBook({ pages: [{ slug: 'a', title: 'A' }, { slug: 'b', title: 'B', enumerator: '1' }] });
  assert.equal(book.groups.length, 1);
  assert.deepEqual(book.groups[0].chapters.map((c) => c.num), ['·', '1']);
});

test('nested toc entries become children and keep reading order', () => {
  const book = buildBook({
    toc: [{ title: 'Ch', children: [{ file: 'a.md', children: [{ file: 'a1.md' }] }, { file: 'b.md' }] }],
    pages: [{ slug: 'a' }, { slug: 'a1' }, { slug: 'b' }],
  });
  assert.deepEqual(book.order.map((c) => c.slug), ['a', 'a1', 'b']);
  assert.deepEqual(book.groups[0].chapters[0].children.map((c) => c.slug), ['a1']);
  assert.equal(locate(book, 'a1').chapter.slug, 'a');
});

test('locate and neighbours', () => {
  const book = buildBook(networks);
  assert.equal(locate(book, 'ch-intro').group.title, 'Chapters');
  assert.deepEqual(locate(book, 'nope'), {});
  const { prev, next } = neighbours(book, 'ch-intro');
  assert.equal(prev.slug, 'common-symbols');
  assert.equal(next.slug, 'ch-production');
  assert.equal(neighbours(book, 'appendix').next, undefined);
});

test('helpers', () => {
  assert.equal(toRoman(4), 'iv');
  assert.equal(toRoman(14), 'xiv');
  assert.equal(fileSlug('chapters/ch_intro.md'), 'ch-intro');
  assert.equal(groupKind({ title: 'Back Matter' }), 'matter');
  assert.equal(groupKind({ title: 'Appendices', section: 'parts' }), 'appendix');
});

test('the contents page is built but not listed', () => {
  const withContents = {
    ...networks,
    toc: [
      { file: 'index.md' },
      { title: 'Front Matter', children: [{ file: 'contents.md' }, { file: 'ch_preface.md' }] },
    ],
    pages: [{ slug: 'contents', title: 'Contents' }, { slug: 'ch-preface', title: 'Preface' }],
  };
  const book = buildBook(withContents);
  assert.deepEqual(book.order.map((c) => `${c.num} ${c.slug}`), ['i ch-preface']);
  assert.equal(hasContentsPage(withContents), true);
  assert.equal(hasContentsPage(networks), false);
});
