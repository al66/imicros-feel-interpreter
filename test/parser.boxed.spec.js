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
describe("Boxed Expressions", () => {

    beforeEach(() => { parser = create() });
    
    it("Expression:[1,2]", (exp = "[1,2]") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.LIST);
        expect(parser.results[0].entries).toContainEqual(expect.objectContaining({ node: Node.NUMBER, integer: 1 }));
        expect(parser.results[0].entries).toContainEqual(expect.objectContaining({ node: Node.NUMBER, integer: 2 }));
    });
    it("Expression:[{a:1},{b:2}]", (exp = "[{a:1},{b:2}]") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.LIST);
        expect(parser.results[0].entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT }));
        expect(parser.results[0].entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT }));
    });
    it("Expression:{a:1}", (exp = "{a:1}") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.CONTEXT);
        expect(parser.results[0].data.node).toEqual(Node.LIST);
        expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "a" }, expression: { node: Node.NUMBER, integer: 1, decimals: NaN, float: 1 } }));
    });
    it("Expression:{}", (exp = "{}") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.CONTEXT);
        expect(parser.results[0].data).toEqual(null);
    });
    it("Expression:{a : 1,b:3}", (exp = "{a : 1,b:3}") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.CONTEXT);
        expect(parser.results[0].data.node).toEqual(Node.LIST);
        expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "a" }, expression: { node: Node.NUMBER, integer: 1, decimals: NaN, float: 1 } }));
        expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "b" }, expression: { node: Node.NUMBER, integer: 3, decimals: NaN, float: 3 } }));
    });
    it("Expression:{\"a\" : 1,b:3}", (exp = "{\"a\" : 1,b:3}") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.CONTEXT);
        expect(parser.results[0].data.node).toEqual(Node.LIST);
        expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.STRING, value: '"a"' }, expression: { node: Node.NUMBER, integer: 1, decimals: NaN, float: 1 } }));
        expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ node:Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "b" }, expression: { node: Node.NUMBER, integer: 3, decimals: NaN, float: 3 } }));
    });
    it("Expression:{a:1 + 2}", (exp = "{a:1 + 2}") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.CONTEXT);
        expect(parser.results[0].data.node).toEqual(Node.LIST);
        expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "a" }, expression: { node: Node.SUM, operator: "+", left: { node: Node.NUMBER, integer: 1, decimals: NaN, float: 1 }, right: { node: Node.NUMBER, integer: 2, decimals: NaN, float: 2 } } }));
    });

});
