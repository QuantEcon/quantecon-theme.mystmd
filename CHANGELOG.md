# Changelog

All notable changes to `@quantecon/lecture-theme` (the QuantEcon MyST theme) are
documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Release flow.** This theme is developed in
> [`QuantEcon/quantecon-theme.mystmd`](https://github.com/QuantEcon/quantecon-theme.mystmd)
> (renamed from `quantecon-theme-src` on 2026-06-11; old links redirect). Each release
> is a `vX.Y.Z` git tag: pushing the tag triggers `release.yml`, which builds the theme
> and publishes a GitHub Release with `quantecon-theme.zip` attached, using that
> version's section of this file as the release notes (see
> [`CONTRIBUTING.md`](./CONTRIBUTING.md)). Releases ≤ 2.0.0 predate the pipeline and
> were deploy commits (`🚀 vX.Y.Z from <sha>`) to the legacy build repo
> [`QuantEcon/quantecon-theme`](https://github.com/QuantEcon/quantecon-theme), now
> **archived** — consumers point at pinned release URLs (see Phase 0 in
> [`PLAN.md`](./PLAN.md)).

## [Unreleased]

### Added
- Code blocks are highlighted in QuantEcon's own token palette, the Sphinx
  lecture builds' default `qetheme_code_style`, in light and dark mode. MyST
  tokenises with highlight.js rather than Pygments, so the palette is mapped
  scope by scope onto the `hljs-*` classes; the mapping, and the two Pygments
  classes highlight.js has no scope for (operators and module names), are
  documented in `styles/quantecon.css`. Phase 3 of the book-theme parity plan
  ([#89](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/89)), Goal A. ([#171](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/171))
- Emphasis, strong text and definition terms render in the Sphinx builds'
  default `seoul256` text colours -- teal `em`, amber `strong` and `dt`, both
  upright at weight 550 -- through `--qe-emphasis-color`, `--qe-strong-color`
  and `--qe-definition-color` custom properties with dark-mode values, beside
  the existing `--qe-literal-color`. Only the default scheme ships: no lecture
  repo sets `color_scheme`, so the `gruvbox` / `none` switches and the
  custom-CSS hook are deferred until a consumer asks for one. Phase 3, Goal B. ([#171](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/171))
- Language switcher and `hreflang` alternates for translated editions: with
  two or more entries in the new `languages` site option the toolbar gains a
  globe-icon dropdown linking to the same page in each edition, the entry
  matching `current_language` marked current, and every page carries
  `<link rel="alternate" hreflang>` tags with the first entry as `x-default`.
  Phase 4 of the book-theme parity plan
  ([#90](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/90)).
- Right-to-left editions: `enable_rtl` sets `dir="rtl"` on the document (and
  `current_language` now sets its `lang`, in place of the hard-coded `en`),
  with the drawer, upstream content accents and spacing mirrored and code and
  maths kept left-to-right. Phase 5
  ([#91](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/91)).
- Translator credit in the page header from the new `translators` site option,
  with a localisable `translators_label` (default "Translated by") and a
  per-page override under `site:` in page frontmatter, on the shape settled
  across the themes on QuantEcon/workspace-themes#3
  ([#143](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/143)).
- The site options above are declared in `template.yml`. The MyST CLI drops
  any `site.options` key the template does not declare, and can only declare
  scalar types, so `languages` and `translators` are YAML written inside a
  block string; see the README's "Multilingual editions".

## [2.5.0] - 2026-09-05

> Headline: the toolbar and lecture typography now match the existing Sphinx
> builds — an icon-only search trigger, PT Serif headings on the Sphinx scale,
> and QuantEcon-blue content links — and every toolbar control gets a proper
> accessible name in place of a nested button. The notebook launcher collapses
> to a direct Colab link, dropping the Private JupyterHub option no lecture
> site ever configured. The "back to top" button no longer fades out of the
> page margin on load, and the WebKit FOUC guard is hardened against the
> hydration race that could turn it red for reasons unrelated to the critical
> CSS.

### Changed
- The toolbar search trigger is now a plain magnifier icon, matching the search
  affordance on the existing lecture sites and the styling of the neighbouring
  toolbar icons, in place of the boxed "Search ⌘K" placeholder. The ⌘K /
  Ctrl K keyboard hint moves into the search dialog, overlaid on the right edge
  of the text input. Because `@myst-theme/site` exports only the top-level
  `Search` component, `Search.tsx` is forked verbatim from
  `@myst-theme/site@1.3.0` into `app/components/toolbar/` apart from the
  trigger and hint placement; search behaviour, keyboard navigation and
  platform detection are unchanged
  ([#165](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/165)).
- Lecture headings now follow the Sphinx builds' typography. `h1`–`h3` are set
  in PT Serif with `h4`/`h5` kept in the sans face, sized on the Sphinx scale
  (h1 `2em`, h2 `1.7em`, h3 `1.4em`, h4 `1.2em` of the content size, so the
  scale tracks the font-scale controls), with every level at line-height 1.15
  and `h4`/`h5` at weight 900 to match the Sphinx build's measured values.
  All of it is mirrored into the critical CSS so the first WebKit paint on
  static-build navigations is already serif at the final sizes rather than
  painting the title small and swapping
  ([#166](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/166)).
- Content links are coloured to match the Sphinx lecture builds: `#0072bc`
  (5.05:1 on white, WCAG AA) with `#004979` on hover, and white in both states
  in dark mode as the Sphinx dark theme does. Both of myst-to-react's anchor
  classes are covered — `.link` for plain links and `.hover-link` for
  cross-references, citations and footnotes — via `--qe-link-color` /
  `--qe-link-hover-color` tokens in `styles/quantecon.css`, overriding the
  upstream blue-700/blue-400 at matched specificity, with the underline drawn
  in `currentColor` so it always follows the text. Colour only: the Sphinx
  builds' hover-only underline and `:visited` colour are deliberately not
  matched here. Site chrome (footer badge, back-to-top) keeps its own rules
  ([#167](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/167)).

### Removed
- The **Private JupyterHub** launch option. The toolbar's Launch control is now a
  direct link to Google Colab instead of a popover with a radio group and a
  hand-typed service URL. The demand signal this was gated on came back empty:
  the book-theme only renders its hub button when `jupyterhub_url` is set in
  `_config.yml`, and an org-wide search finds that key in no lecture repo at all
  — every flagship series configures `colab_url` alone — so the button has never
  appeared on a live QuantEcon site. The MyST version was also not the same
  feature: it had no config key, rendered unconditionally, and asked the reader
  to type a hub URL into a box whose value was `React.useState('')` and so was
  discarded when the popover closed. Verified against a live build, it also
  hardcoded a `/jupyter/hub/` path segment the Sphinx theme leaves to the
  configured URL, so it only ever addressed hubs at `<host>/jupyter/hub/` and
  could not reach a stock JupyterHub, let alone a local Jupyter server. Removing
  it drops `buildJupyterHubUrl`, the Radix popover and radio group, and the
  `launch-open.png` visual baseline; `launch-colab` now asserts the anchor's
  `href`, which also pins that the control is a link rather than a chooser.
  Re-adding hub, Binder and local-server targets is tracked as future work
  ([#87](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/87)).

### Fixed
- Every toolbar control was nesting a second `<button>` inside its real button
  or link, because the Radix tooltip trigger renders its own element by
  default: invalid HTML and a duplicate tab and screen-reader stop on each
  control. Tooltips now merge onto the real interactive element (`asChild`),
  icon-only triggers that had no accessible name get an `aria-label` (the
  mobile "more actions" menu no longer announces itself as "Downloads"), two
  stray `tabIndex` attributes on decorative icons are dropped, and tooltips
  open on keyboard focus of the actual control. Closing the search dialog no
  longer leaves its tooltip open over the trigger
  ([#165](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/165)).
- The "back to top" button no longer fades out of the page margin on load. It
  is hidden by `opacity-0` and carries a `transition-opacity`, so on any frame
  where the stylesheet is absent it painted at full opacity and then animated
  away once the sheet landed. That frame is not the first paint alone: the
  React hydration recovery ([#126](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/126))
  re-renders the head and briefly drops the stylesheet after the component has
  mounted, which is why gating the transition on mount cannot stop it. The
  critical CSS now pins the button to `opacity: 0` on the same zero-specificity
  terms as the toggle's close icon, and the WebKit FOUC guard asserts it — with
  the rule the button never paints, without it the control sees it at full
  opacity. Measured with the stylesheet delayed: 17–18 animating frames before,
  none after. Supersedes the `useMounted` approach in
  [#141](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/141).
- The WebKit FOUC guard no longer goes red for reasons unrelated to the critical
  CSS. Hydration currently fails on every page load (React #418/#423), and the
  recovery re-render restores the inlined critical `<style>` 150–240ms after
  `DOMContentLoaded` — after the control test has deliberately stripped it from
  the served HTML to prove the guard is meaningful. The measurement used to run
  from the test after `domcontentloaded`, so on a loaded runner every control
  assertion flipped at once. It now samples from an init script that fires
  in-page on `DOMContentLoaded`, before hydration is even scheduled. Both cases
  also assert their own preconditions — that the strip actually matched, and
  whether the inline block is present as sampled — so a reshaped `CRITICAL_CSS`
  reports as a stale strip pattern instead of as a run of confusing failures
  about grid layout. The underlying hydration failure remains open in
  [#126](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/126);
  carried over from [#141](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/141).

### Dependencies
- `@fontsource/pt-serif` 5.3.0 self-hosts the PT Serif heading face (400/700,
  upright and italic), routed through the same Remix/esbuild pipeline as Source
  Sans 3, so no Google Fonts request
  ([#166](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/166)).


## [2.4.0] - 2026-09-04

> Headline: lecture content now matches the typography of the existing Sphinx
> builds, and inline code stops rendering wrapped in literal backticks — a
> regression that reached every code span on every page, caused by a
> `tailwind.config.js` spread of an upstream export that is a function, not an
> object. The static-build asset fix from 2.3.1 is completed: four route and
> shared-chunk stylesheets it did not cover still shipped absolute
> `/myst_assets_folder/…` URLs, and a production build now emits zero of them
> with all 78 references resolving. The site footer and back-to-top button are
> styled to match the Sphinx builds.


### Added
- The site footer part (`site.parts.footer`) and the back-to-top button are
  styled to match the Sphinx lecture builds, with every value measured off
  python-programming.quantecon.org: 14.4px footer text at 70% opacity with an
  inline licence badge and 36px clearance above the rule and below the last
  line, and a `↑ Top` pill in QuantEcon blue (with `aria-label="Back to top"`
  kept for screen readers). The footer content column now matches the width of
  its own rule, and footer links get a readable colour in dark mode ([#155](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/155)).

### Changed
- Lecture content typography now follows the Sphinx builds, via a dedicated
  `styles/quantecon.css` imported after `@myst-theme/styles` so nothing upstream
  is forked: paragraph, list and figure rhythm in `em`, inline literals in the
  Sphinx colour (`--qe-literal-color`, with the Sphinx dark-mode value under
  `.dark`) at a root-relative size and in the monospace stack, and the `.auto`
  and `.terminal` figure-sizing classes lecture sources already use. The file's
  header documents how each rule outranks the typography plugin without
  `!important` ([#155](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/155)).
- A metric-matched `Source Sans 3 Fallback` face (local Helvetica/Arial with
  `size-adjust` and ascent/descent overrides) is declared in the critical CSS
  and appended to the `sans` stack, so the swap to the self-hosted webfont no
  longer reflows the page: measured text width moves from about 8% off target
  to under 0.5% while the woff2 is still loading ([#155](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/155)).
- The contents drawer is rebuilt on the native Popover API. The browser now
  owns its open/closed state (`popovertarget` on the toolbar toggle), so the
  drawer works on the server-rendered HTML before hydration, a closed drawer is
  `display: none` from the UA stylesheet on the very first paint — the
  critical-CSS rule that parked it off-screen is gone rather than patched —
  and its links leave the tab order and accessibility tree while closed.
  **Behaviour changes:** the drawer is now light-dismissed (`popover="auto"`):
  Escape closes it, and so does clicking or selecting anywhere outside it,
  where before it stayed open until toggled. It also closes itself when the
  search dialog opens, since a popover paints above every z-indexed layer
  including a modal's backdrop. **Browser support:** browsers without the
  Popover API (Firefox < 125, Safari < 17, which includes anything on iOS 16)
  get neither the drawer nor its toggle — the in-page outline and site
  navigation still reach every page there. A polyfill was considered and
  rejected because it runs after first paint, reintroducing the flash this
  removes; revisit if that share matters. Drawer widths now live in
  `styles/app.css` keyed on `theme(screens.*)`, so they no longer depend on
  Tailwind's emission order
  ([#130](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/130),
  [#144](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/144)).

### Fixed
- Inline code no longer renders wrapped in literal backticks.
  `tailwind.config.js` spread `themeExtensions.typography` into an object, but
  upstream exports it as a function, so the spread yielded `{}` and silently
  dropped every upstream typography setting, including the rule that removes
  the plugin's `::before`/`::after` backticks. The key is gone and the project
  values it carried live in `styles/quantecon.css` ([#155](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/155)).
- The remaining absolute asset URLs in the built stylesheets are now relative
  too. [#139](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/139)
  rewrote the stylesheets in `_assets/`, but Remix also emits route and
  shared-chunk CSS into the build root, `_shared/` and `routes/`, and the
  rewriter enumerated a single directory so it never saw them. Four such
  stylesheets shipped in 2.3.1 still pointing `--jp-icon-plotly` at an absolute
  `/myst_assets_folder/_assets/plotly-*.svg`, which resolves under `myst start`
  but 404s in `myst build --html` output and under a `baseurl` — the same defect
  [#138](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/138)
  described, in the files that fix did not cover. The script now walks the build
  directory and computes each stylesheet's prefix from its own location, since
  the depth differs (`./_assets/` from the build root, `../_assets/` from
  `routes/`), and checks every rewritten target from that stylesheet's own
  directory rather than assuming one. A production build now emits **zero**
  absolute asset URLs and all 78 references resolve
  ([#150](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/150)).
- The contents toggle icons no longer animate their first-paint correction,
  and the close icon no longer paints beside the hamburger on the pre-`app.css`
  frame. The icons now swap with `display` off the drawer's `:popover-open`
  state instead of cross-fading with `transition-all`, so there is nothing to
  animate, and a zero-specificity critical-CSS rule hides the close icon until
  the stylesheet lands
  ([#127](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/127),
  [#144](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/144)).
- The toolbar logo no longer distorts between roughly 770px and 840px, and the
  desktop control set no longer overflows the right edge in the 768–856px band.
  The logo is `shrink-0` (preflight's `max-width: 100%` was letting it clamp to
  a shrinking flex item), and the toolbar's gap, separator and padding widen at
  `lg` rather than `md`, returning about 148px to that band
  ([#144](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/144)).
- The contents toggle has a visible `:focus-visible` ring, so keyboard users
  can see where focus returns after Escape closes the drawer (WCAG 2.4.7)
  ([#144](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/144)).

## [2.3.1] - 2026-08-26

> Headline: corrects two defects in what 2.3.0 shipped. Code cells nested inside
> a directive (`{exercise}`, `{solution}`, `{note}`) drew a run button that did
> nothing; they now register with the kernel and execute. Self-hosted stylesheet
> assets 404'd in `myst build --html` output, so every KaTeX font failed and
> maths fell back to system glyphs on statically built sites; asset URLs are now
> relative and resolve in every layout. Source Sans 3 is self-hosted too,
> removing the last third-party origin from the critical rendering path.
> Consumers upgrade by bumping the pinned release URL in `site.template`.

### Added
- Visual-fixture coverage for fancy ordered lists **inside a directive**.
  `tests/visual/fixture/lists.md` gains a `prf:theorem`-wrapped stamped list,
  and `lists-markers` asserts it renders with the same `type`, `start`,
  `list-lower-roman delimiter-parens` classes and drawn marker as the
  equivalent body-level list. Every fixture list previously sat in the page
  body, so `LIST_RENDERERS` reaching the `prf:*` subtree was accidental rather
  than asserted: it works because `myst-to-react`'s proof renderer passes its
  children through the same `<MyST/>` dispatcher, and because nothing in
  `styles/lists.css` scopes a selector to body-vs-proof. Both are load-bearing
  and neither was pinned, so a change to either would silently return the ~330
  list items across the dp books' 118 `prf:*` blocks to decimal markers — a
  regression far too small in area for the snapshot diff budget, which is why
  it is asserted against the DOM
  ([#121](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/121)).

### Changed
- Source Sans 3 is now self-hosted instead of `@import`ed from
  `fonts.googleapis.com`. Google Fonts is blocked in mainland China, a
  significant share of the QuantEcon readership, and unlike the CDN stylesheets
  removed in 2.3.0 this one is the *body* font on every page rather than the
  maths on some of them. It also had the worst possible shape for a
  critical-path request: a CSS `@import`, discovered only after `app.css` had
  downloaded and parsed, so the browser could not preload it and the chain ran
  `app.css` → Google's CSS → `fonts.gstatic.com` woff2 across two extra origins.
  The font now ships from `@fontsource-variable/source-sans-3` through the same
  Remix import route the KaTeX CSS uses, so its 14 `.woff2` files are served
  from the site's own origin. The family is declared as `Source Sans 3
  Variable`, so `tailwind.config.js` and the inlined critical CSS in
  `app/root.tsx` name it that way too, with plain `Source Sans 3` kept next in
  the stack for a locally installed copy. Rendered text is unchanged in
  substance, but the `@fontsource` build's glyph metrics differ marginally from
  the Google-served static font, enough to re-wrap a line at the mobile
  viewport — so the linux mobile-chrome baselines were refreshed
  ([#148](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/148)); every
  desktop baseline is untouched
  ([#131](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/131)).

### Fixed
- Code cells nested inside a directive (`{exercise}`, `{solution}`, `{note}`, …)
  are now registered with the kernel, so their run button works and their
  outputs survive a kernel connection. `@myst-theme/jupyter`'s
  `notebookFromMdast` walked only the mdast root's direct children, so a cell at
  `root > block > exercise > block[kind=notebook-code]` never entered
  `notebook.cells` or the `idkmap` — while the renderer matches
  `block[kind=notebook-code]` at any depth and drew a run button anyway.
  Clicking it logged `no cell found on execute` and did nothing, with no error
  visible to the reader; on a live-compute page the cell's pre-baked outputs
  also blanked as soon as the kernel attached, because the active output
  renderer could not find a cell to bind to. Fixed by a third `patches/` entry
  (`@myst-theme+jupyter+1.3.0.patch`) that walks nested blocks depth-first and
  appends them in document order — which is execution order — while skipping
  `{embed}` subtrees, whose cells belong to another page's notebook and would
  otherwise collide in the shared key map. The existing
  `block > container > code` figure case and the markdown-cell fallback are
  unchanged. Note that nested cells now participate in **Run all**, so solution
  and exercise cells execute along with the rest of the page.
  ([#117](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/117))
- Self-hosted stylesheet assets no longer 404 in static builds. Remix rewrites
  every `url()` in a bundled stylesheet to an absolute `/myst_assets_folder/…`
  path, which resolves under `myst start` — the theme's own server mounts
  `public/build` there — but not in `myst build --html` output, where the assets
  land under `build/_assets/` and mystmd's rewriter only fixes up `.html`, `.js`
  and `.json`, never `.css`. So the KaTeX stylesheet self-hosted in
  [#125](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/125) loaded
  while all 60 of its font references failed, and maths fell back to system
  glyphs on every statically built site — the degradation that change set out to
  prevent. The build now rewrites those references to be relative to the
  stylesheet, which resolves identically under `myst start`, in a static build,
  and under a `baseurl` (where the absolute path was also wrong, affecting the
  per-PR preview deployments). Every rewritten target is checked to exist beside
  its stylesheet, so a wrong assumption fails the build instead of shipping
  silent 404s ([#138](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/138)).

## [2.3.0] - 2026-08-20

> Headline: lecture pages gain **in-page live compute** (a JupyterLite/Pyodide
> Power toggle in the header toolbar) and an inline **git-history changelog** on
> the page header's author line. All third-party CDN stylesheets are gone —
> KaTeX and jupyter-matplotlib are served from the site's own origin and Font
> Awesome is dropped — so maths and styling no longer degrade where
> jsdelivr/cdnjs are unreachable (notably mainland China). Consumers upgrade by
> bumping the pinned release URL in `site.template`.

### Added
- In-page live compute via Thebe (Phase 2 of [`PLAN.md`](./PLAN.md), closes #88):
  setting the standard MyST `project.thebe` config surfaces a **Power** toggle in
  the header toolbar next to Launch on notebook pages (desktop); clicking it boots
  the kernel, after which **Run / Restart / Clear** take its place and cells
  execute live. The control is the `@myst-theme/jupyter` notebook toolbar,
  portaled into the header (`ComputeToolbarSlot.tsx` → `#qe-compute-slot`) so it
  stays inside the Thebe providers while living in the always-visible header —
  no provider-tree lift. The QuantEcon default is **JupyterLite**
  (`thebe: { lite: true }`): Python runs in the browser via Pyodide, with no
  server or Binder to host; `binder:`/`server:` backends remain available through
  the same config. Pyodide package caveat (numba/JAX unavailable) documented in
  the README. Covered by a presence test scoped to the header slot and a
  disabled-path test against a second no-thebe fixture served on its own port,
  proving the toggle is gated on the project opting in ([#98](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/98)).
- Git history in page headers (Phase 1 of [`PLAN.md`](./PLAN.md)): a "Last
  changed" control on the page-header author line expands an inline changelog
  with GitHub-linked commit hashes and a full-history link, mirroring the
  `quantecon-book-theme` header. The panel opens above the header's blue
  divider, pushing it down and sitting flush on it, so the divider reads as the
  panel's own bottom edge and the changelog stays clear of the lecture content.
  It grows to fit rather than scrolling — length is bounded at the source, with
  the plugin capping entries per page (default 6). Data is injected at build
  time by a new MyST
  transform plugin (`plugins/git-metadata.mjs`, `git log --follow` per page →
  `mdast.data.git_metadata`), with a `site.git_metadata` page-frontmatter
  override for manual pinning. mystmd has no built-in last-modified support
  (jupyter-book/mystmd#2213), and plugin transforms cannot modify page
  frontmatter, hence the AST channel
  ([#83](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/83)).

### Changed
- The KaTeX and jupyter-matplotlib stylesheets are now served from the site's
  own origin instead of `cdn.jsdelivr.net`. jsdelivr is intermittently
  unreachable from mainland China, and when it is blocked the maths markup
  still renders but arrives unstyled — fractions, radicals and matrices
  collapse into run-together text. The KaTeX CSS (plus the font files it
  references) is bundled from the installed `katex` package, which also retires
  the KaTeX 0.15.2 pin in the upstream `KatexCSS` export; the 316-byte
  jupyter-matplotlib stylesheet is vendored into the Tailwind bundle, costing
  no request at all
  ([#125](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/125)).

### Removed
- The render-blocking Font Awesome 4.7 stylesheet from cdnjs. Nothing used it:
  the theme renders no `fa-*` classes (the toolbar uses the bundled
  `lucide-react` icons), and the library has been end-of-life since 2016.
  Dropping it removes a third-party origin (a DNS lookup and TLS handshake)
  from the critical rendering path
  ([#124](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/124)).

### Fixed
- Contents sidebar no longer flashes open on page load. On static builds the
  first paint can happen before `app.css` applies, leaving the panel in flow and
  fully visible; it then animated itself shut over 300ms because the transition
  predated the stylesheet. The inlined critical CSS now parks the panel
  off-screen on that first frame, and the transition is withheld until after
  mount ([#123](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/123)).

## [2.2.0] - 2026-07-16

> Headline: fancy ordered lists — `(a)` / `(i)` / `B)` markers from the QuantEcon
> mystmd fork's fancy-lists parser now render correctly in HTML site builds
> (previously they fell back to `1.` / `2.` / `3.`). Consumers upgrade by bumping
> the pinned release URL in `site.template`.

### Fixed
- The notebook-launch toolbar trigger now has an accessible name (`aria-label="Launch notebook"`); previously it exposed no name to assistive technology. Added alongside the first regression coverage of the launch popover (Colab URL + default selection — BinderHub was deliberately not added, see [#26](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/26)).
- Fancy ordered lists (`(a)`, `iv.`, `B)` — QuantEcon/mystmd#50) now render their markers instead of falling back to decimals: a custom `list` renderer maps the node's `style` to the `<ol type>` attribute plus a case-sensitive `list-*` class (HTML matches `[type=...]` case-insensitively, so CSS keyed off the attribute cannot tell `a` from `A`) and exposes `delimiter` as a `delimiter-paren(s)` class, with counter-based CSS drawing the parenthesized markers ([#100](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/100)). Interim override until the fix lands upstream in `myst-to-react` (tracked in QuantEcon/mystmd#51). Covered by a new `lists` visual-regression fixture page whose markers are stamped by a fixture-local transform (`fancy-lists.mjs`) — so the coverage is independent of whether the building CLI parses fancy-list markers — plus DOM-level marker assertions (`lists-markers`), since a wrong marker case moves too few pixels for the snapshot diff budget.

### Added
- Per-PR rendered previews on GitHub Pages (`.github/workflows/preview.yml`): each PR statically builds the real `lecture-python-programming` lectures with the candidate theme (`myst build --html`, including the build-time Jupyter Book → MyST upgrade) and publishes to `gh-pages` at `pr-preview/pr-<n>/` with a sticky link comment and teardown on close. Self-contained on `GITHUB_TOKEN` — no external preview service.

### Removed
- Retire the `make deploy` / `deploy-theme` targets — releases ship exclusively via the tag-triggered GitHub Release workflow, and the legacy build repo (`QuantEcon/quantecon-theme`) is archived. `make build-theme` now assembles the bundle locally instead of cloning the archived repo (so the CI test harness no longer depends on it), and a new `make build-zip` produces the release-equivalent zip for local artifact testing ([#81](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/81)).

## [2.1.0] - 2026-06-11

> First release published through the tag-triggered pipeline, from the renamed
> `quantecon-theme.mystmd` repo (Phase 0 of [`PLAN.md`](./PLAN.md)).

### Added
- Visual-regression CI gate: a `visual` job pixel-diffs the fixture (desktop + mobile Chromium, now including a sidebar-open snapshot — the off-canvas sidebar was invisible to the existing full-page shots) against committed platform-suffixed baselines on every PR, posts a 🎭 results summary comment, and uploads report/diff artifacts; baselines are refreshed by commenting `/update-snapshots` (or `/update-new-snapshots`) on the PR ([#78](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/78)).
- Tag-triggered release pipeline (`.github/workflows/release.yml`): pushing a `vX.Y.Z` tag builds the theme, assembles the bundle (with `template.yml`'s `version` stamped from `package.json` so they cannot drift), and publishes a GitHub Release with `quantecon-theme.zip` attached, using the version's changelog section as the release notes ([#77](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/77)).

### Fixed
- Top-level (level-1) TOC pages now render as clickable links in the Contents sidebar when they have a slug, so flat-TOC projects are navigable; slug-less grouping titles remain plain headers ([#76](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/76)).
- Safari/WebKit flash of unstyled content (FOUC) on page navigation: inline a zero-specificity (`:where(...)`) critical-CSS block (base font + `.simple-center-grid` layout) in the document `<head>` so the first paint is already styled before the linked stylesheet applies ([#66](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/66)).

### Security
- Resolve backward-compatible Dependabot advisories via npm `overrides` — `uuid` (`^11.1.1`), `ajv` (`^8.18.0`), and `cookie` (`^0.7.0`, used by Remix's cookie session); add `SECURITY.md` documenting the dependency posture and triage for the remaining deferred alerts ([#68](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/68)).
- Patch `shell-quote` and `ws` via version-scoped npm `overrides`; refresh the `SECURITY.md` triage ([#75](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/75)).

## [2.0.0] - 2026-06-04

> Major release: the substantial `@myst-theme` 0.14 → 1.x upgrade, a technical-review
> pass, and a modernised release/test setup (Phase 0). It is a **major** bump because
> it carries backwards-incompatible changes for consumers: `@myst-theme` v1.0.0's new
> notebook output-node AST (content built with an older `mystmd` may not render
> correctly) and a raised runtime requirement (Node `>=14` → `>=20`). The previously
> deployed bundle (`QuantEcon/quantecon-theme`) was **v1.1.1** and predates everything
> below; a `make deploy` ships it.
>
> The three "Fixed" items marked **(1.x regression)** are bugs the upgrade itself
> introduced. They never reached users — they were caught pre-release by validating the
> build against the visual-regression harness and real `lecture-wasm` content before
> deploying.

### Changed
- Upgrade all `@myst-theme/*` packages from `0.14.x` to `1.3.0`, and `myst-common`/`myst-config` to `1.9.5`, tracking current upstream [`myst-theme/book`](https://github.com/jupyter-book/myst-theme/tree/main/themes/book) ([#30](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/30) brought 0.14→1.1.2; later bumped to 1.3.0 to match latest upstream). **Upstream breaking change:** `@myst-theme` v1.0.0 introduced a new AST structure for notebook output nodes ([jupyter-book/myst-theme#571](https://github.com/jupyter-book/myst-theme/pull/571)).
- Raise the Node engine floor from `>=14` to `>=20` (drops EOL Node 18) and move local/CI tooling to **Node 24** (`.nvmrc` + CI + release workflow), matching upstream's build; bump release-workflow actions v3 → v4 ([#31](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/31)).

### Added
- Playwright visual-regression harness: renders a small fixture project (plain Markdown + a notebook) through a live `myst start` against a chosen theme version and snapshots each surface, so styling/markup regressions across the upgrade are caught before deploy ([#60](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/60)).
- CI workflow (`.github/workflows/ci.yml`) running type-check (`npm run compile`) and a production build (`npm run prod:build`) on every push/PR to `main` ([#31](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/31)).
- `CONTRIBUTING.md` documenting development setup, available scripts, project structure, commit conventions, and the release process ([#31](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/31)).

### Fixed
- **(1.x regression)** Every page returned HTTP 500 under `@myst-theme` 1.x (`useBannerState must be used from within a BannerStateProvider`). Wrap the page tree (article **and** error page) in `BannerStateProvider` so the new `useBannerState`/`useSidebarHeight` hooks resolve ([#61](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/61)).
- **(1.x regression)** The article body rendered full-bleed (flush-left, no centered content column, right-hand "On this page" margin swallowed). `@myst-theme` 1.x emits `.col-screen` in a later cascade layer than our base-layer centering rule, so the body's `col-screen` wrapper won; drop it so blocks fall back to the centered `col-body` default (matching upstream's `myst-content-blocks` pattern) ([#62](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/62)).
- **(1.x regression)** Pages flashed continuously (a hard-reload loop) and the in-page "On this page" outline never rendered. Keep `@remix-run/*` pinned to `~1.17.0` (restoring the long-standing v1.0.1 pin; reverting the [#29](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/29) bump to 1.19) — Remix 1.19's client calls `window.location.reload()` whenever `window.__remixContext.url` is undefined, which it always is under the mystmd CLI's SSR. Adds `.npmrc` `legacy-peer-deps=true` and an explicit `typescript` devDependency so installs accept `@myst-theme/site`'s stricter `^1.19` peer range ([#63](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/63)).
- `aria-label` typo (`aira-label`) in `ProjectFrontmatter.tsx` — the authors section is now exposed to screen readers ([#31](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/31)).
- Missing React `key` prop on author `<span>` elements built in a `.reduce()` in `ProjectFrontmatter.tsx` ([#31](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/31)).
- Swapped `SidebarToggle.tsx` ARIA labels so each matches its visible icon state ("Show"/"Hide table of contents") ([#31](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/31)).
- TypeScript errors surfaced by the new CI: add `@types/lodash.throttle`; wrap `Buffer` in `new Uint8Array(...)` for the `Response` body in the `[objects.inv]` and `[favicon.ico]` routes ([#32](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/32)).

### Security
- Add `overrides` for `prismjs` (`^1.30.0`, GHSA-x7hr-w5r2-h6wg DOM-clobbering) and `katex` (`^0.16.21`, five CVEs), resolving those advisories ([#29](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/29), [#30](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/30)). The remaining `npm audit` findings live in the older Remix v1 build toolchain (esbuild/webpack and friends); pinning `@remix-run/*` back to `~1.17.0` for rendering correctness (see Fixed, [#63](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/63)) keeps those present until the Remix v2 migration ([#28](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/28)).

### Dependencies
- Numerous Dependabot security updates merged, including `webpack`, `vite`, `vm2`, `tar-fs`, `lodash`/`lodash-es`, `qs`/`express`, `js-yaml`, `form-data`, `brace-expansion`, `@babel/*`, `diff`, and `minimatch`.

## [1.1.1] - 2025-06-13
> Deployed to the bundle repo on 2025-06-13. The source version-bump PR
> ([#8](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/8)) was merged much later,
> on 2026-02-25, as bookkeeping — it did not change what users were running.

### Fixed
- Strip the `.myst` suffix from the derived `org/repo` when building Colab / JupyterHub launch URLs, so lecture repos named `lecture-*.myst` produce working notebook links (`6e39113`, [#4](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/4)).

### Removed
- Dropped the no-longer-needed `@types/react-syntax-highlighter` patch ([#8](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/8)).

## [1.1.0] - 2025-02-28

### Changed
- Update `@myst-theme/*` to `0.14.0` (`df3bcd4`, [#2](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/2)).

## [1.0.6] - 2025-02-18

### Changed
- Update the margin Outline ("On this page") text (`9071f34`).

## [1.0.5] - 2025-02-17

### Changed
- Use `useLinkProvider` for internal links instead of constructing them directly (`dd76b21`).

## [1.0.4] - 2025-02-17

### Fixed
- Fix a missing slash in generated links (`26772b0`).

## [1.0.3] - 2025-02-17

### Fixed
- Fix Home, Contents, and ProjectHeader link targets (`c0369e8`).

## [1.0.2] - 2025-02-17

### Fixed
- Fix `baseurl` handling in the toolbar and outline links (`73c72f2`).

## [1.0.1] - 2025-02-17

### Changed
- Pin to `remix@1.17` for compatibility (`8066c00`).

## [1.0.0] - 2025-02-14

### Added
- Initial version of the QuantEcon MyST theme: Remix + `@myst-theme` book theme with QuantEcon branding, toolbar (home, search, fullscreen, font scaling, dark mode, downloads, Colab/JupyterHub launch, edit-on-GitHub), content-driven site footer, and bundled brand assets.

[Unreleased]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v2.5.0...HEAD
[2.5.0]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v2.3.1...v2.4.0
[2.3.1]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v1.1.1...v2.0.0
[1.1.1]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v1.0.6...v1.1.0
[1.0.6]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v1.0.5...v1.0.6
[1.0.5]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/QuantEcon/quantecon-theme.mystmd/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v1.0.0
