# Notebooks

## Output rendering

Notebook outputs render through `@myst-theme/jupyter`: streams and errors as
`<pre>`, execute results and display data by MIME type (text, HTML, images,
Plotly and widgets). Images in a cell's outputs are centred in the content
column; tables and text stay left-aligned, as on the Sphinx sites.

A long output renders at full length unless its cell is tagged
`collapse-output-N`; see [Long cells](#long-cells) below.

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

## Long cells

A code cell's tags can collapse a long input or long outputs behind an
Expand / Collapse bar, the mechanism the lecture sites use for long class and
function definitions:

| Tag on the cell | Collapses | Cap |
| --- | --- | --- |
| `collapse-N` | the code input | N + 0.5 em of the 18px text: 369px for `collapse-20` |
| `collapse-output-N` | the cell's outputs | N + 0.5 em: 441px for `collapse-output-24` |

The cap is the height `quantecon-book-theme` gives `collapse-N` on the Sphinx
lecture sites.

- The region is capped in the server-rendered HTML, so a page never shows a
  tagged cell at full height first. The bar, and a fade at the foot of the
  capped content, appear only while the content is taller than the cap: a
  tagged cell that fits at the reader's width shows neither. The server shows
  the bar where the line count makes the overflow certain; images, HTML and
  lines that wrap are measured in the browser once the page is live, and
  again whenever the region resizes.
- The bar is a button with `aria-expanded` and `aria-controls`. Collapsing
  brings the end of the region back into view, so a reader who expanded a long
  cell is not left in the middle of whatever follows it.
- Printed, or read without JavaScript, nothing is capped and there is no bar.
- An input cap and an output cap are independent; where two tags claim the
  same side, the first wins. `collapse-0` and non-numeric heights are ignored.
  A cell with no stored output, or whose input or output is removed, is not
  collapsed.
- The tags are read from the cell's `data.tags`, which every cell tag reaches
  whatever the engine does with it, so this needs no engine change.

The scroll tags are not rendered: `scroll-output`, its older spelling
`output_scroll`, and `scroll-input` leave a cell at full length. The lectures
use the one mechanism, the bar, for long inputs and long outputs, and rename
every `output_scroll` and `scroll-output` to `collapse-output-24` when they
move to this theme: 24 gives about the height of the 24 em scroll box those
tags asked for on the Sphinx sites. The decision is
QuantEcon/project-theme-parity#19; the rename runs with the lecture migration,
QuantEcon/workspace-lectures#64.
