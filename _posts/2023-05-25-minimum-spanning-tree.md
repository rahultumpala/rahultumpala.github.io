---
title: Minimum Spanning Trees - Why UnionFind?
---

Minimum Spanning Trees are beautiful. In this post I'd like to talk about Kruskal's algorithm used to build an MST and why being greedy doesn't work.

> A minimum spanning tree of a weighted graph is a set of edges that connect all the vertices of the graph such that the sum of weights is minimum.

Let's use an example. The following one is taken from the [third test case](https://cses.fi/view/1/61f27db988c11add4cbc20fa796570475682d59fa75e3abf29677b9ede4a015d) of the problem [Road Reparation](https://cses.fi/problemset/task/1675) from the CSES problemset.

### Problem statement

There are n cities and m roads between them. Unfortunately, the condition of the roads is so poor that they cannot be used. Your task is to repair some of the roads so that there will be a decent route between any two cities.

For each road, you know its reparation cost, and you should find a solution where the total cost is as small as possible.

Input: N cities, M roads, M lines containing [city1 , city2, cost of reparation]


When plotted it looks like this :

// IMAGE HERE

### Solution

The Minimum Spanning Tree (MST) of the road network gives the roads that can be repaired while keeping the cost of reparation minimal.

To build the MST we can use either [Prim's](https://en.wikipedia.org/wiki/Prim%27s_algorithm) Algorithm or [Kruskal's](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm) Algorithm. In this case we'll be using the latter.


The algorithm performs the following steps:

1. Create a forest (a set of trees) initially consisting of a separate single-vertex tree for each vertex in the input graph.
2. Sort the graph edges by weight.
3. Loop through the edges of the graph, in ascending sorted order by their weight. For each edge:  \
   a. Test whether adding the edge to the current forest would create a cycle.  \
   b. If not, add the edge to the forest, combining two trees into a single tree.
4. At the termination of the algorithm, the forest forms a minimum spanning forest of the graph. If the graph is connected, the forest has a single component and forms a minimum spanning tree.

Given a simple network containing around 10 edges, anyone would intuitively come up with the idea of selecting edges in ascending order of their weight, since we need to find the minimal tree.

Naturally, sorting the edges in ascending order of their weight, and selecing the first N-1 edges feels right. However, the first N-1 edges, although forming a subset of the edges present in the MST need not contain _all_ the edges of the MST. This observation becomes clear when two vertices have more than one edge with relatively smaller weights.

After studying the algorithm, I felt that it is sufficient to order the edges in asc. order and consider roads that create a _new path_, one where atleast one of the cities at either ends of the road was not visited yet....and this is where I hit the roadblock.



_~rahultumpala_