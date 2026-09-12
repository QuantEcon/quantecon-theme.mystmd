# Migrating from quantecon-book-theme

A lecture repository moving off the Sphinx `quantecon-book-theme` has to set up
several things its Sphinx build handled another way. Three came with the Sphinx
theme and needed no per-repo setup at all; the rest are configured today under
`_config.yml` keys this theme does not read.

**These steps are manual.** mystmd's Jupyter Book config upgrade (`myst init`)
does not carry them across: it reads the analytics ID only from the `html`
section, sets `project.github` only from a top-level `repository.url`, and
never reads `sphinx.config` — which is where the lecture configs keep most of
these settings.

## The checklist

| Step | Replaces (Sphinx) | Do in the MyST build | Detail |
| --- | --- | --- | --- |
| [Licence footer](#licence-footer) | the footer hard-coded in the theme | nothing | [layout](layout.md) |
| [Maths macros](#maths-macros) | the theme's MathJax macros, or the repo's `mathjax3_config` | `project.math` entries | this page |
| [Last changed](#last-changed) | the theme's own git lookup | the git-metadata plugin, and `fetch-depth: 0` in CI | [git-metadata](git-metadata.md) |
| [Launch notebooks](#launch-notebooks) | `nb_repository_url` and the `launch_buttons` block | `launch_notebook_*` and `launch_colab` | [launch](launch.md) |
| [Notebook header](#notebook-header) | the `{raw} jupyter` block in each lecture file | `settings.myst_to_ipynb.header` | the fork's settings docs |
| [Lecture sources](#lecture-sources) | Sphinx-only `{raw}` blocks | run the rewrite script | this page |
| [Site URL](#site-url) | `html.baseurl` | `site.options.site_url` | [configuration](configuration.md) |
| [Old URLs](#old-urls) | the `.html` page paths and the redirect maps | build-time redirects | this page |
| [Document language](#document-language) | Sphinx `language`, and `current_language` / `languages` | `site.options.current_language` and `languages` | [rtl-support](rtl-support.md) |
| [Analytics](#analytics) | `html_theme_options.analytics.google_analytics_id` | `site.options.analytics_google` | [configuration](configuration.md) |
| [Description and keywords](#description-and-keywords) | top-level `description`, and `description` / `keywords` under `html_theme_options` | `project.description` and `project.keywords` | [configuration](configuration.md) |

## Licence footer

**Nothing to do.** The theme renders the CC BY-SA 4.0 badge, the licence
sentence and "A theme by QuantEcon" on every page by default, as the Sphinx
theme did.

Only a repository whose content is under other terms adds a footer file, which
replaces the whole default — credit included:

```yaml
site:
  parts:
    footer: footer.md
```

See [layout](layout.md#footer).

## Maths macros

The Sphinx theme injected a macro set whenever `mathjax_path` pointed at
MathJax 3, including `\epsilon` → `\varepsilon`, `\EE`, `\RR` and `\argmax`.
Here KaTeX renders the maths at build time and the only macros it gets are
`math:` entries in project or page frontmatter.

**Every repository that relied on the theme's macros needs this**, because
KaTeX maps `\epsilon` to the lunate ϵ (U+03F5) where `\varepsilon` is ε
(U+03B5) — the glyph the lecture text expects:

```yaml
project:
  math:
    '\epsilon': '\varepsilon'
```

A repository with its own `mathjax3_config` ports each of its macros too.
**MathJax's `[definition, nargs]` array form must be rewritten as a string**:
`math:` takes a string, or an object with a `macro` key, and drops an array
value with a "must be object, not array" validation error.

```yaml
# Sphinx: '\argmax': ['\operatorname{argmax}', 0]
project:
  math:
    '\argmax': '\operatorname{argmax}'
```

## Last changed

The Sphinx theme ran git itself for every page. Here the git-metadata plugin
does it, and it has to be listed **and** given the history to read:

```yaml
project:
  plugins:
    - https://raw.githubusercontent.com/QuantEcon/quantecon-theme.mystmd/vX.Y.Z/plugins/git-metadata.mjs
```

```yaml
# every workflow checkout that builds HTML, PR previews included
- uses: actions/checkout@v5
  with:
    fetch-depth: 0
```

A shallow checkout leaves the control with no history to show. See
[git-metadata](git-metadata.md).

## Launch notebooks

Launch is opt-in: it renders only when a notebook repository is named **and** a
launch service is on. Nothing is derived from `project.github`.

**Set `launch_notebook_repo` only if that repository exists.** A repository
with no notebooks companion sets none of these keys and shows no Launch
control, which is what the Sphinx site does without `nb_repository_url`.

| Sphinx key | Theme option |
| --- | --- |
| `nb_repository_url` | `launch_notebook_repo` |
| `nb_branch` | `launch_notebook_branch` |
| `nb_path_to_notebooks` | `launch_notebook_dir` |
| `path_to_docs` | `launch_notebook_source_dir` |
| `launch_buttons.colab_url` | `launch_colab: true` |

```yaml
site:
  options:
    launch_notebook_repo: QuantEcon/lecture-foo.notebooks
    launch_colab: true
```

See [launch](launch.md).

## Notebook header

Sphinx wrote each lecture's `{raw} jupyter` logo block into its exported
notebook. On mystmd that block is not a notebook cell — it is page content, and
it shows as literal markup under the page title.

The header now comes from a project setting, written by the ipynb export as
each notebook's first cell:

```yaml
project:
  settings:
    myst_to_ipynb:
      header: |
        <div id="qe-notebook-header" align="right" style="text-align:right;">
          <a href="https://quantecon.org/" title="quantecon.org">
            <img style="width:250px;display:inline;" width="250px"
                 src="https://assets.quantecon.org/img/qe-menubar-logo.svg" alt="QuantEcon">
          </a>
        </div>
```

That is one edit point per repository, or one across all of them through
`extends:`.

> **Not shipped yet.** The `settings.myst_to_ipynb.header` setting is
> QuantEcon/mystmd#108. Until it merges, notebooks exported by the fork carry
> no header.

## Lecture sources

The lecture sources carry Sphinx-only `{raw}` blocks that mystmd does not
render: the notebook header (in both `{raw} jupyter` and `{raw} html` form),
two embedded iframes, and three HTML tables. Their source reaches the reader as
escaped text.

**Run the rewrite script over the sources before the repository's first mystmd
build.** It lives in this repository, at `scripts/rewrite-raw-blocks.mjs`:

```bash
node path/to/quantecon-theme.mystmd/scripts/rewrite-raw-blocks.mjs lectures/
```

It deletes the header blocks, turns the iframes into the `{iframe}` directive
and keeps the tables as HTML in the Markdown. Any other `{raw}` block is
reported with its file and line, and **nothing is written at all** — resolve
those by hand and re-run.

## Site URL

Sphinx emitted each page's canonical link from `html.baseurl`, which every
lecture repository sets. Here the same value goes under `site.options`:

```yaml
site:
  options:
    site_url: https://python-programming.quantecon.org/
```

Without it the theme emits **neither** the canonical link nor `og:url`, and
`og:image` stays root-relative. See [configuration](configuration.md).

> **Not shipped yet.** The canonical link is #207, implemented by #227. Until
> that merges `site_url` feeds `og:url` and `og:image` only, and no page carries
> a canonical link whether or not the option is set.

## Old URLs

Every page URL changes at cutover: `about_py.html` becomes `about-py/`. Inbound
links, and the repository's own redirect maps, break without redirects.

Collect what the Sphinx config already redirects — 17 lecture repositories
carry a `rediraffe_redirects` map and four also carry sphinx-reredirects
`redirects` — and keep it for the migration.

> **Not shipped yet.** Build-time redirect pages, both for the old Sphinx paths
> and for a `site.redirects` map, are QuantEcon/mystmd#113. Until that ships,
> mystmd writes no redirects at all.

## Document language

The theme reads only `site.options.current_language`; without it every page is
marked `lang="en"`. The same value sets `og:locale` and marks the current entry
in the language switcher.

Sphinx language codes use an underscore and this option takes **BCP 47**, so
`zh_CN` becomes `zh-cn`:

```yaml
site:
  options:
    current_language: zh-cn
    languages: |
      - code: en
        name: English
        url: https://python-programming.quantecon.org
      - code: zh-cn
        name: 中文
        url: https://python-programming.quantecon.org/zh_cn
```

`languages` is a YAML block held in a string, because template options can only
be scalars. See [rtl-support](rtl-support.md).

## Analytics

```yaml
site:
  options:
    analytics_google: G-XXXXXXXXXX
```

## Description and keywords

These move from `html_theme_options` to project frontmatter:

```yaml
project:
  description: This website presents a set of lectures on Python programming for economics and finance.
  keywords: Python, QuantEcon, Quantitative Economics, Economics, Numpy, Scipy
```

A comma-separated `keywords` string is split into a list, so the Sphinx value
can be copied across unchanged.

## Sphinx options with no counterpart

These `quantecon-book-theme` options are not offered, each for a stated reason.

| Keys | Why not |
| --- | --- |
| `quantecon_project`, `header_organisation`, `header_organisation_url`, `dark_logo`, `html_logo` | the header's branding is fixed: the QuantEcon logo and wordmark, not configurable per site |
| `authors_label`, `mainpage_author_fontsize` | the byline carries no label, and its size is fixed ([authors](authors.md)) |
| `persistent_sidebar` | the contents drawer opens closed on every page; see theme issue #214 |
| `home_page_in_toc` | the contents drawer is built from mystmd's `toc`, which has no equivalent switch |
| `contents_autoexpand` (its `false` mode) | the outline always collapses to the current branch; no lecture repository sets the key |
| `last_modified_date_format` | "Last changed" renders a relative time, not a formatted date ([git-metadata](git-metadata.md)) |
| `inline_literal_box` | the boxed inline-literal style is an open design question; see theme issue #180 |
| `announcement_expires`, `announcement_style` | the site-wide banner is not offered at all ([announcements](announcements.md)) |
| `exercise_style`, `proof_minimal_theme`, `togglebutton_hint` | settings of sphinx-exercise, sphinx-proof and sphinx-togglebutton, which mystmd replaces with its own directives |
| `html_css_files`, `html_js_files` | Sphinx core; for CSS the nearest thing is the `myst-theme.css` mystmd serves at the site root, and there is no slot for extra scripts |
| `single_page`, `expand_sections`, `plugins_list` | inert in `quantecon-book-theme` itself — nothing reads them there either |
