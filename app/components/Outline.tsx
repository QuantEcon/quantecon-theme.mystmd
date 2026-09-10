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
          {/* Label matches the Sphinx build's back-to-top button exactly:
              U+2191 + space + "Top". `aria-label` is deliberately kept -- the
              Sphinx original leans on `title` alone, which screen readers
              announce inconsistently, so the visible label can shorten without
              the accessible name going with it.
              A plain fragment link, not the provider `Link`: this control is
              rendered server-side, and the provider resolved `#top` against
              the un-slashed SSR pathname while the outline (built after mount)
              resolved against the slashed one -- so on the deployed lecture
              sites "Top" was the one in-page control that left the document
              (301 + full reload, #186). A bare `href="#top"` is what the Sphinx
              build renders and never needs path resolution. */}
          <a href="#top" title="Back to top" aria-label="Back to top">
            ↑ Top
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * The right-hand "On this page" panel (#182). Pinned, scroll-tracking and
 * nested, matching the Sphinx build's `sticky_contents` panel:
 *
 *  - The current entry is chosen by `useActiveHeading`, a port of the Sphinx
 *    build's scrollspy rule (the last heading whose top has passed 120px
 *    from the viewport top; the final one within 50px of the page bottom),
 *    rather than by `useHeaders`' own `activeId`. That id is computed from an
 *    IntersectionObserver pass against the theme's navbar offset, and in this
 *    theme the hook reads that offset as 0 (measured on the fixture: the
 *    topmost heading in the upper third wins, even one hidden under the
 *    navbar), so the deployed sites' rule is both more predictable and the
 *    parity target.
 *  - Pinning is `position: fixed` in styles/quantecon.css (`.qe-outline`), not
 *    `sticky`: the wrapper is `self-start`, so a sticky child would have zero
 *    travel, and the grid declares no rows for it to span. `left`/`right` stay
 *    `auto`, so the panel keeps its static position in the margin track.
 *  - h3 entries nest under their h2 and collapse to the active branch, as the
 *    Sphinx panel does under `contents_autoexpand` (on by default there and
 *    on every lecture site): at the top of the page only the sections show;
 *    scrolling into a section expands its subsections, the current one
 *    (section or subsection) is marked, and the parent of a current
 *    subsection is expanded but not marked. Past `max-height` the panel
 *    scrolls internally.
 *  - Enumerators come from the heading itself (`span.select-none`, "3.1"),
 *    plus the period the h1 and the Sphinx panel use -- never a number
 *    computed from the list index, which was wrong as soon as h3s existed.
 *  - The logo sits below the list and above "Powered by", where the Sphinx
 *    panel keeps it (decided on review of #196); smaller, per #96.
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
  // Sphinx's autoexpand: the current item's own sub-list, and every ancestor
  // of the current item, are expanded; nothing else is.
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
  // The heading's own enumerator ("3.1"), plus the period the h1 and the
  // Sphinx panel use; the bare title when the project sets no numbering.
  const enumerator = heading.element.querySelector('span.select-none')?.textContent?.trim();
  return (
    <Link to={`#${heading.id}`} aria-current={heading.id === currentId ? 'location' : undefined}>
      {enumerator ? `${enumerator}. ${heading.title}` : heading.title}
    </Link>
  );
}

/** Sphinx's `scrollspy.js` constants: a section is current once its heading
 *  has passed this many px from the top; the last section is forced current
 *  this close to the page bottom. */
const ACTIVATION_OFFSET_PX = 120;
const BOTTOM_THRESHOLD_PX = 50;

/**
 * The id of the heading the reader is in, by the Sphinx rule: the last heading
 * whose top is at or above the activation line, or the last heading of all
 * once the page is scrolled to its bottom. Nothing is current above the first
 * heading. Recomputed on scroll and resize, one read per animation frame.
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
