import type { SiteManifest } from 'myst-config';
import type { NodeRenderers, Theme } from '@myst-theme/providers';
import { BaseUrlProvider, SiteProvider, ThemeProvider, useThemeSwitcher } from '@myst-theme/providers';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from '@remix-run/react';
import {
  Analytics,
  BlockingThemeLoader,
  DEFAULT_NAV_HEIGHT,
  renderers as defaultRenderers,
  useTheme,
} from '@myst-theme/site';
import { DirectionProvider } from '@radix-ui/react-direction';
import classNames from 'classnames';

/**
 * The document shell: `<html>`, `<head>` and `<body>`.
 *
 * A local copy of `Document` / `DocumentWithoutProviders` from
 * `@myst-theme/site` (src/pages/Root.tsx), taken so the theme can set two
 * attributes upstream hard-codes: `lang`, which upstream pins to "en", and
 * `dir`, which upstream does not set at all. A translated edition needs both
 * on the root element -- `lang` for screen readers, hyphenation and search
 * engines, `dir="rtl"` for the layout of a Persian, Arabic, Hebrew or Urdu
 * edition -- and they have to be there in the server render: setting them
 * after hydration would paint the first frame left-to-right and then flip it.
 *
 * Radix's `DirectionProvider` follows `dir`, so dropdown menus and tooltips
 * mirror their alignment in a right-to-left edition without per-component
 * work.
 *
 * Everything else is upstream's, unchanged, so a future upstream `lang` /
 * `dir` prop (see UPSTREAM-CANDIDATES.yml) lets this file be deleted again.
 * Kept in step with @myst-theme/site 1.3.0.
 */
export function Document({
  children,
  scripts,
  theme: ssrTheme,
  config,
  title,
  staticBuild,
  baseurl,
  top = DEFAULT_NAV_HEIGHT,
  renderers = defaultRenderers,
  head,
  lang,
  dir,
}: {
  children: React.ReactNode;
  scripts?: React.ReactNode;
  theme?: Theme;
  config?: SiteManifest;
  title?: string;
  staticBuild?: boolean;
  baseurl?: string;
  top?: number;
  renderers?: NodeRenderers;
  head?: React.ReactNode;
  lang?: string;
  dir?: 'ltr' | 'rtl';
}) {
  const navigate = useNavigate();
  const links = staticBuild
    ? {
        Link: (props: any) => <Link {...{ ...props, reloadDocument: true }} />,
        NavLink: (props: any) => <NavLink {...{ ...props, reloadDocument: true }} />,
      }
    : {
        Link: Link as any,
        NavLink: NavLink as any,
        navigate,
      };

  // (Local) theme state driven by SSR and cookie/localStorage
  const [theme, setTheme] = useTheme({ ssrTheme: ssrTheme, useLocalStorage: staticBuild });

  // Inject blocking element to set proper pre-hydration state
  const headAndLoader = (
    <>
      {head}
      {ssrTheme ? undefined : <BlockingThemeLoader useLocalStorage={!!staticBuild} />}
    </>
  );

  return (
    <ThemeProvider theme={theme} setTheme={setTheme} renderers={renderers} {...links} top={top}>
      <DocumentWithoutProviders
        children={children}
        scripts={scripts}
        head={headAndLoader}
        config={config}
        title={title}
        liveReloadListener={!staticBuild}
        baseurl={baseurl}
        top={top}
        lang={lang}
        dir={dir}
      />
    </ThemeProvider>
  );
}

export function DocumentWithoutProviders({
  children,
  scripts,
  head,
  config,
  title,
  baseurl,
  top = DEFAULT_NAV_HEIGHT,
  liveReloadListener,
  lang = 'en',
  dir,
}: {
  children: React.ReactNode;
  scripts?: React.ReactNode;
  head?: React.ReactNode;
  config?: SiteManifest;
  title?: string;
  baseurl?: string;
  top?: number;
  liveReloadListener?: boolean;
  lang?: string;
  dir?: 'ltr' | 'rtl';
}) {
  // Theme value from theme context; see upstream for the SSR / BlockingThemeLoader handshake.
  const { theme } = useThemeSwitcher();
  return (
    <html lang={lang} dir={dir} className={classNames(theme)} style={{ scrollPadding: top }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title && <title>{title}</title>}
        <Meta />
        <Links />
        <Analytics
          analytics_google={config?.options?.analytics_google}
          analytics_plausible={config?.options?.analytics_plausible}
        />
        {head}
      </head>
      <body className="m-0 transition-colors duration-500 bg-white dark:bg-stone-900">
        <DirectionProvider dir={dir ?? 'ltr'}>
          <BaseUrlProvider baseurl={baseurl}>
            <SiteProvider config={config}>{children}</SiteProvider>
          </BaseUrlProvider>
        </DirectionProvider>
        <ScrollRestoration />
        <Scripts />
        {liveReloadListener && <LiveReload />}
        {scripts}
      </body>
    </html>
  );
}
