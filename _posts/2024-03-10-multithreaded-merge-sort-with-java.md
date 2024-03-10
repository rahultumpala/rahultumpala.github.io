---
title: Multithreaded Merge Sort with Java
---

# Multi-threaded Merge sort with Java

Hello there, it's been some time since my last post. I've been busy with work. Being busy with work is good too, cause I got the chance to play with multi threading.

If you've been following me since the beginning then you'll notice that all my content consits of code in C or C++, it is because I like the explicit control these languages offer. However, at work, I write Java code. So this post will be about Multithreading using Java.

I was working on a Spring boot application -- spring apps are used to serve REST APIs -- and this app had an API that accepted an entity in the request body, the API then reads a file, calls another service with this request entity and returns a response object. The org decided to add an API that accepts multiple entities in request. The goal was to make the processing flow parallel, since each entity & their response is independent of each other.

Luckily, I had some experience implementing multi-threading using `ForkJoinPool`, so I quickly got to work. `ForkJoinPool`s accept `RecursiveTask`s and  `RecursiveAction`s.
 - `RecursiveAction` recursively splits the input action into sub-actions and performs some computation on the input. Each sub-action may run in separate threads, if available.
 - `RecursiveTask`, while similar to `RecursiveAction` also returns the result of the computation. This is predominantly used when the results of each recursive-sub-action could be used to generate the result of the parent action.

The abstractions are pretty simple, but it is easy to run into issues when you do not align your objects properly. This blog post aims to provide a comprehensive example on usage of these abstractions, along with guiding you through common pitfalls.

## The problem statement

There are 100 files named 0.txt to 99.txt, containing 1 million integers in the range 0 to 1 million, separated by a newline character, in a folder named numbers. Read the files and sort the integers using merge sort algorithm.

### Single Threaded approach

The appraoch is straightforward.

1. Read each file into memory
2. Extract the integers into a list
3. Apply merge sort on each list

We'll use the following code to read extract the integers for a file.

```java
public List<Integer> readFile(int num) throws IOException {
        File f = new File("./numbers/"+num+".txt");
        assert f.canRead();

        FileReader r = new FileReader(f);
        BufferedReader reader = new BufferedReader(r);

        List<Integer> nums = new ArrayList<>();

        String line;
        while( (line = reader.readLine()) != null) {
            nums.add(Integer.parseInt(line));
        }

        return nums;
    }
```

Merge sort is implemented using two methods, merge and sort.

- Time Complexity = `O(N log N )`
- Space Complexity = `O(N)`

where N = number of elements in the list

Merge sort is a divide and conquer algorithm.

- `sort()` : recursively divides the input list into two sub-lists, sorts them & merges both the lists to return a final sorted version of the input list
- `merge()` : takes two sorted input lists and merges them while preserving the sort invariant among the elemnts in the output list

The method implmentations are as follows:

**sort**
```java
private List<Integer> sort(List<Integer> nums){
        int len = nums.size();

        if(len == 1) return nums;

        int mid = nums.size() / 2;
        List<Integer> left = sort(nums.subList(0, mid));
        List<Integer> right = sort(nums.subList(mid, len));

        return merge(left, right);
    }
```
and **merge**

```java
private List<Integer> merge(List<Integer> left, List<Integer> right){
        List<Integer> sorted = new ArrayList<>();
        int l = 0, r = 0;
        while(l < left.size() && r < right.size()){
            if(left.get(l) < right.get(r)) {
                sorted.add(left.get(l));
                l += 1;
            }else {
                sorted.add(right.get(r));
                r += 1;
            }
        }

        while(l < left.size()){
            sorted.add(left.get(l));
            l += 1;
        }

        while(r < right.size()){
            sorted.add(right.get(r));
            r += 1;
        }

        return sorted;
    }
```

Pretty simple, right?

### Multi-threaded approach

The recursive division in the `sort()` method is a great example to showcase the applications of `RecursiveAction` and `RecursiveTask` abstractions.

If you observe closely, the `sort()` method only divides the list into two-sublists until it arrives at a 1 element list. No actual computation is performed in this method. The logic to compare elemnts and generate a sorted list is present in the `merge()` method.




```
Single Threaded Sort duration : 69369 milliseconds
MultiThreaded Sort duration : 36674 milliseconds
```

_~rahultumpala_