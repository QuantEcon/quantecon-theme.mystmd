---
title: Operators
description: Metric spaces and contractions.
---

(sec-metric)=
## Metric spaces

Some text with a footnote.[^a]

```{prf:theorem} Banach
:label: thm-banach

A contraction on a complete metric space has a unique fixed point.
```

```{prf:proof}
Iterate.
```

```{prf:property}
:label: fact-one

Distances are symmetric.
```

```{margin}
A margin note.
```

## Lists

1. first
2. second

A note can hold a list[^c] or end in code.[^d]

(sec-fixed)=
## Fixed points

Iteration converges geometrically {cite}`banach1922`, a result used
throughout dynamic programming {cite:p}`stokey1989,ljungqvist2018`.
{cite:t}`stokey1989` give the recursive case, and
{cite:author}`ljungqvist2018` {cite:year}`ljungqvist2018` apply it.[^b]

```{math}
:label: eq-contraction
d(Tx, Ty) \le \beta \, d(x, y)
```

By {eq}`eq-contraction` and {prf:ref}`thm-banach`, the orbit in
{numref}`fig-orbit` converges at the rates of {numref}`tbl-rates`;
{ref}`sec-metric` sets out the definitions.

```{figure} cover.png
:label: fig-orbit
:width: 120px

An orbit of the iteration.
```

```{list-table} Rates of convergence
:label: tbl-rates
:header-rows: 1

* - Method
  - Rate
* - Iteration
  - Geometric
* - Newton
  - Quadratic
```

```{aside}
An aside, set in the gutter like a margin note.
```

[^a]: The footnote.
[^b]: A second footnote, with a [link](https://quantecon.org).

[^c]: A note with a parenthesised list:

    % fancy: lower-alpha parens
    1. the first case;
    2. the second.

[^d]: A note that ends in code:

    ```python
    x = 1
    ```
