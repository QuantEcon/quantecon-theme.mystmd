# Notebooks

## Output rendering

Notebook outputs render through `@myst-theme/jupyter`: streams and errors as
`<pre>`, execute results and display data by MIME type (text, HTML, images,
Plotly and widgets). Long outputs are clipped with a scroll region.

## Collapsible stderr

A cell's stderr stream is folded behind a "⚠ Code warnings" disclosure, closed
by default, so verbose warnings do not break the reading flow; stdout in the
same cell stays visible. It is a native `<details>`, so it works in the
server-rendered HTML without a script. Details in
[features/stderr-warnings](features/stderr-warnings.md).

## Live compute

Cells can run in place through Thebe, opt-in per project under the standard
`project.thebe` key; the QuantEcon default is JupyterLite, so Python runs in the
browser via Pyodide with nothing to host:

```yaml
project:
  thebe:
    lite: true
```

A Power control then appears in the header on notebook pages; connecting swaps
it for Run / Restart / Clear. Pyodide runs pure Python and the packages built
for it (numpy, scipy, pandas, matplotlib, sympy); numba and JAX do not import.
`binder:` and `server:` backends are available through the same key for
projects that need a full environment.

The deployed Sphinx lecture sites set `thebe: false`, so a series moving from
them changes nothing by leaving `project.thebe` unset.

### Per-lecture live compute

Because Pyodide cannot run every lecture, the `enable_live_compute` site
option gates the control per page. A lecture that will not run under the
configured kernel sets it under `site:` in its frontmatter (for a notebook,
`"site": {"enable_live_compute": false}` in the notebook metadata):

```yaml
---
site:
  enable_live_compute: false
---
```

Resolution is page value, then the site-wide `site.options.enable_live_compute`,
then on: with no flag anywhere the control appears wherever `project.thebe` is
set, so a series adopts the flag by marking its known-incompatible lectures
`false`. A series that would rather certify one lecture at a time sets
`enable_live_compute: false` site-wide and opts pages in with `true`. The gate
is broad: a gated page loses the toolbar toggle, the execute scope and the
error tray together, so nothing on it tries to run. The flag should come from
running each lecture's cells under the kernel and recording pass/fail, a job
that lives in the lecture repo rather than the theme.
