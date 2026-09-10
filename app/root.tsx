import type { LinksFunction, V2_MetaFunction, LoaderFunction } from '@remix-run/node';
import tailwind from '~/styles/app.css';
import thebeCoreCss from 'thebe-core/dist/lib/thebe-core.css';
import { PTSerifCSS, SourceSans3CSS } from '~/links';
import { getConfig } from '~/backend/loaders.server';
import type { SiteLoader } from '@myst-theme/common';
import {
  responseNoSite,
  getMetaTagsForSite,
  getThemeSession,
  ContentReload,
  SkipTo,
  renderers as defaultRenderers,
} from '@myst-theme/site';
import { createSearch as createMiniSearch } from '@myst-theme/search-minisearch';
import { Outlet, useLoaderData } from '@remix-run/react';
import type { NodeRenderers } from '@myst-theme/providers';
import { mergeRenderers, SearchFactoryProvider } from '@myst-theme/providers';
import type { ISearch, MystSearchIndex } from '@myst-theme/search';
import { SEARCH_ATTRIBUTES_ORDERED } from '@myst-theme/search';
import { useCallback } from 'react';
import { JUPYTER_RENDERERS } from '@myst-theme/jupyter';
import { LIST_RENDERERS, STDERR_RENDERERS } from './renderers';
import { Document } from './components/Document';
import { htmlDir, htmlLang } from './i18n';
import type { TemplateOptions } from './types';
export { AppErrorBoundary as ErrorBoundary } from '@myst-theme/site';
// Never re-run the loader on a navigation that changes neither pathname nor
// search (Back off an in-page anchor on a static build) -- #186.
export { shouldRevalidate } from '~/revalidate';

const RENDERERS: NodeRenderers = mergeRenderers([
  defaultRenderers,
  JUPYTER_RENDERERS,
  LIST_RENDERERS,
  // After JUPYTER_RENDERERS: wraps upstream's `output` renderer (#92).
  STDERR_RENDERERS,
]);

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return getMetaTagsForSite({
    title: data?.config?.title,
    description: data?.config?.description,
    twitter: data?.config?.options?.twitter,
  });
};

/**
 * Critical CSS — inlined in <head> to fix the Safari/WebKit FOUC on navigation
 * (https://github.com/QuantEcon/quantecon-theme-src/issues/66).
 *
 * The mechanism is NOT a pre-stylesheet first paint. WebKit holds first paint
 * until the render-blocking <head> stylesheets apply — probed with a
 * rAF-from-document-start sampler: no frame renders unstyled on the static
 * build, cold or warm cache, even with every CSS response delayed 800ms. The
 * unstyled frame arrives ~200ms AFTER first paint, when React hydration fails
 * (minified #418/#423) and the recovery client render re-patches whatever
 * diverged between server and client markup. A divergence in the <head> makes
 * that pass re-create head nodes (#126 measured it re-inserting a missing
 * <style> at 195ms) — and a re-inserted stylesheet <link> re-applies
 * asynchronously, while a re-inserted inline <style> applies the instant the
 * node lands. In that gap this block is the only styling on the page, which
 * is the styled -> unstyled -> styled flicker users reported as the "raw
 * HTML" flash. A body-level mismatch, by contrast, recovers without touching
 * the head at all (probed by injecting a stray node into the served <body>:
 * both errors fire, zero head mutations, no flash).
 *
 * Current builds hydrate cleanly — no #418/#423 on any fixture page, dev or
 * static — so day to day this block is the safety net for whenever the
 * external stylesheets are absent, however that comes about; the FOUC guard
 * test simulates that state by aborting them. The practical rule stands
 * regardless of mechanism: anything that must not flash (hidden by opacity,
 * gated by a transition) needs a rule HERE — at flash time React is already
 * mounted, so mount-gating cannot help, and only this inline CSS survives.
 *
 * Every selector is wrapped in `:where(...)` so these rules carry **zero**
 * specificity: they take effect only while nothing else has loaded, and the
 * real stylesheet (Tailwind preflight + @myst-theme/styles) always wins once it
 * arrives. This keeps the inline block from overriding the live cascade despite
 * being emitted after <Links /> in the document head.
 *
 * Because these rules carry no specificity, every property set here MUST also
 * be declared by the real stylesheet, otherwise it can never be overridden.
 * (Setting `visibility:hidden` on something no Tailwind class un-hides, say,
 * would stick forever.)
 *
 * Keep the values in sync with their sources of truth:
 *   - font stack:    tailwind.config.js  -> theme.extend.fontFamily.sans
 *                    The `@font-face` rules for "Source Sans 3 Variable" are
 *                    self-hosted via app/links.ts, so they arrive in a <link>
 *                    and are NOT available at this first paint. The
 *                    `sans-serif` tail is what renders here and the webfont
 *                    swaps in once that stylesheet lands — as it did with the
 *                    Google Fonts @import this replaced. The metric-matched
 *                    "Source Sans 3 Fallback" face sits just before that tail;
 *                    it is declared below rather than in styles/app.css so it
 *                    is available at this first paint too. Being `local()`-only
 *                    it costs no request.
 *   - heading face:  styles/quantecon.css -> `.article h1/h2/h3` ("PT Serif",
 *                    self-hosted via app/links.ts like the sans above, so it is
 *                    likewise absent at first paint). Without this rule the
 *                    headings paint in the sans stack and swap to serif when
 *                    the Tailwind bundle lands; the generic `serif` fallback
 *                    here is far closer to the final shape. The sizes come
 *                    from the same block. They matter beyond reflow: the UA
 *                    default for an h1 inside <article> is 1.5em, not 2em,
 *                    so without them the h1 would paint visibly small.
 *   - content size:  styles/quantecon.css -> `.article` font-size (1.125rem).
 *                    Without it the article paints at the UA default 16px and
 *                    jumps to 18px when the Tailwind bundle lands, reflowing
 *                    the whole page on every cold load.
 *   - grid columns:  tailwind.config.js  -> theme.extend.gridTemplateColumns
 *                    (`simple-sm` / `simple-xl`), applied by `.simple-center-grid`
 *   - dark bg:       matches the page <body>, which @myst-theme/site renders as
 *                    `dark:bg-stone-900` (#1c1917) — note the <body> tag lives in
 *                    that upstream Document, not in this file. (This is the outer
 *                    page background; the inner content panel uses `qepage-dark`
 *                    #222, see app/components/Page.tsx — intentionally not set here
 *                    since these rules target <body>.)
 *
 *   - toggle icon:   styles/app.css -> `.qe-toc-toggle__close` (only the class
 *                    name needs to stay in sync)
 *   - back to top:   app/components/Outline.tsx -> `.qe-back-to-top`, whose
 *                    Tailwind `opacity-0` / `opacity-100` pair this mirrors
 *                    (again only the class name needs to stay in sync)
 *
 * The contents drawer itself needs no rule here — as a popover the UA
 * stylesheet already hides it while closed (see `.qe-toc` in styles/app.css).
 * Its toggle does: both icons are always in the DOM and lucide emits real
 * width/height attributes, so without this rule the close icon paints beside
 * the hamburger on that first frame. The `body:has(.qe-toc:popover-open)` rule
 * in app.css outranks this zero-specificity one, so the open state still swaps.
 *
 * "Back to top" needs the same treatment for a different reason: it carries a
 * `transition-opacity` and is hidden by `opacity-0`, so on any frame where the
 * stylesheet is absent it paints at full opacity and then *fades* out when the
 * sheet lands, rather than never having been there. That frame is not only the
 * first paint — the React #423 hydration recovery (#126) re-renders the head
 * and briefly drops the stylesheet, and by then the component is mounted and
 * the transition is live, so gating the transition on mount (as #141 tried)
 * cannot stop it. Measured in WebKit with the stylesheet delayed: 17–18
 * animating frames without this rule, none with it. Its `opacity-100` utility
 * outranks this rule, so the scrolled state still shows.
 */
const CRITICAL_CSS = `
@font-face{font-family:"Source Sans 3 Fallback";src:local("Helvetica"),local("Arial"),local("Liberation Sans"),local("Arimo");size-adjust:92.25%;ascent-override:111%;descent-override:43.36%;line-gap-override:0%}
:where(html){font-family:"Source Sans 3 Variable","Source Sans 3","Source Sans 3 Fallback",sans-serif}
:where(.article){font-size:1.125rem}
:where(.article h1,.article h2,.article h3){font-family:"PT Serif",serif}
:where(.article h1){font-size:2em}
:where(.article h2){font-size:1.7em}
:where(.article h3){font-size:1.4em}
:where(.article h4){font-size:1.2em}
:where(.article h1,.article h2,.article h3,.article h4,.article h5){line-height:1.15}
:where(.article h4,.article h5){font-weight:900}
:where(body){margin:0;background-color:#fff}
:where(.dark body){background-color:#1c1917}
:where([hidden],.hidden){display:none}
:where(.qe-toc-toggle__close){display:none}
:where(.qe-back-to-top){opacity:0}
:where(.simple-center-grid){display:grid;grid-template-columns:[screen-start] 1fr [body-start] minmax(300px,800px) [body-end] 1fr [screen-end]}
:where(.simple-center-grid) > *{grid-column:body-start / body-end}
@media (min-width:1280px){:where(.simple-center-grid){grid-template-columns:[screen-start] 1fr 200px 20px [body-start] 800px [body-end] 20px [margin-start] 200px [margin-end] 1fr [screen-end]}}
`;

export const links: LinksFunction = () => {
  return [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    // Self-hosted Source Sans 3 (see app/links.ts). Declared on the *root*
    // route rather than the two page routes like KatexCSS, because root's
    // links() are the only ones that also apply when the root ErrorBoundary
    // renders — a 404, or the missing-site response thrown below — and the body
    // font has to be right on those pages too.
    ...SourceSans3CSS,
    // Self-hosted PT Serif for the article headings (see app/links.ts). Also
    // on the root route: the ErrorBoundary pages render an <h1> too.
    ...PTSerifCSS,
    { rel: 'stylesheet', href: tailwind },
    { rel: 'stylesheet', href: thebeCoreCss },
    { rel: 'stylesheet', href: '/myst-theme.css' },
    // jupyter-matplotlib's stylesheet used to be pulled from jsdelivr here. It
    // is now vendored into the Tailwind bundle (styles/mpl-widget.css), which
    // drops a render-blocking request to a third-party CDN that is
    // intermittently unreachable in mainland China.
    // Font Awesome intentionally not loaded: nothing in the theme renders
    // `fa-*` classes; use the bundled `lucide-react` icons instead.
  ];
};

export const loader: LoaderFunction = async ({ request }): Promise<SiteLoader> => {
  const baseURL = process.env.BASE_URL || undefined;
  const [config, themeSession] = await Promise.all([
    getConfig().catch(() => null),
    getThemeSession(request),
  ]);
  if (!config) throw responseNoSite();
  const data = {
    theme: themeSession.getTheme(),
    config,
    CONTENT_CDN_PORT: process.env.CONTENT_CDN_PORT ?? 3100,
    MODE: (process.env.MODE ?? 'app') as 'app' | 'static',
    BASE_URL: baseURL,
  };
  return data;
};

function createSearch(index: MystSearchIndex): ISearch {
  const options = {
    fields: SEARCH_ATTRIBUTES_ORDERED as any as string[],
    storeFields: ['hierarchy', 'content', 'url', 'type', 'id', 'position'],
    idField: 'id',
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
    },
  };
  return createMiniSearch(index.records, options);
}

export default function AppWithReload() {
  const { theme, config, CONTENT_CDN_PORT, MODE, BASE_URL } = useLoaderData<SiteLoader>();

  const searchFactory = useCallback((index: MystSearchIndex) => createSearch(index), []);
  // Edition language and direction, from the declared site options (see
  // app/i18n.ts). Set on <html> in the server render by the local Document.
  const options: TemplateOptions = (config as any)?.options ?? {};

  return (
    <SearchFactoryProvider factory={searchFactory}>
      <Document
        theme={theme}
        config={config}
        scripts={MODE === 'static' ? undefined : <ContentReload port={CONTENT_CDN_PORT} />}
        staticBuild={MODE === 'static'}
        baseurl={BASE_URL}
        renderers={RENDERERS}
        top={50}
        // dangerouslySetInnerHTML is required, not incidental: CRITICAL_CSS uses a
        // child combinator (`.simple-center-grid > *`), and React escapes `>` to
        // `&gt;` in <style> text children during SSR. Browsers don't decode entities
        // inside <style>, so `<style>{CRITICAL_CSS}</style>` would emit an invalid
        // selector and silently drop the body-column rule. Keep this as-is.
        head={<style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />}
        lang={htmlLang(options)}
        dir={htmlDir(options)}
      >
        <SkipTo
          targets={[
            { id: 'skip-to-frontmatter', title: 'Skip to article frontmatter' },
            { id: 'skip-to-article', title: 'Skip to article content' },
          ]}
        />
        <Outlet />
      </Document>
    </SearchFactoryProvider>
  );
}
