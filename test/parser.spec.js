"use strict";

const nearley = require("nearley");
const grammar = require("./../lib/feel.grammar.js");
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
describe("Test parser", () => {

    beforeEach(() => { parser = create() });

    describe("Numeric Literal", () => {
        it("Expression:5", (exp = "5") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("number");
            expect(parser.results[0].integer).toEqual(5);
        });
        it("Expression:98.746", (exp = "98.746") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("number");
            expect(parser.results[0].integer).toEqual(98);
            expect(parser.results[0].decimals).toEqual(746);
        });
        it("Expression:.99", (exp = ".99") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("number");
            expect(parser.results[0].decimals).toEqual(99);
        });
    });

    describe("Arithmetic Negation", () => {
        it("Expression:-.99", (exp = "-.99") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("negation");
            expect(parser.results[0].expression.decimals).toEqual(99);
        });
        it("Expression:-(.99)", (exp = "-(.99)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("negation");
            expect(parser.results[0].expression.type).toEqual("eval");
            expect(parser.results[0].expression.expression.decimals).toEqual(99);
        });
        it("Expression:-98.746", (exp = "-98.746") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("negation");
            expect(parser.results[0].expression.integer).toEqual(98);
            expect(parser.results[0].expression.decimals).toEqual(746);
        });
        it("Expression:-a", (exp = "-a") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("negation");
            expect(parser.results[0].expression.type).toEqual("name");
            expect(parser.results[0].expression.value).toEqual("a");
        });
    });

    describe("Simple Literal", () => {
        it("Expression:a", (exp = "a") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("name");
            expect(parser.results[0].value).toEqual("a");
        });
        it("Expression:null", (exp = "null") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("null");
        });
        it("Expression:name with white space", (exp = "name with white space") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("name");
            expect(parser.results[0].value).toEqual("name with white space");
        });
        it("Expression:x0", (exp = "x0") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("name");
            expect(parser.results[0].value).toEqual("x0");
        });
        it("Expression:x0 y1", (exp = "x0 y1") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("name");
            expect(parser.results[0].value).toEqual("x0 y1");
        });
        it('Expression:"this is a string with something :9999 inside"', (exp = '"this is a string with something :9999 inside"') => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("string");
            expect(parser.results[0].value).toEqual("\"this is a string with something :9999 inside\"");
        });
        it('Expression:"this is a string with \'a string\' inside"', (exp = '"this is a string with \'a string\' inside"') => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("string");
            expect(parser.results[0].value).toEqual("\"this is a string with 'a string' inside\"");
        });
    });

    describe("Boolean Literal", () => {
        it("Expression:true", (exp = "true") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("boolean");
            expect(parser.results[0].value).toEqual(true);
        });
        it("Expression:false", (exp = "false") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("boolean");
            expect(parser.results[0].value).toEqual(false);
        });
    });

    describe("Interval", () => {
        it("Expression:[0..9]", (exp = "[0..9]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("interval");
            expect(parser.results[0].open).toEqual("[");
            expect(parser.results[0].close).toEqual("]");
            expect(parser.results[0].from.integer).toEqual(0);
            expect(parser.results[0].to.integer).toEqual(9);
        });
        it("Expression:[a.b..b.a]", (exp = "[a.b..b.a]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("interval");
            expect(parser.results[0].open).toEqual("[");
            expect(parser.results[0].close).toEqual("]");
            expect(parser.results[0].from.type).toEqual("path");
            expect(parser.results[0].from.object.value).toEqual("a");
            expect(parser.results[0].from.property.value).toEqual("b");
            expect(parser.results[0].to.type).toEqual("path");
            expect(parser.results[0].to.object.value).toEqual("b");
            expect(parser.results[0].to.property.value).toEqual("a");
        });
        it("Expression:[a.b .. b.a]", (exp = "[a.b .. b.a]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("interval");
            expect(parser.results[0].open).toEqual("[");
            expect(parser.results[0].close).toEqual("]");
            expect(parser.results[0].from.type).toEqual("path");
            expect(parser.results[0].from.object.value).toEqual("a");
            expect(parser.results[0].from.property.value).toEqual("b");
            expect(parser.results[0].to.type).toEqual("path");
            expect(parser.results[0].to.object.value).toEqual("b");
            expect(parser.results[0].to.property.value).toEqual("a");
        });
        it("Expression:[0.85...99]", (exp = "[0.85...99]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("interval");
            expect(parser.results[0].open).toEqual("[");
            expect(parser.results[0].close).toEqual("]");
            expect(parser.results[0].from.type).toEqual("number");
            expect(parser.results[0].from.decimals).toEqual(85);
            expect(parser.results[0].to.type).toEqual("number");
            expect(parser.results[0].to.decimals).toEqual(99);
        });
        it("Expression:[from something..to something]", (exp = "[from something..to something]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("interval");
            expect(parser.results[0].open).toEqual("[");
            expect(parser.results[0].close).toEqual("]");
            expect(parser.results[0].from.type).toEqual("name");
            expect(parser.results[0].from.value).toEqual("from something");
            expect(parser.results[0].to.type).toEqual("name");
            expect(parser.results[0].to.value).toEqual("to something");
        });
    });

    describe("Arithmetic Expressions", () => {
        it("Expression:1+2*3", (exp = "1+2*3") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.integer).toEqual(1);
            expect(parser.results[0].right.type).toEqual("product");
            expect(parser.results[0].right.operator).toEqual("*");
            expect(parser.results[0].right.left.integer).toEqual(2);
            expect(parser.results[0].right.right.integer).toEqual(3);
        });
        it("Expression:1/2-3", (exp = "1/2-3") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("-");
            expect(parser.results[0].left.type).toEqual("product");
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
            expect(parser.results[0].type).toEqual("sum");
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
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("eval");
            expect(parser.results[0].left.expression.type).toEqual("sum");
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
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("eval");
            expect(parser.results[0].left.expression.type).toEqual("sum");
            expect(parser.results[0].left.expression.operator).toEqual("-");
            expect(parser.results[0].left.expression.left.type).toEqual("eval");
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
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("-");
            expect(parser.results[0].left.type).toEqual("product");
            expect(parser.results[0].left.operator).toEqual("/");
            expect(parser.results[0].left.left.integer).toEqual(1);
            expect(parser.results[0].left.right.type).toEqual("exponentation");
            expect(parser.results[0].left.right.left.integer).toEqual(2);
            expect(parser.results[0].left.right.right.type).toEqual("negation");
            expect(parser.results[0].left.right.right.expression.integer).toEqual(4);
            expect(parser.results[0].right.integer).toEqual(3);
        });
        it("Expression:a+b-c", (exp = "a+b-c") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("-");
            expect(parser.results[0].left.type).toEqual("sum");
            expect(parser.results[0].left.operator).toEqual("+");
            expect(parser.results[0].left.left.value).toEqual("a");
            expect(parser.results[0].left.right.value).toEqual("b");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("c");
        });
        it("Expression:a*b*c", (exp = "a*b*c") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("product");
            expect(parser.results[0].operator).toEqual("*");
            expect(parser.results[0].left.type).toEqual("product");
            expect(parser.results[0].left.operator).toEqual("*");
            expect(parser.results[0].left.left.value).toEqual("a");
            expect(parser.results[0].left.right.value).toEqual("b");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("c");
        });
        it("Expression:a + b/2 *6", (exp = "a + b/2 *6") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].right.type).toEqual("product");
        });
        it("Expression:x*(a + b)", (exp = "x*(a + b)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("product");
            expect(parser.results[0].operator).toEqual("*");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].right.type).toEqual("eval");
        });
        it("Expression:(a + b)-(c+d)", (exp = "(a + b)-(c+d)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("-");
            expect(parser.results[0].left.type).toEqual("eval");
            expect(parser.results[0].right.type).toEqual("eval");
        });
        it("Expression:((a + b)*2)-(c+d)", (exp = "((a + b)*2)-(c+d)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("-");
            expect(parser.results[0].left.type).toEqual("eval");
            expect(parser.results[0].right.type).toEqual("eval");
        });
        it("Expression:a+b", (exp = "a+b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:x0 + y", (exp = "x0 + y") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("x0");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("y");
        });
        it("Expression:name with white space + other expression", (exp = "name with white space + other expression") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("name with white space");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("other expression");
        });
        it("Expression:deep.a + deep.b.c", (exp = "deep.a + deep.b.c") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("path");
            expect(parser.results[0].left.object.value).toEqual("deep");
            expect(parser.results[0].left.property.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("path");
            expect(parser.results[0].right.object.object.value).toEqual("deep");
            expect(parser.results[0].right.object.property.value).toEqual("b");
            expect(parser.results[0].right.property.value).toEqual("c");
        });
        it("Expression:(a+b)", (exp = "(a+b)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("eval");
            expect(parser.results[0].expression.type).toEqual("sum");
            expect(parser.results[0].expression.operator).toEqual("+");
            expect(parser.results[0].expression.left.value).toEqual("a");
            expect(parser.results[0].expression.right.value).toEqual("b");
        });
    });

    describe("Simple Positive Unary Test", () => {
        it("Expression:> 5", (exp = "> 5") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("unary");
            expect(parser.results[0].operator).toEqual(">");
            expect(parser.results[0].value.type).toEqual("number");
            expect(parser.results[0].value.integer).toEqual(5);
        });
    });

    describe("Comparison", () => {
        it("Expression:a = b", (exp = "a = b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual("=");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:a > b", (exp = "a > b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual(">");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:a < b", (exp = "a < b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual("<");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:a <= b", (exp = "a <= b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual("<=");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:a >= b", (exp = "a >= b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual(">=");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:a != b", (exp = "a != b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual("!=");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:a != null", (exp = "a != null") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual("!=");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("null");
        });
        it("Expression:a between 2 and 4", (exp = "a between 2 and 4") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("between");
            expect(parser.results[0].expression.type).toEqual("name");
            expect(parser.results[0].expression.value).toEqual("a");
            expect(parser.results[0].left.integer).toEqual(2);
            expect(parser.results[0].right.integer).toEqual(4);
        });
        it("Expression:a in b", (exp = "a in b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual("in");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:a in (b,c)", (exp = "a in (b,c)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual("in");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("list");
            expect(parser.results[0].right.entries).toContainEqual(expect.objectContaining({
                type: "name",
                value: "b",
            }));
            expect(parser.results[0].right.entries).toContainEqual(expect.objectContaining({
                type: "name",
                value: "c",
            }));
        });
        it("Expression:a or b", (exp = "a or b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("logical");
            expect(parser.results[0].operator).toEqual("or");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:a and b", (exp = "a and b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("logical");
            expect(parser.results[0].operator).toEqual("and");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("b");
        });
        it("Expression:a and b+2", (exp = "a and b+2") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("logical");
            expect(parser.results[0].operator).toEqual("and");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("sum");
            expect(parser.results[0].right.left.type).toEqual("name");
            expect(parser.results[0].right.left.value).toEqual("b");
            expect(parser.results[0].right.right.integer).toEqual(2);
        });
        it("Expression:(a and b)+2", (exp = "(a and b)+2") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("eval");
            expect(parser.results[0].left.expression.type).toEqual("logical");
            expect(parser.results[0].left.expression.left.value).toEqual("a");
            expect(parser.results[0].left.expression.right.value).toEqual("b");
            expect(parser.results[0].right.integer).toEqual(2);
        });
        it("Expression:a/3 and b+2", (exp = "a/3 and b+2") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("logical");
            expect(parser.results[0].operator).toEqual("and");
            expect(parser.results[0].left.type).toEqual("product");
            expect(parser.results[0].left.left.type).toEqual("name");
            expect(parser.results[0].left.left.value).toEqual("a");
            expect(parser.results[0].left.right.integer).toEqual(3);
            expect(parser.results[0].right.type).toEqual("sum");
            expect(parser.results[0].right.left.type).toEqual("name");
            expect(parser.results[0].right.left.value).toEqual("b");
            expect(parser.results[0].right.right.integer).toEqual(2);
        });
        it('Expression:a = "this is a string"', (exp = 'a = "this is a string"') => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("comparison");
            expect(parser.results[0].operator).toEqual("=");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("string");
            expect(parser.results[0].right.value).toEqual("\"this is a string\"");
        });
    });
    
    describe("Filter Expressions", () => {
        it("Expression:a[b]", (exp = "a[b]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("filter");
            expect(parser.results[0].list.type).toEqual("name");
            expect(parser.results[0].list.value).toEqual("a");
            expect(parser.results[0].filter.type).toEqual("name");
            expect(parser.results[0].filter.value).toEqual("b");
        });
        it("Expression:a[0]", (exp = "a[0]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("filter");
            expect(parser.results[0].list.type).toEqual("name");
            expect(parser.results[0].list.value).toEqual("a");
            expect(parser.results[0].filter.type).toEqual("number");
            expect(parser.results[0].filter.integer).toEqual(0);
        });
        it("Expression:[1,2,3,4][-2]", (exp = "[1,2,3,4][-2]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("filter");
            expect(parser.results[0].list.type).toEqual("list");
            expect(parser.results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
            expect(parser.results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 2 }));
            expect(parser.results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
            expect(parser.results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 4 }));
            expect(parser.results[0].filter.type).toEqual("negation");
            expect(parser.results[0].filter.expression.type).toEqual("number");
            expect(parser.results[0].filter.expression.integer).toEqual(2);
        });
    });

    describe("For Expressions", () => {
        it("Expression:for a in b return c", (exp = "for a in b return c") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("for");
            expect(parser.results[0].var.type).toEqual("name");
            expect(parser.results[0].var.value).toEqual("a");
            expect(parser.results[0].context.type).toEqual("name");
            expect(parser.results[0].context.value).toEqual("b");
            expect(parser.results[0].return.type).toEqual("name");
            expect(parser.results[0].return.value).toEqual("c");
        });
        it("Expression:for my var in my context return my body", (exp = "for my var in my context return my body") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("for");
            expect(parser.results[0].var.type).toEqual("name");
            expect(parser.results[0].var.value).toEqual("my var");
            expect(parser.results[0].context.type).toEqual("name");
            expect(parser.results[0].context.value).toEqual("my context");
            expect(parser.results[0].return.type).toEqual("name");
            expect(parser.results[0].return.value).toEqual("my body");
        });
        it("Expression:for a in c with white space  return 6", (exp = "for a in c with white space  return 6") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("for");
            expect(parser.results[0].var.type).toEqual("name");
            expect(parser.results[0].var.value).toEqual("a");
            expect(parser.results[0].context.type).toEqual("name");
            expect(parser.results[0].context.value).toEqual("c with white space");
            expect(parser.results[0].return.type).toEqual("number");
            expect(parser.results[0].return.integer).toEqual(6);
        });
    });

    describe("If Expressions", () => {
        it("Expression:if name with white space then do something else do another thing", (exp = "if name with white space then do something else do another thing") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("if");
            expect(parser.results[0].condition.type).toEqual("name");
            expect(parser.results[0].condition.value).toEqual("name with white space");
            expect(parser.results[0].then.type).toEqual("name");
            expect(parser.results[0].then.value).toEqual("do something");
            expect(parser.results[0].else.type).toEqual("name");
            expect(parser.results[0].else.value).toEqual("do another thing");
        });
        it("Expression:if 1+2 then 6 else 7", (exp = "if 1+2 then 6 else 7") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("if");
            expect(parser.results[0].condition.type).toEqual("sum");
            expect(parser.results[0].condition.operator).toEqual("+");
            expect(parser.results[0].condition.left.integer).toEqual(1);
            expect(parser.results[0].condition.right.integer).toEqual(2);
            expect(parser.results[0].then.integer).toEqual(6);
            expect(parser.results[0].else.integer).toEqual(7);
        });
    });

    describe("Quantified Expressions", () => {
        it("Expression:every student in students satisfies something", (exp = "every student in students satisfies something") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("quantified");
            expect(parser.results[0].operator).toEqual("every");
            expect(parser.results[0].variable.type).toEqual("name");
            expect(parser.results[0].variable.value).toEqual("student");
            expect(parser.results[0].context.type).toEqual("name");
            expect(parser.results[0].context.value).toEqual("students");
            expect(parser.results[0].satisfy.type).toEqual("name");
            expect(parser.results[0].satisfy.value).toEqual("something");
        });
        it("Expression:every a in array satisfies 1+2", (exp = "every a in array satisfies 1+2") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("quantified");
            expect(parser.results[0].operator).toEqual("every");
            expect(parser.results[0].variable.type).toEqual("name");
            expect(parser.results[0].variable.value).toEqual("a");
            expect(parser.results[0].context.type).toEqual("name");
            expect(parser.results[0].context.value).toEqual("array");
            expect(parser.results[0].satisfy.type).toEqual("sum");
            expect(parser.results[0].satisfy.left.integer).toEqual(1);
            expect(parser.results[0].satisfy.right.integer).toEqual(2);
        });
    });

    describe("Instance Of", () => {
        it("Expression:a instance of b", (exp = "a instance of b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of.type).toEqual("name");
            expect(parser.results[0].of.value).toEqual("b");
        });
        it("Expression:a instance of number", (exp = "a instance of number") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("number");
        });
        it("Expression:a instance of list<number>", (exp = "a instance of list<number>") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of.type).toEqual("listOf");
            expect(parser.results[0].of.single).toEqual("number");
        });
        it("Expression:a instance of list < string >", (exp = "a instance of list < string >") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of.type).toEqual("listOf");
            expect(parser.results[0].of.single).toEqual("string");
        });
        it("Expression:a instance of string", (exp = "a instance of string") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("string");
        });
        it("Expression:a instance of boolean", (exp = "a instance of boolean") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("boolean");
        });
        it("Expression:a instance of date", (exp = "a instance of date") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("date");
        });
        it("Expression:a instance of time", (exp = "a instance of time") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("time");
        });
        it("Expression:a instance of date time", (exp = "a instance of date time") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("date time");
        });
        it("Expression:a instance of day-time-duration", (exp = "a instance of day-time-duration") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("day-time-duration");
        });
        it("Expression:a instance of year-month-duration", (exp = "a instance of year-month-duration") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("instanceOf");
            expect(parser.results[0].instance.type).toEqual("name");
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("year-month-duration");
        });
    });

    describe("Unary Tests", () => {
        it("Expression:a,b", (exp = "a,b") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("unarytests");
            expect(parser.results[0].test.type).toEqual("list");
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({
                type: "name",
                value: "a",
            }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({
                type: "name",
                value: "b",
            }));
        });
        it("Expression:1, b,3", (exp = "1, b,3") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("unarytests");
            expect(parser.results[0].test.type).toEqual("list");
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({
                type: "name",
                value: "b",
            }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
        });
        it("Expression:1, a+b,3", (exp = "1, a+b,3") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("unarytests");
            expect(parser.results[0].test.type).toEqual("list");
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({
                type: "sum",
            }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
        });
        it("Expression:not(1, a+b,3)", (exp = "not(1, a+b,3)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("unarytests");
            expect(parser.results[0].test.type).toEqual("not");
            expect(parser.results[0].test.test.type).toEqual("list");
            expect(parser.results[0].test.test.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
            expect(parser.results[0].test.test.entries).toContainEqual(expect.objectContaining({
                type: "sum",
            }));
            expect(parser.results[0].test.test.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
        });
        it("Expression:-", (exp = "-") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("unarytests");
            expect(parser.results[0].test.type).toEqual("dash");
        });
        it("Expression: - ", (exp = " - ") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("unarytests");
            expect(parser.results[0].test.type).toEqual("dash");
        });
    });

    describe("Function Invocation", () => {
        it("Expression:test(a)", (exp = "test(a)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("call");
            expect(parser.results[0].name.type).toEqual("name");
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.type).toEqual("list");
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ type: "name", value: "a" }));
        });
        it("Expression:test(a, 1)", (exp = "test(a, 1)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("call");
            expect(parser.results[0].name.type).toEqual("name");
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.type).toEqual("list");
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ type: "name", value: "a" }));
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ type: "number", integer: 1 }));
        });
        it("Expression:test(a+2, 1)", (exp = "test(a+2, 1)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("call");
            expect(parser.results[0].name.type).toEqual("name");
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.type).toEqual("list");
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ type: "sum", operator: "+" }));
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ type: "number", integer: 1 }));
        });
        it("Expression:my test(a)", (exp = "my test(a)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("call");
            expect(parser.results[0].name.type).toEqual("name");
            expect(parser.results[0].name.value).toEqual("my test");
            expect(parser.results[0].parameters.type).toEqual("list");
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ type: "name", value: "a" }));
        });
        it("Expression:test(param1:a)", (exp = "test(param1:a)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("call");
            expect(parser.results[0].name.type).toEqual("name");
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.type).toEqual("list");
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ type: "named", name: { type: "name", value: "param1" }, expression: { type: "name", value: "a" } }));
        });
        it("Expression:test(p1:a, p2 : 34)", (exp = "test(p1:a, p2 : 34)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("call");
            expect(parser.results[0].name.type).toEqual("name");
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.type).toEqual("list");
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ type: "named", name: { type: "name", value: "p1" }, expression: { type: "name", value: "a" } }));
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ type: "named", name: { type: "name", value: "p2" }, expression: { type: "number", integer: 34, decimals: NaN } }));
        });
        it("Expression:a+test(a)", (exp = "a+test(a)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("name");
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.type).toEqual("call");
            expect(parser.results[0].right.name.type).toEqual("name");
            expect(parser.results[0].right.name.value).toEqual("test");
            expect(parser.results[0].right.parameters.type).toEqual("list");
            expect(parser.results[0].right.parameters.entries).toContainEqual(expect.objectContaining({ type: "name", value: "a" }));
        });
        it("Expression:a+test(a)", (exp = "test(a)+a") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("sum");
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.type).toEqual("call");
            expect(parser.results[0].left.name.type).toEqual("name");
            expect(parser.results[0].left.name.value).toEqual("test");
            expect(parser.results[0].left.parameters.type).toEqual("list");
            expect(parser.results[0].left.parameters.entries).toContainEqual(expect.objectContaining({ type: "name", value: "a" }));
            expect(parser.results[0].right.type).toEqual("name");
            expect(parser.results[0].right.value).toEqual("a");
        });
    });

    describe("Boxed Expression", () => {
        it("Expression:[1,2]", (exp = "[1,2]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("list");
            expect(parser.results[0].entries).toContainEqual(expect.objectContaining({ type: "number", integer: 1 }));
            expect(parser.results[0].entries).toContainEqual(expect.objectContaining({ type: "number", integer: 2 }));
        });
        it("Expression:{a:1}", (exp = "{a:1}") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("context");
            expect(parser.results[0].data.type).toEqual("list");
            expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ type: "entry", key: { type: "name", value: "a" }, expression: { type: "number", integer: 1, decimals: NaN } }));
        });
        it("Expression:{}", (exp = "{}") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("context");
            expect(parser.results[0].data).toEqual(null);
        });
        it("Expression:{a : 1,b:3}", (exp = "{a : 1,b:3}") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("context");
            expect(parser.results[0].data.type).toEqual("list");
            expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ type: "entry", key: { type: "name", value: "a" }, expression: { type: "number", integer: 1, decimals: NaN } }));
            expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ type: "entry", key: { type: "name", value: "b" }, expression: { type: "number", integer: 3, decimals: NaN } }));
        });
        it("Expression:{\"a\" : 1,b:3}", (exp = "{\"a\" : 1,b:3}") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("context");
            expect(parser.results[0].data.type).toEqual("list");
            expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ type: "entry", key: { type: "string", value: '"a"' }, expression: { type: "number", integer: 1, decimals: NaN } }));
            expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ type: "entry", key: { type: "name", value: "b" }, expression: { type: "number", integer: 3, decimals: NaN } }));
        });
        it("Expression:{a:1 + 2}", (exp = "{a:1 + 2}") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].type).toEqual("context");
            expect(parser.results[0].data.type).toEqual("list");
            expect(parser.results[0].data.entries).toContainEqual(expect.objectContaining({ type: "entry", key: { type: "name", value: "a" }, expression: { type: "sum", operator: "+", left: { type: "number", integer: 1, decimals: NaN }, right: { type: "number", integer: 2, decimals: NaN } } }));
        });
    });

});
