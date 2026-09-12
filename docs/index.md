# QuantEcon MyST theme — user guide

The feature reference for the QuantEcon lecture theme for MyST / Jupyter Book 2,
organised the way the Sphinx `quantecon-book-theme` documents its own features so
a lecture maintainer moving between the two finds the same headings. Each page
names the `myst.yml` keys involved; the [README](../README.md) has the narrative
version and the [CHANGELOG](../CHANGELOG.md) the history.

## Quick start

Point `site.template` at a pinned release asset:

```yaml
# myst.yml
site:
  template: https://github.com/QuantEcon/quantecon-theme.mystmd/releases/download/vX.Y.Z/quantecon-theme.zip
```

Then `myst start` for a live server or `myst build --html` for a static site.
Every theme option lives under `site.options` and is listed in
[configuration](configuration.md).

## Pages

| Page | Covers |
| --- | --- |
| [migrating](migrating.md) | moving a lecture repo off `quantecon-book-theme`, step by step |
| [configuration](configuration.md) | every `site.options` key, its scope and its default |
| [layout](layout.md) | header, contents drawer, "On this page" panel, back-to-top, footer |
| [authors](authors.md) | author line and translator credit |
| [launch](launch.md) | notebook launch buttons (Colab) and the notebook repo conventions |
| [notebooks](notebooks.md) | notebook output rendering, live compute, collapsible stderr |
| [git-metadata](git-metadata.md) | "Last changed" and the inline changelog |
| [code-highlighting](code-highlighting.md) | the code token palette |
| [text-color-schemes](text-color-schemes.md) | emphasis, strong and definition colours |
| [dark-mode](dark-mode.md) | the dark theme and its tokens |
| [rtl-support](rtl-support.md) | translated editions, the language switcher, right-to-left layout |
| [announcements](announcements.md) | site-wide banner (not offered; see the page) |
| [features/stderr-warnings](features/stderr-warnings.md) | the stderr fold in detail |

## How this relates to the Sphinx theme

The theme reproduces the deployed lecture sites' behaviour as those sites configure
the Sphinx theme, not every Sphinx option. The options with no counterpart are
listed, with a reason for each, in
[migrating](migrating.md#sphinx-options-with-no-counterpart) — which is also
the step-by-step for moving a repository across.
