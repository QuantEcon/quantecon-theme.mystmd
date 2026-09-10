/**
 * Rewrite absolute asset URLs in the built stylesheets to be relative to the
 * stylesheet itself.
 *
 * Remix rewrites every `url()` in a bundled stylesheet to
 * `${publicPath}_assets/<file>` — an absolute path, because `publicPath` is
 * also how it loads JS chunks and so cannot itself be relative. Under
 * `myst start` that resolves: `template/server.js` mounts `public/build` at
 * exactly that path. A static `myst build --html` has no such route, and
 * mystmd's asset rewriter only touches `.html`, `.js` and `.json` — never
 * `.css` — so the path inside the stylesheet keeps pointing at a directory the
 * output does not contain, and every font 404s.
 *
 * The referenced files always land in `_assets/`, and the whole build directory
 * moves as a unit between layouts, so a reference relative to the stylesheet
 * resolves in all of them:
 *
 *   myst start     /myst_assets_folder/_assets/x.css -> /myst_assets_folder/_assets/font.woff2
 *   static build   /build/_assets/x.css              -> /build/_assets/font.woff2
 *   under baseurl  <base>/build/_assets/x.css        -> <base>/build/_assets/font.woff2
 *
 * The last of those needs the relative form too: an absolute
 * `/myst_assets_folder` ignores `baseurl` and breaks on project-scoped
 * deployments such as the per-PR GitHub Pages previews.
 *
 * Not every stylesheet sits in `_assets/`: Remix also emits route and
 * shared-chunk CSS into the build root, `_shared/` and `routes/`, and those
 * reference `_assets/` from outside it. So the relative prefix is
 * computed per stylesheet from its own location rather than assumed to be
 * `./` — the whole tree is walked, and a stylesheet in the build root gets
 * `./_assets/` where one in `routes/` gets `../_assets/`.
 *
 * Every rewritten target is checked to exist at the path the stylesheet now
 * names, resolved from that stylesheet's own directory, so a wrong assumption
 * here fails the build rather than shipping silent 404s.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// Both read from the Remix config rather than hardcoded, so this cannot drift
// out of step with where the build actually puts things.
const { publicPath = '/', assetsBuildDirectory = 'public/build' } = require('../remix.config.prod.js');

const buildDir = path.resolve(assetsBuildDirectory);
const assetsDir = path.join(buildDir, '_assets');
const prefix = `${publicPath.endsWith('/') ? publicPath : `${publicPath}/`}_assets/`;
// url( optional-quote PREFIX file optional-quote )
const URL_RE = new RegExp(`url\\((\\s*['"]?)${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');

if (!fs.existsSync(assetsDir)) {
  console.error(`[css-assets] ${assetsDir} not found — run this after \`remix build\`.`);
  process.exit(1);
}

/** Every `.css` file under the build directory, at any depth. */
function* stylesheets(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* stylesheets(full);
    else if (entry.name.endsWith('.css')) yield full;
  }
}

/** How this stylesheet must spell `_assets/` to reach it from where it sits. */
function assetsPrefixFrom(file) {
  const rel = path.relative(path.dirname(file), assetsDir).split(path.sep).join('/');
  if (rel === '') return './';
  return rel.startsWith('..') ? `${rel}/` : `./${rel}/`;
}

let rewritten = 0;
const missing = [];
// Validate everything before writing anything: a partial rewrite would leave
// the build output in a half-corrected state that is confusing to debug and
// worse to inherit if a later step ever runs despite the failure.
const pending = [];

for (const file of stylesheets(buildDir)) {
  const before = fs.readFileSync(file, 'utf8');
  const assetsPrefix = assetsPrefixFrom(file);
  const after = before.replace(URL_RE, `url($1${assetsPrefix}`);
  if (after === before) continue;

  const name = path.relative(buildDir, file).split(path.sep).join('/');
  for (const [, target] of after.matchAll(/url\(\s*['"]?(\.[^)'"]+)['"]?\s*\)/g)) {
    const resolved = path.resolve(path.dirname(file), target.split(/[?#]/)[0]);
    if (!fs.existsSync(resolved)) missing.push(`${name} -> ${target}`);
  }

  rewritten += before.split(prefix).length - 1;
  pending.push([file, after]);
}

if (missing.length) {
  console.error(
    `[css-assets] ${missing.length} reference(s) do not exist beside their stylesheet:\n  ${missing.join('\n  ')}\n[css-assets] nothing written.`
  );
  process.exit(1);
}

for (const [file, contents] of pending) fs.writeFileSync(file, contents);
const filesTouched = pending.length;

console.log(
  `[css-assets] rewrote ${rewritten} asset URL(s) in ${filesTouched} stylesheet(s) to be stylesheet-relative`
);
