import type { ShouldRevalidateFunction } from '@remix-run/react';

/**
 * `shouldRevalidate` for the three route modules that render UI (`root`,
 * `routes/$`, `routes/_index`).
 *
 * A static build (`myst build --html`) still hydrates a live data router, but
 * its loaders are only servable by a running Remix server: on a static host a
 * `?_data=` request returns the page's own HTML, `@remix-run/router` stores
 * that *string* as the loader value, and every `data.page` read then throws --
 * the "Application Error" screen. React Router short-circuits hash-only
 * navigations except when the hash is *removed* (`isHashChangeOnly`), which is
 * exactly what pressing Back from `#anchor` does, so without this guard that
 * POP re-runs the loaders on every statically-built page.
 *
 * These three loaders are pure functions of pathname and search, so declining
 * to revalidate when neither has changed is correct in `app` mode too, not
 * merely a patch for static builds: a repeated click on the active link does
 * not refetch. All three modules must export it -- patching `routes/$`
 * alone leaves `?_data=root` firing, which silently replaces the root loader
 * data (`MODE`, `BASE_URL`, `theme`) with an HTML string.
 *
 * The underlying flaw -- a `staticBuild` Document that keeps loader-bearing
 * routes hydrated -- belongs upstream; see UPSTREAM-CANDIDATES.yml
 * (`static-build-loaders`).
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  formMethod,
  actionResult,
  defaultShouldRevalidate,
}) => {
  if (
    formMethod == null &&
    actionResult === undefined &&
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.search === nextUrl.search
  ) {
    return false;
  }
  return defaultShouldRevalidate;
};
