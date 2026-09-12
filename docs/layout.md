# Layout

The page chrome, matched to the deployed Sphinx lecture sites.

## Header

A fixed 50px toolbar. On the left: the contents-drawer toggle, a Home link to
the site root, and the QuantEcon logo, which links to quantecon.org. On the
right: the search trigger, the full-screen toggle, the font-size control, the
dark-mode toggle, downloads, and — each only when the site configures it — the
live-compute control, the launch button and the language switcher, with a
GitHub link beside them. The toolbar carries no site title. Below `md` the
full-screen toggle, font-size control, downloads, launch and GitHub move into
an overflow menu.

Below the toolbar, the page header carries the title, the author line, the
translator credit and the "Last changed" control, above a QuantEcon blue rule.

## Contents drawer

The site table of contents is an off-canvas drawer, toggled from the header. It
is built on the native Popover API, so it opens without JavaScript and closes
when the search dialog opens. `hide_toc: true` (site-wide or on a page) removes
it and its toggle.

## "On this page"

The right-hand outline is pinned (`position: fixed` in the margin column),
lists **h2, h3 and h4** headings with their section numbers when numbering is
on, and marks the section being read in QuantEcon blue, bold, with an inset
rule (`aria-current="location"`). Each level is indented one step further than
the one above it. h5 and deeper are not listed. The rule is the Sphinx
scrollspy's: a section is current once its heading has passed 120px from the
top, and the last section is current at the bottom of the page. Past the
viewport height the panel scrolls internally behind a fade.

Sub-lists collapse to the current branch as the Sphinx panel does under
`contents_autoexpand`, at every depth: only the sections show until you scroll
into one, its subsections then expand, and an h3's h4s expand once that h3 or
one of those h4s is current. Ancestors of the current entry are expanded but
not marked — exactly one entry is marked at a time.

## Back to top

A "↑ Top" link in the margin column, visible after 80px of scrolling, as a plain
`#top` fragment link.

## Footer

With no `site.parts.footer` declared, the theme renders a default footer: the
CC BY-SA 4.0 badge, the sentence "Creative Commons License – This work is
licensed under a Creative Commons Attribution-ShareAlike 4.0 International.",
and "A theme by QuantEcon". This is the Sphinx sites' footer block, which every
site carried without configuring anything.

`site.parts.footer` names a Markdown file that **replaces** the default
outright — licence notice and theme credit included. Set it only to state
different terms:

```yaml
site:
  parts:
    footer: footer.md
```

## Widths

An 800px body column with a 200px margin column on each side at 1280px and up.
Below 1280px the margin column is hidden and the layout is single-column, so
the "On this page" outline appears only from 1280px. Between 1280px and 1328px
the left track absorbs the shortfall rather than overflowing the grid.
