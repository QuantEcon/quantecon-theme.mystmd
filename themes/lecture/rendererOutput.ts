import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Whether `dir` is `other` or one of its ancestors. */
function containsOrIs(dir: string, other: string): boolean {
  const rel = path.relative(dir, other);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * `p` (absolute) with every symlink resolved, so an alias cannot hide which
 * directory it names. A path that does not exist yet -- the output directory
 * on a first build -- resolves through its nearest existing ancestor, so a
 * symlink anywhere above it is still seen through.
 */
function canonical(p: string): string {
  const missing: string[] = [];
  let dir = p;
  for (;;) {
    try {
      return path.join(fs.realpathSync.native(dir), ...missing.reverse());
    } catch {
      const parent = path.dirname(dir);
      if (parent === dir) return p;
      missing.push(path.basename(dir));
      dir = parent;
    }
  }
}

/**
 * The renderer's output directory, resolved, after checking it is safe to
 * empty: the renderer deletes it and refills it with the site.
 *
 * `myst build --html` passes its own `_build/html` in BUILD_DIRECTORY, so
 * under mystmd this always passes. The check is for the renderer run any other
 * way -- by hand, or with BUILD_DIRECTORY left over in a CI job's environment.
 * It refuses the filesystem root, the home directory, the current directory
 * and their ancestors, and anything that overlaps one of `keep` (the theme
 * bundle the renderer runs from) in either direction: the bundle itself, a
 * directory above it, or one inside it such as `renderer/server`. Paths are
 * compared with symlinks resolved.
 */
export function clearableOutputDirectory(
  outDir: string | undefined,
  {
    cwd = process.cwd(),
    home = os.homedir(),
    keep = [],
  }: { cwd?: string; home?: string; keep?: string[] } = {},
): string {
  if (!outDir || !outDir.trim()) {
    throw new Error('BUILD_DIRECTORY is not set: run this through `myst build --html`.');
  }
  const resolve = (dir: string) => canonical(path.resolve(cwd, dir));
  const resolved = resolve(outDir);
  const above = [path.parse(resolved).root, home, cwd].map(resolve);
  const bundle = keep.map(resolve);
  const hit =
    above.find((dir) => containsOrIs(resolved, dir)) ??
    bundle.find((dir) => containsOrIs(resolved, dir) || containsOrIs(dir, resolved));
  if (hit !== undefined) {
    throw new Error(
      `Refusing to empty BUILD_DIRECTORY=${outDir}: it overlaps ${hit}. ` +
        'Point it at a build output directory such as _build/html.',
    );
  }
  return resolved;
}
