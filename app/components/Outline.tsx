import { useBaseurl, useLinkProvider, withBaseurl } from '@myst-theme/providers';
import { useHeaders } from '@myst-theme/site';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import useScroll from '~/hooks/useScroll';

export function BackToTop() {
  const isScrolled = useScroll(80);
  return (
    <div className="fixed bottom-0 left-0 right-0 col-screen not-prose simple-center-grid grid-gap">
      <div className="relative col-margin">
        <p
          className={classNames(
            'qe-back-to-top absolute bottom-0 font-semibold text-md z-[1000] transition-opacity ease-in-out duration-300',
            {
              'opacity-100': isScrolled,
              'opacity-0': !isScrolled,
            }
          )}
        >
          {/* Visible label: U+2191 + space + "Top". `aria-label` is kept
              deliberately -- `title` alone is announced inconsistently by
              screen readers, so the visible label can stay short without the
              accessible name going with it.
              A plain fragment link, not the provider `Link`: this control is
              rendered server-side, where the provider would resolve `#top`
              against the un-slashed SSR pathname rather than the slashed one
              the outline (built after mount) sees -- so on a static host that
              redirects to the slashed URL, "Top" would leave the document
              (301 + full reload) instead of scrolling. A bare `href="#top"`
              never needs path resolution. */}
          <a href="#top" title="Back to top" aria-label="Back to top">
            ↑ Top
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * The right-hand "On this page" panel -- pinned, scroll-tracking and nested:
 *
 *  - The current entry is chosen by `useActiveHeading` (the last heading whose
 *    top has passed 120px from the viewport top; the final one within 50px of
 *    the page bottom) rather than by `useHeaders`' own `activeId`. That id is
 *    computed from an IntersectionObserver pass against the theme's navbar
 *    offset, and in this theme the hook reads that offset as 0 (measured on the
 *    fixture: the topmost heading in the upper third wins, even one hidden
 *    under the navbar), so a fixed scroll offset is the more predictable rule.
 *  - Pinning is `position: fixed` in styles/quantecon.css (`.qe-outline`), not
 *    `sticky`: the wrapper is `self-start`, so a sticky child would have zero
 *    travel, and the grid declares no rows for it to span. `left`/`right` stay
 *    `auto`, so the panel keeps its static position in the margin track.
 *  - h3 entries nest under their h2 and collapse to the active branch: at the
 *    top of the page only the sections show; scrolling into a section expands
 *    its subsections, the current one (section or subsection) is marked, and
 *    the parent of a current subsection is expanded but not marked. Past
 *    `max-height` the panel scrolls internally.
 *  - Enumerators come from the heading itself (`span.select-none`, "3.1"),
 *    plus the period the h1 uses -- never a number computed from the list
 *    index, which miscounts as soon as h3s are listed.
 *  - The logo sits below the list and above "Powered by".
 */
export function Outline({
  containerClassName,
  innerClassName,
}: {
  containerClassName?: string;
  innerClassName?: string;
}) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const { headings } = useHeaders('main h2, main h3', 3);
  const currentId = useActiveHeading(headings);
  const tree = nest(headings);
  // The current item's own sub-list, and every ancestor of the current item,
  // are expanded; nothing else is.
  const expandedId = tree.find(
    (branch) => branch.id === currentId || branch.children.some((c) => c.id === currentId)
  )?.id;
  return (
    <div className={classNames('relative self-start', containerClassName)}>
      <nav
        aria-label="On this page"
        className={classNames('qe-outline not-prose', innerClassName)}
      >
        {headings.length > 0 && (
          <>
            <p className="qe-outline__title">On this page</p>
            <ul className="qe-outline__list">
              {tree.map((branch) => (
                <li
                  key={`outline-li-${branch.id}`}
                  className={classNames({
                    'qe-outline__expanded': branch.children.length > 0 && branch.id === expandedId,
                  })}
                >
                  <Entry heading={branch} currentId={currentId} Link={Link} />
                  {branch.children.length > 0 && (
                    <ul>
                      {branch.children.map((child) => (
                        <li key={`outline-li-${child.id}`} className="qe-outline__sub">
                          <Entry heading={child} currentId={currentId} Link={Link} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="qe-outline__logo">
          <img
            className="dark:hidden"
            src={withBaseurl('/logos/qe-logo.png', baseurl)}
            alt="QuantEcon Logo"
            width={100}
          />
          <img
            className="hidden dark:block"
            src={withBaseurl('/logos/quantecon-logo-transparent.png', baseurl)}
            alt="QuantEcon Logo (dark-mode)"
            width={100}
          />
        </div>
        <p className="qe-outline__powered">
          Powered by <a href="https://mystmd.org">MyST Markdown</a>
        </p>
      </nav>
    </div>
  );
}

type OutlineHeading = { id: string; title: string; level: number; element: HTMLElement };
type Branch = OutlineHeading & { children: OutlineHeading[] };

/** h3s under the h2 before them; a leading h3 with no h2 starts its own branch. */
function nest(headings: OutlineHeading[]): Branch[] {
  const tree: Branch[] = [];
  for (const h of headings) {
    if (h.level > 1 && tree.length > 0) tree[tree.length - 1].children.push(h);
    else tree.push({ ...h, children: [] });
  }
  return tree;
}

function Entry({
  heading,
  currentId,
  Link,
}: {
  heading: OutlineHeading;
  currentId?: string;
  Link: ReturnType<typeof useLinkProvider>;
}) {
  // The heading's own enumerator ("3.1"), plus the period the h1 uses; the
  // bare title when the project sets no numbering.
  const enumerator = heading.element.querySelector('span.select-none')?.textContent?.trim();
  return (
    <Link to={`#${heading.id}`} aria-current={heading.id === currentId ? 'location' : undefined}>
      {enumerator ? `${enumerator}. ${heading.title}` : heading.title}
    </Link>
  );
}

/** From quantecon-book-theme's `scrollspy.js`, as is `useActiveHeading`: a
 *  section is current once its heading has passed this many px from the top;
 *  the last section is forced current this close to the page bottom. */
const ACTIVATION_OFFSET_PX = 120;
const BOTTOM_THRESHOLD_PX = 50;

/**
 * The id of the heading the reader is in: the last heading whose top is at or
 * above the activation line, or the last heading of all once the page is
 * scrolled to its bottom. Nothing is current above the first heading.
 * Recomputed on scroll and resize, one read per animation frame.
 */
function useActiveHeading(headings: { id: string; element: HTMLElement }[]) {
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      if (headings.length === 0) {
        setCurrentId(undefined);
        return;
      }
      const remaining =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      if (remaining <= BOTTOM_THRESHOLD_PX) {
        setCurrentId(headings[headings.length - 1].id);
        return;
      }
      let active: string | undefined;
      for (const h of headings) {
        if (h.element.getBoundingClientRect().top <= ACTIVATION_OFFSET_PX) active = h.id;
        else break;
      }
      setCurrentId(active);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [headings]);
  return currentId;
}
