# Configuration

Everything the theme reads from `site.options` is declared in
[`template.yml`](../template.yml). The MyST CLI validates `site.options` against
that list and **drops any key the template does not declare**, so the list is
the contract, not documentation. Template options are scalar-only (boolean,
string, number, choice, file), so structured values are written as a YAML block
inside a string (`key: |`), which the theme parses.

No option has a default in `template.yml`, deliberately: a declared default is
written into every page's validated `site:` block and would override the
site-wide value. Defaults live in the code that reads each option and are given
below.

## Options

| Option | Type | Scope | Default | Purpose |
| --- | --- | --- | --- | --- |
| `site_url` | string | site | — | the site's public URL, for the canonical link and `og:url` |
| `twitter` | string | site | — | handle for `twitter:site` / `twitter:creator`; `@` optional |
| `og_logo_url` | string | site | — | `og:image` when a page has no thumbnail |
| `twitter_logo_url` | string | site | — | `twitter:image`; falls back to `og_logo_url` |
| `favicon` | file | site | the QuantEcon lectures favicon | served at `/favicon.ico` |
| `analytics_google` | string | site | — | Google Analytics measurement ID |
| `analytics_plausible` | string | site | — | Plausible domain |
| `hide_toc` | boolean | site or page | `false` | hide the contents drawer and its toggle |
| `hide_search` | boolean | site or page | `false` | hide the search control |
| `launch_notebook_repo` | string | site | — | notebook repository (full URL or `org/repo`); no Launch control without it |
| `launch_notebook_branch` | string | site | `main` | notebook repo branch |
| `launch_notebook_dir` | string | site | — | sub-directory of the notebook repo |
| `launch_notebook_source_dir` | string | site | — | prefix stripped from the page path |
| `launch_colab` | boolean | site | `false` | offer Google Colab ([launch](launch.md)) |
| `current_language` | string | site | — | BCP 47 code of this edition |
| `enable_rtl` | boolean | site | `false` | right-to-left layout |
| `languages` | YAML block | site | — | the editions, for the language switcher and `hreflang` |
| `language_switcher_label` | string | site | "Switch language" | the switcher's accessible name |
| `translators` | YAML block | site or page | — | translator credit |
| `translators_label` | string | site or page | "Translated by" | label before the credit |
| `git_metadata` | YAML block | page | — | pins the "Last changed" control by hand |

## Page-level values

A per-page value goes under `site:` in the page's frontmatter (for a notebook,
under `"site"` in the notebook metadata) and is validated against the same
list. Only the keys marked "site or page" or "page" are read per page.

## Other `site` keys the theme uses

| Key | Purpose |
| --- | --- |
| `site.title` | `og:site_name` and the suffix on each page's title; the header shows the project title, not this |
| `site.parts.footer` | the footer content ([layout](layout.md)) |
| `project.github` | commit and edit links (the notebook repository is named by `launch_notebook_repo`, never derived from this) |
| `project.thebe` | in-page live compute ([notebooks](notebooks.md)) |
| `project.description` | the page description meta tag, when a page sets none |
| `project.keywords` | the keywords meta tag; a comma-separated string is split into a list |
| `project.math` | KaTeX macros ([migrating](migrating.md#maths-macros)) |
