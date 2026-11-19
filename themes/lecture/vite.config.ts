import { reactRouter } from '@react-router/dev/vite';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { normalizeBaseURL } from '@myst-theme/common';

// Ported from jupyter-book/myst-theme's themes/book/vite.config.ts (2.1.1).
export default defineConfig(({ mode }) => {
  const baseConfig: UserConfig = {
    plugins: [reactRouter()],
    build: {
      assetsDir: '_assets',
      minify: mode === 'production',
    },
    // Production builds bundle every dependency into the server output, so the
    // shipped theme runs without a `node_modules`: `myst build --html` does not
    // run the template's `build.install` before `build.render`. It is also what
    // carries the patch-package fixes in `patches/` into the bundle.
    ssr: {
      noExternal: mode === 'production' ? true : undefined,
    },
    resolve: { tsconfigPaths: true },
  };
  const overrideConfig: UserConfig =
    process.env.VITE_BUILD_HTML !== undefined
      ? {
          // The pre-renderer (renderer.ts) is the server entry, and asset URLs
          // are relative: renderer.ts copies the client build into the output
          // directory and re-bases the route manifest onto BASE_URL there.
          // Stylesheets therefore reference their fonts relative to themselves,
          // which is what a site served under a sub-path needs.
          environments: {
            ssr: { build: { rolldownOptions: { input: './renderer.ts' } } },
          },
          base: './',
        }
      : {
          server: { port: 3000 },
          environments: {
            ssr: { build: { rolldownOptions: { input: './server.ts' } } },
          },
          base: `${normalizeBaseURL(process.env.BASE_URL ?? '')}/`,
        };
  return mergeConfig(baseConfig, overrideConfig);
});
