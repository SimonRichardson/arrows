var λ = require('fantasy-check/src/adapters/nodeunit'),
    applicative = require('fantasy-check/src/laws/applicative'),
    functor = require('fantasy-check/src/laws/functor'),
    monad = require('fantasy-check/src/laws/monad'),

    seqs = require('fantasy-seqs'),
    Seq = seqs.Seq,

    tuples = require('fantasy-tuples'),
    Tuple2 = tuples.Tuple2,
    
    Arrow = require('./../../arrows'),

    equals = function(a, b) {
        var x = Object.keys(a).sort().map(function(v) {
                return a[v];
            }),
            y = Object.keys(b).sort().map(function(v) {
                return b[v];
            }),
            xx = Seq.fromArray(x),
            yy = Seq.fromArray(y);

        return xx.zip(yy).fold(true, function(a, b) {
            return a && b._1 === b._2;
        });
    },
    inc = function(x) {
        return x + 1;
    },
    mul = function(n) {
        return function(x) {
            return x * n;
        };
    };

λ = λ
    .property('equals', equals)
    .property('inc', inc)
    .property('mul', mul)

    .property('Arrow', Arrow)
    .property('Tuple2', Tuple2)

    .property('applicative', applicative)
    .property('functor', functor)
    .property('monad', monad);

if (typeof module != 'undefined')
    module.exports = λ;