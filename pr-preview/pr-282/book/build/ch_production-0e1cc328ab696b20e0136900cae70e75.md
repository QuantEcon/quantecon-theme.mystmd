---
title: "Production"
label: c-prod
---

In this chapter we study production in multisector environments. The basic framework is input-output analysis, which was initiated by Wassily Leontief (1905–1999) and popularized in {cite}`leontief1941structure`. Input-output analysis is routinely used to organize national accounts and study inter-industry relationships. In 1973, Leontief received the Nobel Prize in Economic Sciences for his work on input-output systems.

Input-output analysis is currently being incorporated into modern theories of trade, growth, shock propagation and aggregate fluctuations in multisector models ({ref}`s-cnprod` provides a detailed list of references). One of the reasons for renewed interest is that the introduction of concepts from network analysis and graph theory has yielded new insights. This chapter provides an introduction to the main ideas.

(ss-mutmod)=
## Multisector Models
In this section we introduce the basic input output model, explain the network interpretation of the model, and connect traditional questions, such as the relative impact of demand shocks across sectors, to network topology and network centrality.

### Production Networks

We begin with the foundational concepts of input-output tables and how they relate to production networks. To simplify the exposition, we ignore imports and exports in what follows. (References for the general case are discussed in {ref}`s-cnprod`.)

(sss-prodnet)=
#### Input-Output Analysis
Agencies tasked with gathering national and regional production accounts (such as the US Bureau of Economic Analysis) compile input-output data based on the structure set out by {cite}`leontief1941structure`. Firms are divided across $n$ sectors, each of which produces a single homogeneous good. These sectors are organized into an input-output table, a highly simplified example of which is

|  | sector 1 | sector 2 | sector 3 |
|---|:---:|:---:|:---:|
| sector 1 | $a_{11}$ | $a_{12}$ | $a_{13}$ |
| sector 2 | $a_{21}$ | $a_{22}$ | $a_{23}$ |
| sector 3 | $a_{31}$ | $a_{32}$ | $a_{33}$ |

Entries $a_{ij}$ are called the **input-output coefficients**;

```{math}
:enumerated: false

a_{ij} = 
    \frac{\text{value of sector } j \text{'s inputs purchased from sector } i}
        {\text{total sales of sector } j}.
```

Thus, $a_{ij}$ is large if sector $i$ is an important supplier of intermediate goods to sector $j$. The sum of the $j$-th column of the table gives the value of all inputs to sector $j$. The $i$-th row shows how intensively each sector uses good $i$ as an intermediate good.

The **production coefficient matrix** $A = (a_{ij})$ induces a weighted digraph $\gG = (V, E, w)$, where $V = \natset{n}$ is the list of sectors and

```{math}
:enumerated: false

E := \setntn{(i, j) \in V \times V}{a_{ij} > 0}
```

is the edge set. The values $a_{ij}$ show backward linkages across sectors.

Given $i \in V$, the set $\oO(i)$ of direct successors of $i$ is all sectors to which $i$ supplies a positive quantity of output. The set $\iI(i)$ is all sectors that supply a positive quantity to $i$.

{numref}`f-input_output_analysis_15` illustrates the weighted digraph associated with the 15 sector version of the input-output tables provided by the Bureau of Economic Analysis for the year 2021.[^1] An arrow from $i$ to $j$ indicates a positive weight $a_{ij}$. Weights are indicated by the widths of the arrows, which are proportional to the corresponding input-output coefficients. The sector codes are provided in {numref}`tab-codes15`. The size of vertices is proportional to their share of total sales across all sectors.

A quick look at {numref}`f-input_output_analysis_15` shows that manufacturing (ma) is an important supplier for many sectors, including construction (co) and agriculture (ag). Similarly, the financial sector (fi) and professional services (pr) supply services to a broad range of sectors. On the other hand, education (ed) is relatively downstream and only a minor supplier of intermediate goods to other sectors.

The color scheme for the nodes is by hub-based eigenvector centrality, with hotter colors indicating higher centrality. Later, in {ref}`ss-dshocks` we will give an interpretation of hub-based eigenvector centrality for this setting that connects to relative impact of demand shocks.

```{figure} figures/input_output_analysis_15.svg
:name: f-input_output_analysis_15

Backward linkages for 15 US sectors in 2021
```

````{table}
:name: tab-codes15

Sector codes for the 15 good case

| Label | Sector |
|---|---|
| ag | Agriculture, forestry, fishing, and hunting |
| mi | Mining |
| ut | Utilities |
| co | Construction |
| ma | Manufacturing |
| wh | Wholesale trade |
| re | Retail trade |
| tr | Transportation and warehousing |
| in | Information |
| fi | Finance, insurance, real estate, rental, and leasing |
| pr | Professional and business services |
| ed | Educational services, health care, and social assistance |
| ar | Arts, entertainment, accommodation, and food services |
| ot | Other services, except government |
| go | Government |
````

#### Connectedness

We will gain insights into input-output networks by applying some of the graph-theoretic notions studied in {prf:ref}`c-networks`. One elementary property we can investigate is connectedness. We can imagine that demand and productivity shocks diffuse more widely through a given production network when the network is relatively connected. Conversely, the impact of a demand shock occurring within an absorbing set will be isolated to sectors in that set.

The 15 sector network in {numref}`f-input_output_analysis_15` is strongly connected. Checking this visually is hard, so instead we use a graph-theoretic algorithm that finds strongly connected components from [QuantEcon](https://quantecon.org/)'s `DiGraph` class. (This class is convenient for the current problem because instances are created directly from the adjacency matrix.) Examining the attributes of this class when the weights are given by the 15 sector input-output model confirms its strong connectedness. The same class can be used to verify that the network is also aperiodic. Hence, the input-output matrix $A$ is primitive. This fact will be used in computations below.

#### Disaggregation

{numref}`f-input_output_analysis_71` repeats the graphical representation for the more disaggregated 71 sector case. Sector codes are provided in {numref}`tab-codes71`. Input-output coefficients below $0.01$ were rounded to zero to increase visual clarity. As in the 15 sector case, the size of vertices and edges is proportional to share of sales and input-output coefficients respectively. Hotter colors indicate higher hub-based eigenvector centrality (which we link to propagation of demand shocks in {ref}`ss-dshocks`).

```{figure} figures/input_output_analysis_71.svg
:name: f-input_output_analysis_71

Network for 71 US sectors in 2021
```

````{table}
:name: tab-codes71

Sector codes for the 71 good case

| IO Code | Sector | IO Code | Sector |
|---|---|---|---|
| 111CA | Farms | 486 | Pipeline transportation |
| 113FF | Forestry, fishing | 487OS | Other transportation |
| 211 | Oil and gas extraction | 493 | Warehousing and storage |
| 212 | Mining, except oil, gas | 511 | Publishing industries |
| 213 | Mining support activities | 512 | Motion picture and sound |
| 22 | Utilities | 513 | Broadcasting, telecommunications |
| 23 | Construction | 514 | Data processing, internet publishing |
| 321 | Wood products | 521CI | Reserve banks, credit intermediation |
| 327 | Nonmetallic mineral products | 523 | Securities and investments |
| 331 | Primary metals | 524 | Insurance carriers |
| 334 | Computer & electronic products | 525 | Funds, trusts, financial vehicles |
| 333 | Machinery | HS | Housing |
| 332 | Fabricated metal products | ORE | Other real estate |
| 335 | Electrical equipment | 532RL | Rental and leasing services |
| 337 | Furniture | 55 | Firm management |
| 3364OT | Other transportation equipment | 5415 | Computer systems design |
| 3361MV | Motor vehicles, parts | 5412OP | Miscellaneous technical services |
| 339 | Miscellaneous manufacturing | 5411 | Legal services |
| 311FT | Food, beverage, tobacco | 561 | Administrative |
| 313TT | Textile mills and products | 562 | Waste management |
| 315AL | Apparel and leather | 61 | Educational services |
| 322 | Paper products | 621 | Ambulatory health care services |
| 323 | Printing | 622 | Hospitals |
| 324 | Petroleum and coal | 623 | Nursing and residential care facilities |
|  | coal products |  | residential care facilities |
| 325 | Chemical products | 624 | Social assistance |
| 326 | Plastics, rubber | 711AS | Arts, spectator sports, museums |
| 42 | Wholesale trade | 713 | Amusements, gambling, recreation |
| 441 | Motor vehicle and parts dealers | 721 | Accommodation |
| 445 | Food and beverage stores | 722 | Food services and drinking places |
| 452 | General merchandise stores | 81 | Other services, except government |
| 4A0 | Other retail | GFGD | Federal government (defense) |
| 481 | Air transportation | GSLE | State and local government enterprises |
| 482 | Rail transportation | GFE | Federal government enterprises |
| 483 | Water transportation | GSLG | State and local government |
| 484 | Truck transportation | GFGN | Federal government (nondefense) |
| 485 | Passenger transportation |  |  |
````

Unlike the 15 sector case, the 71 sector 2021 input-output matrix is not strongly connected. This is because it contains sinks (sectors with zero out-degree). For example, according to the data, 441 "motor vehicle and parts dealers" do not supply any intermediate inputs, although they do of course supply products to final consumers.

(sss-ioeq)=
### Equilibrium
Equilibrium in Leontief models involves tracing the impact of final demand as it flows backward through different sectors in the economy. To illustrate the challenges this generates, consider the simplified network shown in {numref}`f-io_irreducible`. Suppose sector 3 receives a positive demand shock. Meeting this demand will require greater output from its immediate suppliers, which are sectors 2 and 4. However, an increase in production in sector 2 requires more output from sector 1, which then requires more output from sector 3, where the initial shock occurred. This, in turn, requires more output from sectors 2 and 4, and so on. Thus, the chain of backward linkages leads to an infinite loop. Resolving this tail chasing problem requires some analysis.

```{figure} figures/tikz_io_irreducible.svg
:name: f-io_irreducible

A simple production network
```

#### Identities

To start our search for equilibria, we set

- $d_i :=$ final consumer demand for good $i$.

- $x_i :=$ total sales of sector $i$.

- $z_{ij} :=$ inter-industry sales from sector $i$ to sector $j$.

All numbers are understood to be in units of national currency—dollars, say. For each sector $i$ we have the accounting identity

$$
x_i = \sum_{j=1}^n z_{ij} + d_i,
$$ (eq-sales)

which states that total sales are divided between sales to other industries and sales to final consumers.

Notice that

$$
\frac{z_{ij}}{x_j}
    = \text{dollar value of inputs from } i \text{ per dollar output from } j
    = a_{ij} ,
$$ (eq-leona)

where the values $a_{ij}$ are the the input-output coefficients discussed in {ref}`sss-prodnet`. Using the coefficients, {eq}`eq-sales` can be rewritten as

$$
x_i = \sum_{j=1}^n a_{ij} x_j + d_i,
    \qquad i = 1, \ldots n.
$$ (eq-iorcon)

The first term on the right hand side is the amount of good $i$ required as inputs when the output vector is $x := (x_i)_{i=1}^n$. We can combine the $n$ equations in {eq}`eq-iorcon` into the linear system

$$
x = A x + d.
$$ (eq-nnlinsys)

(sss-prodeu)=
#### Existence and Uniqueness
So far we have used no more than accounting identities and definitions. However, we would also like to use {eq}`eq-nnlinsys` to determine output vector $x$ given demand vector $d$, taking $A$ as fixed. As a first step, we seek conditions under which nonnegative solutions to {eq}`eq-nnlinsys` exist and are unique.

The **value added** of sector $j$ is defined as sales minus spending on intermediate goods, or

```{math}
:enumerated: false

v_j := x_j -\sum_{i=1}^n z_{ij} .
```

```{prf:assumption}
:label: a-pva

The input-output adjacency matrix $A$ obeys

$$
\eta_j := \sum_{i=1}^n a_{ij} < 1
        \quad \text{for all } j \in \natset{n}.
$$
```


```{exercise}
:label: ex-aimi

Prove that {prf:ref}`a-pva` holds whenever value added is strictly positive in each sector.
```


```{solution} ex-aimi

Fix $j \in \natset{n}$. Since $a_{ij} = z_{ij}/x_j$, we have $\eta_j = \frac{\sum_{i=1}^n z_{ij}}{x_j}$. Hence, if $v_j > 0$, then $\eta_j < 1$.
```


{prf:ref}`ex-aimi` shows that {prf:ref}`a-pva` is very mild. For example, in a competitive equilibrium, where firms make zero profits, positive value added means that payments to factors of production other than intermediate goods (labor, land, etc.) are strictly positive.

```{exercise}
:label: ex-eara

Let $\eta(A) := \max_{j \in \natset{n}} \eta_j$. Prove that $r(A) \leq \eta(A)<1$ whenever {prf:ref}`a-pva` holds.
```


```{solution} ex-eara

It follows easily from {prf:ref}`a-pva` that $\eta(A) < 1$. Moreover, since $A \geq 0$, the results in {ref}`sss-someimp` imply that $r(A)$ is dominated by the maximum of the column sums of $A$. But this is precisely $\eta(A)$. Hence $r(A) \leq \eta(A)<1$.
```


```{prf:proposition}
:label: p-usolnn

If {prf:ref}`a-pva` holds, then, for each $d \geq 0$, the production system {eq}`eq-nnlinsys` has the unique nonnegative output solution

$$
x^* = L d 
        \quad \text{where } 
        L := (I - A)^{-1}.
$$ (eq-leoninv)
```


```{prf:proof}
:nonumber:

By {prf:ref}`ex-eara` and {prf:ref}`a-pva` we have $r(A) < 1$. Hence the Neumann series lemma (NSL) implies $x^*$ in {eq}`eq-leoninv` is the unique solution in $\RR^n$. Regarding nonnegativity, since $A$ is nonnegative, so is $A^i$ for all $i$. Hence $x^* \geq 0$, by the power series representation $L = \sum_{i=0}^\infty A^i$ provided by the NSL. ◻
```


The matrix $L = (\ell_{ij})$ in {eq}`eq-leoninv` is called the **Leontief inverse** associated with the coefficient matrix $A$. We discuss its interpretation in {ref}`ss-dshocks`.

```{exercise}
:label: ex-production-auto-1

A demand vector is called nontrivial if $d \neq 0$. Let $d$ be nontrivial and suppose that $r(A) < 1$. Show that, in equilibrium, every sector is active (i.e., $x^* \gg 0$) when $A$ is irreducible.
```


```{solution} ex-production-auto-1

Let $(A, d)$ be as stated. When $A$ is irreducible, $L := \sum_{i=1}^\infty A^i \gg 0$ and $x^* = L d$. Since $d$ is nontrivial, $x^* \gg 0$ follows from $L \gg 0$ and the definition of matrix multiplication.
```


```{exercise}
:label: ex-production-auto-2

A *closed* input-output system is one where $d=0$. A nontrivial solution of a closed system $x = Ax$ is a nonzero $x \in \RR^n_+$ such that $Ax^* = x^*$. Let $A$ be irreducible. Show that no nontrivial solution exists when $r(A) < 1$. Show that a nontrivial solution exists and is unique up to constant multiples when $r(A) = 1$.
```


```{solution} ex-production-auto-2

If $r(A) < 1$, then $I-A$ is nonsingular. At the same time, for the nontrivial solution $x$, we have $(I-A)x = 0$. Contradiction. If, on the other hand, $r(A)=1$, then, since $r(A)$ is an eigenvalue (by the Perron–Frobenius theorem), we have $A x = x$ for some $x \gg 0$. The uniqueness claim follows from the Perron–Frobenius theorem.
```


```{exercise}
:label: ex-production-auto-3

Consider a closed input-output system defined by input matrix $A$. Let $A$ be primitive. Show that every nontrivial solution is everywhere positive. Show that no nontrivial solution exists when $r(A) > 1$.
```


#### Assumptions

It is common to interpret the expression $x^* = (I - A)^{-1} d$ from {eq}`eq-leoninv` as meaning that supply is driven by demand. While this is not a universal truth, it does have plausibility in some settings, such as when analyzing demand shifts in the short run. Changes in demand lead to changes in inventories, which typically cause firms to modify production quantities. We investigate these ideas in depth in {ref}`ss-dshocks`.

Another assumption concerns the production function in each sector. You might recall from elementary microeconomics that the **Leontief production function** takes the form

$$
x 
    = f(z_1, \ldots, z_n)
    = \min\{ \gamma_1 z_1, \ldots, \gamma_n z_n \}.
$$ (eq-leoprod)

Here $x$ is output in a given sector, $\{\gamma_i\}$ is a set of parameters and $\{z_i\}$ is a set of inputs. To understand why {eq}`eq-leoprod` is called a Leontief production function, note that by {eq}`eq-leona` we have

$$
x_j = \frac{z_{ij}}{a_{ij}} 
    \quad \text{for all } i \in \natset{n} \text{ such that } a_{ij}> 0.
$$ (eq-leonai)

If we interpret $z/0 = \infty$ for all $z \geq 0$, then {eq}`eq-leonai` implies $x_j = \min_{i \in \natset{n}} z_{ij}/a_{ij}$. This is a version of {eq}`eq-leoprod` specialized to sector $j$. Hence {eq}`eq-leoprod` arises naturally from Leontief input-output analysis.

A final comment on assumptions is that, while the Leontief model is too simple for some purposes, it serves as a useful building block for more sophisticated models. We discuss one such model in {ref}`ss-eqmulm`.

(ss-dshocks)=
### Demand Shocks
In this section we study impacts of changes in demand via a power series representation $\sum_{i \geq 0} A^i$ of the Leontief inverse $L$. We assume throughout that $r(A) < 1$, so that the series and $L$ are finite and equal.

(sss-rds)=
#### Response to Demand Shocks
Consider the impact of a demand shock of size $\Delta d$, so that demand shifts from $d_0$ to $d_1 = d_0 + \Delta d$. The equilibrium output vector shifts from $x_0 = L d_0$ to $x_1 = L d_1$. Subtracting the first of these equations from the second and expressing the result in terms of differences gives $\Delta x = L \Delta d$. Using the geometric sum version of the Leontief inverse yields

$$
\Delta  x
    = \Delta d
    + A (\Delta d)
    + A^2 (\Delta d)
    + \cdots
$$

The sums in this term show how the shock propagates backward through the production network:

(i) $\Delta d$ is the initial response in each sector,

(ii) $A (\Delta d)$ is the response generated by the first round of backward linkages,

(iii) $A^2 (\Delta d)$ is the response generated by the second round, and so on.

The total response is the sum of responses at all rounds.

We can summarize the above by stating that a typical element $\ell_{ij}$ of $L = \sum_{m \geq 0} A^m$ shows the total impact on sector $i$ of a unit change in demand for good $j$, after taking into account all direct and indirect effects. $L$ itself is reminiscent of a Keynesian multiplier: changes in demand are multiplied by this matrix to generate final output.

{numref}`f-input_output_analysis_15_leo` helps visualize the Leontief inverse computed from the 15 sector network. Hotter colors indicate larger values for $\ell_{ij}$, with $i$ on the vertical axis and $j$ on the horizontal axis. We see, for example, that an increase in demand in almost any sector generates a rise in manufacturing output.

```{figure} figures/input_output_analysis_15_leo.svg
:name: f-input_output_analysis_15_leo

The Leontief inverse $L$ (hotter colors indicate larger values)
```

(sss-shockprop)=
#### Shock Propagation
{numref}`f-input_output_analysis_15_shocks` shows the impact of a given vector of demand shocks $\Delta d$ on the 15 sector input-output model. In this simulation, each element of $\Delta d$ was drawn independently from a uniform distribution. The vector $\Delta d$ is shown visually in the panel titled "round 0," with hotter colors indicating larger values. The shock draw was relatively large in retail (re) and information (in).

```{figure} figures/input_output_analysis_15_shocks.svg
:name: f-input_output_analysis_15_shocks

Propagation of demand shocks via backward linkages
```

The remaining rounds then show the values $A^2 (\Delta d)$, $A^4 (\Delta d)$, etc., with hotter colors indicating higher values. In each round, to make the within-round comparison between sectors clearer, values of the vector $A^i (\Delta d)$ are rescaled into the $[0,1]$ interval before the color map is applied.

Note that, by round 6, the values of $A^i (\Delta d)$ have settled into a fixed pattern. (This is only up to a scaling constant, since values are rescaled into $[0,1]$ as just discussed.) Manufacturing is the most active sector, while finance and professional services are also quite active. In fact, if we repeat the simulation with a new draw for $\Delta d$, the pattern of active sectors quickly converges to exactly the same configuration.

We can explain this phenomenon using the Perron–Frobenius theorem. Since $A$ is primitive (in the 15 sector case), we know that $r(A)^{-m} A^m$ converges to $e \epsilon^\top$ as $m \to \infty$, where $e$ and $\epsilon$ are the dominant left and right eigenvectors respectively, normalized so that $\inner{\epsilon, e}=1$. It follows that, for large $m$, we have

$$
A^m (\Delta d) \approx r(A)^m \inner{\epsilon, \Delta d} e.
$$ (eq-dshockk)

In other words, up to a scaling constant, the shock response $A^m (\Delta d)$ converges to the dominant right eigenvector, which is also the hub-based eigenvector centrality measure.

In {numref}`f-input_output_analysis_15_shocks`, the scaling constant is not visible because the values are rescaled to a fixed interval before the color map is applied. However, {eq}`eq-dshockk` shows us its value, as well as the fact that the scaling constant converges to zero like $r(A)^m$. Hence, the dominant eigenpair $(r(A), e)$ gives us both the configuration of the response to an arbitrary demand shock and the rate at which the response dies out as we travel back through the linkages.

At this point, we recall that the sectors in {numref}`f-input_output_analysis_15` were colored according to hub-based eigenvector centrality. If you compare this figure to {numref}`f-input_output_analysis_15_shocks`, you will be above to confirm that, at least for later rounds, the color schemes line up, as predicted by the theory. Finance (fi) and manufacturing (ma) rank highly, as does the professional services sector (pr), which includes consulting, accounting and law.

#### Eigenvector Centrality

Let's look at hub-based eigenvector centrality more closely. In a production network, the hub property translates into being an important supplier. Our study of demand shocks in {ref}`ss-dshocks` highlighted the significance of the eigenvector measure of hub-based centrality: if sector $i$ has high rank under this measure, then it becomes active after a large variety of different shocks. {numref}`f-input_output_analysis_15_ec` shows hub-based eigenvector centrality as a bar graph for the 15 sector case. By this measure, manufacturing is by far the most dominant sector in the US economy.

```{figure} figures/input_output_analysis_15_ec.svg
:name: f-input_output_analysis_15_ec

Eigenvector centrality across US industrial sectors
```

Reviewing the color scheme in {numref}`f-input_output_analysis_71` based on our current understanding of eigenvector centrality, we see that technical servies (54120P), insurance (524), chemical products (325) and primary metals (331) are among the most highly ranked, and hence a wide range of demand shocks generate high activity in these sectors.

To provide some extra context, we show the analogous figure using Australian 2020 input-output data, collected by the Australian Bureau of Statistics. Node size is proportional to sales share and arrow width is proportional to the input-output coefficient. The color map shows hub-based eigenvector centrality.

By this measure, the highest ranked sector is 6901, which is "professional, scientific and technical services." This includes scientific research, engineering, computer systems design, law, accountancy, advertising, market research, and management consultancy. The next highest sectors are construction and electricity generation.

```{figure} figures/input_output_analysis_aus_114.svg
:name: f-input_output_analysis_aus_114

Network for 114 Australian industry sectors in 2020
```

(sss-outmul)=
#### Output Multipliers
One way to rank sectors that has a long tradition in input-output analysis is via output multipliers. The **output multiplier** of sector $j$, denoted below by $\mu_j$, is usually defined as the "total sector-wide impact of an extra dollar of demand in sector $j$," where total means taking into account backward linkages. This measure has historically been of interest to policy makers considering impacts of fiscal stimulus.

Recalling from {ref}`sss-rds` that $\ell_{ij}$ shows the total impact on sector $i$ of a unit change in demand for good $j$, we come to the definition

```{math}
:enumerated: false

\mu_j = \sum_{i=1}^n  \ell_{ij}
    \qquad (j \in \natset{n}).
```

In vector notation this is $\mu^\top = \1^\top L$ or,

$$
\mu^\top = \1^\top (I - A)^{-1}.
$$ (eq-mudefio)

Comparing this with {eq}`eq-katzav`, we see that the vector of output multipliers is equal to the authority-based Katz centrality measure (with the parameter $\beta$ defaulting to unity).

The connection between the two measures makes sense: high authority-based centrality means that a sector has many inward links, and that those links are from other important sectors. Loosely speaking, such a sector is an important buyer of intermediate inputs. A sector highly ranked by this measure that receives a demand shock will cause a large impact on the whole production network.

{numref}`f-input_output_analysis_15_omult` shows the size of output multipiers across 15 US industrial sectors, calculated from the same input-output data as previous 15 sector figures using {eq}`eq-mudefio`. The highest ranks are assigned to manufacturing, agriculture and construction.

```{figure} figures/input_output_analysis_15_omult.svg
:name: f-input_output_analysis_15_omult

Output multipliers across 15 US industrial sectors
```

(ss-forlink)=
### Forward Linkages
Several economic questions connect to relative "upstreamness" of a sector or production good. For example, {cite}`olabisi2020input` finds that upstreamness is related to sectoral volatility, while {cite}`antras2012measuring` examine the relationship between upstreamness and tendency to export. Tariff changes tend to have different aggregate effects when applied to upstream rather than downstream industries {cite:p}`martin2020downstream`. Finally, since WWII, many developing countries have systematically supported and encouraged upstream industries {cite:p}`liu2019industrial`.

In order to study upstreamness, we first introduce the Ghosh model for forward linkages, which uses a rearrangement of terms from the original Leontief model.

#### The Ghosh Model

Recall that $a_{ij}=z_{ij}/x_j =$ the dollar value of inputs from $i$ per dollar of sales from $j$. Consider now the related quantities

$$
f_{ij} := 
    \frac{z_{ij}}{x_i}
    = \text{value of inputs from } i \text{ to } j \text{ per dollar output from } i.
$$ (eq-forlink)

Let $F := (f_{ij})_{i, j \in \natset{n}}$. The matrix $F$ is called the **direct-output** matrix or the **Ghosh matrix**. Element $f_{ij}$ can be interpreted as the size of the "forward linkage" from $i$ to $j$. Analogous to $A$, the matrix $F$ can be viewed as a weight function over output sectors and visualized as in {numref}`f-input_output_analysis_15_fwd`. This digraph uses the same data source as {numref}`f-input_output_analysis_15`.

```{figure} figures/input_output_analysis_15_fwd.svg
:name: f-input_output_analysis_15_fwd

Forward linkages and upstreamness over US industrial sectors
```

```{exercise}
:label: ex-production-auto-4

Prove that $A$ and $F$ are similar matrices (see {ref}`sss-sim`) when $x \gg 0$.
```


Let $v_j$ be value added in sector $j$ (i.e., payments to factors of production other than intermediate goods). We have

$$
x_j = \sum_{i=1}^n z_{ij} + v_j
    \qquad (j \in \natset{n}).
$$ (eq-vaid)

This states that (under perfect competition), the revenue of sector $j$ is divided between spending on intermediate goods, which is the first term $\sum_{i=1}^n z_{ij}$, and payments to other factors of production (value added).

Using the forward linkages, we can rewrite {eq}`eq-vaid` as $x_j = \sum_i f_{ij} x_i + v_j$ for all $j$ or, in matrix form

$$
x^\top = x^\top F + v^\top.
$$

Taking transposes and solving under the assumption $r(F) < 1$ gives

$$
x^* = (I - F^\top)^{-1} v.
$$ (eq-vaid2)

We can think of the solution $x^*$ in {eq}`eq-vaid2` as the amount of output necessary to acquire a given amount of value added. Since payments of value added are made to underlying factors of production, the Ghosh model is also called a "supply-side input output model".

```{exercise}
:label: ex-rarf

In {ref}`sss-prodeu` we argued that $r(A) < 1$ will almost always hold. This carries over to $r(F)$, since $r(A) = r(F)$ whenever $x \gg 0$. Provide a proof of the last statement.
```


````{solution} ex-rarf

Let $\lambda$ be an eigenvalue of $A$ and let $e$ be the corresponding eigenvector. Then, for all $i \in \natset{n}$, we have

```{math}
:enumerated: false

\sum_j a_{ij} e_j = \lambda e_i
        \quad \iff \quad
        \sum_j \frac{z_{ij}}{x_j} e_j = \lambda e_i
        \quad \iff \quad
        \sum_j f_{ij} \frac{e_j}{x_j} = \lambda \frac{e_i}{x_i},
```

where we have used the fact that $x \gg 0$. It follows that $\lambda$ is an eigenvalue of $F$. The same logic runs in reverse, so $A$ and $F$ share eigenvalues. Hence $r(A)=r(F)$.
````


We omit a discussion of the relative merits of supply- and demand-driven input-output models. Our main interest in forward linkages is due to their connection to the topic of ranking sectors by relative upstreamness.

(sss-upness)=
#### Upstreamness
Which industries are relatively upstream? One proposed measure of upstreamness can be found in {cite}`antras2012measuring`. With $f_{ij}$ as defined in {eq}`eq-forlink`, the upstreamness $u_i$ of sector $i$ is defined recursively by

$$
u_i = 1 + \sum_{j=1}^n f_{ij} u_j.
$$ (eq-defup)

The recursive definition of the vector $u$ in {eq}`eq-defup` stems from the idea that those sectors selling a large share of their output to upstream industries should be upstream themselves.

We can write {eq}`eq-defup` in vector form as $u = \1 + F u$ and solve for $u$ as

$$
u = (I - F)^{-1} \1.
$$ (eq-defup2)

A unique nonnegativity solution exists provided that $r(F) < 1$. We expect this to hold in general, due to the findings in {prf:ref}`ex-rarf`.

Maintaining the convention $\beta=1$, we see that the upstreamness measure {eq}`eq-defup2` proposed by {cite}`antras2012measuring` is identical to the hub-based Katz centrality measure {eq}`eq-katzhub` for the production network with weights allocated by the forward linkage matrix $F$.

{numref}`f-input_output_analysis_15_up` shows the result of computing $u$ via {eq}`eq-defup2`, plotted as a bar graph, for the 15 sector input-output network. Consistent with expectations, the primary commodity producers (agriculture and mining) are the most upstream, while retail and education are typical downstream sectors.

```{figure} figures/input_output_analysis_15_up.svg
:name: f-input_output_analysis_15_up

Relative upstreamness of US industrial sectors
```

The nodes in {numref}`f-input_output_analysis_15_fwd` are also colorized by upstreamness.

## General Equilibrium

One limitation of the Leontief input-output analysis from {ref}`ss-mutmod` is that demand is fixed and exogenous. In this section we embed Leontief's model in an equilibrium setting where output and prices are determined by a combination of supply and demand. One objective is to understand how an input-output structure interacts with firm-level shocks to shape aggregate volatility.

(ss-eqmulm)=
### Supply and Demand
Our first step is to introduce and solve a multisector general equilibrium model based on {cite}`acemoglu2012network` and {cite}`carvalho2019production`.

#### Production and Prices

As in the Leontief economy, there are $n$ sectors, also called industries, each of which produces one good. Real output in sector $j$ is given by

$$
y_j = s_j \ell_j^\alpha \prod_{i=1}^n q_{ij}^{a_{ij}}.
$$ (eq-mscdp)

Here

- $s_j$ is a sector-specific shock (independent across sectors),

- $\ell_j$ is labor input to sector $j$,

- $q_{ij}$ is the amount of good $i$ used in the production of good $j$, and

- $\alpha$ and $a_{ij}$ take values in $(0, 1)$ and satisfy $\alpha + \sum_i a_{ij}=1$ for all $j \in \natset{n}$.

The last condition implies constant returns to scale (CRS) in each sector.[^2]

```{exercise}
:label: ex-caral

Let $A = (a_{ij})$ be the $n \times n$ matrix of **technical coefficients** from the Cobb–Douglas production function in {eq}`eq-mscdp`. Using the stated assumptions and the results in {ref}`sss-someimp`, show that $r(A) < 1$.[^3]
```


```{exercise}
:label: ex-1malpha

Prove that $\sum_i \sum_j a_{ij}^{(m)} = n (1-\alpha)^m$ for all $m \in \NN$, where $a_{ij}^{(m)}$ is the $(i,j)$-th element of $A^m$.
```


````{solution} ex-1malpha

We need to show that $\1^\top A^m \1 = n(1-\alpha)^m$ for any $m$. We prove this by induction, noting that $\1^\top A = (1-\alpha) \1^\top$ by the CRS assumption. It follows immediately that $\1^\top A \1 = n (1-\alpha)$. Now suppose also that $\1^\top A^m \1 = n(1-\alpha)^m$ holds. Then

```{math}
:enumerated: false

\1^\top A^{m+1} \1
        = \1^\top A A^m \1
        = (1-\alpha) \1^\top A^m \1
        = n (1-\alpha)^{m+1},
```

where the last step is by the induction hypothesis.
````


Firms are price takers. With $p_j$ being the price of good $j$, a firm in sector $j$ maximizes profits

$$
\pi_j := p_j y_j - w \ell_j - \sum_i p_i q_{ij}
$$ (eq-profitsms)

with respect to the $n+1$ controls $\ell_j$ and $q_{1j}, \ldots, q_{nj}$.

```{exercise}
:label: ex-production-auto-5

Show that, when prices and wages are taken as given, the unique global maximizers of {eq}`eq-profitsms` are

$$
\ell_j = \alpha \frac{p_j y_j}{w}
        \quad \text{and} \quad
        q_{ij} = a_{ij} \frac{p_j y_j}{p_i}
        \qquad (i, j \in \natset{n}).
$$ (eq-msmax)
```


```{solution} ex-production-auto-5

Inserting {eq}`eq-mscdp` into {eq}`eq-profitsms` and differentiating with respect to $\ell_j$ and $q_{ij}$ leads to the first order conditions given in {eq}`eq-msmax`. It can be shown that these local maximizers are global maximizers, although we omit the details.
```


```{prf:remark}
:label: r-tceio

From {eq}`eq-msmax` we have $a_{ij} = (p_i q_{ij})/(p_j y_j)$, which states that the $i,j$-th technical coefficient is the dollar value of inputs from $i$ per dollar of sales from $j$. This coincides with the definition of $a_{ij}$ from the discussion of input-output tables in {ref}`sss-prodnet`. Hence, in the current setting, the (unobservable) technical coefficient matrix equals the (observable) input-output coefficient matrix defined in {ref}`ss-mutmod`.
```


Substituting the maximizers {eq}`eq-msmax` into the production function gives

$$
y_j = c s_j \left( \frac{p_j y_j}{w} \right)^\alpha
    \prod_{i=1}^n \left( \frac{p_j y_j}{p_i} \right)^{a_{ij}},
$$ (eq-mspwf)

where $c$ is a positive constant depending only on parameters.

````{exercise}
:label: ex-umspw

Using {eq}`eq-mspwf`, show that

```{math}
:enumerated: false

\rho_j = \sum_i a_{ij} \rho_i - \epsilon_j
        \quad \text{where }
        \rho_j := \ln \frac{p_j}{w}
        \quad \text{and} \quad
        \epsilon_j := \ln (c s_j).
```
````


Let $\rho$ and $\epsilon$ be the column vectors $(\rho_i)_{i=1}^n$ and $(\epsilon_i)_{i=1}^n$ of normalized prices and log shocks from Exericse {prf:ref}`ex-umspw`. Collecting the equations stated there leads to $\rho^\top = \rho^\top A - \epsilon^\top$, or

$$
\rho = A^\top \rho - \epsilon.
$$ (eq-msirho)

```{exercise}
:label: ex-production-auto-6

Prove that

$$
\rho_j = - \sum_i \epsilon_i \ell_{ij} 
        \quad \text{where }
        L := (\ell_{ij}) := (I - A)^{-1}.
$$
Why is $L$ well defined?
```


```{solution} ex-production-auto-6

By {prf:ref}`ex-caral` we have $r(A)<1$. Hence $L = (I - A)^{-1}$ is well defined and, moreover, we can solve {eq}`eq-msirho` using the Neumann series lemma, yielding $\rho = - (I - A^\top)^{-1} \epsilon$. Since the inverse of the transpose is the transpose of the inverse, we can write this as $\rho = - L^\top \epsilon$. Unpacking gives the equation stated in the exercise.
```


As in {prf:ref}`c-prod`, the matrix $L$ is the Leontief inverse generated by $A$.

#### Consumpion

Wages are paid to a representative household who chooses consumption to maximize utility $\sum_i \ln c_i$. In equilibrium, profits are zero, so the only income accruing to the household consists of wage income. The household supplies one unit of labor inelastically. Hence, the budget constraint is $\sum_i p_i c_i = w$.

```{exercise}
:label: ex-production-auto-7

Show that the unique utility maximizer is the vector $(c_1, \ldots, c_n)$ that satisfies $p_i c_i = w/n$ for all $i \in \natset{n}$. (Equal amounts are spent on each good.)
```


#### Aggregate Output

In this economy, aggregate value added (defined in {ref}`ss-forlink`) is equal to the wage bill. This quantity is identified with real aggregate output and referred to as GDP. The **Domar weight** of each sector is defined as its sales as a fraction of GDP:

```{math}
:enumerated: false

h_i := \frac{p_i y_i}{w} .
```

From the closed economy market clearing condition $y_i = c_i + \sum_j q_{ij}$ and the optimality conditions we obtain

$$
y_i = \frac{w}{n p_i} 
    + \sum_j a_{ij} \frac{p_j y_j}{p_i}.
$$ (eq-mseqcon)

````{exercise}
:label: ex-dmrleo

Letting $L = (\ell_{ij})$ be the Leontief inverse and using {eq}`eq-mseqcon`, show that Domar weights satisfy

```{math}
:enumerated: false

h_i = \frac{1}{n} \sum_j \ell_{ij} 
        \qquad \text{for all } i \in \natset{n}.
```
````


```{solution} ex-dmrleo

Equation {eq}`eq-mseqcon` can be expressed as $h_i = n^{-1} + \sum_j a_{ij} h_j$. Letting $h = (h_i)$ be a column vector in $\RR^n$ and letting $\1$ be a column vector of ones, these $n$ equations become $h = n^{-1} \1 + A h$. Since $r(A) <1$, the unique solution is $h = n^{-1} (I-A)^{-1} \1 = n^{-1} L \1$. Unpacking the vector equation gives the stated result.
```


```{exercise}
:label: ex-sboh

Prove that $\sum_{i=1}^n h_i = 1/\alpha$.
```


````{solution} ex-sboh

From the result in {prf:ref}`ex-1malpha`, we have

```{math}
:enumerated: false

\1^\top h 
        = \frac{1}{n} \1^\top \sum_{m \geq 0} A^m \1
        = \frac{1}{n} \sum_{m \geq 0} \1^\top A^m \1
        = \frac{1}{n} n \sum_{m \geq 0} (1-\alpha)^m .
```

The last expression evaluates to $1/\alpha$, as was to be shown.
````


From the results of {prf:ref}`ex-umspw` we obtain $\ln w = \ln p_j + \sum_i \epsilon_i \ell_{ij}$. Setting $g := \ln w$ and summing yields

```{math}
:enumerated: false

n g = \sum_j  \ln p_j + \sum_i \epsilon_i \sum_j \ell_{ij} .
```

Normalizing prices so that $\sum_i \ln p_i = 0$, this simplifies to

$$
g = \sum_i \epsilon_i h_i .
$$ (eq-msagout)

Thus, log GDP is the inner product of sectoral shocks and the Domar weights.

(ss-granor)=
### The Granular Hypothesis
We have just constructed a multisector model of production and output. We plan to use this model to study shock propagation and aggregate fluctuations. Before doing so, however, we provide a relatively simple and network-free discussion of shock propagation. The first step is to connect the propagation of shocks to the firm size distribution. Later, in {ref}`ss-avr`, we will see how these ideas relate to the general equilibrium model and the topology of the production network.

#### Aggregate vs Idiosyncratic Shocks

Some fluctuations in aggregate variables such as GDP growth and the unemployment rate can be tied directly to large exogenous changes in the aggregate environment. One obvious example is the jump in the US unemployment rate from 3.5% to 14.8% between February and April 2020, which was initiated by the onset of the COVID pandemic and resulting economic shutdown.

Other significant fluctuations lack clear macro-level causes. For example, researchers offer mixed explanations for the 1990 US recession, including "technology shocks," "consumption shocks" and loss of "confidence" {cite:p}`cochrane1994shocks`. However, these explanations are either difficult to verify on the basis of observable outcomes or require exogenous shifts in variables that should probably be treated as endogenous.

One way to account for at least some of the variability observed in output growth across most countries is on the basis of firm-level and sector-specific productivity and supply shocks. Examples of sector-specific shocks include

(i) the spread of African Swine Fever to China in 2018,

(ii) the Great East Japan Earthquake of 2011 and resulting tsunami, which triggered meltdowns at three reactors in the Fukushima Daiichi Nuclear Power Plant, and

(iii) the destruction of Asahi Kasei Microdevices' large scale IC factory in Miyazaki Prefecture in October 2020.

In the discussion below, we investigate the extent to which firm-level shocks can drive fluctuations in aggregate productivity.

(sss-gdpgrowth)=
#### The Case of Many Small Firms
It has been argued that idiosyncratic, firm-level shocks can account only for a very small fraction of aggregate volatility (see, e.g., {cite}`dupor1999aggregation`). The logical heart of this argument is the dampening effect of averaging over independent random variables. To illustrate the main idea, we follow a simple model of production without linkages across firms by {cite}`gabaix2011granular`.

Suppose there are $n$ firms, with the size of the $i$-th firm, measured by sales, denoted by $S_i$. Since all sales fulfill final demand, GDP is given by $Y := \sum_{i=1}^n S_i$. We use primes for next period values and $\Delta$ for first differences (e.g., $\Delta S_i = S_i' - S_i$). We assume that firm growth $\Delta S_i / S_i$ is equal to $\sigma_F \epsilon_i$, where $\{\epsilon_i\}$ is a collection of IID random variables corresponding to firm-level idiosyncratic shocks. We also assume that $\var(\epsilon_i) = 1$, so that $\sigma_F$ represents firm-level growth volatility.

GDP growth is then

```{math}
:enumerated: false

G 
      := \frac{\Delta Y}{Y} 
      = \frac{\sum_{i=1}^n \Delta S_i}{Y} 
      = \sigma_F \sum_{i=1}^n \frac{S_i}{Y} \epsilon_i.
```

```{exercise}
:label: ex-production-auto-8

Treating the current firm size distribution $\{S_i\}$ and hence GDP as given, show that, under the stated assumptions, the standard deviation of GDP growth $\sigma_G := (\var G)^{1/2}$ is

$$
\sigma_G 
            = \sigma_F H_n
            \quad \text{where } \;
            H_n := \left( 
                    \sum_{i=1}^n \left( \frac{S_i}{Y} \right)^2 
                   \right)^{1/2}.
$$ (eq-gsdg)
```


```{solution} ex-production-auto-8

This expression follows easily from the definition of variance and the independence of firm-level shocks, which allows us to pass the variance through the sum.
```


If, say, all firms are equal size, so that $n S_i = Y$, this means that $\sigma_G = \sigma_F / \sqrt{n}$, so volatility at the aggregate level is very small when the number of firms is large. For example, if the number of firms $n$ is $10^6$, which roughly matches US data, then

$$
\frac{\sigma_G}{\sigma_F }
    = H_n = \left( \frac{1}{10^6} \right)^{1/2} = 10^{-3} = 0.001.
$$ (eq-gonf)

Hence firm-level volatility accounts for only 0.1% of aggregate volatility.

To be more concrete, {cite}`gabaix2011granular` calculates $\sigma_F = 12$, which means that, by {eq}`eq-gonf`, $\sigma_G = 0.012$%. But the volatility of GDP growth is actually far higher. Indeed, {numref}`f-gdp_growth` reports that, for the US, $\sigma_G$ is approximately $2\%$, which is two orders of magnitude greater. The core message is that, under the stated assumptions, firm-level shocks explain only a tiny part of aggregate volatility.

```{figure} figures/gdp_growth.svg
:name: f-gdp_growth

GDP growth rates and std. deviations (in parentheses) for 10 countries
```

(sss-efht)=
#### The Effect of Heavy Tails
There are some obvious problems with the line of reasoning used in {ref}`sss-gdpgrowth`. One is that firms are assumed to be of identical size. In reality, most firms are small to medium, while a relative few are enormous. For example, in the US, a small number of giants dominate technology, electronics and retail.

{cite}`gabaix2011granular` emphasized that we can get closer to actual GDP volatility by more thoughtful specification of the firm size distribution. Altering the distribution $\{S_i\}_{i=1}^n$ changes the value $H_n$ in {eq}`eq-gonf`, which is called the **Herfindahl index**. This index is often applied to a group of firms in a sector to measure industry concentration. For given aggregate output $Y$, the Herfindahl index is minimized when $S_i = S_j$ for all $i, j$. This is the case we considered above. The index is maximized at $H_n=1$ when a single firm dominates all sales. By {eq}`eq-gonf`, a larger Herfindahl index will increase $\sigma_G$ relative to $\sigma_F$, which allows firm-level shocks to account for more of aggregate volatility.

Calculation of $H_n$ is challenging because the entire firm size distribution $\{S_i\}_{i=1}^n$ is difficult to observe. Nonetheless, we can estimate $H_n$ by (a) estimating a population probability distribution that fits the empirical distribution $\{S_i\}_{i=1}^n$ and (b) using analysis or Monte Carlo simulations to calculate typical values of $H_n$.

For step (a), {cite}`gabaix2011granular` cites the study of {cite}`axtell2001zipf`, which finds the firm size distribution to be Pareto with tail index $1.059$. If we repeatedly draw $\{S_i\}_{i=1}^n$ from a Pareto distribution with $\alpha = 1.059$ and $n=10^6$, record the value of $H_n$ after each draw and then take the median value as our estimate, we obtain $H_n \approx 0.88$. In other words, under the Pareto assumption just stated, firm-level volatility accounts for almost 90% of aggregate volatility. In essence, this means that, to explain aggregate volatility, we need to look no further than firm-level shocks.

(sss-senan)=
#### Sensitivity Analysis
The finding in the previous paragraph is quite striking. How seriously should we take it?

One issue is that the figure $H_n \approx 0.88$ is not robust to small changes in assumptions. For example, the regression in {numref}`f-empirical_powerlaw_firms_forbes` suggests that we take $1.32$ as our estimate for the tail index $\alpha$, rather than Axtell's value of $1.059$. If we rerun the same calculation with $\alpha=1.32$, the estimated value of $H_n$ falls to $0.018$. In other words, firm-level shocks account for only 1.8% of aggregate volatility.

Another issue is that the large value for $H_n$ obtained under Axtell's parameterization is very sensitive to the parametric family chosen for the firm size distribution. The next exercise illustrates.

```{exercise}
:label: ex-production-auto-9

{numref}`f-empirical_powerlaw_firms_forbes` suggests only that the far right tail of the firm size distribution obeys a Pareto law. In fact, some authors argue that the lognormal distribution provides a better fit than the Pareto distribution ({cite}`kondo2020heavy` provide a recent discussion). So suppose now that $\{S_i\}$ is $n$ IID draws from the $LN(\mu, \sigma^2)$ distribution (as given in {prf:ref}`eg-lognorm`), where $\mu, \sigma$ are parameters.[^4] Implement and run {prf:ref}`algo-genherf`. Set $m=10^3$ and $n=10^6$. Choose $\mu$ and $\sigma$ so that the mean and median of the $LN(\mu, \sigma^2)$ distribution agree with that of the standard Pareto distribution with tail index $\alpha$, which are $\alpha/(\alpha-1)$ and $2^{1/\alpha}$ respectively. As in {cite}`gabaix2011granular`, set $\alpha=1.059$. What estimate do you obtain for $H_n$? How much of aggregate volatility is explained?
```


```{prf:algorithm} Generate an estimate of $H_n$ under log-normality
:label: algo-genherf

1. **for** $j$ in $1, \ldots, m$ **do**
   1. generate $n$ independent draws $\{S_i^j \}$ from the $LN(\mu, \sigma^2)$ distribution
   2. compute the Herfindahl index $H_n^j$ corresponding to $\{S_i^j \}$
2. **end**
3. set $H_n$ equal to the median value of $\{H^j_n\}_{j=1}^m$
4. **return** $H_n$
```

(ss-avr)=
### Network Structure and Shock Propagation
The sensitivity analysis in {ref}`sss-senan` suggests we should be skeptical of the claim that firm-level shocks explain most aggregate-level shocks that we observe. This means that either micro-level shocks account for only a small fraction of aggregate volatility or, alternatively, that the model is too simple, and micro-level shocks are amplified through some other mechanism.

An obvious way to explore further is to allow linkages between firms, in the sense that the inputs for some firms are outputs for others. Such an extension opens up the possibility that shocks propagate through the network. This seems plausible even for the sector-specific shocks listed above, such as the Great East Japan Earthquake. Although the initial impact was focused on electricity generation, the flow-on effects for other sectors were rapid and substantial {cite:p}`carvalho2021supply`.

To investigate more deeply, we connect our discussion of the granular hypothesis back to the multisector models with linkages studied above, allowing us to study flow-on and multiplier effects across industries.

(sss-ics)=
#### Industry Concentration and Shocks
From {eq}`eq-msagout` and the independence of sectoral shocks, the standard deviation $\sigma_g$ of log GDP is given by

$$
\sigma_g = \sigma H_n
        \quad \text{where } \;
        H_n := \left( \sum_{i=1}^n h_i^2 \right)^{1/2}.
$$ (eq-mssg)

where $\sigma$ is the standard deviation of each $\epsilon_i$.

Note that the expression for aggregate volatility takes the same form as {eq}`eq-gsdg` from our discussion of the granular hypothesis in {ref}`ss-granor`, where $H_n$ was called the Herfindahl index. Once again, this index is the critical determinant of how much firm-level volatility passes through to aggregate volatility. In particular, as discussed in {ref}`sss-efht`, independent firm-level shocks cannot explain aggregate volatility unless $H_n$ is large, which in turn requires that the components of the vector $h$ are relatively concentrated in a single or small number of sectors.

To investigate an extreme case, we recall from {prf:ref}`ex-sboh` that $\sum_{i=1}^n h_i = 1/\alpha$. The Herfindahl index is $H_n := \| h\|$, where $\| \cdot \|$ is the Euclidean norm.

```{exercise}
:label: ex-production-auto-10

Show that the minimizer of $\| h \|$ given $\sum_{i=1}^n h_i = 1/\alpha$ is the constant vector where $h_i = 1/(\alpha n)$ for all $i$.
```


````{solution} ex-production-auto-10

Let $h^* := \1 / (\alpha n)$. The claim is that $h^*$ is the minimizer of $\| h \|$ on $\RR^n_+$ under the constraint $\sum_{i=1}^n h_i = 1/\alpha$. Squaring the objective function and substituting the constraint into the objective by taking $h_n = 1/\alpha - h_1 - \cdots - h_{n-1}$, we are led to the equivalent problem of finding the minimizer of

```{math}
:enumerated: false

f(h_1, \ldots, h_{n-1})
        := h_1^2 + \cdots + h_{n-1}^2 + 
        \left( \frac{1}{\alpha} - h_1 - \cdots - h_{n-1} \right)^2.
```

Since $f$ is convex, any local minimizer is a global minimizer. Moreover, the first order conditions give

```{math}
:enumerated: false

h_i = \left( \frac{1}{\alpha} - h_1 - \cdots - h_{n-1} \right)
            = h_n.
```

for all $i$. Hence, the solution vector is constant over $i$. Letting $c$ be this constant and using the constraint gives $n c = 1/\alpha$. The claim follows.
````


Under this configuration of sector shares,

```{math}
:enumerated: false

H_n 
    = \frac{1}{n \alpha} \| \1 \|
    = \frac{1}{n \alpha} \sqrt{n}
    = O \left( \frac{1}{\sqrt{n}} \right).
```

Hence, by {eq}`eq-mssg`, we have $\sigma_g = O ( n^{-1/2} )$. This is the classic diversification result. The standard deviation of log GDP goes to zero like $n^{-1/2}$, as in the identical firm size case in {ref}`sss-gdpgrowth`.

Now let's consider the other extreme:

```{exercise}
:label: ex-production-auto-11

Show that the maximum of $H_n = \|h\|$ under the constraint $\sum_{i=1}^n h_i = 1/\alpha$ is $1/\alpha$, attained by setting $h_k = 1/\alpha$ for some $k$ and $h_j = 0$ for other indices.
```


````{solution} ex-production-auto-11

Let $h^*$ be an $n$-vector with $h^*_k = 1/\alpha$ for some $k$ and $h^*_j = 0$ for other indices. Clearly $\| h^* \| = 1/\alpha$. Hence it suffices to show that, for any $h \in \RR^n_+$ with $\sum_{i=1}^n h_i = 1/\alpha$, we have $\| h \| \leq 1/\alpha$.

Fix $h \in \RR^n_+$ with $\sum_{i=1}^n h_i = 1/\alpha$. Since we are splitting $1/\alpha$ into $n$ parts, we can express $h$ as $(w_1/\alpha, \ldots, w_n/\alpha)$, where $0 \leq w_i \leq 1$ and $\sum_i w_i = 1$. By Jensen's inequality ({prf:ref}`ex-jendiscrete`), we have

```{math}
:enumerated: false

\sum_i \left( \frac{w_i}{\alpha } \right)^2
        \leq \left( \sum_i \frac{w_i}{\alpha} \right)^2 
        = \frac{1}{\alpha^2}.
```

Taking the square root gives $\| h \| \leq 1/\alpha$, as was to be shown.
````


This is the extreme case of zero diversification. By {eq}`eq-msagout`, log GDP is then

```{math}
:enumerated: false

g 
    = \sum_i \epsilon_i h_i 
    = \frac{1}{\alpha} \epsilon_k .
```

The volatility of log GDP is constant in $n$, rather than declining in the number of sectors. In other words, idiosyncratic and aggregate shocks are identical.

#### The Role of Network Topology

In the previous section we looked at two extreme cases, neither of which is realistic. Now we look at intermediate cases. In doing so, we note an interesting new feature: unlike the analysis in {ref}`ss-granor`, where the sector shares were chosen from some fixed distribution, the Herfindahl index is now determined by the network structure of production.

To see this, we can use the results of {prf:ref}`ex-dmrleo` to obtain

```{math}
:enumerated: false

h = \frac{1}{n} L \1 = \frac{1}{n} \sum_{m \geq 0} A^m \1.
```

Recalling our discussion in {ref}`sss-hbkc`, we see that the vector of Domar weights is just a rescaling of the vector of hub-based Katz centrality rankings for the input-output matrix. Thus, the propagation of sector-specific productivity shocks up to the aggregate level depends on the distribution of Katz centrality across sectors. The more "unequal" is this distribution, the larger is the pass through.

{numref}`f-authority_symmetric_nodes` shows some examples of different network configurations, each of which is associated with a different Katz centrality vector. Not surprisingly, the symmetric network has a constant centrality vector, so that all sectors have equal centrality. This is the maximum diversification case, as discussed in {ref}`sss-ics`. The other two cases have nonconstant centrality vectors and hence greater aggregate volatility.[^5]

```{figure} figures/tikz_hub.svg
:name: f-hub

Star network with single hub
```

```{figure} figures/fig_authority_symmetric_nodes.svg
:name: f-authority_symmetric_nodes

Symmetric and asymmetric networks
```

````{exercise}
:label: ex-netophk

Let the nonzero input output coefficient $a_{ij}$ shown by arrows in {numref}`f-authority_symmetric_nodes` all have equal value $0.2$. Show computationally that the hub-based Katz centrality vectors for the hub and star networks are

```{math}
:enumerated: false

\kappa_h = (1.8, 1, 1, 1, 1)
        \quad \text{and} \quad
        \kappa_s = (1.2, 1.2, 1.2, 1.2, 1)
```

respectively (for nodes $1, \ldots, 5$).
````


The results of {prf:ref}`ex-netophk` show that the hub network has the more unequal Katz centrality vector. Not surprisingly, the source node in the hub has a high hub-based centrality ranking. Productivity shocks affecting this sector have a large effect on aggregate GDP.

{numref}`f-input_output_analysis_15_katz` shows hub-based Katz centrality computed from the 15 sector input-output data for 2021. We can see that productivity shocks in manufacturing will have a significantly larger impact on aggregate output than shocks in say, retail or education.

```{figure} figures/input_output_analysis_15_katz.svg
:name: f-input_output_analysis_15_katz

Hub-based Katz centrality of across 15 US industrial sectors
```

#### Supply Shocks vs Demand Shocks

In the previous section we saw that the degree to which a productivity shock propagates through the economy depends on the hub-based centrality ranking of the relevant sector. This is intuitive. Sectors that act like hubs supply many sectors, so changes in productivity in these sectors will have large flow-on effects.

This is in contrast with what we learned in {ref}`sss-outmul`, where a high authority-based centrality measure lead to high shock propagation. The difference can be explained by the source of the shocks: in {ref}`sss-outmul`, we were concerned with the impact of demand shocks. Demand shocks to sector $i$ have large flow-on effects when many sectors purchase inputs from sector $i$. Hence authority-based centrality measures are appropriate for studying this case.

(s-mst)=
## More Spectral Theory
This is a relatively technical section, which analyzes aspects of vector dynamics and spectral theory in more depth. It is aimed at readers who are interested in further mathematical discussion of the theory treated above. The ideas studied here are applied to production problems to generate additional insights into existence and uniqueness of equilibria, as well as later topics such as convergence of distributions for Markov models on networks.

(ss-vecnorms)=
### Vector Norms
In this section we learn about abstract vector norms on $\RR^n$ and provide several examples. Later we will see how the different norms are related and how they can be useful for some kinds of network analysis.

(sss-norms)=
#### Norms
A function $\| \cdot \| \colon \RR^n \to \RR$ is called a **norm** on $\RR^n$ if, for any $\alpha \in \RR$ and $u, v \in \RR^n$,

::::{grid} 1 1 2 2
:::{grid-item}
(a) $\| u \| \geq 0$

(b) $\| u \| =0 \iff u=0$

(c) $\| \alpha u \| = |\alpha| \| u\|$ and

(d) $\| u + v \| \leq \| u \| + \| v \|$
:::
:::{grid-item}
(nonnegativity)

(positive definiteness)

(positive homogeneity)

(triangle inequality)
:::
::::

The Euclidean norm is a norm on $\RR^n$, as suggested by its name.

```{prf:example}
:label: eg-ell1norm

The **$\ell_1$ norm** of a vector $u \in \RR^n$ is defined by

$$
u = (u_1, \ldots, u_n) \mapsto \| u \|_1 := \sum_{i=1}^n |u_i|.
$$ (eq-l1normfd)
In machine learning applications, $\| \cdot \|_1$ is sometimes called the "Manhattan norm," and $d_1 (u, v) := \| u - v \|_1$ is called the "Manhattan distance" or "taxicab distance" between vectors $u$ and $v$. We will refer to it more simply as the **$\ell_1$ distance** or **$\ell_1$ deviation**.
```


```{exercise}
:label: ex-production-auto-12

Verify that the $\ell_1$ norm on $\RR^n$ satisfies (a)–(d) above.
```


The $\ell_1$ norm and the Euclidean norm are special cases of the so-called **$\ell_p$ norm**, which is defined for $p \geq 1$ by

$$
u = (u_1, \ldots, u_n) \mapsto 
    \| u \|_p := \left( \sum_{i=1}^n |u_i|^p \right)^{1/p}.
$$ (eq-lpnormfd)

It can be shown that $u \mapsto \| u \|_p$ is a norm for all $p \geq 1$, as suggested by the name (see, e.g., {cite}`kreyszig1978introductory`). For this norm, the subadditivity in (d) is called **Minkowski's inequality**.

Since the Euclidean case is obtained by setting $p=2$, the Euclidean norm is also called the $\ell_2$ norm, and we write $\| \cdot \|_2$ rather than $\| \cdot \|$ when extra clarity is required.

```{exercise}
:label: ex-ellinftyfd

Prove that $u \mapsto \| u \|_\infty := \max_{i=1}^n |u_i|$ is also a norm on $\RR^n$.
```


(The symbol $\| u \|_\infty$ is used because, $\forall \, u \in \RR^n$, we have $\| u \|_p \to \| u \|_\infty$ as $p \to \infty$.) This norm is called the **supremum norm**.

```{exercise}
:label: ex-production-auto-13

The so-called $\ell_0$ "norm" $\| u \|_0 := \sum_{i=1}^n \1 \{u_i \neq 0\}$, routinely used in data science applications, is *not* in fact a norm on $\RR^n$. Prove this.
```


```{solution} ex-production-auto-13

For $\alpha > 0$ we always have $\| \alpha u \|_0 = \| u \|_0$, which violates positive homogeneity.
```


(sss-eqvecnorms)=
#### Equivalence of Vector Norms
When $u$ and $(u_m) := (u_m)_{m \in \NN}$ are all elements of $\RR^n$, we say that $(u_m)$ **converges** to $u$ and write $u_m \to u$ if

```{math}
:enumerated: false

\| u_m - u \| \to 0 
    \text{ as } m \to \infty \text{ for some norm } \| \cdot \|
    \text{ on } \RR^n.
```

It might seem that this definition is imprecise. Don't we need to clarify that the convergence is with respect to a particular norm?

In fact we do not. This is because any two norms $\| \cdot \|_a$ and $\| \cdot \|_b$ on $\RR^n$ are **equivalent**, in the sense that there exist finite constants $M, N$ such that

$$
M \|u\|_a \leq \| u\|_b \leq N \| u \|_a \quad \text{for all } u \in \RR^n.
$$ (eq-eqvecnorms)

```{exercise}
:label: ex-production-auto-14

Let us write $\| \cdot \|_a \sim \| \cdot \|_b$ if there exist finite $M, N$ such that {eq}`eq-eqvecnorms` holds. Prove that $\sim$ is an equivalence relation on the set of norms on $\RR^n$.
```


```{exercise}
:label: ex-cciseq

Let $\| \cdot \|_a$ and $\| \cdot \|_b$ be any two norms on $\RR^n$. Given a point $u$ in $\RR^n$ and a sequence $(u_m)$ in $\RR^n$, use {eq}`eq-eqvecnorms` to confirm that $\| u_m - u \|_a \to 0$ implies $\| u_m - u \|_b \to 0$ as $m \to \infty$.
```


Another way to understand $u_m \to u$ is via **pointwise convergence**: each element of the vector sequence $u_m$ converges to the corresponding element of $u$. Pointwise and norm convergence are equivalent, as the next result makes clear.

```{prf:lemma}
:label: l-eqconvec

Fix $(u_m) \subset \RR^n$, $u \in \RR^n$ and norm $\| \cdot \|$ on $\RR^n$. Taking $m \to \infty$, the following statements are equivalent:

(i) $\| u_m - u \| \to 0$,

(ii) $\inner{a, u_m} \to \inner{a, u}$ for all $a \in \RR^n$, and

(iii) $(u_m)$ converges pointwise to $u$.
```


```{exercise}
:label: ex-production-auto-15

Prove {prf:ref}`l-eqconvec`.
```


````{solution} ex-production-auto-15

Let $\| \cdot \|$ be a norm on $\RR^n$, let $(u_m)$ be a sequence in $\RR^n$ and let $u$ be a point in $\RR^n$. To show that (i) implies (ii) we fix $a \in \RR^n$ and observe that

```{math}
:enumerated: false

\text{for all } m \in \NN, \;\;
        |\inner{a, u_m} - \inner{a, u}| 
            = |\inner{a, u_m -u}| 
            \leq \| u_m - u \|_1 \max_i | a_i |.
```

Hence convergence in $\ell_1$ norm implies (ii). In view of {prf:ref}`ex-cciseq`, convergence in $\| \cdot \|$ implies convergence in $\ell_1$, so (i) $\implies$ (ii) is confirmed.

To show that (ii) implies (iii) at the $j$-th component, we just specialize $a$ to the $j$-th canonical basis vector. Finally, to show that (iii) implies (i), we first note that, by the equivalence of norms, it is enough to show that pointwise convergence implies $\ell_1$ convergence; that is,

```{math}
:enumerated: false

\text{(iii) }
        \implies
        \| u_m - u \|_1 
        = \sum_{j \in \natset{n}} |\inner{\delta_j, u_m - u}|
        \to 0,
```

where $\delta_j$ is the $j$-th canonical basis vector. To prove that this sum converges to zero it suffices to show that every element of the sum converges to zero (see {ref}`sss-ocon`), which is true by (iii).
````


```{exercise}
:label: ex-production-auto-16

Using {prf:ref}`l-eqconvec`, provide a simple proof of the fact that convergence in $\RR^n$ is preserved under addition and scalar multiplication: if $u_m \to x$ and $v_m \to y$ in $\RR^n$, while $\alpha_m \to \alpha$ in $\RR$, then $u_m + v_m \to x + y$ and $\alpha_m u_m \to \alpha x$.
```


```{solution} ex-production-auto-16

Consider the claim that $u_m \to x$ and $v_m \to y$ in $\RR^n$ implies $u_m + v_m \to x + y$. We know this is true in the scalar case $n=1$. Moreover, {prf:ref}`l-eqconvec` tells us that convergence in $\RR^n$ holds if and only if it holds componentwise—which is just the scalar case. The rest of the proof is similar.
```


(ss-matnorip)=
### Matrix Norms
In some applications, the number of vertices $n$ of a given digraph is measured in millions or billions. This means that the adjacency matrix $A$ is enormous. To control complexity, $A$ must often be replaced by a sparse approximation $A_s$. It is natural to require that $A$ and $A_s$ are close. But how should we define this?

More generally, how can we impose a metric on the set of matrices to determine similarity or distance between them? One option is to follow the example of vectors on $\RR^n$ and introduce a norm on $\matset{n}{k}$. With such a norm $\| \cdot \|$ in hand, we can regard $A$ and $A_s$ as close when $\| A - A_s \|$ is small.

For this and other reasons, we now introduce the notion of a matrix norm.

#### Definition

Analogous to vectors on $\RR^n$, we will call a function $\| \cdot \|$ from $\matset{n}{k}$ to $\RR_+$ a **norm** if for any $A, B \in \matset{n}{k}$,

::::{grid} 1 1 2 2
:::{grid-item}
(a) $\| A \| \geq 0$

(b) $\| A \| =0 \iff u=0$

(c) $\| \alpha A \| = |\alpha| \| A\|$ and

(d) $\| A + B \| \leq \| A \| + \| B \|$
:::
:::{grid-item}
(nonnegativity)

(positive definiteness)

(positive homogeneity)

(triangle inequality)
:::
::::

The distance between two matrices $A, B$ is then specified as $\| A - B \|$.

Unlike vectors, matrices have a product operation defined over all conformable matrix pairs. We want matrix norms to interact with this product in a predictable way. For example, it is helpful for analysis when a matrix norm $\| \cdot \|$ is **submultiplicative**, meaning that

$$
\| A B \| \leq \| A \| \cdot \| B \|
    \;\;
    \text{ for all conformable matrices } A, B.
$$ (eq-smnm)

A useful implication of {eq}`eq-smnm` is that $\|A^i\| \leq \|A \|^i$ for any $i \in \NN$ and $A \in \matset{n}{n}$, where $A^i$ is the $i$-th power of $A$.

(sss-frobnorm)=
#### The Frobenius Norm
One way to construct a norm on matrix space $\matset{n}{k}$ is to first introduce the **Frobenius inner product** of matrices $A = (a_{ij}), B=(b_{ij})$ as

$$
\inner{A, B}_F 
        := \sum_{i=1}^n \sum_{j=1}^n a_{ij} b_{ij}
        = \trace(A B^\top)
        = \trace(B A^\top).
$$ (eq-frobin)

From this inner product, the **Frobenius norm** of $A \in \matset{n}{k}$ is defined as

$$
\| A \|_F 
    :=  \inner{A, A}^{1/2}_F .
$$ (eq-frobnorm)

In essence, the Frobenius norm converts an $n \times k$ matrix into an $nk$ vector and computes the Euclidean norm.

The Frobenius norm is submultiplicative. The next exercise asks you to prove this in one special case.

```{exercise}
:label: ex-smcsch

Suppose that $A$ is a row vector and $B$ is a column vector. Show that {eq}`eq-smnm` holds in this case when $\| \cdot \|$ is the Frobenius norm.
```


```{solution} ex-smcsch

The Frobenius norm reduces to the Euclidean norm for column and row vectors, so {eq}`eq-smnm` requires that $| \inner{A, B}_F| \leq \| A \|_F \|B\|_F$. This bound certainly holds: it is the Cauchy–Schwarz inequality.
```


(sss-onorm)=
#### The Operator Norm
Another important matrix norm is the **operator norm**, defined at $A \in \matset{n}{k}$ by

$$
\| A \| 
    := \sup \setntn{ \| A u \| }{ u \in \RR^k \text{ and } \| u \| = 1},
$$ (eq-defsn)

where the norm $\| \cdot \|$ on the right hand size of {eq}`eq-defsn` is the Euclidean norm on $\RR^n$.

````{prf:example}
:label: eg-normdiag

If $A = \diag(a_i)$, then, for any $u \in \RR^n$ we have $\|Au\|^2 = \sum_i (a_i u_i)^2$. To maximize this value subject to $\sum_i u_i^2 = 1$, we pick $j$ such that $a_j^2 \geq a_i^2$ for all $i$ and set $u_i = \1\{i=j\}$. The maximized value of $\| Au\|$ is then

```{math}
:enumerated: false

\| A\| = \sqrt{a_j^2} = \max_{i \in \natset{n}} \, |a_i|.
```
````


```{exercise}
:label: ex-sures

Show that $\| A \|$ equals the supremum of $\| A u \|/ \| u \|$ over all $u \neq 0$.
```


````{solution} ex-sures

Let

```{math}
:enumerated: false

a :=
        \sup_{u \neq 0} f(u) 
        \quad \text{where} \quad
        f(u) := \frac{\| A u \|}{ \| u \|} 
        \qquad \text{and let } 
        b := \sup_{\| u \| = 1} \| A u \|
```

Evidently $a \geq b$ because the supremum is over a larger domain. To see the reverse fix $\epsilon > 0$ and let $u$ be a nonzero vector such that $f(u) > a - \epsilon$. Let $\alpha := 1 / \| u\|$ and let $u_b := \alpha u$. Then

```{math}
:enumerated: false

b 
        \geq 
        \| A u_b \|
        = \frac{ \| A u_b \| }{ \| u_b \|}
        = \frac{ \| \alpha A u \| }{ \| \alpha u \|}
        = \frac{\alpha}{\alpha} \frac{\| A u \|}{ \| u \|}
        = f(u) > a - \epsilon
```

Since $\epsilon$ was arbitrary we have $b \geq a$.
````


```{exercise}
:label: ex-production-auto-17

It is immediate from the definition of the operator norm that

$$
\| A u \| \leq \| A \| \cdot \| u \|
        \qquad \forall \, u \in \RR^n.
$$ (eq-smnv)
Using this fact, prove that the operator norm is submultiplicative.
```


```{solution} ex-production-auto-17

Let $A$ and $B$ be elements of $\matset{n}{k}$ and $\matset{n}{j}$ respectively. Fix $v \in \RR^n$. Since $\| A u \| \leq \| A \| \cdot \| u \|$ for any vector $u$, we have $\| A B v \| \leq \| A \| \cdot \| B v \| \leq \| A \| \cdot \| B \| \cdot \| v \|$, from which {eq}`eq-smnm` easily follows.
```


```{exercise}
:label: ex-srsn

Let $\| \cdot \|$ be the operator norm on $\matset{n}{n}$. Show that, for each $A \in \matset{n}{n}$, we have

(i) $\| A \|^2 = r(A^{\top} A)$,

(ii) $r(A)^k \leq \| A^k \|$ for all $k \in \NN$, and

(iii) $\| A^{\top} \| = \| A \|$.
```


#### Other Matrix Norms

Two other useful matrix norms are the $\ell_1$ and $\ell_\infty$ norms given by

```{math}
:enumerated: false

\| A \|_1 := \sum_{i=1}^n \sum_{j=1}^k |a_{ij}|
    \quad \text{and} \quad
    \| A \|_\infty := \max_{i \in \natset{n}, \, j \in \natset{k}} |a_{ij}|.
```

```{exercise}
:label: ex-production-auto-18

Prove that both are norms on $\matset{n}{k}$.
```


```{exercise}
:label: ex-production-auto-19

Prove that both norms are submultiplicative.
```


(sss-eqmatnorms)=
#### Equivalence of Matrix Norms
In {ref}`sss-eqvecnorms` we saw that all norms on $\RR^n$ are equivalent. Exactly the same result holds true for matrix norms: any two norms $\| \cdot \|_a$ and $\| \cdot \|_b$ on $\matset{n}{k}$ are **equivalent**, in the sense that there exist finite constants $M, N$ such that

$$
M \|A\|_a \leq \| A\|_b \leq N \| A \|_a \quad \text{for all } A \in \matset{n}{k}.
$$ (eq-eqmatnorms)

A proof can be found (for abstract finite-dimensional vector space) in {cite}`bollobas1999linear`.

Analogous to the vector case, given $A$ and $(A_m) := (A_m)_{m \in \NN}$ in $\matset{n}{k}$, we say that $(A_m)$ **converges** to $A$ and write $A_m \to A$ if $\| A_m - A \| \to 0$ as $m \to \infty$, where $\| \cdot \|$ is a matrix norm. Once again, we do not need to clarify the norm due to the equivalence property. Also, norm convergence is equivalent to pointwise convergence:

```{exercise}
:label: ex-mnormpw

Prove that, given $A$ and $(A_m)$ in $\matset{n}{k}$, we have $A_m \to A$ as $m \to \infty$ if and only if every element $a_{ij}^m$ of $A_m$ converges to the corresponding element $a_{ij}$ of $A$.
```


```{exercise}
:label: ex-rrmas

Prove the following result for matrices $A, B, C$ and matrix sequences $(A_m), (B_m)$, taking $m \to \infty$ and assuming sizes are conformable:

(i) If $B_m \to A$ and $A_m - B_m \to 0$, then $A_m \to A$.

(ii) If $A_m \to A$, then $B A_m C \to B A C$.
```


````{solution} ex-rrmas

Let $(A_m)$ and $(B_m)$ have the stated properties. Regarding (i), we use the triangle inequality to obtain

```{math}
:enumerated: false

\| A_m - A \|
        = \| A_m - B_m + B_m - A \|
        \leq \| A_m - B_m \| +  \| B_m - A \|.
```

Both terms on the right converge to zero, which completes the proof.

Regarding (ii), we use the submultiplicative property to obtain $\| B A_m C - B A C \| \leq \| B \| \| A_m - A \| \| C \| \to 0$.
````


```{prf:example}

Convergence of the Perron projection in {eq}`eq-patocon` of the Perron–Frobenius theorem was defined using pointwise convergence. By {prf:ref}`ex-mnormpw`, norm convergence also holds. One of the advantages of working with norms is that we can give rates of convergence for norm deviation. This idea is discussed further in {ref}`sss-pfrate`.
```


```{exercise}
:label: ex-mnormqd

Given $A$ and $(A_m)$ in $\matset{n}{n}$, prove that $A_m \to A$ as $m \to \infty$ if and only if $s^\top A_m s \to s^\top A s$ for every $s \in \RR^n$.
```


(sss-mnspec)=
### Iteration in Matrix Space
Results such as {prf:ref}`p-accesspos` already showed us the significance of powers of adjacency matrices. The Perron-Frobenius theorem revealed connections between spectral radii, dominant eigenvectors and powers of positive matrices. In this section we investigate powers of matrices in more depth.

#### Gelfand's Formula

One very general connection between matrix powers and spectral radii is **Gelfand's formula** for the spectral radius:

```{prf:theorem}
:label: t-gf

For any matrix norm $\| \cdot \|$ and $A \in \matset{n}{n}$, we have

$$
r(A) = \lim_{k \to \infty} \| A^k \|^{1/k}.
$$ (eq-gelform)
```


Proofs can be found in {cite}`bollobas1999linear` or {cite}`kreyszig1978introductory`.

```{exercise}
:label: ex-production-auto-20

The references above show that the limit {eq}`eq-gelform` always exists. Using this fact, prove that every choice of norm over $\matset{n}{n}$ yields the same value for this limit.
```


````{solution} ex-production-auto-20

Let $\| \cdot \|_a$ and $\| \cdot \|_b$ be two norms on $\matset{n}{n}$. By the results in {ref}`sss-eqmatnorms`, these norms are equivalent, so there exist constants $M, N$ such that $\|A^k \|_a \leq M \| A^k \|_b \leq N \| A^k  \|_a$ for all $k \in \NN$.

```{math}
:enumerated: false

\fore
        \|A^k \|_a^{1/k} \leq M^{1/k} \| A^k \|_b^{1/k} \leq N^{1/k} \| A^k \|_a^{1/k}
```

for all $k \in \NN$. Taking $k \to \infty$, we see that the definition of the spectral radius is independent of the choice of norm.
````


The next exercise shows that $r(A)<1$ implies $\|A^k\| \to 0$ at a geometric rate.

```{exercise}
:label: ex-igfo

Using {eq}`eq-gelform`, show that $r(A) < 1$ implies the existence of a constant $\delta < 1$ and an $M < \infty$ such that $\| A^k \| \leq \delta^k M$ for all $k \in \NN$.
```


```{solution} ex-igfo

Since $r(A) < 1$, we can find a constant $K$ and an $\epsilon > 0$ such that $k \geq K$ implies $\| A^k \| < (1 - \epsilon)^k$. Setting $M := \max_{k \leq K} \| A^k \|$ and $\delta := 1-\epsilon$ produces the desired constants.
```


```{exercise}
:label: ex-production-auto-21

Consider the dynamic system $x_t = A x_{t-1} + d$ with $x_0$ given, where each $x_t$ and $d$ are vectors in $\RR^n$ and $A$ is $n \times n$. (If you like, you can think of this process as orders flowing backwards through a production network.) Show that, when $r(A)<1$, the sequence $(x_t)_{t \geq 0}$ converges to $x^* := (I - A)^{-1} d$, independent of the choice of $x_0$.
```


````{solution} ex-production-auto-21

Suppose $r(A) < 1$. Iterating backwards on $x_t = A x_{t-1} + d$ yields $x_t = d + Ad + \cdots + A^{t-1} d + A^t x_0$. By the Neumann series lemma, we have $x^* = \sum_{t \geq 0} A^t d$, so

```{math}
:enumerated: false

x^* - x_t 
        = \sum_{j > t} A^j d - A^t x_0.
```

Hence, with $\|\cdot \|$ as both the Euclidean vector norm and the matrix operator norm, we have

```{math}
:enumerated: false

\| x^* - x_t \|
        = \left\| \sum_{j > t} A^j d - A^t x_0 \right\|
        \leq \sum_{j > t} \|  A^j \| \| d \| - \| A^t \| \| x_0 \|.
```

Using $r(A) < 1$ again, it now follows from {prf:ref}`ex-igfo` that $\| x^* - x_t \| \to 0$ as $t \to \infty$.
````


```{exercise}
:label: ex-production-auto-22

In {ref}`ss-eqmulm` we studied a production coefficient matrix of the form $A = (a_{ij})$ in $\matset{n}{n}$ where each $a_{ij}$ takes values in $(0,\infty)$ and, for each $j$, $\alpha + \sum_i a_{ij}=1$ for some $\alpha > 0$. We can calculate $r(A)$ using the following strategy. In {prf:ref}`ex-1malpha` we saw that $\sum_i \sum_j a_{ij}^{(m)} = n (1-\alpha)^m$ for all $m \in \NN$, where $a_{ij}^{(m)}$ is the $(i,j)$-th element of $A^m$. Using the fact that $\| B \|_1 := \sum_i \sum_j |b_{ij}|$ is a matrix norm, apply Gelfand's formula to obtain $r(A) = 1-\alpha$.
```


```{solution} ex-production-auto-22

We have $\| A^m \|_1 = n (1-\alpha)^m$ and so $\| A^m \|_1^{1/m} = n^{1/m} (1-\alpha)$. Taking $m \to \infty$ gives $r(A)=1-\alpha$.
```


(sss-lsr)=
#### A Local Spectral Radius Theorem
The next theorem is a "local" version of Gelfand's formula that relies on positivity. It replaces matrix norms with vector norms, which are easier to compute.

```{prf:theorem}
:label: t-local_sr

Fix $A \in \matset{n}{n}$ and let $\| \cdot \|$ be any norm on $\RR^n$. If $A \geq 0$ and $x \gg 0$, then

$$
\| A^m x\|^{1/m} \to r(A)
        \qquad (m \to \infty).
$$ (eq-local_sr)
```


{prf:ref}`t-local_sr` tells us that, eventually, for any positive $x$, the norm of the vector $A^m x$ grows at rate $r(A)$. A proof can be found in {cite}`krasnoselskiipositive`.[^6]

```{prf:example}

In {ref}`ss-dshocks` we studied how the impact of a given demand shock $\Delta d$ flows backward through a production network, with $A^m (\Delta d)$ giving the impact on sectors at $m$ steps (backward linkages). When $\Delta d \gg 0$ and $r(A) < 1$, {prf:ref}`t-local_sr` tells us that $\| A^m \Delta d\| = O(r(A)^m)$. If we set the norm to $\| \cdot \|_\infty$, this tells us that the maximal impact of demand shocks through backward linkages fades at rate $r(A)$.
```


```{exercise}
:label: ex-production-auto-23

Prove {prf:ref}`t-local_sr` in the case where $A$ is primitive.
```


```{solution} ex-production-auto-23

Let $\| \cdot \|$ be a norm on $\RR^n$. From the Perron–Frobenius theorem ({prf:ref}`t-pf`), when $A$ is primitive, $\| r(A)^{-m} A^m x \| \to c$ as $m \to \infty$, where $c > 0$ whenever $x \gg 0$. Hence $\lim_{m \to \infty} \| A^m x \|^{1/m} = \lim_{m \to \infty} r(A) c^{1/m} = r(A)$.
```


(sss-pfrate)=
#### Convergence to the Perron Projection
The local spectral radius theorem assumes $A \geq 0$. Now we further strengthen this assumption by requiring that $A$ is primitive. In this case, $r(A)^{-m} A^m$ converges to the Perron projection as $m \to \infty$ (see {eq}`eq-patocon`). We want *rates* of convergence in high-dimensional settings.

We fix $A \in \matset{n}{n}$ and label the eigenvalues so that $|\lambda_{i+1}| \leq |\lambda_i|$ for all $i$. Note that $|\lambda_1| = \lambda_1 = r(A)$. Let $E := e \, \epsilon^\top$ be the Perron projection.

```{prf:proposition}

If $A$ is diagonalizable and primitive, then $\alpha := |\lambda_2/\lambda_1| < 1$ and

$$
\| r(A)^{-m} A^m - E  \| = O \left( \alpha^m \right).
$$ (eq-rconpp)
```


Thus, an upper bound on the rate of convergence to the Perron projection is determined by the modulus of the ratio of the first two eigenvalues.

````{prf:proof}
:nonumber:

We saw in {eq}`eq-aspecrep` that $A^m = \sum_{i=1}^n \lambda_i^m e_i \epsilon_i^\top$ for all $m \in \NN$. From this spectral representation we obtain

```{math}
:enumerated: false

r(A)^{-m} A^m - e_1 \, \epsilon_1^\top 
            = r(A)^{-m} \left( A^m - r(A)^m e_1 \, \epsilon_1^\top \right)
            = \sum_{i=2}^n \theta_i^m  e_i
            \epsilon_i^\top
```

when $\theta_i := \lambda_i/r(A)$. Let $\| \cdot \|$ be the operator norm on $\matset{n}{n}$. The triangle inequality gives

```{math}
:enumerated: false

\| r(A)^{-m} A^m - e_1 \, \epsilon_1^\top  \|
        \leq \sum_{i=2}^n | \theta_i| ^m  \| e_i \epsilon_i^\top \|
        \leq | \theta_2| ^m  \sum_{i=2}^n  \| e_i \epsilon_i^\top \|.
```

Since $A$ is primitive, the Perron–Frobenius theorem tells us that $|\lambda_2| < r(A)$. Hence $\alpha := |\theta_2| < 1$. The proof is now complete. ◻
````


### Exact Stability Conditions

The Neumann series lemma tells us that the linear system $x = Ax + d$ has a unique solution whenever $r(A) < 1$. We also saw that, in the input-output model, where $A$ is the adjacency matrix, the condition $r(A)<1$ holds whenever every sector has positive value added ({prf:ref}`a-pva` and {prf:ref}`ex-eara`). Hence we have sufficient conditions for stability.

This analysis, while important, leaves open the question of how tight the conditions are and what happens when they fail. For example, we might ask

(i) To obtain $r(A) < 1$, is it necessary that each sector has positive value added? Or can we obtain the same result under weaker conditions?

(ii) What happens when $r(A) < 1$ fails? Do we always lose existence of a solution, or uniqueness, or both?

In {ref}`sss-srsm` and {ref}`ss-nslconv` below we address these two questions.

(sss-srsm)=
#### Spectral Radii of Substochastic Matrices
To reiterate, the results in {ref}`sss-pwconst` relied on the assumption that every sector has positive value added, which in turn gave us the property $r(A) < 1$ for the adjacency matrix of the input-output production network. Positive value added in every sector is not necessary, however. Here we investigate a weaker condition that is exactly necessary and sufficient for $r(A)<1$. This weaker condition is very helpful for understanding other kinds of networks too, including financial networks, as discussed in {ref}`s-finnet`.

To begin, recall that a matrix $P \in \matset{n}{n}$ is called stochastic if $P \geq 0$ and $P \1 = \1$. Similarly, $P \in \matset{n}{n}$ is called **substochastic** if $P \geq 0$ and $P \1 \leq \1$. Thus, a substochastic matrix is a nonnegative matrix with less than unit row sums. Clearly the transpose $Q^\top$ of a nonnegative matrix $Q$ is substochastic if and only if $Q$ has less than unit column sums.

A natural example of a substochastic matrix is the transpose $A^\top$ of an adjacency matrix $A$ of an input-output network. Indeed, such an $A$ is nonnegative and, for $j$-th column sum we have

```{math}
:enumerated: false

\sum_i  a_{ij} 
    =  \frac{\sum_i z_{ij}}{x_j}
    = \frac{\text{spending on inputs by sector } j}{\text{total sales of sector } j}.
```

Hence $\sum_i  a_{ij} \leq 1$, which says that spending on intermediate goods and services by a given industry does not exceed total sales revenue, is a necessary condition for nonnegative profits in sector $j$. When this holds for all $j$, the adjacency matrix has less than unit column sums.

From {prf:ref}`l-rscsbounds`, we see that any substochastic matrix $P$ has

$$
r(P) \leq \max_i \rsum_i(P) \leq 1.
$$ (eq-rprs)

We wish to know when we can tighten this to $r(P) < 1$.

From {eq}`eq-rprs`, one obvious sufficient condition is that $\rsum_i(P) < 1$ for all $i$. This is, in essence, how we used {prf:ref}`a-pva` (every sector has positive value added) in the input-output model. Under that condition we have $\sum_i  a_{ij} < 1$ for all $j$, which says all column sums are strictly less than one. Hence

```{math}
:enumerated: false

\max_i \csum_i(A) < 1
    \; \iff \;
    \max_i \rsum_i(A^\top) < 1
    \; \implies \;
    r(A^\top) < 1
    \; \iff \;
    r(A) < 1,
```

where the middle implication is by {eq}`eq-rprs` and the last equivalence is by $r(A)=r(A^\top)$.

Now we provide a weaker—in fact necessary and sufficient—condition for $r(P)<1$, based on network structure. To do so, we define an $n \times n$ substochastic matrix $P = (p_{ij})$ to be **weakly chained substochastic** if, for all $m \in \natset{n}$, there exists an $i \in \natset{n}$ such that $m \to i$ and $\sum_j p_{ij} < 1$. Here accessibility of $i$ from $m$ is in terms of the induced weighted digraph.[^7]

```{exercise}
:label: ex-awcs

Let $A = (a_{ij}) \in \matset{n}{n}$ be nonnegative. Show that $A^\top$ is weakly chained substochastic if and only if $A$ has less than unit column sums and, for each $m \in \natset{n}$, there exists an $i \in \natset{n}$ such that $i \to m$ under (the digraph induced by) $A$ and $\sum_k a_{ki} < 1$.
```


```{solution} ex-awcs

We prove only that the stated conditions on $A$ imply that $A^\top$ is weakly chained substochastic, since the proof of the reverse implication is very similar. We set $a'_{ij}:=a_{ji}$, so that $A^\top = (a'_{ij})$.

Let $A$ have the stated properties. Since $A$ has less than unit column sums, $A^\top$ has less than unit rows, so $A^\top$ is substochastic.

Now fix $m \in \natset{n}$ and take $i \in \natset{n}$ such that $i \to m$ under $A$ and $\sum_k a_{ki} < 1$. By {prf:ref}`ex-rar`, $i \to m$ under $A$ is equivalent to $m \to i$ under $A^\top$. Moreover $\sum_k a_{ki} < 1$ is equivalent to $\sum_k a'_{ik} < 1$. Hence $A^\top$ is weakly chained substochastic.
```


````{prf:proposition}
:label: p-wcs

For a substochastic matrix $P$, we have

```{math}
:enumerated: false

r(P) < 1 
        \quad \iff \quad
        P \text{ is weakly chained substochastic}.
```
````


A proof can be found in Corollary 2.6 of {cite}`azimzadeh2019fast`.

Now we return to the input output model. Let's agree to say that sector $i$ is an **upstream supplier** to sector $j$ if $i \to j$ in the input-output network. By {prf:ref}`p-accesspos`, an equivalent statement is that there exists a $k \in \NN$ such that $a^k_{ij} > 0$.

```{exercise}
:label: ex-production-auto-24

Let $A$ be the adjacency matrix of an input-output network and assume that value added is nonnegative in each sector. Using {prf:ref}`p-wcs`, show that $r(A) < 1$ if and only if each sector in the network has an upstream supplier with positive value added.
```


```{solution} ex-production-auto-24

Let $A$ be the adjacency matrix of an input-output network such that value added is nonnegative in each sector. In what follows, we write $a'_{ij}$ for the $i,j$-th element of $A^\top$, so that $a'_{ij} = a_{ji}$.

Let's say that $A$ has property U if, for each sector in the network, there exists an upstream supplier with positive value added. Property U is equivalent to the statement that, for all $m \in \natset{n}$, there is an $i \in \natset{n}$ with $i \to m$ under $A$ and $\sum_k a_{ki} < 1$. By {prf:ref}`ex-awcs`, this is equivalent to the statement that $A^\top$ is weakly chained substochastic. Since $A^\top$ is substochastic, this is, in turn equivalent to $r(A^\top) < 1$. But $r(A)=r(A^\top)$, so property U is equivalent to $r(A)<1$.
```


(ss-nslconv)=
#### A Converse to the Neumann Series Lemma
Since the Neumann series lemma is a foundational result with many economic applications, we want to know what happens when the conditions of the lemma fail. Here is a partial converse:

```{prf:theorem}
:label: t-nslconv

Fix $A \in \matset{n}{n}$ with $A \geq 0$. If $A$ is irreducible, then the following statements are equivalent:

(i) $r(A) < 1$.

(ii) $x = A x + b$ has a unique everywhere positive solution for all $b \geq 0$ with $b \neq 0$.

(iii) $x = A x + b$ has a nonnegative solution for at least one $b \geq 0$ with $b \neq 0$.

(iv) There exists an $x \gg 0$ such that $Ax \ll x$.
```


```{prf:remark}

If $A$ is irreducible and one of (and hence all of) items (i)–(iv) are true, then, by the Neumann series lemma, the unique solution is $x^* := \sum_{m \geq 0} A^m b$.
```


```{prf:remark}

Statement (iii) is obviously weaker than statement (ii). It is important, however, in the case where $r(A) < 1$ fails. In this setting, from the negation of (iii), we can conclude that there is *not even one* nontrivial $b$ in $\RR^n_+$ such that a nonnegative solution to $x=Ax+b$ exists.
```


````{prf:proof}
:nonumber:

**Proof of {prf:ref}`t-nslconv`.**

We show (i) $\iff$  (iv) and then (i) $\iff$ (ii) $\iff$ (iii).

((i) $\Rightarrow$ (iv)). For $x$ in (iv) we can use the Perron–Frobenius theorem to obtain a real eigenvector $e$ satisfying $Ae = r(A) e \ll e$ and $e \gg 0$.

((iv) $\Rightarrow$ (i)). Fix $x \gg 0$ such that $x \gg Ax$. Through positive scaling, we can assume that $\|x\|=1$. Choose $\lambda < 1$ such that $\lambda x \geq Ax$. Iterating on this inequality gives, for all $k \in \NN$,

```{math}
:enumerated: false

\lambda^k x \geq A^k x 
        \quad \implies \quad
        \lambda^k = \lambda^k \|x\|  \geq \|A^k x\|
         \quad \iff \quad
        \| A^k x \|^{1/k} \leq \lambda
```

Hence, by the local spectral radius result in {prf:ref}`t-local_sr`, $r(A) \leq \lambda < 1$.

((i) $\Rightarrow$ (ii)). Existence of a unique solution $x^* = \sum_{i \geq 0} A^i b$ follows from the NSL. Positivity follows from irreducibility of $A$, since $b \neq 0$ and $\sum_i A^i \gg 0$.

((ii) $\Rightarrow$ (iii)). Obvious.

((iii) $\Rightarrow$ (i)). Suppose there is a $b \geq 0$ with $b \neq 0$ and an $x \geq 0$ such that $x = Ax + b$. By the Perron–Frobenius theorem, we can select a left eigenvector $e$ such that $e \gg 0$ and $e^\top A= r(A) e^\top$. For this $e$ we have

```{math}
:enumerated: false

e^\top x 
        = e^\top Ax + e^\top b 
        = r(A) e^\top x + e^\top b .
```

Since $e \gg 0$ and $b \neq 0$, we must have $e^\top b > 0$. In addition, $x \neq 0$ because $b \neq 0$ and $x = Ax+b$, so $e^\top x > 0$. Therefore $r(A)$ satisfies $(1-r(A)) \alpha = \beta$ for positive constants $\alpha, \beta$. Hence $r(A) < 1$. ◻
````


```{exercise}
:label: ex-production-auto-25

For the production system $x = Ax + d$, what do we require on $A$ for the condition $r(A) < 1$ to be necessary for existence of a nonnegative output solution $x^*$, for each nontrivial $d$?
```


```{exercise}
:label: ex-production-auto-26

Irreducibility cannot be dropped from {prf:ref}`t-nslconv`. Provide an example demonstrating that, without irreducibility, we can have $r(A) \geq 1$ for some $A \geq 0$ and yet find a nonzero $b \geq 0$ and an $x \geq 0$ such that $x = A x + b$.
```


```{solution} ex-production-auto-26

Let $A = \diag(a, 1)$ where $0 < a < 1$. Clearly $r(A) = 1$. Let $b^\top = (1, 0)$ and let $x^\top = (1/(1-a), 0)$. Simple algebra shows that $x = Ax + b$.
```


(s-cnprod)=
## Chapter Notes
High quality foundational textbooks on input-output analysis and multisector production networks include {cite}`nikaido1968convex`, {cite}`miller2009input` and {cite}`antras2020global`. References on production networks and aggregate shocks include {cite}`acemoglu2012network`, {cite}`antras2012measuring`, {cite}`di2014firms`, {cite}`carvalho2014micro`, {cite}`barrot2016input`, {cite}`baqaee2018cascading`, {cite}`carvalho2019production`, {cite}`acemoglu2020endogenous`, {cite}`liu2020dynamical`, {cite}`miranda2021production` and {cite}`carvalho2021supply`.

For other network-centric analysis of multisector models, see, for example, {cite}`bernard2019origins`, who use buyer-supplier relationship data from Belgium to investigate the origins of firm size heterogeneity when firms are interconnected in a production network. {cite}`herskovic2018networks` analyzes asset pricing implications of production networks. {cite}`cai2018interfirm` consider the effect of interfirm relationships on business performance. {cite}`la2022optimal` study optimal monetary policy in a production network. {cite}`dew2022tail` analyzes tail risk and aggregate fluctuations in a nonlinear production network. {cite}`elliott2022supply` show that complex supply networks can greatly amplify small idiosyncratic shocks. {cite}`elliott2022networks` provide a survey of network fragility that includes discussion of production networks and the impact of sectoral shocks.

[^1]: We obtain input expenditures and total sales for each sector from the Make-Use Tables of the Input-Output Accounts Data. The figure was created using Python's Networkx library.

[^2]: In order to be consistent with traditional input-output notation (see {ref}`ss-mutmod`), we transpose $i$ and $j$ relative to sources such as {cite}`acemoglu2012network` and {cite}`carvalho2019production`. This is just a matter of convention.

[^3]: Later, in {ref}`s-mst`, we use additional spectral theory to prove the exact result $r(A)=1-\alpha$.

[^4]: In other words, each $S_i$ is an independent copy of the random variable $S := \exp(\mu + \sigma Z)$, where $Z$ is standard normal.

[^5]: The captions in {numref}`f-authority_symmetric_nodes` refer to these two cases as "star networks," in line with recent usage in multisector production models. In graph theory, a star network is an *un*directed graph that (a) is strongly connected and (b) has only one node with degree greater than one.

[^6]: A direct proof of a generalized version of {prf:ref}`t-local_sr` is provided in Theorem B1 of {cite}`borovivcka2020necessary`.

[^7]: Induced weighted digraphs are defined in {ref}`sss-gd`. By {prf:ref}`p-accesspos`, accessibility of $i$ from $m$ is equivalent to existence of a $k \geq 0$ with $p^k_{mi} > 0$, where $p^k_{mi}$ is the $m,i$-th element of $P^k$ (and $P^0 = I$).
