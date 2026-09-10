# PLAN — QuantEcon MyST theme feature parity with `quantecon-book-theme`

This plan tracks bringing the MyST theme (this repo, `quantecon-theme.mystmd` —
formerly `quantecon-theme-src`, and no longer bundled to the now-archived
[`QuantEcon/quantecon-theme`](https://github.com/QuantEcon/quantecon-theme) —
releases ship as GitHub Release zips, see Phase 0) to
feature parity with the Sphinx / Jupyter-Book&lt;2 theme
[`quantecon-book-theme`](https://github.com/QuantEcon/quantecon-book-theme) ahead of
migrating the QuantEcon lectures to MyST (Jupyter Book ≥ 2).

## Context & the one architectural constraint that shapes everything

The two themes run in fundamentally different environments:

| | `quantecon-book-theme` (Sphinx) | `quantecon-theme.mystmd` (MyST) |
| --- | --- | --- |
| Runs | At **build time**, inside the lecture repo | As a **runtime Remix server** consuming pre-built content JSON from the MyST content CDN |
| Has the git repo? | **Yes** — can shell out to `git` | **No** — only sees per-page `mdast` + `frontmatter` JSON |
| Customised via | Jinja templates + a Sphinx extension (`__init__.py`) | React/TSX components + `myst.yml` config |

**Consequence:** any feature that derives from the source repo at build time (git
history, last-modified dates, computed launch paths) **cannot be computed by the
theme**. It must be injected into the page `frontmatter`/data upstream — either by:

- **(A) a MyST plugin / transform** that runs during `myst build` in the lecture repo
  and writes the data into each page's frontmatter, or
- **(B) built-in `mystmd` support** (where it already exists — e.g. frontmatter
  `date`), or
- **(C) a CI step** (GitHub Action) that pre-computes the data and feeds it in.

The theme component's job is then only to *render* `page.frontmatter.<field>`. This
split is called out per phase below. Several phases therefore have an "upstream"
deliverable in addition to the theme change.

A second cross-cutting consideration: this theme tracks the upstream
[`jupyter-book/myst-theme`](https://github.com/jupyter-book/myst-theme) `book` theme.
Before building anything custom, **check whether the feature already exists upstream**
(or could be contributed upstream rather than forked into QuantEcon-only code).

---

## Feature gap summary

Derived from `quantecon-book-theme` v0.20.3 (see its `README.md`, `docs/user/*`, and
`src/quantecon_book_theme/`).

| Feature | Book-theme | MyST theme | Phase |
| --- | :---: | :---: | :---: |
| Git history in lecture headers (last-modified + changelog dropdown) | ✅ | ✅ | **1** |
| Launch parity — Thebe (live compute) in addition to Colab / private hub (BinderHub dropped, #26) | ✅ | ✅ | **2** |
| Code highlighting in the QE token palette (the Pygments-style toggle has no user; deferred) | ✅ | ✅ | **3** |
| Text colour scheme `seoul256` (default; `gruvbox` / `none` / custom have no user; deferred) | ✅ | ✅ | **3** |
| Language switcher (multilingual) + `hreflang` SEO tags | ✅ | ❌ | **4** |
| RTL support (`dir="rtl"`) | ✅ | ❌ | **5** |
| Collapsible stderr warnings in notebook cells | ✅ | ❓ verify | **6** |
| Full OpenGraph / Twitter card meta tags | ✅ | ⚠️ partial | **6** |
| **Already at parity:** dark mode, font scaling, fullscreen, search, "On this page" TOC + back-to-top, contents sidebar, downloads (PDF/notebook), Colab launch, edit-on-GitHub, author header, content-driven footer, responsive/mobile | ✅ | ✅ | — |

**Shipped state (2026-08-20).** Phase 0 completed across
[v2.1.0](https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v2.1.0)–[v2.2.0](https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v2.2.0); Phase 1 and the Thebe half of Phase 2
shipped in [v2.3.0](https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v2.3.0), and Phase 2's launch-config half shipped in
[v2.2.0](https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v2.2.0). Phase 3 landed on `main`
on 2026-09-07 (#89), unreleased. **Phases 4–5 are next.**

---

## Phase 0 — Modernise the release & distribution setup (prerequisite groundwork)

**Status: complete** *(reviewed 2026-08-20)* — pipeline, rename, archive and the only
live consumer all landed. The two unchecked boxes below are deferred by design: the
flagship lecture repos repoint at their own MyST cutover.

**Why first:** the deployed bundle is stuck at v1.1.1 (June 2025) and predates the
entire `@myst-theme` 1.x upgrade. Parity work is meaningless until what's in `main` is
shipped *and* the release loop is trustworthy. This also uses the pre-cutover window —
while the theme has just one consumer (`lecture-wasm`; see the migration checklist below) —
to fix the repo architecture cheaply.

**Decision — collapse to a single repo that distributes GitHub Release zips.** Today the
theme is a two-repo split: source here is built by `make deploy` and pushed to a separate
build repo (`QuantEcon/quantecon-theme`), whose `main`-branch zip lectures download. That
split is inherited from upstream (`jupyter-book/myst-theme` → `myst-templates/book-theme`),
where it exists because upstream is a *monorepo producing many products* (npm packages +
the book & article themes) feeding a *named public registry* — **neither applies to us**
(one theme, consumed by direct URL). Upstream is itself moving off it: their
`theme-assets.yml` ships built theme zips as **GitHub Release assets** "rather than pushing
to the myst-templates/*-theme repos … a step toward using GitHub releases instead"
(jupyter-book/myst-enhancement-proposals#34). So a single repo + release zips tracks where
upstream is heading.

**Target architecture:**
- **One repo**, renamed **`quantecon-theme.mystmd`** (the `.mystmd` suffix marks it as
  `mystmd` tooling/renderer, distinct from content. Note: we deliberately do *not* reuse
  the lectures' `.myst` suffix — that was a transitional RST→MyST marker now being retired
  org-wide.)
- Each release is a `vX.Y.Z` **git tag** + **GitHub Release** with a built **theme zip**
  attached.
- Lectures set `site.template` to a **direct GitHub zip URL** for a pinned release.
- **Deliberate simplification (the caveat):** because lectures consume a *direct URL*, we
  do **not** need the MyST template **registry** or any `myst-cli` template-resolution
  support — those are exactly the parts of the upstream setup we skip. Build a zip, attach
  it to a release, point the URL at it.

**Repo consolidation & rename:**
- [x] Rename `quantecon-theme-src` → **`quantecon-theme.mystmd`** (GitHub 301-redirects the
      old URLs; update the local `origin` remote). *(Done 2026-06-11.)*
- [x] Once releases are live, **archive** the old build repo `QuantEcon/quantecon-theme`
      with a README note pointing to the new repo + release assets; do not reuse the name.
      *(Done 2026-06-11, after `lecture-wasm` was repointed in
      [lecture-wasm#48](https://github.com/QuantEcon/lecture-wasm/pull/48).)*
- [x] Retire the `make deploy` / `build-theme` / `deploy-theme` Makefile targets (replaced
      by the release workflow); keep a local `make build-zip` for testing the artifact.
      *(Done in [#81](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/81):
      deploy targets removed; `build-theme` retained for the test harness but now
      assembles locally instead of cloning the archived repo; `build-zip` added.)*

**Release pipeline (adapt upstream `theme-assets.yml`):**
- [x] Add a workflow that, on a `vX.Y.Z` tag, builds (`npm run prod:build`), assembles the
      bundle (`build/ public/ template.yml server.js package.json` with `template`→name and
      `VERSION` substituted, plus `package-lock.json`, **excluding** `node_modules`), zips it,
      and attaches it to the GitHub Release for that tag. Upstream's `theme-assets.yml` is a
      near-verbatim reference — drop its `for THEME in book article` loop (one theme).
      **Done in [#77](https://github.com/QuantEcon/quantecon-theme-src/pull/77)** —
      `.github/workflows/release.yml`: tag-triggered, guards tag ↔ `package.json` version,
      requires (and uses as release notes) the version's `CHANGELOG.md` section.
- [x] Verify `myst start` resolves `site.template: <release-asset-url>` once (a release zip
      is just an HTTPS zip — the same mechanism today's `archive/refs/heads/main.zip` uses — so low risk).
      **Verified 2026-06-11** against the v2.1.0 release URL: `myst start` downloaded,
      built, and served the visual fixture with the released theme.

**Versioning & changelog:** *(remaining work tracked in [#71](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/71))*
- [x] Make `vX.Y.Z` **tags** the release trigger *(trigger wired up in
      [#77](https://github.com/QuantEcon/quantecon-theme-src/pull/77))*; tag existing releases
      retroactively at their source commits (recorded in the old build repo as
      `🚀 vX.Y.Z from <sha>`) so the `CHANGELOG.md` footer compare/release links resolve.
      *(Retro-tagged 2026-06-11: v1.0.0–v1.1.1 + v2.0.0 pushed at their verified source
      commits — each commit's `package.json` matches its tag; v1.1.0 uses the later of its
      two deploys — with `release.yml` temporarily disabled so historical tags triggered no
      runs. Compare links verified resolving.)*
- [x] **Versioning = manual Keep a Changelog + git tags (decided — Changesets dropped).**
      Remove `.changeset/`, rewrite `release.yml` as the tag-triggered build/release workflow,
      and **document** the bump → changelog → tag process in `CONTRIBUTING.md`. (Rationale:
      single non-npm artifact + small team, so Changesets' monorepo/npm payoffs don't apply
      and its generated changelog clashes with our curated one; also matches every other
      QuantEcon repo. "Manual" = version + changelog + tag only — build → zip → Release stays
      automated by the tag trigger.)
      **Status:** done in [#72](https://github.com/QuantEcon/quantecon-theme-src/pull/72) —
      removed `.changeset/`, dropped `@changesets/cli` + the `changeset`/`version` scripts,
      migrated the pending entries into `CHANGELOG.md` `## [Unreleased]`, documented the manual
      flow in `CONTRIBUTING.md`, and closed the stale Changesets PR #69. The tag-triggered
      `release.yml` (the build → zip → Release pipeline above) landed in
      [#77](https://github.com/QuantEcon/quantecon-theme-src/pull/77).
- [x] Fold the `template.yml` `version` bump into the release step so it can no longer drift
      from `package.json` (done in [#77](https://github.com/QuantEcon/quantecon-theme-src/pull/77):
      the workflow stamps `template.yml`'s `version` from `package.json` into the bundle, and
      fails if the tag doesn't match `package.json`).

**Cut 2.0.0 (quick deploy now, then re-release on the new flow):**
- [x] **Now (decided — quick deploy first):** bump `package.json` to **2.0.0** (the
      `@myst-theme` 1.3.0 upgrade, Node 24 toolchain, consolidated dependency/security
      updates, and technical-review fixes — all now merged to `main`) and run the existing
      `make deploy` to the old build repo to get consumers off v1.1.1 **today**. This interim
      deploy is throwaway (the build repo is being retired) — accepted for speed.
      **Done:** `package.json` at 2.0.0; deployed to `QuantEcon/quantecon-theme` as
      `2ca0a12` (`🚀 v2.0.0 from 2cf3456`).
- [x] **After the pipeline lands:** re-publish `v2.0.0` (or the next version if changes have
      accrued) as the first release through the new tag-triggered flow on the renamed repo,
      then retire `make deploy`.
      **Done 2026-06-11:** changes had accrued, so the first pipeline release is
      [`v2.1.0`](https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v2.1.0)
      (prepared in [#79](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/79)) —
      asset, release notes, and bundle version stamps all verified. Retiring `make deploy`
      waits for the consumer migration below.

**Consumer migration (unblocked at `v2.1.0`; the live consumer now tracks `v2.3.0`):**
- [x] Repoint the **only current consumer**, `QuantEcon/lecture-wasm`
      ([`lectures/myst.yml:120`](https://github.com/QuantEcon/lecture-wasm/blob/main/lectures/myst.yml#L120)),
      from `…/quantecon-theme/archive/refs/heads/main.zip` to the new pinned release URL
      (`…/quantecon-theme.mystmd/releases/download/v2.1.0/quantecon-theme.zip`); verify
      `myst start` / `myst build --html` renders it.
      *(Done in [lecture-wasm#48](https://github.com/QuantEcon/lecture-wasm/pull/48):
      verified locally via `myst start` + the PR's Netlify preview; superseded
      [lecture-wasm#47](https://github.com/QuantEcon/lecture-wasm/pull/47), closed. The
      Netlify app's duplicate auto-build fails independently —
      [lecture-wasm#49](https://github.com/QuantEcon/lecture-wasm/issues/49).)*
      *(Bumped to the `v2.3.0` pin in
      [lecture-wasm#67](https://github.com/QuantEcon/lecture-wasm/pull/67), merged
      2026-08-20, so the only consumer tracks the current release.)*
- [x] **Order matters** — migrate the consumer *before* archiving the old build repo:
      land pipeline → publish the first release (`v2.1.0`) → repoint `lecture-wasm` → then
      archive `QuantEcon/quantecon-theme`. *(Order held.)*
- [ ] The flagship lecture repos (`lecture-python.myst`, `lecture-julia.myst`,
      `lecture-datascience.myst`, `lecture-python-advanced.myst`, …) still use the Sphinx
      `quantecon-book-theme` and are **not** consumers yet — each gets repointed as it cuts
      over to MyST/JB≥2, not in this phase. *(Still the case at 2026-08-20.)*
- [ ] *(FYI, no action)* `QuantEcon/workflow-backups` only carries the repo-name glob
      `quantecon-.*`, which already matches the new name.

**Hygiene carried over:**
- [x] Fix naming/branding drift: package name **reconciled to `@quantecon/lecture-theme`**
      across `package.json` + `template/package.json` in
      [#72](https://github.com/QuantEcon/quantecon-theme-src/pull/72); `template.yml`
      `title`/`source` aligned with the renamed repo in
      [#79](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/79).
- [x] De-duplicate the two "Development" sections in `README.md` and update the Usage URL to
      the pinned-release form ([#79](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/79)).
- [x] Triaged & consolidated the ~20 Dependabot PRs into a single lockfile refresh
      ([#55](https://github.com/QuantEcon/quantecon-theme-src/pull/55)–58; `npm audit`
      68 → 45). The remaining findings need the framework migration, retargeted in June
      2026 from Remix v2 to **React Router 7** and gated on upstream `jupyter-book/myst-theme`
      ([#28](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/28); see `SECURITY.md`).
- [x] Stand up a **visual preview / smoke test** against a real lecture repo (the book-theme
      uses `quantecon-book-theme-fixtures` + Playwright + Netlify previews — a lighter MyST
      equivalent would de-risk every later phase).
      **Status:** the CI gate landed in
      [#78](https://github.com/QuantEcon/quantecon-theme-src/pull/78) — a `visual` job
      pixel-diffs the fixture on every PR (desktop + mobile + sidebar-open), with
      `/update-snapshots` comment-triggered baseline refresh, mirroring the book-theme's
      setup. The rendered preview is **GitHub Pages, not Netlify** (self-contained,
      `GITHUB_TOKEN` only — the org-secrets blocker is gone): `preview.yml` builds
      `lecture-python-programming` with the PR's theme via static `myst build --html`
      (the export/hydration path Playwright's live `myst start` never exercises),
      deploys to `gh-pages` under `pr-preview/pr-<n>/`, sticky-comments the link, and
      tears down on close. The content repo is still a legacy Jupyter Book, so the
      build-time `myst init` upgrade doubles as a migration-readiness check (open
      question 4). Playwright remains the only gate; the preview is qualitative.

**Decisions (resolved):** (1) **versioning** — manual Keep a Changelog + git tags (Changesets
dropped); (2) **consumer URL** — pinned per-lecture tag URLs
(`…/releases/download/vX.Y.Z/quantecon-theme.zip`); (3) **2.0.0** — quick `make deploy` now,
then re-release via the new pipeline; (4) **execution split** — the maintainer performs the
repo rename + archiving and pushes the `vX.Y.Z` tag via `gh`; the tag-triggered workflow then
creates the GitHub Release and uploads the zip asset; all code/workflow/docs land as PRs first.

**Effort:** M (pipeline + rename + consumer migration). **Risk:** low–medium (one-time
release-flow change; upstream reference implementation exists). **Deps:** none — best done
now, pre-cutover, while only `lecture-wasm` points at the theme.

---

## Phase 1 — Git history in lecture headers ⭐ (flagship)

**Status: shipped in [v2.3.0](https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v2.3.0)** — the build-time plugin and the header
control landed together in
[#83](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/83). The one unchecked
box below is a maintainer decision, not outstanding build work (open question 2).

**Goal:** reproduce the book-theme's page header: a "Last changed: &lt;date&gt;" control
that expands a changelog dropdown of the last N commits, with clickable commit hashes
and a "full history" link.
**Reference:** `quantecon-book-theme/src/quantecon_book_theme/__init__.py`
(`get_git_last_modified`, `get_git_changelog`, `get_relative_time`) +
`theme/.../layout.html` lines ~278–305 + `assets/scripts/page-header.js` +
`docs/user/git-metadata.md`.

**Upstream (build-time) deliverable — required:**
- [x] Investigate existing `mystmd` support for last-modified / git metadata in
      frontmatter before writing anything custom.
      *Finding (2026-06-12):* none built in — jupyter-book/mystmd#2213 is open with no
      traction. Plugin transforms can't inject **frontmatter** either (page frontmatter
      is extracted before `document`-stage transforms run), so the plugin attaches to
      the page AST (`mdast.data.git_metadata`), which flows into the page JSON intact.
      Per-page `site:` frontmatter also passes through (validated as a plain object) —
      used as the manual override / deterministic-fixture channel.
- [x] If absent, build a **MyST plugin** (option A) that, during `myst build`, runs
      `git log --follow` per source file and injects
      `{ last_modified, changelog: [{hash, short_hash, author, date, message}] }`.
      Mirrors the book-theme's git logic (5s timeout, `--follow`, graceful no-git/
      untracked fallback, `QE_GIT_METADATA_MAX` for max entries; relative time is
      computed at render so it can't go stale). → `plugins/git-metadata.mjs`, with a
      node-level e2e (`npm run test:plugin`) that builds a throwaway project with the
      real `myst` CLI.
- [x] Decide where the plugin lives. **Resolved (2026-08-24, open question 2 in
      [#93](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/93)): this repo
      is the permanent home.** The plugin is theme-coupled — the theme renders what it
      emits — so it versions with the theme, and lecture repos load it by URL pinned to
      the theme release tag they build with instead of vendoring copies:
      `https://raw.githubusercontent.com/QuantEcon/quantecon-theme.mystmd/<tag>/plugins/git-metadata.mjs`.
      A shared `quantecon-myst-plugins` repo is revisited only if a second,
      non-theme-coupled plugin ever appears.

**Theme (render) deliverable:**
- [x] New `app/components/PageHeaderHistory.tsx` (rendered from `ProjectFrontmatter.tsx`)
      that reads the injected AST data (or the `site.git_metadata` page-frontmatter
      override) and renders the button (aligned right of the author line) + an
      inline changelog, with the QuantEcon blue accent, dark mode, keyboard
      (Esc to close, focus returned to the trigger), and the ARIA disclosure
      pattern. Design settled on review (jstac + DrDrij, 2026-08-04): the panel
      expands *above* the header's blue divider, pushing it down — adjacent to
      its toggle and clear of the lecture content, matching the current
      `quantecon-book-theme` dropdown. An earlier centred modal was rejected.
- [x] Build commit/history URLs from the project `github` field — commit links keep the
      `.myst` suffix (they target the source repo, unlike `LaunchButton.tsx`'s notebook
      URLs), and the full-history link derives from the mystmd-computed `source_url`.
- [x] Graceful no-op when the metadata is absent.

**Effort:** M–L (plugin is the bulk). **Risk:** medium (new upstream component).
**Deps:** Phase 0 preview harness helps validate against a real repo.

---

## Phase 2 — Launch parity (Thebe + launch config)

**Status: complete** — the launch-config generalisation shipped in
[v2.2.0](https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v2.2.0) via
[#97](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/97), and in-page Thebe
in [v2.3.0](https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v2.3.0) via
[#98](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/98). Tracking issue #88
closed 2026-08-20.

**Goal:** match the book-theme's launch matrix. `LaunchButton.tsx` offered **Colab** +
**private JupyterHub** only; the book-theme also offered **BinderHub** (decided against,
#26) and in-page **Thebe** live compute.
**Reference:** `quantecon-book-theme/src/quantecon_book_theme/launch.py` (Binder/Hub/
Colab URL construction, `notebook_interface`, `nb_path_to_notebooks`, `path_to_docs`
stripping) + `docs/user/launch.md`.

- [x] **Thebe:** in-page live compute enabled via `project.thebe` config in `myst.yml`.
      The infra was already wired (`Page.tsx` `ComputeOptionsProvider` + `ThebeLoaderAndServer`;
      `PageContent.tsx` `ExecuteScopeProvider` + `NotebookToolbar`); enablement is config-derived
      (`compute.enabled = !!thebeFrontmatterToOptions(project.thebe)`, no runtime setter), so
      setting `project.thebe` surfaces the `@myst-theme/jupyter` NotebookToolbar (the **Power**
      toggle, then Run/Restart/Clear once a kernel connects) on notebook pages — **portaled into
      the QuantEcon header toolbar** next to Launch (`ComputeToolbarSlot.tsx` renders it via
      `createPortal` into `#qe-compute-slot` in `Toolbar.tsx`; `app.css` neutralises the default
      floating pill and matches the 20px header icons), so it sits in the fixed header always
      visible while scrolling. The portal keeps the component inside the Thebe providers (React
      context flows through the React tree, not the DOM) even though the header is mounted outside
      them — avoiding a provider-tree lift. That header toggle **is** the "live compute"
      control. The QuantEcon default is **JupyterLite** (`thebe: { lite: true }`): Python
      in the browser via Pyodide, no server/Binder (avoids the flaky Binder, see #26). Verified
      end-to-end (Power → Pyodide kernel boots in-browser). Pyodide caveat documented in the README
      (numba/JAX unavailable). Fixture sets `thebe.lite`; `tests/visual/theme.spec.ts` asserts the
      toggle renders; `notebook.png`/`launch-open.png` snapshots refreshed. A second fixture
      (`tests/visual/fixture-no-thebe/`, served on a second port) asserts the toggle is **absent**
      on a notebook page when a project doesn't set `project.thebe` (the disabled path).
- [x] ~~**BinderHub:** add a Binder option to the `LaunchButton` radio group~~
      **Decided against (2026-06-12):** BinderHub proved flaky in practice, and Colab
      is the launch target QuantEcon standardises on — primarily because it provides
      **GPU access** for the lectures that need it. #26 stays open as a demand-driven
      future request (an implementation existed in PR #86 and was stripped before
      merge — recoverable from that history if demand appears). The Private
      JupyterHub option was **removed in #87** (2026-08-26), collapsing the
      launcher to a direct Colab link — see the note below.
- [x] Generalise the hardcoded `.notebooks` suffix and `main` branch into config under
      `site.options` in `myst.yml` (MyST's analog of the book-theme `html_theme_options`),
      so non-default branches and naming work. New optional keys (defaults reproduce the
      historical behaviour, so existing lectures are unchanged): `launch_repo_suffix`
      (default `.notebooks`), `launch_branch` (default `main`), plus `launch_repo_url`
      to point at an arbitrary notebook repo (book-theme `nb_repository_url` parity).
      URL logic extracted to pure, unit-tested builders in `launchUrls.ts`; applies to
      the Colab launch URL (and, until #87 removed it, the private-JupyterHub
      URL). Done in [#97](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/97).
- [x] Fix Colab path handling for **nested** lecture dirs: strip the source
      extension robustly (the old `page.location.split('.')[0]` truncated paths/dirs
      containing a dot), strip `launch_source_path` (book-theme `path_to_docs`) and
      prepend `launch_notebooks_path` (book-theme `nb_path_to_notebooks`). Covered by
      `tests/unit/launch-urls.test.mjs` (same PR,
      [#97](https://github.com/QuantEcon/quantecon-theme.mystmd/pull/97)).

**Note:** the Private JupyterHub option was **removed (#87, 2026-08-26)** and the launcher
is now a direct Colab link. The demand signal it was gated on came back empty: no lecture
repo has ever set the book-theme's `jupyterhub_url`, so that button never rendered on a live
site, while the MyST version shipped a hand-typed URL box that hardcoded the `/jupyter/hub/`
path and so only worked for one hub layout. Re-adding hub, Binder and local-server targets
properly is tracked as future work — see the enhancement issues linked from #87.

**Effort:** M. **Risk:** low–medium. **Deps:** Phase 0.

---

## Phase 3 — Code highlighting + text colour schemes

**Status: complete** *(2026-09-07, #89 via #171)* — defaults only, by design. Before building,
the scoping pass on #89 found that no lecture repo sets `qetheme_code_style` or
`color_scheme`: every live site runs the defaults, so parity is the default rendering,
applied unconditionally, and the switch surface (Pygments toggle, `gruvbox` / `none`,
the custom-CSS hook) has no user and is deferred until one appears. Both goals ship as
CSS in `styles/quantecon.css`, where the token mapping is documented.

Two related theming features; bundle together since both touch the CSS/token layer.

**Goal A — configurable code highlighting:** book-theme `qetheme_code_style` toggles
between custom QuantEcon token colours and any built-in Pygments style.
**Goal B — text colour schemes:** book-theme ships `seoul256` (default), `gruvbox`,
`none`, plus a `custom_color_scheme.css` hook, exposed as CSS variables
(`--qe-literal-color`, emphasis/strong/definition colours).
**Reference:** book-theme `__init__.py` (`add_pygments_style_class`,
`setup_pygments_css`, `validate_color_scheme`), `assets/styles/_color-schemes.scss` /
`_syntax.scss`, `docs/user/code-highlighting.md`, `docs/user/text-color-schemes.md`.

- [x] Map the book-theme colour-scheme CSS variables onto this theme: `--qe-emphasis-color`,
      `--qe-strong-color`, `--qe-definition-color` beside the existing `--qe-literal-color`,
      light and dark, with `em` / `strong` / `dt` rules in `styles/quantecon.css` (not
      `tailwind.config.js`: they are element rules, not utilities).
- [x] Decide the code-highlighting strategy. The premise was wrong: MyST highlights with
      **highlight.js** (react-syntax-highlighter's async build over lowlight), not prism, and
      the async build inlines nothing, so the `hljs-*` classes are themable in CSS. The QE
      Pygments palette is mapped scope by scope, light and dark; the mapping and its two
      gaps (Pygments `.o` operators and `.nn` module names have no highlight.js scope) are
      in the stylesheet's CODE HIGHLIGHTING comment.
- [ ] *Deferred:* a `myst.yml` option to select a scheme, rendered as a root class the way
      the book-theme does. Not built because no consumer sets one; when asked for, it is a
      class that re-points the four tokens.

**Effort:** M. **Risk:** medium (visual regressions — needs the Phase 0 preview).
**Deps:** Phase 0.

---

## Phase 4 — Internationalisation (language switcher + hreflang)

**Goal:** book-theme v0.20.0 globe-icon dropdown to switch between translated lecture
sites, plus `<link rel="alternate" hreflang>` head tags for SEO. Only renders with 2+
languages configured.
**Reference:** book-theme `_process_languages()` in `__init__.py`, `layout.html`
hreflang block + language-switcher markup, `assets/scripts/language-switcher.js`,
`assets/styles/_language-switcher.scss`, `docs/user/rtl-support.md`,
`docs/developer/multilingual.md` + `infrastructure.md`.

- [ ] Add a `languages` config (list of `{code, name, url}`) to `myst.yml`/site config,
      surfaced to the theme via the site manifest loader (`loaders.server.ts`).
- [ ] New toolbar `LanguageSwitcher.tsx` (Radix dropdown), placed consistently in
      `Toolbar.tsx` / `MobileActionsMenu.tsx`, with keyboard nav + active-language marker.
- [ ] Inject `hreflang` alternates in `root.tsx` `links`/`meta` for each language +
      `x-default`.

**Effort:** M. **Risk:** low. **Deps:** none (independent of 1–3).

---

## Phase 5 — RTL support

**Goal:** book-theme `enable_rtl` sets `dir="rtl"` on `<body>` and ships `_rtl.scss`.
**Reference:** book-theme `layout.html` `body_tag` block + `assets/styles/_rtl.scss` +
`docs/user/rtl-support.md`.

- [ ] Add a config flag; set `dir="rtl"` on the document in `root.tsx`.
- [ ] Audit Tailwind utilities for logical-property / RTL correctness (margins, the blue
      left/right accents, toolbar ordering); add RTL overrides where physical properties
      leak.

**Effort:** S–M. **Risk:** low. **Deps:** ideally after Phase 4 (often shipped together
for the same translated sites).

---

## Phase 6 — Meta/SEO + notebook-output polish

**Goal:** close the smaller gaps and verify assumptions.

- [ ] **OpenGraph/Twitter parity:** the book-theme emits a full OG + Twitter card set;
      `root.tsx` currently uses `getMetaTagsForSite` (title/description/twitter). Add
      `og:image`/`twitter:image` (logo), `og:type`, `og:site_name`, etc., driven from
      site config.
- [ ] **Collapsible stderr warnings:** confirm whether `@myst-theme/jupyter` already
      renders notebook stderr in a collapsible/styled way (it may — verify before
      porting). If not, add an output transform/renderer.
- [ ] **Docs:** add a `docs/`-style feature reference for the MyST theme mirroring the
      book-theme's `docs/user/*` set, so downstream lecture maintainers have parity
      documentation.

**Effort:** S–M. **Risk:** low. **Deps:** none.

---

## Sequencing & dependencies

```
Phase 0  (hygiene/deploy + preview harness)  ── prerequisite  ✅ shipped
   │
   ├─▶ Phase 1  Git history in headers          ⭐ ✅ shipped v2.3.0
   ├─▶ Phase 2  Launch parity (Thebe + config)     ✅ shipped v2.2.0 / v2.3.0
   ├─▶ Phase 3  Code highlight + colour schemes     ✅ on main 2026-09-07 (unreleased)
   ├─▶ Phase 4  i18n (language switcher) ──▶ Phase 5  RTL  (commonly shipped together)  ← next
   └─▶ Phase 6  Meta/SEO + stderr + docs
```

Suggested order: **0 → 1 → 2 → 3 → (4 → 5) → 6**. Phases 0–2 are shipped as of
[v2.3.0](https://github.com/QuantEcon/quantecon-theme.mystmd/releases/tag/v2.3.0) (2026-08-20) and Phase 3 is on `main`, so **Phases 4–5 are next**. Phases 4–6 are largely
independent of one another and can be parallelised across contributors. Per open
question 4's resolution below, all of Phases 3–6 gate the all-at-once lecture
migration — they are cutover blockers, not optional polish.

## Open questions for maintainers — all resolved

*Tracked in [#93](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/93),
closed 2026-08-24 with all four questions decided; the resolutions are recorded
inline below.*

1. **Upstream-first?** Several of these (git metadata rendering, language switcher,
   RTL) could be contributed to `jupyter-book/myst-theme` rather than kept QuantEcon-only.
   Which features are worth upstreaming vs forking?
   **Resolved (2026-08-24): local-first.** Every feature lands in this repo first;
   upstreaming is a deferred later phase, so it never blocks deploying and upgrading
   mystmd for the lecture series. Candidates are tracked in
   [`UPSTREAM-CANDIDATES.yml`](UPSTREAM-CANDIDATES.yml), a feature-level registry with
   the same status lifecycle as the QuantEcon `mystmd` fork's
   `quantecon/UPSTREAM-PRS.yml` — but with local PRs recorded as provenance rather
   than cherry-pick lists, since this repo is not a fork of `jupyter-book/myst-theme`
   and features must be ported, not replayed.
2. **Plugin home:** should the build-time git-metadata plugin (Phase 1) live in a shared
   `quantecon-myst-plugins` repo consumed by every lecture repo, or per-repo?
   **Resolved (2026-08-24): this repo, permanently.** Only one plugin exists
   (`plugins/git-metadata.mjs`) and it is theme-coupled, so it stays here and versions
   with the theme; lecture repos reference it by tag-pinned URL rather than vendoring
   copies. A shared plugins repo is revisited only if a second, non-theme-coupled
   plugin ever appears.
3. **Compute model:** how much of the launch story moves to in-page Thebe vs external
   Colab/Binder/Hub, given infra cost and the existing `.notebooks` convention?
   **Answered in practice (2026-08-20):** external launch is **Colab** (BinderHub dropped,
   #26; the private hub stays for now, #87), and in-page compute is **Thebe with
   JupyterLite/Pyodide** as the QuantEcon default — both shipped in Phase 2. What remains
   has its own carriers: toggle placement and integration (#128) and per-lecture
   enablement with compatibility testing (#114).
4. **Scope for first migration:** which lectures migrate to JB≥2 first, and which subset
   of phases must land before that cutover (Phase 1 git-history is likely a must-have)?
   **Resolved (2026-08-24): all-or-nothing.** No per-lecture staging — every lecture
   series migrates at once, onto a single common publishing base, once feature parity
   is complete (single maintenance surface). The cutover gate is therefore the full
   remaining milestone — Phases 3–6 ([#89](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/89)–[#92](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/92))
   — plus migration readiness ([#114](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/114),
   [#128](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/128),
   [#87](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/87)). The gate is
   tracked as a whole in [#147](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/147).
   The live-compute and static-build defects that blocked the shipped surface
   ([#117](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/117),
   [#138](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/138)) are fixed and
   ship in v2.3.1.
