"use strict";

const nearley = require("nearley");
const grammar = require("./../dev/feel.grammar.js");
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
    });

    /*
    describe("Arithmetic expressions", () => {
        it("Expression:a + b/2 *6", (exp = "a + b/2 *6") => {
            const result = parse(exp);
            // console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
            expect (result.ast).toBeDefined();
            expect(result.ast.node).toEqual("Addition");
        });
        it("Expression:(a + b)*6", (exp = "(a + b)*6") => {
            const result = parse(exp);
            // console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
            expect (result.ast).toBeDefined();
            expect(result.ast.node).toEqual("Multiplication");
        });
        it("Expression:x*(a + b)", (exp = "x*(a + b)") => {
            const result = parse(exp);
            // console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
            expect (result.ast).toBeDefined();
            expect(result.ast.node).toEqual("Multiplication");
        });
        it("Expression:(a + b)-(c+d)", (exp = "(a + b)-(c+d)") => {
            const result = parse(exp);
            // console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
            expect (result.ast).toBeDefined();
            expect(result.ast.node).toEqual("Addition");
        });
        it("Expression:((a + b)*2)-(c+d)", (exp = "(a + b)-(c+d)") => {
            const result = parse(exp);
            console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
            expect (result.ast).toBeDefined();
            expect(result.ast.node).toEqual("Addition");
        });
    });
    */

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
            // expect(parser.results.length).toEqual(1);
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
            // expect(parser.results.length).toEqual(1);
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
            // expect(parser.results.length).toEqual(1);
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

});
