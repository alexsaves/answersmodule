# Answers Sample Module Loader

This a possible approach for delivering a number of client-side products, and possible approaches for configuring those products.

This prototype uses the [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition) pattern to define products and dependencies. Rather than rolling our code into a single (large) payload, we benefit from some degree of parallelism, and only retrieve the products we need on the pages we need them on.
