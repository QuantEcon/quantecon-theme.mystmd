/**
 * Pure helpers behind the landing-page `{tableofcontents}` renderer
 * (app/components/ProjectTOC.tsx). Split out of the component so the tree
 * building and label formatting run under `node --test` with type stripping,
 * like app/i18n.ts and app/seo.ts.
 *
 * The site manifest's project headings (`getProjectHeadings` from
 * `@myst-theme/common`) are the data source, not the directive's baked AST:
 * the CLI's toc transform flattens `"1 About These Lectures"` into plain text
 * with no separate enumerator, while the manifest keeps `enumerator` as its
 * own field — which is what lets `tocLabel` emit the `1.` the lecture sites
 * use without guessing at strings that merely start with a number.
 */
import { createHtmlId } from 'myst-common';

/** The subset of `@myst-theme/common`'s `Heading` this module consumes. */
export type TocHeading = {
  slug?: string;
  title: string;
  level: number | 'index';
  enumerator?: string;
};

export type TocEntry = {
  title: string;
  slug?: string;
  enumerator?: string;
  /** Anchor id, present only on captionless section titles (no slug). */
  htmlId?: string;
  children: TocEntry[];
};

/** "1. About These Lectures" — enumerator, period, space, title. */
export function tocLabel(entry: { title: string; enumerator?: string }): string {
  return entry.enumerator ? `${entry.enumerator}. ${entry.title}` : entry.title;
}

/**
 * Nest the flat, level-annotated manifest headings into a tree, dropping the
 * `level: 'index'` entry (the landing page must not list itself). Section
 * titles — headings without a slug — get a stable, deduplicated anchor id so
 * the document outline and deep links can target them.
 */
export function buildTocTree(headings: TocHeading[]): TocEntry[] {
  const root: TocEntry[] = [];
  const stack: { level: number; entry: TocEntry }[] = [];
  const idCounts = new Map<string, number>();

  for (const heading of headings) {
    if (heading.level === 'index') continue;
    const entry: TocEntry = {
      title: heading.title,
      slug: heading.slug,
      enumerator: heading.enumerator,
      children: [],
    };
    if (!heading.slug) {
      const base = createHtmlId(heading.title) || 'section';
      const seen = idCounts.get(base) ?? 0;
      idCounts.set(base, seen + 1);
      entry.htmlId = seen === 0 ? base : `${base}-${seen + 1}`;
    }
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    (parent ? parent.entry.children : root).push(entry);
    stack.push({ level: heading.level, entry });
  }
  return root;
}

/**
 * Split the top level into render segments: each captionless section title
 * becomes a heading with its children as the sibling list, and runs of
 * directly-linked pages (a flat TOC, or stray top-level pages between
 * sections) collapse into one list.
 */
export type TocSegment =
  | { kind: 'section'; entry: TocEntry }
  | { kind: 'list'; entries: TocEntry[] };

export function tocSegments(tree: TocEntry[]): TocSegment[] {
  const segments: TocSegment[] = [];
  for (const entry of tree) {
    if (!entry.slug) {
      segments.push({ kind: 'section', entry });
      continue;
    }
    const last = segments[segments.length - 1];
    if (last?.kind === 'list') {
      last.entries.push(entry);
    } else {
      segments.push({ kind: 'list', entries: [entry] });
    }
  }
  return segments;
}
