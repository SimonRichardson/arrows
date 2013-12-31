var λ = require('./lib/test'),
    
    applicative = λ.applicative,
    functor = λ.functor,
    monad = λ.monad,

    Arrow = λ.Arrow,
    Tuple2 = λ.Tuple2;

function run(a) {
    return a.exec();
}

exports.arrows = {

    // Applicative Functor tests
    'All (Applicative)': applicative.laws(λ)(Arrow, run),
    'Identity (Applicative)': applicative.identity(λ)(Arrow, run),
    'Composition (Applicative)': applicative.composition(λ)(Arrow, run),
    'Homomorphism (Applicative)': applicative.homomorphism(λ)(Arrow, run),
    'Interchange (Applicative)': applicative.interchange(λ)(Arrow, run),

    // Functor tests
    'All (Functor)': functor.laws(λ)(Arrow.of, run),
    'Identity (Functor)': functor.identity(λ)(Arrow.of, run),
    'Composition (Functor)': functor.composition(λ)(Arrow.of, run),

    // Monad tests
    'All (Monad)': monad.laws(λ)(Arrow, run),
    'Left Identity (Monad)': monad.leftIdentity(λ)(Arrow, run),
    'Right Identity (Monad)': monad.rightIdentity(λ)(Arrow, run),
    'Associativity (Monad)': monad.associativity(λ)(Arrow, run),

    // Manual
    'when calling fork, then next and then finally and should be correct value': λ.check(
        function(a, b) {
            var x = Arrow.of(a).fork(Arrow.of(b)),
                y = x.next(Arrow.lift(λ.inc).and(Arrow.lift(λ.mul(2))));
            return λ.equals(y.exec().x, Tuple2(a + 1, b * 2));
        },
        [Number, Number]
    ),
    'when calling fork should be correct value': λ.check(
        function(a, b) {
            var x = Arrow.of(a).fork(Arrow.of(b));
            return λ.equals(x.exec().x, Tuple2(a, b));
        },
        [λ.AnyVal, λ.AnyVal]
    ),
    'when calling next should be correct value': λ.check(
        function(a, b) {
            var x = Arrow.of(a).next(Arrow.of(b));
            return x.exec().x === b;
        },
        [λ.AnyVal, λ.AnyVal]
    ),
    'when calling fork then first should be correct value': λ.check(
        function(a, b) {
            var x = Arrow.of(a).fork(Arrow.of(b)).first(λ.inc);
            return λ.equals(x.exec().x, Tuple2(a + 1, b));
        },
        [Number, Number]
    ),
    'when calling fork then second should be correct value': λ.check(
        function(a, b) {
            var x = Arrow.of(a).fork(Arrow.of(b)).second(λ.inc);
            return λ.equals(x.exec().x, Tuple2(a, b + 1));
        },
        [Number, Number]
    ),
    'when calling fork then swap should be correct value': λ.check(
        function(a, b) {
            var x = Arrow.of(a).fork(Arrow.of(b)).swap();
            return λ.equals(x.exec().x, Tuple2(b, a));
        },
        [λ.AnyVal, λ.AnyVal]
    ),
    'when calling wait should be correct value': λ.async(
        function(resolve) {
            return function(a) {
                Arrow.of(a).wait(1).next(Arrow.lift(function(x) {
                    resolve(x === a);
                })).exec();
            };
        },
        [λ.AnyVal]
    ),
    'when calling wait then cancel should not call method': λ.async(
        function(resolve) {
            return function(a) {
                var x = Arrow.of(a).wait(1);
                x.next(Arrow.lift(function(x) {
                    resolve(false);
                })).exec();
                x.cancel();
                setTimeout(resolve, 2, true);
            };
        },
        [λ.AnyVal]
    ),
    'when calling event should be correct value': λ.async(
        function(resolve) {
            return function(a) {
                var mockObject = new λ.MockObject(),
                    mockEvent = new λ.MockEvent(λ.MockEvent.Event, 1);

                Arrow.of(a).event(mockObject)(λ.MockEvent.Event).next(Arrow.lift(function(x) {
                    resolve(x === a);
                })).exec();
                mockObject.dispatchEvent(mockEvent);
            };
        },
        [λ.AnyVal]
    ),
    'when calling event then cancel should not call method': λ.async(
        function(resolve) {
            return function(a) {
                var mockObject = new λ.MockObject(),
                    mockEvent = new λ.MockEvent(λ.MockEvent.Event, 1),

                    x = Arrow.of(a).event(mockObject)(λ.MockEvent.Event);
                    x.next(Arrow.lift(function(x) {
                        resolve(false);
                    })).exec();
                x.cancel();
                mockObject.dispatchEvent(mockEvent);
                resolve(true);
            };
        },
        [λ.AnyVal]
    )
};