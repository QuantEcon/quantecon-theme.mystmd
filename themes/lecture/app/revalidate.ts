import type { ShouldRevalidateFunction } from 'react-router';

/**
 * `shouldRevalidate` for the three route modules that render UI (`root`,
 * `routes/$`, `routes/_index`).
 *
 * A static build (`myst build --html`) still hydrates a live data router, but
 * its loaders are only servable by a running theme server: on a static host
 * the router's loader request (`<path>.data`) gets a 404 or an HTML page back,
 * not loader data, and the route falls into its error boundary. React Router
 * short-circuits hash-only navigations except when the hash is *removed*,
 * which is exactly what pressing Back from `#anchor` does, so without this
 * guard that POP re-runs the loaders on every statically-built page.
 *
 * These three loaders are pure functions of pathname and search, so declining
 * to revalidate when neither has changed is correct on a live server too, not
 * merely a patch for static builds: a repeated click on the active link does
 * not refetch. All three modules must export it -- patching `routes/$`
 * alone leaves the root loader re-running, and its data (`STATIC_BUILD`,
 * `BASE_URL`, the site config) is what the whole page renders from.
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
