# Multithreaded Merge Sort with Java

March 10, 2024

Hello there, it's been some time since my last post. I've been busy with work. Being busy with work is good too, I got the chance to play with multi threading.

If you've been following me since the beginning then you'll notice that all my content consists of code in C or C++, it is because I like the explicit control these languages offer. However, at work, I write Java code. So this post will be about Multithreading using Java.

I was working on a Spring boot application -- spring apps are used to serve REST APIs -- and this app had an API that accepted an entity in the request body, the API then reads a file, calls another service with this request entity and returns a response object. The org decided to add an API that accepts multiple entities in request. The goal was to make the processing flow parallel, since each entity & their response is independent of each other.

Luckily, I had some experience implementing multi-threading using `ForkJoinPool`, so I quickly got to work. `ForkJoinPool`s accept `RecursiveTask`s and `RecursiveAction`s.

- `RecursiveAction` recursively splits the input action into sub-actions and performs some computation on the input. Each sub-action may run in separate threads, if available.
- `RecursiveTask`, while similar to `RecursiveAction` also returns the result of the computation. This is predominantly used when the results of each recursive-sub-action could be used to generate the result of the parent action.

The abstractions are pretty simple, but it is easy to run into issues when you do not align your objects properly. I want to guide you using a reasonably good example.

## The problem statement

There are 100 files named 0.txt to 99.txt, containing 1 million integers each in the range 0 to 1 million, separated by a newline character, in a folder named numbers. Read the files and sort the integers using merge sort algorithm.

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
- `merge()` : takes two sorted input lists and merges them while preserving the sort invariant among the elements in the output list

method definitions:

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

If you observe closely, the `sort()` method only divides the list into two-sublists until it arrives at a 1 element list. No actual computation is performed in this method. The logic to compare elements and generate a sorted list is present in the `merge()` method.

### Multi-threaded approach

The recursive division in the `sort()` method is a great example to showcase the applications of `RecursiveAction` and `RecursiveTask` abstractions.

I'm using the `RecursiveTask<List<Integer>>` here because we're expecting sorted sublists to be returned from the recursively divided original larger
list.

A `RecursiveTask` has one mandatory method `compute()` that is invoked ONCE per each instance of the task. This is where we divide the list into half and spawn and fork child tasks. Recursively dividing the list is possible until we receive more than one element in the list. We stop this division when the list size is less than or equal to one (to also cover the scenario where the original list itself might be empty).

```java
    @Override
    protected List<Integer> compute() {

       String name = Thread.currentThread().getName();
       System.out.println("Received list " + this.nums + "in thread " + name);

        if(this.nums == null) {
            assert this.fileNum != null;
            try {
                this.nums = readFile(this.fileNum);
            } catch (Exception ignored) {}
        }
        assert this.nums != null;

        int length = this.nums.size();
        if(length <= 1) return this.nums;

        int mid = length/2;
        MergeSort left = new MergeSort.Builder().setNums(this.nums.subList(0, mid)).build();
        MergeSort right = new MergeSort.Builder().setNums(this.nums.subList(mid, length)).build();

        left.fork();
        right.fork();

        return this.merge(left.join(), right.join());
    }
```

Name of the spawned thread is printed into stdout.

Now, the division is complete, it's time to merge the results. The merge method is exactly the same as above.

```java
this.merge(left.join(), right.join())
```

this line joins the forked left and right tasks, i.e, wait for their computation to be complete and results to be returned, then proceeds to forward their results as input to the merge method.

### Submit and Invoke using ForkJoinPool

The first step is to create a `ForkJoinPool`

```java
ForkJoinPool pool = new ForkJoinPool(Runtime.getRuntime().availableProcessors(), factory, null, false);
```

Sharing classloaders across all threads will ensure that all methods in your recursive task/action have access to classloader context and nothing is missed. It is possible to do so using a worker thread factory.

```java
 ForkJoinPool.ForkJoinWorkerThreadFactory factory = new ForkJoinPool.ForkJoinWorkerThreadFactory() {
    @Override
    public ForkJoinWorkerThread newThread(ForkJoinPool pool) {
        ForkJoinWorkerThread worker = ForkJoinPool.defaultForkJoinWorkerThreadFactory.newThread(pool);
        worker.setName("executor-" + worker.getPoolIndex());
        return worker;
    }
};
```

We can set the classloader context to each worker thread, but we have no need for it now, so we'll set the name of the worker thread instead.

Invoking the task is simple, we need only create an instance of our recursive task and use the `invoke` method on the pool object.

```java
for (int fileNum = 0; fileNum < numFiles ; fileNum++) {
    MergeSort multiThreadedSortInstance = new MergeSort.Builder().setFileNum(fileNum).build();
    List<Integer> sorted = pool.invoke(multiThreadedSortInstance);
}
```

If you want to step it up a notch you could invoke only one task and handle the action of iterating & reading from the file in newly generated tasks by forking them to the pool. WILD!

Few Benchmarks for sorting all the 100 files using merge sort.

```
Machine spec:
AMD Ryzen 6cores 12threads 16gb mem

Single Threaded Sort duration : 69369 milliseconds
MultiThreaded Sort duration : 36674 milliseconds
```

The source code for this post: [Main.java](../../source_code/multithreaded_merge_sort/Main.java) & [MergeSort.java](../../source_code/multithreaded_merge_sort/MergeSort.java)

_~rahultumpala_
