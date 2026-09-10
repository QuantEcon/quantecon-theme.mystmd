import classNames from 'classnames';
import { Author } from '@myst-theme/frontmatter';
import type { Affiliation, Contributor } from 'myst-frontmatter';
import React from 'react';
import { useBaseurl, useLinkProvider } from '@myst-theme/providers';
import { PageHeaderHistory } from './PageHeaderHistory';
import type { Person } from '~/i18n';

/**
 * Names joined the way the authors line joins them: "A", "A and B",
 * "A, B and C". Linked when the person has a URL; no `rel="author"`, which
 * is reserved for the authors so crawlers can tell the two apart.
 */
function PeopleList({ people, linkClassName }: { people: Person[]; linkClassName?: string }) {
  return (
    <>
      {people.map((person, i) => {
        const separator = i === 0 ? '' : i === people.length - 1 ? ' and ' : ', ';
        return (
          <span key={`${person.name}-${i}`}>
            {separator}
            {person.url ? (
              <a href={person.url} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                {person.name}
              </a>
            ) : (
              person.name
            )}
          </span>
        );
      })}
    </>
  );
}

export function ProjectFrontmatter({
  className,
  projectTitle,
  pageTitle,
  authors,
  affiliations,
  translators,
  translatorsLabel,
}: {
  className?: string;
  projectTitle: string;
  pageTitle?: string;
  authors?: Contributor[];
  affiliations?: Affiliation[];
  /** Translators of this page's edition (#143); nothing renders when empty. */
  translators?: Person[];
  /** Label introducing the translators, in the edition's language; '' omits it. */
  translatorsLabel?: string;
}) {
  const hasTranslators = !!translators && translators.length > 0;
  const baseurl = useBaseurl();
  const Link = useLinkProvider();
  return (
    <div
      className={classNames(
        // When the changelog is open its panel is the last thing in this
        // block, and the bottom padding is dropped so the blue divider becomes
        // the panel's own bottom edge (the tidier "integrated" look of the
        // Sphinx book-theme header, keeping the blue on the bottom).
        `col-body border-b-[5px] border-b-qeborder-blue space-y-1
         pb-4 has-[[data-qe-history-panel]]:pb-0`,
        className
      )}
    >
      <div>
        <div
          aria-label="Book title"
          className={classNames('block font-bold lg:inline prose-a:text-inherit', {
            'text-lg': pageTitle,
            'text-4xl': !pageTitle,
            'me-4': pageTitle,
          })}
        >
          <Link to={baseurl ?? '/'}>{projectTitle}</Link>
        </div>
        {pageTitle && (
          <div className="block text-lg lg:inline" aria-label="Page title">
            {pageTitle}
          </div>
        )}
      </div>
      {/* Authors on the left, the "Last changed" control aligned to the right
          on the same row (more semantic, saves a header line); it wraps below
          authors on narrow viewports. PageHeaderHistory is `display: contents`,
          so its trigger right-aligns itself here and its expanded changelog
          wraps onto a full-width line underneath — still inside this bordered
          block, so opening it pushes the blue divider down. `empty:hidden`
          keeps pages with neither authors nor git metadata from gaining a row. */}
      <div className="flex items-baseline gap-x-4 gap-y-1 flex-wrap empty:hidden">
        {authors && (
          <div aria-label="Author names and links">
            {authors.reduce<React.ReactNode>((acc, a, i, authors) => {
              let chunk: React.ReactNode = a.name;
              if (a.url) {
                chunk = (
                  <Author
                    className="text-[102%] font-[400] text-sky-500"
                    author={a}
                    affiliations={affiliations}
                  />
                );
              }
              if (i > 0 && i < authors.length - 1) {
                chunk = <>, {chunk}</>;
              } else if (i === authors.length - 1 && authors.length > 1) {
                chunk = <> and {chunk}</>;
              }
              return (
                <span key={a.id ?? a.name ?? i}>
                  {acc}
                  {chunk}
                </span>
              );
            }, '')}
          </div>
        )}
        {/* Translators (#143). Same row as the "Last changed" control, at the
            end, as the book theme places them since v0.22.0 -- a fourth
            stacked header line read as clutter there. This block takes the
            `ms-auto` and the history control sits beside it; on narrow
            viewports the row wraps. Distinct class from the authors line and
            no `rel="author"` on the links, so the two are never confused. A
            <div>, not a <p>: `.article p` sets a 1em margin that a utility
            cannot beat. */}
        {hasTranslators && (
          <div
            className="qe-page__header-translators ms-auto text-[0.85rem] text-qetext-light/70 dark:text-qetext-dark-muted"
            aria-label="Translator names and links"
          >
            {translatorsLabel && (
              <span className="qe-page__header-translators-label">{translatorsLabel} </span>
            )}
            <PeopleList people={translators} linkClassName="text-sky-500 hover:underline" />
          </div>
        )}
        <PageHeaderHistory alignEnd={!hasTranslators} />
      </div>
    </div>
  );
}
