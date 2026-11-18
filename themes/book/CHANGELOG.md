# Changelog — QuantEcon book theme

All notable changes to the book theme (`themes/book`, released as
`quantecon-theme-book.zip` on `book-vX.Y.Z` tags) are recorded here, in the
[Keep a Changelog](https://keepachangelog.com/) format. The lecture theme
keeps its own changelog in `themes/lecture/CHANGELOG.md`.

## [Unreleased]

### Added

- Admonitions of every kind in the environments' language: an italic label
  and a hairline rule in the kind's hue, no fill or icon, in five colour
  families. Collapsible admonitions and `{dropdown}` fold with the
  environments' ▸ / ▾. A new `--qb-c-danger` token, AA in light and dark,
  colours danger and error ([#282](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/282)).
- Citations in every form set upright in the text colour with a dotted
  hairline, and the references as author–year entries with a hanging indent
  ([#282](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/282)).
- Hover cards for citations, footnotes and cross-references to equations,
  figures, tables, environments and sections, on the paper with a hairline
  border ([#282](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/282)).
- The search dialog in the Manuscript style ([#282](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/282)).
- Behavioural tests for each of these on the fixture book, which gains a
  bibliography, admonitions, a labelled equation, figure and table, and an
  aside ([#282](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/282)).

### Changed

- Exercises and solutions no longer share their rule with admonitions; they
  look as before ([#282](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/282)).
- Footnote marks are small mono numerals; the footnotes and the references
  each sit under a mono kicker ([#282](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/282)).
- Margin notes show their hairline in the gutter, and below 1080px take a
  clay rule rather than a filled box ([#282](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/282)).

## [0.1.0] - unreleased

### Added

- The book theme in the Manuscript direction: Newsreader and IBM Plex Mono,
  self-hosted; warm paper in light and dark; the cover, contents, chapter and
  code page types; a Part › Chapter › Section breadcrumb over a contents
  drawer; a right gutter for margin notes; understated theorem environments.
- Proof headers take the kind's numbering template ("Fact 2.2.1"), as
  QuantEcon/myst-theme `qe-v1` does (see QuantEcon/mystmd#149).
- Fancy ordered lists ((a), (i), iv.) rendered natively, so a book needs no
  fancy-lists plugin.
- `default_color_scheme` (`light` by default), replacing the converted
  editions' `light_default.py` rewrite of the built pages.
- `citation_*` meta for Google Scholar and reference managers.
- The cover's drawn book takes the project's `thumbnail` as its cover art.
- PR previews build *Economic Networks* with the book theme, at
  `pr-preview/pr-<n>/book/` beside the lecture preview
  ([#271](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/271)).
