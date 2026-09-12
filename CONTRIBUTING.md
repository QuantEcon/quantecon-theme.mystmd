# Contributing to quantecon-theme.mystmd

Thank you for your interest in contributing to the QuantEcon theme!

## Prerequisites

- **Node.js** — `.nvmrc` pins **24**, matching the CI runner. Running the unit tests (`npm run test:unit`)
  additionally requires **Node ≥ 23.6**, which strips TypeScript on the fly so the
  tests can import the `.ts` builders without a build step — this matches the CI
  Node 24 runner. The built theme itself still supports Node ≥ 20 (`engines.node`).
- **npm** — whatever ships with Node 24; the lockfile is `lockfileVersion` 3.
- **mystmd** on `PATH` for the visual and FOUC suites (`npm install -g mystmd`), which
  build and serve the fixture. `npm run test:plugin` *skips* rather than fails without
  it, so a green run there does not mean it executed.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/QuantEcon/quantecon-theme.mystmd.git
cd quantecon-theme.mystmd

# Install dependencies
npm install

# Start the development server (with hot reload)
npm run dev
```

The dev server runs at `http://localhost:3000` by default.

## Available Scripts

| Command             | Description                                      |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Start dev server with CSS watch + hot reload     |
| `npm run prod:build`| Production build (CSS + Thebe assets + Remix)    |
| `npm run compile`   | TypeScript type-check (`tsc --noEmit --skipLibCheck`) |
| `npm run test:unit` | Pure-function unit tests (`node --test`, Node ≥ 23.6) |
| `npm run test:plugin` | End-to-end test of `plugins/git-metadata.mjs` (needs `myst`) |
| `npm run test:visual` | Playwright pixel-diff suite against the fixture |
| `npm run test:visual:update` | Refresh the local (`-darwin`) baselines |
| `npm run test:fouc` | WebKit first-paint guard (`webkit-fouc` project) |
| `npm run build:css` | Tailwind build only (`styles/app.css` → `app/styles/app.css`) |
| `npm run format`    | Format code with Prettier                        |
| `npm run clean`     | Remove build artifacts                           |

## Project Structure

```
app/
  backend/       # Server-side loaders (Remix loader functions)
  components/    # React components (toolbar/, sidebar, page layout)
  hooks/         # Custom React hooks
  routes/        # Remix route modules
  root.tsx       # App shell (document head, theme providers)
styles/
  app.css        # Tailwind CSS entry point
public/          # Static assets (logos, Thebe bundles)
patches/         # patch-package patches for upstream fixes
```

## Architecture: what the theme can and cannot compute

The two QuantEcon themes run in fundamentally different places, and one
consequence of that shapes most feature work here.

| | `quantecon-book-theme` (Sphinx) | this theme (MyST) |
| --- | --- | --- |
| Runs | at **build time**, inside the lecture repo | as a **runtime Remix server**, over pre-built content JSON |
| Sees the git repo? | **yes** — it can shell out to `git` | **no** — only each page's `mdast` and `frontmatter` |
| Customised through | Jinja templates and a Sphinx extension | React components and `myst.yml` |

**So any feature derived from the source repository cannot be computed by the
theme.** Git history, last-modified dates and computed launch paths all have to
reach it as data, put there by one of:

- a **MyST plugin or transform** that runs during `myst build` in the lecture
  repo and writes the value into the page's frontmatter — `plugins/git-metadata.mjs`
  is the one this repo ships;
- **built-in mystmd support**, where it already exists (frontmatter `date`, say);
- a **CI step** that pre-computes the value and feeds it in.

The component's job is then only to render what it was given. When a feature
looks impossible here, this is usually why, and the fix belongs upstream of the
theme.

## Upstream first, then here

This theme tracks upstream
[`jupyter-book/myst-theme`](https://github.com/jupyter-book/myst-theme)'s `book`
theme. **Before building anything custom, check whether it already exists
upstream** — or whether it could be contributed there rather than kept as
QuantEcon-only code.

Where it does not, build it here first: nothing waits on an upstream release.
Record what could later be upstreamed in
[`UPSTREAM-CANDIDATES.yml`](./UPSTREAM-CANDIDATES.yml), the feature-level
registry, noting the local PR as provenance. This repo is not a fork of
`jupyter-book/myst-theme`, so a candidate has to be ported rather than
cherry-picked.

## Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Run type-checking** before committing:
   ```bash
   npm run compile
   ```

3. **Test a production build** to catch build-time issues:
   ```bash
   npm run prod:build
   ```

4. **Open a Pull Request** against `main`. CI will run type-check and build automatically.

## Patching a dependency

Some fixes have to land inside an installed package — usually an upstream bug we
need before upstream can ship it. Those live in `patches/` and are applied by
[patch-package](https://github.com/ds300/patch-package) from the `postinstall`
script, so every `npm ci` re-applies them.

To add or update one:

```bash
# 1. edit the file in place under node_modules/<pkg>/…
# 2. capture the diff
npx patch-package <pkg> --patch-dir patches
# 3. prove it: reverse it, watch the guard test fail, re-apply
npx patch-package --patch-dir patches --reverse && npm run test:unit
npx patch-package --patch-dir patches && npm run test:unit
```

Two rules make patches safe to live with:

- **Write a test that fails without the patch.** A patch that silently stops
  applying is worse than no patch — the package looks installed and behaves
  wrongly. `tests/unit/execute-nested-cells.test.mjs` is the pattern: it imports
  the patched file directly, so it fails if the patch is missing. `test:unit`
  runs in CI *and* in `release.yml`, so the published bundle is covered too.
- **Expect a version warning, not a failure.** Patch filenames pin the version
  they were generated against. When a caret range floats to a newer patch
  release, patch-package still applies the patch and prints a mismatch warning;
  that is why the guard test matters. Upstream the fix so the patch can be
  dropped, and note the upstream PR in the patch's own comments.

The theme is bundled with `serverDependenciesToBundle: [/.*/]`, so patched code
is inlined into `build/` and ships in the release zip — consumers get the fix
without installing anything.

## Execution model: where code cells can live

The theme registers executable `{code-cell}` blocks with the kernel wherever
they sit in the page AST — top-level or nested inside a directive — via the
`@myst-theme/jupyter` patch above. Cells are registered depth-first in
**document order**, which is execution order, so the in-page notebook's cell
sequence matches the source document 1-to-1 (nested cells also participate in
*Run all*). Only `{embed}` subtrees are skipped: their cells belong to another
page's notebook.

Nesting is unavoidable, because mystmd's gated directive syntax does not keep
cells at the AST root. `{solution-start}`/`{solution-end}` (and the `exercise`
equivalents) are authoring-level sugar resolved at parse time: the transform
folds the gated content back **under** the `solution` node, and no `gate`
attribute survives. Both authoring styles below produce the identical AST —
verified against myst v1.10.1 (qe-v10):

```
block[kind=notebook-code]        ← top-level cell
block
  solution                        ← {code-cell} inside a {solution} body
    block[kind=notebook-code]
  solution                        ← {code-cell} between solution-start/end gates
    block[kind=notebook-code]
```

This differs from the Sphinx world, where `sphinx-exercise` gates exist
precisely so myst-nb sees a top-level cell — that rationale does not carry over
to mystmd's rendered AST, so downstream code must never assume gated authoring
avoids nesting. Gated syntax remains the preferred *authoring* convention in
the lecture sources (cleaner jupytext-style round-trips, consistency with the
Sphinx-era repos), but the theme treats both styles identically. Making gated
cells genuinely root-level in the AST would be an upstream mystmd transform
change, not a theme or content fix.

## Code comments

Comments explain the code as it stands: what it does, and why it is written
that way when the code alone does not say. How it came to be written belongs
in git — the commit message, the PR and `CHANGELOG.md` — where it stays
accurate; a comment that narrates a project phase goes stale once the work is
done.

This applies to comments in code — including the comments in YAML, shell and
fixture files. Prose documentation (`README.md`, `docs/`, the test suite's own
`README.md`) is written for a reader who wants the project's history, and keeps
it — as does `PLAN.md`, which is a closed planning record rather than a live
one.

- **No project framing.** No phase numbers, `PLAN.md` items or milestones, and
  no issue number used as a label for the work that produced the code.
  `git log -L` traces any line back through the PRs that shaped it.
- **Link an issue only when the thread carries more than the comment can.**
  An upstream bug being worked around, a field a fork adds, the regression a
  test exists to catch, the measurements a claim rests on, an open decision
  that will change the code. State the point itself in the comment as well, so
  the comment stands on its own if the link rots.
- **Reasons, not comparisons.** "Matches the Sphinx build" on its own does not
  tell the next reader what breaks if the value changes. Give the reason: the
  measurement, the contrast ratio, the layout constraint.

  A constraint from another system *is* a reason, and naming it is not project
  framing — this theme reproduces the deployed Sphinx lecture sites, so for a
  value derived by measuring them, that derivation is the reason and belongs in
  the comment: `/* 14.4px: the lecture builds' .8rem of an 18px root */`. What
  the rule rules out is the bare comparison that leaves the number unexplained.

  Code ported from another project gets one line of provenance where the port
  starts.

### Matching the lecture builds, and when not to

Most values in `styles/quantecon.css` are measurements of the deployed Sphinx
lecture sites, and most inherited colours come from `quantecon-book-theme`'s
own palettes. The rule the theme follows is: **match them, except where
matching them would fail WCAG.** Where it diverges it says so, with the
measurement, so the next reader does not "restore parity" and reintroduce the
problem. The existing divergences are the model:

- the outline's resting entries stay undimmed at 10.3:1, where the Sphinx panel
  composites its own to 4.47:1;
- the outline's active entry carries weight and a rule as well as colour, so the
  state is not colour-only (WCAG 1.4.1);
- the dark footer link is blue-300, because the inherited `#0072bc` composites
  to 2.2:1 at the footer's opacity;
- content is a flat 18px off a `rem` root, rather than the Sphinx builds'
  px root, which is a WCAG 1.4.4 problem;
- content links keep a resting underline, where the lecture builds underline
  on hover only, because the link colour is 2.02:1 (light) and 1.49:1 (dark)
  against the body text and colour alone cannot mark a link (WCAG 1.4.1);
- the footer's text, and its light-mode link, are darker than the lecture
  builds' (`#3b3b3b` and `#00436f`, `#b5b5b5` in dark mode), because the
  inherited values composite to 4.17:1, 3.01:1 and 3.92:1 at the footer's
  70% opacity.

Changing an inherited value for any *other* reason is a two-theme decision, not
a fix this repo makes alone — it would reintroduce a difference against the live
sites. Open an issue instead (see #172 for the code palette). When you compute a contrast ratio, composite any `opacity` on the
element first: the declared colour is not what the reader sees.

## CI: visual tests and PR previews

Two things run on every pull request.

**The visual gate.** A `visual` job pixel-diffs the fixture (desktop, mobile and
sidebar-open) against the committed baselines in
`tests/visual/__snapshots__`. Baselines are platform-suffixed: refresh the
`-linux` ones by commenting `/update-snapshots` on the PR, and the `-darwin`
ones locally with `npm run test:visual:update`. Playwright is the only gate.

**The rendered preview.** `preview.yml` builds a real lecture site —
`QuantEcon/lecture-python-programming` — with the PR's theme, through a static
`myst build --html`. That is the export path a live `myst start` never
exercises, so the preview catches static-build defects the Playwright suite
cannot. It deploys to the `gh-pages` branch under `pr-preview/pr-<n>/`,
sticky-comments the link, and tears the directory down when the PR closes. It
needs no org secrets, only `GITHUB_TOKEN`.

The content repo is still a legacy Jupyter Book, so the workflow's `myst init`
step doubles as a migration-readiness check: if the Jupyter Book upgrade breaks
on real lecture content, the preview build is where it shows. The preview is
qualitative — it is not a gate.

## Commit Convention

We use conventional commits:

- `fix:` — Bug fixes
- `feat:` — New features
- `chore:` — Maintenance (deps, config, CI)
- `docs:` — Documentation only
- `ci:` — CI/workflow changes

## Releases

Versioning is **manual**: a curated [Keep a Changelog](https://keepachangelog.com/) entry +
a `vX.Y.Z` git tag. (Changesets was removed — see [#71](https://github.com/QuantEcon/quantecon-theme-src/issues/71).)

As you work, add your change to the `## [Unreleased]` section of [`CHANGELOG.md`](./CHANGELOG.md)
under the appropriate category (`Added` / `Changed` / `Fixed` / `Security` / `Dependencies`),
with a link to the PR.

To cut a release:

1. In `CHANGELOG.md`, move the `## [Unreleased]` entries under a new `## [X.Y.Z] - YYYY-MM-DD`
   heading, add the footer compare link, and re-point the `[Unreleased]` compare link's base
   at the new tag (`compare/vX.Y.Z...HEAD`).
   Wrapping the entry text is fine — the release workflow unwraps it, because GitHub renders
   release bodies (unlike committed Markdown) with single newlines as line breaks.
2. Bump the version in `package.json` (e.g. `npm version X.Y.Z --no-git-tag-version`).
   You do **not** need to bump `template.yml` — the release workflow stamps its `version`
   from `package.json` into the published bundle, so the two cannot drift.
   Do bump the two pinned `vX.Y.Z` URLs in `README.md` (the `site.template` example
   under "Usage with MyST" and the git-metadata plugin URL): the release guard does not
   check them, and a stale example hands consumers a superseded release
   ([#158](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/158)).
3. Commit (`chore(release): prepare vX.Y.Z`) and open a PR.
4. After merge, tag the release commit and push the tag:
   ```bash
   git tag vX.Y.Z && git push origin vX.Y.Z
   ```
5. The tag triggers [`release.yml`](./.github/workflows/release.yml), which builds the
   theme, zips the bundle, and publishes a **GitHub Release** for the tag with
   `quantecon-theme.zip` attached, using the version's `CHANGELOG.md` section as the
   release notes. The workflow **fails** if the tag does not match `package.json` or if
   `CHANGELOG.md` has no `## [X.Y.Z]` section.

If a release run fails, the failed run published nothing, so recovery is safe:

- **Transient build failure** (e.g. the occasional esbuild hang): no changes needed —
  re-run the failed workflow from the Actions UI.
- **Guard failure** (version mismatch / missing changelog section): land the fix on
  `main` via a PR, then **move the tag** to the new commit — a pushed tag cannot simply
  be re-pushed:
  ```bash
  git tag -f vX.Y.Z <new-commit-sha>
  git push --force origin vX.Y.Z
  ```

To test the bundle/artifact locally without cutting a release, use
`make build-theme` (assembles the bundle into `.deploy/quantecon-theme`, as used
by the visual test harness) or `make build-zip` (also produces the
release-equivalent zip).

## Notes

- The theme is built on [Remix v1](https://remix.run/) and [@myst-theme](https://github.com/jupyter-book/myst-theme).
- Tailwind CSS is used for styling — see `tailwind.config.js` for the theme configuration.
- TypeScript strict mode is enabled — all code must pass `tsc --noEmit`.
