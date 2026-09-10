# Translated editions and right-to-left support

## Editions and the language switcher

An edition declares its language and its siblings under `site.options`; with
two or more entries the header shows a language switcher linking to the same
page in each edition, and every page carries `hreflang` alternates (the first
entry is `x-default`):

```yaml
site:
  options:
    current_language: fa
    language_switcher_label: تغییر زبان
    languages: |
      - code: en
        name: English
        url: https://python-programming.quantecon.org
      - code: fa
        name: فارسی
        url: https://quantecon.github.io/lecture-python-programming.fa
```

`languages` is a YAML block in a string because template options are
scalar-only. `current_language` also sets the document `lang`, marks the active
switcher entry and drives `og:locale`.

## Right-to-left

`enable_rtl: true` renders the document `dir="rtl"`. The layout uses logical
properties throughout, so the header, the contents drawer, the outline, list
markers (including parenthesised fancy markers) and the translator credit
mirror. A Persian fixture in the repository's visual tests keeps it that way.

## Translator credit

See [authors](authors.md).
