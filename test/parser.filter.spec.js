"use strict";

const nearley = require("nearley");
const grammar = require("../lib/feel.grammar.js");
const Node = require("../lib/ast.js");
const util = require('util');

function create() {
    return new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
}

var parser;
function parse(exp) {
    try {
        parser.feed(exp);
        return parser.results;
    } catch(e) {
        console.log("ERROR",util.inspect({ msg: e.message, offset: e.offset, token: e.token }, { showHidden: false, depth: null, colors: true }))
        return {};
    }
}


let exp = "";
describe("Filter Expressions", () => {

    beforeEach(() => { parser = create() });
    
    it("Expression:a[b]", (exp = "a[b]") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.FILTER);
        expect(parser.results[0].list.node).toEqual(Node.NAME);
        expect(parser.results[0].list.value).toEqual("a");
        expect(parser.results[0].filter.node).toEqual(Node.NAME);
        expect(parser.results[0].filter.value).toEqual("b");
    });
    it("Expression:a[0]", (exp = "a[0]") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.FILTER);
        expect(parser.results[0].list.node).toEqual(Node.NAME);
        expect(parser.results[0].list.value).toEqual("a");
        expect(parser.results[0].filter.node).toEqual(Node.NUMBER);
        expect(parser.results[0].filter.integer).toEqual(0);
    });
    it("Expression:[1,2,3,4][-2]", (exp = "[1,2,3,4][-2]") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.FILTER);
        expect(parser.results[0].list.node).toEqual(Node.LIST);
        expect(parser.results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
        expect(parser.results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 2 }));
        expect(parser.results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
        expect(parser.results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 4 }));
        expect(parser.results[0].filter.node).toEqual(Node.NEGATION);
        expect(parser.results[0].filter.expression.node).toEqual(Node.NUMBER);
        expect(parser.results[0].filter.expression.integer).toEqual(2);
    });

});
