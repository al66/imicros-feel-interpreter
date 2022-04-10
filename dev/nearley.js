
const nearley = require("nearley");
const grammar = require("./../lib/feel.grammar.js");
const util = require('util');

function create() {
    return new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
}

try {
    // Create a Parser object from our grammar.
    var parser = create();
    // Parse something!
    parser.feed(" if a then b else if c then d else e ");
    // parser.results is an array of possible parsings.
    console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
} catch (e) {
    console.log("ERROR",util.inspect({ msg: e.message, offset: e.offset, token: e.token }, { showHidden: false, depth: null, colors: true }))
}
