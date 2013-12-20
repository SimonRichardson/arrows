# Arrows

This library implements purely functional, monadic arrows.

```javavscript
var a = Arrow.of(constant(1))
        .next(Arrow.of(int))
        .fork(Arrow.of(constant(3)));
a.exec(); // Tuple2(2, 3)
```

Arrows is in a very early stage, so there are inherently some
things missing! For example:

* Not many tests - no checking against laws / axioms
* Fork is limited to 2 items together
* Operators i.e. `['>>>']` for next
* exec...
