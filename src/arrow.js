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
Arrow.empty = function() {
    return Arrow.lift(function() {
    });
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
Arrow.prototype.cancel = function() {};
Arrow.prototype.next = function(g) {
    return this.chain(constant(g));
};
Arrow.prototype.fork = function(g) {
    var m = this;
    return Arrow(function(x) {
        return function(k) {
            return m.and(g).run(Tuple2(x, x))(k);
        };
    });
};
Arrow.prototype.and = function(g) {
    var m = this;
    return Arrow(function(x) {
        return function(k) {
            // Horrid State
            var lhs = Option.None,
                rhs = Option.None;
            m.run(x._1)(function(x) {
                lhs = Option.Some(x);
                rhs.map(function(y) {
                    return Tuple2(x, y);
                }).chain(k);
            });
            g.run(x._2)(function(x) {
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
            // Horrid State
            var result = Option.None,
                a = m.run(x)(function(x) {
                    b.cancel();
                    return result.cata({
                        Some: identity,
                        None: function() {
                            result = Option.Some(x);
                            return k(x);
                        }
                    });
                }),
                b = g.run(x)(function(x) {
                    a.cancel();
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

Arrow.prototype.wait = function(n) {
    var m = this,
        a = Arrow(function(x) {
            return function(k) {
                id = setTimeout(function() {
                    m.run(x)(k);
                }, n);
            };
        }),
        id;
    a.cancel = function() {
        clearTimeout(id);
    };
    return a;
};
Arrow.prototype.event = function(o) {
    var m = this;
    return function(e) {
        var f = function(k) {
                return function(e) {
                    m.run(e)(k);
                };
            },
            a = Arrow(function(x) {
                return function(k) {
                    id = f(k);
                    o.addEventListener(e, id, true);
                };
            }),
            id;
        a.cancel = function() {
            o.removeEventListener(e, id);
        };
        return a;
    };
};
Arrow.prototype.loop = function() {
    var m = this,
        a = Arrow.lift(function rec(x) {
            m.run(x)(rec);
        });
    return a;
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