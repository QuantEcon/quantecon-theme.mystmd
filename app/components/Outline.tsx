import { useBaseurl, useLinkProvider, withBaseurl } from '@myst-theme/providers';
import { useHeaders } from '@myst-theme/site';
import classNames from 'classnames';
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

export function Outline({
  containerClassName,
  innerClassName,
  pageEnumerator,
}: {
  containerClassName?: string;
  innerClassName?: string;
  pageEnumerator?: string;
}) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const { headings } = useHeaders('main h2', 3);
  return (
    <div className={classNames('relative self-start', containerClassName)}>
      <nav
        className={classNames(
          'absolute inset-0 not-prose space-y-6 text-opacity-80 dark:font-semibold',
          innerClassName
        )}
      >
        {headings.length > 0 && (
          <>
            <p className="mb-4 text-lg font-bold text-opacity-100 dark:text-qetext-dark">
              On this page
            </p>
            <ul className="space-y-2 font-light not-prose">
              {headings.map((h, i) => (
                <li key={`outline-li-${h.id}`}>
                  <Link to={`#${h.id}`}>
                    {pageEnumerator ? `${pageEnumerator}.${i + 1}. ${h.title}` : h.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        <div>
          <img
            className="dark:hidden"
            src={withBaseurl('/logos/qe-logo.png', baseurl)}
            alt="QuantEcon Logo"
            width={150}
          />
          <img
            className="hidden dark:block"
            src={withBaseurl('/logos/quantecon-logo-transparent.png', baseurl)}
            alt="QuantEcon Logo (dark-mode)"
            width={150}
          />
        </div>
        <p className="text-sm">
          Powered by <a href="https://mystmd.org">MyST Markdown</a>
        </p>
      </nav>
    </div>
  );
}
