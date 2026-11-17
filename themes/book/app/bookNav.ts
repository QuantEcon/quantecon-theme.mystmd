/**
 * The book's structure, derived once from the project manifest and shared by
 * the breadcrumb, the contents drawer, the contents page, the cover and the
 * previous/next links.
 *
 * MyST gives the theme two views of the table of contents:
 *
 *   - `project.pages`: every page in reading order, with its slug, title and
 *     (with book numbering) its chapter `enumerator`, but flattened: the
 *     `myst.yml` groups ("Front Matter", "Chapters", "Appendices") are gone.
 *   - `project.toc`: the `myst.yml` tree as written, with the groups and their
 *     `section:` keys, but naming files rather than slugs.
 *
 * Walking the two together recovers both: each `file` entry in the tree
 * consumes the next page in reading order. The index page is skipped (it is
 * the cover, not in `pages`), as are the `level: -1` part headings the
 * QuantEcon mystmd fork inserts into `pages`.
 *
 * Plain data in, plain data out, so it is unit-tested without React
 * (tests/unit/book-nav.test.mjs).
 */

/**
 * The slug of the optional contents page. A page with this slug (or with
 * `layout: contents` under `site:` in its frontmatter) renders the full table
 * of contents; it is listed in `myst.yml` so mystmd builds it, but is left out
 * of the structure here so it does not list itself or take a number.
 */
export const CONTENTS_SLUG = 'contents';

export type BookGroupKind = 'matter' | 'part' | 'appendix';

export type BookChapter = {
  slug: string;
  title: string;
  /** The label shown before the title: "3", "ii", "A" or "·". */
  num: string;
  /** One-line gloss, from the page's `description`, when it has one. */
  description?: string;
  /** Pages nested under this one in `myst.yml`. */
  children: BookChapter[];
};

export type BookGroup = {
  id: string;
  title: string;
  kind: BookGroupKind;
  /** "Part I" etc. when the book has more than one numbered part. */
  label?: string;
  chapters: BookChapter[];
};

export type Book = {
  groups: BookGroup[];
  /** Every chapter (and nested page) in reading order. */
  order: BookChapter[];
};

type ManifestPage = {
  slug?: string;
  title?: string;
  short_title?: string;
  description?: string;
  enumerator?: string;
  level?: number;
};

type TocEntry = {
  file?: string;
  url?: string;
  title?: string;
  section?: string;
  children?: TocEntry[];
};

type ProjectLike = {
  index?: string;
  pages?: ManifestPage[];
  toc?: TocEntry[];
};

const ROMAN: [number, string][] = [
  [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'], [100, 'c'], [90, 'xc'],
  [50, 'l'], [40, 'xl'], [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
];

export function toRoman(n: number): string {
  let out = '';
  let rest = Math.max(0, Math.floor(n));
  for (const [value, glyph] of ROMAN) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

function upperRoman(n: number) {
  return toRoman(n).toUpperCase();
}

/** The slug mystmd gives a file: basename, no extension, `_` and spaces to `-`. */
export function fileSlug(file: string): string {
  const base = file.split('/').pop() ?? file;
  return base
    .replace(/\.(md|ipynb|myst\.md|tex)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function groupKind(entry: { title?: string; section?: string }): BookGroupKind {
  const section = (entry.section ?? '').toLowerCase();
  const title = (entry.title ?? '').toLowerCase();
  if (/front|back|matter|preface/.test(section) || /(front|back) ?matter/.test(title)) {
    return 'matter';
  }
  if (/appendi/.test(section) || /appendi/.test(title)) return 'appendix';
  return 'part';
}

function idFor(title: string, i: number) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug ? `part-${slug}` : `part-${i + 1}`;
}

export function hasContentsPage(project?: ProjectLike | null): boolean {
  return !!project?.pages?.some((p) => p.slug === CONTENTS_SLUG);
}

export function buildBook(project?: ProjectLike | null): Book {
  const pages = (project?.pages ?? []).filter(
    (p): p is ManifestPage & { slug: string } => !!p.slug && (p.level ?? 0) >= 0,
  );
  let cursor = 0;
  const order: BookChapter[] = [];

  const take = (entry: TocEntry): BookChapter | undefined => {
    if (!entry.file) return undefined;
    if (project?.index && fileSlug(entry.file) === project.index) return undefined;
    const page = pages[cursor];
    if (!page) return undefined;
    cursor += 1;
    if (page.slug === CONTENTS_SLUG) return undefined;
    const chapter: BookChapter = {
      slug: page.slug,
      title: entry.title || page.short_title || page.title || page.slug,
      num: page.enumerator ?? '',
      description: page.description || undefined,
      children: [],
    };
    order.push(chapter);
    chapter.children = (entry.children ?? [])
      .map(take)
      .filter((c): c is BookChapter => !!c);
    return chapter;
  };

  const groups: BookGroup[] = [];
  const loose: BookChapter[] = [];
  const toc = project?.toc;
  if (toc && toc.length) {
    toc.forEach((entry, i) => {
      if (entry.file) {
        const c = take(entry);
        if (c) loose.push(c);
        return;
      }
      if (!entry.children) return;
      const chapters = entry.children.map(take).filter((c): c is BookChapter => !!c);
      if (!chapters.length) return;
      if (loose.length) {
        groups.push({ id: `part-${groups.length + 1}`, title: '', kind: 'part', chapters: loose.splice(0) });
      }
      groups.push({ id: idFor(entry.title ?? '', i), title: entry.title ?? '', kind: groupKind(entry), chapters });
    });
  }
  // Pages the tree did not reach (no toc, or a toc mystmd extended).
  while (cursor < pages.length) {
    const c = take({ file: `__page_${cursor}`, title: undefined });
    if (c) loose.push(c);
  }
  if (loose.length) groups.push({ id: `part-${groups.length + 1}`, title: '', kind: 'part', chapters: loose });

  // Numbers for pages without an enumerator: roman in front matter, letters
  // in an appendix group, a middle dot elsewhere.
  for (const group of groups) {
    group.chapters.forEach((c, i) => {
      if (c.num) return;
      if (group.kind === 'matter') c.num = toRoman(i + 1);
      else if (group.kind === 'appendix') c.num = String.fromCharCode(65 + i);
      else c.num = '·';
    });
  }
  // "Part I", "Part II" only when there is more than one numbered part.
  const parts = groups.filter((g) => g.kind === 'part' && g.title);
  if (parts.length > 1) parts.forEach((g, i) => (g.label = `Part ${upperRoman(i + 1)}`));

  return { groups, order };
}

/** The group and chapter a slug belongs to, for the breadcrumb. */
export function locate(book: Book, slug?: string) {
  if (!slug) return {};
  for (const group of book.groups) {
    for (const chapter of group.chapters) {
      if (chapter.slug === slug) return { group, chapter };
      const child = chapter.children.find((c) => c.slug === slug);
      if (child) return { group, chapter, child };
    }
  }
  return {};
}

export function neighbours(book: Book, slug?: string) {
  const i = book.order.findIndex((c) => c.slug === slug);
  if (i < 0) return {};
  return { prev: book.order[i - 1], next: book.order[i + 1] };
}
