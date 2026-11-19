/**
 * The theme's HTTP server: what `myst start` runs through `build.start` in
 * template.yml, with the content server's port in CONTENT_CDN_PORT. Built by
 * `npm run build:server` into build/server/server/index.js; `npm run dev` runs
 * it from source with a Vite dev server in front of the app.
 *
 * Ported from jupyter-book/myst-theme's themes/book/server.ts (2.1.1).
 */
import { createRequestHandler } from '@react-router/express';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import getPort from 'get-port';
import path from 'node:path';

// mystmd before 1.11.0 has no `build.render` support: its `myst build --html`
// starts this server with MODE=static and scrapes it, which this build cannot
// serve (its assets and links are laid out for the pre-renderer instead).
if (process.env.MODE === 'static') {
  console.error(
    `This version of the QuantEcon theme needs mystmd 1.11.0 or later (or a
QuantEcon/mystmd build from qe-v11 on) to build a static site.

Either upgrade mystmd, or pin the last theme release that supports older
versions in myst.yml:

site:
  template: https://github.com/QuantEcon/quantecon-theme.mystmd/releases/download/v3.2.0/quantecon-theme.zip
`,
  );
  process.exit(1);
}

const IS_PRODUCTION = (process.env.NODE_ENV ?? 'production') === 'production';
const HOST = process.env.HOST || 'localhost';
const PORT =
  process.env.PORT !== undefined
    ? Number.parseInt(process.env.PORT)
    : await getPort({ port: getPort.makeRange(3000, 3100) });

const viteDevServer = IS_PRODUCTION
  ? undefined
  : await import('vite').then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      }),
    );

type ServerBuild = Awaited<typeof import('virtual:react-router/server-build')>;
// In development the build is loaded through Vite on every request, so edits
// to routes and loaders apply without restarting the server; in production it
// is loaded once.
const build: ServerBuild | (() => Promise<ServerBuild>) = viteDevServer
  ? async () =>
      (await viteDevServer.ssrLoadModule('virtual:react-router/server-build')) as unknown as ServerBuild
  : await import('virtual:react-router/server-build');

const app = express();
app.use(compression());
// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');
app.use(morgan('tiny'));
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else if (typeof build !== 'function') {
  const baseName = build.basename ?? '/';
  // The build is <root>/server/index.js beside <root>/client.
  const CLIENT_PATH = path.join(path.dirname(import.meta.dirname), 'client');
  // Vite fingerprints everything it emits into _assets/, so it can be cached
  // for good. The rest of the client directory is the theme's public/ folder
  // (logos, the Thebe bundles), whose names do not change between releases.
  app.use(
    `${baseName}_assets`,
    express.static(path.join(CLIENT_PATH, '_assets'), { immutable: true, maxAge: '1y' }),
  );
  app.use(baseName, express.static(CLIENT_PATH, { maxAge: '1h' }));
}
app.use(createRequestHandler({ build }));

// mystmd reads the port from the first line of output that contains a URL, so
// nothing before this may print one.
app.listen(PORT, HOST, () => {
  console.log(`Server started at http://${HOST}:${PORT}`);
});
