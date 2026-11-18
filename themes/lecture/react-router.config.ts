import type { Config } from '@react-router/dev/config';
import { normalizeBaseURL } from '@myst-theme/common';

/**
 * Two builds of the same app, selected by `VITE_BUILD_HTML`, each into its own
 * directory so `npm run prod:build` produces both without one overwriting the
 * other (the Makefile ships them as `server/` and `renderer/`):
 *
 *   build/server    the Express server that `myst start` launches through
 *                   `build.start` in template.yml. Its basename is fixed at
 *                   build time from BASE_URL, which is unset for the release
 *                   bundle, so it serves from `/`.
 *   build/renderer  the pre-renderer that `myst build --html` runs through
 *                   `build.render`. It has no basename of its own: renderer.ts
 *                   applies the deployment's BASE_URL when it renders. Route
 *                   discovery is `initial` because a static host cannot answer
 *                   the `/__manifest` requests lazy discovery makes.
 */
const IS_VITE_BUILD_HTML = !!process.env.VITE_BUILD_HTML;

const config: Config = IS_VITE_BUILD_HTML
  ? {
      ssr: true,
      buildDirectory: 'build/renderer',
      routeDiscovery: { mode: 'initial' },
    }
  : {
      ssr: true,
      buildDirectory: 'build/server',
      basename: `${normalizeBaseURL(process.env.BASE_URL ?? '')}/`,
    };

export default config;
