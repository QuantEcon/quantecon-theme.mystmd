/**
 * Landing-page table of contents: renders the `{tableofcontents}`
 * directive's `toc:project` block to match the existing lecture sites —
 * section titles as headings with the section's lectures listed under them,
 * entries as "1. About These Lectures", no bullets (styles/front-toc.css).
 *
 * The CLI's toc transform has already flattened the directive into a plain
 * nested list whose link text bakes the enumerator in without a period
 * ("1 About These Lectures") and whose section titles are bare text nodes.
 * Instead of re-parsing that, the component rebuilds the TOC from the site
 * manifest — the same source ContentsSidebar.tsx uses — where `enumerator`
 * is a separate field and sections are headings without a slug.
 *
 * Semantics deliberately improve on the old quantecon-book-theme markup:
 * real `<h2>` elements (the old theme faked them with
 * `<p role="heading" aria-level="2">`) inside a labelled `<nav>`, each with
 * a stable id, so they land in the document outline and are deep-linkable.
 */
import classNames from 'classnames';
import type { GenericNode } from 'myst-common';
import { slugToUrl } from 'myst-common';
import { getProjectHeadings } from '@myst-theme/common';
import {
  useBaseurl,
  useLinkProvider,
  useProjectManifest,
  useSiteManifest,
  withBaseurl,
} from '@myst-theme/providers';
import { Block } from 'myst-to-react';
import type { TocEntry } from '../tocTree';
import { buildTocTree, tocLabel, tocSegments } from '../tocTree';

// Upstream types `Block`'s node as `GenericParent`; renderer props carry
// `GenericNode`. Same cast STDERR_RENDERERS (app/renderers.tsx) uses.
const UpstreamBlock = Block as (props: { node: GenericNode; className?: string }) => JSX.Element;

function TocList({ entries }: { entries: TocEntry[] }) {
  const baseurl = useBaseurl();
  const Link = useLinkProvider();
  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.slug ?? entry.htmlId ?? entry.title}>
          {entry.slug ? (
            <Link to={withBaseurl(`/${slugToUrl(entry.slug)}`, baseurl)}>{tocLabel(entry)}</Link>
          ) : (
            // A nested captionless group (depth ≥ 2 in the project toc).
            // Only top-level sections get real headings; promoting deeper
            // groups would need level bookkeeping no lecture repo exercises.
            tocLabel(entry)
          )}
          {entry.children.length > 0 && <TocList entries={entry.children} />}
        </li>
      ))}
    </ul>
  );
}

export function ProjectTOCBlock({ node, className }: { node: GenericNode; className?: string }) {
  const config = useSiteManifest();
  const project = useProjectManifest();
  const headings = config
    ? getProjectHeadings(config, project?.slug, { addGroups: false })
    : undefined;
  const segments = tocSegments(buildTocTree(headings ?? []));
  // No manifest in this render context, or nothing to list: fall back to the
  // CLI's baked list so the directive never renders as a hole in the page.
  if (segments.length === 0) return <UpstreamBlock node={node} className={className} />;
  return (
    <nav
      aria-label="Table of contents"
      id={node.html_id}
      className={classNames('qe-front-toc', className)}
    >
      {segments.map((segment) =>
        segment.kind === 'section' ? (
          <section key={segment.entry.htmlId} aria-labelledby={segment.entry.htmlId}>
            {/* The `.heading-text` span is upstream's outline contract:
                useHeaders drops any heading without one (DocumentOutline's
                `.filter((h) => !!h.text)`), and myst's own heading renderer
                always emits it. */}
            <h2 id={segment.entry.htmlId}>
              <span className="heading-text">{tocLabel(segment.entry)}</span>
            </h2>
            {segment.entry.children.length > 0 && <TocList entries={segment.entry.children} />}
          </section>
        ) : (
          <TocList key={segment.entries[0].slug} entries={segment.entries} />
        )
      )}
    </nav>
  );
}
