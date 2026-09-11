import type { HtmlLinkDescriptor } from '@remix-run/react';
import katexCss from 'katex/dist/katex.min.css';
// Explicit `.css` subpaths, not the bare specifier: the package ships its own
// `index.d.css.ts` (`export {}`), which would win over Remix's
// `declare module "*.css"` and fail `npm run compile`.
import sourceSans3Css from '@fontsource-variable/source-sans-3/index.css';
import sourceSans3ItalicCss from '@fontsource-variable/source-sans-3/wght-italic.css';
import ptSerif400Css from '@fontsource/pt-serif/400.css';
import ptSerif400ItalicCss from '@fontsource/pt-serif/400-italic.css';
import ptSerif700Css from '@fontsource/pt-serif/700.css';
import ptSerif700ItalicCss from '@fontsource/pt-serif/700-italic.css';

/**
 * Self-hosted KaTeX stylesheet.
 *
 * Replaces the `KatexCSS` export from `@myst-theme/site`, which points at
 * `cdn.jsdelivr.net`. Two reasons to serve it ourselves:
 *
 *   1. Accessibility. jsdelivr is intermittently unreachable from mainland
 *      China, where a significant share of QuantEcon readers are. When it is
 *      blocked the maths markup still renders but is completely unstyled —
 *      fractions, radicals and matrices collapse into run-together text — so
 *      the lectures become unreadable exactly where they matter most.
 *   2. The critical path. Upstream's is a render-blocking stylesheet on a
 *      third origin, so first paint waits on a DNS lookup and TLS handshake.
 *
 * Remix fingerprints this import and emits it, plus the 60 font files it
 * references, into `public/build/_assets/` — served at `/myst_assets_folder/`
 * (remix.config.*.js `publicPath`), the same path as every other bundled
 * asset. The browser only downloads the handful of font faces a page's glyphs
 * actually need, not all twenty.
 *
 * The upstream export also pins KaTeX 0.15.2 while this repo resolves 0.16.x;
 * importing from the package keeps the CSS aligned with the installed version.
 * `katex` is declared directly in package.json rather than relied on as a
 * hoisted transitive dependency of `myst-transforms` / `mermaid`.
 */
export const KatexCSS: HtmlLinkDescriptor = {
  rel: 'stylesheet',
  href: katexCss,
};

/**
 * Self-hosted Source Sans 3 (variable), rather than an
 * `@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3…')` at
 * the top of `styles/app.css`.
 *
 * Same two reasons as KaTeX above, both sharper here. Google Fonts is blocked
 * in mainland China, and this is the *body* font on every page rather than the
 * maths on some of them. And an `@import` is the worst shape a critical-path
 * request can have: it is discovered only once `app.css` has downloaded and
 * parsed, so it cannot be preloaded, and the chain would run app.css →
 * Google's CSS → gstatic woff2 across two extra origins.
 *
 * The import lives here rather than in `styles/app.css` because Tailwind does
 * not rebase `url()` inside an `@import`ed stylesheet — the font paths would be
 * emitted relative to the Tailwind *output* file and 404. Imported from a
 * module, Remix's esbuild pass rewrites them and emits the woff2 files into
 * `public/build/_assets/`, the same route KaTeX's fonts take. (Those emitted
 * URLs are then made stylesheet-relative by `scripts/relative-css-asset-urls.mjs`,
 * without which they resolve only under `myst start` and not in static builds.)
 *
 * Two stylesheets, not one: the package splits upright from italic, and lecture
 * prose uses both. Without the italic faces the browser synthesises an oblique
 * from the upright, which measures wider and shifts the layout.
 *
 * The family is declared as `Source Sans 3 Variable`, which is why
 * `tailwind.config.js` and the inlined `CRITICAL_CSS` in `app/root.tsx` name it
 * that way too — those three have to stay in step.
 */
export const SourceSans3CSS: HtmlLinkDescriptor[] = [
  { rel: 'stylesheet', href: sourceSans3Css },
  { rel: 'stylesheet', href: sourceSans3ItalicCss },
];

/**
 * Self-hosted PT Serif, the lecture heading face: `styles/quantecon.css`
 * applies it to the `.article` h1-h3 headings.
 *
 * Self-hosted for the same reasons as Source Sans 3 above, and routed through
 * the same Remix/esbuild pipeline. The static (non-variable) package: PT Serif
 * only ships 400 and 700. Four stylesheets because the package splits every
 * weight/style pair; each is a handful of `@font-face` rules and the browser
 * only downloads the faces a page actually uses. Heading weights from 600 up
 * resolve to the 700 face these files provide.
 */
export const PTSerifCSS: HtmlLinkDescriptor[] = [
  { rel: 'stylesheet', href: ptSerif400Css },
  { rel: 'stylesheet', href: ptSerif400ItalicCss },
  { rel: 'stylesheet', href: ptSerif700Css },
  { rel: 'stylesheet', href: ptSerif700ItalicCss },
];
