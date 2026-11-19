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
import { clearableOutputDirectory } from './rendererOutput';

const CLIENT_PATH = path.join(path.dirname(import.meta.dirname), 'client');
// Emptied below, so it is checked first: a build output, not the project, the
// home directory or this bundle (see rendererOutput.ts).
const OUT_PATH = clearableOutputDirectory(process.env.BUILD_DIRECTORY, { keep: [CLIENT_PATH] });
const CONCURRENCY = parseInt(process.env.RENDERER_CONCURRENCY ?? '4');

await fs.rm(OUT_PATH, { recursive: true, force: true });
await fs.cp(CLIENT_PATH, OUT_PATH, { recursive: true });

await prerender(build, OUT_PATH, { concurrency: CONCURRENCY });
