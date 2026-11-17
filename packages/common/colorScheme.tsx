import React, { useEffect, useRef } from 'react';
import type { Theme } from '@myst-theme/providers';
import { isTheme } from '@myst-theme/providers';

/**
 * A site-level default colour scheme, for themes that offer one (the book
 * theme's `default_color_scheme` option).
 *
 * Upstream's `useTheme` / `BlockingThemeLoader` (@myst-theme/site) always fall
 * back to the reader's OS preference. A book whose figures are drawn for white
 * paper wants light unless the reader chooses otherwise, which the converted
 * editions got by rewriting every built page (`light_default.py`). These two
 * are upstream's pair with the fallback made configurable:
 *
 *   reader's saved choice  >  the site default  >  the OS preference
 *
 * where the last applies only when the default is `system`. The saved choice
 * uses upstream's storage (localStorage `myst:theme` on a static build, the
 * theme cookie under `myst start`), so the toggle keeps working.
 */
export type DefaultColorScheme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'myst:theme';
const PREFERS_LIGHT_MQ = '(prefers-color-scheme: light)';

export function normaliseColorScheme(value: unknown): DefaultColorScheme {
  const v = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return v === 'dark' || v === 'system' ? v : v === 'light' ? 'light' : 'system';
}

/** Runs before hydration and sets the <html> class, as upstream's loader does. */
export function DefaultThemeLoader({
  useLocalStorage,
  defaultScheme,
}: {
  useLocalStorage: boolean;
  defaultScheme: DefaultColorScheme;
}) {
  const fallback =
    defaultScheme === 'system'
      ? `(window.matchMedia(${JSON.stringify(PREFERS_LIGHT_MQ)}).matches ? 'light' : 'dark')`
      : JSON.stringify(defaultScheme);
  const saved = useLocalStorage
    ? `(function(){try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});return t==='light'||t==='dark'?t:null}catch(e){return null}})()`
    : 'null';
  const source = `(function(){var c=document.documentElement.classList;if(c.contains('light')||c.contains('dark'))return;c.add(${saved}||${fallback});})();`;
  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}

/**
 * Upstream's `useTheme` with a configurable fallback. The OS-preference
 * listener only runs when the default is `system`: with a fixed default, an
 * OS switch must not override the site's choice.
 */
export function useDefaultTheme({
  ssrTheme,
  useLocalStorage,
  defaultScheme,
}: {
  ssrTheme?: Theme;
  useLocalStorage?: boolean;
  defaultScheme: DefaultColorScheme;
}): [Theme | null, (theme: Theme) => void] {
  const [theme, setTheme] = React.useState<Theme | null>(() => {
    if (isTheme(ssrTheme)) return ssrTheme;
    if (typeof window !== 'object') return null;
    // Whatever the blocking loader put on <html> is the hydrated state.
    const classes = document.documentElement.classList;
    if (classes.contains('dark')) return 'dark' as Theme;
    if (classes.contains('light')) return 'light' as Theme;
    return null;
  });

  useEffect(() => {
    if (defaultScheme !== 'system') return;
    const mq = window.matchMedia(PREFERS_LIGHT_MQ);
    const onChange = () => setTheme((mq.matches ? 'light' : 'dark') as Theme);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [defaultScheme]);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!isTheme(theme)) return;
    if (useLocalStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // storage blocked: the choice lasts for this page only
      }
    } else {
      fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      }).catch(() => undefined);
    }
  }, [theme]);

  return [theme, setTheme];
}
