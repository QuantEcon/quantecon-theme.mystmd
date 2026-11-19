import React, { useEffect, useRef, useState } from 'react';
import { useBaseurl, useLinkProvider, withBaseurl } from '@myst-theme/providers';
import { locate, type Book, type BookChapter, type BookGroup } from '~/bookNav';
import type { PageType } from './BookShell';

/** A numbered section of the current chapter, for the section crumb. */
export type Section = { id: string; num?: string; title: string };

/**
 * The masthead breadcrumb, Part ▾ › Chapter ▾ › Section ▾ (the Manuscript
 * design's booknav.js). Each crumb opens a menu of its siblings, so a reader
 * can move a level at a time; the section crumb follows the reading position.
 * On the cover and the contents page there is one crumb holding the whole
 * book.
 *
 * Menus are lists of links, not ARIA menus: they navigate, and a list of
 * links is what assistive technology expects for that.
 */
function Crumb({
  id,
  label,
  num,
  open,
  onToggle,
  modifier,
  children,
}: {
  id: string;
  label: string;
  num?: string;
  open: boolean;
  onToggle: (id: string) => void;
  modifier?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`qb-crumb${modifier ? ` qb-crumb--${modifier}` : ''}`}>
      <button
        type="button"
        className="qb-crumb__btn"
        aria-expanded={open}
        aria-controls={`qb-crumb-${id}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(id);
        }}
      >
        {num && <span className="qb-num">{num}</span>}
        <span className="qb-crumb__lbl">{label}</span>
        <svg className="qb-crumb__car" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div id={`qb-crumb-${id}`} className="qb-crumb__menu" data-open={open ? '' : undefined} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

function Item({
  to,
  num,
  title,
  desc,
  current,
  muted,
  onClick,
}: {
  to: string;
  num?: string;
  title: string;
  desc?: string;
  current?: boolean;
  muted?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const inner = (
    <>
      <span className="qb-num">{num || '·'}</span>
      <span>
        <span>{title}</span>
        {desc && <span className="qb-crumb__desc">{desc}</span>}
      </span>
    </>
  );
  const className = `qb-crumb__item${muted ? ' qb-crumb__item--muted' : ''}`;
  if (to.startsWith('#')) {
    return (
      <a href={to} className={className} aria-current={current ? 'true' : undefined} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={withBaseurl(to, baseurl)} className={className} {...({ 'aria-current': current ? 'page' : undefined } as any)}>
      {inner}
    </Link>
  );
}

function groupHeading(g: BookGroup) {
  return [g.label, g.title].filter(Boolean).join(' · ') || 'Contents';
}

function FullContents({ book, slug }: { book: Book; slug?: string }) {
  return (
    <>
      {book.groups.map((g) => (
        <React.Fragment key={g.id}>
          <p className="qb-crumb__ghdr">{groupHeading(g)}</p>
          {g.chapters.map((c) => (
            <Item key={c.slug} to={`/${c.slug}`} num={c.num} title={c.title} current={c.slug === slug} muted={g.kind === 'matter'} />
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

/**
 * The section the reader is in: the last section heading above a line
 * 120px below the masthead. Computed from scroll position rather than an
 * IntersectionObserver, which only reports crossings and so misses a jump
 * straight past a heading (a link, a search result, a reload mid-chapter).
 */
function useCurrentSection(sections: Section[]) {
  const [current, setCurrent] = useState<string | undefined>(sections[0]?.id);
  useEffect(() => {
    if (!sections.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let id = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) id = s.id;
      }
      setCurrent(id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);
  return current;
}

export function Breadcrumbs({
  book,
  type,
  slug,
  sections = [],
}: {
  book: Book;
  type: PageType;
  slug?: string;
  sections?: Section[];
}) {
  const [open, setOpen] = useState<string | undefined>();
  const ref = useRef<HTMLElement>(null);
  const currentSection = useCurrentSection(sections);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(undefined);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(undefined);
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  // A navigation closes any open menu.
  useEffect(() => setOpen(undefined), [slug]);

  const toggle = (id: string) => setOpen(open === id ? undefined : id);
  const { group, chapter } = locate(book, slug) as { group?: BookGroup; chapter?: BookChapter };

  if (type !== 'chapter' || !group || !chapter) {
    return (
      <nav className="qb-crumbs" aria-label="Breadcrumb" ref={ref}>
        <Crumb id="toc" label={type === 'cover' ? 'Browse the book' : 'Jump to a chapter'} open={open === 'toc'} onToggle={toggle}>
          <FullContents book={book} slug={slug} />
        </Crumb>
      </nav>
    );
  }

  const section = sections.find((s) => s.id === currentSection) ?? sections[0];
  return (
    <nav className="qb-crumbs" aria-label="Breadcrumb" ref={ref}>
      <Crumb id="part" modifier="part" label={group.label || group.title || 'Contents'} open={open === 'part'} onToggle={toggle}>
        <p className="qb-crumb__ghdr">Jump to part</p>
        {book.groups.map((g) => (
          <Item
            key={g.id}
            to={`/${g.chapters[0].slug}`}
            num={g.label ? g.label.replace(/^Part\s+/, '') : '·'}
            title={g.title || g.chapters[0].title}
            current={g.id === group.id}
            muted={g.kind === 'matter'}
          />
        ))}
      </Crumb>
      <span className="qb-crumb__sep" aria-hidden="true">›</span>
      <Crumb id="chap" modifier="chap" label={chapter.title} num={chapter.num} open={open === 'chap'} onToggle={toggle}>
        <p className="qb-crumb__ghdr">{groupHeading(group)}</p>
        {group.chapters.map((c) => (
          <Item key={c.slug} to={`/${c.slug}`} num={c.num} title={c.title} desc={c.description} current={c.slug === chapter.slug} />
        ))}
      </Crumb>
      {section && (
        <>
          <span className="qb-crumb__sep" aria-hidden="true">›</span>
          <Crumb id="sec" modifier="sec" label={section.title} num={section.num} open={open === 'sec'} onToggle={toggle}>
            <p className="qb-crumb__ghdr">On this page</p>
            {sections.map((s) => (
              <Item key={s.id} to={`#${s.id}`} num={s.num} title={s.title} current={s.id === section.id} onClick={() => setOpen(undefined)} />
            ))}
          </Crumb>
        </>
      )}
    </nav>
  );
}
