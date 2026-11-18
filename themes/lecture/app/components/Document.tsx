import type { SiteManifest } from 'myst-config';
import type { NodeRenderers, Theme } from '@myst-theme/providers';
import { BaseUrlProvider, SiteProvider, ThemeProvider, useThemeSwitcher } from '@myst-theme/providers';
import {
  Link,
  Links,
  Meta,
  NavLink,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from 'react-router';
import {
  Analytics,
  BlockingThemeLoader,
  DEFAULT_NAV_HEIGHT,
  renderers as defaultRenderers,
  useTheme,
} from '@myst-theme/site';
import { useScrollToCellFragment } from 'myst-to-react';
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
 * No Radix `DirectionProvider` is needed: the floating positioning under
 * dropdown menus and tooltips reads the computed CSS `direction`, which
 * `dir` on <html> sets, so they mirror on their own. (A provider would not
 * reach them anyway: in this lockfile `@radix-ui/react-menu`,
 * `react-roving-focus` and `react-select` each nest their own copy of
 * `@radix-ui/react-direction`, so a context from any other copy is invisible
 * to them.)
 *
 * Two more differences, both the theme's own styling rather than markup:
 * the `<body>` classes (upstream's `bg-myst-bg` is the same white and
 * stone-900, but the theme keeps the colour transition, and CRITICAL_CSS in
 * app/root.tsx mirrors these classes), and the base-aware favicon and
 * `/myst-theme.css` links in the head (see below).
 *
 * Everything else is upstream's, unchanged, so a future upstream `lang` /
 * `dir` prop (see UPSTREAM-CANDIDATES.yml) lets this file be deleted.
 * Kept in step with @myst-theme/site 2.1.1.
 */
export function Document({
  children,
  scripts,
  theme: overrideMediaTheme,
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

  // (Local) theme state, persisted in localStorage on every kind of site
  const [theme, setTheme] = useTheme({
    overrideMediaTheme: overrideMediaTheme ?? undefined,
    useLocalStorage: true,
  });

  // Inject blocking element to set proper pre-hydration state
  const headAndLoader = (
    <>
      {head}
      <BlockingThemeLoader useLocalStorage={true} />
    </>
  );

  return (
    <ThemeProvider
      theme={theme}
      setTheme={setTheme}
      renderers={renderers}
      {...links}
      top={top}
      staticBuild={staticBuild}
    >
      <DocumentWithoutProviders
        children={children}
        scripts={scripts}
        head={headAndLoader}
        config={config}
        title={title}
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
  lang?: string;
  dir?: 'ltr' | 'rtl';
}) {
  // Theme value from theme context; the server renders none, and the
  // BlockingThemeLoader sets the stored or preferred one before hydration.
  const { theme } = useThemeSwitcher();
  // Honor incoming `#cell-id=<id>` notebook-cell deep-links (load + hashchange)
  useScrollToCellFragment();
  return (
    <html lang={lang} dir={dir} className={classNames(theme)} style={{ scrollPadding: top }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title && <title>{title}</title>}
        <Meta />
        <Links />
        {/* Head links whose href has to carry the base URL. They cannot come
            from a route's `links()`, which takes no arguments while BASE_URL
            reaches the app only through the root loader -- but this Document
            is handed it directly.

            Both files are served at the site root, so a root-absolute href
            resolves to the domain root and 404s on a site under a sub-path.

            The icon is emitted only when there is a base to add: without one
            the root route's own `/favicon.ico` is already right, and a second
            identical link would be noise. With one, this comes after `<Links/>`
            and a later `rel="icon"` wins. */}
        {baseurl && <link rel="icon" href={`${baseurl}/favicon.ico`} />}
        <link rel="stylesheet" href={`${baseurl ?? ''}/myst-theme.css`} />
        <Analytics
          analytics_google={config?.options?.analytics_google}
          analytics_plausible={config?.options?.analytics_plausible}
        />
        {head}
      </head>
      <body className="m-0 transition-colors duration-500 bg-white dark:bg-stone-900">
        <BaseUrlProvider baseurl={baseurl}>
          <SiteProvider config={config}>{children}</SiteProvider>
        </BaseUrlProvider>
        <ScrollRestoration />
        <Scripts />
        {scripts}
      </body>
    </html>
  );
}
