import type { Heading } from '@myst-theme/common';
import { getProjectHeadings } from '@myst-theme/common';
import {
  useBaseurl,
  useLinkProvider,
  useProjectManifest,
  useSiteManifest,
  withBaseurl,
} from '@myst-theme/providers';
import { slugToUrl } from 'myst-common';
import { useEffect } from 'react';
import { TOC_HEADING_ID, TOC_POPOVER_ID } from './contentsDrawer';

type StrictHeading = Omit<Heading, 'level'> & { level: number };
type HeadingGroup = StrictHeading[];

function Section({ group }: { group: HeadingGroup }) {
  const baseurl = useBaseurl();
  const Link = useLinkProvider();
  return (
    <ul>
      {group.map((heading) => (
        <li
          className="my-[6px] font-light text-qetext-light dark:text-qetext-dark opacity-80 dark:bg-opacity-100"
          key={heading.slug ?? heading.title}
        >
          {heading.slug ? (
            <Link to={withBaseurl(`/${slugToUrl(heading.slug)}`, baseurl)}>
              {heading.enumerator ? `${heading.enumerator}. ` : ''}
              {heading.title}
            </Link>
          ) : (
            <span>
              {heading.enumerator ? `${heading.enumerator}. ` : ''}
              {heading.title}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Closes the drawer when a modal dialog opens.
 *
 * A popover lives in the browser's top layer, which paints above every
 * z-indexed element — including the search dialog's backdrop (`z-[1000]`) and
 * panel. Light dismiss does not help: it fires on pointerdown, and the search
 * hotkey (Cmd/Ctrl+K) is a keydown, so the drawer would stay open above the
 * modal, un-dimmed, with its links dead under the dialog's pointer-events lock.
 *
 * Radix portals the dialog into a container appended directly to <body>, so a
 * shallow childList observer on <body> is enough — no subtree walk on every
 * mutation. Any `role="dialog"` counts: a modal opening over an open drawer is
 * wrong regardless of which dialog it is.
 */
function useCloseOnDialogOpen(popoverId: string) {
  useEffect(() => {
    const drawer = document.getElementById(popoverId);
    if (!drawer || typeof drawer.hidePopover !== 'function') return;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches('[role="dialog"]') || node.querySelector('[role="dialog"]')) {
            drawer.hidePopover(); // no-op when already closed
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true });
    return () => observer.disconnect();
  }, [popoverId]);
}

export function ContentsSidebar() {
  useCloseOnDialogOpen(TOC_POPOVER_ID);
  const config = useSiteManifest();
  const project = useProjectManifest();
  const baseurl = useBaseurl();
  const Link = useLinkProvider();

  if (!config) return null;

  const contents = getProjectHeadings(config, project?.slug, {
    addGroups: false,
  });

  const headings = (contents ?? [])
    ?.filter((heading): heading is StrictHeading => heading.level !== 'index')
    .filter((heading) => heading.level < 3)
    .reduce<(StrictHeading | HeadingGroup)[]>(
      (acc, heading, idx) => {
        if (idx === 0) {
          return [heading];
        } else if (heading.level === 1) {
          return [...acc, heading];
        }
        const last = acc[acc.length - 1];
        const item = heading;
        if (Array.isArray(last)) {
          last.push(item);
          return acc;
        } else {
          return [...acc, [item]];
        }
      },
      [] as (StrictHeading | HeadingGroup)[]
    );

  return (
    // A popover: the browser owns the open/closed state, so there is none in
    // React and the drawer works before hydration. All presentation lives in
    // `.qe-toc` (styles/app.css).
    <div id={TOC_POPOVER_ID} popover="auto" className="qe-toc">
      {/* A styled div, not a heading: the drawer precedes every page's <h1>
          in DOM order, so an <h2> here would invert heading-order navigation
          whenever the drawer is open. */}
      <div id={TOC_HEADING_ID} className="mb-4 text-lg font-bold">
        Contents
      </div>
      {/* Labelled by the title above, not a second `aria-label` — the toggle
          is already named "Table of contents"; don't repeat it here. */}
      <nav aria-labelledby={TOC_HEADING_ID}>
        {headings?.map((headingOrGroup) => {
          if (Array.isArray(headingOrGroup))
            return (
              <Section
                key={headingOrGroup[0].slug ?? headingOrGroup[0].title}
                group={headingOrGroup}
              />
            );
          // A top-level entry with a slug is a real page (e.g. a flat TOC) and
          // must be navigable; without one it is a pure grouping title.
          return (
            <p
              className="mt-5 mb-4 text-lg font-semibold text-qetext-light dark:text-qetext-dark"
              key={headingOrGroup.slug ?? headingOrGroup.title}
            >
              {headingOrGroup.slug ? (
                <Link to={withBaseurl(`/${slugToUrl(headingOrGroup.slug)}`, baseurl)}>
                  {headingOrGroup.title}
                </Link>
              ) : (
                headingOrGroup.title
              )}
            </p>
          );
        })}
      </nav>
    </div>
  );
}
