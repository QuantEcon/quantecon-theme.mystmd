---
title: "Markov Chains and Networks"
label: c-mcs
---

Markov chains evolving on finite sets are a foundational class of stochastic processes. These processes have been employed in quantitative economics to study stochastic systems ranging from labor income to harvest outputs, firm productivity, stock prices, unemployment dynamics, policy regimes, interest rates, and social mobility. Fortunately, we are now well placed to study Markov chains, since such chains are most naturally viewed as a special kind of weighted digraph. Moreover, graph-theoretic properties such as connectedness and periodicity are key determinants of their dynamics. In this chapter we investigate these ideas.

(s-amcs)=
## Markov Chains as Digraphs
We begin with fundamental definitions and then investigate dynamics.

(sss-reps)=
### Markov Models
A **finite Markov model** is a weighted directed graph $\mM = (S, E, p)$, where $S$ is the (finite) set of vertices, $E$ is the set of edges and $p$ is the weight function, with the additional restriction that

$$
\sum_{y \, \in \, \oO(x)} p(x, y) = 1
    \quad \text{for all } x \in S.
$$ (eq-sto)

{numref}`f-rich_poor` presented an example of such a digraph.

The set of vertices $S$ of a finite Markov model $\mM = (S, E, p)$ is also called the **state space** of the model, and vertices are called **states**. The two standard interpretations are

(i) $S$ is a set of possible states for some random element (the state) and the weight $p(x, y)$ represents the probability that the state moves from $x$ to $y$ in one step.

(ii) $S$ is a set of possible values for some measurement over a large population (e.g., hours worked per week measured across a large cross-section of households) and $p(x, y)$ is the fraction of agents that transition from state $x$ to state $y$ in one unit of time.

These two perspectives are related in ways that we explore below.

#### Transition Matrices

If $\mM$ is a finite Markov model, then the restriction {eq}`eq-sto` is equivalent to the statement that the adjacency matrix associated with $\mM$ is stochastic (see {ref}`sss-stochmat` for the definition). Identifying $S = \{\text{poor}, \text{middle}, \text{rich}\}$ with $\{1, 2, 3\}$, the adjacency matrix for this weighted digraph is

$$
P_a = 
    \begin{pmatrix}
        0.9 & 0.1 & 0.0 \\
        0.4 & 0.4 & 0.2 \\
        0.1 & 0.1 & 0.8 
    \end{pmatrix}
$$ (eq-pia)

Since $P_a \geq 0$ and rows sum to unity, $P_a$ is stochastic as required. In the context of finite Markov models, the adjacency matrix of $\mM$ is also called the **transition matrix**.

Regarding notation, when $S$ has typical elements $x, y$, it turns out to be convenient to write elements of the transition matrix $P$ as $P(x, y)$ rather than $P_{ij}$ or similar. We can think of $P$ as extending the weight function $p$ from $E$ to the set of all $(x,y)$ pairs in $S \times S$, assigning zero whenever $(x,y) \notin E$. As such, for every possible choice of $(x,y)$, the value $P(x,y)$ represents the probability of transitioning from $x$ to $y$ in one step.

The requirement that $P$ is stochastic can now be written as $P \geq 0$ and

$$
\sum_{y \in S}  P(x, y) = 1 \text{ for all } x \in S.
$$ (eq-psum1)

The restriction in {eq}`eq-psum1` just says that the state space is "complete:" after arriving at $x \in S$, the state must now move to some $y \in S$.

Using notation from {ref}`ss-spt`, to say that $P$ is stochastic is the same as requiring that each row of $P$ is in $\dD(S)$.

```{prf:example}
:label: eg-quah

A Markov model is estimated in the international growth dynamics study of {cite}`quah1993empirical`. The state is real GDP per capita in a given country relative to the world average. Quah discretizes the possible values to 0–1/4, 1/4–1/2, 1/2–1, 1–2 and 2–$\infty$, calling these states 1 to 5 respectively. The transitions are over a one year period. Estimated one step transition probabilities are represented as a weighted digraph in {numref}`f-quah_graph`, where

- $S = \{1, \ldots, 5\}$ is the state space

- the set of edges $E$ is represented by arrows and

- transition probabilities are identified with weights attached to these edges.
```


```{figure} figures/tikz_quah_graph.svg
:name: f-quah_graph

Cross-country GDP dynamics as a digraph
```

The transition matrix for the Markov model in {prf:ref}`eg-quah` is

$$
P_Q =
    \left(
      \begin{array}{ccccc}
        0.97 & 0.03 & 0.00 & 0.00 & 0.00 \\
        0.05 & 0.92 & 0.03 & 0.00 & 0.00 \\
        0.00 & 0.04 & 0.92 & 0.04 & 0.00 \\
        0.00 & 0.00 & 0.04 & 0.94 & 0.02 \\
        0.00 & 0.00 & 0.00 & 0.01 & 0.99
      \end{array}
    \right)
$$ (eq-pq)

Note the large values on the principal diagonal of $P_Q$. These indicate strong persistence: the state stays constant from period to period with high probability.

{cite}`quah1993empirical` estimated $P_Q$ by maximum likelihood, pooling transitions over the years 1960–1984. (In this case maximum likelihood estimation amounts to recording the relative frequency of transitions between states.) {numref}`f-quah_graph_2` shows how the numbers change if we repeat the exercise using World Bank GDP data from 1985–2019. The numbers are quite stable relative to the earlier estimate. Below we will examine how long run predictions are affected.

```{figure} figures/tikz_quah_graph_2.svg
:name: f-quah_graph_2

Cross-country GDP dynamics as a digraph, updated data
```

As another example, {cite}`benhabib2019wealth` estimate the following transition matrix for intergenerational social mobility:

$$
P_B :=
    \begin{pmatrix}
      0.222 & 0.222 & 0.215 & 0.187 & 0.081 & 0.038 & 0.029 & 0.006\\
      0.221 & 0.22 & 0.215 & 0.188 & 0.082 & 0.039 & 0.029 & 0.006\\
      0.207 & 0.209 & 0.21 & 0.194 & 0.09 & 0.046 & 0.036 & 0.008\\
      0.198 & 0.201 & 0.207 & 0.198 & 0.095 & 0.052 & 0.04 & 0.009\\
      0.175 & 0.178 & 0.197 & 0.207 & 0.11 & 0.067 & 0.054 & 0.012\\
      0.182 & 0.184 & 0.2 & 0.205 & 0.106 & 0.062 & 0.05 & 0.011\\
      0.123 & 0.125 & 0.166 & 0.216 & 0.141 & 0.114 & 0.094 & 0.021\\
      0.084 & 0.084 & 0.142 & 0.228 & 0.17 & 0.143 & 0.121 & 0.028
    \end{pmatrix}
$$ (eq-piben)

Here the states are percentiles of the wealth distribution. In particular, with the states represented by $1, 2, \ldots, 8$, the corresponding percentiles are

0–20%, 20–40%, 40–60%, 60–80%, 80–90%, 90–95%, 95–99%, 99–100%

Transition probabilities are estimated from US 2007–2009 Survey of Consumer Finances data. Relative to the highly persistent matrix $P_Q$, less weight on the principle diagonal suggests more mixing—the influence of initial conditions is relatively short-lived.

Additional insight about the dynamics can be obtained from a contour plot of the matrix $P_B$, as in {numref}`f-markov_matrix_visualization`. Here $P_B$ is plotted as a heat map after rotating it 90 degrees anticlockwise. The rotation is so that the dynamics are comparable to the 45 degree diagrams often used to understand discrete time dynamic systems. A vertical line from state $x$ corresponds to the next period conditional distribution $P(x, \cdot)$.

In this case, we see that, for example, lower states are quite persistent, whereas households in the highest state tend to fall back towards the middle.

```{figure} figures/markov_matrix_visualization.svg
:name: f-markov_matrix_visualization

Contour plot of transition matrix $P_B$
```

```{exercise}
:label: ex-absorb

Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. Show that $U \subset S$ is absorbing (see {ref}`sss-coms`) for the digraph $\mM$ if and only if

$$
\sum_{y \in U} P(x, y) = 1
        \quad \text{for all} \quad
        x \in U.
$$
```


(sss-mcs)=
#### Markov Chains
Consider a finite Markov model $\mM$ with state space $S$ and transition matrix $P$. As before, $P(x, y)$ indicates the probability of transitioning from $x$ to $y$ in one step. Another way to say this is that, when in state $x$, we update to a new state by choosing it from $S$ via the distribution $P(x, \cdot)$. The resulting stochastic process is called a Markov chain.

We can state this more formally as follows. Let $(X_t)_{t \in \ZZ_+}$ be a sequence of random variables taking values in $S$. We say that $(X_t)$ is a **Markov chain** on $S$ if there exists a stochastic matrix $P$ on $S$ such that

$$
\PP \{ X_{t+1} = y \mid X_0, X_1, \ldots, X_t \} = P(X_t, y)
    \quad \text{for all} \quad
    t \geq 0, \; y \in S.
$$ (eq-mcdef)

To simplify terminology, we also call $(X_t)$ **$P$-Markov** when it satisfies {eq}`eq-mcdef` . We call either $X_0$ or its distribution $\psi_0$ the **initial condition** of $(X_t)$ depending on context.

The definition of a Markov chain says two things:

(i) When updating to $X_{t+1}$ from $X_t$, earlier states are not required.

(ii) The matrix $P$ encodes all of the information required to perform the update, given $X_t$.

One way to think about Markov chains is algorithmically: Let $P$ be a stochastic matrix and let $\psi_0$ be an element of $\dD(S)$. Now generate $(X_t)$ via {prf:ref}`algo-mc`. The resulting sequence is $P$-Markov with initial condition $\psi_0$.

```{prf:algorithm} Generation of $P$-Markov $(X_t)$ with initial condition $\psi_0$
:label: algo-mc

1. set $t=0$ and draw $X_t$ from $\psi_0$
2. **while** $t < \infty$ **do**
   1. draw $X_{t+1}$ from the distribution $P(X_t, \cdot)$
   2. let $t = t + 1$
3. **end**
```

#### Simulation

For both simulation and theory, it is useful to be able to translate {prf:ref}`algo-mc` into a stochastic difference equation governing the evolution of $(X_t)_{t \geq 0}$. We now outline the procedure, which uses inverse transform sampling (see {ref}`sss-its`). For simplicity, we assume that $S = \natset{n}$, with typical elements $i,j$. The basic idea is to apply the inverse transform method to each row of $P$ and then sample by drawing a uniform random variable at each update.

To this end, we set

```{math}
:enumerated: false

F(i, u) := \sum_{j=1}^{n} j \1\{q(i, j-1)  < u \leq q(i, j)\}
    \qquad
    (i \in S, \; u \in (0, 1)),
```

where, for each $i, j  \in S$, the value $q(i, j)$ is defined recursively by

```{math}
:enumerated: false

q(i, j) := q(i, j-1) + P(i, j)  \quad \text{with } q(i, 0) = 0.
```

Let $U(0, 1)$ represent the uniform distribution on $(0, 1)$ and take

$$
X_{t+1} = F(X_t, U_{t+1})
    \quad \text{where } \;
    (U_t ) \iidsim U(0, 1).
$$ (eq-msrs)

If $X_0$ is an independently drawn random variable with distribution $\psi_0$ on $S$, then $(X_t)$ is $P$-Markov on $S$ with initial condition $\psi_0$, as {prf:ref}`ex-showppc` asks you to show.

```{exercise}
:label: ex-showppc

Conditional on $X_t = i$, show that, for given $j \in S$,

(i) $X_{t+1} = j$ if and only if $U_{t+1}$ lies in the interval $(q(i, j-1), q(i, j)]$.

(ii) This event has probability $P(i, j)$.

Conclude that $X_{t+1}$ in {eq}`eq-msrs` is a draw from $P(i, \cdot)$.
```


```{solution} ex-showppc

Point (i) is immediate from the definition of $F$. Regarding (ii), from $q(i, j) = q(i, j-1) + P(i, j)$ we have $P(i, j) = q(i, j) - q(i, j-1)$, which is the length of the interval $(q(i, j-1), q(i, j)]$. The probability that $U_{t+1}$ falls in this interval is its length, which we just agreed is $P(i,j)$. The proof is now complete.
```


Each subfigure in {numref}`f-benhabib_mobility_mixing` shows realizations of two Markov chains, both generated using the stochastic difference equation {eq}`eq-msrs`. The sequences are generated each with its own independent sequence of draws $(U_t)$. The underlying transition matrices are $P_B$ from {eq}`eq-piben` in the top panel and $P_Q$ from {eq}`eq-pq` in the bottom panel. In both panels, one chain starts from the lowest state and the other from the highest. Notice that time series generated by $P_B$ mix faster than those generated by $P_Q$: the difference in initial states is not a strong predictor of outcomes after an initial "burn in" period. We discuss mixing and its connection to stability below.

```{figure} figures/benhabib_mobility_mixing.svg
:name: f-benhabib_mobility_mixing

Wealth percentile over time
```

#### Higher Order Transition Matrices

Given a finite Markov model $\mM$ with state space $S$ and transition matrix $P$, define $(P^k)_{k \in \NN}$ by $P^{k+1} = P P^k$ for all $k$, with the understanding that $P^0 = I =$ the identity matrix. In other words, for each $k$, the matrix $P^k$ is the $k$-th power of $P$. If we spell out the matrix product $P^{k+1} = P P^k$ element-by-element, we get

$$
P^{k+1}(x,y) := \sum_z  P(x,z) P^k(z,y)
    \qquad (x, y \in S, \; k \in \NN).
$$ (eq-updatepi)

```{exercise}
:label: ex-mcs-auto-1

Prove that $P^k$ is a stochastic matrix on $S$ for all $k \in \NN$.
```


```{solution} ex-mcs-auto-1

$P^k$ is stochastic for all $k \in \NN$ by induction and the fact that the set of stochastic matrices is closed under multiplication (see {ref}`sss-stochmat`).
```


In this context, $P^k$ is called the **$k$-step transition matrix** corresponding to $P$. The $k$-step transition matrix has the following interpretation: If $(X_t)$ is $P$-Markov, then, for any $t, k \in \NN$ and $x, y \in S$,

$$
P^k(x, y) = \PP\{X_{t + k} = y \given X_t = x\}.
$$ (eq-pik)

In other words, $P^k$ provides the $k$-step transition probabilities for the $P$-Markov chain $(X_t)$, as suggested by its name.

This claim can be verified by induction. Fix $t \in \NN$ and $x, y \in S$. The claim is true by definition when $k=1$. Suppose the claim is also true at $k$ and now consider the case $k+1$. By the law of total probability, we have

```{math}
:enumerated: false

\PP\{X_{t+k+1} = y \given X_t = x \}
    = \sum_z \PP\{X_{t+k+1} = y \given X_{t+k} = z\} \PP\{X_{t+k} = z \given X_t = x\}.
```

The induction hypothesis allows us to use {eq}`eq-pik`, so the last equation becomes

```{math}
:enumerated: false

\PP\{X_{t+k+1} = y \given X_t = x \}
    = \sum_z P(z, y) P^k(x, z)  
    = P^{k+1} (x, y).
```

This completes our proof by induction.

A useful identity for the higher order Markov matrices is

$$
P^{j+k}(x,y) = \sum_z P^k(x,z) P^j(z,y)
    \qquad ((x, y) \in S \times S)
$$ (eq-chapkol)

which holds for any $j, k$ in $\NN$. This is called the **Chapman–Kolmogorov equation**. Note that

- {eq}`eq-updatepi` is a special case of {eq}`eq-chapkol` and

- {eq}`eq-chapkol` is a special case of {eq}`eq-accip`, written with different notation.

To provide probabilistic intuition for the validity of the Chapman–Kolmogorov equation, let $X_0 = x$ and let $y \in S$ be given. Using the law of total probability again, we have

```{math}
:enumerated: false

\PP\{X_{j+k} = y \given X_0 = x\}
     = \sum_z \PP\{X_{j+k} = y \given X_0 = x, \, X_k = z\} 
        \PP\{X_k = z \given X_0 = x\}
```

By Markov property {eq}`eq-mcdef`, the future and past are independent given the present, so

```{math}
:enumerated: false

\sum_z \PP\{X_{j+k} = y \given X_0 = x, \, X_k = z\}
     = \sum_z \PP\{X_{j+k} = y \given X_k = z\} .
```

As a result of this fact and {eq}`eq-pik`, the equation before this one can be rewritten as {eq}`eq-chapkol`.

(ss-dd)=
### Distribution Dynamics
Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. Let $(X_t)$ be $P$-Markov and, for each $t \geq 0$, let $\psi_t \in \dD(S)$ be defined by

```{math}
:enumerated: false

\psi_t
    := \PP\{X_t = \cdot\}
    = \text{ the distribution of } X_t.
```

The vector $\psi_t$ is called the **marginal distribution** of $X_t$. While $(X_t)$ is random, the sequence $(\psi_t)$ is deterministic. In this section we investigate its dynamics.

(sss-lmarg)=
#### Updating Marginal Distributions
The key idea for this section is that there is a simple link between successive marginal distributions: by the law of total probability, we have

```{math}
:enumerated: false

\PP \{X_{t+1} = y \}
     = \sum_x \PP \{ X_{t+1} = y \, | \, X_t = x \}
                 \cdot \PP \{ X_t = x \},
```

which can be rewritten as

$$
\psi_{t+1}(y) = \sum_x P(x,y) \psi_t(x)
      \qquad (y \in S).
$$ (eq-flbm)

This fundamental expression tells how to update marginal distributions given the transition matrix $P$.

When each $\psi_t$ is interpreted as a row vector, we can write {eq}`eq-flbm` as

$$
\psi_{t+1} = \psi_t P.
$$ (eq-bauprl)

(Henceforth, in expressions involving matrix algebra, distributions are row vectors unless otherwise stated). Some authors refer to {eq}`eq-bauprl` as the **forward equation** associated with $P$, while $\psi \mapsto \psi P$ is called the **forward operator**, by analogy with the Kolmogorov forward equation from continuous time.

Think of {eq}`eq-bauprl` as a difference equation in distribution space. Iterating backwards,

```{math}
:enumerated: false

\psi_t 
    = \psi_{t-1} P 
    = (\psi_{t-2} P) P
    = \psi_{t-2} P^2
    = \cdots
    = \psi_0 P^t.
```

Given any $\psi_0 \in \dD(S)$ and $t \in \NN$, we have

```{math}
:enumerated: false

\psi_0 P^t 
    = \text{ the distribution of } X_t \text{ given } X_0 \eqdist \psi_0.
```

```{prf:example}
:label: eg-quahpred

As an illustration, let's take the matrix $P_Q$ estimated by {cite}`quah1993empirical` using 1960–1984 data and use $P_Q^t$ to update the 1985 distribution $t = 2019 - 1985 = 34$ times, in order to obtain a prediction for the cross-country income distribution in 2019. {numref}`f-quah_gdppc_prediction` shows how this prediction fares compared to the realized 2019 distribution, calculated from World Bank GDP data.[^1]
```


```{figure} figures/quah_gdppc_prediction.svg
:name: f-quah_gdppc_prediction

Predicted vs realized cross-country income distributions for 2019
```

(sss-trajlr)=
#### Trajectories in the Long Run
One of the main sub-fields of Markov chain analysis is asymptotics of distribution sequences. This topic turns out to be important for network theory as well. In {ref}`ss-stabil` we will investigate asymptotics in depth. In this section we build some intuition via simulations.

{numref}`f-simplex_2` shows the trajectory $(\psi P_a^t)$ when $S = \{1, 2, 3\}$, $\psi = (0, 0, 1)$, and $P_a$ is the transition matrix displayed in {eq}`eq-pia`. The blue triangle is the unit simplex in $\RR^3_+$, consisting of all row vectors $\psi \in \RR^3$ such that $\psi \geq 0$ and $\psi \1 = 1$. The unit simplex can be identified with $\dD(S)$ when $S = \{1, 2, 3\}$. Red dots in the figure are distributions in the sequence $(\psi P_a^t)$ for $t=0, \ldots, 20$. {numref}`f-simplex_3` shows distribution dynamics for $P_a$ that start from initial condition $\psi = (0, 1/2, 1/2)$.

It seems that both of the sequences are converging. This turns out to be the case—the black dot in the figures is the limit of both sequences and, moreover, this point is a stationary distribution for $P_a$, as defined in {ref}`sss-stochmat`. In fact we can—and will—also show that no other stationary distribution exists, and that $\psi P_a^t$ converges to the stationary distribution regardless of the choice of $\psi \in \dD(S)$. This is due to certain properties of $P_a$, related to connectivity and aperiodicity.

```{figure} figures/simplex_2.svg
:name: f-simplex_2

A trajectory from $\psi_0 = (0, 0, 1)$
```

```{figure} figures/simplex_3.svg
:name: f-simplex_3

A trajectory from $\psi_0 = (0, 1/2, 1/2)$
```

{numref}`f-benhabib_mobility_dists` provides another view of a distribution sequence, this time generated from the matrix $P_B$ in {eq}`eq-piben`. The initial condition $\psi_0$ was uniform. Each distribution shown was calculated as $\psi P_Q^t$ for different values of $t$. The distribution across wealth classes converges rapidly to what appears to be a long run limit. Below we confirm that this is so, and that the limit is independent of the initial condition. The rapid rate of convergence is due to the high level of mixing in the transition dynamics.

```{figure} figures/benhabib_mobility_dists.svg
:name: f-benhabib_mobility_dists

Distribution projections from $P_B$
```

(ss-station)=
### Stationarity
In this section we examine stationary distributions and their properties. As we will see, stationary distributions can be regarded as steady states for the evolution of the sequence of marginal distributions. (Later, when we study ergodicity, stationary distributions will acquire another important interpretation.)

(sss-statdist)=
#### Stationary Distributions
Recall from {ref}`sss-stochmat` that if $P$ is a stochastic matrix and $\psi \in \RR^n_+$ is a row vector such that $\psi \1 = 1$ and $\psi P = \psi$, then $\psi$ is called stationary for $P$. So now let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. Translating to the notation of Markov chains, a distribution $\psi^* \in \dD(S)$ is **stationary** for $\mM$ if

```{math}
:enumerated: false

\psi^*(y) = \sum_{x \in S} P(x,y) \psi^*(x)
    \quad \text{for all } 
    y \in S.
```

We also write this expression as $\psi^* = \psi^* P$ and understand $\psi^*$ as a fixed point of the map $\psi \mapsto \psi P$ that updates distributions (cf., Equation {eq}`eq-bauprl`).

If $X_t \eqdist \psi^*$, then, for any $j \in \NN$, the fixed point property implies that $X_{t+j} \eqdist \psi^* P^j = \psi^*$. Hence

```{math}
:enumerated: false

X_t \eqdist \psi^* \implies  X_{t+j} \eqdist \psi^* \; \text{ for all } j \in \NN.
```

```{prf:example}
:label: eg-empl

Suppose workers are hired at rate $\alpha$ and fired at rate $\beta$, transitioning between unemployment and employment according to

$$
P_w = 
        \begin{pmatrix}
            1-\alpha & \alpha \\
            \beta & 1-\beta 
        \end{pmatrix}.
$$ (eq-pwmat)
In {ref}`sss-wdii` we showed $\alpha + \beta > 0$ implies $\psi = (\beta / (\alpha + \beta), \alpha / (\alpha + \beta))$ is a dominant left eigenvector for $P_w$. Since $r(P_w)=1$, the Perron–Frobenius Theorem tells us that $\psi$ is stationary for $P_w$. One implication is that, if the distribution of workers across the two employment states is given by $\psi$ and updates obey the dynamics encoded in $P_w$, then no further change is observed in the unemployment rate.
```


```{prf:example}

The black dot in each of {numref}`f-simplex_2`–{numref}`f-simplex_3`, indicating the limit of the marginal sequences, is a stationary distribution for the Markov matrix $P_a$ displayed in {eq}`eq-pia`, page . We discuss its calculation in {ref}`sss-mccomp`.
```


```{exercise}
:label: ex-mcs-auto-2

Let $\mM$ be a finite Markov model with state space $|S|=n$ and transition matrix $P$. Let $\psi \equiv 1/n$ be the uniform distribution on $S$. Prove that $\psi$ is stationary for $P$ if and only if $P$ is **doubly stochastic** (i.e., has unit column sums as well as unit row sums).
```


In {numref}`f-simplex_2`–{numref}`f-simplex_3` all trajectories converge towards the stationary distribution. Not all stationary distributions have this "attractor" property, and in general there can be many stationary distributions. The next example illustrates.

```{exercise}
:label: ex-msdi

Let $\mM = (S, E, p)$ be a finite Markov model with $(x, y) \in E$ if and only if $x=y$. Describe the implied weight function and corresponding transition matrix. Show that every distribution in $\dD(S)$ is stationary for $\mM$.
```


```{solution} ex-msdi

Let $\mM$ be as described. In this setting, the requirement that the transition matrix $P$ is stochastic implies that $p(x,x) = 1$ and $P(x, y) = \1\{x = y\}$. Thus, $P = I$, the $n \times n$ identity matrix. Every distribution is stationary because $\psi I = \psi$ for all $\psi \in \dD(S)$.
```


(sss-statexist)=
#### Existence and Uniqueness
From the Perron–Frobenius Theorem we easily obtain the following fundamental result.

```{prf:theorem} Existence and Uniqueness of Stationary Distributions
:label: t-kb

Every finite Markov model $\mM = (S, E, p)$ has at least one stationary distribution $\psi^*$ in $\dD(S)$. If the digraph $(S, E)$ is strongly connected, then $\psi^*$ is unique and everywhere positive on $S$.
```


```{prf:proof}
:nonumber:

Let $\mM$ be a finite Markov model. Since the corresponding adjacency matrix $P$ is stochastic, existence follows from {prf:ref}`ex-sm_sr1` in {ref}`sss-stochmat`. By {prf:ref}`t-sconir`, strong connectedness of $\mM$ implies irreducibility of $P$. When $P$ is irreducible, uniqueness and everywhere positivity of the stationary distribution follows from the Perron–Frobenius Theorem. ◻
```


The basic idea behind the uniqueness part of {prf:ref}`t-kb` is as follows: Suppose to the contrary that $\mM$ is strongly connected and yet two distinct stationary distributions $\psi^*$ and $\psi^{**}$ exist in $\pP(S)$. Since a $P$-Markov chain started at $\psi^*$ always has marginal distribution $\psi^*$ and likewise for $\psi^{**}$, different initial conditions lead to different long run outcomes. This contradicts strong connectedness in the following way: strong connectedness implies that both chains traverse the whole state space. Moreover, being Markov chains, they forget the past once they arrive at any state, so the starting draws should eventually be irrelevant.

(Actually, the story in the last paragraph is incomplete. Initial conditions *can* determine long run outcomes under strong connectedness in one sense: a "periodic" Markov model can traverse the whole space but *only at specific times* that depend on the starting location. If we rule out such periodicity, we get results that are even stronger than {prf:ref}`t-kb`. This topic is treated in {ref}`ss-stabil`.)

(ss-brouwer)=
#### Brouwer's Theorem
Another way to prove the existence claim in {prf:ref}`t-kb` is via the famous fixed point theorem of L. E. J. Brouwer (1881–1966).

```{prf:theorem} Brouwer
:label: t-brouwer

If $C$ is a convex compact subset of $\RR^n$ and $G$ is a continuous self-map on $C$, then $G$ has at least one fixed point in $C$.
```


The proof of {prf:ref}`t-brouwer` in one dimension is not difficult, while the proof in higher dimensions is challenging. See, for example, {cite}`aliprantis1999border`.

```{exercise}
:label: ex-mcs-auto-3

Prove Brouwer's fixed point theorem for the case $C=[0,1]$ by applying the intermediate value theorem.
```


```{solution} ex-mcs-auto-3

Let $G$ be a continuous function from $[0,1]$ to itself and set $f(x) := Gx - x$. Since $G$ is a self-map on $[0,1]$ we have $f(0) = G0 \geq 0$ and $f(1) = G1 - 1 \leq 0$, so $f$ is a continuous function on $[0,1]$ satisfying $f(0) \geq 0$ and $f(1) \leq 0$. Existence of an $x$ satisfying $f(x)=0$ follows from the intermediate value theorem. The same $x$ is a fixed point of $G$.
```


One advantage of Brouwer's fixed point theorem is that its conditions are quite weak. One disadvantage is that it provides only existence, without uniqueness or stability. {numref}`f-three_fixed_points` provides an example of how multiple fixed points can coexist under the conditions of the theorem.[^2]

```{exercise}
:label: ex-mcs-auto-4

Prove the first part of {prf:ref}`t-kb` (existence of a stationary distribution) using Brouwer's fixed point theorem.
```


```{solution} ex-mcs-auto-4

Let $P$ be a Markov matrix on finite set $S$. Suppose in particular that $S$ has $d$ elements, so we can identify functions in $\RR^S$ with vectors in $\RR^d$ and $\dD(S)$ with the unit simplex in $\RR^d$. The set $\dD(S)$ is a closed, bounded and convex subset of $\RR^d$ that $P$ maps into itself. As a linear matrix operation, the map $\psi \mapsto \psi P$ is continuous. Existence of a fixed point now follows from Brouwer's fixed point theorem.
```


(sss-mccomp)=
#### Computation
Let's consider how to compute stationary distributions. While $\psi^* P = \psi^*$ is a finite set of linear equations that we might hope to solve directly for $\psi^*$, there are problems with this idea. For example, $\psi^* = 0$ is a solution that fails to lie in $\dD(S)$.

To restrict the solution to $\dD(S)$ we proceed as follows: Suppose $|S|=n$ and note that row vector $\psi \in \dD(S)$ is stationary if and only if $\psi(I - P) = 0$, where $I$ is the $n \times n$ identity matrix. Let $\1_n$ be the $1 \times n$ row vector $(1,\ldots,1)$. Let $\1_{n \times n}$ be the $n \times n$ matrix of ones.

```{exercise}
:label: ex-statiffc

Consider the linear system

$$
\1_n = \psi (I - P + \1_{n \times n})
$$ (eq-hsbi)
where $\psi$ is a row vector. Show that

(i) every solution $\psi$ of {eq}`eq-hsbi` lies in $\dD(S)$ and

(ii) $\psi$ is stationary for $P$ if and only if {eq}`eq-hsbi` holds.
```


Solving the linear system {eq}`eq-hsbi` produces a stationary distribution in any setting where the stationary distribution is unique. When this is not the case, problems can arise.

```{exercise}
:label: ex-mcs-auto-5

Give a counterexample to the claim that $(I - P + \1_{n \times n})$ is always nonsingular when $P$ is a stochastic matrix.
```


There are also graph-theoretic algorithms for computing all of the stationary distributions of an arbitrary stochastic matrix. (The Python and Julia libraries `QuantEcon.py` and `QuantEcon.jl` have efficient implementations of this type.)

## Asymptotics

In this section we turn to long run properties of Markov chains, including ergodicity. With these ideas in hand, we will then investigate the evolution of information over social networks.

(ss-ergo)=
### Ergodicity
Let's begin with the fascinating and important topic of ergodicity. The simplest way to understand ergodicity is as an extension of the law of large numbers from IID sequences to more general settings, where the IID property holds only in a limiting sense.

(sss-hfuncs)=
#### Harmonic Functions
Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. Fix $h \in \RR^S$ and let

$$
Ph(x) := \sum_{y \in S} P(x, y) h(y)
    \qquad (x \in S).
$$ (eq-pexp)

If $h$ is understood as a column vector in $\RR^{|S|}$, then $Ph(x)$ is just element $x$ of the vector $Ph$. The map $h \mapsto Ph$ is sometimes called the "conditional expectation operator," since, given that $P(x, y) = \PP\{X_{t+1}=y \given X_t = x\}$, we have

```{math}
:enumerated: false

\sum_{y \in S} P(x, y) h(y)  
    = \EE [ h(X_{t+1}) \given X_t = x ]
```

A function $h \in \RR^S$ is called **$P$-harmonic** if $P h = h$ pointwise on $S$. Thus, $P$-harmonic functions are fixed points of the conditional expectation operator $h \mapsto Ph$.

If $h$ is $P$-harmonic and $(X_t)$ is $P$-Markov, then

$$
\EE \, [ h(X_{t+1}) \given X_t ]
    = (P h)(X_t)
    = h(X_t).
$$ (eq-harmogale)

(A stochastic process with this property—i.e., that the current value is the best predictor of next period's value—is called a *martingale*. Martingales are one of the foundational concepts in probability, statistics and finance.)

````{prf:example}
:label: eg-abshar

Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. If $A \subset S$ and $A^c := S \setminus A$ are both absorbing for $\mM$, then $\1_A$ and $\1_{A^c}$ are both $P$-harmonic. To see this, we apply {prf:ref}`ex-absorb` to obtain

```{math}
:enumerated: false

(P \1_A)(x) 
        = \sum_{y \in S} P(x, y) \1_A(y)
        = \sum_{y \in A} P(x, y) 
        = \begin{cases}
            1 & \text{ if } x \in A
            \\
            0 & \text{ if } x \in A^c.
        \end{cases}
```

In other words, $P \1_A = \1_A$. A similar argument gives $P \1_{A^c} = \1_{A^c}$.
````


```{exercise}
:label: ex-mcs-auto-6

Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. Show that every constant function in $\RR^S$ is $P$-harmonic.
```


(sss-ergdef)=
#### Definition and Implications
Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. We know that every constant function in $\RR^S$ is $P$-harmonic. We call $\mM$ **ergodic** if the only $P$-harmonic functions in $\RR^S$ are the constant functions.

````{prf:example}
:label: eg-mciid0

If $P(x, y) = \phi(y)$ for all $x, y$ in $S$, where $\phi$ is some fixed distribution on $S$, then $P$ generates an IID Markov chain, since the next period draw has no dependence on the current state. Any model $\mM$ with an adjacency matrix of this type is ergodic. Indeed, if $P$ has this property and $h \in \RR^S$ is $P$-harmonic, then, for any $x \in S$, we have

```{math}
:enumerated: false

h(x) = (Ph)(x) = \sum_y P(x, y) h(y) = \sum_y \phi(y) h(y)
```

Hence, $h$ is constant. This proves that any $P$-harmonic function is a constant function.
````


````{prf:example}
:label: eg-empl2

A laborer is either unemployed (state $1$) or employed (state $2$). In state $1$ he is hired with probability $\alpha$. In state $2$ he is fired with probability $\beta$. The corresponding Markov model $\mM$ has state and transition matrix given by

```{math}
:enumerated: false

S = \{1, 2\}
        \quad \text{and} \quad
        P_w =
        \begin{pmatrix}
            1-\alpha & \alpha \\
            \beta & 1-\beta 
        \end{pmatrix}.
```

The statement $P_w h = h$ becomes

```{math}
:enumerated: false

\begin{pmatrix}
            1-\alpha & \alpha \\
            \beta & 1-\beta 
        \end{pmatrix}
        \begin{pmatrix}
            h(1) \\
            h(2)
        \end{pmatrix}
        =
        \begin{pmatrix}
            h(1) \\
            h(2)
        \end{pmatrix}
```

The first row is $(1-\alpha) h(1) + \alpha h(2) = h(1)$, or $\alpha h(1) = \alpha h(2)$. Thus, $\mM$ is ergodic whenever $\alpha > 0$. By a similar argument, $\mM$ is ergodic whenever $\beta > 0$.
````


```{prf:example}
:label: eg-abpo

Let $\mM$ be any finite Markov model with state space $S$ and transition matrix $P$. It is immediate from {prf:ref}`eg-abshar` that if $S$ can be partitioned into two nonempty absorbing sets, then $\mM$ is not ergodic. Hence, the poverty trap model in {numref}`f-poverty_trap_2` is not ergodic. Similarly, if $\alpha=\beta=0$ in the matrix $P_w$ discussed in {prf:ref}`eg-empl2`, then $P_w = I$ and each state is a disjoint absorbing set. Ergodicity fails.
```


```{figure} figures/tikz_poverty_trap_2.svg
:name: f-poverty_trap_2

A poverty trap
```

The examples discussed above suggest that, for a finite Markov model $\mM$, ergodicity depends on the connectivity properties of the digraph. The next result confirms this.

```{prf:proposition}
:label: p-iimerg0

If $\mM$ is strongly connected, then $\mM$ is ergodic.
```


````{prf:proof}
:nonumber:

Let $\mM$ be a strongly connected Markov model with state space $S$ and transition matrix $P$. Let $h$ be $P$-harmonic and let $x \in S$ be the maximizer of $h$ on $S$. Let $m = h(x)$. Suppose there exists a $y$ in $S$ with $h(y) < m$. Since $\mM$ is strongly connected, we can choose a $k \in \NN$ such that $P^k(x, y) > 0$. Since $h$ is $P$-harmonic, we have $h = P^k h$, and hence

```{math}
:enumerated: false

m 
        = h(x) 
        = \sum_z P^k(x, z) h(z) 
        = P^k(x, y) h(y) + \sum_{z \neq y} P^k(x, z) h(z) 
        < m.
```

This contradiction shows that $h$ is constant. Hence $\mM$ is ergodic. ◻
````


The implication in {prf:ref}`p-iimerg0` is one way, as the next exercise asks you to confirm.

```{exercise}
:label: ex-mcs-auto-7

Provide an example of a finite Markov model that is ergodic but not strongly connected.
```


````{solution} ex-mcs-auto-7

Let $\mM$ be a finite Markov model with states $S = \{1, 2\}$ and edge set $E = \{(1,2), (2,2)\}$. Thus, the chain immediately moves to state 2 and stays there forever. The corresponding transition matrix is

```{math}
:enumerated: false

P 
        =
        \begin{pmatrix}
            0 & 1 \\
            0 & 1
        \end{pmatrix}
```

If $h$ is $P$-harmonic, then $h(x) = Ph(x) = h(2)$. Hence $h$ is constant. This shows that $P$ is ergodic. At the same time $(S, E)$ is not strongly connected.
````


#### Implications of Ergodicity

One of the most important results in probability theory is the **law of large numbers** (LLN). In the finite state setting, the classical version of this theorem states that

```{math}
:enumerated: false

\PP \left\{
           \lim_{k \to \infty} \frac{1}{k} \sum_{t=0}^{k-1} h(X_t)
                   = \sum_{x \in S} h(x) \phi(x)
               \right\} = 1
```

when $(X_t)_{t \geq 0}$ is an IID sequence of random variables with common distribution $\phi \in \dD(S)$ and $h$ is an arbitrary element of $\RR^S$.

This version of the LLN is classical in the sense that the IID assumption is imposed. It turns out that the IID assumption can be weakened to allow for a degree of dependence between observations, which leads us to ask whether or not the LLN holds for Markov chains as well.

The answer to this question is yes, provided that dependence between observations dies out fast enough. One candidate for this condition is ergodicity. In fact, it turns out that ergodicity is the exact necessary and sufficient condition required to extend the law of large numbers to Markov chains. The next theorem gives details.

```{prf:theorem}
:label: t-merg0

Let $\mM$ be any finite Markov model with state space $S$ and transition matrix $P$. The following statements are equivalent:

(i) $\mM$ is ergodic.

(ii) $\mM$ has a unique stationary distribution $\psi^*$ and, for any $P$-Markov chain $(X_t)$ and any $h \in \RR^S$,

$$
\PP \left\{
                       \lim_{k \to \infty} \frac{1}{k} \sum_{t=0}^{k-1} h(X_t)
                       = \sum_{x \in S} h(x) \psi^*(x)
                   \right\} = 1.
$$ (eq-erglln)
```


The proof of {prf:ref}`t-merg0` is given in Chapter 17 of {cite}`meyn2009markov`. We skip the proof but provide intuition through the following examples.

```{prf:example}
:label: eg-mciid

Recall the IID case from {prf:ref}`eg-mciid0`. We showed that $\mM$ is ergodic. By {prf:ref}`t-merg0`, the convergence in {eq}`eq-erglln` holds with $\psi^* = \phi$. This is consistent with the LLN for IID sequences.
```


```{prf:example}
:label: eg-failerg

Let $\mM$ be a finite Markov model with $S = \{1, 2\}$ and $P = I$, the identity matrix. Markov chains generated by $P$ are constant. Since every $h \in \RR^2$ satisfies $Ph=h$, we see that $\mM$ is not ergodic. This means that the LLN result in {eq}`eq-erglln` fails. But this is exactly what we would expect, since a constant chain $(X_t)$ implies $\frac{1}{k} \sum_{t=0}^{k-1} X_t = X_0$ for all $k$. In particular, if $X_0$ is drawn from a nondegenerate distribution, then the sample mean does not converge to any constant value.
```


```{prf:example}
:label: eg-failerg2

Consider again the poverty trap model in {numref}`f-poverty_trap_2`. Say that $h(x)$ is earnings in state $x$, and that $h(\text{poor}) = 1$, $h(\text{middle}) = 2$ and $h(\text{rich}) = 3$. Households that start with $X_0 = \text{poor}$ will always be poor, so $\frac{1}{k} \sum_{t=0}^{k-1} h(X_t) = 1$ for all $k$. Households that start with $X_0$ in $\{ \text{middle, rich} \}$ remain in this absorbing set forever, so $\frac{1}{k} \sum_{t=0}^{k-1} h(X_t) \geq 2$ for all $k$. In particular, the limit of the sum depends on the initial condition. This violates part (ii) of {prf:ref}`t-merg0`, which states that the limit is independent of the distribution of $X_0$.
```


#### Reinterpreting the Stationary Distribution

Ergodicity has many useful implications. One is a new *interpretation* for the stationary distribution. To illustrate this, let $\mM$ be an ergodic Markov model with state space $S$ and transition matrix $P$. Let $(X_t)$ be a $P$-chain and let

```{math}
:enumerated: false

\hat \psi_k (y) := \frac{1}{k} \sum_{t = 1}^k \1\{X_t = y\}
    \qquad (y \in S).
```

The value $\hat \psi_k (y)$ measures the fraction of time that the $P$-chain spends in state $y$ over the time interval $1, \ldots, k$. Under ergodicity, for fixed $y \in S$, we can use {eq}`eq-erglln` with $h(x) = \1\{ x = y \}$ to obtain

$$
\hat \psi_k (y) 
    \to \sum_{x \in S} \1\{x = y\} \psi^*(x) 
    = \psi^*(y).
$$ (eq-ergllnprob)

Turning {eq}`eq-ergllnprob` around, we see that

$$
\psi^*(y) 
    \approx \text{ the fraction of time that any } P \text{-chain } (X_t) \text{ spends in state } y.
$$ (eq-erginterp)

{numref}`f-benhabib_ergodicity_1` illustrates this idea for a simulated Markov chain $(X_t)$ generated from the matrix $P_B$ introduced in {eq}`eq-piben`. The figure compares $\hat \psi_k$ and $\psi^*$ for different values of $k$. As $k \to \infty$, the convergence claimed in {eq}`eq-ergllnprob` occurs.

```{figure} figures/benhabib_ergodicity_1.svg
:name: f-benhabib_ergodicity_1

Convergence of the empirical distribution to $\psi^*$
```

Of course, we must remember that {eq}`eq-erginterp` is only valid under ergodicity. For example, if $P = I$, the identity, then every distribution is stationary, every $P$-Markov chain is constant, and {eq}`eq-erginterp` does not hold.

Notice that, in view of {prf:ref}`t-merg0`, the convergence in {eq}`eq-erglln` occurs for *any* initial condition. This gives us, under ergodicity, a way of computing the stationary distribution via simulation (and {eq}`eq-ergllnprob`). While this method is slower than algebraic techniques (see, e.g., {ref}`sss-mccomp`) for small problems, it can be the only feasible option when $|S|$ is large.

(ss-stabil)=
### Aperiodicity and Stability
In {ref}`ss-ergo` we discussed sample path properties of Markov chains, finding that strong connectivity is sufficient for stability of time series averages. Next we turn to marginal distributions of the chain and their long run properties, which we examined informally in {ref}`sss-trajlr`. We will see that, to guarantee convergence of these sequences, we also need a condition that governs periodicity.

#### Convergence of Marginals

Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. We call $\mM$ **globally stable** if there is only one stationary distribution $\psi^*$ in $\dD(S)$ and, moreover,

$$
\lim_{t \to \infty} \psi P^t = \psi^* 
    \quad \text{for all } \psi \in \dD(S).
$$ (eq-finitemcgs)

In other words, marginal distributions of every $P$-Markov chain converge to the unique stationary distribution of the model.

There is a useful connection between global stability and absorbing sets. Intuitively, if $\mM$ is globally stable and has an absorbing set $A$ that can be reached from any $x \in S$, then any Markov chain generated by these dynamics will eventually arrive in $A$ and never leave. Hence the stationary distribution must put all of its mass on $A$. The next exercise asks you to confirm this.

```{exercise}
:label: ex-gsaa

Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. Let $A$ be a nonempty absorbing subset of $S$. Assume that

(a) $\mM$ is globally stable with unique stationary distribution $\psi^*$ and

(b) for each $x \in A^c := S \setminus A$, there exists an $a \in A$ such that $a$ is accessible from $x$,

Show that, under the stated conditions, there exists an $\epsilon > 0$ such that $\sum_{y \in A^c} P^n(x, y) \leq 1 - \epsilon$ for all $x \in S$, where $n=|S|$. Using this fact, show in addition that $\sum_{y \in A} \psi^*(y) = 1$.
```


````{solution} ex-gsaa

Let $\mM$ and $A$ have the stated properties. Fix $x \in S$. Consider a $P$-chain $(X_t)$ that starts at $x$. By property (b), there exists an $a \in A$ and a $k \leq n := |S|$ such that $\epsilon_x := \PP\{X_k = a\}$ is strictly positive. Once $(X_t)$ enters $A$ it never leaves, so $X_k = a$ implies $X_n \in A$. Hence $\PP\{X_n \in A\} \geq \epsilon_x$. With $\epsilon := \min_{x \in S} \epsilon_x > 0$, we then have $\PP\{X_n \in A\} \geq \epsilon$ for any initial condition $x$. Another way to state this is $\sum_{y \in A^c} P^n(x, y) \leq 1 - \epsilon$ for all $x \in S$, which proves the first claim.

Regarding the second claim, fix $\psi \in \dD(S)$ and let $\psi_t = \psi P^t$ for all $t$. Observe that, for fixed $m \in \NN$, we have $\psi_{(m+1)n} = P^n \psi_{mn}$. As a result, for $y \in A^c$, we have

```{math}
:enumerated: false

\psi_{(m+1)n}(y) 
        = \sum_{x \in S} P^n(x,y) \psi_{mn}(x)
        = \sum_{x \in A^c} P^n(x,y) \psi_{mn}(x).
```

Summing over $y$ gives

```{math}
:enumerated: false

\sum_{y \in A^c} \psi_{(m+1)n}(y) 
        = \sum_{y \in A^c}\sum_{x \in A^c} P^n(x,y) \psi_{mn}(x)
        = \sum_{x \in A^c} 
            \left[ \sum_{y \in A^c} P^n(x,y) \right] \psi_{mn}(x).
```

Let $\eta_t := \sum_{x \in A^c} \psi_t(x)$ be the amount of probability mass on $A^c$ at time $t$. Using the first claim and the definition of $\eta_t$ now gives $\eta_{(m+1)n} \leq (1-\epsilon) \eta_{mn}$. Hence $\eta_{mn} \to 0$ as $m \to \infty$. At the same time, $\psi_{mn} \to \psi^*$ as $m \to \infty$, so

```{math}
:enumerated: false

\sum_{x \in A^c} \psi^*(x)
        = \lim_{m \to \infty} \sum_{x \in A^c} \psi_{mn}(x)
        = \lim_{m \to \infty} \eta_{mn} = 0.
```

The second claim is now verified.
````


#### A Key Theorem

From {prf:ref}`t-kb` we saw that strong connectedness is sufficient for uniqueness of the stationary distribution. One might hope that strong connectedness is enough for global stability too, but this is not true. To see why, suppose for example that $S = \{0,1\}$ and $E = \{(0, 1), (1, 0)\}$. The transition matrix is

$$
P_d =
     \begin{pmatrix}
       0 & 1 \\
       1 & 0
     \end{pmatrix}.
$$ (eq-perp)

While this model is strongly connected, global stability fails. Indeed, if $(X_t)$ is $P_d$-Markov and starts at $0$, then $(X_t)$ will visit state 1 on odd dates and state 0 on even dates. That is, $P^t_d \, \delta_0 = \delta_{t \text{ mod } 2}$. This sequence does not converge.

The issue with $P_d$ is that, even though the chain traverses the whole state space, the distribution of $X_t$ will affect that of $X_{t+j}$ for all $j$ due to periodicity. This causes stability to fail. If, however, we rule out periodicity, then we have enough for stability to hold. This line of reasoning leads to the following famous theorem.

```{prf:theorem}
:label: t-crmst

Let $\mM$ be a finite Markov model. If $\mM$ is strongly connected and aperiodic, then $\mM$ is globally stable.
```


```{prf:proof}
:nonumber:

Let $\mM$ be a finite Markov model with state $S$ and transition matrix $P$. Suppose $\mM$ is aperiodic and strongly connected. Let $\psi^*$ be the unique stationary distribution of $\mM$. By {prf:ref}`t-scaperpr`, $P$ is primitive. Hence we can apply the last part of the Perron–Frobenius Theorem. Using $r(P)=1$, this result tells us that $P^t \to e_r e_\ell^\top$ as $t \to \infty$, where $e_r$ and $e_\ell$ are the unique right and left eigenvectors of $P$ corresponding to the eigenvalue $r(P) = 1$ that also satisfy the normalization $\inner{e_\ell, e_r}=1$.

Now observe that $\psi^*$ obeys $\psi^* = \psi^* P$ and, in addition, $P \1 = \1$. Hence $\psi^*$ and $\1$ are left and right eigenvectors corresponding to $r(P)=1$. Moreover, $\inner{\psi^*, \1} = 1$. Hence $e_r = \1$ and $e_\ell^\top = \psi^*$.

Combining these facts leads to

$$
\lim_{t \to \infty}
        P^t = P^* 
        \quad \text{where} \quad P^* := \1 \psi^* .
$$ (eq-fppmm)
If we pick any $\psi \in \dD(S)$, then, by {eq}`eq-fppmm`, we get $\psi P^t \to \inner{\psi, \1} \psi^* = \psi^*$. Hence global stability holds. ◻
```


```{prf:example}

The Markov models $P_Q$ and $P_B$ in {ref}`sss-reps` are both aperiodic by the results in {ref}`sss-aperiodicgraph`. Being strongly connected, they are also globally stable.
```


The aperiodicity condition in {prf:ref}`t-crmst` is, in general, not stringent. On the other hand, the strong connectedness requirement is arguably quite strict. Weaker conditions for global stability are available, as we shall see in {ref}`ss-mdc`.

(sss-specgap)=
#### Rates of Convergence: Spectral Gap
While global stability is a very useful property, the implications are qualitative rather than quantitative. In practice, we usually want to know something about the *rate* of convergence. There are several ways of looking at this. We cover the two most common in this section and the next.

As a first step, fixing a Markov model $\mM$ with state space $S$ and transition matrix $P$, we use {eq}`eq-aspecrep` to write $P^t$ as

$$
P^t = \sum_{i=1}^{n-1} \lambda_i^t e_i \epsilon_i^\top + \1 \psi^* ,
$$ (eq-decmp)

where each $\lambda_i$ is an eigenvalue of $P$ and $e_i$ and $\epsilon_i$ are the right and left eigenvectors corresponding to $\lambda_i$. We have also ordered the eigenvalues from smallest to largest, and used the Perron–Frobenius Theorem to infer that $\lambda_n = r(P) = 1$, as well as the arguments in the proof of {prf:ref}`t-crmst` that showed $e_n = \1$ and $\epsilon_n^\top = \psi^*$.

Premultiplying $P^t$ by arbitrary $\psi \in \dD(S)$ and rearranging now gives

$$
\psi P^t - \psi^* = \sum_{i=1}^{n-1} \lambda_i^t \psi e_i \epsilon_i^\top
$$

Recall that eigenvalues are ordered from smallest to largest and. Moreover, by the Perron–Frobenius Theorem, $\lambda_i < 1$ for all $i < n$ when $P$ is primitive (i.e., $\mM$ is strongly connected and aperiodic). Hence, after taking the Euclidean norm deviation, we obtain

$$
\| \psi P^t - \psi^* \| = O( \eta^t )
    \quad \text{where} \quad
    \eta := |\lambda_{n-1}| < 1.
$$

Thus, the rate of convergence is governed by the modulus of the second largest eigenvalue.

The difference between the largest and second largest eigenvalue of a nonnegative matrix is often called the **spectral gap**. For this reason, we can also say that, for primitive stochastic matrices, the rate of convergence is determined by the (nonzero) spectral gap.

```{prf:example}

When studying the worker model with hiring rate $\alpha$ and firing rate $\beta$ in {ref}`sss-wdi`, we found that the eigenvalues of the transition matrix $P_w$ are $\lambda_1 = 1 - \alpha - \beta$ and $\lambda_2 = 1$. Hence the spectral gap is $\alpha + \beta$ and the rate of convergence is $O((1-\alpha-\beta)^t)$. High hiring and firing rates both produce faster convergence. In essence, this is because higher hiring and firing rates mean workers do not stay in any state for long, so initial conditions die out faster.
```


(ss-mdc)=
### The Markov–Dobrushin Coefficient
The rate of convergence of $\psi P^t$ to $\psi^*$ given in {ref}`sss-specgap` restricts the Euclidean distance between these vectors as a function of $t$. There are, however, other metrics we could use in studying rates of convergence, and sometimes these other metrics give more convenient results. In fact, as we show in this section, a good choice of metric leads us to a more general stability result than the (better known) aperiodicity-based result in {ref}`ss-stabil`.

#### An Alternative Metric

For the purposes of this section, For $\phi, \psi \in \dD(S)$, we set

```{math}
:enumerated: false

\rho(\phi, \psi) 
    := \|\phi - \psi\|_1
    := \sum_{x \in S} | \phi(x) - \psi(x) |,
```

which is just the $\ell_1$ deviation between $\phi$ and $\psi$ (see {ref}`sss-norms`).

```{exercise}
:label: ex-borho

Show that, for any $\phi, \psi \in \dD(S)$, we have

(i) $\rho(\phi, \psi) \leq 2$.

(ii) $\rho(\phi P, \psi P) \leq \rho(\phi, \psi)$ for any stochastic matrix $P$
```


````{solution} ex-borho

Regarding part (i), the triangle inequality, combined with the assumption that $\phi, \psi \in \dD(S)$, gives the bound

```{math}
:enumerated: false

\sum_x | \phi(x) - \psi(x) | \leq
        \sum_x |\phi(x)| + \sum_x |\psi(x)| \leq 2.
```

Regarding part (ii), if $P$ is a stochastic matrix, then

```{math}
:enumerated: false

\rho(\phi P, \psi P)
        = \sum_y
            \left| 
                \sum_x P(x, y) \phi(x) - \sum_x P(x, y) \psi(x) 
            \right|
        \leq \sum_y \sum_x
            P(x, y)
            \left| 
                \phi(x) - \psi(x) 
            \right|.
```

Swapping the order of summation and using $\sum_y P(x, y) = 1$ proves the claim.
````


Property (ii) is called the **nonexpansiveness property** of stochastic matrices under the $\ell_1$ deviation. As we will see, we can tighten this bound when $P$ satisfies certain properties.

As a first step we note that, for the $\ell_1$ deviation, given any stochastic matrix $P$, we have

$$
\rho(\phi P, \psi P)
    \leq (1 - \alpha(P)) \rho(\phi, \psi),
$$ (eq-bfmd)

where

$$
\alpha(P) 
    := \min
        \left\{
            \sum_{y \in S} [P(x,y) \wedge P(x', y)]
            \; :\;
            (x, x') \in S \times S
        \right\}.
$$ (eq-mdc)

Here $a \wedge b := \min\{a, b\}$ when $a, b \in \RR$. We call $\alpha(P)$ the **Markov–Dobrushin coefficient** of $P$, although other names are also used in the literature. A proof of the bound in {eq}`eq-bfmd` can be found in {cite}`stachurski2022economic` or {cite}`seneta2006markov`.[^3]

````{exercise}
:label: ex-mcs-auto-8

Consider the stochastic matrices

```{math}
:enumerated: false

P_w =
        \begin{pmatrix}
            1-\alpha & \alpha \\
            \beta & 1-\beta 
        \end{pmatrix}.
```

Show that $\alpha(P_w) = 0$ if and only if $\alpha=\beta=0$ or $\alpha=\beta=1$.
````


How should the Markov–Dobrushin coefficient be understood? The coefficient is large when the rows of $P$ are relatively similar. For example, if rows $P(x, \cdot)$ and $P(x', \cdot)$ are identical, the $\sum_{y \in S} [P(x,y) \wedge P(x', y)] = 1$. Similarity of rows is related to stability. The next exercise helps to illustrate.

```{exercise}
:label: ex-mcs-auto-9

Let $P$ be such that all rows are identical and equal to $\phi \in \dD(S)$. Prove that global stability holds in one step, in the sense that $\phi$ is the unique stationary distribution and $\psi P = \phi$ for all $\psi \in \dD(S)$.
```


```{exercise}
:label: ex-mcs-auto-10

Using {eq}`eq-bfmd`, show that, for any $\phi, \psi \in \dD(S)$, we have

$$
\rho(\phi P^t, \psi P^t)
        \leq (1 - \alpha(P))^t \rho(\phi, \psi)
        \quad \text{for all } \;
        t \in \NN.
$$ (eq-bfmdt)
```


````{solution} ex-mcs-auto-10

Fix $\phi, \psi \in \dD(S)$. From {eq}`eq-bfmd` we know that {eq}`eq-bfmdt` is true when $t=1$. Now suppose it is true at $t$. Then, using the fact that {eq}`eq-bfmd` holds for any pair of distributions,

```{math}
:enumerated: false

\rho(\phi P^{t+1}, \psi P^{t+1})
            \leq (1 - \alpha(P)) \rho(\phi P^t, \psi P^t)
            \leq (1 - \alpha(P))^{t+1} \rho(\phi, \psi)
```

where the last step uses the induction hypothesis. Hence {eq}`eq-bfmdt` also holds at $t+1$, and, by induction, at all $t \in \NN$.
````


Since powers of stochastic matrices are again stochastic, and since {eq}`eq-bfmd` is valid for any stochastic matrix, the bound in {eq}`eq-bfmdt` can be generalized by replacing $P$ with $P^k$ for any given $k \in \NN$, which gives (with $t$ replaced by $\tau$)

```{math}
:enumerated: false

\rho(\phi P^{\tau k}, \psi P^{\tau k})
        \leq (1 - \alpha(P^k))^\tau \rho(\phi, \psi)
        \quad \text{for all } \;
        \tau \in \NN.
```

Now observe that, for any $t \in \NN$, we can write $t = \tau k + j$, where $\tau \in \ZZ_+$ and $j \in \{0, \ldots, k-1\}$. Fixing $t$ and choosing $j$ to make this equality hold, we get

```{math}
:enumerated: false

\rho(\phi P^t, \psi P^t)
    = \rho(\phi P^{\tau k + j}, \psi P^{\tau k + j})
    \leq \rho(\phi P^{\tau k}, \psi P^{\tau k})
        \leq (1 - \alpha(P^k))^\tau \rho(\phi, \psi)
```

where the second inequality is due to the nonexpansive property of stochastic matrices ({prf:ref}`ex-borho`). Since $\tau$ is an integer satisfying $\tau = \lfloor t/k \rfloor$, where $\lfloor \cdot \rfloor$ is the floor function, we can now state the following.

```{prf:theorem}
:label: t-mbbk

Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. For all $\phi, \psi \in \dD(S)$ and all $k, t \in \NN$, we have

$$
\rho(\phi P^t, \psi P^t)
        \leq (1 - \alpha(P^k))^{\lfloor t/k \rfloor} \rho(\phi, \psi).
$$ (eq-bfmdt2)
In particular, if there exists a $k \in \NN$ such that $\alpha(P^k) > 0$, then $\mM$ is globally stable.
```


To see why the global stability implication stated in {prf:ref}`t-mbbk` holds, suppose there exists a $k \in \NN$ such that $\alpha(P^k)>0$. Now substitute arbitrary $\psi \in \dD(S)$ and any stationary distribution $\psi^*$ for $P$ into {eq}`eq-bfmdt2` to obtain

$$
\rho(\psi P^t, \psi^*)
    \leq (1 - \alpha(P^k))^{\lfloor t/k \rfloor} \rho(\psi, \psi^*)
    \leq 2 (1 - \alpha(P^k))^{\lfloor t/k \rfloor}
$$ (eq-mdt)

for all $t \in \NN$, where the second bound is due to {prf:ref}`ex-borho`.

```{exercise}
:label: ex-mcs-auto-11

In the preceding discussion, the distribution $\psi^*$ was taken to be any stationary distribution of $P$. Using {eq}`eq-mdt`, prove that $P$ has only one stationary distribution when $\alpha(P^k) > 0$.
```


One of the major advantages of {prf:ref}`t-mbbk` is that strong connectivity of $\mM$ is not required. In the next section we will see an example of a finite Markov model $\mM$ where (i) strong connectivity fails but (ii) the conditions of {prf:ref}`t-mbbk` are satisfied.[^4]

```{exercise}
:label: ex-mcs-auto-12

Let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. Prove the existence of a $k \in \NN$ with $\alpha(P^k) > 0$ whenever $\mM$ is strongly connected and aperiodic.
```


```{solution} ex-mcs-auto-12

If $\mM$ is strongly connected and aperiodic, then $P$ is primitive, in which case there exists a $k \in \NN$ with $P^k \gg 0$. Clearly $\alpha(P^k) > 0$.
```


#### Sufficient Conditions

While the Markov–Dobrushin coefficient $\alpha(P^k)$ can be calculated for any given $k$ on a computer by stepping through all pairs of rows in $P^k$, this calculation is computationally intensive when $S$ is large. When applicable, the following lemma simplifies the problem by providing a sufficient condition for $\alpha(P^k) > 0$.

```{prf:lemma}
:label: l-kdw

Let $k$ be a natural number and let $\mM$ be a finite Markov model with state space $S$ and transition matrix $P$. If there is a state $z \in S$ such that, for every $x \in S$, there exists a directed walk from $x$ to $z$ of length $k$, then $\alpha(P^k) > 0$.
```


````{prf:proof}
:nonumber:

Let $k \in \NN$ and $z \in S$ be such that, for every $x \in S$, there exists a directed walk from $x$ to $z$ of length $k$. By {prf:ref}`p-accesspos`, we then have $r := \min_{x \in S} P^k(x, z) > 0$. Since, for any $x, x' \in S$,

```{math}
:enumerated: false

\sum_{y \in S} [ P^k(x,y) \wedge P^k(x', y) ]
            \geq P^k(x,z) \wedge P^k(x', z) \geq r > 0,
```

strict positivity of $\alpha(P^k)$ now follows from the definition of the Markov–Dobrushin coefficient. ◻
````


```{prf:example}

Consider the digraph in {numref}`f-io_reducible_r`. This digraph is not strongly connected because 4 is not accessible from anywhere. However, there exists a directed walk from any vertex to vertex 1 in $k=2$ steps. For example, from 2 we can choose $2 \to 1$ and then $1 \to 1$, from 1 we can choose $1 \to 1$ and then $1 \to 1$, etc. Hence, if {numref}`f-io_reducible_r` is the digraph of a finite Markov model with transition matrix $P$, then $\alpha(P^2) > 0$.
```


```{figure} figures/tikz_io_reducible_r.svg
:name: f-io_reducible_r

A digraph with walk of length 2 from any node to 1
```

```{prf:example}

Consider the Markov dynamics suggested in {numref}`f-poverty_trap`. Although there are no weights, we can see that `poor` is accessible from every state in one step, so $\mM$ must be globally stable. In addition, `poor` is, by itself, an absorbing set. Hence, by Exericse {prf:ref}`ex-gsaa`, for any choice of weights compatible with these edges, the stationary distribution will concentrate all its mass on `poor`.
```


```{prf:remark}

As was pointed out in proof of {prf:ref}`l-kdw`, under the conditions of that lemma we have $P^k(x, z) > 0$ for all $x \in S$. This means that $\alpha(P^k) > 0$ whenever $P^k$ has a strictly positive column.
```


(sss-pagerank)=
#### Application: PageRank
In {ref}`ss-netcen` we discussed centrality measures for networks. Centrality measures provide a ranking of vertices in the network according to their "centrality" or "importance." One of the most important applications of ranking of vertices in a network is ranking the importance of web pages on the internet. Historically, the most prominent example of a ranking mechanism for the internet is PageRank, which transformed Google from a minor start up to a technology behemoth. In this section we provide a simple introduction to the original form of PageRank and connect it to previously discussed measures of centrality.

Consider a finite collection of web pages $W$ and let $L$ be the hyperlinks between them. We understand $(W, L)$ as a digraph $\gG$, where $W$ is the vertices and $L$ is the edges. Let $A$ be the associated adjacency matrix, so that $A(u, v) = 1$ if there is a link from $u$ to $v$ and zero otherwise. We set $n = |W|$, so that $A$ is $n \times n$.

To start our analysis, we consider the case where $\gG$ is strongly connected, such as the small network in {numref}`f-transitions`. Furthermore, we introduce a second matrix $P$ in which each row of $A$ has been normalized so that it sums to one. For the network in {numref}`f-transitions`, this means that

```{math}
:enumerated: false

A = 
    \begin{pmatrix}
        0 & 1 & 1 & 1 \\
        0 & 0 & 1 & 0 \\
        0 & 0 & 0 & 1 \\
        1 & 0 & 0 & 0 
    \end{pmatrix}
    \quad \text{and} \quad
    P = 
    \begin{pmatrix}
        0 & 1/3 & 1/3 & 1/3 \\
        0 & 0 & 1 & 0 \\
        0 & 0 & 0 & 1 \\
        1 & 0 & 0 & 0 
    \end{pmatrix}.
```

Now consider an internet surfer who, once per minute, randomly clicks on one of the $k$ outgoing links on a page, each link selected with uniform probability $1/k$. The idea of PageRank is to assign to each page $u \in W$ a value $g(u)$ equal to the fraction of time that this surfer spends on page $u$ over the long run. Intuitively, a high value for $g(u)$ indicates a heavily visited and hence important site.

```{figure} figures/tikz_transitions.svg
:name: f-transitions

A digraph with walk of length 2 from any node to 1
```

The vector $g$ is easy to compute, given our knowledge of Markov chains. Let $\mM$ be the finite Markov model associated with the random surfer, with state space $W$ and adjacency matrix given by $P$. Since $\mM$ is strongly connected, the ergodicity theorem tells us that $P$ has a unique stationary distribution $\psi^*$, and that the fraction of time the surfer spends at page $u$ is equal to the probability assigned to $u$ under the stationary distribution (see, in particular, {eq}`eq-erginterp`). Hence $g = \psi^*$.

As $g$ is stationary and $r(P)=1$, we can write $g = (1/r(P)) g P$. Taking transposes gives $g^\top = (1/r(P)) P^\top g^\top$. Comparing with {eq}`eq-eicena0`, we see that, for this simple case, the PageRank vector $g$ is just the authority-based eigenvector centrality measure of $\mM$. Thus, PageRank gives high ranking to pages with many inbound links, attaching high value to inbound links from pages that are themselves highly ranked.

There are two problems with the preceding analysis. First, we assumed that the internet is strongly connected, which is clearly violated in practice (we need only one page with no outbound links). Second, internet users sometimes select pages without using hyperlinks, by manually entering the URL.

The PageRank solution to this problem is to replace $P$ with the so-called **Google matrix**

```{math}
:enumerated: false

G := \delta P + (1 - \delta) \frac{1}{n} \1,
```

where $\1$ is the $n \times n$ matrix of ones. The value $\delta \in (0, 1)$ is called the **damping factor**.

```{exercise}
:label: ex-mcs-auto-13

Prove that $G$ is a stochastic matrix for all $\delta \in (0, 1)$.
```


The Markov dynamics embedded in the stochastic matrix $G$ can be understood as follows: The surfer begins by flipping a coin with heads probability $\delta$. (See {prf:ref}`ex-concond` and its solution for the connection between convex combinations and coin flips.) If the coin is heads then the surfer randomly selects and follows one of the links on the current page. If not then the surfer randomly selects and moves to any page on the internet.

For given $\delta$, the PageRank vector for this setting is adjusted to be the stationary distribution of the Google matrix $G$.

```{exercise}
:label: ex-goosc

Verify that the digraph associated with the transition probabilities in $G$ is always strongly connected (assuming, as above, that $\delta \in (0, 1)$).
```


```{solution} ex-goosc

All elements of $G$ are strictly positive, so a directed edge exists between every pair of pages $u, v \in W$. This clearly implies strong connectedness.
```


As a result of {prf:ref}`ex-goosc`, we can always interpret the stationary of $G$ as telling us the fraction of time that the surfer spends on each page in the long run.

```{exercise}
:label: ex-mcs-auto-14

Use {eq}`eq-mdt` to obtain a rate of convergence of $\psi G^t$ to the adjusted PageRank vector $g^*$ (i.e., the unique stationary distribution $g^*$ of $G$), where $\psi$ is an arbitrary initial distribution on $W$. (Set $k=1$.)
```


````{solution} ex-mcs-auto-14

For any $u, u', v \in W$, we have $G(u, v) \wedge G(u', v) \geq 1-\delta$. Hence $\alpha(G)  \geq 1-\delta$. Therefore, by {eq}`eq-mdt`, we have

```{math}
:enumerated: false

\rho(\psi G^t, g^*) \leq 2 \delta^t .
```
````


### Information and Social Networks

In recent years, the way that opinions spread across social networks has become a major topic of concern in many countries around the globe. A well-known mathematical model of this phenomenon is **De Groot learning**, which was originally proposed in {cite}`degroot1974reaching`. This mechanism has linear properties that make it relatively easy to analyze (although large and complex underlying networks can cause significant challenges).

In De Groot learning, a group of agents, labeled from $1$ to $n$, is connected by a social or information network of some type. Connections are indicated by a **trust matrix** $T$, where, informally,

```{math}
:enumerated: false

T(i, j) = \text{amount that } i \text{ trusts the opinion of } j.
```

In other words, $T(i,j)$ is large if agent $i$ puts a large positive weight on the opinion of agent $j$. The matrix $T$ is assumed to be stochastic.

We can view the trust matrix as an adjacency matrix for a weighed digraph $\sS$ with vertex set $V := \natset{n}$ and edges

```{math}
:enumerated: false

E = \{(i, j) \in V \times V \,:\, T(i,j) > 0\}.
```

```{figure} figures/fig_degroot.svg
:name: f-degroot

Two social networks
```

{numref}`f-degroot` shows two social networks $\sS_a$ and $\sS_b$ with trust matrices given by

```{math}
:enumerated: false

T_a = 
    \begin{pmatrix}
        1 & 0 & 0 & 0 \\
        0.5 & 0.1 & 0.4 & 0 \\
        0.5 & 0.4 & 0.1 & 0 \\
        0 & 0.5 & 0 & 0.5 
    \end{pmatrix} 
    \quad \text{and} \quad
    T_b = 
    \begin{pmatrix}
        0.8 & 0 & 0 & 0.2 \\
        0.5 & 0.1 & 0.4 & 0 \\
        0.5 & 0.4 & 0.1 & 0 \\
        0 & 0.5 & 0 & 0.5 
    \end{pmatrix}
```

respectively. In network A, agent 1 places no trust in anyone's opinion but his own. In network B, he places at least some trust in the opinion of agent 4. Below we show how these differences matter for the dynamics of beliefs.

#### Learning

At time zero, all agents have an initial subjective belief concerning the validity of a given statement. Belief takes values in $[0, 1]$, with 1 indicating complete (subjective) certainty that the statement is true. Let $b_0(i)$ be the belief of agent $i$ at time zero.

An agent updates beliefs sequentially based on the beliefs of others, weighted by the amount of trust placed in their opinion. Specifically, agent $i$ updates her belief after one unit of time to $\sum_{j =1}^n T(i, j) b_0(j)$. More generally, at time $t+1$, beliefs update to

$$
b_{t+1}(i) = \sum_{j =1}^n T(i, j) b_t(j)
    \qquad (i \in V).
$$

In matrix notation this is $b_{t+1} = T b_t$, where each $b_t$ is treated as a column vector.

(Notice that this update rule is similar but not identical to the marginal distribution updating rule for Markov chains (the forward equation) discussed. Here we are postmultiplying by a column vector rather than premultiplying be a row vector.)

```{exercise}
:label: ex-mcs-auto-15

If some subgroup of agents $U \subset V$ is an absorbing set for the digraph $\sS$, indicating that members of this group place no trust in outsiders, then the initial beliefs $\{b_0(i)\}_{i \in U^c}$ of the outsiders (members of $U^c = V \setminus U$) have no influence on the beliefs of the insiders (members of $U$) at any point in time. Prove that this is true.
```


#### Consensus

A social network $\sS$ is said to lead to **consensus** if $|b_t(i) - b_t(j)| \to 0$ as $t \to \infty$ for all $i, j \in V$. Consensus implies that all agents eventually share the same belief. An important question is, what conditions on the network lead to a consensus outcome?

```{prf:proposition}
:label: p-consen

If there exists a $k \in \NN$ such that $\alpha(T^k) > 0$, then consensus is obtained. In particular,

$$
|b_t(i) - b_t(j)|
        \leq 2 (1 - \alpha(T^k))^{\lfloor t/k \rfloor}
        \quad \text{for all } t \in \NN \text{ and } i, j \in V.
$$
```


````{prf:proof}
:nonumber:

Fix $i,j \in V$ and $t \in \NN$. Let $b = b_0$. For any $\phi, \psi \in \dD(V)$, an application of the triangle inequality gives

```{math}
:enumerated: false

| \phi T^t b - \psi T^t b|
        = \left|
                \sum_j (\phi T^t)(j) b(j)
                - \sum_j (\psi T^t)(j) b(j)
            \right| 
        \leq \sum_j
            \left|
                (\phi T^t)(j) 
                - (\psi T^t)(j) 
            \right| ,
```

where we have used the fact that $|b(j)| = b(j) \leq 1$. Applying the definition of the $\ell_1$ deviation and {eq}`eq-bfmdt2`, we obtain the bound

$$
| \phi T^t b - \psi T^t b|
        \leq
        (1 - \alpha(T^k))^{\lfloor t/k \rfloor} \rho(\phi, \psi) 
        \leq 2  (1 - \alpha(T^k))^{\lfloor t/k \rfloor} .
$$ (eq-tbbond)
Since this bound is valid for any choice of $\phi, \psi \in \dD(V)$, we can specialize to $\phi = \delta_i$ and $\psi = \delta_j$ and, applying $T^t b = b_t$, get

```{math}
:enumerated: false

|b_t(i) - b_t(j)| 
        = | \delta_i T^t b - \delta_j T^t b| 
        \leq 2  (1 - \alpha(T^k))^{\lfloor t/k \rfloor} .
        
```
````


{prf:ref}`p-consen` can be applied to the two social networks $\sS_a$ and $\sS_b$ in {numref}`f-degroot`. For example, in network $\sS_a$, for every node $i$, there exists a walk of length 2 from $i$ to node $1$. Hence, by {prf:ref}`l-kdw`, we have $\alpha(T^2) > 0$. In network $\sS_b$ the same is true.

```{exercise}
:label: ex-mcs-auto-16

Let $\sS$ be a social network with trust (and adjacency) matrix $T$. Use {prf:ref}`p-consen` to show that $\sS$ leads to consensus whenever $\sS$ is strongly connected and aperiodic.
```


```{solution} ex-mcs-auto-16

If $\sS$ is strongly connected and aperiodic, then the adjacency matrix $T$ is primitive, so there exists a $k \in \NN$ such that $T^k \gg 0$. Hence $\alpha(T^k) > 0$, and {prf:ref}`p-consen` applies.
```


#### Influence of Authorities

Now let's consider what beliefs converge to when consensus emerges. In particular, we are interested in discovering whose opinions are most influential under De Groot learning, for a given trust matrix.

To answer the question, let $\sS$ be a given social network with trust matrix $T$. Suppose that $\alpha(T^k) > 0$ for some $k \in \NN$. By {prf:ref}`t-mbbk`, the network $\sS$ is globally stable when viewed as a finite Markov model. Let $\psi^*$ be the unique stationary distribution, so that $\psi^* = \psi^* T$.

Applying {eq}`eq-tbbond` with $\phi = \delta_i$ and $\psi = \psi^*$ yields

```{math}
:enumerated: false

\left| 
        b_t(i) - b^* 
    \right|
    \leq
    (1 - \alpha(T^k))^{\lfloor t/k \rfloor} \rho(\phi, \psi) 
    \leq 2  (1 - \alpha(T^k))^{\lfloor t/k \rfloor}
```

where

```{math}
:enumerated: false

b^* := \sum_{j \in V} \psi^*(j)b_0(j) .
```

We conclude that the belief of every agent converges geometrically to $b^*$, which is a weighted average of the initial beliefs of all agents. In particular, those agents with high weighting under the stationary distribution have a large influence on these equilibrium beliefs.

We can interpret this through notions of centrality. Since $r(T)=1$, we have $(\psi^*)^\top = (1/r(T)) T^\top (\psi^*)^\top$, so $\psi^*$ is the authority-based eigenvector centrality measure on $\sS$. Thus, the influence of each agent on long run beliefs is proportional to their authority-based eigenvector centrality. This makes sense because such agents are highly trusted by many agents who are themselves highly trusted.

```{exercise}
:label: ex-mcs-auto-17

For network $\sS_a$ in {numref}`f-degroot`, show that $b^* = b_0(1)$. That is, all agents' beliefs converge to the belief of agent 1.
```


```{exercise}
:label: ex-mcs-auto-18

Using a computer, show that the stationary distribution for $\sS_b$, rounded to two decimal places, is $\psi^* = (0.56, 0.15, 0.07, 0.22)$. (Notice how the relatively slight change in network structure from $\sS_a$ to $\sS_b$ substantially reduces the influence of agent 1.)
```


## Chapter Notes

High quality treatments of finite-state Markov dynamics include {cite}`norris1998markov`, {cite}`privault2013understanding` and {cite}`haggstrom2002finite`. For the general state case see {cite}`meyn2009markov`.

A review of De Groot learning is available in {cite}`jackson2010social`. Some interesting extensions related to the "wisdom of crowds" phenomenon are provided in {cite}`golub2010naive`. {cite}`molavi2018theory` provide a theory of social learning that includes De Groot learning as a special case. {cite}`acemoglu2021misinformation` study misinformation and echo chambers in information networks. {cite}`board2021learning` analyze learning dynamics in continuous time on large social networks. {cite}`shiller2020narrative` provides an interesting discussion of how ideas spread across social networks and shape economic outcomes. In a large-scale empirical study, {cite}`chetty2022social` analyze how cross-class friendships influence social mobility. {cite}`acemoglu2023learning` consider the effect of strong and weak links on Bayesian learning in a social network. {cite}`dasaratha2022learning` analyze how Bayesian agents learn about a changing state by interacting with their neighbors. While the resulting dynamics are similar to those of the De Groot model, they are generated as an equilibrium outcome rather than imposed as a behavioral assumption.

[^1]: {prf:ref}`eg-quahpred` is intended as an illustration of the mechanics of updating distributions. While the methodology in {cite}`quah1993empirical` is thought provoking, it struggles to make plausible long run predictions about something as complex as the cross-country income distribution. Indeed, the Kullback–Leibler deviation between the predicted and realized 2019 distributions is actually larger than the Kullback–Leibler deviation between the 1985 and 2019 distributions. Evidently, a naive estimate "nothing will change" model predicts better than Quah's. Most of the focus in this text is on short term forecasts and scenarios, where the system is approximately stationary after suitable transformations, rather than heroic long term predictions where nonstationary change is hard to quantify.

[^2]: There are many useful extensions to Brouwer's theorem, such as one for set-valued functions due to {cite}`kakutani1941generalization`. These results have many applications in economics (see, for example, {cite}`nash1950equilibrium`). Another paper, due to {cite}`schawder1930fixpunktsatz`, extends Brouwer's result to infinite dimensional spaces.

[^3]: {cite}`seneta2006markov` also discusses the history of Andrey Markov's work, which originated the kinds of contraction based arguments used in this section.

[^4]: It can be shown that the condition $\alpha(P^k) > 0$ for some $k \in \NN$ is necessary as well as sufficient for global stability of a finite Markov model. Hence the conditions of {prf:ref}`t-mbbk` are strictly weaker than strong connectedness plus aperiodicity, as used in {prf:ref}`t-kb`.
