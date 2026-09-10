---
# Authors exercise the header layout: names on the left, the "Last changed"
# control aligned to the right of the same row.
authors:
  - name: Thomas J. Sargent
  - name: John Stachurski
site:
  # Deterministic stand-in for plugins/git-metadata.mjs output, so the header
  # history control renders identically on every run (real git dates would
  # change with each commit and churn the snapshots).
  git_metadata:
    last_modified: '2026-01-15T10:30:00Z'
    changelog:
      - hash: 3f9d2c41b8a7e6f5d4c3b2a1908f7e6d5c4b3a29
        short_hash: 3f9d2c4
        author: Matt McKay
        date: '2026-01-15T10:30:00Z'
        message: 'Update features page: add numbered equation'
      - hash: 8e7d6c5b4a392817f6e5d4c3b2a190817263f4e5
        short_hash: 8e7d6c5
        author: Jane Economist
        date: '2025-12-01T09:00:00Z'
        message: Improve code examples
      - hash: a1b2c3d4e5f60718293a4b5c6d7e8f9012345678
        short_hash: a1b2c3d
        author: Matt McKay
        date: '2025-09-20T14:45:00Z'
        message: Initial features fixture
---

# Features

Pages here exercise math, code, admonitions, tables and figures.

## Mathematics

Display math:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

A numbered equation:

```{math}
:label: euler
A_{t+1} = (1 + r)\,(A_t - c_t)
```

See {eq}`euler`.

## Code

One token of each kind the QuantEcon palette colours: a comment, a decorator,
a function and its parameters, a docstring, keywords, `True` / `None`, a class
name, builtins, numbers and an f-string.

```python
import numpy as np


@np.vectorize
def f(x, scale=1.0):
    """Scaled Gaussian."""
    # comments sit in the muted blue
    return scale * np.exp(-x ** 2)


class Model:
    def __init__(self, r=0.05, verbose=True):
        self.r, self.verbose = r, verbose

    def step(self, a):
        return (1 + self.r) * a if a is not None else 0.0


print(f"{f(np.linspace(0, 1, 3))!r}", Model().step(2))
```

## Admonitions

:::{warning}
A warning admonition.
:::

:::{tip}
A tip admonition with a nested list:

- one
- two
:::

## A table

| Symbol | Meaning      | Value |
| ------ | ------------ | ----: |
| $r$    | interest     |  0.05 |
| $\beta$| discount     |  0.96 |
| $c$    | consumption  |  1.20 |

## A definition list

Term
: Definition of the term.

Another term
: Its definition, with $x \in \mathbb{R}$.
