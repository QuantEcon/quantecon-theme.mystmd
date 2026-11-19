---
title: "Nonlinear Interactions"
label: c-fpms
---

Much of what makes network analysis interesting is how ramifications of choices flow across networks. In general, decisions made at a given node $i$ affect responses of neighboring nodes and, through them, neighbors of neighboring nodes, and so on. As these consequences flow across the network, they in turn affect choices at $i$. This is a tail-chasing scenario, which can be unraveled through fixed point theory.

In some network settings, such as the input-output model in {ref}`ss-mutmod`, interactions are linear and fixed point problems reduce a system of linear equations. In other settings, interactions are inherently nonlinear and, as a result, we need more sophisticated fixed point theory.

This chapter is dedicated to the study of networks with nonlinear interactions. We begin with relevant fixed point theory and then apply it to a sequence of problems that arise in analysis of economic networks, including production models with supply constraints and financial networks.

## Fixed Point Theory

Let $S$ be any set. Recall from {ref}`sss-fpfd` that, given a self-map $G$ on $S$, a point $x \in S$ is called a fixed point of $G$ if $Gx = x$. (A self-map on $S$ is a function $G$ from $S$ to itself. When working with self-maps it is common to abbreviate $G(x)$ to $Gx$.) In this chapter, we will say that $G$ is **globally stable** on $S$ if $G$ has a unique fixed point $x^* \in S$ and $G^k x \to x^*$ as $k \to \infty$ for all $x \in S$. In other words, under this property, the fixed point is not only unique but also globally attracting under iteration of $G$.

We have already discussed fixed points, indirectly or directly, in multiple contexts:

- In {prf:ref}`c-prod` we studied the equation $x = A x + d$, where $x$ is an output vector, $A$ is a matrix of coefficients and $d$ is a demand vector. A solution $x$ to this equation can also be thought of as a fixed point of the affine map $Fx = Ax + d$.

- In {prf:ref}`c-mcs` we learned that a stationary distribution of a finite Markov model with state space $S$ and adjacency matrix $P$ is a $\psi \in \dD(S)$ with $\psi = \psi P$. In other words, $\psi$ is a fixed point of $\psi \mapsto \psi P$ in $\dD(S)$.

- In {prf:ref}`c-ofd` we studied the Bellman equation $q(x) = \min_{y \in \oO(x)} \{ c(x, y) + q(y) \}$ and introduced an operator the Bellman operator $T$, with the property that its fixed points exactly coincide with solutions to the Bellman equation.

In each case, when we introduced these fixed point problems, we immediately needed to consider questions of existence and uniqueness of fixed points. Now we address these same issues more systematically in an abstract setting.

(ss-bcmt)=
### Contraction Mappings
In {prf:ref}`c-prod` we studied solutions of the system $x = Ax + b$ that are fixed points of the affine map $Fx = Ax + b$ on $\RR^n$ studied in {prf:ref}`eg-bcam`. The Neumann series lemma is, in essence, a statement about existence and uniqueness of fixed points of this map. Here we investigate another fixed point theorem, due to Stefan Banach (1892–1945), that can be thought of as extending the Neumann series lemma to nonlinear systems.

#### Contractions

Let $S$ be a nonempty subset of $\RR^n$. A self-map $F$ on $S$ is called **contracting** or a **contraction of modulus $\lambda$** on $S$ if there exists a $\lambda < 1$ and a norm $\| \cdot \|$ on $\RR^n$ such that

$$
\| Fu - Fv \| \leq \lambda \| u - v \| \quad \text{for all} \quad u, v \in S.
$$ (eq-uc)

```{exercise}
:label: ex-sciufp

Let $F$ be a contraction of modulus $\lambda$ on $S$. Show that

(i) $F$ is continuous on $S$ and

(ii) $F$ has at most one fixed point on $S$.
```


````{prf:example}
:label: eg-bcam

Let $S = \RR^n$, paired with the Euclidean norm $\| \cdot \|$. Let $Fx = Ax + b$, where $A \in \matset{n}{n}$ and $b \in \RR^n$. If $\| A \| < 1$, where $\| \cdot \|$ is the operator norm on $\matset{n}{n}$, then $F$ is a contraction of modulus $\| A \|$, since, for any $x, y \in S$,

```{math}
:enumerated: false

\| Ax + b - Ay - b \|
        = \| A(x - y) \| \leq \|A \| \| x - y \|.
```
````


The next example uses a similar idea but is based on a different norm.

````{prf:example}

In {eq}`eq-msirho` we studied the system $\rho = A^\top \rho - \epsilon$, where $A = (a_{ij})$ is a matrix of coefficients satisfying $\sum_i a_{ij} = 1 - \alpha$ for some $\alpha \in (0,1)$, the vector $\epsilon$ is given and $\rho$ is unknown. Solutions can be viewed as a fixed points of the map $F \colon \RR^n \to \RR^n$ defined by $F p = A^\top p - \epsilon$. Under the $\| \cdot \|_\infty$ norm, $F$ is a contraction of modulus $1-\alpha$ on $\RR^n$. Indeed, for any $p, q \in \RR^n$,

```{math}
:enumerated: false

\| Fp - Fq \|_\infty
        = \max_j \left| \sum_{i=1}^n a_{ij} (p_i - q_i) \right|
        \leq \max_j \sum_{i=1}^n  a_{ij} \left|  p_i - q_i \right|.
```

Since $|p_i - q_i| \leq \| p - q \|_\infty$, we obtain

```{math}
:enumerated: false

\| Fp - Fq \|_\infty
        \leq \max_j \sum_{i=1}^n  a_{ij} \| p - q \|_\infty
        = (1- \alpha) \| p - q \|_\infty.
```
````


Consider again {prf:ref}`eg-bcam`. For the affine map $Fx = Ax + b$, the condition $\| A \| < 1$ used to obtain contraction is stronger than the condition $r(A) < 1$ used to obtain a unique fixed point in the Neumann series lemma (see {prf:ref}`ex-srsn`). Furthermore, the Neumann series lemma provides a geometric series representation of the fixed point. On the other hand, as we now show, the contraction property can be used to obtain unique fixed points when the map in question is not affine.

(sss-bcmts)=
#### Banach's Theorem
The fundamental importance of contractions stems from the following theorem.

```{prf:theorem} Banach's contraction mapping theorem
:label: t-bfpt

If $S$ is  closed in $\RR^n$ and $F$ is a contraction of modulus $\lambda$ on $S$, then $F$ has a unique fixed point $u^*$ in $S$ and

$$
\| F^n u - u^* \| \leq \lambda^n \| u - u^* \|
        \quad \text{for all } n \in \NN \text{ and } u \in S.
$$ (eq-banachrate)
In particular, $F$ is globally stable on $S$.
```


We complete a proof of {prf:ref}`t-bfpt` in stages.

````{exercise}
:label: ex-bctqb

Let $S$ and $F$ have the properties stated in {prf:ref}`t-bfpt`. Fix $u_0 \in S$ and let $u_m := F^m u_0$. Show that

```{math}
:enumerated: false

\| u_m - u_k \| \leq \sum_{i=m}^{k-1} \lambda^i \| u_0 - u_1 \|
```

holds for all $m, k \in \NN$ with $m < k$.
````


```{exercise}
:label: ex-bctic

Using the results in {prf:ref}`ex-bctqb`, prove that $(u_m)$ is a Cauchy sequence in $\RR^n$ (see {ref}`sss-ocon` for notes on the Cauchy property).
```


````{solution} ex-bctic

From the bound in {prf:ref}`ex-bctqb`, we obtain

```{math}
:enumerated: false

\| u_m - u_k \| \leq \frac{\lambda^m}{1 - \lambda} \lambda^i \| u_0 - u_1 \|
         \qquad (m,k \in \NN \text{ with } m < k).
```

Hence $(u_m)$ is Cauchy, as claimed.
````


```{exercise}
:label: ex-fpms-auto-1

Using {prf:ref}`ex-bctic`, argue that $(u_m)$ hence has a limit $u^* \in \RR^n$. Prove that $u^* \in S$.
```


```{prf:proof}
:nonumber:

**Proof of {prf:ref}`t-bfpt`.**

In the exercises we proved existence of a point $u^* \in S$ such that $F^m u \to u^*$. The fact that $u^*$ is a fixed point of $F$ now follows from {prf:ref}`l-clifp` and {prf:ref}`ex-sciufp`. Uniqueness is implied by {prf:ref}`ex-sciufp`. The bound {eq}`eq-banachrate` follows from iteration on the contraction inequality {eq}`eq-uc` while setting $v=u^*$. ◻
```


#### Eventual Contractions

Let $S$ be a nonempty subset of $\RR^n$. A self-map $F$ on $S$ is called **eventually contracting** if there exists a $k \in \NN$ such that $F^k$ is a contraction on $S$. Significantly, most of the conclusions of Banach's theorem carry over to the case where $F$ is eventually contracting.

```{prf:theorem}
:label: t-bfpt2

Let $F$ be a self-map on $S \subset \RR^n$. If $S$ is closed and $F$ is eventually contracting, then $F$ is globally stable on $S$.
```


```{exercise}
:label: ex-fpms-auto-2

Prove {prf:ref}`t-bfpt2`.[^1]
```


````{solution} ex-fpms-auto-2

Let $S$ be complete, let $F$ be a self-map on $S$ and let $F^k$ be a uniform contraction. Let $u^*$ be the unique fixed point of $F^k$. Fix $\epsilon > 0$. We can choose $n$ such that $\|F^{nk} F u^* - u^* \| < \epsilon$. But then

```{math}
:enumerated: false

\| F u^*- u^* \| = \| F F^{nk} u^*- u^*\| = \|F^{nk} F u^* - u^* \|  < \epsilon.
```

Since $\epsilon$ was arbitrary we have $\| F u^*- u^*\| = 0$, implying that $u^*$ is a fixed point of $F$.

Regarding convergence, fix $u \in S$. Given $n \in \NN$, there exist integers $j(n)$ and $i(n)$ such that $n = j(n) k + i(n)$, and $j(n) \to \infty$ as $n \to \infty$. Hence

```{math}
:enumerated: false

\| F^n u - u^* \|
        = \| F^{j(n)k + i(n)} u - u^* \|
        = \| F^{j(n)k} F^{i(n)} u - u^* \| \to 0
        \qquad (n \to \infty),
```

by the assumptions on $F^k$. Convergence implies uniqueness of the fixed point (why?).
````


There is a close connection between {prf:ref}`t-bfpt2` and the Neumann series lemma (NSL). If $S=\RR^n$ and $F x = A x + b$ with $r(A) < 1$, then the NSL implies a unique fixed point. We can also obtain this result from {prf:ref}`t-bfpt2`, since, for any $k \in \NN$,

```{math}
:enumerated: false

\| F^k x - F^k y \|
    = \| A^k x - A^k y \|
    = \| A^k (x - y) \| 
    \leq \|A^k \| \| x - y \|.
```

As $r(A) < 1$, we can choose $k$ such that $\| A^k \| < 1$ (see {ref}`sss-mnspec`). Hence $F$ is eventually contracting and {prf:ref}`t-bfpt2` applies.

As mentioned above, contractions and eventual contractions have much wider scope than the NSL, since they can also be applied in nonlinear settings. At the same time, the NSL is preferred when its conditions hold, since it also gives inverse and power series representations of the fixed point.

#### A Condition for Eventual Contractions

The result below provides a useful test for the eventual contraction property. (In the statement, the absolute value of a vector is defined pointwise, as in {ref}`sss-poov`.)

````{prf:proposition}
:label: p-cec

Let $F$ be a self-map on $S \subset \RR^n$ such that, for some $n \times n$ matrix $A$,

```{math}
:enumerated: false

|F x - F y| \leq A | x - y |
        \quad \text{for all } \, x, y \in S.
```

If, in addition, $A \geq 0$ and $r(A) < 1$, then $F$ is eventually contracting on $S$ with respect to the Euclidean norm.
````


````{prf:proof}
:nonumber:

Our first claim is that, under the conditions of the proposition,

$$
|F^k x - F^k y| \leq A^k | x - y |
        \quad \text{for all } k \in \NN \text{ and } x, y \in S.
$$ (eq-fk)
This is true at $k=1$ by assumption. If it is true at $k-1$, then

$$
|F^k x - F^k y| 
        \leq A | F^{k-1} x - F^{k-1} y |
        \leq A A^{k-1} | x -  y |,
$$
where the second inequality uses the induction hypothesis and $A \geq 0$ (so that $u \leq v$ implies $Au \leq Av$). Hence {eq}`eq-fk` holds.

It follows from the definition of the Euclidean norm that $\| |u| \| = \| u\|$ for any vector $u$. Also, for the same norm, $|u| \leq |v|$ implies $\| u \| \leq \| v\|$. Hence, for all $k \in \NN$ and $x, y \in S$,

```{math}
:enumerated: false

\| F^k x - F^k y \| 
        \leq \| A^k |x - y| \|
        \leq \| A^k \|_o \| x - y \|.
```

In the second inequality, we used $\| \cdot \|_o$ for the operator norm, combined with the fact that $\| A u \| \leq \|A\|_o \|u\|$ always holds, as discussed in {ref}`sss-onorm`.

By Gelfand's lemma (see in particular {prf:ref}`ex-igfo`), we obtain existence of a $\lambda \in (0,1)$ and a $k \in \NN$ with $\|A^k\|_o \leq \lambda < 1$. Hence, for this $k$,

```{math}
:enumerated: false

\| F^k x - F^k y \| \leq \lambda \|x - y\|.
```

Since $\lambda$ does not depend on $x$ or $y$, we have shown that $F$ is an eventual contraction on $S$ with respect to the Euclidean norm. ◻
````


### Shortest Paths Revisited

Consider again the shortest path problem introduced in {ref}`ss-shp`. One modification that sometimes appears in applications is the addition of discounting during travel between vertices. For example, if the vertices are international ports and travel takes place by sea, then port-to-port travel time is measured in weeks or even months. It is natural to apply time discounting to future costs associated with that travel, to implement the idea that paying a given dollar amount in the future is preferable to paying it now.

```{exercise}
:label: ex-fpms-auto-3

Suppose it is possible to borrow and lend risk-free at a positive interest rate $r$. Explain why it is always preferable to have \$100 now than \$100 in a year's time in this setting.
```


```{solution} ex-fpms-auto-3

If the risk-free real interest rate $r$ is positive, then \$100 received now can be converted with probability one into $(1+r) 100 > 100$ dollars in one year.
```


Recall that, without discounting, the Bellman equation for the shortest path problem takes the form $q(x) = \min_{y \in \oO(x)} \{ c(x, y) + q(y) \}$ for all $x \in V$, where $c$ is the cost function $V$ is the set of vertices and $q$ is a candidate for the cost-to-go function. We showed that the minimum cost-to-go function $q^*$ satisfies the Bellman equation and is the unique fixed point of the Bellman operator.

The Bellman equation neatly divides the problem into current costs, embedded in the term $c(x, y)$, and future costs embedded in $q(y)$. To add discounting, we need only discount $q(y)$. We do this by multiplying it by a **discount factor** $\beta \in (0, 1)$. The Bellman equation is then $q(x) = \min_{y \in \oO(x)} \{ c(x, y) + \beta q(y) \}$ for all $x \in V$ and the Bellman operator is

$$
Tq(x) = \min_{y \in \oO(x)} \{ c(x, y) + \beta q(y) \}
     \qquad (x \in V).
$$ (eq-bespb)

In {ref}`ss-belm`, without discounting, we had to work hard to show that the Bellman operator has a unique fixed point in $U$, the set of all $q \colon V \to \RR_+$ with $q(d)=0$. With discounting the proof is easier, since we can leverage the Banach contraction mapping theorem.

In what follows, we identify the vertices in $V$ with integers $1, \ldots, n$, where $d$ is identified with $n$. We then understand $U$ as all nonnegative vectors $q$ in $\RR^n$ with $q(n) = 0$. (We continue to write $q(x)$ for the $x$-th element of the vector $q$, but now $x$ is in $\natset{n}$.)

```{exercise}
:label: ex-fpms-auto-4

Prove that $U$ is a closed subset of $\RR^n$.
```


```{solution} ex-fpms-auto-4

Take $q_k \to q$ where $(q_k)$ is a sequence of $n$-vectors contained in $U$. By {prf:ref}`ex-clic`, since $q_k \geq 0$ for all $k$, we must have $q \geq 0$. It remains only to show that $q(n)=0$. As $q_k \in U$ for all $k$, we have $q_k(n)=0$ for all $k$. By {prf:ref}`l-eqconvec`, we also have $q_k(n) \to q(n)$. Hence $q(n)=0$.
```


```{exercise}
:label: ex-fpms-auto-5

Prove that $T$ is order-preserving on $U$ with respect to the pointwise order.
```


```{solution} ex-fpms-auto-5

We need to show that if $p, q \in U$ and $p \leq q$, then $Tp \leq Tq$. This follows easily from the definition of $T$ in {eq}`eq-bespb`.
```


```{exercise}
:label: ex-tqa

Prove that, for any $q \in U$ and $\alpha \in \RR_+$, we have $T(q + \alpha \1) = Tq + \beta \alpha \1$.
```


````{solution} ex-tqa

Fix $q \in U$, $\alpha \in \RR_+$ and $x \in V$. By definition,

```{math}
:enumerated: false

T(q + \alpha \1) (x) 
         = \min_{y \in \oO(x)} \{ c(x, y) + \beta q(y) + \alpha \beta \}
         = Tq(x) + \alpha \beta.
```

Hence $T(q + \alpha \1) = Tq + \beta \alpha \1$ as claimed.
````


Now let $\| \cdot \|_\infty$ be the supremum norm on $\RR^n$ (see {ref}`ss-vecnorms`). We claim that $T$ is a contraction on $U$ of modulus $\beta$. To see that this is so, fix $p, q \in U$ and observe that, pointwise,

```{math}
:enumerated: false

Tq 
    = T(p + q - p)
    \leq T(p + \|q - p\|_\infty \1)
    \leq Tp + \beta \|q - p\|_\infty \1,
```

where the first inequality is by the order-preserving of $T$ and the second follows from {prf:ref}`ex-tqa`. Hence

```{math}
:enumerated: false

Tq - Tp \leq  \beta \|q - p\|_\infty \1.
```

Reversing the roles of $p$ and $q$ gives the reverse inequality. Hence

```{math}
:enumerated: false

|Tq (x) - Tp(x) | \leq  \beta \|q - p\|_\infty
```

for all $x \in \natset{n}$. Taking the maximum on the left hand side yields $\|Tq - Tp \|_\infty \leq  \beta \|q - p\|_\infty$, which shows that $T$ is a contraction of modulus $\beta$. Hence Banach's theorem applies and a unique fixed point exists.

(sss-pwconst)=
### Supply Constraints
While the input-output model from {ref}`sss-ioeq` has many useful applications, its linear structure can be a liability. One natural objection to linearity is supply constraints: if sector $j$ doubles its orders from sector $i$, we cannot always expect that sector $i$ will quickly meet this jump in demand.

In this sector we investigate the impact of supply constraints on equilibrium. These constraints introduce nonlinear relationships between nodes that affect equilibria and make analysis more challenging.

We recall from {ref}`sss-ioeq` that $d_i$ is final demand for good $i$, $x_i$ is total sales of sector $i$, $z_{ij}$ is inter-industry sales from sector $i$ to sector $j$, and $a_{ij} = z_{ij}/x_j$ is dollar value of inputs from $i$ per dollar output from $j$.

Departing from our previous formulation of equilibrium in the input-output model, suppose that, in the short run, the total output value of sector $i$ is constrained by positive constant $\bar x(i)$. Holding prices fixed (in the short run), this means that sector $i$ has a capacity constraint in terms of unit output. For the purposes of our model, the vector of capacity constraints $\bar x := (\bar x(i))_{i=1}^n$ can be any vector in $\RR^n_+$.

For each sector $i$, we modify the accounting identity {eq}`eq-sales` to

$$
x_i = \min 
    \left\{ \sum_{j=1}^n o_{ij} + d_i, \; \bar x(i) \right\},
$$ (eq-csales)

where $o_{ij}$ is the value of orders from sector $i$ made by sector $j$. Thus, if the capacity constraint in sector $i$ is not binding, then output is the sum of orders from other sectors and orders from final consumers. If $\bar x(i)$ is less than this sum, however, then sector $i$ produces to capacity $\bar x(i)$.

An equilibrium for this model is one where all orders are met, subject to capacity constraints. The fact that orders are met means that $o_{ij} = z_{ij} = a_{ij} x_j$. Substituting this equality into {eq}`eq-csales` and rewriting as a vector equality, {eq}`eq-csales` can equivalently be formulated as

$$
x = G x
    \quad \text{where} \quad
    G x := (A x + d) \wedge \bar x.
$$ (eq-cvsales)

The following exercise is key to solving the fixed point problem {eq}`eq-cvsales`.

```{exercise}
:label: ex-gkgk

Prove that, for any $x, y \in \RR^n_+$ and $k \in \NN$, we have

$$
|G x - G y| \leq A |x - y|.
$$ (eq-gky)
```


````{solution} ex-gkgk

Fix $x, y \in \RR^n_+$ and $k \in \NN$. By the inequalities in {ref}`sss-sets`, applied pointwise to vectors, we have

```{math}
:enumerated: false

|G x - G y|
        = | (A  x + d) \wedge \bar x - (A G y + d) \wedge \bar x|
        \leq | A x  + d - (A  y + d)|.
```

This proves the claim because, by {prf:ref}`ex-bmk`,

```{math}
:enumerated: false

| A x  + d - (A y + d)|
        = | A ( x-y)|
        \leq A |x-y|.
```
````


We are now ready to prove existence of a unique fixed point under the assumption that every sector has positive value added.

```{prf:proposition}
:label: p-gac

If {prf:ref}`a-pva` holds, then $G$ is globally stable in $\RR^n_+$. In particular, the constrained production model has a unique equilibrium $x^* \in \RR^n_+$.
```


```{prf:proof}
:nonumber:

As shown in {prf:ref}`ex-eara`, {prf:ref}`a-pva` yields $r(A) < 1$. Moreover, $A \geq 0$. Hence, by {prf:ref}`ex-gkgk` and {prf:ref}`p-cec`, $G$ is eventually contracting on $\RR_+$. In consequence, a unique equilibrium exists. ◻
```


```{prf:remark}

In {prf:ref}`p-gac`, the weaker conditions on production discussed in {ref}`sss-srsm` can be used in place of {prf:ref}`a-pva`, which requires positive value added in every sector. As explained in {ref}`sss-srsm`, for $r(A) < 1$ it is enough that value added is nonnegative in each sector and, in addition, every sector has an upstream supplier with positive value added.
```


### Fixed Points and Monotonicity

Banach's fixed point theorem and its extensions are foundations of many central results in pure and applied mathematics. For our purposes, however, we need to search a little further, since not all mappings generated by network models have the contraction property. In this section, we investigate two fixed point results that drop contractivity in favor of monotonicity.

#### Existence

Without contractivity, one needs to work harder to obtain even existence of fixed points, let alone uniqueness and convergence. This is especially true if the map in question fails to be continuous. If, however, the map is order preserving, then existence can often be obtained via some variation on the Knaster–Tarski fixed point theorem.

Here we present a version of this existence result that is optimized to our setting, while avoiding unnecessary excursions into order theory. In stating the theorem, we recall that a **closed order interval** in $\RR^n$ is a set of the form

```{math}
:enumerated: false

[a, b] := \setntn{x \in \RR^n}{a \leq x \leq b}
```

where $a$ and $b$ are vectors in $\RR^n$. Also, we call $(x_k) \subset \RR^n$ **increasing** (resp., **decreasing**) if $x_k \leq x_{k+1}$ (resp., $x_k \geq x_{k+1}$) for all $k$.

```{exercise}
:label: ex-opab

Let $[a, b]$ be a closed order interval in $\RR^n$ and let $G$ be an order-preserving self-map on $[a,b]$. Prove the following:

(i) $(G^k a)$ is increasing and $(G^k b)$ is decreasing.

(ii) If $x$ is a fixed point of $G$ in $[a,b]$, then $G^k a \leq x \leq G^k b$ for all $k \in \NN$.
```


```{solution} ex-opab

Since $G$ is a self-map on $[a,b]$, we have $Ga \in [a, b]$ and hence $a \leq G a$. As $G$ is order preserving, applying $G$ to this inequality yields $G a \leq G^2 a$. Continuing in this way (or using induction) proves that $(G^k a)$ is increasing. The proof for $(G^k b)$ is similar.

If $Gx = x$ for some $x \in [a,b]$, then, since $a \leq x$, we have $Ga \leq Gx = x$. Iterating on this inequality gives $G^k a \leq x$ for all $k$.
```


For a self-map $G$ on $S \subset \RR^n$, we say that $x^*$ is a **least fixed point** (resp., **greatest fixed point**) of $G$ on $S$ if $x^*$ is a fixed point of $G$ in $S$ and $x^* \leq x$ (resp., $x \leq x^*$) for every fixed point $x$ of $G$ in $S$. Finally, we say that $G$ is

- **continuous from below** if $x_k \uparrow x$ in $S$ implies $G x_k \uparrow G x$ in $S$.

- **continuous from above** if $x_k \downarrow x$ in $S$ implies $G x_k \downarrow G x$ in $S$.

Here $x_k \uparrow x$ means that $(x_k)$ is increasing and $x_k \to x$. The definition of $x_k \downarrow x$ is analogous. In the next theorem, $S := [a, b]$ is a closed order interval in $\RR^n$ and $G$ is a self-map on $S$.

```{prf:theorem}
:label: t-ktk

If $G$ is order-preserving on $S$, then $G$ has a least fixed point $x^*$ and a greatest fixed point $x^{**}$ in $S$. Moreover,

(i) if $G$ is continuous from below, then $G^k a \uparrow x^*$ and

(ii) if $G$ is continuous from above, then $G^k b \downarrow x^{**}$.
```


```{prf:remark}

As alluded to above, fixed point results for order preserving maps can be obtained in more general settings than the ones used in {prf:ref}`t-ktk` (see, e.g., {cite}`davey2002introduction`, Theorem 2.35). {prf:ref}`t-ktk` is sufficient for our purposes, given our focus on finite networks.
```


````{prf:proof}
:nonumber:

**Proof of {prf:ref}`t-ktk`.**

Under the stated conditions, existence of least and greatest fixed points $x^*$ and $x^{**}$ follow from the Knaster–Tarski fixed point theorem. (This holds because $[a, b]$ is a complete lattice. For a definition of complete lattices and a proof of the Knaster–Tarski theorem, see, e.g., {cite}`davey2002introduction`.)

Regarding claim (i), suppose that $G$ is continuous from below and consider the sequence $(x_k) := (G^k a)_{k \geq 1}$. Since $G$ is order-preserving (and applying {prf:ref}`ex-opab`), this sequence is increasing and bounded above by $x^*$. Since bounded monotone sequences in $\RR$ converge, each individual component of the vector sequence $x^k$ converges in $\RR$. Hence, by {prf:ref}`l-eqconvec`, the vector sequence $x^k$ converges in $\RR^n$ to some $\bar x \in [a, x^*]$. Finally, by continuity from below, we have

```{math}
:enumerated: false

\bar x 
        = \lim_k G^k a
        = \lim_k G^{k+1} a
        = G \lim_k G^k a
        = G \bar x,
```

so that $\bar x$ is a fixed point.

We have now shown that $(G^k a)$ converges up to a fixed point $\bar x$ of $G$ satisfying $\bar x \leq x^*$. Since $x^*$ is the least fixed point of $G$ in $S$, we also have $x^* \leq \bar x$. Hence $\bar x = x^*$.

The proof of claim (ii) is similar to that of claim (i) and hence omitted. ◻
````


```{prf:remark}

In the preceding theorem, $x^*$ and $x^{**}$ can be equal, in which case $G$ has only one fixed point in $S$.
```


```{exercise}
:label: ex-cppe

Consider the map $G x = (A x + d) \wedge \bar x$ from the constrained production model. In {ref}`sss-pwconst`, we showed that $G$ has a unique fixed point in $\RR^n_+$ when $r(A) < 1$. Show now that $G$ has at least one fixed point in $\RR^n_+$, even when $r(A)< 1$ fails. (Continue to assume that $A \geq 0$, $d \geq 0$ and $\bar x \geq 0$.)
```


```{solution} ex-cppe

Clearly $G$ is a self-map on $S := [0, \bar x]$. Since $A \geq 0$, we have $G x \leq G y$ for all $x, y \in S$. From this it follows easily that $G$ is order-preserving. {prf:ref}`t-ktk` now guarantees existence of at least one fixed point.
```


#### Du's Theorem

{prf:ref}`t-ktk` is useful because of its relatively weak assumptions. At the same time, it fails to deliver uniqueness. Hence its conclusions are considerably weaker than the results we obtained from contractivity assumptions in {ref}`ss-bcmt`.

In order to recover uniqueness without imposing contractivity, we now consider order-preserving maps that have additional shape properties. In doing so, we use the definition of concave and convex functions in {ref}`sss-conconfun`.

```{prf:theorem} Du
:label: t-du

Let $G$ be an order-preserving self-map on order interval $S = [a, b] \subset \RR^n$. In this setting, if either

(i) $G$ is concave and $G a \gg a$ or

(ii) $G$ is convex and $G b \ll b$,

then $G$ is globally stable on $S$.
```


A proof of {prf:ref}`t-du` was obtained in an more abstract setting in {cite}`du1990fixed`. Interested readers can consult that article for a proof.

To illustrate how these results can be applied, consider the constrained production model without assuming positive value added, so that $r(A) < 1$ is not enforced. In {prf:ref}`ex-cppe` we obtained existence. With {prf:ref}`t-du` in hand, we can also show uniqueness whenever $d \gg 0$ and $\bar x \gg 0$.

Indeed, we have already seen that $G$ is a self-map on $S := [0, \bar x]$ and, when this last condition holds, we have $G 0 = d \wedge \bar x \gg 0$. Hence the conclusions of {prf:ref}`t-du` will hold if we can establish that $G$ is concave.

```{exercise}
:label: ex-gic

Prove that $G$ is concave on $S$. [Hint: Review {ref}`sss-conconfun`.]
```


```{solution} ex-gic

By {prf:ref}`ex-prescon`, the minimum of two concave functions is concave. Since $Fx = \bar x$ and $H x = Ax + b$ are both concave, the claim holds.
```


Here is a small extension of Du's theorem that will prove useful soon:

```{prf:corollary}
:label: c-duext

Let $G$ be an order-preserving self-map on $S = [a, b]$. If $G$ is concave and there exists an $\ell \in \NN$ such that $G^\ell a \gg a$, then $G$ is globally stable on $S$.
```


```{prf:proof}
:nonumber:

Assume the conditions of {prf:ref}`c-duext`. Since compositions of increasing concave operators are increasing and concave, {prf:ref}`t-du` implies that $G^\ell$ is globally stable on $[a, b]$. Denote its fixed point by $\bar v$. Since $\{ G^m a \}_{m \in \NN}$ is increasing and since the subsequence $\{G^{m\ell} a\}_{m \in \NN}$ converges up to $\bar v$ as $m \to \infty$, we must have $G^m a \to \bar v$. A similar argument gives $G^m b \to \bar v$. For any $v \in [a, b]$ we have $G^m a \leq G^m v \leq G^m b$, so $G^m v \to \bar v$ as $m \to \infty$.

The last step is to show that $\bar v$ is the unique fixed point of $G$. From {prf:ref}`t-ktk`, we know that at least one fixed point exists. Now suppose $v \in [a, b]$ is such a point. Then $v = G^m v$ for all $m$. At the same time, $G^m v \to \bar v$ by the results just established. Hence $v = \bar v$. The proof is now complete. ◻
```


(s-finnet)=
## Financial Networks
Given the long history of crises in financial markets around the globe, economists and business analysts have developed many tools for assessing the credit-worthiness of banks and other financial institutions. After the major financial crises of 2007-2008, originating in the subprime market in the US and the sudden collapse of Lehmann Brothers, it became clear that the financial health of individual institutions cannot be assessed in isolation. Rather, it is essential to analyze solvency and credit-worthiness in terms of the entire network of claims and liabilities within a highly interconnected financial system. In this section, we review financial crises and apply network analysis to study how they evolve.

### Contagion

Some financial crises have obvious causes external to the banking sector. A prominent example is the hyperinflation that occurred in Weimar Germany around 1921–1923, which was driven by mass printing of bank notes to meet war reparations imposed under the Treaty of Versailles. Here the monetary authority played the central role, while the actions of private banks were more passive.

Other crises seem to form within the financial sector itself, driven by interactions between banks, hedge funds, and asset markets. In many cases, the crisis follows a boom, where asset prices rise and economic growth is strong. Typically, the seeds of the crisis are laid during this boom phase, when banks extend loans and firms raise capital on the basis of progressively more speculative business plans. At some point it becomes clear to investors that these businesses will fail to meet expectations, leading to a rush for the exit.

The last phase of this cycle is painful for the financial sector, since rapidly falling asset values force banks and other financial institutions to generate short-term capital by liquidating long-term loans, typically with large losses, as well as selling assets in the face of falling prices, hoarding cash and refusing to roll over or extend short term loans to other institutions in the financial sector. The financial crisis of 2007–2008 provides a textbook example of these dynamics.

One key aspect of the financial crisis of 2007–2008, as well as other similar crises, is **contagion**, which refers to the way that financial stress spreads across a network of financial institutions. If one institution becomes stressed, that stress will often spread to investors or counterparties to which this institution is indebted. The result of this process is not easy to predict, since, like equilibrium in the production networks studied in {prf:ref}`c-prod`, there is a tail chasing problem: stress spreads from institution $A$ to institutions $B$, $C$ and $D$, which may in turn increase stress on $A$, and so on.

In this section we study financial contagion, beginning with a now-standard model of default cascades.

(ss-defcas)=
### Default Cascades
Default cascades are a form of financial contagion, in which default by a node in a network leads to default by some of its counterparties, which then spreads across the network. Below we present a model of default cascades and analyze its equilibria.

#### Network Valuation

Consider a financial network $\gG = (V, E, w)$, where $V = \natset{n}$ is a list of $n$ financial institutions called *banks*, with an edge $(i, j) \in E$ indicating that $j$ has extended credit to $i$. The size of that loan is $w(i, j)$. Thus, an edge points in the direction of a liability, as in {numref}`f-network_liabfin_trans`: edge $(i, j)$ indicates a liability for $i$ and an asset for $j$. As in {ref}`ss-uwdg`, the set of all direct predecessors of $i \in V$ will be written as $\iI(i)$, while the set of all direct successors will be denoted $\oO(i)$.

Banks in the network have both internal and external liabilities, as well as internal and external assets. Internal (i.e., interbank) liabilities and assets are given by the weight function $w$, in the sense that $w(i,j)$ is a liability for $i$, equal to the size of its loan from $j$, and also an asset for $j$. Positive weights indicate the presence of counterparty risk: when $j$ holds an asset of book value $w(i, j)$, whether or not the loan is repaid in full depends on the stress placed on bank $i$ and rules that govern repayment in the event of insolvency.

We use the following notation for the primitives of the model: $x_i := \sum_{j \in \oO(i)} w(i, j)$ is total interbank liabilities of bank $i$,

$$
\Pi_{ij} := 
    \begin{cases}
        w(i, j) / x_i & \text{ if } x_i > 0 \\
        0 & \text{ otherwise}
    \end{cases}
$$ (eq-defpi)

is the matrix of relative interbank liabilities, $a_i$ is external assets held by bank $i$ and $d_i$ is external liabilities.

When considering the interbank assets of bank $j$, we need to distinguish between the book value $\sum_{i \in \iI(j)} w(i, j)$ of its claims on other banks and the realized value in the face of partial or complete default by its counterparties $\iI(j)$. To this end, we introduce a clearing vector $p \in \RR^n_+$, which is a list of proposed payments by each bank in the network. In particular, $p_i$ is total payments made by bank $i$ to its counterparties within the banking sector. Under the choice of a particular clearing vector, the actual payments received by bank $j$ on its internal loan portfolio are $\sum_{i \in V} p_i \Pi_{ij}$.

The last statement is an assumption about the legal framework for the banking sector. It means that the actual payment $p_i \Pi_{ij}$ from $i$ to $j$ is proportional to the amount that $i$ owes $j$, relative to its total interbank obligations. The idea is that all counterparties in the banking sector have equal seniority, so that residual funds are spread across claimants according to the relative size of the claims.

Let $\hat p_j$ be the amount of funds bank $j$ makes available to repay all of its debts, both interbank and external. This quantity is

$$
\hat p_j =
   \min
   \left\{
       a_j + \sum_{i \in V} p_i \Pi_{ij}, \; d_j + x_j
   \right\}.
$$ (eq-qj)

The right hand term inside the $\min$ operator is total debts of bank $j$. The left hand side is the amount on hand to repay those debts, including external assets and repayments by other banks. The bank repays up to—but not beyond—its ability to pay.

External liabilities are assumed to be senior to interbank liabilities, which means that for bank $j$ we also have

$$
p_j = \max\{\hat p_j - d_j, \; 0\}.
$$ (eq-pj)

Thus, interbank payments by $j$ are a remainder after external debts are settled. If these debts exceed the bank's ability to pay, the bank becomes insolvent and pays nothing to internal creditors. This is a form of limited liability.

Combining {eq}`eq-qj` and {eq}`eq-pj` and rearranging slightly yields

```{math}
:enumerated: false

p_j = \max
    \left\{
       \min
       \left\{
           a_j - d_j + \sum_{i \in V} p_i \Pi_{ij}, \; x_j
       \right\}, \; 0
    \right\}
```

Now let's take $p$, $a$, $d$ and $x$ as row vectors in $\RR^n$ and write this collection of equations, indexed of $j$, in vector form. With $\max$ and $\min$ taken pointwise, and using the symbols $\vee$ and $\wedge$ for max and min, we get

$$
p = ((a - d + p\Pi) \wedge x) \vee 0.
$$

A solution to this equation is called an **equilibrium clearing vector** for the banking system.

```{prf:remark}

An equilibrium clearing vector captures impacts of contagion within the specified banking system, in the sense that it traces out the full network effects of interbank lending within the model. We shall study this equilibrium, while also recognizing that the model is restrictive in the sense that it assumes a specific form for seniority and implicitly rules out some kinds of nonlinear phenomena. We return to this theme in {ref}`ss-echs`.
```


#### Existence and Uniqueness of Fixed Points

In order to analyze existence and uniqueness of equilibria, we introduce the operator $T \colon \RR^n \to \RR^n$ defined by

$$
Tp = ((e + p\Pi) \wedge x) \vee 0,
$$

where $e := a - d$ represents net external assets. Evidently $p \in \RR^n_+$ is an equilibrium clearing vector if and only if it is a fixed point of $T$.

```{exercise}
:label: ex-fpms-auto-6

Prove that the operator $T$ is continuous on $\RR^n$.
```


````{solution} ex-fpms-auto-6

In essence, this holds because compositions of continuous functions are continuous. Nonetheless, here is a more explicit proof: Recalling the inequalities in {ref}`sss-sets`, applied pointwise to vectors, we have, for any $p, q \in \RR^n$,

```{math}
:enumerated: false

|Tp - Tq|
         \leq | (e + p\Pi) \wedge x) - (e + q\Pi) \wedge x) |
         \leq | (p - q) \Pi |.
```

Since, for the Euclidean norm, $\| |u| \| = \| u\|$ and $u, v \geq 0$ with $u \leq v$ implies $\| u \| \leq \| v\|$, we then have $\|Tp - Tq\| \leq \| (p - q) \Pi \| \leq \| p - q \| \| \Pi \|_o$. It follows easily that if $\| p_n - p \| \to 0$, then $\|Tp_n - Tp\| \to 0$ also holds.
````


Using this operator, establishing existence of at least one equilibrium clearing vector is not problematic for this model, regardless of the values of the primitives and configuration of the network:

```{exercise}
:label: ex-fpms-auto-7

Show that the banking model described above always has at least one equilibrium clearing vector. What else can you say about equilibria in this general case?
```


```{solution} ex-fpms-auto-7

Since $\Pi \geq 0$, we always have $p \Pi \leq q \Pi$ whenever $p \leq q$. As a result, $p \mapsto a - d + p \Pi$ is order-preserving and hence so is $T$. Moreover, for any $p \in S := [0, x]$, we have $Tp \in S$. Hence, by {prf:ref}`t-ktk`, $T$ has a fixed point in $S$.

What else can we say about equilibria in this setting? By the same theorem, $T$ has a least fixed point $p^*$ and a greatest fixed point $p^{**}$ in $S$. Moreover, since $T$ is continuous, $T^k 0 \uparrow p^*$ and $T^k x \downarrow p^{**}$.
```


While existence is automatic in this model, uniqueness is not:

````{prf:example}

If $n=2$, $e=(0, 0)$ and $(1, 1)$ and $\Pi = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$, then $Tp = p$ is equivalent to

```{math}
:enumerated: false

\begin{pmatrix}
           p_1 \\
           p_2
        \end{pmatrix}
         = 
            \begin{pmatrix}
                p_2 \\
                p_1
            \end{pmatrix}
            \wedge
            \begin{pmatrix}
                1 \\
                1
            \end{pmatrix}.
```

Both $p = (1, 1)$ and $p=(0, 0)$ solve this equation.
````


There are several approaches to proving uniqueness of fixed points of $T$. Here is one:

```{exercise}
:label: ex-ufptr

Prove that $T$ is globally stable on $S := [0, x]$ whenever $r(\Pi) < 1$.[^2]
```


````{solution} ex-ufptr

Fix $p, q \in S$. Using the inequalities for min and max in {ref}`sss-sets`, applied pointwise, we have

```{math}
:enumerated: false

|Tp - Tq| 
        \leq |e + p \Pi - (e + q\Pi)|
        = |(p-q) \Pi|
        \leq |p-q| \Pi
```

After transposing both sides of this equation, we see that, when $r(\Pi)<1$, the conditions of of {prf:ref}`p-cec` hold. The result follows. (If you prefer, instead of taking transposes, just use the proof of {prf:ref}`p-cec` directly, modified slightly to use the fact that we are operating on row vectors.)
````


This leads us to the following result:

```{prf:proposition}
:label: p-fnw

Let $\gG$ be a financial network. If, for each bank $i \in V$, there exists a bank $j \in V$ with $i \to j$ and such that $j$ has zero interbank liabilities, then $T$ is globally stable on $S$ and $\gG$ has a unique equilibrium clearing vector.
```


```{prf:proof}
:nonumber:

By construction, the matrix $\Pi$ is substochastic. Suppose that $\Pi$ is also weakly chained substochastic. Then, by {prf:ref}`p-wcs`, we have $r(\Pi)<1$ and, by {prf:ref}`ex-ufptr`, $T$ is globally stable on $S$. Hence the proof will be complete if we can show that, under the stated conditions, $\Pi$ is weakly chained substochastic.

To see that this is so, let $\gG$ be a financial network that satisfies the conditions of {prf:ref}`p-fnw`. Now fix $i \in V$. We know that there exists a bank $j \in V$ with $i \to j$ and $j$ has no interbank liabilities. If $w(i,j) > 0$, then $\Pi_{ij} > 0$, so $i \to j$ under digraph $\gG$ implies $i \to j$ in the digraph induced by the substochastic matrix $\Pi$. Also, since $j$ has no interbank liabilities, we have $x_j = 0$, and hence row $j$ of $\Pi$ is identically zero. In particular, $\sum_k \Pi_{jk} = 0$. Hence $\Pi$ is weakly chained substochastic, as required. ◻
```


```{prf:remark}

The proof of {prf:ref}`p-fnw` also shows that $T$ is eventually contracting, so we can compute the unique fixed point by taking the limit of $T^k p$ for any choice of $p \in S$.
```


There are several possible assumptions about the structure of the bank network $\gG$ that imply the conditions of {prf:ref}`p-fnw`. For example, it would be enough that $\gG$ is strongly connected and has at least one bank with zero interbank liabilities. Below we investigate another sufficient condition, related to cyclicality.

```{exercise}
:label: ex-fpms-auto-8

Let $\gG$ be a financial network. Show that $\gG$ has a unique equilibrium clearing vector whenever $\gG$ is a directed acyclic graph.
```


```{solution} ex-fpms-auto-8

Let $\gG = (V, E, w)$ be a financial network and a directed acyclic graph. By {prf:ref}`p-fnw`, it suffices to show that, for each bank $i \in V$, there exists a bank $j \in V$ with $i \to j$ and such that $j$ has zero interbank liabilities. To this end, fix $i \in V$. By the directed acyclic graph property, we know that there exists a $j \in V$ with $i \to j$ and $\oO(j)=0$. But if $\oO(j)=0$, then $j$ has no interbank liabilities. The claim follows.
```


(sss-nee)=
#### Nonnegative External Equity
In this section we investigate the special case in which

(E1) each bank has nonzero interbank debt, so that $\Pi$ is a stochastic matrix, and

(E2) external net assets are nonnegative, in the sense that $e = a - d \geq 0$.

In view of (E1), we cannot hope to use {prf:ref}`p-fnw`, since we always have $r(\Pi)=1$ when $\Pi$ is stochastic. Nonetheless, we can still obtain global stability under certain restrictions on $e$ and the topology of the network. Here is a relatively straightforward example, which we will later try to refine:

```{exercise}
:label: ex-fnee

Let $\gG$ be a financial network such that (E1)–(E2) hold. Using Du's theorem, prove that $T$ has a unique fixed point in $S := [0, x]$ whenever $e \gg 0$.
```


````{solution} ex-fnee

Let $\gG$ be a financial network such that (E1)–(E2) hold. Since $e \gg 0$, we have

```{math}
:enumerated: false

p \in S 
        \quad \implies \quad
        Tp := ((e + p\Pi) \wedge x) \vee 0 = (e + p\Pi) \wedge x .
```

By an argument identical to that employed for {prf:ref}`ex-gic`, $T$ is a concave operator on $S = [0, x]$. Evidently $T$ is order preserving. Finally, by (E1), we have $x_i > 0$ for all $i$, so $x \gg 0$ and hence $T0 = e \wedge x \gg 0$. It now follows directly from Du's theorem that $T$ has a unique fixed point in $S$.
````


The condition $e \gg 0$ is rather strict. Fortunately, it turns out that we can obtain global stability under significantly weaker conditions. To this end, we will say that node $j$ in a financial system $\gG$, is *cash accessible* if there exists an $i \in V$ such that $i \to j$ and $e(i) > 0$. In other words, $j$ is downstream in the liability chain from at least one bank with positive net assets outside of the banking sector.

```{exercise}
:label: ex-enca

Prove the following result: If (E1)–(E2) hold and every node in $\gG$ is cash-accessible, then $T^k 0 \gg 0$ for some $k \in \NN$. [This is a relatively challenging exercise.]
```


````{solution} ex-enca

Let $\gG$ be such that every node is cash-accessible. Set

```{math}
:enumerated: false

\delta 
        := \frac{1}{n^2} 
        \cdot \min 
        \left\{
            \setntn{x_i}{i \in V} \cup \setntn{e_i}{i \in V \, \st e_i > 0}
        \right\}.
```

Let $\hat e$ be defined by $\hat e_i = 1$ if $e_i > 0$ and zero otherwise. We claim that, for all $m \leq n$,

$$
T^m 0 
        \geq \delta (\hat e + \hat e \Pi + \cdots + \hat e \Pi^{m-1}).
$$ (eq-phikprop)
This holds at $m=1$ because $T 0 = e \wedge x \geq \delta \hat e$. Now suppose {eq}`eq-phikprop` holds at some $m \leq n - 1$. Then, since $T$ is order-preserving, we obtain

```{math}
:enumerated: false

\begin{aligned}
T^{m+1} 0 
        & \geq (\delta (\hat e + \hat e \Pi + \cdots + \hat e \Pi^{m-1}) \Pi +
        e) \wedge x
        \\
        & \geq (\delta (\hat e + \hat e \Pi + \cdots + \hat e \Pi^m) ) \wedge
        x
\end{aligned}
```

Since $\hat e + \hat e \Pi + \cdots + \hat e \Pi^m \leq n^2 \1$, where $\1$ is a vector of ones, and since $(\delta n^2 \1) \leq x$ by the definition of $\delta$, we have $T^{m+1} 0 \geq \delta (\hat e + \hat e \Pi + \cdots + \hat e \Pi^m)$. This argument confirms that {eq}`eq-phikprop` holds for all $m \leq n$.

We now claim that $T^n 0 \gg 0$. In view of {eq}`eq-phikprop`, it suffices to show that, for any $j \in V$, there exists a $k < n$ with $(\hat e \Pi^k) (j) = \sum_{i \in V} \hat e_i \Pi^k_{ij} > 0$. Since every node in $S$ is cash accessible, we know there exists an $i \in V$ with $e_i > 0$ and $j$ is accessible from $i$. For this $i$ we can choose $k \in \NN$ with $k < n$ and $\Pi^k_{ij} =  \hat e_i \Pi^k_{ij} > 0$. We conclude that $T^n 0 \gg 0$, as claimed.
````


With the result from {prf:ref}`ex-enca` in hand, the next lemma is easy to establish.

```{prf:lemma}
:label: l-cfpc

If (E1)–(E2) hold and every node in $\gG$ is cash accessible, then $T$ is globally stable and $\gG$ has a unique clearing vector $p^*\gg 0$.
```


```{prf:proof}
:nonumber:

Let $\gG$ be as described. By {prf:ref}`c-duext`, it suffices to show that $T$ is an order-preserving concave self-map on $[0,x]$ with $T^k 0 \gg 0$ for some $k \in \NN$. The solution to {prf:ref}`ex-fnee` shows that $T$ is order-preserving and concave. The existence of a $k \in \NN$ with $T^k 0 \gg 0$ was verified in {prf:ref}`ex-enca`. ◻
```


Stronger results are available, with a small amount of effort. In fact, under (E1)–(E2), there is a strong sense in which uniqueness of the fixed point is obtained without any further assumptions, provided that we rule out an ambiguity related to what happens when $e=0$. That ambiguity is discussed in the next exercise and further references can be found in {ref}`s-cnfp`.

```{exercise}
:label: ex-amben

Conditions (E1) and (E2) cannot by themselves pin down outcomes for the extreme case where every firm in the network has zero net external assets. Illustrate this with an example.[^3]
```


```{solution} ex-amben

Let $\psi$ be a stationary distribution for $\Pi$. Suppose $\lambda$ is a constant in $[0,1]$, $p = \lambda \psi$ and $x = \psi$. Then $e=0$ implies $T p = (e + \lambda \psi \Pi) \wedge x = (\lambda \psi) \wedge \psi = \lambda \psi = p$. Since $\lambda$ was arbitrary in $[0,1]$, there is a continuum of equilibria.
```


Although {prf:ref}`ex-amben` suggests ambiguity about outcomes when $e = 0$, it is natural to adopt the convention that the equilibrium clearing vector $p^*$ obeys $p^*=0$ whenever $e=0$. If the entire banking sector has no zero net assets, then no positive payment sequence can be initiated (without outside capital).

In the next exercise, we say that $U \subset V$ is accessible from $i \in V$ if there exists a $j \in U$ such that $j$ is accessible from $i$.

```{exercise}
:label: ex-fpms-auto-9

Let $P$ be the set of all nodes in $V$ that are cash accessible. Let $A$ be all $i$ in $P^c$ such that $P$ is accessible from $i$. Let $N$ be all $i$ in $P^c$ such that $P$ is not accessible from $i$. Note that $V = P \cup A \cup N$ and that these sets are disjoint. Show that $N$ and $P$ are both absorbing sets.
```


```{solution} ex-fpms-auto-9

The set $N$ is an absorbing set, since, by definition, $P$ is not accessible from $N$, and $A$ cannot be accessible because otherwise $P$ would also be accessible. The set $P$ is also absorbing because, if $j \in P^c$ is accessible from some $i \in P$, then $j$ is cash accessible. But then $j \in P$, which is a contradiction.
```


(ss-echs)=
### Equity-Cross Holdings
In this section we analyze the model of default cascades constructed by {cite:p}`elliott2014financial`. The model differs from the one studied in {ref}`ss-defcas` in several ways. One is that financial institutions are linked by share cross-holdings: firm $i$ owns a fraction $c_{ij}$ of firm $j$ for $i, j \in V := \natset{n}$. This implies that failure of firm $j$ reduces the market value of firm $i$, which in turn reduces the market value of other firms, and so on.

The second—and ultimately more significant—difference is the introduction of failure costs that add significant nonlinearities to the model. Failure costs reinforce the impact of each firm failure, leading to greater shock propagation across the network. This feature ties into the intuitive idea that, when many firms are financially stressed, a failure by one firm can trigger a wave of bankruptcies.

#### Book and Market Value

We now describe the features of the model. Let $C = (c_{ij})_{i, j \in V}$ be the matrix of fractional cross-holdings, as mentioned above, with $0 \leq c_{ij} \leq 1$ for all $i,j$.

```{prf:assumption}
:label: a-cv

The matrix of cross-holdings satisfies $\sum_k c_{ki} < 1$ for all $i \in V$.
```


{prf:ref}`a-cv` implies that firms are not solely owned by other firms in the network: investors outside the network hold at least some fraction of firm $i$ for all $i$.

The **book value** of firm $i$ is given by

$$
b_i = e_i + \sum_j c_{ij} b_j
    \qquad (i \in V).
$$ (eq-bvwo)

Here the first term $e_i \geq 0$ is external assets of firm $i$ and the second represents the value of firm $i$'s cross-holdings. In vector form, the last equation becomes $b = e + C b$.

```{exercise}
:label: ex-fpms-auto-10

Let $I$ be the $n \times n$ identity. Prove that, under {prf:ref}`a-cv`, the matrix $I - C$ is invertible and the equation $b = e + C b$ has the unique solution

$$
b = (I - C)^{-1} e.
$$ (eq-bv)
Prove also that $b \geq 0$.
```


```{solution} ex-fpms-auto-10

Since $C \geq 0$, {prf:ref}`l-rscsbounds`, we have $r(C) \leq \max_j \csum_j(C)$. In view of {prf:ref}`a-cv`, this maximum is strictly less than one. Hence $r(C) < 1$ and, by the Neumann series lemma $I-C$ is invertible and $(I-C)^{-1} = \sum_{k \geq 0} C^k$. The last equality implies $b \geq 0$ when $b = (I - C)^{-1} e$.
```


```{exercise}
:label: ex-fpms-auto-11

Provide a weaker condition on $C$ such that $I - C$ is invertible.
```


```{solution} ex-fpms-auto-11

Consider the condition $\sum_{i \in V} c_{ij} \leq 1$ for all $j \in V$, with strict inequality for at least one $j$. Since $C \geq 0$, this implies that $C^\top$ is weakly chained substochastic, by {prf:ref}`ex-awcs`. Hence $r(C) = r(C^\top)<1$, by {prf:ref}`p-wcs`. Hence $I-C$ is invertible, by the Neumann series lemma.
```


There is a widely used argument that cross-holdings artificially inflate the value of firms, in the sense that the sum of book values of firms exceeds $\sum_i e_i$, the sum of underlying equity values. The next exercise illustrates:

```{exercise}
:label: ex-fpms-auto-12

Show that $e \gg 0$ and $\min_{i,j} c_{ij} > 0$ implies $\sum_i b_i > \sum_i e_i$.
```


````{solution} ex-fpms-auto-12

We have

```{math}
:enumerated: false

\sum_i b_i 
        = \1' b
        = \1' e + \1' C e + \1' C^2 e + \cdots
        \geq \1' e + \1' C e.
```

Hence it suffices to show that $\1' C e > 0$. This will be true if at least one column of $Ce$ has a nonzero entry. Since $e \gg 0$, we require only that $c_{ij} > 0$ for some $i,j$, which is true by assumption.
````


Due to this artificial inflation, we distinguish between the book value $b_i$ of a firm and its **market value** $\bar v_i$, which is defined as $r_i b_i$ with $r_i := 1 - \sum_{k} c_{ki}$. The value $r_i$, which gives the share of firm $i$ held by outsider investors, is strictly positive for all $i$ by {prf:ref}`a-cv`. With $R := \diag(r_1, \ldots, r_n)$, we can write the vector of market values as $\bar v = R b$. Substituting in {eq}`eq-bv` gives

$$
\bar v := A e ,
        \quad \text{where} \quad
        A : =R (I - C)^{-1}.
$$ (eq-bv2)

#### Failure Costs

So far the model is very straightforward, with the market value of firms being linear in external assets $e$. However, since bankruptcy proceedings are expensive, it is reasonable to assume that firm failures are costly. Moreover, when the market value of a firm falls significantly, the firm will experience difficulty raising short term funds, and will often need to cease revenue generating activities and sell illiquid assets well below their potential value.

We now introduce failure costs. As before, $\bar v_i$ is market value without failure costs, as determined in {eq}`eq-bv2`, while $v_i$ will represent market value in the presence of failure costs. Failure costs for firm $i$ are modeled as a threshold function

```{math}
:enumerated: false

f(v_i) = \beta \1\{v_i < \theta \bar v_i\}
    \qquad (i = 1, \ldots, n),
```

where $\theta \in (0, 1)$ and $\beta > 0$ are parameters. Thus, costs are zero when $v_i$ is large and $-\beta$ when they fall below the threshold $\theta \bar v_i$. In particular, a discrete failure cost of $-\beta$ is incurred when firm value falls far enough below the no-failure market value $\bar v_i$. The larger is $\theta$, more prone firms are to failure.

The book value of firm $i$ without failure costs was defined in {eq}`eq-bvwo`. The book value of firm $i$ in the presence of failure costs is defined as

```{math}
:enumerated: false

b_i = e_i + \sum_j c_{ij} b_j - f(v_i).
```

Written in vector form, with $f$ applied pointwise to the vector $v$, we get $b = e + C b - f (v)$. Solving for $b$ gives $b = (I-C)^{-1} (e - f (v))$. The corresponding market value is

$$
v = R b = A (e - f(v)).
$$ (eq-sfv)

Notice that, when no firms fail, we have $v_i = \bar v_i$, as expected.

#### Equilibria

Equation {eq}`eq-sfv` is a nonlinear equation in $n$ unknowns. A vector $v \in \RR^n$ solves {eq}`eq-sfv` if and only if it is a fixed point of the operator $T \colon \RR^n \to \RR^n$ defined by

$$
Tv = A (e - f(v)).
$$ (eq-tsfv)

In what follows we set $d := A(e - \beta \1)$ and $S := [d, \bar v]$.

```{prf:proposition}
:label: p-ec

$T$ is a self-map on $S$ with least fixed point $v^*$ and greatest fixed point $v^{**}$ in $S$. Moreover,

(i) the sequence $(T^k d)_{k \in \NN}$ converges up to $v^*$ in a finite number of steps and

(ii) the sequence $(T^k \bar v)_{k \in \NN}$ converges down to $v^{**}$ in a finite number of steps.
```


Note that $v^* = v^{**}$ is a possibility, in which case $T$ has a unique fixed point in $S$.

```{exercise}
:label: ex-pfo

Prove the first claim (first sentence) in {prf:ref}`p-ec`.
```


````{solution} ex-pfo

Observe that $v_i \leq v'_i$ implies $f(v_i) \geq f(v'_i)$. As a result, the vector-valued map $v \mapsto - f(v)$ is order-preserving, and hence so is $T$. Moreover, for $v \in [d, \bar v]$, we have

```{math}
:enumerated: false

d = A(e - \beta \1) \leq Tv := A (e - f(v)) \leq A e = \bar v,
```

so $T$ is a self-map on $[d , \bar v]$. It follows directly from {prf:ref}`t-ktk` that $T$ has a least and greatest fixed point in $S$.
````


Why does $(T^k d)_{k \in \NN}$ converge up to $v^*$ in a finite number of steps? First, as you saw in the solution to {prf:ref}`ex-pfo`, the map $T$ is an order-preserving self-map on $[d, \bar v]$, so $Td \in [d, \bar v]$. In particular, $d \leq Td$. Iterating on this inequality and using the order-preserving property gives $d \leq Td \leq T^2 d \leq \cdots$, so $(T^k d)$ is indeed increasing. Moreover, the range of $T$ is a finite set, corresponding to all vectors of the form

```{math}
:enumerated: false

u = A(e - \beta w),
```

where $w$ is an $n$-vector containing only zeros and ones. Finiteness holds because there are only finitely many binary sequences of length $n$.

```{exercise}
:label: ex-fpms-auto-13

Given the above facts, prove that $(T^k d)_{k \in \NN}$ converges up to $v^*$ in a finite number of steps.
```


````{solution} ex-fpms-auto-13

First, $v_k := T^k d$ is increasing, as just discussed. Second, this sequence can take only finitely many values, since $T$ has finite range. As $(v_k)$ is increasing, it cannot cycle, so it must converge in finitely many steps. Let $v'$ be this limiting value and let $K$ be the number of steps required for $(v_k)$ to attain $v'$. Since $v_k = v'$ for all $k \geq K$, we have

```{math}
:enumerated: false

T v' = T T^K v' = T^{K+1} v' = v',
```

so $v'$ is a fixed point of $T$ in $S$. Moreover, if $v''$ is any other fixed point of $T$ in $S$, then $d \leq v''$ and hence, by the order-preserving property, $v_k = T^k d \leq T^k v'' = v''$ for all $k$. Hence $v' \leq v''$. Thus, $v'$ is the least fixed point of $T$.
````


Similar logic can be applied to prove that $(T^k \bar v)_{k \in \NN}$ converges down to $v^{**}$ in a finite number of steps.

If we set $v^0 = \bar v$ and $v^{k+1} = T v^k$, we can consider the sequence of valuations $(v^k)$ as a dynamic process, and the number of currently failing firms $m^k := \sum_i \1\{v^k_i < \theta\}$ can be understood as tracking waves of bankruptcies. Failures of firms in the first wave put stress on otherwise healthy firms that have exposure to the failed firms, which in turn causes further failures and so on.

```{exercise}
:label: ex-fpms-auto-14

Prove that the sequence $(m_k)$ is monotone increasing.
```


As discussed in {prf:ref}`p-ec`, the sequence $(v^k)$, which can also be written as $(T^k \bar v)$, is decreasing pointwise. In other words, the value of each firm is non-increasing. Hence, if $v^k_i < \theta$ for some $k$, then $v^{k+j}_i < \theta$ for all $j \geq 0$.

{numref}`f-fin_network_sims_1` illustrates a growing wave of failures that can arise in a financial network. Firms with lighter colors have better balance sheets. Black firms have failed. The code for generating this figure, along with details on parameters, can be found in the code book.

```{figure} figures/fin_network_sims_1.svg
:name: f-fin_network_sims_1

Waves of bankruptcies in a financial network
```

(s-cnfp)=
## Chapter Notes
{cite}`shin2010risk` gives an excellent overview of systemic risk and the financial crisis of 2007–2008. {cite}`battiston2012debtrank` study connectedness in financial networks and introduce a measure of systemic impact called DebtRank. {cite}`bardoscia2015debtrank` provide a dynamic theory of instability related to DebtRank. {cite}`demange2018contagion` provides a threat index for contagion in financial networks related to Katz centrality. {cite}`bardoscia2019forward` analyze risks associated with solvency contagion during crises. {cite}`jackson2019investment` study investment in risky portfolios by banks in financial networks with debt and equity interdependencies. {cite}`jackson2020credit` analyze optimal bailouts in financial networks. {cite}`amini2020clearing` offer an introduction to modeling of clearing systems, analyzing equilibria for network payments and asset prices. {cite}`jackson2021systemic` provide a survey of the relationship between financial networks and systemic risk.

The setting in {ref}`sss-nee` was investigated by {cite}`eisenberg2001systemic`, one of the first papers on a network approach to default cascades. Additional details on stability properties can be found in {cite}`stachurski2022systemic`. As already mentioned, {ref}`ss-echs` is based on {cite:p}`elliott2014financial`, which also includes an interesting discussion of how the level of integration across a network affects equilibria. {cite}`klages2021optimal` discuss optimal intervention in economic networks via influence maximization methods, using {cite}`elliott2014financial` as an example. {cite}`acemoglu2021systemic` study how anticipation of future defaults can result in "credit freezes.\"

A general discussion of contraction maps and related fixed point theory can be found in {cite}`goebel1990topics` and {cite}`cheney2013analysis`. For more on fixed point methods for order preserving operators, see, for example, {cite}`guo2004partial`, {cite}`zhang2012variational`, {cite}`marinacci2019unique` or {cite}`deplano2020nonlinear`.

[^1]: Hint: {prf:ref}`t-bfpt` is self-improving: it implies this seemingly stronger result. The proof is not trivial but see if you can get it started. You might like to note that $F^k$ has a unique fixed point $u^*$ in $S$. (Why?) Now consider the fact that $\| F u^*- u^* \| = \| F F^{nk} u^*- u^*\|$ for all $n \in \NN$.

[^2]: Here's a hint, if you get stuck: show that $r(\Pi) < 1$ implies $T$ is an eventual contraction on $[0, x]$ using one of the propositions presented in this chapter.

[^3]: Hint: every stochastic matrix has at least one stationary distribution.
