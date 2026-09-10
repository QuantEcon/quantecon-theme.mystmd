# Collapsible stderr warnings

When a notebook cell produces stderr output (typically warnings), the theme
folds it behind a compact "⚠ Code warnings" control, closed by default, so the
reader sees the cell's result without the noise and can open the warnings when
troubleshooting. The Sphinx theme does the same with a script after page load;
here it is a native `<details>` around the stderr stream, done at render, so it
holds in the server-rendered HTML with no JavaScript and survives re-renders.

- Applies per stderr stream; stdout and results in the same cell stay visible.
- Keyboard and screen-reader accessible through the native disclosure.
- Dark mode supported.

## Customisation

Target these classes:

- `.qe-stderr` — the disclosure
- `.qe-stderr > summary` — the control
- `.qe-stderr__icon` — the warning icon
- `.qe-stderr pre.jupyter-error` — the stream itself
