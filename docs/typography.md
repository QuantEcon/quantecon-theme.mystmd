# Content typography

Content renders at a flat 18px, set on the article rather than on the root:
the root stays at the browser's 16px, so a reader's own font-size preference
still applies and the toolbar's font-size control scales everything with it.
There is no breakpoint step, so nothing changes size under the reader as the
window narrows. The values below are measurements of the Sphinx lecture sites,
rounded to the 16px root where the Sphinx build sizes off its 18px one.

| Surface | Size | Notes |
| --- | --- | --- |
| prose | 18px | flat at every width |
| inline literals | 16px | `#af5f5f`; see [text colour schemes](text-color-schemes.md) |
| code blocks | 16px / 20px line | source and stored outputs alike; unchanged when live compute starts |
| callout bodies and titles | 16px | admonitions, exercises, proofs, dropdowns; nested callouts do not step down again |
| footer | 14.4px | faded to 70%; see [layout](layout.md#footer) |

## Code blocks

Source sits at 16px with a 20px line against the 18px prose, the Sphinx sites'
0.9 ratio. The frame is upstream's: an executable cell carries a grey frame and
a blue left rule, a plain fence or `{code-block}` directive a light fill and a
shadow, so a reader can tell a run cell from a shown snippet. The token palette
is described under [code highlighting](code-highlighting.md).

## Callouts

Admonition, exercise, proof and dropdown bodies step down to 16px, so an aside
reads as subordinate to the prose it interrupts; their titles take the same
size and keep upstream's medium weight. The step is off the root, so a note
inside an exercise renders at the same 16px as the exercise.

## Links

Content links are QuantEcon blue (`#0072bc`, `#004979` on hover) with no
underline at rest, on plain links and cross-references alike; a solid underline
in the link's own colour appears on hover and on keyboard focus. This is the
Sphinx sites' behaviour. Visited links are not coloured. In dark mode links are
white, weight 600; the dark palette is an open design question (#237).

Links that open a hover preview -- cross-references, links to other lectures
that carry a description or thumbnail, Wikipedia and GitHub links -- carry a
small stacked-squares glyph after the label, at the size, gap and opacity
upstream gives the external-link arrow. Footnote markers and citations open a
preview too but take no glyph. The glyph is a pre-coloured image rather than
an icon in `currentColor`, so a site that re-points `--qe-link-color` recolours
the text and not the glyph.

The glyph is the non-colour cue on the links that have one. A plain internal
link with no preview has none at rest: `#0072bc` is 2.02:1 against the body
text, short of the 3:1 WCAG 1.4.1 asks before colour alone may mark a link,
and no link colour clears both that and 4.5:1 on white. That residue is the
cost of matching the lecture builds; closing it means a non-colour resting
cue, not a different blue.
