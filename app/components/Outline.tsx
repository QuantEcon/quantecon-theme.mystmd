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
 *  - h3 entries are included and always visible (Sphinx collapses them to the
 *    active branch under `contents_autoexpand`; that is a deliberate
 *    simplification recorded on #182, with the collapse as a possible
 *    follow-up), so the panel is capped and scrolls internally past its
 *    `max-height`.
 *  - Enumerators come from the heading itself: myst-to-react renders the
 *    section number in a `span.select-none` beside `.heading-text` ("3.1",
 *    no period), and the entry adds the period the page's own h1 and the
 *    Sphinx panel use ("3.1. Overview"). With no numbering configured the
 *    entry is the bare title -- never a number computed from the list index,
 *    which was wrong as soon as h3s were present.
 *  - The logo sits above the list, smaller (#96); "Powered by" stays below.
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
  return (
    <div className={classNames('relative self-start', containerClassName)}>
      <nav
        aria-label="On this page"
        className={classNames('qe-outline not-prose', innerClassName)}
      >
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
        {headings.length > 0 && (
          <>
            <p className="qe-outline__title">On this page</p>
            <ul className="qe-outline__list">
              {headings.map((h) => {
                const enumerator = h.element
                  .querySelector('span.select-none')
                  ?.textContent?.trim();
                const active = h.id === currentId;
                return (
                  <li
                    key={`outline-li-${h.id}`}
                    className={classNames({ 'qe-outline__sub': h.level > 1 })}
                  >
                    <Link to={`#${h.id}`} aria-current={active ? 'location' : undefined}>
                      {enumerator ? `${enumerator}. ${h.title}` : h.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <p className="qe-outline__powered">
          Powered by <a href="https://mystmd.org">MyST Markdown</a>
        </p>
      </nav>
    </div>
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
