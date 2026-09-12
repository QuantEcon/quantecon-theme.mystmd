# Authors and translators

## Authors

Page-level `authors` frontmatter renders as the byline in the page header, as on
the Sphinx sites:

```yaml
---
authors:
  - name: Thomas J. Sargent
  - name: John Stachurski
---
```

Project-level authors in `myst.yml` apply to every page.

## Translators

A translated edition credits its translators after the byline. Set them
site-wide under `site.options`, as a YAML block (template options are
scalar-only), with an optional label in the edition's language:

```yaml
site:
  options:
    translators: |
      - name: مترجم نمونه
        url: https://example.org/translator
    translators_label: ترجمهٔ
```

A page overrides the list under `site:` in its frontmatter (replace, never
merge); an empty value there suppresses the credit on that page. The label
defaults to "Translated by"; an empty string hides it.

`translators_label` is the only part of the credit an edition can translate.
The names themselves are joined in English — "A", "A and B", "A, B and C" — on
every edition, including right-to-left ones. See
[rtl-support](rtl-support.md) for the rest of the multilingual configuration.
