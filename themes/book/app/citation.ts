import type { V2_MetaDescriptor } from '@remix-run/react';

/**
 * Highwire Press `citation_*` meta tags, which Google Scholar and reference
 * managers read (https://scholar.google.com/intl/en/scholar/inclusion.html).
 * The Sphinx and stock book-theme editions emit none.
 *
 * The cover is described as the book; a chapter as a part of it
 * (`citation_inbook_title`), so a citation to a chapter names the book.
 * Only fields the project actually has are emitted.
 */
type Author = { name?: string; affiliations?: unknown[] };
type ProjectLike = {
  title?: string;
  authors?: Author[];
  doi?: string;
  date?: string;
  venue?: { title?: string };
  downloads?: { url?: string; format?: string }[];
  keywords?: string[];
};

export function citationMeta({
  project,
  chapterTitle,
  url,
  origin,
}: {
  project?: ProjectLike;
  chapterTitle?: string;
  /** The page's public URL, when the site sets `site_url`. */
  url?: string;
  /** The site origin, for an absolute PDF URL. */
  origin?: string;
}): V2_MetaDescriptor[] {
  if (!project?.title) return [];
  const tags: V2_MetaDescriptor[] = [];
  const add = (name: string, content?: string) => {
    if (content) tags.push({ name, content });
  };
  if (chapterTitle) {
    add('citation_title', chapterTitle);
    add('citation_inbook_title', project.title);
  } else {
    add('citation_title', project.title);
  }
  for (const a of project.authors ?? []) add('citation_author', a.name);
  add('citation_publisher', project.venue?.title);
  if (project.date) add('citation_publication_date', project.date.slice(0, 10).replace(/-/g, '/'));
  add('citation_doi', project.doi);
  if (url) add('citation_public_url', url);
  const pdf = (project.downloads ?? []).find((d) => d.format === 'pdf' || /\.pdf$/i.test(d.url ?? ''));
  if (pdf?.url) add('citation_pdf_url', /^https?:/.test(pdf.url) || !origin ? pdf.url : `${origin}${pdf.url}`);
  if (project.keywords?.length) add('citation_keywords', project.keywords.join('; '));
  return tags;
}
