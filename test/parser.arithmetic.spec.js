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
describe("Arithmetic Expressions", () => {

    beforeEach(() => { parser = create() });
    
    it("Expression:-.99", (exp = "-.99") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.NEGATION);
        expect(parser.results[0].expression.decimals).toEqual(99);
        expect(parser.results[0].expression.float).toEqual(0.99);
    });
    it("Expression:-(.99)", (exp = "-(.99)") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.NEGATION);
        expect(parser.results[0].expression.node).toEqual(Node.EVAL);
        expect(parser.results[0].expression.expression.decimals).toEqual(99);
    });
    it("Expression:-98.746", (exp = "-98.746") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.NEGATION);
        expect(parser.results[0].expression.integer).toEqual(98);
        expect(parser.results[0].expression.decimals).toEqual(746);
    });
    it("Expression:-a", (exp = "-a") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.NEGATION);
        expect(parser.results[0].expression.node).toEqual(Node.NAME);
        expect(parser.results[0].expression.value).toEqual("a");
    });
    it("Expression:1+2*3", (exp = "1+2*3") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.integer).toEqual(1);
        expect(parser.results[0].right.node).toEqual(Node.PRODUCT);
        expect(parser.results[0].right.operator).toEqual("*");
        expect(parser.results[0].right.left.integer).toEqual(2);
        expect(parser.results[0].right.right.integer).toEqual(3);
    });
    it("Expression:1/2-3", (exp = "1/2-3") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("-");
        expect(parser.results[0].left.node).toEqual(Node.PRODUCT);
        expect(parser.results[0].left.operator).toEqual("/");
        expect(parser.results[0].left.left.integer).toEqual(1);
        expect(parser.results[0].left.right.integer).toEqual(2);
        expect(parser.results[0].right.integer).toEqual(3);
    });
    it("Expression:9.5+77", (exp = "9.5+77") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.integer).toEqual(9);
        expect(parser.results[0].left.decimals).toEqual(5);
        expect(parser.results[0].right.integer).toEqual(77);
    });
    it("Expression:(9.5-8.6)+77", (exp = "(9.5-8.6)+77") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.node).toEqual(Node.EVAL);
        expect(parser.results[0].left.expression.node).toEqual(Node.SUM);
        expect(parser.results[0].left.expression.operator).toEqual("-");
        expect(parser.results[0].left.expression.left.integer).toEqual(9);
        expect(parser.results[0].left.expression.left.decimals).toEqual(5);
        expect(parser.results[0].left.expression.right.integer).toEqual(8);
        expect(parser.results[0].left.expression.right.decimals).toEqual(6);
        expect(parser.results[0].right.integer).toEqual(77);
    });
    it("Expression:((9.5)- 8.6 ) + 77", (exp = "((9.5)- 8.6 ) + 77") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.node).toEqual(Node.EVAL);
        expect(parser.results[0].left.expression.node).toEqual(Node.SUM);
        expect(parser.results[0].left.expression.operator).toEqual("-");
        expect(parser.results[0].left.expression.left.node).toEqual(Node.EVAL);
        expect(parser.results[0].left.expression.left.expression.integer).toEqual(9);
        expect(parser.results[0].left.expression.left.expression.decimals).toEqual(5);
        expect(parser.results[0].left.expression.right.integer).toEqual(8);
        expect(parser.results[0].left.expression.right.decimals).toEqual(6);
        expect(parser.results[0].right.integer).toEqual(77);
    });
    it("Expression:1/2**-4-3", (exp = "1/2**-4-3") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("-");
        expect(parser.results[0].left.node).toEqual(Node.PRODUCT);
        expect(parser.results[0].left.operator).toEqual("/");
        expect(parser.results[0].left.left.integer).toEqual(1);
        expect(parser.results[0].left.right.node).toEqual(Node.EXPONENTATION);
        expect(parser.results[0].left.right.left.integer).toEqual(2);
        expect(parser.results[0].left.right.right.node).toEqual(Node.NEGATION);
        expect(parser.results[0].left.right.right.expression.integer).toEqual(4);
        expect(parser.results[0].right.integer).toEqual(3);
    });
    it("Expression:a+b-c", (exp = "a+b-c") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("-");
        expect(parser.results[0].left.node).toEqual(Node.SUM);
        expect(parser.results[0].left.operator).toEqual("+");
        expect(parser.results[0].left.left.value).toEqual("a");
        expect(parser.results[0].left.right.value).toEqual("b");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("c");
    });
    it("Expression:a*b*c", (exp = "a*b*c") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.PRODUCT);
        expect(parser.results[0].operator).toEqual("*");
        expect(parser.results[0].left.node).toEqual(Node.PRODUCT);
        expect(parser.results[0].left.operator).toEqual("*");
        expect(parser.results[0].left.left.value).toEqual("a");
        expect(parser.results[0].left.right.value).toEqual("b");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("c");
    });
    it("Expression:a + b/2 *6", (exp = "a + b/2 *6") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].right.node).toEqual(Node.PRODUCT);
    });
    it("Expression:x*(a + b)", (exp = "x*(a + b)") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.PRODUCT);
        expect(parser.results[0].operator).toEqual("*");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].right.node).toEqual(Node.EVAL);
    });
    it("Expression:(a + b)-(c+d)", (exp = "(a + b)-(c+d)") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("-");
        expect(parser.results[0].left.node).toEqual(Node.EVAL);
        expect(parser.results[0].right.node).toEqual(Node.EVAL);
    });
    it("Expression:((a + b)*2)-(c+d)", (exp = "((a + b)*2)-(c+d)") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("-");
        expect(parser.results[0].left.node).toEqual(Node.EVAL);
        expect(parser.results[0].right.node).toEqual(Node.EVAL);
    });
    it("Expression:a+b", (exp = "a+b") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("b");
    });
    it("Expression:x0 + y", (exp = "x0 + y") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("x0");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("y");
    });
    it("Expression:name with white space + other expression", (exp = "name with white space + other expression") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.node).toEqual(Node.NAME);
        expect(parser.results[0].left.value).toEqual("name with white space");
        expect(parser.results[0].right.node).toEqual(Node.NAME);
        expect(parser.results[0].right.value).toEqual("other expression");
    });
    it("Expression:deep.a + deep.b.c", (exp = "deep.a + deep.b.c") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.SUM);
        expect(parser.results[0].operator).toEqual("+");
        expect(parser.results[0].left.node).toEqual(Node.PATH);
        expect(parser.results[0].left.object.value).toEqual("deep");
        expect(parser.results[0].left.property.value).toEqual("a");
        expect(parser.results[0].right.node).toEqual(Node.PATH);
        expect(parser.results[0].right.object.object.value).toEqual("deep");
        expect(parser.results[0].right.object.property.value).toEqual("b");
        expect(parser.results[0].right.property.value).toEqual("c");
    });
    it("Expression:(a+b)", (exp = "(a+b)") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.EVAL);
        expect(parser.results[0].expression.node).toEqual(Node.SUM);
        expect(parser.results[0].expression.operator).toEqual("+");
        expect(parser.results[0].expression.left.value).toEqual("a");
        expect(parser.results[0].expression.right.value).toEqual("b");
    });

});
