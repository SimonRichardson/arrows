/*var Arrow = require('../arrows'),

    inc = function(x) {
        return x + 1;
    };*/

var arrows = {
    'test': function(test) {
       // var a = Arrow.of(constant(1)).next(Arrow.of(constant(inc))).run();
        //console.log(a);
        test.ok(true);
        test.done();
    }
};