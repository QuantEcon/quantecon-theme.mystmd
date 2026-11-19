import React from 'react';
import { useGridSystemProvider, useReferences } from '@myst-theme/providers';
import { HashLink, MyST } from 'myst-to-react';
import { collect } from '../mdast';

/**
 * The chapter's footnotes, headed "Notes" as the Manuscript design's
 * chapter.html heads them. It is upstream's `Footnotes` (@myst-theme/site)
 * with that one word changed: the same section, ids and classes, so the
 * footnote marks' links and the theme's `.qb-notes` rules apply unchanged.
 */
export function Notes({ containerClassName }: { containerClassName?: string }) {
  const references = useReferences();
  const grid = useGridSystemProvider();
  const defs = collect(references?.article, 'footnoteDefinition');
  const refs = collect(references?.article, 'footnoteReference');
  if (defs.length === 0) return null;
  return (
    <section
      id="footnotes"
      className={['myst-footnotes', grid, 'subgrid-gap col-screen', containerClassName].filter(Boolean).join(' ')}
    >
      <div>
        <header className="myst-footnotes-header text-lg font-semibold text-stone-900 dark:text-white group">
          Notes
          <HashLink id="footnotes" title="Link to Notes" hover className="ml-2" />
        </header>
      </div>
      <div className="myst-footnotes-list pl-3 mb-8 text-xs text-stone-500 dark:text-stone-300">
        <ol>
          {defs.map((fn) => (
            <li key={fn.key} id={`fn-${fn.identifier}`} className="myst-footnotes-item group">
              <div className="flex flex-row">
                <div className="myst-footnote-content break-words grow">
                  <MyST ast={fn.children} />
                </div>
                <div className="myst-footnote-backlinks flex flex-col grow-0">
                  {refs
                    .filter((ref) => ref.identifier === fn.identifier)
                    .map((ref) => (
                      <HashLink
                        key={ref.key}
                        id={`fnref-${ref.key}`}
                        title="Link to Content"
                        hover="desktop"
                        className="p-1"
                        children="↩"
                        scrollBehavior="instant"
                      />
                    ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
