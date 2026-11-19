import type { LinksFunction, V2_MetaFunction, LoaderFunction } from '@remix-run/node';
import tailwind from '~/styles/app.css';
import { NewsreaderCSS, PlexMonoCSS } from '~/links';
import { getConfig } from '@quantecon/theme-common/backend/loaders.server';
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
import { LIST_RENDERERS } from '@quantecon/theme-common/renderers/lists';
import { Document } from '@quantecon/theme-common/components/Document';
import { normaliseColorScheme } from '@quantecon/theme-common/colorScheme';
import { htmlDir, htmlLang } from '@quantecon/theme-common/i18n';
import { normalizeBaseurl } from '@quantecon/theme-common/seo';
import { BOOK_RENDERERS } from './renderers';
import { MASTHEAD_HEIGHT } from './components/BookShell';
import type { BookOptions } from './types';
export { AppErrorBoundary as ErrorBoundary } from '@myst-theme/site';
export { shouldRevalidate } from '@quantecon/theme-common/revalidate';

const RENDERERS: NodeRenderers = mergeRenderers([
  defaultRenderers,
  JUPYTER_RENDERERS,
  // Fancy ordered lists: (a), (i), iv. markers from the QuantEcon mystmd fork,
  // so a book needs no fancy-lists plugin of its own.
  LIST_RENDERERS,
  // Theorem environments, code cards and numbered headings (app/renderers.tsx).
  BOOK_RENDERERS,
]);

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return getMetaTagsForSite({
    title: data?.config?.title,
    description: data?.config?.description,
    twitter: data?.config?.options?.twitter,
  });
};

/**
 * Inline first-paint CSS. Only what must be right before the stylesheet
 * lands: the paper colour (so a dark-mode load does not flash white, and a
 * light one not flash the browser default) and the body face. Zero
 * specificity, so the real stylesheet always wins; every property here is
 * also declared there. Keep in step with styles/manuscript.css.
 */
const CRITICAL_CSS = `
:where(html){font-family:"Newsreader Variable",Georgia,serif;background:#faf8f3;color:#1d1b16}
:where(html.dark){background:#16161a;color:#e9e6df}
:where(body){margin:0}
`;

export const links: LinksFunction = () => [
  { rel: 'icon', href: '/favicon.ico' },
  ...NewsreaderCSS,
  ...PlexMonoCSS,
  { rel: 'stylesheet', href: tailwind },
];

export const loader: LoaderFunction = async ({ request }): Promise<SiteLoader> => {
  const baseURL = normalizeBaseurl(process.env.BASE_URL);
  const [config, themeSession] = await Promise.all([
    getConfig().catch(() => null),
    getThemeSession(request),
  ]);
  if (!config) throw responseNoSite();
  return {
    theme: themeSession.getTheme(),
    config,
    CONTENT_CDN_PORT: process.env.CONTENT_CDN_PORT ?? 3100,
    MODE: (process.env.MODE ?? 'app') as 'app' | 'static',
    BASE_URL: baseURL,
  };
};

function createSearch(index: MystSearchIndex): ISearch {
  return createMiniSearch(index.records, {
    fields: SEARCH_ATTRIBUTES_ORDERED as any as string[],
    storeFields: ['hierarchy', 'content', 'url', 'type', 'id', 'position'],
    idField: 'id',
    searchOptions: { fuzzy: 0.2, prefix: true },
  });
}

export default function App() {
  const { theme, config, CONTENT_CDN_PORT, MODE, BASE_URL } = useLoaderData<SiteLoader>();
  const searchFactory = useCallback((index: MystSearchIndex) => createSearch(index), []);
  const options: BookOptions = (config as any)?.options ?? {};
  // Light unless the book says otherwise: figures are drawn for white paper.
  const scheme = options.default_color_scheme
    ? normaliseColorScheme(options.default_color_scheme)
    : 'light';

  return (
    <SearchFactoryProvider factory={searchFactory}>
      <Document
        theme={theme}
        config={config}
        scripts={MODE === 'static' ? undefined : <ContentReload port={CONTENT_CDN_PORT} />}
        staticBuild={MODE === 'static'}
        baseurl={BASE_URL}
        renderers={RENDERERS}
        top={MASTHEAD_HEIGHT}
        head={<style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />}
        lang={htmlLang(options as any)}
        dir={htmlDir(options as any)}
        bodyClassName="qb-body"
        defaultColorScheme={scheme}
      >
        <SkipTo targets={[{ id: 'skip-to-article', title: 'Skip to the text' }]} />
        <Outlet />
      </Document>
    </SearchFactoryProvider>
  );
}
