# Visual regression tests

Playwright snapshot tests for the QuantEcon MyST theme, modelled on
`quantecon-book-theme`'s setup but adapted for this theme's **runtime** nature:
the tests render a small fixture project (`fixture/`) through a live `myst start`
server, with the **theme under test** chosen at run time.

## Why

The theme is consumed by lectures as a built bundle. To catch styling/markup
regressions (especially the `@myst-theme` v1.0.0 notebook output-node AST change),
we screenshot the same content rendered by different theme versions and diff.

## Prerequisites

- Node 24 (`.nvmrc`) and the `mystmd` CLI (`myst`) on `PATH`
- `npm ci` (installs `@playwright/test`)
- `npx playwright install --with-deps chromium webkit` (browser binaries —
  `chromium` for the visual snapshots, `webkit` for the FOUC guard below)

## Selecting the theme: `THEME_TEMPLATE`

`serve.sh` injects `THEME_TEMPLATE` as the fixture's `site.template`. It accepts
either a local theme **build directory** or a GitHub **archive zip URL**.

| Target | `THEME_TEMPLATE` |
| ------ | ---------------- |
| **This repo (current candidate)** | a local build dir — `make build-theme` then `$PWD/.deploy/quantecon-theme` |
| **A released bundle** | the pinned release-asset URL — `https://github.com/QuantEcon/quantecon-theme.mystmd/releases/download/vX.Y.Z/quantecon-theme.zip` |

The committed `__snapshots__/` baselines are **platform-suffixed** — font
antialiasing differs across OSes, so each platform diffs against pixels it
rendered itself:

- `…-darwin/` — for local runs on macOS (`npm run test:visual`)
- `…-linux/` — what the `visual` CI job compares against on every PR

Refresh `-darwin` locally with `npm run test:visual:update`; refresh `-linux`
by commenting **`/update-snapshots`** on the PR (re-captures all CI baselines —
use when a visual change is intentional) or **`/update-new-snapshots`** (only
writes missing ones — safe when adding tests). The workflow pushes the
refreshed baselines to the PR branch (same-repo branches only, not forks).

## Validate a change

```bash
# Build the candidate and diff it against the committed baselines
make build-theme
THEME_TEMPLATE="$PWD/.deploy/quantecon-theme" \
  npm run test:visual
```

Any diffs are what your change altered. Review `playwright-report/`; once the
changes are confirmed intentional, refresh the local (`-darwin`) baselines:

```bash
THEME_TEMPLATE="$PWD/.deploy/quantecon-theme" \
  npm run test:visual:update
```

…and refresh the CI (`-linux`) baselines by commenting `/update-snapshots` on
your PR. The `visual` CI job (Chromium, `.github/workflows/ci.yml`) gates every
PR against the `-linux` baselines and posts a 🎭 results summary comment; on
failure it uploads the Playwright report and the actual/diff images as
artifacts (`visual-playwright-report`, `visual-test-diff`).

> The baselines were first captured against the deployed **v1.1.1** bundle to validate
> the `@myst-theme` 0.14 → 1.x upgrade, then re-based to **v2.0.0** once that upgrade
> shipped. To compare against any released bundle, point `THEME_TEMPLATE` at its
> archive zip.

## FOUC guard (WebKit)

`fouc.spec.ts` guards the Safari/WebKit flash-of-unstyled-content fix
([#66](https://github.com/QuantEcon/quantecon-theme-src/issues/66)): it aborts
all external stylesheets so the only styling that can reach the first paint is
the inline critical CSS in `app/root.tsx`, then asserts the layout/font are
already correct (and a control case proves the abort really strips styling).
It is **snapshot-free** (asserts computed `display`/`font-family`, not pixels),
so it is robust across `myst`/CI versions. It runs on the `webkit-fouc` project
only — Chromium paint-holds and cannot exhibit the flash — and is wired into CI
as the `FOUC guard (WebKit)` job.

```bash
make build-theme
THEME_TEMPLATE="$PWD/.deploy/quantecon-theme" \
  npm run test:fouc
```

## Files

- `fixture/` — minimal MyST project (`intro.md`, `features.md`, `notebook.ipynb`);
  configures two editions and a translator so the language switcher, hreflang
  alternates and translator credit render (#90, #143)
- `fixture-no-thebe/` — the same without `project.thebe`, for the absent live-compute
  toggle (second port)
- `fixture-rtl/` — a Persian edition with `enable_rtl` (third port), for the `rtl`
  snapshot and the right-to-left assertions (#91)
- `fixture/myst.yml.in` — template; `serve.sh` writes `myst.yml` from it
- `serve.sh` — `myst start` with the chosen `THEME_TEMPLATE`
- `theme.spec.ts` — one full-page snapshot per surface, plus a sidebar-open
  viewport snapshot (the sidebar is off-canvas in the full-page shots — #70
  was invisible to them) (Chromium)
- `fouc.spec.ts` — FOUC guard, no snapshots (WebKit)
- `__snapshots__/` — committed baselines

> The generated `fixture/myst.yml`, `fixture/_build/`, and `playwright-report/`
> are gitignored.
