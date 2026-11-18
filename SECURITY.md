# Security

## Reporting a vulnerability

Please report security issues privately via GitHub's
["Report a vulnerability"](https://github.com/QuantEcon/quantecon-theme.mystmd/security/advisories/new)
flow rather than opening a public issue.

## Dependency security posture

The theme runs on **React Router 8 and Vite 8**, with `@myst-theme/*` 2.x
([#28](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/28)). Until
that migration it was pinned to Remix v1.17, because `@myst-theme/*` 1.x
required Remix v1 and Remix 1.19+ hard-reloads in a loop under the mystmd CLI's
SSR (jupyter-book/myst-theme#184); that pin, the `legacy-peer-deps` `.npmrc`
it needed and the Remix-family alerts it deferred are gone. React Router 8 has
no such reload: a page loads its document once, under `myst start` and on a
static build, with or without a base URL (checked in the migration PR).

The shipped theme bundle has no `node_modules`: Vite compiles every runtime
dependency into `server/` and `renderer/`, so an advisory reaches a lecture
site only through code that is actually bundled.

Where a vulnerable **transitive** dependency has a backward-compatible patched
release, we pull it forward with an [`overrides`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides)
entry in [`package.json`](package.json) rather than bumping a major version of
the toolchain. Current overrides:

| Package    | Forced to   | Reason                                   |
| ---------- | ----------- | ---------------------------------------- |
| `prismjs`  | `^1.30.0`   | ReDoS / prototype-pollution advisories   |
| `katex`    | `^0.16.21`  | matches the rendered KaTeX (vs CDN 0.15); one copy for the whole tree, so `myst-transforms` / `myst-to-jats` (which still ask for `^0.15.2`) do not nest 0.15.x again. An explicit range, not `$katex`: the root package does not depend on `katex`, so npm 10 rejects the reference and npm 11 silently skips it |
| `react`, `react-dom` | `^19.2.7` | one React for the whole tree: `thebe-react` and the `@jupyterlab/*` packages declare React 18 as a dependency, and without the override npm nests a React 18 copy under each |
| `uuid`     | `^11.1.1`   | GHSA-w5hq-g745-h8pq                       |
| `ajv`      | `^8.18.0`   | GHSA-2g4f-4pwh-qvx6                       |
| `cookie`   | `^0.7.0`    | GHSA-pxg6-pf52-xh8x (reaches the tree through `express` 4, which the theme server bundles) |
| `shell-quote` | `^1.10.0` | GHSA-w7jw-789q-3m8p (dev; via `concurrently`)        |
| `ws@^8.0.0` | `^8.20.1`  | GHSA-58qx-3vcg-4xpx — scoped to the 8.x copies (Jupyter/jsdom test chain) so the `ws@7` copy (thebe) is untouched; `ws@7` itself is now clean (7.5.12 ≥ the last patched 7.5.11 via #103, no open alerts) |
| `brace-expansion@^1.0.0` | `^1.1.18` | GHSA-3jxr-9vmj-r5cp / GHSA-mh99-v99m-4gvg / GHSA-rgw5-rvv9-x895 — ReDoS-style DoS via exponential expansion; two majors coexist in the tree, so the override is version-scoped like `ws` |
| `brace-expansion@^5.0.0` | `^5.0.9`  | same advisory family, 5.x copy (dev chain). Floor is 5.0.9, not 5.0.7: the GitHub advisory DB patches the 5.x line at 5.0.8 (GHSA-mh99) and 5.0.9 (GHSA-rgw5) even though this repo's Dependabot alerts only surface the 1.x ranges for those two |
| `js-yaml@^3.0.0` | `^3.15.0` | GHSA-52cp-r559-cp3m / GHSA-h67p-54hq-rp68 — quadratic CPU consumption via YAML merge-key chains |
| `js-yaml@^4.0.0` | `^4.3.0`  | same advisories, 4.x copy              |
| `sanitize-html` | `2.17.5` (exact) | GHSA-vccv-cmxp-4j9h — incomplete URI-scheme validation. Pinned exactly: 2.17.5 is the advisory-fixed floor, while 2.17.6 raises `engines.node` to `>=22.12.0` and swaps htmlparser2 to the ESM-only v12. (The engines clash with this theme's old Node 20 floor is gone now that it needs Node 22.22, so unpinning is open.) Note this override knowingly forces `@jupyterlab/apputils` past its declared `~2.12.1` range (CI, including the real-lecture preview build, is green on the forced version) |
| `@babel/core` | `^7.29.6` | GHSA-4x5r-pxfx-6jf8 — arbitrary file read via `sourceMappingURL` comment (low; build-time) |

`npm audit fix` (without `--force`) is a **no-op** for this tree: every
remaining advisory needs either a major bump or a manual override.

## Triage of open Dependabot alerts

Snapshot as of **2026-08-06**, re-triaged against the full open alert set (not
just the Remix ones), and updated for the move off Remix v1 (React Router 8,
[#28](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/28)) against
`npm audit` on 2026-11-18.

Every open alert is accounted for below or was closed by an override in the
table above. When adding a deferral here, name the **package** — the buckets are
matched by package, so an advisory whose package appears nowhere in this section
is an untriaged one, not an implicitly-deferred one.

### Cleared by the move to React Router 8

These were deferred while the theme was pinned to Remix v1.17. The migration
removes every `@remix-run/*` package and the Remix compiler's toolchain, so they
close with it (an `npm audit` of the tree before and after lists none of them
afterwards):

| Package(s) | Was deferred because |
| ---------- | -------------------- |
| `@remix-run/node` (GHSA-9583-h5hc-x8cw / CVE-2025-61686) | patched only in Remix v2 (and not applicable: file-backed session storage, which the theme never used) |
| `@remix-run/react`, `@remix-run/server-runtime`, `@remix-run/router`, `react-router` 6.13 (GHSA-2j2x-hqr9-3h42, GHSA-337j-9hxr-rhxg, GHSA-wrjc-x8rr-h8h6, …) | patched only in Remix v2 / react-router 6.30+ or 7.18+; the theme now runs react-router 8.5 |
| `ip`, `ip-address`, `@tootallnate/once`, `tar`, `toml`, `path-to-regexp`, `esbuild` 0.17, `vite` 5, `estree-util-value-to-estree` | transitive dependencies of `@remix-run/dev` (its proxy-agent, cache and MDX chains) and the Vercel adapter, all gone; Vite is now 8 |

### Deferred — major bump in the MyST / Thebe build chain

These are transitive dev-/build-time dependencies (or bundled into the static
Thebe assets in `public/`). Their fixes are major-version bumps with a high
regression risk for the toolchain and low real exposure for the deployed site,
so they are deferred until the relevant upstream (`mystmd`, `thebe`) ships
them: `markdown-it` (13→14 — this also carries `linkify-it` 4→5, whose
GHSA-22p9-wv53-3rq4 / GHSA-v245-v573-v5vm quadratic-complexity advisories have
no 4.x fix; `linkify-it` reaches the tree only as a `markdown-it` dependency, so
it moves when `markdown-it` does), `nanoid` (4→5) and `yaml`.

`picomatch` (ReDoS, no patched release at the time of writing) now also
reaches the tree through the Vite / React Router build tooling (`vite`,
`tinyglobby`, `@react-router/dev`, `@react-router/fs-routes`) and through
`vite-env-only`, a dependency of `@myst-theme/site`. These are build-time
globbing paths, not code in the shipped bundle.
