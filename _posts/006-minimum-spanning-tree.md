#  Minimum Spanning Trees - Why UnionFind?
May 25, 2024

Minimum Spanning Trees are beautiful. In this post I'd like to talk about Kruskal's algorithm used to build an MST and why being greedy doesn't work.

> A minimum spanning tree of a weighted graph is a set of edges that connect all the vertices of the graph such that the sum of weights is minimum.

Let's use an example. The following one is taken from the [third test case](https://cses.fi/view/1/61f27db988c11add4cbc20fa796570475682d59fa75e3abf29677b9ede4a015d) of the problem [Road Reparation](https://cses.fi/problemset/task/1675) from the CSES problemset.

### Problem statement

There are n cities and m roads between them. Unfortunately, the condition of the roads is so poor that they cannot be used. Your task is to repair some of the roads so that there will be a decent route between any two cities.

For each road, you know its reparation cost, and you should find a solution where the total cost is as small as possible.

Input: N cities, M roads, M lines containing [city1 , city2, cost of reparation]


here's the plotted image :

<figure>
<img src="../../source_code/minimum_spanning_tree/graph.PNG" width="640" height="360">
</figure>

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

Naturally, sorting the edges in ascending order of their weight, and selecting the first N-1 edges feels right. However, the first N-1 edges, although forming a subset of the edges present in the MST need not contain _all_ the edges of the MST. This observation becomes clear when two vertices have more than one edge with relatively smaller weights.

After studying the algorithm, I felt that it is sufficient to order the edges in asc. order and consider roads that create a _new path_, one where atleast one of the cities at either ends of the road was not visited yet....and this is where I hit the roadblock.

When I order the roads in ascending order and pick according to the above criteria, I ended up choosing 8 roads, instead of 9 with a sum of 21, lesser than the answer which is 31, but still does not connect all the cities.

here's the image with the roads highlighted.

<figure>
<img src="../../source_code/minimum_spanning_tree/kruskals_greedy_only_sort_no_dsu.PNG" width="640" height="360">
<figcaption><i>Final selection of the 8 roads using the greedy approach</i></figcaption>
</figure>


This approach does not work because, if you look closely, _all_ the cities are visited using the 8 roads, and therefore there is no road that creates a _new path_. But this isn't right. Then what is the solution? Disjoint set union i.e, Union find.

How exactly does Union Find help here?

Circling back to the description of Kruskal's Algorithm, to points 3a and 3b, the first step would be creating a tree from both ends of the road and the second step would be adding more cities **and** making them part of our original tree. This changes our selection criteria while considering roads.

Now, when we consider roads that create a _new path_, connecting a city from tree A to a city part of tree B, we _do not_ skip this road anymore just because both cities were previously visited, instead we consider the road to be a part of our MST and merge both the trees into one. In this case, the road is creating a _new path between two different trees_ and this is our new selection criteria.

here's the image with the MST highlighted.

<figure>
<img src="../../source_code/minimum_spanning_tree/kruskals_with_dsu.PNG" width="640" height="360">
<figcaption><i>Final MST</i></figcaption>
</figure>

### Proof of correctness:

1. Sort the edges in ascending order of weight of the edge.
2. Choose an edge and add to final MST only if it joins two separate trees.

Second step ensures we do not create a cycle, i.e we do not add a edge that joins two vertices of the same tree, this violates the definition of a tree (N nodes with N-1 edges) and therefore we pick edges only in ascending order of their weight, therfore the MST is guranateed to have minimal cost.

That's it, I had a hard time convincing myself that a greedy approach with no DSU does not work, but with the above example I finally got it. Thank you for reading, hope you gained some clarity now.

I used [graphonline.ru](https://graphonline.ru/en/) for the above plots.

_~rahultumpala_