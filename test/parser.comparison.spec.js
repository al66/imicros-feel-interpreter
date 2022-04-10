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
describe("Comparison expressions", () => {

    beforeEach(() => { parser = create() });
    
    it("Expression:a = b", (exp = "a = b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual("=");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:a > b", (exp = "a > b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual(">");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:a < b", (exp = "a < b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual("<");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:a <= b", (exp = "a <= b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual("<=");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:a >= b", (exp = "a >= b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual(">=");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:a != b", (exp = "a != b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual("!=");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:a != null", (exp = "a != null") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual("!=");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NULL);
    });
    it("Expression:a between 2 and 4", (exp = "a between 2 and 4") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.BETWEEN);
        expect(parser.results[0].expression.node).toEqual(Node.NAME);
        expect(parser.results[0].expression.value).toEqual("a");
        expect(parser.results[0].left.integer).toEqual(2);
        expect(parser.results[0].right.integer).toEqual(4);
    });
    it("Expression:a in b", (exp = "a in b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual("in");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:a in (b,c)", (exp = "a in (b,c)") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual("in");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.LIST);
        expect(parser.results[0].right.entries).toContainEqual(expect.objectContaining({
            node: Node.NAME,
            value: "b",
        }));
        expect(parser.results[0].right.entries).toContainEqual(expect.objectContaining({
            node: Node.NAME,
            value: "c",
        }));
    });
    it("Expression:a or b", (exp = "a or b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.LOGICAL);
        expect(parser.results[0].operator).toEqual("or");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:a and b", (exp = "a and b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.LOGICAL);
        expect(parser.results[0].operator).toEqual("and");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:a and b+2", (exp = "a and b+2") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.LOGICAL);
        expect(parser.results[0].operator).toEqual("and");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.SUM);
        expect(parser.results[0].right.left.node).toEqual(Node.NAME);
        expect(parser.results[0].right.left.value).toEqual("b");
        expect(parser.results[0].right.right.integer).toEqual(2);
    });
    it("Expression:(a and b)+2", (exp = "(a and b)+2") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.node).toEqual(Node.EVAL);
        expect(parser.results[0].left.expression.node).toEqual(Node.LOGICAL);
        expect(parser.results[0].left.expression.left.value).toEqual("a");
        expect(parser.results[0].left.expression.right.value).toEqual("b");
        expect(parser.results[0].right.integer).toEqual(2);
    });
    it("Expression:a/3 and b+2", (exp = "a/3 and b+2") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.LOGICAL);
        expect(parser.results[0].operator).toEqual("and");
        expect(parser.results[0].left.node).toEqual(Node.PRODUCT);
        expect(parser.results[0].left.left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.left.value).toEqual("a");
        expect(parser.results[0].left.right.integer).toEqual(3);
        expect(parser.results[0].right.node).toEqual(Node.SUM);
        expect(parser.results[0].right.left.node).toEqual(Node.NAME);
        expect(parser.results[0].right.left.value).toEqual("b");
        expect(parser.results[0].right.right.integer).toEqual(2);
    });
    it('Expression:a = "this is a string"', (exp = 'a = "this is a string"') => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.COMPARISON);
        expect(parser.results[0].operator).toEqual("=");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.STRING);
        expect(parser.results[0].right.value).toEqual("\"this is a string\"");
    });

});
