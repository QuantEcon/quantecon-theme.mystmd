import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@remix-run/react';
import {
  useBaseurl,
  useLinkProvider,
  useProjectManifest,
  useSiteManifest,
  useThemeSwitcher,
  withBaseurl,
} from '@myst-theme/providers';
import { MyST } from 'myst-to-react';
import { Search } from '@quantecon/theme-common/components/Search';
import { buildBook, hasContentsPage, CONTENTS_SLUG, type Book } from '~/bookNav';
import type { BookOptions } from '~/types';
import { Breadcrumbs, type Section } from './Breadcrumbs';

/** The masthead's height in px: the scroll offset for anchors (`top`). */
export const MASTHEAD_HEIGHT = 58;

export type PageType = 'cover' | 'contents' | 'chapter';

/** The project title before any colon: "Economic Networks". */
export function shortTitle(title?: string, options?: BookOptions) {
  if (options?.masthead_title) return options.masthead_title;
  return (title ?? '').split(':')[0].trim();
}

export function useBook(): Book {
  const project = useProjectManifest();
  return useMemo(() => buildBook(project as any), [project]);
}

/** Where "Contents" links go: the contents page if the book has one, else the cover's list. */
export function useContentsHref() {
  const project = useProjectManifest();
  return hasContentsPage(project as any) ? `/${CONTENTS_SLUG}` : '/#contents';
}

function ThemeToggle() {
  const { nextTheme } = useThemeSwitcher();
  // Both icons are rendered and CSS shows the right one (`.dark` on <html>):
  // the server cannot know the reader's scheme, so markup that depended on it
  // would not match at hydration.
  return (
    <button type="button" className="qb-icon" onClick={nextTheme} aria-label="Toggle dark mode" title="Toggle dark mode">
      <svg className="qb-ico-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
      </svg>
      <svg className="qb-ico-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}

/** The contents drawer: the whole book, opened from the masthead's burger. */
function Drawer({ book, slug, open, onClose }: { book: Book; slug?: string; open: boolean; onClose: () => void }) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  return (
    <>
      <nav
        id="qb-drawer"
        className="qb-drawer"
        aria-label="Book contents"
        data-open={open ? '' : undefined}
        // Closed, the drawer is off-canvas: keep its links out of the tab order.
        {...({ inert: open ? undefined : '' } as Record<string, unknown>)}
      >
        {book.groups.map((group) => (
          <div className="qb-drawer__group" key={group.id}>
            {(group.label || group.title) && (
              <p className="qb-kicker">{[group.label, group.title].filter(Boolean).join(' · ')}</p>
            )}
            <ul>
              {group.chapters.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={withBaseurl(`/${c.slug}`, baseurl)}
                    className="qb-drawer__link"
                    {...({ 'aria-current': c.slug === slug ? 'page' : undefined } as any)}
                    onClick={onClose}
                  >
                    <span className="qb-num">{c.num}</span>
                    <span>{c.title}</span>
                  </Link>
                  {c.children.length > 0 && (
                    <ul className="qb-drawer__sub">
                      {c.children.map((s) => (
                        <li key={s.slug}>
                          <Link to={withBaseurl(`/${s.slug}`, baseurl)} className="qb-drawer__link" onClick={onClose}>
                            <span className="qb-num">{s.num}</span>
                            <span>{s.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {open && <div className="qb-scrim" onClick={onClose} aria-hidden="true" />}
    </>
  );
}

/**
 * The page frame shared by every page type: the masthead (burger, title,
 * breadcrumb, search, theme toggle, contents link), the contents drawer, the
 * page itself and the colophon.
 */
export function BookShell({
  type,
  slug,
  sections,
  children,
}: {
  type: PageType;
  slug?: string;
  sections?: Section[];
  children: React.ReactNode;
}) {
  const config = useSiteManifest();
  const project = useProjectManifest();
  const options: BookOptions = ((config as any)?.options ?? {}) as BookOptions;
  const book = useBook();
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const contentsHref = useContentsHref();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close the drawer on navigation and on Escape.
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const footer = (config as any)?.parts?.footer?.mdast;
  return (
    <div className="qb-shell" data-page={type}>
      <header className="qb-masthead">
        <button
          type="button"
          className="qb-burger"
          aria-label={open ? 'Close the contents' : 'Open the contents'}
          aria-expanded={open}
          aria-controls="qb-drawer"
          onClick={() => setOpen(!open)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <Link to={withBaseurl('/', baseurl)} className="qb-masthead__title">
          {options.logo && (
            <>
              <img className="qb-logo qb-logo--light" src={options.logo} alt={options.logo_alt ?? ''} />
              <img
                className="qb-logo qb-logo--dark"
                src={options.logo_dark ?? options.logo}
                alt={options.logo_alt ?? ''}
              />
            </>
          )}
          <span className="qb-masthead__text">
            {options.logo_text ?? (
              <>
                <b>QuantEcon</b> · {shortTitle(project?.title ?? config?.title, options)}
              </>
            )}
          </span>
        </Link>
        <Breadcrumbs book={book} type={type} slug={slug} sections={sections} />
        <div className="qb-masthead__spacer" />
        {!options.hide_search && (
          <div className="qb-masthead__search">
            <Search />
          </div>
        )}
        <ThemeToggle />
        <Link to={withBaseurl(contentsHref, baseurl)} className="qb-icon" title="Contents">
          <span className="sr-only">Contents</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h10" />
          </svg>
        </Link>
      </header>
      <Drawer book={book} slug={slug} open={open} onClose={() => setOpen(false)} />
      <div className="qb-page">{children}</div>
      <footer className="qb-colophon">
        {footer ? <MyST ast={footer} /> : <span>{project?.title}</span>}
        <span className="qb-colophon__made">QuantEcon Book Theme</span>
      </footer>
    </div>
  );
}
