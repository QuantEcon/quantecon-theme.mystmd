import type { HtmlLinkDescriptor } from '@remix-run/react';
import katexCss from 'katex/dist/katex.min.css';
import newsreaderCss from '@fontsource-variable/newsreader/index.css';
import newsreaderItalicCss from '@fontsource-variable/newsreader/wght-italic.css';
import plexMono400Css from '@fontsource/ibm-plex-mono/400.css';
import plexMono400ItalicCss from '@fontsource/ibm-plex-mono/400-italic.css';
import plexMono500Css from '@fontsource/ibm-plex-mono/500.css';

/**
 * Self-hosted stylesheets, routed through Remix so the font and KaTeX files
 * are fingerprinted into `public/build/_assets`, as the lecture theme does
 * (see its app/links.ts for the reasons: no third-origin request on the
 * critical path, and no CDN that is unreachable from mainland China).
 * `packages/common/scripts/relative-css-asset-urls.mjs` then makes the
 * `url()`s stylesheet-relative so they resolve in static builds.
 *
 * They are linked rather than `@import`ed into styles/app.css because
 * Tailwind does not rebase `url()` inside an imported stylesheet.
 */
export const KatexCSS: HtmlLinkDescriptor = { rel: 'stylesheet', href: katexCss };

/**
 * Newsreader, the Manuscript body and heading face: the variable build,
 * upright and italic (theorem labels and emphasis are italic, and a
 * synthesised oblique measures wider). Family `Newsreader Variable`, named in
 * styles/manuscript.css.
 */
export const NewsreaderCSS: HtmlLinkDescriptor[] = [
  { rel: 'stylesheet', href: newsreaderCss },
  { rel: 'stylesheet', href: newsreaderItalicCss },
];

/** IBM Plex Mono, for labels, numerals and code: 400, 400 italic (comments) and 500. */
export const PlexMonoCSS: HtmlLinkDescriptor[] = [
  { rel: 'stylesheet', href: plexMono400Css },
  { rel: 'stylesheet', href: plexMono400ItalicCss },
  { rel: 'stylesheet', href: plexMono500Css },
];
