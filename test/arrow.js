var λ = require('fantasy-check/src/adapters/nodeunit'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),

    tuples = require('fantasy-tuples'),
    Tuple2 = tuples.Tuple2,
    
    Arrow = require('../arrows'),

    inc = function(x) {
        return x + 1;
    },
    mul = function(n) {
        return function(x) {
            return x * n;
        };
    };

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
    'test': function(test) {
        console.log('\n--------------------');
        var a = Arrow.of(1);
        var b = a.fork(a);
        var c = b.next(Arrow.lift(inc).and(Arrow.lift(mul(3))));
        var xx = c.exec();
        console.log(b.exec(), xx);
        test.ok(true);
        test.done();
    }
};