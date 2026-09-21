# Notebooks

## Output rendering

Notebook outputs render through `@myst-theme/jupyter`: streams and errors as
`<pre>`, execute results and display data by MIME type (text, HTML, images,
Plotly and widgets). Images in a cell's outputs are centred in the content
column; tables and text stay left-aligned, as on the Sphinx sites.

By default nothing limits an output's height: a long output renders at full
length, and the Sphinx builds' `scroll-output` and `collapse-N` cell tags have
no effect. A prototype that renders them is behind a site option; see
[Long cells](#long-cells-prototype) below.

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

## Long cells (prototype)

**Prototype, off by default** ([#242](https://github.com/QuantEcon/quantecon-theme.mystmd/issues/242)). The Sphinx theme caps a long cell in two ways, by cell tag: `collapse-N` caps the code *input* behind an Expand / Collapse bar, and `scroll-output` (older spelling `output_scroll`) caps the *output* with a scrollbar. Whether this theme keeps both mechanisms or one is a QuantEcon policy decision (QuantEcon/project-theme-parity#19), so the prototype renders every combination for a side-by-side, behind a site option:

```yaml
site:
  options:
    long_cell_tags: true
```

| Tag on the cell | Input | Output |
| --- | --- | --- |
| `collapse-N` | capped at N em of the code font, Expand / Collapse bar | |
| `scroll-input` (a myst-nb tag the Sphinx stack already honours; no lecture uses it) | capped at 24 em, scrollbar | |
| `scroll-output`, `output_scroll` | | capped at 24 em, scrollbar |
| `collapse-output-N` (prototype-only: neither stack has it) | | capped at N em, the same bar |

The tags are read from the block's `data.tags`, which every cell tag reaches whatever the engine makes of it, so this needs no engine change. An input cap and an output cap are independent; where two tags claim the same side the first wins. A tagged cell that is short enough to fit shows no bar. With the option unset, tagged and untagged cells render exactly as they always have.

`scripts/prototype-long-cell-check.mjs` checks the behaviour in a browser and crops the four regions at three viewports in both colour schemes; its header says how to run it against the theme-parity corpus's long-cells page.
