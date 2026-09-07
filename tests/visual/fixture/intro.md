---
# Page-level translator override (#143): replaces the project's translator on
# this page only. Written as a YAML block string, like the site option.
site:
  translators: |
    - name: Page-level Translator
---
# Introduction

This is a **visual-regression fixture** for the QuantEcon MyST theme. It exercises
the main rendering surfaces so we can diff the theme across versions.

## A section

Some prose with *emphasis*, `inline code`, and an inline equation $e^{i\pi} + 1 = 0$.
Here is a [link](https://quantecon.org) and a footnote reference.[^note]

[^note]: The footnote body.

- First bullet
- Second bullet with a [cross-reference](#a-section)
- Third bullet

1. Ordered one
2. Ordered two

> A blockquote, to check quote styling.

:::{note}
An admonition on the landing page.
:::
