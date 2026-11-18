# Changelog — QuantEcon book theme

All notable changes to the book theme (`themes/book`, released as
`quantecon-theme-book.zip` on `book-vX.Y.Z` tags) are recorded here, in the
[Keep a Changelog](https://keepachangelog.com/) format. The lecture theme
keeps its own changelog in `themes/lecture/CHANGELOG.md`.

## [Unreleased]

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
- PR previews build *Economic Networks* with the book theme, at
  `pr-preview/pr-<n>/book/` beside the lecture preview
  ([#271](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/271)).
