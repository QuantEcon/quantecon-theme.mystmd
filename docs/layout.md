# Layout

The page chrome, matched to the deployed Sphinx lecture sites.

## Header

A fixed 50px toolbar: the QuantEcon logo and site title, the contents-drawer
toggle, and on the right the search trigger, launch button, downloads, dark-mode
toggle, full-screen toggle and, when configured, the language switcher and the
live-compute control. Below it, the page header carries the title, the author
line, the translator credit and the "Last changed" control, above a QuantEcon
blue rule.

## Contents drawer

The site table of contents is an off-canvas drawer, toggled from the header. It
is built on the native Popover API, so it opens without JavaScript and closes
when the search dialog opens. `hide_toc: true` (site-wide or on a page) removes
it and its toggle.

## "On this page"

The right-hand outline is pinned (`position: fixed` in the margin column),
lists h2 and h3 headings with their section numbers when numbering is on, and
marks the section being read in QuantEcon blue, bold, with an inset rule
(`aria-current="location"`). The rule is the Sphinx scrollspy's: a section is
current once its heading has passed 120px from the top, and the last section is
current at the bottom of the page. Past the viewport height the panel scrolls
internally behind a fade. Subsections collapse to the current branch as the
Sphinx panel does under `contents_autoexpand`: only the sections show until
you scroll into one, its subsections then expand, and the parent of a current
subsection is expanded but not marked.

## Back to top

A "↑ Top" link in the margin column, visible after 80px of scrolling, as a plain
`#top` fragment link.

## Footer

`site.parts.footer` names a Markdown file rendered as the site footer, matching
the Sphinx sites' footer block:

```yaml
site:
  parts:
    footer: footer.md
```

## Widths

An 800px body column with a 200px margin column on each side at 1280px and up;
below `lg` (1024px) the outline column is hidden and the layout is single-column.
