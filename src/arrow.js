var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),
    tuples = require('fantasy-tuples'),

    Option = require('fantasy-options'),
    Tuple2 = tuples.Tuple2,

    compose = combinators.compose,
    constant = combinators.constant,
    identity = combinators.identity,

    Arrow = daggy.tagged('run');

Arrow.of = function(a) {
    return Arrow.lift(constant(a));
};
Arrow.lift = function(f) {
    return Arrow(function(x) {
        return function(k) {
            return compose(k)(f)(x);
        };
    });
};
Arrow.identity = function(a) {
    return Arrow.lift(identity);
};

// Methods
Arrow.prototype.chain = function(f) {
    var m = this;
    return Arrow(function(x) {
        return function(k) {
            return m.run(x)(function(x) {
                return f(x).run(x)(k);
            });
        };
    });
};

// Derived
Arrow.prototype.ap = function(a) {
    return this.chain(function(f) {
        return a.map(f);
    });
};
Arrow.prototype.map = function(f) {
    return this.chain(function(a) {
        return Arrow.of(f(a));
    });
};

// Common
Arrow.prototype.next = function(g) {
    return this.chain(constant(g));
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
Arrow.prototype.first = function(f) {
    return this.map(function(x) {
        return Tuple2(f(x._1), x._2);
    });
};
Arrow.prototype.second = function(f) {
    return this.map(function(x) {
        return Tuple2(x._1, f(x._2));
    });
};
Arrow.prototype.swap = function() {
    return this.map(function(x) {
        return Tuple2(x._2, x._1);
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