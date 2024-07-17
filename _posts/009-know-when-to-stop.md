# Know when to stop
July 17, 2024
We spend a lot of time on many ideas, some work out, some don't. It's important to spot early signs walking on false trails.


We spend a lot of time on many ideas, some work out, some don't. It's important to spot early signs walking on false trails. 

Recently I put forward a proposition at work. I proposed we rewrite a service that's using temporal into one that uses Akka. Temporal wasn't being maintained by our team, it's deployed and owned by another team and our workflows are executed on their instance. This is acceptable because having two instances of temporal increases cost considerably. The rewrite had to be backwards compatibile as well, so I needed to add actors support in the main service itself.

I proposed a rewrite because I felt there was no need to use temporal, to cut down cross-team dependency, maintain ownership of our services and scale accordingly (we're anticipating high load as adoption increases soon).

This service had a REST interface through Spring and invokes the required activity in temporal whenever a request is recieved. The activies are heavily IO bound. Eventual consistency semantics are to be honored meaning work can be done asynchronously.

10 days ago I started reading through Akka documentation and came to a conclusion that we could use the Actor model effectively with separate dispatchers for IO bound actors and a separate dispatcher for the main system, with a high queue size for both.

It seemed like a good solution and I started the rewrite, replicated a good amount of functionality through Actors.