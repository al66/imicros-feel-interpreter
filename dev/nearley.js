
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
    //parser.feed(`{ "x-y": 5, result: a+x-y+b}`);

    // parser.feed(`date and time("2022-04-06T08:00:00")`);
    parser.feed(`flight list[item.status = "cancelled"].flight number`);
    // must exclude a as a name
    // parser.feed(`{"a+b": x-y, b: a+b(z), a: u, c: alpha, d:a+b, e: (a)+(b), f: a+c(z)}`);

    // may not exclude c as a name
    // parser.feed(`{calc:function (a:number,b:number) a-b, y:calc(b:c,a:d)+3}`)

    // parser.feed(`{"profit and loss":5, result: profit and loss + 5, result2: profit + margin}`)

    // parser.feed(`{calc:function (a:number,b:number) a+b, y:calc(4,5)+3}`);
    // parser.results is an array of possible parsings.
    console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
} catch (e) {
    console.log("ERROR",util.inspect({ msg: e.message, offset: e.offset, token: e.token }, { showHidden: false, depth: null, colors: true }))
}
