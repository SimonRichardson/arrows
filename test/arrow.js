var Arrow = require('../arrows'),
    combinators = require('fantasy-combinators'),

    constant = combinators.constant,
    identity = combinators.identity,

    inc = function(x) {
        return x + 1;
    };

exports.arrows = {
    'test': function(test) {
        var a = Arrow.of(constant(1)).fork(Arrow.of(constant(2))).or(Arrow.of(constant(3))).exec();
        console.log(a);
        test.ok(true);
        test.done();
    }
};