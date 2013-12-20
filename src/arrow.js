var daggy = require('daggy'),
    combinators = require('fantasy-combinators'),

    compose = combinators.compose,
    constant = combinators.constant,

    Arrow = daggy.tagged('run');

Arrow.of = function(f) {
    return Arrow(function(x) {
        return function(k) {
            return compose(k)(f)(x);
        };
    });
};

Arrow.prototype.next = function() {
    var m = this;
    return Arrow(function(x) {
        return function(k) {
            return m.run(x)(k);
        };
    });
};

// Export
if(typeof module != 'undefined')
    module.exports = {};