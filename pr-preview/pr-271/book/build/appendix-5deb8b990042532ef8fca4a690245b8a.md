---
title: "Appendix"
label: c-ap
---

(s-review)=
## Math Review
This section provides a brief review of basic analysis and linear algebra. The material contained here should be covered in intermediate mathematical economics courses or, if not, in math boot camp at the very start of a graduate program.

(For those who want a slower treatment of the analysis section, we recommend {cite}`bartle2011introduction`, which is carefully constructed and beautifully written. High quality texts on linear algebra at the right level for this course include {cite}`jan`, {cite}`meyer2000matrix`, {cite}`aggarwal2020linear` and {cite}`cohen2021linear`.)

(ss-sefun)=
### Sets and Functions
As a first step, let's clarify elementary terminology and notation.

(sss-sets)=
#### Sets
A **set** is an arbitrary collection of objects. Individual objects are called **elements** of the set. We assume the reader is familiar with basic set operations such as intersections and unions. If $A$ is a finite set, then $|A|$ is the number of elements in $A$. Powers applied to sets indicate **Cartesian products**, so that

```{math}
:enumerated: false

A^2 := A \times A := \setntn{(a, a')}{a \in A,\; a' \in A},
    \;\; \text{etc.}
```

Throughout, $\wp(A)$ is the **power set** of $A$, consisting of all subsets of $A$. For example,

```{math}
:enumerated: false

A = \{1, 2\}
    \quad \implies \quad
    \wp(A) = \{ \emptyset, \{1\}, \{2\}, A \}.
```

Let $\NN$ be the natural numbers, $\ZZ$ be the integers, $\QQ$ be the rational numbers and $\RR$ be the reals (i.e., the union of the rational and irrational numbers). For $x, y$ in $\RR$, we let

$$
x \vee y := \max\{x, y\}
    \quad \text{and} \quad
    x \wedge y := \min\{x, y\}.
$$ (eq-vw)

Absolute value is $|x| := x \vee (-x)$. For $n \in \NN$ we set $\natset{n} := \{1, \ldots, n\}$.

We make use of the following elementary facts: For all $a, b, c \in \RR$,

- $|a + b| \leq |a| + |b|$.

- $(a \wedge b) +  c = (a + c) \wedge (b + c)$ and $(a \vee b) +  c = (a + c) \vee (b + c)$.

- $(a \vee b) \wedge c = (a \wedge c) \vee (b \wedge c)$ and $(a \wedge b) \vee c = (a \vee c) \wedge (b \vee c)$.

- $|a \wedge c - b \wedge c | \leq |a - b|$.

- $|a \vee c - b \vee c | \leq |a - b|$.

The first item is called the **triangle inequality**. Also, if $a, b, c \in \RR_+$, then

$$
(a + b) \wedge c  \leq (a \wedge c) + (b \wedge c).
$$ (eq-abc)

```{exercise}
:label: ex-awedg

Prove: For all $a, b, c \in \RR_+$, we have $|a \wedge c - b \wedge c| \leq |a-b| \wedge c$.
```


````{solution} ex-awedg

Fix $a, b \in \RR_+$ and $c \in \RR$. By {eq}`eq-abc`, we have

```{math}
:enumerated: false

a \wedge c 
        = (a - b + b) \wedge c
        \leq ( |a - b| + b) \wedge c
        \leq  |a - b| \wedge c + b \wedge c.
```

Thus, $a \wedge c - b \wedge c \leq |a-b| \wedge c$. Reversing the roles of $a$ and $b$ gives $b \wedge c - a \wedge c \leq |a-b| \wedge c$. This proves the claim in {prf:ref}`ex-awedg`.
````


(sss-eqclass)=
#### Equivalence Classes
Let $S$ be any set. A **relation** $\sim$ on $S$ is a nonempty subset of $S \times S$. It is customary to write $x \sim y$ rather than $(x, y) \in \, \sim$ to indicate that $(x,y)$ is in $\sim$. A relation $\sim$ on $S$ is called an **equivalence relation** if, for all $x, y, z \in S$, we have

(**reflexivity**) $x \sim x$,

(**symmetry**) $x \sim y$ implies $y \sim x$ and

(**transitivity**) $x \sim y$ and $y \sim z$ implies $x \sim z$.

Any equivalence relation on $S$ induces a partition of $S$ into a collection of mutually disjoint subsets such that their union exhausts $S$. These subsets are called **equivalence classes**. They can be constructed by taking, for each $x \in S$, the set of all elements that are equivalent to $x$.

```{prf:example}
:label: eg-eqrel

Let $S$ be the set of all people in the world. If $x \sim y$ indicates that $x$ and $y$ live in the same country, then $\sim$ is an equivalence relation. (Check the axioms.) The equivalence classes are the population of each country. The partition induced on $S$ is the set of these classes, which we can identify with the set of all countries in the world.
```


(sss-functions)=
#### Functions
A **function** $f$ from set $A$ to set $B$ is a rule, written $f \colon A \to B$ or $a \mapsto f(a)$, that associates each element $a$ of $A$ with one and only one element $f(a)$ of $B$. The set $A$ is called the **domain** of $f$ and $B$ is called the **codomain**. The **range** or **image** of $f$ is

```{math}
:enumerated: false

\range(f) := \setntn{b \in B}{b = f(a) \text{ for some } a \in A}.
```

A function $f \colon A \to B$ is called

- **one-to-one** if $f(a) = f(a')$ implies $a = a'$,

- **onto** if $\range(f) = B$, and

- a **bijection** or **one-to-one correspondence** if $f$ is both onto and one-to-one.

```{prf:example}

If $S$ is a nonempty set, then the **identity map** on $S$ is the map $I \colon S \to S$ such that $I(x) = x$ for all $x \in S$. The identity map is a bijection for any choice of $S$.
```


The left panel of {numref}`f-func_types_1` shows a one-to-one function on $(0,1)$. This function is not onto, however. For example, there exists no $x \in (0,1)$ with $f(x)=1/4$. The right panel of {numref}`f-func_types_1` shows an onto function, with $\range(f) = (0,1)$. This function is not one-to-one, however. For example, $f(1/4)=f(3/4)=3/4$.

```{figure} figures/func_types_1.svg
:name: f-func_types_1

Different types of functions on $(0,1)$
```

The left panel of {numref}`f-func_types_2` gives an example of a function which is neither one-to-one nor onto. The right panel of {numref}`f-func_types_2` gives an example of a bijection.

```{figure} figures/func_types_2.svg
:name: f-func_types_2

Some functions are bijections and some are not
```

#### Inverse Functions

One motivation for our interest in the basic properties of functions is that we wish to solve inverse problems. For an arbitrary nonempty set $S$ and a function $f \colon S \to S$, an abstraction of an inverse problem is solving $y=f(x)$ for $x \in S$.

Prior to stating the next result, we recall that an **inverse function** for $f \colon S \to S$ is a function $g \colon S \to S$ such that $f \circ g = g \circ f = I$, where $I$ is the identity map on $S$. The inverse function of $f$ is often written as $f^{-1}$.

```{prf:lemma}
:label: l-ibj

For $f \colon S \to S$, the following statements are equivalent:

(i) $f$ is a bijection on $S$.

(ii) For each $y \in S$, there exists a unique $x \in S$ such that $f(x)=y$.

(iii) $f$ has an inverse on $S$.
```


```{prf:proof}
:nonumber:

((i) $\implies$ (ii)) Fix $y \in S$. Since $f$ is onto, there exists an $x \in S$ such that $f(x)=y$. Since $f$ is one-to-one, there is at most one such $x$.

((ii) $\implies$ (iii)) Let $g \colon S \to S$ map each $y \in S$ into the unique $x \in S$ such that $f(x)=y$. By the definition of $g$, for fixed $x \in S$, we have $g(f(x)) = x$. Moreover, for each $y \in S$, the point $g(y)$ is the point that $f$ maps to $y$, so $f(g(y))=y$.

((iii) $\implies$ (i)) Let $g$ be the inverse of $f$. To see that $f$ must be onto, pick any $y \in S$. Since $f \circ g$ is the identity, we have $f(g(y))=y$. Hence there exists a point $g(y)$ in $S$ that is mapped into $y \in S$. To see that $f$ is one-to-one, fix $x,y \in S$. If $f(x)=f(y)$, then $g(f(x))=g(f(y))$. But $g \circ f$ is the identity, so $x=y$. ◻
```


Here is a nice logical exercise that turns out to be useful when we solve linear inverse problems.

```{exercise}
:label: ex-lioneone

Let $S$ and $T$ be nonempty sets. For $f \colon S \to T$, a function $g \colon T \to S$ is called a **left inverse** of $f$ if $g \circ f = I$, where $I$ is the identity on $S$. Prove that $f$ is one-to-one if and only if $f$ has a left inverse.
```


```{solution} ex-lioneone

Suppose first that $f$ is one-to-one. We construct a left inverse $g$ as follows. For $y \in \range(f)$, let $g(y)$ be the unique $x$ such that $f(x)=y$. (Uniqueness is by the one-to-one property.) For $y \notin \range(f)$, let $g(y)=\bar x$, where $\bar x$ is any point in $S$. The function $g$ is a left inverse of $f$ because, for any $x \in S$, the point $y=f(x)$ is in $\range(f)$, and $g(y)=x$. Hence $g(f(x))=x$.

Suppose next that $f$ has a left inverse $g$. Suppose further that $x$ and $x'$ are points in $S$ with $f(x)=f(x')$. Then $g(f(x))=g(f(x'))$. Since $g$ is a left inverse, this yields $x=x'$. Hence $f$ is one-to-one.
```


#### Real-Valued Functions

If $S$ is any set and $f \colon S \to \RR$, we call $f$ a **real-valued function**. The set of all real-valued functions on $S$ is denoted $\RR^S$. When $S$ has $n$ elements, $\RR^S$ is the same set as $\RR^n$ expressed in different notation. The next lemma clarifies.

```{prf:lemma}
:label: l-rxrn

If $|S| =n$, then

$$
\RR^S \; \ni  \;
        h 
        = (h(x_1), \ldots, h(x_n))
        \quad \longleftrightarrow \quad
            \begin{pmatrix}
                h_1 \\
                \vdots \\
                h_n
            \end{pmatrix}
            \; \in \; 
        \RR^n
$$ (eq-isomph)
is a one-to-one correspondence between $\RR^n$ and the function space $\RR^S$.
```


The lemma just states that a function $h$ can be identified by the set of values that it takes on $S$, which is an $n$-tuple of real numbers. We use this identification routinely in what follows.

The **indicator function** of logical statement $P$ is denoted $\1\{P\}$ and takes value 1 (resp., 0) if $P$ is true (resp., false).

````{prf:example}

If $x, y \in \RR$, then

```{math}
:enumerated: false

\1\{x \leq y\} =
        \begin{cases}
            1 & \text{ if } x \leq y \\
            0 & \text{ otherwise} .
        \end{cases}
```
````


If $A \subset S$, where $S$ is any set, then $\1_A(x) := \1\{x \in A\}$ for all $x \in S$.

A nonempty set $S$ is called **countable** if it is finite or can be placed in one-to-one correspondence with the natural numbers $\NN$. In the second case we can enumerate $S$ by writing it as $\{x_1, x_2, \ldots \}$. Any nonempty set $S$ that fails to be countable is called **uncountable**. For example, $\ZZ$ and $\QQ$ are countable, whereas $\RR$ and every nontrivial interval in $\RR$ are uncountable.

In general, if $f$ and $g$ are real-valued functions defined on some common set $S$ and $\alpha$ is a scalar, then $f + g$, $\alpha f$, $fg$, etc., are functions on $S$ defined by

$$
(f + g)(x) = f(x) + g(x),
    \quad
    (\alpha f)(x) = \alpha f(x),
    \quad
    \text{etc.}
$$ (eq-arpo)

for each $x \in S$. Similarly, $f \vee g$ and $f \wedge g$ are functions on $S$ defined by

$$
(f \vee g)(x) = f(x) \vee g(x)
    \;\; \text{ and } \;\;
    (f \wedge g)(x) = f(x) \wedge g(x).
$$ (eq-fvg)

{numref}`f-infsup` illustrates.

```{figure} figures/tikz_infsup.svg
:name: f-infsup

Functions $f \vee g$ and $f \wedge g$ when defined on a subset of $\RR$
```

If $f \colon A \to B$ and $g \colon B \to C$, then **$g \circ f$** is called the **composition** of $f$ and $g$. It is the function mapping $a \in A$ to $g(f(a)) \in C$.

(sss-fpfd)=
#### Fixed Points
Let $S$ be any set. A **self-map** on $S$ is a function $G$ from $S$ to itself. When working with self-maps in arbitrary sets it is common to write the image of $x$ under $G$ as $Gx$ rather than $G(x)$. We often follow this convention.

Given a self-map $G$ on $S$, a point $x \in S$ is called a **fixed point** of $G$ if $Gx = x$.

```{prf:example}

Every point of arbitrary $S$ is fixed under the identity map $I \colon x \mapsto x$.
```


```{prf:example}

If $S = \NN$ and $Gx = x+1$, then $G$ has no fixed point.
```


{numref}`f-three_fixed_points` shows another example, for a self-map $G$ on $S = [0, 2]$. Fixed points are numbers $x \in [0, 2]$ where $G$ meets the 45 degree line. In this case there are three.

One of the most common techniques for solving systems of nonlinear equations in applied mathematics—and quantitative economics—is to convert them into fixed point problems and then apply fixed point theory. We will see many applications of this technique.

```{figure} figures/three_fixed_points.svg
:name: f-three_fixed_points

Graph and fixed points of $G \colon x \mapsto 2.125/(1 + x^{-4})$
```

```{exercise}
:label: ex-ufnflow

Let $S$ be any set and let $G$ be a self-map on $S$. Suppose there exists an $\bar x \in S$ and an $m \in \NN$ such that $G^k x = \bar x$ for all $x \in S$ and $k \geq m$. Prove that, under this condition, $\bar x$ is the unique fixed point of $G$ in $S$.
```


````{solution} ex-ufnflow

Let $G$ and $S$ be as stated in the exercise. Regarding uniqueness, suppose that $G$ has two distinct fixed points $x$ and $y$ in $S$. Since $G^m x = \bar x$ and $G^m y = \bar x$, we have $G^m x = G^m y$. But $x$ and $y$ are distinct fixed points, so $x = G^m x$ must be distinct from $y = G^m y$. Contradiction.

Regarding the claim that $\bar x$ is a fixed point, we recall that $G^k x = \bar x$ for $k \geq m$. Hence $G^m \bar x = \bar x$ and $G^{m+1} \bar x = \bar x$. But then

```{math}
:enumerated: false

G \bar x = G G^m \bar x = G^{m+1} \bar x = \bar x,
```

so $\bar x$ is a fixed point of $G$.
````


(sss-vectors)=
#### Vectors
An $n$-vector $x$ is a tuple of $n$ numbers $x = (x_1, \ldots, x_n)$ where $x_i \in \RR$ for each $i \in \natset{n}$. In general, $x$ is neither a row vector nor a column vector—which coincides with the perspective of most scientific computing environments, where the basic vector structure is a flat array. When using matrix algebra, vectors are treated as column vectors unless otherwise stated.

The two most fundamental vector operations are vector addition and scalar multiplication. These operations act pointwise, so that, when $\alpha \in \RR$ and $x, y \in \RR^n$,

```{math}
:enumerated: false

x + y 
    = 
    \left(
    \begin{array}{c}
        x_1 \\
        x_2 \\
        \vdots \\
        x_n
    \end{array}
    \right)
    +
    \left(
    \begin{array}{c}
         y_1 \\
         y_2 \\
        \vdots \\
         y_n
    \end{array}
    \right)
    :=
    \left(
    \begin{array}{c}
        x_1 + y_1 \\
        x_2 + y_2 \\
        \vdots \\
        x_n + y_n
    \end{array}
    \right)
    \quad \text{and} \quad
    \alpha x 
    := 
    \left(
    \begin{array}{c}
        \alpha x_1 \\
        \alpha x_2 \\
        \vdots \\
        \alpha x_n
    \end{array}
    \right).
```

We let $\RR^n$ be the set of all $n$-vectors and $\matset{n}{k}$ be all $n \times k$ matrices. If $A$ is a matrix then $A^{\top}$ is its transpose.

- The **inner product** of $x, y \in \RR^n$ is defined as $\inner{ x, y} := \sum_{i=1}^n x_i y_i$.

- The **Euclidean norm** of $x \in \RR^n$ is $\|x \| := \sqrt{\inner{x, x}}$.

The norm and inner product satisfy the **triangle inequality** and **Cauchy–Schwarz inequality**, which state that, respectively,

```{math}
:enumerated: false

\| x + y \| \leq \|x\| + \|y\|
    \quad \text{and} \quad
    |\inner{x, y}| \leq \|x \| \|y\|
    \quad \text{for all } 
    x,y \in \RR^n.
```

(sss-complex)=
#### Complex Numbers
We recall some elementary facts about $\CC$, the set of complex numbers.

Each element of $\CC$ can be understood as a point $(a, b) \in \RR^2$. In fact $\CC$ is just $\RR^2$ endowed with a special form of multiplication. The point $(a, b)$ is more often written as $a+ib$. We elaborate below.

The first and second projections of $(a, b)$ are written as $\real (a, b) = a$ and $\imag (a, b) = b$ and called the **real** and **nonreal** (or **imaginary**) part respectively. The symbol $i$ represents the point $(0, 1) \in \CC$. As is traditional, in the context of complex numbers, the complex number $(a, 0) \in \CC$ is often written more simply as $a$. With addition and scalar multiplication defined pointwise, this means that, as expected,

```{math}
:enumerated: false

(a, b) 
    = (a, 0) + (0, b) 
    = (a, 0) + (0, 1) b
    = a + ib.
```

Let $z = (a, b)$. The **modulus** of $z$ is written $|z|$ and defined as the Euclidean norm $(a^2+b^2)^{1/2}$ of the tuple $(a,b)$. The two-dimensional Euclidean space is then endowed with a new operation called **multiplication**, which is defined by

$$
(a, b) (c, d) = (ac - bd, ad+bc).
$$ (eq-complexmult)

Note that, under this rule and our conventions, $i^2  = (0, 1)(0, 1) = (-1, 0) = -1$.

As in the real case, the exponential $\me^z$ is defined for $z \in \CC$ by $\sum_{k \geq 0} z^k/(k!)$. It can be shown that, under this extension, the exponential function continues to enjoy the additive property $\me^{z_1 + z_2} = \me^{z_1} \me^{z_2}$. As a result, $\me^{a + ib} = \me^a \me^{ib}$.

Rather than providing its coordinates, another way to represent a vector $z = (a, b) \in \RR^2$, and hence in $\CC$, is by providing a pair $(r, \phi)$ where $r > 0$ is understood as the length of the vector and $\phi \in [0, 2\pi)$ is the angle. This translates to Euclidean coordinates via

```{math}
:enumerated: false

a + ib = (a, b) 
    = (r \cos \phi, r \sin \phi) = r(\cos \phi + i \sin \phi).
```

```{figure} figures/complex_number.svg
:name: f-complex_number

The complex number $(a, b) = r \me^{i \phi}$
```

The representation $(r, \phi)$ is called the **polar form** of the complex number. By **Euler's formula** $\cos(\phi) + i \sin(\phi) = \me^{i \phi}$, we can also write

```{math}
:enumerated: false

r(\cos \phi + i \sin \phi) = r \me^{i \phi}.
```

{numref}`f-complex_number` translates $\CC \ni (1, \sqrt{3}) = 1 + i \sqrt{3}$ into polar coordinates $2 \me^{i (\pi/3)}$.

The advantage of these representations is clear when we multiply, since the rule

$$
r \me^{i \phi}
    \, s \me^{i \psi} = r  s \, \me^{i (\phi + \psi) }
$$ (eq-compexpr)

is easier to remember and apply than {eq}`eq-complexmult`. Calculating the modulus is also easy, since, by the trigonometric formula $\cos^2 \phi + \sin^2 \phi = 1$,

$$
| r \me^{i \phi}| 
    = | r(\cos(\phi) + i \sin(\phi)) | 
    = r \left(\cos^2 \phi + \sin^2 \phi \right)^{1/2} 
    = r.
$$ (eq-modpol)

```{exercise}
:label: ex-appendix-auto-1

Show that, for any $u, v \in \CC$ we have $|u v| = |u| |v|$.
```


```{solution} ex-appendix-auto-1

In polar form, we have $u = r \me^{i \phi}$ and $v = s \me^{i \psi}$, so $uv = r  s \, \me^{i (\phi + \psi) }$. Hence $|uv| = rs$ (see {eq}`eq-modpol`), which is equal to $|u| |v|$.
```


### Order

Order structure is of great importance in economics—typically more so than other fields such as physics or chemistry. Here we review the basics.

(ss-posets)=
#### Partial Orders
It was mentioned in the preface that order-theoretic methods form a core part of the text. In this section we introduce some key concepts.

Let $P$ be a nonempty set. A **partial order** on $P$ is a relation $\preceq$ on $P \times P$ satisfying, for any $p, q, r$ in $P$,

::::{grid} 1 1 2 2
:::{grid-item}
$p \preceq p$,

$p \preceq q$ and $q \preceq p$ implies $p = q$ and

$p \preceq q$ and $q \preceq r$ implies $p \preceq r$
:::
:::{grid-item}
(reflexivity)

(antisymmetry)

(transitivity)
:::
::::

When paired with a partial order $\preceq$, the set $P$ (or the pair $(P, \preceq)$) is called a **partially ordered set**.

```{prf:example}

The usual order $\leq$ on $\RR$ is a partial order on $\RR$. Unlike other partial orders we consider, it has the additional property that either $x \leq y$ or $y \leq x$ for every $x, y$ in $\RR$. For this reason, $\leq$ is also called a **total order** on $\RR$.
```


```{exercise}
:label: ex-appendix-auto-2

Let $P$ be any set and consider the relation induced by equality, so that $p \preceq q$ if and only if $p = q$. Show that this relation is a partial order on $P$.
```


```{exercise}
:label: ex-appendix-auto-3

Let $M$ be any set. Show that $\subset$ is a partial order on $\wp(M)$, the set of all subsets of $M$.
```


````{prf:example} Pointwise order over functions
:label: eg-ppor

Let $S$ be any set. For $f, g$ in $\RR^S$, we write

```{math}
:enumerated: false

f \leq g 
        \text{ if }
        f(x) \leq g(x) \text{ for all } x \in S.
```

This relation $\leq$ on $\RR^S$ is a partial order called the **pointwise order** on $\RR^S$.
````


A subset $B$ of a partially ordered set $(P, \preceq)$ is called

- **increasing** if $x \in B$ and $x \preceq y$ implies $y \in B$.

- **decreasing** if $x \in B$ and $y \preceq x$ implies $y \in B$.

```{exercise}
:label: ex-appendix-auto-4

Describe the set of increasing sets in $(\RR, \leq)$.
```


```{prf:example} Pointwise order over vectors

 For vectors $x = (x_1, \ldots, x_d)$ and $y = (y_1, \ldots, y_d)$, we write

- $x \leq y$ if $x_i \leq y_i$ for all $i \in \natset{d}$ and

- $x \ll y$ if $x_i < y_i$ for all $i \in \natset{d}$.

The statements $x \geq y$ and $x \gg y$ are defined analogously.[^1] The relation $\leq$ is a partial order on $\RR^n$, also called the **pointwise order**. (In fact, the present example is a special case of {prf:ref}`eg-ppor` under the identification in {prf:ref}`l-rxrn` .) On the other hand, $\ll$ is not a partial order on $\RR^n$. (Which axiom fails?)
```


```{exercise}
:label: ex-clic

Recall from {prf:ref}`eg-clic` that limits in $\RR$ preserve weak inequalities. Prove that the same is true in $\RR^d$. In particular, show that, for vectors $a, b \in \RR^d$ and sequence $(x_n)$ in $\RR^d$, we have $a \leq x_n \leq b$ for all $n \in \NN$ and $x_n \to x$ implies $a \leq x \leq b$.
```


(sss-poov)=
#### Pointwise Operations on Vectors
In this text, operations on real numbers such as $|\cdot|$ and $\vee$ are applied to vectors pointwise. For example, for vectors $a = (a_i)$ and $b = (b_i)$ in $\RR^d$, we set

```{math}
:enumerated: false

|a| = (|a_i|),
    \quad
    a \wedge b = (a_i \wedge b_i)
    \quad \text{and} \quad
    a \vee b = (a_i \vee b_i)
```

(The last two are special cases of {eq}`eq-fvg`.)

A small amount of thought will convince you that, with this convention plus the pointwise order over vectors, the order-theoretic inequalities and identities listed in {ref}`sss-sets` also hold for vectors in $\RR^d$. (For example, $|a + b| \leq |a| + |b|$ for any $a, b, c \in \RR^d$.)

```{exercise}
:label: ex-bmk

Prove: If $B$ is $m \times k$ and $B \geq 0$, then $|B x| \leq B |x|$ for all $k \times 1$ column vectors $x$.
```


```{solution} ex-bmk

Fix $B \in \matset{m}{k}$ with $b_{ij} \geq 0$ for all $i, j$. Pick any $i \in \natset{m}$ and $x \in \RR^k$. By the triangle inequality, we have $|\sum_j b_{ij} x_j| \leq \sum_j b_{ij} |x_j|$. Stacking these inequalities yields $|B x| \leq B |x|$, as was to be shown.
```


(sss-mono)=
#### Monotonicity
Given two partially ordered sets $(P, \preceq)$ and $(Q, \trianglelefteq)$, a function $G$ from $P$ to $Q$ is called **order-preserving** if

$$
p, q \in P \text{ and } p \preceq q
    \quad \implies \quad
    Gp \trianglelefteq Gq.
$$ (eq-orpres)

````{prf:example}

Let $\cC$ be all continuous functions from $S = [a, b]$ to $\RR$ and let $\leq$ be the pointwise partial order on $\cC$. Define

```{math}
:enumerated: false

I \colon \cC \ni f \to \int_a^b f(x) dx \in \RR.
```

Since $f \leq g$ implies $\int_a^b f(x) dx \leq \int_a^b g(x) dx$, the integral map $I$ is order-preserving on $\cC$.
````


```{exercise}
:label: ex-appendix-auto-5

Let $X$ be a random variable mapping $\Omega$ to finite $S$. Define $\ell \colon \RR^S \to \RR$ by $\ell h = \EE h(X)$. Show that $\ell$ is order-preserving when $\RR^S$ has the pointwise order.
```


If $P = Q = \RR$ and $\preceq$ and $\trianglelefteq$ are both equal to $\leq$, the standard order on $\RR$, then the order-preserving property reduces to the usual notion of an **increasing function** (i.e., nondecreasing function), and we will use the terms "increasing" and "order-preserving" interchangeably in this setting.[^2]

In addition, if $S = g$ maps $A \subset \RR$ into $\RR$, then we will call $g$

- **strictly increasing** if $x < y$ implies $g(x) < g(y)$, and

- **strictly decreasing** if $x < y$ implies $g(x) > g(y)$.

(ss-convergence)=
### Convergence
Let's now recall the basics of convergence and continuity.

Given any set $S$, an $S$-valued **sequence** $(x_n) := (x_n)_{n \in \NN}$ is a function $n \mapsto x_n$ from $\NN$ to $S$. If $S=\RR$, we call $(x_n)$ a **real-valued sequence**. A **subsequence** of $(x_n)_{n \in \NN}$ is a sequence of the form $(x_{\sigma(n)})_{n \in \NN}$ where $\sigma$ is a strictly increasing function from $\NN$ to itself. You can think of forming a subsequence from a sequence by deleting some of its elements—while still retaining infinitely many.

In computer science and statistics, it is common to classify sequences according to their asymptotic behavior. Often this is done via **big O notation**, where, for a real-valued sequence $(x_n)$, we write **$(x_n) = O(g_n)$** if there exists a nonnegative sequence $(g_n)$ and a constant $M < \infty$ such that $|x_n| \leq M g_n$ for all $n \in \NN$.

```{exercise}
:label: ex-appendix-auto-6

Let $x_n = -5n + n^2$ for all $n \in \NN$. Show that $(x_n) = O(n^2)$ holds but $(x_n) = O(n)$ fails.
```


```{solution} ex-appendix-auto-6

Let $x_n= -5n + n^2$. Then $|x_n| \leq 5n + n^2 \leq 6 n^2$. Hence $(x_n) = O(n^2)$. Regarding the second claim, suppose to the contrary that $(x_n) = O(n)$. Then we can take an $M$ such that $|x_n| \leq M n$ for all $n \in \NN$. But then $x_n = -5n + n^2 \leq M n$ for all $n$. Dividing by $n$ yields $n \leq 5 + M$ for all $n$. Contradiction.
```


(sss-ocon0)=
#### Metric Properties of the Real Line
The following definition is fundamental to what follows: a real-valued sequence $(x_n)$ **converges** to $x \in \RR$ and write $x_n \to x$ if

```{math}
:enumerated: false

\text{ 
        for each } \epsilon > 0 \text{, there is an } N \in \NN \text{ such that
        } |x_n - x| < \epsilon \text{ whenever } n \geq N \text{.  
    }
```

```{prf:example}

If $x_n = 1-1/n$, then $x_n \to 1$. Indeed, for any $\epsilon > 0$, the statement $|x_n - 1| < \epsilon$ is equivalent to $n > 1/\epsilon$. This clearly holds whenever $n$ is sufficiently large.
```


```{exercise}
:label: ex-appendix-auto-7

Prove: If $a, b \in \RR$, $x_n \to a$ and $x_n \to b$, then $a=b$.
```


Let's state some elementary limit laws that are used without comment throughout. (You can review the proofs in sources such as {cite}`bartle2011introduction`).

A sequence $(x_n)$ is called **bounded** if there is an $M \in \RR$ such that $|x_n| \leq M$ for all $n \in \NN$. It is called

- **monotone increasing** if $x_n \leq x_{n+1}$ for all $n \in \NN$, and

- **monotone decreasing** if $x_n \geq x_{n+1}$ for all $n$.

The sequence is called **monotone** if it is either monotone increasing or decreasing. The next theorem, concerning monotone sequences, is a deep result about the structure of $\RR$.

```{prf:theorem}
:label: t-bmseq

A real-valued monotone sequence converges in $\RR$ if and only if it is bounded.
```


The intuitive meaning of the "if" part of {prf:ref}`t-bmseq` is that monotone bounded sequences always converge to some point in $\RR$ because $\RR$ contains no gaps. This statement is closely related to the "completeness" property of the real line, which is discussed in {cite}`bartle2011introduction` and many other texts on real analysis.

Next let's consider **series**. Given a sequence $(x_n)$ in $\RR$, we set

```{math}
:enumerated: false

\sum_{n \geq 1} x_n := \lim_{N \to \infty} \sum_{n=1}^N x_n
    \text{ whenever the limit exists in } \RR.
```

More generally, given arbitrary countable $S$ and $g \in \RR^S$, we write $\sum_{x \in S} g(x) = M$ if there exists an enumeration $(x_n)_{n \in \NN}$ of $S$ such that $\sum_{n \geq 1} |g(x_n)|$ is finite and, in addition, $\sum_{n \geq 1} g(x_n) = M$.[^3]

```{exercise}
:label: ex-stricttr

Show that, if $S$ is countable, $g \in \RR^S$, and there exist $x', x'' \in S$ such that $g(x') > 0$ and $g(x'') < 0$, then $\left| \sum_{x \in S} g(x) \right| < \sum_{x \in S} |g(x)|$.[^4]
```


(sss-ocon)=
#### Metric Properties of Euclidean Space
Now we review the metric properties of $\RR^d$, for some $d \in \NN$, when distance between vectors $x, y \in \RR^d$ is understood in terms of Euclidean norm deviation $\| x - y \|$. The notion of convergence for real-valued sequences extends naturally to this setting: sequence $(x_n)$ in $\RR^d$ is said to **converge** to $x \in \RR^d$ if

```{math}
:enumerated: false

\text{ 
        for each } \epsilon > 0 \text{, there is an } N \in \NN \text{ such that
        } \|x_n - x\| < \epsilon \text{ whenever } n \geq N \text{.  
    }
```

In this case we write $x_n \to x$. {numref}`f-euclidean_convergence_1` shows a sequence converging to the origin in $\RR^3$, with colder colors being later in the sequence.

```{figure} figures/euclidean_convergence_1.svg
:name: f-euclidean_convergence_1

Convergence of a sequence to the origin in $\RR^3$
```

```{exercise}
:label: ex-appendix-auto-8

Prove that limits in $\RR^d$ are unique. In other words, show that, if $(x_n)$ is a sequence converging to $x \in \RR^d$ and $y \in \RR^d$, then $x=y$.
```


Given any point $u \in \RR^d$ and $\epsilon > 0$, the **$\epsilon$-ball** around $u$ is the set

```{math}
:enumerated: false

B_\epsilon(u) := \setntn{v \in \RR^d}{\| u - v \| < \epsilon} .
```

With this terminology, we can say that $(x_n)$ converges to $x \in \RR^d$ if the sequence $(x_n)$ is eventually in any $\epsilon$-ball around $x$.

```{prf:proposition}
:label: p-rseqp

If $(x_n)$ and $(y_n)$ are sequences in $\RR^d$ with $x_n \to x$ and $y_n \to y$, then

(i) $x_n + y_n \to x + y$ and $x_n y_n \to x y$

(ii) $x_n \leq y_n$ for all $n \in \NN$ implies $x \leq y$

(iii) $\alpha x_n \to \alpha x$ for any $\alpha \in \RR$

(iv) $x_n \vee y_n \to x \vee y$ and $x_n \wedge y_n \to x \wedge y$.
```


A sequence $(x_n) \subset \RR^d$ is called **Cauchy** if, for all $\epsilon > 0$, there exists an $N \in \NN$ with $|x_n - x_m| < \epsilon$ whenever $n, m \geq N$.

```{exercise}
:label: ex-appendix-auto-9

Let $d=1$ and suppose $x_n = 1/n$. Prove that $(x_n)$ is Cauchy.
```


```{exercise}
:label: ex-appendix-auto-10

Prove that every convergent sequence in $\RR^d$ is Cauchy.
```


It is a fundamental result of analysis, stemming from axiomatic properties of the reals, that the converse is also true:

```{prf:theorem}
:label: t-compreal

A sequence in $\RR^d$ converges to a point in $\RR^d$ if and only if it is Cauchy.
```


#### Topology

A point $u \in A \subset \RR^d$ is called **interior** to $A$ if there exists an $\epsilon > 0$ such that $B_\epsilon(u) \subset A$.

```{exercise}
:label: ex-appendix-auto-11

Let $d = 1$ so that $\| x - y \| = |x - y|$. Show that $0.5$ is interior to $A := [0, 1)$ but $0$ is not. Show that $\QQ$, the set of rational numbers in $\RR$, contains no interior points.
```


A subset $G$ of $\RR^d$ is called **open** in $\RR^d$ if every $u \in G$ is interior to $G$. A subset $F$ of $\RR^d$ is called **closed** if, given any sequence $(x_n)$ satisfying $x_n \in F$ for all $n \in \NN$ and $x_n \to x$ for some $x \in \RR^d$, the point $x$ is in $F$. In other words, $F$ contains the limit points of all convergent sequences that take values in $F$.

```{prf:example}
:label: eg-clic

Limits in $\RR$ preserve orders, so $a \leq x_n \leq b$ for all $n \in \NN$ and $x_n \to x$ implies $a \leq x \leq b$. Thus, any closed interval $[a, b]$ in $\RR$ is closed in the standard (one dimensional Euclidean) metric.
```


```{exercise}
:label: ex-appendix-auto-12

Prove that $G \subset \RR^d$ is open if and only if $G^c$ is closed.
```


A subset $B$ of $\RR^d$ is called **bounded** if there exists a finite $M$ such that $\| b \| \leq M$ for all $b \in B$. A subset $K$ of $\RR^d$ is called **compact** in $\RR^d$ if every sequence in $K$ has a subsequence converging to some point in $K$. The Bolzano–Weierstrass theorem tells us that $K$ is compact if and only if $K$ is closed and bounded.

#### Continuity in Vector Space

If $A \subset \RR^d$, then $f \colon A \to \RR^k$ is called **continuous** at $x \in A$ if, for each sequence $(x_n) \subset A$ with $x_n \to x$, we have $f(x_n) \to f(x)$ in $\RR^k$. If $f$ is continuous at all $x \in A$ then we call $f$ **continuous on $A$**.

```{prf:example}

If $f(x)=x^2$ on $A = \RR$, then $f$ is continuous at all $x \in \RR$ because, by {prf:ref}`p-rseqp`, $x_n \to x$ implies $x_n^2 = x_n \cdot x_n \to x \cdot x = x^2$.
```


More generally, every polynomial function is continuous on $\RR$. The elementary functions $\sin$, $\cos$, $\exp$ and $\log$ are all continuous on their domains.

```{exercise}
:label: ex-appendix-auto-13

Prove: If $\alpha, \beta \in \RR$ and $f,g$ are continuous functions from $A \subset \RR^d$ to $\RR^k$, then so is $\alpha f+ \beta g$.
```


```{solution} ex-appendix-auto-13

If $x_n \to x$ in $\RR^d$ and $f$ and $g$ are continuous, then $f(x_n) \to f(x)$ and $g(x_n) \to g(x)$ in $\RR^k$. But then, by {prf:ref}`p-rseqp`, $\alpha f(x_n) + \beta g(x_n)$ converges to $\alpha f(x) + \beta g(x)$ in $\RR^k$, as was to be shown.
```


```{exercise}
:label: ex-appendix-auto-14

Fix $a \in \RR^d$. Prove that $f, g \colon \RR^d \to \RR^d$ defined by $f(x) = x \wedge a$ and $g(x) = x \vee a$ are both continuous functions on $\RR^d$.
```


````{solution} ex-appendix-auto-14

Here's the answer for $f$: Take $(x_n)$ converging to $x$ in $\RR^d$. Applying the inequalities in {ref}`sss-sets` pointwise to vectors, we have

```{math}
:enumerated: false

0 \leq |f(x_n) - f(x)|
        = |x_n \wedge a - x \wedge a| \leq |x_n - x|.
```

Taking the Euclidean norm over these vectors and using $|u| \leq |v|$ implies $\| u \| \leq \| v\|$ yields $\| f(x_n) - f(x)\| \leq \|x_n - x\| \to 0$. Similar arguments can be applied to $g$.
````


The next lemma is helpful in locating fixed points.

```{prf:lemma}
:label: l-clifp

Let $F$ be a self-map on $S \subset \RR^d$. If $F^m u \to u^*$ as $m \to \infty$ for some pair $u, u^* \in S$ and, in addition, $F$ is continuous at $u^*$, then $u^*$ is a fixed point of $F$.
```


```{prf:proof}
:nonumber:

Assume the hypotheses of {prf:ref}`l-clifp` and let $u_m := F^m u$ for all $m \in \NN$. By continuity and $u_m \to u^*$ we have $F u_m \to F u^*$. But the sequence $(F u_m)$ is just $(u_m)$ with the first element omitted, so, given that $u_m \to u^*$, we must have $F u_m \to u^*$. Since limits are unique, it follows that $u^* = F u^*$. ◻
```


(ss-fdvec)=
### Linear Algebra
Next we review fundamental concepts and definitions from linear algebra.

#### Subspaces and Independence

A subset $E$ of $\RR^n$ is called a **linear subspace** of $\RR^n$ if

```{math}
:enumerated: false

x, y \in E \text{ and } \alpha, \beta \in \RR
    \; \implies \; \alpha x + \beta y \in E.
```

In other words, $E$ is **closed** under the operations of addition and scalar multiplication; that is, (i) $\alpha \in \RR$ and $x \in E$ implies $\alpha x \in E$ and (ii) $x, y \in E$ implies $x+y \in E$.

```{exercise}
:label: ex-whichli

Fix $c \in \RR^n$ and $C \in \matset{n}{k}$. Show that

- $H := \setntn{x \in \RR^n}{\inner{c, x} = 0}$ and

- $\range C := \setntn{y \in \RR^n}{y = Cx \text{ for some } x \in \RR^k}$

are linear subspaces of $\RR^n$. Show that $S := \setntn{x \in \RR^n}{\inner{c, x} \geq 0}$ is not.
```


A **linear combination** of vectors $v_1,\ldots, v_k$ in $\RR^n$ is a vector of the form

```{math}
:enumerated: false

\alpha_1 v_1 + \cdots +  \alpha_k v_k \text{ where } (\alpha_1,\ldots, \alpha_k) \in \RR^k.
```

The set of all linear combinations of elements of $F \subset \RR^n$ is called the **span** of $F$ and written as $\Span F$.

```{prf:example}
:label: eg-colspace

The set $\range C$ in {prf:ref}`ex-whichli` is the span of the columns of the matrix $C$, viewed as a set of vectors in $\RR^n$. The set $\range C$ is also called the **column space** of $C$.
```


```{exercise}
:label: ex-appendix-auto-15

Let $F$ be a nonempty subset of $\RR^n$. Prove that

(i) $\Span F$ is a linear subspace of $\RR^n$ and

(ii) $\Span F$ is the intersection of all linear subspaces $S \subset \RR^n$ with $S \supset F$.
```


{numref}`f-span1` shows the linear subspace spanned by the three vectors

$$
u =
    \begin{pmatrix}
        3 \\
        4 \\
        1
    \end{pmatrix},
    \quad
    v =
    \begin{pmatrix}
        3 \\
        -4 \\
       0.2 
    \end{pmatrix},
    \quad
    \text{and }
    w =
    \begin{pmatrix}
        -3.5 \\
        3 \\
       -0.4 
    \end{pmatrix}
    .
$$ (eq-uvw)

The subspace $H$ in which these vectors lie is, in fact, the set of all $x \in \RR^3$ such that $\inner{x, c} = 0$, with $c=(-0.2, -0.1, 1)$. This plane is a two-dimensional object. While we make this terminology precise in {ref}`sss-bvd`, the key idea is that

- at least two vectors are required to span $H$ and

- any additional vectors will not increase the span.

```{figure} figures/span1.svg
:name: f-span1

The span of vectors $u, v, w$ in $\RR^3$
```

A finite set of vectors $F := \{v_1, \ldots, v_k\} \subset \RR^n$ is called **linearly independent** if, for real scalars $\alpha_1, \ldots, \alpha_k$,

```{math}
:enumerated: false

\alpha_1 v_1
    + \cdots +
    \alpha_k v_k
     = 0 
    \;  \implies  \;
    \alpha_1 = \cdots = \alpha_k = 0.
```

If $F$ is not linearly independent it is called **linearly dependent**.

```{exercise}
:label: ex-appendix-auto-16

Show that $F$ is linearly dependent if and only if there exists a vector in $F$ that can be written as a linear combination of other vectors in $F$.
```


```{exercise}
:label: ex-appendix-auto-17

Prove the following:

(i) Every subset of a linearly independent set in $\RR^n$ is linearly independent.[^5]

(ii) Every finite superset of a linearly dependent set in $\RR^n$ is linearly dependent.
```


```{solution} ex-appendix-auto-17

Regarding the first claim, let $E = \{u_1, \ldots, u_k\}$ be linearly independent. Suppose that $\{u_1, \ldots, u_m\}$ is linearly dependent for some $m < k$. Then we can find a nonzero vector $(\alpha_1, \ldots, \alpha_m)$ such that $\sum_{i=1}^m \alpha_i u_i = 0$. Setting $\alpha_i = 0$ for $i$ in $\{m+1, \ldots, k\}$ yields $\sum_{i=1}^k \alpha_i u_i = 0$, contradicting independence of $E$.

Regarding the second claim, suppose that $E \subset F$ and $E$ is linearly dependent. If $F$ is linearly independent, then we have a violation of the first claim. Hence $F$ is linearly dependent.
```


````{prf:example}

It is easy to check that the set $E := \{\delta_1, \ldots, \delta_n\} \subset \RR^n$ defined by

```{math}
:enumerated: false

\delta_1 := 
        \left(
        \begin{array}{c}
            1 \\
            0 \\
            \vdots \\
            0
        \end{array}
        \right),
        \quad 
        \delta_2 := 
        \left(
        \begin{array}{c}
            0 \\
            1 \\
            \vdots \\
            0
        \end{array}
        \right),
        \; 
        \cdots,
        \;
        \delta_n := 
        \left(
        \begin{array}{c}
            0 \\
            0 \\
            \vdots \\
            1
        \end{array}
        \right)
```

is linearly independent. Its elements are called the **canonical basis vectors** of $\RR^n$.
````


The span of the canonical basis vectors in $\RR^n$ is equal to all of $\RR^n$. In particular, each $x \in \RR^n$ can be expressed as

$$
x = \sum_{i=1}^n \alpha_i  \delta_i
    \quad \text{where }
    \alpha_i := \inner{x, \delta_i}.
$$ (eq-repcb)

On the other hand, we cannot omit an element of the basis $\{\delta_1, \ldots, \delta_n\}$ and still span $\RR^n$. The next theorem generalizes this idea.

```{prf:theorem}
:label: t-indepspan

If $E = \{u_1, \ldots, u_n\}$ is a set of $n$ vectors in $\RR^n$, then $\Span E = \RR^n$ if and only if $E$ is linearly independent.
```


See, for example, {cite}`jan`. {prf:ref}`t-indepspan` captures the notion that linear independence of a set of vectors means linear diversity, which allows the span to be large.

````{exercise}
:label: ex-nullspace

The **null space** or **kernel** of a matrix $A \in \matset{n}{k}$ is the set

```{math}
:enumerated: false

\kernel A := \setntn{x \in \RR^k}{Ax = 0}.
```

Show that (i) $\kernel A$ is a linear subspace of $\RR^k$ and (ii) $\kernel A = \{0\}$, where $0$ is the origin in $\RR^k$, if and only if the columns of $A$ form a linearly independent subset of $\RR^n$.
````


```{solution} ex-nullspace

Regarding (i), if $Ax = Ay = 0$, then $A(\alpha x + \beta y) = \alpha Ax + \beta Ay = 0$, so $\kernel A$ is a linear subspace. Regarding (ii), suppose that $\kernel A = \{0\}$. This means that the only $x \in \RR^k$ satisfying $Ax = 0$ is the zero vector, which is equivalent to linear independence of the columns of $A$.
```


(sss-bvd)=
#### Basis Vectors and Dimension
Let $V$ be a linear subspace of $\RR^n$. A set $B \subset V$ is called a **basis** for $V$ if $B$ is linearly independent and $\Span B = V$.

The key idea behind a basis is this: If $S = \{v_1, \ldots, v_k\}$ spans some linear subspace $V$, then each element of $V$ can be written as a linear combination of elements of $S$. If $S$ is, in addition, linearly independent (and hence a basis), then this representation is *unique*: for each $u \in V$, there is exactly one $(\alpha_1, \ldots, \alpha_k) \in \RR^k$ such that

```{math}
:enumerated: false

u = \alpha_1 v_1 + \cdots + \alpha_k v_k.
```

Indeed, if $u = \beta_1 v_1 + \cdots + \beta_k v_k$ is another representation, then, subtracting this equality from the last, we have

```{math}
:enumerated: false

(\alpha_1 - \beta_1) v_1 + \cdots + (\alpha_k - \beta_k) v_k = 0.
```

Because $S$ is assumed to be linearly independent, this yields $\alpha_i = \beta_i$ for all $i \in \natset{k}$.

Not surprisingly, given their name, the canonical basis vectors $E := \{\delta_1, \ldots, \delta_n\}$ serve as a basis for the whole space $\RR^n$. The representation {eq}`eq-repcb`, with coefficients $\alpha_i = \inner{x, \delta_i}$, is unique.

```{prf:theorem}
:label: t-eqbase

If $V$ is a nonzero linear subspace of $\RR^n$, then

(i) $V$ has at least one basis and

(ii) every basis of $V$ has the same number of elements.
```


{prf:ref}`t-eqbase` is a relatively deep result. See, for example, {cite}`jan`. The common number of bases in (ii) is called the **dimension** of $V$ and written as $\dim V$.

The "nonzero" qualification in {prf:ref}`t-eqbase` is included for the case $V = \{0\}$, which is a linear subspace that lacks any basis. It is sensible, and standard, to agree that the linear subspace $\{0\} \subset \RR^n$ has dimension zero.

Dimensionality is one measure of the "size" of a linear subspace. To illustrate, consider the system $Ax = b$ where $A \in \matset{n}{k}$, $x \in \RR^k$ and $b \in \RR^n$. Is there an $x$ that solves this system? This will be more likely if the column space of $A$ is large (see {prf:ref}`eg-colspace`). A large span will be obtained when the columns are linearly "diverse." In other words, our hope is that there exists a large subset of the columns of $A$ that is linearly independent, which in turn will be true when the span of $A$ is high-dimensional.

To quantify these ideas, we define the **rank** of $A$ as

```{math}
:enumerated: false

\rank A 
    := \dim(\range A)
    = \text{ dimension of the column space of } A.
```

```{prf:theorem}
:label: t-rank

For any matrix $A$, the following quantities are equal:

(i) $\rank A$

(ii) the maximal number of linearly independent columns of $A$, and

(iii) the maximal number of linearly independent rows of $A$.
```


See, for example, Chapter 2 of {cite}`aggarwal2020linear` or Chapter 5 of {cite}`jan`. In view of {prf:ref}`ex-mtbili`, for $A \in \matset{n}{k}$, we have $\rank A \leq k$. If $\rank A = k$, then $A$ is said to have **full column rank**.

In general, a linear subspace $V$ contains within itself many other linear subspaces. (For example, a plane passing through the origin contains many lines that pass through the origin, each one of which is a linear subspace.) However, there is no proper subspace of $V$ (i.e., no linear subspace contained in and distinct from $V$) with the same dimension as $V$. The next theorem records this fact.

```{prf:theorem}
:label: t-dimorder

If $U, V$ are linear subspaces of $\RR^n$, then $U \subset V$ implies $\dim U \leq \dim V$ with equality if and only if $U = V$.
```


```{exercise}
:label: ex-mtbili

Let $U$ be a linear subspace of $\RR^n$. Using the results given above, prove the following statements:

(i) The only $n$-dimensional linear subspace of $\RR^n$ is $\RR^n$.

(ii) If $A \subset U$ is finite and $|A| > \dim U$, then $A$ is linearly dependent.
```


```{solution} ex-mtbili

For part (i) just set $V = \RR^n$ in {prf:ref}`t-dimorder`. Regarding part (ii), let $A$ and $U$ be as stated, with $|A| =: m > \dim U$. Suppose to the contrary that $A$ is linearly independent. Then $A$ is a basis for $\Span A$ and, therefore, $\dim \Span A = m > \dim U$. At the same time, since $A \subset U$ and $U$ is a linear subspace, we have $\Span A \subset U$. Hence, by {prf:ref}`t-dimorder`, we have $m \leq \dim U$. Contradiction.
```


Part (ii) is related to {numref}`f-span1`. The plane in that figure is 2-dimensional, as we confirm in {ref}`ss-lmm` below. Any three vectors lying in the plane are linearly dependent.

(ss-lmm)=
#### Linear Maps Are Matrices
We will see in the following chapters that many nonlinear dynamic models and estimation problems can be expressed in terms of linear operations in high-dimensional spaces. We now state the definition of linear maps and their connection to matrices.

A function $u \mapsto A u$ from $\RR^k$ to $\RR^n$ is called **linear** if

```{math}
:enumerated: false

A(\alpha u + \beta v)
    = \alpha A u + \beta A v
    \quad
    \text{ for all } \alpha, \beta \in \RR \text{ and all } u, v \text{ in } \RR^k.
```

In this context, $A$ is sometimes called an **operator** rather than a function, but the meaning is the same.

```{exercise}
:label: ex-appendix-auto-18

Fix $s, t \in \RR$. Show that $A \colon \RR \to \RR$ defined by $A u = s u + t$ is a linear function on $\RR$ if and only if $t=0$.
```


```{exercise}
:label: ex-ilfil

Let $A \colon \RR^n \to \RR^n$ be a linear bijection. By {prf:ref}`l-ibj`, the operator $A$ has an inverse $A^{-1}$ mapping $\RR^n$ to itself. Prove that $A^{-1}$ is linear.
```


````{solution} ex-ilfil

Here's a proof by contradiction: Let $A$ be as stated. Suppose to the contrary that $A^{-1}$ fails to be linear. Then we can find $\alpha, \beta \in \RR$ and $x,y\in \RR^n$ such that $A^{-1} (\alpha x + \beta y)$ and $\alpha A^{-1}x + \beta A^{-1}y$ are distinct points. Since $A$ is a bijection, their images under $A$ are also distinct, so

```{math}
:enumerated: false

\alpha x + \beta y \neq A (\alpha A^{-1}x + \beta A^{-1}y).
```

Linearity of $A$ leads to a contradiction.
````


One of the most striking and useful properties of linear operators is that the one-to-one property and the onto property are equivalent when the domain and codomain agree:

```{prf:theorem}
:label: t-ooo

Let $A \colon \RR^n \to \RR^n$ be linear. The operator $A$ is a one-to-one function if and only if it is onto.
```


The proof can be found in {cite}`jan` or {cite}`stachurski2016primer`. {numref}`f-func_types_3` illustrates in the one-dimensional case. The linear map $f(x) = \alpha x$ is onto if and only if it is one-to-one, which occurs if and only if $\alpha \neq 0$.

```{figure} figures/func_types_3.svg
:name: f-func_types_3

Equivalence of the onto and one-to-one properties
```

A matrix $A \in \matset{n}{k}$ is a linear function from $\RR^k$ to $\RR^n$ when identified with the mapping that sends a (column) vector $u$ in $\RR^k$ into the vector $Au$ in $\RR^n$. In fact it is fundamental that, for *every* linear map $A \colon \RR^k \to \RR^n$, there exists a unique $M_A \in \matset{n}{k}$ such that

$$
A u = M_A u \quad \text{for all} \quad u \in \RR^k
$$ (eq-matrep)

(see, e.g., {cite}`kreyszig1978introductory`, §2.9). Thus, the set of linear maps and the set of matrices are in one-to-one correspondence in the finite dimensional setting.

(sss-linhy)=
#### Linear Hyperplanes
In {prf:ref}`ex-whichli`, you confirmed that, for a given nonzero $c \in \RR^n$, the subset of $\RR^n$ defined by $H := \setntn{x \in \RR^n}{\inner{c, x} = 0}$ is a linear subspace of $\RR^n$. Any set $H$ of this form is called a **linear hyperplane** in $\RR^n$. The vector $c$ is called the **normal vector** of the hyperplane.

````{prf:theorem} Rank-Nullity Theorem
:label: t-rnt

For each $A \in \matset{n}{k}$, we have

```{math}
:enumerated: false

\rank A + \dim (\kernel A) = k.
```
````


```{prf:example}

If $A$ has linearly independent columns, then $\rank A =k$ and $A$ is said to have full column rank. Recall from {prf:ref}`ex-nullspace` that this is precisely the setting where $\kernel A = \{0\}$. Hence $\dim (\kernel A) = 0$, and {prf:ref}`t-rnt` holds.
```


In the discussion after {numref}`f-span1`, we claimed that the linear hyperplane has shown there is a two-dimensional subset of $\RR^3$. The next example generalizes this idea.

````{prf:example}

A linear hyperplane $H = \setntn{x \in \RR^n}{\inner{x, c} = 0}$ with $c \neq 0$ has dimension $n-1$. To see this, just set $A$ in {prf:ref}`t-rnt` to $c$, treated as a $1 \times n$ row vector. Then $H = \kernel A$, and

```{math}
:enumerated: false

\dim H = \dim \kernel A = n - \rank A = n - 1.
```

(Here $\rank A = 1$ follows from {prf:ref}`t-rank`.)
````


(sss-sls)=
#### Nonsingular Linear Systems
A crucial task in applied modeling is solving linear systems such as $A x = b$, where $A$ is a matrix and $x$ and $b$ are conformable column vectors. The system can be underdetermined, overdetermined or exactly determined (i.e., same number of equations as unknowns). In this section we consider the last case, where the theory is straightforward.

Let $A$ and $B$ be in $\matset{n}{n}$ and suppose that $A B = B A = I$. Then $B$ is called the **inverse** of $A$, written as $A^{-1}$, while $A$ is said to be **invertible** or **nonsingular**.

The next theorem states that, for square matrices, the property of having either a left or a right inverse is equivalent to nonsingularity.

```{prf:theorem}
:label: t-lrilc

Given $A$ in $\matset{n}{n}$, the following statements are equivalent:

(i) There exists an $L \in \matset{n}{n}$ such that $L A = I$.

(ii) There exists an $R \in \matset{n}{n}$ such that $A R = I$.

If one and hence both of these statements hold, then $A$ is nonsingular and $L = R = A^{-1}$.
```


```{prf:proof}
:nonumber:

Fix $A$ in $\matset{n}{n}$ and suppose first that (i) holds. This implies that $A$ has a left inverse. In view of {prf:ref}`ex-lioneone`, it must be that $x \mapsto Ax$ is one-to-one on $\RR^n$. By {prf:ref}`t-ooo`, this means that the same function is onto. Hence $x \mapsto Ax$ is a bijection, and therefore invertible ({prf:ref}`l-ibj`). By {prf:ref}`ex-ilfil`, the inverse function is linear and hence can be represented by a matrix. We denote it $A^{-1}$. For the left inverse $L$ we have $L=A^{-1}$, since $L = L (A A^{-1}) = (LA) A^{-1} = A^{-1}$.

Now suppose there exists an $R \in \matset{n}{n}$ such that $A R = I$. Then, $A$ is the left inverse of $R$ and, by the previous argument, $R$ is invertible with $A = R^{-1}$. Pre-multiplying both sides by $R$ gives $RA=I$, so $R$ is also a left inverse of $A$. As we now know, this means that $A$ is nonsingular and $R=A^{-1}$.

In summary, if either (i) or (ii) holds, then $A$ is nonsingular, with left and right inverses both equal to $A^{-1}$. ◻
```


Consider the linear system $A x = b$, where $A \in \matset{n}{n}$ and $b \in \RR^n$. We seek a solution $x \in \RR^n$. The next theorem provides conditions under which such an $x$ is always uniquely identified.

```{prf:theorem}
:label: t-nncase

The following statements are equivalent:

(i) For each $b \in \RR^n$, the equation $A x = b$ has a unique solution.

(ii) The columns of $A$ are linearly independent.

(iii) The columns of $A$ form a basis of $\RR^n$.

(iv) $\kernel A = \{0\}$.

(v) $\rank A = n$.

(vi) $\det A$ is nonzero.

(vii) $A$ is nonsingular.
```


The symbol $\det A$ represents the **determinant** of $A$. For the definition, see, for example, {cite}`jan` or {cite}`cohen2021linear`. We note only that, for $n \times n$ matrices $A$ and $B$,

- $\det(A B) = \det(A) \det(B)$,

- $\det(\alpha A) = \alpha^n \det A$ for all $\alpha \in \RR$, and

- $\det(A^{-1}) = (\det A)^{-1}$ whenever $A$ is nonsingular.

Most of the equivalences in {prf:ref}`t-nncase` can be established from the results presented above. The key idea is that, under these equivalent conditions, the columns of $A$ form a basis of $\RR^n$, and hence any $b \in \RR^n$ can be expressed uniquely as a linear combination of elements of these columns. In other words, there exists a unique $x \in \RR^n$ with $Ax=b$. The remaining points are just equivalent ways of saying that the columns of $A$ form a basis of $\RR^n$.

```{exercise}
:label: ex-appendix-auto-19

Let $A$ and $B$ be conformable in the sense that $AB$ is well defined. Show that $\rank(AB) \leq \rank A$, with equality if and only if $B$ is nonsingular. (Hint: Use {prf:ref}`t-dimorder`.)
```


(sss-ortho)=
#### Orthogonality
We recall that vectors $u,v$ in $\RR^n$ are called **orthogonal** and we write **$u \perp v$** if $\inner{u,  v} = 0$. For a linear subspace $L$ of $\RR^n$, we call $u \in \RR^n$ **orthogonal to $L$** and write **$u \perp L$** whenever $u \perp v$ for all $v \in L$.

```{exercise}
:label: ex-appendix-auto-20

The **orthogonal complement** of linear subspace $L$ is defined as $L^{\perp} := \setntn{v \in \RR^n}{v \perp L}$. Show that $L^\perp$ is a linear subspace of $\RR^n$.
```


````{solution} ex-appendix-auto-20

Fix $u, v \in L^{\perp}$ and $\alpha, \beta \in \RR$. If $z \in L$, then

```{math}
:enumerated: false

\inner{\alpha u + \beta v, z }
        = \alpha \inner{ u, z} + \beta \inner{v, z}
         = \alpha \times 0  + \beta \times 0 = 0
```

Hence $\alpha u + \beta v \in L^{\perp}$, as was to be shown.
````


```{exercise}
:label: ex-appendix-auto-21

Prove: for any linear subspace $L \subset \RR^n$, we have $L \cap L^{\perp} = \{0\}$.
```


A set of vectors $O \subset \RR^n$ is called an **orthogonal set** if any two distinct elements of $O$ are orthogonal. For any orthogonal set $O$, the **Pythagorean law**

```{math}
:enumerated: false

\left\| \sum_{u \in O} u \right\|^2 
    = \sum_{u \in O} \| u \|^2
```

always holds.

````{exercise}
:label: ex-appendix-auto-22

Prove: Orthogonality implies linear independence in the sense that

```{math}
:enumerated: false

O \subset \RR^n 
        \text{ is orthogonal and } 0 \notin O \text{ }
        \; \implies \;
        O \text{ is linearly independent}.
```
````


An orthogonal set $O \subset \RR^n$ is called an **orthonormal set** if $\| u \| = 1$ for all $u \in O$. If $L$ is a linear subspace of $\RR^n$, $O$ is orthonormal in $L$ and $\Span O = L$, then $O$ is called an **orthonormal basis** of $L$. For example, the canonical basis $\{e_1, \ldots, e_n\}$ forms an orthonormal basis of $\RR^n$.

```{exercise}
:label: ex-appendix-auto-23

Explain why an orthonormal basis $O$ of a subspace $L$ is, in fact, a basis of $L$, in the sense of the definition in {ref}`sss-bvd`.
```


```{solution} ex-appendix-auto-23

If $O$ is an orthonormal basis of $L$, then, by definition, $O$ spans $L$. In addition, the elements of $O$ are independent because they are orthogonal and nonzero.
```


A matrix $M$ is called an **orthonormal matrix** if $M \in \matset{n}{n}$ for some $n \in \NN$ and, in addition, the columns of $M$ form an orthonormal set in $\RR^n$. These kinds of matrices will be important to us when we analyze singular value decomposition. Notice that,

- by definition, every orthonormal matrix is square, and

- the $n$ columns of an orthonormal matrix $M$ in $\RR^n$ form a basis of $\RR^n$, since they are nonzero and orthogonal.

The second point tells us that $M$ is nonsingular. The next lemma summarizes important properties of orthonormal matrices.

```{prf:lemma}
:label: l-porthms

Fix $M \in \matset{n}{n}$ and let $I$ be the $n \times n$ identity. The following statements are equivalent:

(i) $M$ is an orthonormal matrix.

(ii) $M^\top M = I$.

(iii) $M M^\top = I$.

(iv) $M^\top = M^{-1}$.
```


The equivalence of (ii) and (iii) is quite striking. It tells us that a square matrix with orthonormal columns automatically has orthonormal rows.

```{prf:proof}
:nonumber:

Clearly (i) and (ii) are equivalent, since they are two ways of writing the same thing. Equivalence of (ii)–(iv) follows from {prf:ref}`t-lrilc`. ◻
```


### Convexity and Concavity

Convexity and concavity are structures of enormous significance in economics and finance, in terms of both computation and theory. In this section we note the key definitions and provide exercises that help build familiarity.

(sss-cc)=
#### Convexity and Polyhedra
Convexity plays a central role in optimization and fixed point theory. As usual, a subset $C$ of $\RR^n$ is called **convex** if

```{math}
:enumerated: false

u, v \in C \text{ and } \lambda \in [0, 1] 
    \; \implies \;
    \lambda u + (1-\lambda) v \in C.
```

```{exercise}
:label: ex-appendix-auto-24

Show that

(i) the unit simplex in $\RR^n$ is a convex subset of $\RR^n$.

(ii) For all $a \in \RR^n$ and $\epsilon > 0$, the sphere $B = \setntn{x \in \RR^n}{\|x - a\| < \epsilon}$ is convex.

(iii) The intersection of an arbitrary number of convex sets in $\RR^n$ is again convex.
```


````{solution} ex-appendix-auto-24

For part (i), let $S=\{ x \in \RR^n_+: \1^{\top} x \leq 1 \}$ be the unit simplex, where $\1$ is a column vector of ones. Fix $u, v \in S$ and $\lambda \in [0, 1]$. We have

```{math}
:enumerated: false

\lambda u + (1 - \lambda) v \geq 0
```

and

```{math}
:enumerated: false

\1^{\top} (\lambda u + (1 - \lambda) v)
        = \lambda \1^{\top} u + (1 - \lambda) \1^{\top} v \\
        \leq \lambda + (1 - \lambda) = 1
```

Hence $S$ is a convex set.

For part (ii), fix $u, v \in B$, $\lambda \in [0, 1]$ and $a \in \RR^n, \epsilon>0$. We have

```{math}
:enumerated: false

\| \lambda u + (1 - \lambda) v - a \| = \| \lambda (u - a) + (1 - \lambda) (v - a) \| \\
        \leq \lambda \| u - a \| + (1 - \lambda) \| v - a \| \\
        \leq \lambda \epsilon + (1 - \lambda) \epsilon = \epsilon
```

Hence $B$ is convex.

Regarding part (iii), let $(S_i)$ be a convex set for $i=1, 2, \cdots, n$. Fix $u, v \in \cap^n_{i=1} S_i$ and $\lambda \in [0, 1]$. We have

```{math}
:enumerated: false

z = \lambda u + (1 - \lambda) v \in S_i \quad \text{ for all } i
```

This implies $z \in \cap^n_{i=1} S_i$ and hence $\cap^n_{i=1} S_i$ is convex.
````


In economic optimization problems, the convex sets within which we seek extrema are usually polyhedra. A **polyhedron** in $\RR^n$ is a set of the form

$$
P = \setntn{x \in \RR^n}{A x \leq b}
    \quad \text{ for some } A \in \matset{k}{n} \text{ and } b \in \RR^k.
$$ (eq-polyh)

Equivalently, $P$ is a polyhedron in $\RR^n$ if there exist scalars $b_1, \ldots, b_k$ and $n$-dimensional vectors $a_1, \ldots, a_k$ such that $x \in P$ if and only if $a_i^\top x \leq b_i$ for $i=1, \ldots, k$.

```{prf:example}

A budget set of the form $B = \setntn{x \in \RR^n_+}{p^\top x \leq m}$ where $m \geq 0$ and $p \in \RR^n_+$ is a polyhedron. Here $p$ is a vector of prices and $x$ is a consumption bundle. Indeed, $B$ can be expressed as the set of all $x \in \RR^n$ such that $p^\top x \leq m$ and, for the nonnegativity constraints, $-\delta_i^\top x \leq 0$ for $i=1, \ldots, n$, where $\delta_i$ is the $i$-th canonical basis vector in $\RR^n$. This meets the definition of a polyhedron.
```


Given $b \in \RR$ and nonzero $c \in \RR^n$,

- $H_0 := \setntn{x \in \RR^n}{x^\top c = b}$ is called a **hyperplane** in $\RR^n$, while

- $H_1 := \setntn{x \in \RR^n}{x^\top c \leq b}$ is called a **halfspace** in $\RR^n$.

Note our convention. In {ref}`sss-linhy` we defined *linear* hyperplanes, which correspond to $H_0$ when $b=0$. Thus linear hyperplanes are a special kind of hyperplane. You will be able to confirm that the hyperplane $H_0$ is a linear subspace of $\RR^n$ if and only if $b=0$.

```{exercise}
:label: ex-appendix-auto-25

Show that $H_0$ and $H_1$ are both convex in $\RR^n$.
```


````{solution} ex-appendix-auto-25

Fix $u, v \in H_0$, $\lambda \in [0, 1]$, $b \in \RR$ and nonzero $c \in \RR^n$. Then

```{math}
:enumerated: false

(\lambda u + (1 - \lambda) v)^{\top} c 
        = \lambda u^{\top} c + (1 - \lambda) v^{\top} c 
        = \lambda b + (1 - \lambda) b = b
```

Thus $H_0$ is convex. The proof that $H_1$ is convex is similar.
````


It is immediate from the definition that $P \subset \RR^n$ is a polyhedron if and only if $P$ is the intersection of $k$ halfspaces in $\RR^n$ for some $k \in \NN$. {numref}`f-polyhedron1` helps illustrate this idea.

```{figure} figures/polyhedron1.svg
:name: f-polyhedron1

A polyhedron $P$ represented as intersecting halfspaces
```

An **extreme point** of a polyhedron $P$ is a point $p \in P$ that cannot be realized as the convex combination of other points in $P$. In other words, we cannot find two points $x, y \in P$ that are distinct from $p$ and satisfy $\lambda x + (1-\lambda) y = p$ for some $\lambda \in [0, 1]$. The extreme points of $P$ in {numref}`f-polyhedron1` are represented as black dots.

```{exercise}
:label: ex-polycon

Show that every polyhedron in $\RR^n$ is convex.
```


A **cone** in $\RR^n$ is a set $C \subset \RR^n$ such that $x \in C$ implies $\alpha x \in C$ for all $\alpha > 0$.

```{exercise}
:label: ex-concone

Show that (i) the intersection of any two cones is again a cone and (ii) a cone $C \subset \RR^n$ is convex (i.e., $C$ is a **convex cone**) if and only if it is closed under addition (i.e, $x, y \in C$ implies $x+y \in C$).
```


```{solution} ex-concone

Regarding part (i), let $C$ and $D$ be two cones. Fix $x \in C \cap D$ and $\alpha > 0$. Since $x \in C$ and $x \in D$, and since both are cones, we have $\alpha x \in C \cap D$. Hence $C \cap D$ is a cone.

Regarding part (ii), suppose first that $C$ is a convex cone and fix $x, y \in C$. Since $C$ is convex, it must be that $(1/2)(x+y) \in C$. Since $C$ is a cone we can scale by $2$ without leaving $C$. Hence $x+y \in C$. Suppose next that $C$ is a cone and closed under addition. Fix $\alpha \in (0, 1)$ and $x,y \in C$. Since $C$ is a cone, we have $\alpha x \in C$ and $(1-\alpha) y \in C$. Since $C$ is closed under addition, it follows that $\alpha x + (1-\alpha)y \in C$. Hence $C$ is convex.
```


````{exercise}
:label: ex-appendix-auto-26

The **positive cone** of $\RR^n$ is the set

```{math}
:enumerated: false

\RR^n_+ := \setntn{x \in \RR^n}{x \geq 0}.
```

Show that, for the partially ordered set $(\RR^n, \leq)$, the positive cone is an increasing subset of $\RR^n$. Show in addition that $\RR^n_+$ is a convex cone.
````


(sss-conconfun)=
#### Convex and Concave Functions
A function $g$ from a convex subset $C$ of $\RR^n$ to $\RR^k$ is called **convex** if

```{math}
:enumerated: false

g(\lambda u + (1-\lambda) v) \leq \lambda g(u) + (1-\lambda) g(v)
    \quad \text{whenever } u,v \in C \text{ and }
    0\leq \lambda \leq 1,
```

and **concave** if $-g$ is convex. Concavity of $g$ is obviously equivalent to

```{math}
:enumerated: false

g(\lambda u + (1-\lambda) v) \geq \lambda g(u) + (1-\lambda) g(v)
    \quad \text{whenever } u,v \in C \text{ and }
    0\leq \lambda \leq 1.
```

When $k=1$, the function $g$ is called, respectively, **strictly convex** or **strictly concave** if, in addition, the inequalities become strict whenever $u,v$ are distinct and $0 < \lambda < 1$.

```{exercise}
:label: ex-appendix-auto-27

Given an example of a function $g$ from $\RR^n$ to $\RR^n$ that is both convex and concave.
```


```{solution} ex-appendix-auto-27

Every linear function is both convex and concave.
```


These properties of functions are closely related to convexity of sets. For example, the same function $g$ is convex if and only if its **epigraph**

```{math}
:enumerated: false

\epi(g) := \setntn{(x, g(x)) \in \RR^{n+1}}{x \in C}
```

is convex.

````{exercise}
:label: ex-jendiscrete

If $C$ is a convex subset of $\RR^n$ and $g \colon \RR^n \to \RR$ is convex, then **Jensen's inequality** states that, for any vectors $\{x_1, \ldots, x_k\} \subset C$ and weights $\{\lambda_1, \ldots, \lambda_k\} \subset \RR$ with $0 \leq \lambda_i \leq 1$ and $\sum_i \lambda_i = 1$, we have

```{math}
:enumerated: false

g \left( \sum_{i=1}^k x_i \lambda_i \right)
        \leq 
        \sum_{i=1}^k  g \left( x_i \right) \lambda_i .
```

If $g$ is concave then the reverse inequality holds. Prove Jensen's inequality for the case where $g$ is convex when $k=3$.
````


In the next exercise, if $\{y_i\}$ is a finite collection of vectors in $\RR^k$, then $\max_i y_i$ is the vector in $\RR^k$ obtained by taking the maximum pointwise. The minimum $\min_i y_i$ is defined in a similar way.

```{exercise}
:label: ex-prescon

Fix $m \in \NN$ and let $\{g_i\}_{i \in \natset{m}}$ be a collection of $\RR^k$-valued functions defined on a convex subset $C$ of $\RR^n$. Show that,

(i) if $g_i$ is convex for every $i$ in $\natset{m}$, then $g$ defined at each $x$ in $C$ by $g(x) := \max_{i \in \natset{m}} g_i(x)$ is also convex on $C$ and

(ii) if $g_i$ is concave for every $i$ in $\natset{m}$, then $g$ defined at each $x$ in $C$ by $g(x) := \min_{i \in \natset{m}} g_i(x)$ is also concave on $C$.
```


````{solution} ex-prescon

It suffices to prove these results in the scalar case $n=k=1$, since the vector results are just element-by-element extensions of the scalar case. We focus on the setting where each $g_i$ is convex, as the concave case is similar.

In general, for scalars $\{a_i\}_{i=1}^m$ and $\{b_i\}_{i=1}^m$, we always have

```{math}
:enumerated: false

\max_i \{a_i + b_i\}
        \leq \max_i \{ a_i \} + \max_i \{b_i\}.
```

Hence, in the scalar case, when all $g_i$s are convex, we have, for any $\lambda \in [0,1]$ and $x, y \in C$,

```{math}
:enumerated: false

\begin{aligned}
\max_i \{ g_i(\lambda x + (1-\lambda) y)\}
        \leq \max_i \{ \lambda g_i(x) + (1-\lambda) g_i(y)\}
        \leq \lambda \max_i g_i(x) + (1-\lambda) \max_i g_i(y)
\end{aligned}
```

This proves the scalar case (and, by extension, the vector case).
````


```{exercise}
:label: ex-sumsconvex

Let $f$ and $g$ map $C$ to $\RR$, where $C \subset \RR^n$ is convex and so are $f$ and $g$. Show that (i) $f+g$ is convex and (ii) $f+g$ is strictly convex if, in addition, either $f$ or $g$ is strictly convex.
```


Important examples of concave and convex scalar-valued functions include certain kinds of quadratic forms. For the following you should recall that a symmetric $n \times n$ matrix $A$ is called

- **positive semidefinite** if $x^{\top} A x \geq 0$ for any $x$ in $\RR^n$,

- **positive definite** if $x^{\top} A x > 0$ for any nonzero $x$ in $\RR^n$,

- **negative semidefinite** if $x^{\top} A x \leq 0$ for any $x$ in $\RR^n$, and

- **negative definite** if $x^{\top} A x < 0$ for any nonzero $x$ in $\RR^n$.

It's important to remember (but easy to forget) that symmetry is part of the definition of these properties. You probably remember that

- $A$ is positive definite (resp., semidefinite) if and only if all its eigenvalues are strictly positive (resp., nonnegative) and

- $A$ is positive definite (resp., semidefinite) $\implies$ its determinant is strictly positive (resp., nonnegative).

The second statement follows from the first, since the determinant of a matrix equals the product of its eigenvalues.

The **quadratic form** $q(x) = x^{\top} A x$ is

- convex if and only if $A$ is positive semidefinite,

- strictly convex if and only if $A$ is positive definite,

- concave if and only if $A$ is negative semidefinite, and

- strictly concave if and only if $A$ is negative definite.

See, for example, {cite}`simon1994mathematics`.

```{exercise}
:label: ex-xpxpd

Let $X$ be $n \times k$. Prove the following:

(i) $X^\top X$ is positive semidefinite.

(ii) If, in addition, $X$ has full column rank, then $X^\top X$ is positive definite.
```


(ss-convexopt)=
### Optimization
In this section we review some key topics in optimization theory.

(ss-optde)=
#### Definitions and Existence
A number $m$ contained in a subset $A$ of $\RR$ is called the **maximum** of $A$ and we write $m = \max A$ if $a \leq m$ for every $a \in A$. It is called the **minimum** of $A$, written as $m=\min A$, if $m \in A$ and $a \geq m$ for every $a \in A$.

Given an arbitrary set $D$ and a function $f \colon D \to \RR$, define

```{math}
:enumerated: false

\max_{x \in D} f(x) := \max \setntn{f(x)}{x \in D}
    \quad \text{and} \quad
    \min_{x \in D} f(x) := \min \setntn{f(x)}{x \in D}.
```

A point $x^* \in D$ is called

- a **maximizer** of $f$ on $D$ if $x^* \in D$ and $f(x^*) \geq f(x)$ for all $x \in D$, and

- a **minimizer** of $f$ on $D$ if $x^* \in D$ and $f(x^*) \leq f(x)$ for all $x \in D$.

Equivalently, $x^* \in D$ is a maximizer of $f$ on $D$ if $f(x^*) = \max_{x \in D} f(x)$, and a minimizer if $f(x^*) = \min_{x \in D} f(x)$. We define

```{math}
:enumerated: false

\argmax_{x \in D} f(x) 
    := \setntn{x^* \in D}{f(x^*) \geq f(x) \text{ for all } x \in D}.
```

The set $\argmin_{x \in D} f(x)$ is defined analogously.

```{prf:example}

If $f(x) = x^2$ and $D=[-1, 1]$, then $\argmax_{x \in D} f(x) = \{-1, 1\}$, while $\argmin_{x \in D} f(x) = \{0\}$. In the second case, where the solution set is a singleton, that is, a set with exactly one element, we write $\argmin_{x \in D} f(x) = 0$ as well.
```


```{exercise}
:label: eq-idmm

Let $f \colon D \to A \subset \RR$ be any given function. Prove the following:

(i) If $g \colon A \to \RR$ is a strictly increasing function, then $x^*$ is a maximizer of $f$ on $D$ if and only if $x^*$ is a maximizer of $g \circ f$ on $A$.

(ii) If $g \colon A \to \RR$ is a strictly decreasing function, then $x^*$ is a maximizer of $f$ on $D$ if and only if $x^*$ is a minimizer of $g \circ f$ on $A$.
```


````{solution} eq-idmm

Regarding part (i), let $f$ and $g$ be as stated. Since $g$ is strictly increasing, we have

```{math}
:enumerated: false

f(x^*) \geq f(x), \;\; \forall \, x \in D
        \quad \iff \quad
        g(f(x^*)) \geq g(f(x)), \;\; \forall \, x \in D.
```

This proves the equivalence claimed in part (i). (Note why the strictly increasing property of $g$ cannot be weakened here.) The proof of (ii) is similar, with the second inequality reversed.
````


One important special case of part (ii) is that $x^* \in D$ is a maximizer of $f$ on $D$ if and only if $x^*$ is a minimizer of $-f$ on $D$. Hence, any maximization problem can be converted into a minimization problem and vice-versa.

#### Convexity and Extrema

{ref}`ss-optde` discussed existence of optimizers. In this section we consider uniqueness. The key observation is that, for convex and concave functions, local optimizers are global optimizers.

If $C \subset \RR^n$ and $f$ is a real-valued function on $C$, then $u^* \in C$ is a **local minimizer** of $f$ on $C$ if there exists an open set $G$ in $C$ such that $u^* \in G$ and $f(u^*) \leq f(u)$ whenever $u \in G$. A **local maximizer** is defined analogously.

The next exercise highlights one of the most important facts concerning computation of solutions to optimization problems in real-world applications. It is especially valuable in high-dimensional settings, where optimization problems can be very challenging.

```{exercise}
:label: ex-locglo

Show that, if $C \subset \RR^n$ is convex, $f$ is convex and $u^*$ is a local minimizer of $f$ on $C$, then $u^*$ is a minimizer of $f$ on $C$.
```


````{solution} ex-locglo

Let $f$ and $C$ be as described and let $u^*$ be a local minimizer. Suppose, contrary to the claim in the exercise, that there exists a point $u$ in $C$ such that $f(u) < f(u^*)$. Then, by convexity, for each $\lambda$ in $[0, 1]$, we have

```{math}
:enumerated: false

f(\lambda u + (1-\lambda) u^*) \leq \lambda f(u) + (1-\lambda) f(u^*)
        < f(u^*).
```

Taking $\lambda \to 0$, we can find a point $v := \lambda u + (1-\lambda) u^*$ arbitrarily close to $u^*$ such that $f(v) < f(u^*)$. This contradicts the definition of a local minimizer.
````


Similarly, if $f$ is concave on $C$, then any local maximizer is a global maximizer.

(sss-mqo)=
#### Multivariate Quadratic Objectives
{ref}`sss-quadgame` treated a one-dimensional quadratic optimization problem. Next we treat $n$-dimensional problems of the same type.

````{prf:lemma}
:label: l-quadopt

If $H \in \matset{n}{n}$ is positive definite, then, for any $b \in \RR$ and $a \in \RR^n$,

```{math}
:enumerated: false

u^* := H^{-1} a
        \text{ is the unique minimizer of }
        q(u) := u^\top H u - 2 u^\top a + b
        \text{ in } \RR^n.
```
````


```{exercise}
:label: ex-appendix-auto-28

Prove that any local minimizer of $q$ in {prf:ref}`l-quadopt` is also a global minimizer. (Hint: Use {prf:ref}`ex-sumsconvex`.)
```


````{exercise}
:label: ex-tffmc

Complete the proof of {prf:ref}`l-quadopt` by showing that $u^*$ is a local minimizer. It suffices to show that the derivative of $q$ at $u^*$ is zero. Use the following facts from matrix calculus:

```{math}
:enumerated: false

a \in \RR^n \text{ and } H \in \matset{n}{n}
        \quad \implies \quad
        \frac{\diff}{\diff u} u^\top a = a
        \; \text{ and } \;
        \frac{\diff}{\diff u} u^\top H u = (H + H^\top)u.
```
````


(ss-ld)=
### Lagrangian Duality
If you have studied undergraduate economics, you will have used Lagrangian methods to solve constrained optimization problems. The objective of this section is to supply insight on when and why the method works, as well as to highlight the connection between an original constrained problem and a so-called "dual problem." This connection yields deep insights in economics, finance, statistical learning, artificial intelligence and many other fields.

(sss-theo)=
#### Theory
Let $E$ be a subset of $\RR^n$ and let $f$ map $E$ to $\RR$. We aim to solve

$$
\min_{x \in E} f(x)  
    \; \text{ subject to } \;
    g(x) = 0  \text{ and } h(x) \leq 0.
$$ (eq-lagran)

Here $g$ maps $E$ to $\RR^m$ and $h$ maps $E$ to $\RR^k$. For example, the zero symbol in the statement $g(x) = 0$ is a vector of zeros, and the meaning is that $g_i(x) = 0$ in $\RR$ for $i$ in $1, \ldots, m$. The interpretation of the second constraint is analogous.

Any $x \in E$ that satisfies the constraints in {eq}`eq-lagran` is called **feasible**. Let $F(g, h)$ be the set of all feasible $x \in E$. A feasible point that attains the minimum in {eq}`eq-lagran` is called **optimal** for—or a **solution** to—the optimization problem.

Our first claim is that the constrained optimization problem {eq}`eq-lagran` is equivalent to the *un*constrained problem

$$
P =
    \min_{x \in E} \,
        \max_{\theta \in \Theta}
        L(x, \theta)
$$ (eq-lagran2)

where $\theta := (\lambda, \mu)$ and

$$
L(x, \theta) 
    = L(x, \lambda, \mu) 
    := f(x)  + \sum_{i=1}^m \lambda_i g_i(x)  + \sum_{i=1}^k \mu_i h_i(x) .
$$ (eq-lagdef)

Here $\theta \in \Theta$ combines the vectors of **Lagrange multipliers** $\lambda \in \RR^m$ and $\mu \in \RR^k_+$, where $\Theta := \RR^m \times \RR^k_+$. By *equivalent to,* we mean that

(i) $\hat f(x) := \max_{\theta \in \Theta} L(x, \theta)$ satisfies $\hat f = f$ on $F(g, h)$,

(ii) $\hat f = +\infty$ on the complement of $F(g, h)$ and

(iii) together $\hat f$ and $f$ satisfy

$$
P 
                := \min_{x \in E} \hat f(x)
                = \min_{x \in F(g, h)} \hat f(x)
                = \min_{x \in F(g, h)} f(x).
$$ (eq-maffp)

The first equality in {eq}`eq-maffp` is by definition. The second two follow from (ii) and (i) respectively. Hence we need only verify (i)–(ii).

```{exercise}
:label: ex-appendix-auto-29

Show that (i)–(ii) both hold. You can assume that extrema exist.
```


```{solution} ex-appendix-auto-29

Regarding the first claim, suppose that $g(x) = 0$ and $h(x) \leq 0$, so that $x \in F(g, h)$. In this case,

$$
\hat f(x) 
        = \max_{\theta \in \Theta} L(x, \theta)
        = f(x) 
        + \max_{\lambda \in \RR^m} \sum_i \lambda_i g_i(x) 
        + \max_{\mu \in \RR^k_+} \sum_i \mu_i h_i(x) 
        = f(x).
$$ (eq-lagcs)
Hence $\hat f = f$ on $F(g, h)$ and claim (i) is verified.

Regarding claim (ii), suppose that $g_i(x)$ deviates from zero for some $i$. Then $\max_{\lambda \in \RR^m} \sum_i \lambda_i g_i(x)$ equals $+\infty$, so $\hat f(x) = +\infty$. In addition, if $h_i(x) > 0$ for some $i$, then $\max_{\mu \in \RR^k_+} \sum_i \mu_i h_i(x)  = +\infty$, so, once again $\hat f(x) = +\infty$. We have confirmed that $\hat f = +\infty$ whenever $x \notin F(g, h)$.
```


The function $L$ in problem {eq}`eq-lagdef` is usually called the **Lagrangian**. The $P$ in {eq}`eq-lagran2` stands for **primal**. So far we have shown that the original constrained problem and the primal problem are the same. The next step is to pair the primal problem with its **dual** problem, which is obtained by reversing the order of min and max in the primal:

$$
D =
    \max_{\theta \in \Theta} \;
    \min_{x \in E} \; 
    L(x, \theta).
$$ (eq-lagdual)

The dual problem has two attractive features. One is that, when minimizing with respect to $x$, we do not need to concern ourselves with the constraints on $x$ in the original formulation {eq}`eq-lagran`. The second is that, since $L(x, \theta)$ is linear in $\theta$, and since we are minimizing a family of these functions with respect to $x$, the minimizer is a concave function. Concavity assists maximization, which is the next step in solving $D$.

```{exercise}
:label: ex-opriexdu

Show that $D \leq P$ always holds.
```


````{solution} ex-opriexdu

Pick any $x' \in E$ and $\theta \in \Theta$. We have $L(x', \theta) \geq \min_x L(x, \theta)$, so

```{math}
:enumerated: false

\max_\theta L(x', \theta) \geq \max_\theta \min_x L(x, \theta).
```

```{math}
:enumerated: false

\fore
        \min_x \max_\theta L(x, \theta) \geq \max_\theta \min_x L(x, \theta).
```
````


The result $D \leq P$ in {prf:ref}`ex-opriexdu` is called **weak duality**. If $P = D$, then **strong duality** is said to hold. Unlike weak duality, strong duality requires conditions on the primitives.

Evidently strong duality holds if and only if it is valid to reverse the order of the min and max operators in the definition of the primal (or the dual). Results of this kind are called *min-max theorems*. Such theorems hold at "saddle points" of the function $L$. The next section explains.

(sss-saddu)=
#### Saddle Points and Duality
We seek necessary and sufficient conditions for strong duality, which will lead to a characterization of minimizers for the original constrained problem. To do so, we again take $\theta := (\lambda, \mu)$ and $\Theta := \RR^m \times \RR^k_+$, so that

$$
P = \min_{x \in E} \max_{\theta \in \Theta} L(x, \theta)
    \quad \text{and} \quad
    D = \max_{\theta \in \Theta} \min_{x \in E} L(x, \theta).
$$ (eq-pandd)

A pair $(x^*, \theta^*)$ in $E \times \Theta$ is called a **saddle point** of $L$ if

$$
L(x^*, \theta) 
    \leq L(x^*, \theta^*) 
    \leq L(x, \theta^*) 
    \quad \text{for all} \quad
    (x, \theta) \in E \times \Theta.
$$ (eq-saddle)

A depiction of a saddle point of a given bivariate function $(x, \theta) \mapsto L(x, \theta) \in \RR$ is given in {numref}`f-saddle_1`. The left hand side of the top panel is a 3D visualization, and the right hand side is a contour plot of the same function. The saddle point is at the center.

```{figure} figures/saddle_1.svg
:name: f-saddle_1

A saddle point $(x^*, \theta^*)$ of the function $L$
```

When the extrema in {eq}`eq-pandd` exist, we have the following result:

```{prf:theorem}
:label: t-saddle

If $L$ has a saddle point $(x^*, \theta^*)$ in $E \times \Theta$, then strong duality holds. Moreover, $P=D = L(x^*, \theta^*)$ and $x^*$ solves the constrained optimization problem {eq}`eq-lagran`.
```


````{prf:proof}
:nonumber:

Let $(x^*, \theta^*)$ be a saddle point $(x^*, \theta^*)$ of $L$ in $E \times \Theta$. We have, for all $(x, \theta) \in E \times \Theta$,

```{math}
:enumerated: false

P 
        \leq \max_\theta L(x^*, \theta)
        \leq L(x^*, \theta^*) 
        \leq \min_x L(x, \theta^*),
```

where the first inequality is by definition and the second two are by the saddle point property. The last term is clearly dominated by $D$, so we conclude that $P \leq L(x^*, \theta^*) \leq D$. But, by weak duality, we also have $D \leq P$, so $P = L(x^*, \theta^*) = D$.

Finally, to confirm that $x^*$ solves the original constrained problem, suppose to the contrary that there exists an $x_0 \in E$ that satisfies the constraints and yields $f(x_0) < f(x^*)$. Since the constraints are satisfied at both $x_0$ and $x^*$, we can apply {eq}`eq-lagcs` to obtain $\max_{\theta \in \Theta} L(x_0, \theta) = f(x_0)$ and $\max_{\theta \in \Theta} L(x^*, \theta) = f(x^*)$. Hence the second inequality of the saddle point condition implies

```{math}
:enumerated: false

f(x^*)
        = \max_{\theta \in \Theta} L(x^*, \theta)
            \leq \max_{\theta \in \Theta} L(x_0, \theta)
            = f(x_0).
```

This contradicts the hypothesis that $f(x_0) < f(x^*)$. ◻
````


{prf:ref}`t-saddle` tells us that to solve the constrained optimization problem and establish strong duality, we need only obtain a saddle point of the Lagrangian.

(sss-kkt)=
#### Karush, Kuhn and Tucker
For well behaved problems, saddle points can be identified via well known first-order conditions, called the **Karush–Kuhn–Tucker** (KKT) conditions. To state them, we return to the original problem {eq}`eq-lagran` and write $\theta$ explicitly as $(\lambda, \mu)$, so that $(x^*, \lambda^*, \mu^*) \in E \times \RR^m \times \RR^k_+$ satisfies the saddle point condition if

```{math}
:enumerated: false

L(x^*, \lambda, \mu) 
        \leq L(x^*, \lambda^*, \mu^*) 
        \leq L(x, \lambda^*, \mu^*) 
        \quad \text{for all} \quad
        x \in E, \lambda \in \RR^m \text{ and } \mu \in \RR^k_+.
```

The **KKT conditions** are met by $(x^*, \lambda^*, \mu^*) \in E \times \RR^m \times \RR^k_+$ if $x^* \in F(g,h)$,

$$
\nabla f(x^*) + \sum_{i=1}^m \lambda^*_i \nabla g_i(x^*)  + \sum_{i=1}^k
    \mu^*_i \nabla h_i(x^*) 
    = 0 
    \quad \text{and}
$$ (eq-swrtx)

$$
\mu^*_i h_i(x^*) = 0
    \quad \text{for all } i \in \natset{k}.
$$ (eq-compslack)

Here we are requiring that $f, g, h$ are all differentiable at $x^*$ and, for a given function $q \colon E \to \RR$, we use $\nabla$ to represent the vector of partial derivatives. Equation {eq}`eq-swrtx` requires that the derivative of the Lagrangian with respect to $x$ is zero at $x^*$. The second condition is called the **complementary slackness** condition.

The KKT conditions are nothing more than saddle point conditions. Condition {eq}`eq-swrtx` is the first order condition for an interior minimizer of the Lagrangian with respect to $x$, at the point $(x^*, \theta^*)$, which tries to identify the local minimum visualized in the lower right panel of {numref}`f-saddle_1`. The complementary slackness condition is also needed because if $\mu^*_i h_i(x^*) = 0$ fails at some $i$, then $\mu^*_i h_i(x^*) < 0$ must hold, in which case we could strictly increase the Lagrangian by shifting $\mu^*_i$ to $0$. This violates the saddle point property.

If enough regularity conditions hold, then the KKT conditions exactly identify extremal points. Here is one example, which is proved in Chapter 8 of {cite}`matousek2007understanding`.

```{prf:theorem} Karush–Kuhn–Tucker
:label: t-kkt

If $E$ is open, $f$ is continuously differentiable and convex, and both $g$ and $h$ are affine functions, then $x^*$ minimizes $f$ on $F(g, h)$ if and only if there exists a pair $(\lambda^*, \mu^*) \in \RR^m \times \RR^k_+$ such that the KKT conditions hold.
```


(c-apsol)=
## Solutions to Selected Exercises
[^1]: The notation $x \leq y$ over vectors is standard, while $x \ll y$ is less so. In some fields, $n \ll k$ is used as an abbreviation for "$n$ is much smaller than $k$." Our usage lines up with most of the literature on partially ordered vector spaces. See, e.g., {cite}`zhang2012variational`.

[^2]: Other common terms for order-preserving in the literature include "monotone increasing," "monotone" and "isotone."

[^3]: This definition is not ambiguous because every possible enumeration leads to the same value when the absolute sum is finite (see, e.g., the rearrangement theorem in {cite}`bartle2011introduction`, §9.1).

[^4]: Hint: Start with the case $|S|=2$. Argue that the case with $n$ elements follows from this case and the ordinary (weak) triangle inequality $| \sum_{x \in S} g(x) | \leq \sum_{x \in S} |g(x)|$.

[^5]: By the law of the excluded middle, the empty set must be linearly independent too.
