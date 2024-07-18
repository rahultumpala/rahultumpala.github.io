# Know when to stop
July 17, 2024
We spend a lot of time on many ideas, some work out, some don't. It's important to spot early signs walking on false trails.


We spend a lot of time on many ideas, some work out, some don't. It's important to spot early signs of walking on false trails. 

Recently I put forward a proposition at work. I proposed we rewrite a service that's using temporal into one that uses Akka. Temporal wasn't being maintained by our team, it's deployed and owned by another team and our workflows are executed on their instance. This is acceptable because having two instances of temporal increases cost considerably. The rewrite had to be backwards compatibile as well, so I needed to add actors support in the main service itself.

I proposed a rewrite because I felt there was no need to use temporal, to cut down cross-team dependency, maintain ownership of our services and scale accordingly (we're anticipating high load as adoption increases soon).

This service had a REST interface through Spring and invokes the required activity in temporal whenever a request is recieved. The activies are heavily IO bound. Eventual consistency semantics are to be honored meaning work can be done asynchronously.

10 days ago I started reading through Akka documentation and came to a conclusion that we could use the Actor model effectively with separate dispatchers for IO bound actors and a separate dispatcher for the main system, with a high queue size for both.

It seemed like a good solution and I started the rewrite, replicated a good amount of functionality through Actors and started testing. While testing I noticed that Spring instantiated beans are not being injected into the actors although I was using the `@Autowired` annotation.

I googled for more than a day and realised that Spring instantiated beans cannot be injected into typed actors that are created using the `getContext().spawn()` method. There are spring extensions that instantiate untyped actors and we can utilize the `@Autowired` annotation in those actors, but this functionality is absent in the case of typed actors. There is no official documentation either. One cannot instantiate typed actors outside of the actor system. 

This was a huge blocker. I was at crossroads and possible solutions were to switch back to untyped actors, move away from spring and switch to play since it has great support for akka or use guice for DI, or just instantiate everything whenever needed and don't depend on DI which is great because it does not cause any concurrent access issues and follows the functional programming paradigm in a way.

Unfortunately, none of these were viable due to the size of the repository and how tightly coupled all the classes were with spring annotations. The refactoring would take weeks and if we were to go this way it would be beneficial to rewrite everything from scratch and design it in an akka friendly way. Also, the sprint would be completed and we would have to spill this task or reprioritize. This is one of the primary reasons I dislike the agile, scrum methodologies. Work is measured based on the outcome and research efforts cannot be quantified in this manner and hence cannot be represented in terms of measurable outcomes. What a strange standard? or are the folks at my organization not utilizing it properly?

Anyway, 10 days were over and no feasible paths were visible. We decided to stop the rewrite for now and add the other functionality we were going to add anyway.

It doesn't feel good to spend time researching something, deeeming it a viable alternative and work towards it only to find out that it wasn't a viable alternative.

What did I miss? What could I have done differently to reach this conclusion sooner?

Laying down the required work, documenting it in minute detail probably would have helped out in finding this was a false trail leading nowhere.

Things that seem trivial may not really be trivial. This is probably something that can be learnt through experience and experimentation.

I took DI for granted because there weren't any instances where it didn't behave as expected. In hindsight, all of them were spring / spring related services / services that I had written from scratch, so I had control over external DI libraries or trivial DI implementations that I've written.

This was a valuable lesson. 

Research thoroughly, be informed, think deeply, act quickly.

_~rahultumpala_