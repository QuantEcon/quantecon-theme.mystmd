# No-Thebe fixture

This project does **not** set `project.thebe`, so live compute is off and the
header must show no live-compute (Power) toggle. Used by the
`live-compute-toggle-absent-without-thebe` visual test.

The landing-page TOC below is rebuilt from the site manifest by the theme
(`toc:project` block → app/components/ProjectTOC.tsx): section titles as real
headings, entries as "1. Title", no bullets. Asserted by the `front-toc-*`
tests in theme.spec.ts.

```{tableofcontents}
```
