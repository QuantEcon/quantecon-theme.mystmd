# Code highlighting

The size and frame of code blocks are described under
[typography](typography.md#code-blocks); this page covers the token colours.

Code blocks use QuantEcon's own token palette, the Sphinx lecture sites'
default `qetheme_code_style`, in light and dark mode. MyST tokenises with
highlight.js rather than Pygments, so the palette is mapped scope by scope onto
the `hljs-*` classes; the mapping, and the two Pygments classes highlight.js has
no scope for (operators and module names), are documented in
`styles/quantecon.css`.

Only the default style ships. No lecture repository sets a different
`qetheme_code_style`, so the alternative palettes and the Pygments toggle the
Sphinx theme offers are deferred until a consumer asks. Five of the light-mode
token colours fall short of WCAG AA on white; whether to darken them is an open
two-theme decision (theme issue #172), since they are the deployed sites' values.
