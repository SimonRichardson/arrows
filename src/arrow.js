var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),

    Option = require('fantasy-options'),
    Tuple2 = tuples.Tuple2,

    compose = combinators.compose,
    constant = combinators.constant,
    identity = combinators.identity,

    Arrow = daggy.tagged('run');

Arrow.of = function(f) {
    return Arrow(function(x) {
        return function(k) {
            return compose(k)(f)(x);
        };
    });
};

Arrow.prototype.next = function(g) {
    var m = this;
    return Arrow(function(x) {
        return function(k) {
            return m.run(x)(function(x) {
                return g.run(x)(k);
            });
        };
    });
};

Arrow.prototype.fork = function(g) {
    var m = this;
    return Arrow(function(x) {
        return function(k) {
            var lhs = Option.None,
                rhs = Option.None;
            m.run(x)(function(x) {
                lhs = Option.Some(x);
                rhs.map(function(y) {
                    return Tuple2(x, y);
                }).chain(k);
            });
            g.run(x)(function(x) {
                rhs = Option.Some(x);
                lhs.map(function(y) {
                    return Tuple2(y, x);
                }).chain(k);
            });
        };
    });
};

Arrow.prototype.or = function(g) {
    var m = this;
    return Arrow(function(x) {
        return function(k) {
            var result = Option.None;
            m.run(x)(function(x) {
                return result.cata({
                    Some: identity,
                    None: function() {
                        result = Option.Some(x);
                        return k(x);
                    }
                });
            });
            g.run(x)(function(x) {
                return result.cata({
                    Some: identity,
                    None: function() {
                        result = Option.Some(x);
                        return k(x);
                    }
                });
            });
        };
    });
};

// Execute
Arrow.prototype.exec = function(x) {
    var a = Option.None;
    this.run(x)(function(x) {
        a = Option.Some(x);
    });
    return a;
};

// Export
if(typeof module != 'undefined')
    module.exports = Arrow;