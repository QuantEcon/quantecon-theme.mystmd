/**
 * The theme's self-hosted stylesheets: the body and heading webfonts, and
 * KaTeX's. Imported for their side effect by `app/root.tsx`, after the
 * Tailwind bundle, so Vite lists them as the root route's CSS and emits them,
 * with every font file they reference, into the build's `_assets/` folder.
 *
 * Side-effect imports rather than `?url` imports handed to `links()`: the
 * route manifest is the one place the static renderer re-bases asset URLs onto
 * the site's BASE_URL, and a URL returned from `links()` would keep the
 * renderer build's `./` base, which resolves against each page's own path. In
 * the renderer build Vite also writes each stylesheet's `url()`s relative to
 * the stylesheet itself, so the fonts resolve under a sub-path too.
 */

/**
 * Self-hosted Source Sans 3 (variable), rather than an
 * `@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3…')` at
 * the top of `styles/app.css`.
 *
 * Two reasons to serve it ourselves. Google Fonts is blocked in mainland China,
 * where a significant share of QuantEcon readers are, and this is the *body*
 * font on every page. And an `@import` is the worst shape a critical-path
 * request can have: it is discovered only once `app.css` has downloaded and
 * parsed, so it cannot be preloaded, and the chain would run app.css →
 * Google's CSS → gstatic woff2 across two extra origins.
 *
 * The import lives here rather than in `styles/app.css` because Tailwind does
 * not rebase `url()` inside an `@import`ed stylesheet — the font paths would be
 * emitted relative to the Tailwind *output* file and 404. Imported from a
 * module, Vite rewrites them and emits the woff2 files into `_assets/`.
 *
 * Two stylesheets, not one: the package splits upright from italic, and lecture
 * prose uses both. Without the italic faces the browser synthesises an oblique
 * from the upright, which measures wider and shifts the layout.
 *
 * The family is declared as `Source Sans 3 Variable`, which is why
 * `tailwind.config.js` and the inlined `CRITICAL_CSS` in `app/root.tsx` name it
 * that way too — those three have to stay in step.
 */
import '@fontsource-variable/source-sans-3/index.css';
import '@fontsource-variable/source-sans-3/wght-italic.css';

/**
 * Self-hosted PT Serif, the lecture heading face: `styles/quantecon.css`
 * applies it to the `.article` h1-h3 headings.
 *
 * Self-hosted for the same reasons as Source Sans 3 above. The static
 * (non-variable) package: PT Serif only ships 400 and 700. Four stylesheets
 * because the package splits every weight/style pair; each is a handful of
 * `@font-face` rules and the browser only downloads the faces a page actually
 * uses. Heading weights from 600 up resolve to the 700 face these files
 * provide.
 */
import '@fontsource/pt-serif/400.css';
import '@fontsource/pt-serif/400-italic.css';
import '@fontsource/pt-serif/700.css';
import '@fontsource/pt-serif/700-italic.css';

/**
 * Self-hosted KaTeX stylesheet, in place of the `KatexCSS` link from
 * `@myst-theme/site`, which points at `cdn.jsdelivr.net`:
 *
 *   1. Accessibility. jsdelivr is intermittently unreachable from mainland
 *      China. When it is blocked the maths markup still renders but is
 *      completely unstyled — fractions, radicals and matrices collapse into
 *      run-together text — so the lectures become unreadable exactly where
 *      they matter most.
 *   2. The critical path. Upstream's is a render-blocking stylesheet on a
 *      third origin, so first paint waits on a DNS lookup and TLS handshake.
 *
 * Its 60 font files land in `_assets/` beside it. The browser only downloads
 * the handful of font faces a page's glyphs actually need, not all twenty.
 *
 * The upstream link also pins KaTeX 0.15.2 while this repo resolves 0.16.x;
 * importing from the package keeps the CSS aligned with the installed version.
 * `katex` is declared directly in package.json rather than relied on as a
 * hoisted transitive dependency of `myst-transforms` / `mermaid`.
 *
 * Last of the imports, so it follows the Tailwind bundle in the cascade.
 */
import 'katex/dist/katex.min.css';
