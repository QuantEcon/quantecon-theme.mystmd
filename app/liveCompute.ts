/**
 * Per-lecture live compute (#114).
 *
 * `project.thebe` turns in-page compute on for a whole project, but Pyodide
 * cannot run every lecture (numba and JAX do not import), so the `live_compute`
 * site option gates the control per page. Resolution, most specific first:
 *
 *   1. `site.live_compute` in the page's frontmatter
 *   2. `site.options.live_compute` in myst.yml (the project-wide default)
 *   3. `true` -- absent means today's behaviour: compute wherever `project.thebe`
 *      is set, so existing projects change nothing, and a series can adopt the
 *      flag incrementally by marking its known-incompatible lectures `false`.
 *      A series that would rather certify lectures one at a time sets the
 *      site-wide value to `false` and opts pages in.
 *
 * A gated page loses the whole compute surface, not just the toolbar toggle:
 * Page.tsx turns the resolved value into the `optionOverrideFn` of
 * `ComputeOptionsProvider`, which flips `compute.enabled` and with it the
 * toolbar slot, the error tray and the execute scope in one place. "Not
 * compatible" means nothing on the page should try to run.
 *
 * Pure TypeScript, no React, so tests/unit/live-compute.test.mjs runs it under
 * `node --test` with type stripping like the other helpers.
 */

/** Reads a boolean option leniently: YAML booleans, or the strings a hand edit produces. */
function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (v === 'true' || v === 'yes' || v === 'on') return true;
    if (v === 'false' || v === 'no' || v === 'off') return false;
  }
  return undefined;
}

export function resolveLiveCompute(
  pageOptions: Record<string, unknown> | undefined,
  siteOptions: Record<string, unknown> | undefined,
): boolean {
  return asBoolean(pageOptions?.live_compute) ?? asBoolean(siteOptions?.live_compute) ?? true;
}
