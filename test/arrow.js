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
    )
};