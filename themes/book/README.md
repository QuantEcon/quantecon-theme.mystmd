# QuantEcon book theme (`themes/book`)

The QuantEcon book theme for MyST, in the **Manuscript** direction of
[QuantEcon/demo-book-theme-designs](https://github.com/QuantEcon/demo-book-theme-designs).
It is `@quantecon/book-theme`, a Remix app on the shared
[`packages/common`](../../packages/common), and ships as
`quantecon-theme-book.zip` on its own `book-vX.Y.Z` tag series.

## Using it

```yaml
# myst.yml
site:
  template: https://github.com/QuantEcon/quantecon-theme.mystmd/releases/download/book-vX.Y.Z/quantecon-theme-book.zip
```

No release has been cut yet; to try a local build, run `make build-book` at
the repository root and point `site.template` at `.deploy/quantecon-theme-book`.

The theme is built for the QuantEcon mystmd fork's book mode (`numbering.book`,
chapter enumerators, the `(i)`/`(a)` list parser), which the converted editions
use, and runs on any mystmd that runs the lecture theme.

## Page types

| Page | What it shows | Comes from |
| ---- | ------------- | ---------- |
| **Cover** | title and subtitle (split at the title's colon), authors with affiliations, *Read online* (to the contents page, or the first page without one) / *Download PDF* / *Source*, a drawn book (with the project's `thumbnail` as its cover art, when it has one), a strip of facts, the index page's text, and a card per chapter | the project's index page and `myst.yml` (`authors`, `downloads`, `github`, `doi`, `venue`, `thumbnail`) |
| **Contents** | front matter in roman numerals, the parts and chapters with their one-line glosses, the appendices | a page with the slug `contents` (or `layout: contents` under `site:`), listed in the toc. Glosses are each page's `description`. Print page numbers are not shown |
| **Chapter** | eyebrow (the part), chapter numeral, title, lede (`subtitle` or `description`), the text, previous / next | every other page |
| **Chapter with code** | the same, with code cards: language, file name, copy button, highlighting in the theme's palette | `code` blocks, any language; Python, Julia, R, shell, JavaScript, JSON, YAML and LaTeX are highlighted |

Around every page: a masthead with a burger for the contents drawer, the
breadcrumb Part ▾ › Chapter ▾ › Section ▾ (each a menu of its siblings, the
section crumb following the reading position), search, the light/dark toggle
and a link to the contents. On wide screens the text column has a 16rem right
gutter, where MyST `margin`/`aside` content sits.

The parts come from the `myst.yml` toc groups: a group whose title or
`section:` says front or back matter is numbered in roman numerals, an
appendix group in letters (unless the pages carry enumerators, as in book
mode), anything else is a part. "Part I", "Part II" labels appear only when a
book has more than one titled part.

## Reading furniture

Inside a chapter, the elements a reader meets are set in the same language
as the theorem environments: understated, with italic labels and hairline
rules in an element's hue, and no heavy fills.

| Element | How it looks | MyST |
| ------- | ------------ | ---- |
| **Admonitions** | an italic label and a 1.5px rule in the kind's hue, no fill or icon. Five families: blue (note, seealso, a generic `{admonition}`), green (tip, hint), clay (important), amber (attention, caution, warning) and red (danger, error) | every `{note}`-style kind and `{admonition}` |
| **Collapsible admonitions and dropdowns** | the same label, followed by ▸ / ▾ as on a folded environment; a dropdown takes the proof's grey | `:class: dropdown`, `{dropdown}` |
| **Exercises and solutions** | a hairline rule and a mono clay label (unchanged) | `{exercise}`, `{solution}` |
| **Citations** | upright, in the text colour, with a dotted hairline in the link hue; a hover card with the reference | `{cite}`, `{cite:p}`, `{cite:t}`, `{cite:author}`, `{cite:year}` |
| **References** | unnumbered author–year entries with a hanging indent, under a mono kicker and one hairline | the page's bibliography |
| **Cross-references** | links with a dotted hairline, and a hover card previewing the target as it is set in the text | `{eq}`, `{numref}`, `{ref}`, `{prf:ref}`, to equations, figures, tables, environments and sections |
| **Footnotes** | a small mono numeral in the house blue, with a hover card; the notes under a mono kicker and one hairline | `[^label]` |
| **Margin notes** | small and muted in the 16rem gutter, set off by a hairline; below 1080px, in the column with a clay rule | `{margin}`, `{aside}` |
| **Search** | the shared search dialog on the paper, with the body face and ruled results | the masthead's search button, or Ctrl/⌘ K |

Hover cards are a sheet of the paper with a hairline border, the theme's
shadow and a blue rule down the left edge. All of this is CSS in
[`styles/book.css`](./styles/book.css), scoped to the book; the shared
components in `packages/common` are not changed.

## What a book no longer needs

- **`fancy-lists.mjs` and `fancy-lists.css`.** `(i)`, `(a)` and `iv.` lists
  render with their markers natively (the lecture theme's list renderer, now
  shared).
- **`light_default.py`.** Light is the default; `site.options.default_color_scheme`
  takes `light`, `dark` or `system`. The reader's own choice still wins.
- **QuantEcon/myst-theme `qe-v1`.** Proof headers take the kind's numbering
  template, so `numbering: {proof:property: {template: 'Fact %s'}}` heads the
  environment "Fact 2.2.1" (see QuantEcon/mystmd#149).

It adds `citation_*` meta (title, authors, publisher, DOI, PDF; a chapter as
`citation_inbook_title` of the book) for Google Scholar and reference managers.

## Site options

Declared in [`template.yml`](./template.yml) (the CLI drops anything else):
`default_color_scheme`, `masthead_title`, `series`, `license_label`, `style`
(a stylesheet of the book's own), `numbered_references`, the meta options
`twitter`, `site_url`, `og_logo_url`, `twitter_logo_url`, `favicon`, the
analytics keys, `hide_search`, and the per-page `layout`.

## Design tokens

Every colour, face and measure is a `--qb-*` custom property in
[`styles/manuscript.css`](./styles/manuscript.css); the components in
[`styles/book.css`](./styles/book.css) use nothing else. Another direction
would be a sibling token file imported in its place. There is no direction
switcher.

## Development

```sh
npm ci                      # at the repository root
make build-book             # → .deploy/quantecon-theme-book
npm run test:unit -w themes/book
```

The unit tests cover the book structure (`app/bookNav.ts`, in both the
QuantEcon fork's and upstream mystmd's manifest shapes) and the citation meta
(`app/citation.ts`).

The behavioural suite builds the fixture book in `tests/fixture` with the
`myst` on `PATH` and checks each page type, the breadcrumb, the drawer, the
environments, the code cards, the colour-scheme default, a clean hydration,
and each element of the reading furniture: present, styled by the book's
rules, its hover card opening, and no page errors (no pixel snapshots):

```sh
make build-book
cd themes/book
THEME_TEMPLATE="$PWD/../../.deploy/quantecon-theme-book" npm run test:e2e
```

CI runs it as the `book` job.
