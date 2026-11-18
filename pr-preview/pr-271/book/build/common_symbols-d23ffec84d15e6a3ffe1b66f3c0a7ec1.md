---
title: "Common Symbols"
label: c-cs
---

````{table}
:name: c-coms

```{list-table}
:header-rows: 0
:enumerated: false

* -  $P \implies Q$
  - $P$ implies $Q$
* - $P \iff Q$
  - $P \implies Q$ and $Q \implies P$
* - $\natset{n}$
  - the set $\{1, \ldots, n\}$
* - $\alpha := 1$
  - $\alpha$ is defined as equal to $1$
* - $f \equiv 1$
  - function $f$ is everywhere equal to $1$
* - $\wp(A)$
  - the power set of $A$; that is, the collection of all subsets of set $A$
* - $\NN$, $\ZZ$ and $\RR$
  - the natural numbers, integers and real numbers respectively
* - $\CC$
  - the set of complex numbers (see {ref}`sss-complex`)
* - $\ZZ_+$, $\RR_+$, etc.
  - the nonnegative elements of $\ZZ$, $\RR$, etc.
* - $\matset{n}{k}$
  - all $n \times k$ matrices
* - $\diag(a_1, \ldots, a_n)$
  - the diagonal matrix with $a_1, \ldots a_n$ on the principle diagonal
* - $|x|$
  - the absolute value of $x \in \RR$
* - $|B|$
  - the cardinality of (number of elements in) set $B$
* - $f \colon A \to B$
  - $f$ is a function from set $A$ to set $B$
* - $x \mapsto y$
  - $x$ is mapped to $y$ (under some given function)
* - $\RR^S$
  - the set of all functions from $S$ to $\RR$
* - $\RR^n$
  - all $n$-tuples of real numbers
* - $\| x \|_1$
  - the $\ell_1$ norm $\sum_i |x_i|$ (see {ref}`sss-norms`)
* - $\| x \|_\infty$
  - the $\ell_\infty$ norm $\max_i |x_i|$ (see {ref}`sss-norms`)
* - $\| A \|$ when $A \in \matset{n}{k}$
  - the operator norm of $A$ (see {ref}`sss-onorm`)
* - $\la a, b \ra$
  - the inner product of $a$ and $b$
* - $a \vee b$
  - the maximum of $a$ and $b$ (pointwise if they are vectors)
* - $a \wedge b$
  - the minimum of $a$ and $b$ (pointwise if they are vectors)
* - $g \ll h$
  - function (or vector) $g$ is everwhere strictly less than $h$
```
````

```{list-table}
:header-rows: 0

* - $\1$
  - vector of ones or function everywhere equal to one
* - $\1\{P\}$
  - indicator, equal to 1 if statement $P$ is true and 0 otherwise
* - $i_d(v)$
  - in-degree of node $v$
* - $o_d(v)$
  - out-degree of node $v$
* - $\iI(v)$
  - set of direct predecessors of node $v$
* - $\oO(v)$
  - set of direct successors of node $v$
* - $u \to v$
  - node $v$ is accessible from node $u$
* - IID
  - independent and identically distributed
* - $\delta_x$
  - the probability distribution concentrated on point $x$
* - $\dD(S)$
  - the set of distributions on $S$
* - $X \eqdist Y$
  - $X$ and $Y$ have the same distribution
* - $X \sim F$
  - $X$ has distribution $F$
* - $\Pi(\phi, \psi)$
  - the set of all couplings of $(\phi, \psi)$
* - $f \circ g$
  - the composition of functions $f$ and $g$
```
