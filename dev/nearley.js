
const nearley = require("nearley");
const grammar = require("./feel.grammar.js");
const util = require('util');

function create() {
    return new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
}

// Create a Parser object from our grammar.

// Parse something!
// parser.results is an array of possible parsings.
try {
    var parser = create();

    parser = create();
    parser.feed("a*b*c");
    console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));


} catch (e) {
    console.log("ERROR",util.inspect({ msg: e.message, offset: e.offset, token: e.token }, { showHidden: false, depth: null, colors: true }))
}
