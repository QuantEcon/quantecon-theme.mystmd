import React, { useMemo } from 'react';
import { useLoaderData } from '@remix-run/react';
import type { PageLoader } from '@myst-theme/common';
import type { SiteManifest } from 'myst-config';
import {
  ArticleProvider,
  GridSystemProvider,
  ProjectProvider,
  useBaseurl,
  useLinkProvider,
  useProjectManifest,
  useSiteManifest,
  withBaseurl,
} from '@myst-theme/providers';
import { Bibliography } from '@myst-theme/site';
import { Notes } from './Notes';
import { MyST } from 'myst-to-react';
import { copyNode, toText, type GenericNode, type GenericParent } from 'myst-common';
import { PageProvider } from '@quantecon/theme-common/components/PageProvider';
import { CONTENTS_SLUG, hasContentsPage, locate, neighbours, type Book, type BookChapter } from '~/bookNav';
import type { BookOptions } from '~/types';
import { BookShell, useBook, useContentsHref } from './BookShell';
import type { Section } from './Breadcrumbs';

type ManifestProject = Required<SiteManifest>['projects'][0];
type LoaderData = { page: PageLoader; project: ManifestProject; config: SiteManifest };

/** The grid that places body and margin content (styles/book.css `.qb-grid`). */
const GRID = 'qb-grid';

/** Numbered level-2 headings: the chapter's sections, for the breadcrumb. */
export function sectionsOf(mdast?: GenericParent): Section[] {
  const out: Section[] = [];
  const walk = (node: GenericNode) => {
    if (node.type === 'heading' && node.depth === 2 && (node.html_id || node.identifier)) {
      out.push({ id: node.html_id || node.identifier, num: node.enumerator, title: toText(node.children) });
      return;
    }
    node.children?.forEach(walk);
  };
  if (mdast) walk(mdast);
  return out;
}

function Article({ page, children }: { page: PageLoader; children: React.ReactNode }) {
  return (
    <GridSystemProvider gridSystem={GRID}>
      <ArticleProvider
        references={{ ...page.references, article: page.mdast }}
        kind={page.kind}
        frontmatter={page.frontmatter}
      >
        {children}
      </ArticleProvider>
    </GridSystemProvider>
  );
}

function ChapterNav({ book, slug }: { book: Book; slug?: string }) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const { prev, next } = neighbours(book, slug);
  if (!prev && !next) return null;
  const label = (c: BookChapter) => (c.num && c.num !== '·' ? `${c.num} · ${c.title}` : c.title);
  return (
    <nav className="qb-chap-nav" aria-label="Previous and next">
      {prev ? (
        <Link to={withBaseurl(`/${prev.slug}`, baseurl)} className="qb-chap-nav__prev">
          <span className="qb-chap-nav__dir">← Previous</span>
          <span className="qb-chap-nav__ttl">{label(prev)}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={withBaseurl(`/${next.slug}`, baseurl)} className="qb-chap-nav__next">
          <span className="qb-chap-nav__dir">Next →</span>
          <span className="qb-chap-nav__ttl">{label(next)}</span>
        </Link>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ chapter */

function Chapter({ page }: { page: PageLoader }) {
  const book = useBook();
  const tree = useMemo(() => copyNode(page.mdast) as GenericParent, [page]);
  const sections = useMemo(() => sectionsOf(page.mdast as GenericParent), [page]);
  const { group, chapter } = locate(book, page.slug) as ReturnType<typeof locate>;
  const fm = page.frontmatter;
  const num = chapter?.num && chapter.num !== '·' ? chapter.num : undefined;
  const eyebrow = group ? [group.label, group.title].filter(Boolean).join(' · ') : undefined;
  return (
    <BookShell type="chapter" slug={page.slug} sections={sections}>
      <main className="qb-reading" id="skip-to-article">
        <Article page={page}>
          <article className={`qb-article ${GRID}`}>
            <header className="qb-chapter-head">
              {eyebrow && <p className="qb-eyebrow">{eyebrow}</p>}
              {num && (
                <div className="qb-ch-num" aria-hidden="true">
                  {num}
                </div>
              )}
              <h1>
                {num && <span className="sr-only">{num} </span>}
                {fm.title}
              </h1>
              {fm.subtitle && <p className="qb-lede">{fm.subtitle}</p>}
              {!fm.subtitle && fm.description && <p className="qb-lede">{fm.description}</p>}
            </header>
            <MyST ast={tree} />
            <Notes containerClassName="qb-notes qb-footnotes" />
            <Bibliography containerClassName="qb-notes qb-bibliography" />
            <ChapterNav book={book} slug={page.slug} />
          </article>
        </Article>
      </main>
    </BookShell>
  );
}

/* ----------------------------------------------------------------- contents */

function ContentsList({ book }: { book: Book }) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  return (
    <div className="qb-toc">
      {book.groups.map((g) => (
        <section className="qb-toc__part" id={g.id} key={g.id} aria-labelledby={`${g.id}-label`}>
          <h2 className="qb-toc__part-label" id={`${g.id}-label`}>
            {g.label && <span className="qb-toc__part-num">{g.label}</span>}
            {g.title && (
              <span className={g.kind === 'part' ? 'qb-toc__part-title' : 'qb-toc__part-num'}>{g.title}</span>
            )}
            <span className="qb-toc__part-rule" aria-hidden="true" />
          </h2>
          <ul>
            {g.chapters.map((c) => (
              <li key={c.slug}>
                <Link
                  to={withBaseurl(`/${c.slug}`, baseurl)}
                  className={`qb-toc__item${g.kind === 'matter' ? ' qb-toc__item--minor' : ''}`}
                >
                  <span className="qb-toc__num">{c.num}</span>
                  <span>
                    <span className="qb-toc__name">{c.title}</span>
                    {c.description && <span className="qb-toc__desc">{c.description}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Contents({ page }: { page: PageLoader }) {
  const book = useBook();
  const project = useProjectManifest();
  const tree = useMemo(() => copyNode(page.mdast) as GenericParent, [page]);
  const hasBody = (tree.children ?? []).length > 0;
  return (
    <BookShell type="contents" slug={page.slug}>
      <main className="qb-wrap" id="skip-to-article">
        <header className="qb-toc-head">
          <p className="qb-eyebrow">Table of Contents</p>
          <h1>{project?.title}</h1>
          {project?.description && <p>{project.description}</p>}
        </header>
        {hasBody && (
          <Article page={page}>
            <div className="qb-toc-intro">
              <MyST ast={tree} />
            </div>
          </Article>
        )}
        <ContentsList book={book} />
      </main>
    </BookShell>
  );
}

/* -------------------------------------------------------------------- cover */

function affiliationNames(project: any, author: any): string[] {
  const affs: any[] = project?.affiliations ?? [];
  return (author?.affiliations ?? []).map((a: any) => {
    if (typeof a !== 'string') return a?.name ?? '';
    return affs.find((x) => x.id === a)?.name ?? a;
  });
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Cover({ page }: { page: PageLoader }) {
  const book = useBook();
  const config = useSiteManifest();
  const project: any = useProjectManifest();
  const options = ((config as any)?.options ?? {}) as BookOptions;
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const contentsHref = useContentsHref();
  const hasContents = hasContentsPage(project);
  const tree = useMemo(() => copyNode(page.mdast) as GenericParent, [page]);

  const [main, ...rest] = String(project?.title ?? config?.title ?? '').split(':');
  const subtitle = rest.join(':').trim() || project?.subtitle;
  const authors: any[] = project?.authors ?? [];
  const pdf = (project?.downloads ?? []).find((d: any) => d.format === 'pdf' || /\.pdf$/i.test(d.url ?? ''));
  const series = options.series ?? project?.venue?.title ?? 'QuantEcon';
  const chapters = book.groups.filter((g) => g.kind === 'part').reduce((n, g) => n + g.chapters.length, 0);
  const license = project?.license?.content?.name ?? project?.license?.content?.id ?? options.license_label;
  const doi = project?.doi;
  const first = book.order[0];
  // The project's thumbnail, when it has one, is the art on the drawn book.
  const art: string | undefined = project?.thumbnailOptimized || project?.thumbnail || undefined;

  return (
    <BookShell type="cover" slug={page.slug}>
      <main className="qb-wrap" id="skip-to-article">
        <section className="qb-hero">
          <div className="qb-hero__meta">
            <p className="qb-hero__series">
              {[series, project?.subject].filter(Boolean).join(' · ')}
            </p>
            <h1>
              {main.trim()}
              {subtitle && (
                <>
                  <br />
                  <span className="qb-hero__vol">{subtitle}</span>
                </>
              )}
            </h1>
            {project?.description && <p className="qb-hero__sub">{project.description}</p>}
            {authors.length > 0 && (
              <ul className="qb-hero__authors" aria-label="Authors">
                {authors.map((a) => (
                  <li className="qb-hero__author" key={a.id ?? a.name}>
                    <b>{a.name}</b>
                    {affiliationNames(project, a).map((aff) => (
                      <span key={aff}>{aff}</span>
                    ))}
                  </li>
                ))}
              </ul>
            )}
            <div className="qb-hero__actions">
              {/* As in the design: to the contents page when the book has one,
                  else into the first page. */}
              <Link
                to={withBaseurl(
                  hasContents || !first ? contentsHref : `/${first.slug}`,
                  baseurl,
                )}
                className="qb-btn qb-btn--primary"
              >
                <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5V5a2 2 0 0 1 2-2h14v14M6.5 17H20" />
                Read online
              </Link>
              {pdf && (
                <a className="qb-btn qb-btn--ghost" href={pdf.url} download={pdf.filename}>
                  <Icon d="M12 3v12M7 11l5 5 5-5M5 21h14" />
                  Download PDF
                </a>
              )}
              {project?.github && (
                <a className="qb-btn qb-btn--ghost" href={project.github}>
                  <Icon d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 20 4.8 4.9 4.9 0 0 0 19.9 1S18.7.6 16 2.5a13.4 13.4 0 0 0-7 0C6.3.6 5.1 1 5.1 1A4.9 4.9 0 0 0 5 4.8 5.2 5.2 0 0 0 3.7 8.4c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" />
                  Source
                </a>
              )}
            </div>
          </div>
          <div className="qb-bookwrap" aria-hidden="true">
            <div className="qb-bookcover">
              <div className="qb-bookcover__top">{series}</div>
              {art && (
                <div className="qb-bookcover__art">
                  <img src={art} alt="" />
                </div>
              )}
              <div className="qb-bookcover__title">{main.trim()}</div>
              <div className="qb-bookcover__rule" />
              {subtitle && <div className="qb-bookcover__vol">{subtitle}</div>}
              <div className="qb-bookcover__by">
                {authors.map((a) => (
                  <b key={a.name}>{a.name}</b>
                ))}
              </div>
              <div className="qb-bookcover__qe">QuantEcon</div>
            </div>
          </div>
        </section>

        <dl className="qb-metastrip">
          {chapters > 0 && (
            <div>
              <dt>Chapters</dt>
              <dd>
                {chapters}
                {book.groups.some((g) => g.kind === 'appendix') && <small> · with appendices</small>}
              </dd>
            </div>
          )}
          {project?.venue?.title && (
            <div>
              <dt>Series</dt>
              <dd>{project.venue.title}</dd>
            </div>
          )}
          {doi && (
            <div>
              <dt>Print edition</dt>
              <dd>
                <a href={`https://doi.org/${doi}`}>{doi}</a>
              </dd>
            </div>
          )}
          {license && (
            <div>
              <dt>Licence</dt>
              <dd>{license}</dd>
            </div>
          )}
          <div>
            <dt>Edition</dt>
            <dd>
              Web{pdf && <small> · and PDF</small>}
            </dd>
          </div>
        </dl>

        {(tree.children ?? []).length > 0 && (
          <Article page={page}>
            <section className="qb-about" aria-label="About this book">
              <h2>About this book</h2>
              <div className={`qb-article ${GRID}`}>
                <MyST ast={tree} />
              </div>
            </section>
          </Article>
        )}

        <section className="qb-overview" id="contents" aria-labelledby="qb-overview-title">
          <h2 id="qb-overview-title">Contents</h2>
          <div className="qb-ov-grid">
            {book.groups.flatMap((g) =>
              g.chapters.map((c) => (
                <Link key={c.slug} to={withBaseurl(`/${c.slug}`, baseurl)} className="qb-ov-card">
                  <span className="qb-ov-card__pn">{[g.label, g.title].filter(Boolean).join(' · ') || ' '}</span>
                  <span className="qb-ov-card__title">
                    <span className="qb-num">{c.num}</span> {c.title}
                  </span>
                  {c.description && <span className="qb-ov-card__desc">{c.description}</span>}
                </Link>
              )),
            )}
          </div>
        </section>
      </main>
    </BookShell>
  );
}

/* --------------------------------------------------------------------- page */

/** Chooses the page type: the cover for the index, the contents page by slug or `layout`, else a chapter. */
export function BookPage() {
  const data = useLoaderData() as LoaderData;
  const project = data.project;
  const page = data.page;
  const layout = (page.frontmatter as any)?.site?.layout;
  const isCover = !!project?.index && page.slug === project.index;
  const isContents = page.slug === CONTENTS_SLUG || layout === 'contents';
  return (
    <ProjectProvider project={project}>
      <PageProvider page={page}>
        {isCover ? <Cover page={page} /> : isContents ? <Contents page={page} /> : <Chapter page={page} />}
      </PageProvider>
    </ProjectProvider>
  );
}
