---
title: Batching Elements in Apache Flink
---

# Batching Elements in Apache Flink

I've been using Apache Flink at work for almost two years now. During this period I've had the oppportunity to learn a lot about this amazing framework. In this post I'd like to shed light on how you can batch / group elements between process functions in Apache Flink. I'll do this by taking a one of my work pieces as an example, give you an idea of the conventional solutions, why they work / didn't work in my case and how I wrote my own implementation. Let's get started.

In context of this post, we'll refer to an element that crosses each process function as an entity.

For a feature I was implementing, I had to build a mechanism that performs the following operations:
1. Hold a certain number of entities in memory.
2. Batch the entities into a single entity when a certain threshold is reached and push to downstream process functions.
3. If the threshold is not reached within a said interval then batch the existing entities into one and push downstream.
4. Application uses the Flink Table API and hence the solution must work in conjunction with tables. 

--------------

### Conventional Solution(s)

Flink offers a solution out of the box to satisfy a combination of these constraints with the help of a window. There are a few types of windows that can be applied on the elements of your data stream:

1. Tumbling Window
2. Sliding Window
3. Session Window
4. Global Window

These windows are good and can be helpful in most cases. If you're looking for implementations specifying how to use Windows and how they can help you in your datastream needs, you should check out Flink documentation. This post will not cover the usage/implementation of windows.

Windows and keyed streams didn't check all the boxes in our scenario. Here's why:

Using a window allows you to optionally specify allowedLateness, a trigger and an evictor but specifying reduce/aggregate/apply on the elements of the window is mandatory.

Briefly:

- allowedLateness: You can specify how late an element can enter the window. "lateness" is calculated through event time. Event time is a timestamp attached to every entity(event) internally but this feature requires watermarking enabled because watermarks are treated as window boundaries based on which lateness is calculated. allowedLateness is 0 yby default.

- trigger: A trigger can be fired registered on the window to trigger the computation, to clear the window or to do both. A trigger can be used to register timers for future actions as well. In our case a `CountTrigger` can be used to perform some computation when the threshold is reached. `CountTrigger` is available out of the box.

- evictor: As the name suggests, an evictor is used to evict(remove) elements from the window based upon some criteria.

- reduce: Incrementally aggregate the window elements to produce an output of the same type.

- aggregate: Same as reduce but the input type, accumulator type and output types can be different.

- apply: A simple function such as `WindowFunction` but it is deprecated and replaced with the more advanced `ProcessWindowFunction`.

----------

### Constraints

I needed a solution that worked for both bounded and unbounded streams.

In bounded streams, I know the # of entities flowing from the current process function and hence the mechanism shuold be intelligent enough to wait until the threshold is reached. It should only flush the window when:
- Threshold is reached.
- Threshold isn't reached but there aren't any more entities, i.e , the stream will end before threshold is reached.

In unbounded streams, I don't know the # of entities flowing and hence the window must be flushed when:
- Threshold is reached.
- An additional timer threshold is reached, i.e flush the window when no entities are seen in say 1 or 2 minutes.


Both implementations should stay consistent, to avoid maintenance overhead.

-----------

### A bit on State in Apache Flink

Each `ProcessFunction` is provided access to a process function `Context`. This context can be used to manage state specific to that process function, meaning this state is isolated from states managed by other process functions in your job graph. Managing global state which is accessible through all process functions is possible through `RuntimeContext`. 

```java

RuntimeContext rctx = getRuntimeContext();
```
The above snippet can be used to access runtime context, it can be done only in the scope of a process function.

Now, context is used to manage state but the actual content in your state is not stored within the context. `Descriptor`s are used for this purpose. A context contains refereces to state descriptors, which in turn store state. There are different types of descriptors available for storing different types of states, such as descriptors available for storing different types of states, such as ListStateDescriptor `ListStateDescriptor` for storing lists, `ValueStateDescriptor` for storing a single arbitrary object, `MapStateDescriptor` ...you get the idea.

----------

### Why didn't conventional solutions work?

If you observe closely, all the window operations are tightly coupled with time, be it `eventTime` or `processingTime` and not on the count of elements. Although time and timers can be used to our advantage to act on the number of elements flowing through a process function rather than the time units passing, it felt like a hack.

You may argue that `CountTrigger` is built for this same purpose, to window elements using count rather than time. It's true, but `CountTrigger` requires a window to act upon and this window can either be a `GlobalWindow` or a `TimeWindow`. 

- Using a `GlobalWindow` meant upon each trigger will perform the computation on the entire window, from the beginning of the stream till the end(if any). Our scenario requires us to act only on the window size upto the given threshold, so we'll have to maintain state to know how many entities to skip.
- Using a `TimeWindow` requires us to specify a predefined time interval, not exactly what I want.

At this point, using windows didn't feel right. I started looking more deeply into process functions. To keep both implementations consistent, I wanted a process function that could:
- Maintain elements in process function state until the threshold is reached.
- Register a timer that flushes the window when timer ends.

A `KeyedProcessFunction` aptly fits this criteria. I added a dummy key to my data stream to make sure all elements are part of the same window and manually handled state too. A processing time timer can be registered using the `context.timerService().registerProcessingTimeTimer(INTERVAL)` method. This is basically our trigger part.
