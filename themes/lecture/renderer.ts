/**
 * The static-site renderer: what `myst build --html` runs through
 * `build.render` in template.yml (mystmd 1.11.0 and later). mystmd starts only
 * its content server, passes its URL in CONTENT_CDN and the output directory
 * in BUILD_DIRECTORY, and runs this in place of scraping a live theme server.
 *
 * It copies the client build into the output directory, then renders every
 * page, page JSON, public file and fixed route (robots.txt, sitemap.xml, the
 * search index, ...) through the app's own request handler, under the
 * deployment's BASE_URL. Built by `npm run build:renderer` into
 * build/renderer/server/index.js.
 *
 * Ported from jupyter-book/myst-theme's themes/book/renderer.ts (2.1.1).
 */
import { prerender } from '@myst-theme/prerender';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as build from 'virtual:react-router/server-build';

const CLIENT_PATH = path.join(path.dirname(import.meta.dirname), 'client');
const OUT_PATH = process.env.BUILD_DIRECTORY;
const CONCURRENCY = parseInt(process.env.RENDERER_CONCURRENCY ?? '4');

if (OUT_PATH === undefined) {
  throw new Error('BUILD_DIRECTORY is not set: run this through `myst build --html`.');
}

await fs.rm(OUT_PATH, { recursive: true, force: true });
await fs.cp(CLIENT_PATH, OUT_PATH, { recursive: true });

await prerender(build, OUT_PATH, { concurrency: CONCURRENCY });
