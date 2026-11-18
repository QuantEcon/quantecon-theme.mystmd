#!/usr/bin/env node
/**
 * A plain static file server, for the `static-chrome` Playwright project.
 *
 * Deliberately dumb: no routing, no awareness of React Router's `<path>.data`
 * loader requests. That is the point -- it behaves like the static hosts a
 * site deploys to (Netlify, GitHub Pages, `python3 -m http.server`), where a
 * loader request finds no file and 404s. Directory requests without a
 * trailing slash 301 to the slashed form, as those hosts do.
 *
 *   node tests/visual/static-server.mjs <root-dir> [port]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";

const [rootArg, portArg] = process.argv.slice(2);
if (!rootArg) {
  console.error("usage: static-server.mjs <root-dir> [port]");
  process.exit(2);
}
const root = resolve(rootArg);
const port = Number(portArg || process.env.STATIC_PORT || 3114);

const TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".js": "text/javascript; charset=UTF-8",
  ".mjs": "text/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".map": "application/json",
  ".xml": "application/xml",
  ".xsl": "application/xml",
  ".txt": "text/plain; charset=UTF-8",
  ".inv": "application/octet-stream",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  let file = normalize(join(root, pathname));
  // Serve only what lies inside the root. A prefix test on the path is not
  // enough: `<root>-other/` starts with `<root>` too.
  const rel = relative(root, file);
  if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    res.writeHead(403).end();
    return;
  }
  try {
    let info = await stat(file);
    if (info.isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(301, { Location: `${pathname}/${url.search}` }).end();
        return;
      }
      file = join(file, "index.html");
      info = await stat(file);
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
      "Content-Length": body.length,
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(port, () => {
  console.log(`[static] serving ${root} on http://localhost:${port}`);
});
