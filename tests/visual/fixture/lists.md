---
# An explicitly empty value suppresses the translator credit on this page
# (#143), rather than falling back to the project-level one.
site:
  translators: ''
---
# Fancy ordered lists

Ordered lists whose `list` nodes carry `style` / `delimiter` (QuantEcon/mystmd#50)
must render alphabetic, roman, and parenthesized markers — not decimals. The lists
below are ordinary `1.` markdown stamped by `fancy-lists.mjs`, so this page renders
identically whichever mystmd parses it.

Alphabetic with parentheses — markers should read (a), (b), (c):

% fancy: lower-alpha parens
1. Alpha item one.
2. Alpha item two, with enough trailing text that the line wraps and shows the
   wrapped continuation aligning under the item text rather than under the
   parenthesized marker in the gutter.
3. Alpha item three.

Roman with parentheses — markers should read (i), (ii), (iii):

% fancy: lower-roman parens
1. Roman item one.
2. Roman item two.
3. Roman item three.

Upper-alpha with a single closing paren — markers should read A), B), C):

% fancy: upper-alpha paren
1. Upper item one.
2. Upper item two.
3. Upper item three.

Roman with period markers (no delimiter class) — should read i., ii., iii.:

% fancy: lower-roman
1. Period item one.
2. Period item two.
3. Period item three.

Plain decimal control list — unchanged by any of the above:

1. Decimal item one.
2. Decimal item two.

## Inside a prf directive

Same stamped list, wrapped in `prf:theorem` — markers should read (i), (ii), (iii).
Every list above sits in the page body, so this is the only case that pins
`LIST_RENDERERS` reaching the `prf:*` subtree (#121).

:::{prf:theorem} Probe Theorem
:label: thm-probe-120

% fancy: lower-roman parens
1. Roman inside one.
2. Roman inside two.
3. Roman inside three.

:::
