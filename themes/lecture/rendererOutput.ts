import os from 'node:os';
import path from 'node:path';

/** Whether `dir` is `other` or one of its ancestors. */
function containsOrIs(dir: string, other: string): boolean {
  const rel = path.relative(dir, other);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * The renderer's output directory, resolved, after checking it is safe to
 * empty: the renderer deletes it and refills it with the site.
 *
 * `myst build --html` passes its own `_build/html` in BUILD_DIRECTORY, so
 * under mystmd this always passes. The check is for the renderer run any other
 * way -- by hand, or with BUILD_DIRECTORY left over in a CI job's environment
 * -- where a value naming the filesystem root, the home directory, the
 * current directory, one of their ancestors, or a directory holding one of
 * `keep` (the renderer's own bundle) would otherwise be deleted.
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
  const resolved = path.resolve(cwd, outDir);
  const protectedDirs = [path.parse(resolved).root, home, cwd, ...keep].map((dir) =>
    path.resolve(cwd, dir),
  );
  const hit = protectedDirs.find((dir) => containsOrIs(resolved, dir));
  if (hit !== undefined) {
    throw new Error(
      `Refusing to empty BUILD_DIRECTORY=${outDir}: it is, or contains, ${hit}. ` +
        'Point it at a build output directory such as _build/html.',
    );
  }
  return resolved;
}
