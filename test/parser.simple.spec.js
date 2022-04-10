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
describe("Test parser", () => {

    beforeEach(() => { parser = create() });

    describe("Numeric Literal", () => {
        it("Expression:5", (exp = "5") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.NUMBER);
            expect(parser.results[0].integer).toEqual(5);
        });
        it("Expression:98.746", (exp = "98.746") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.NUMBER);
            expect(parser.results[0].integer).toEqual(98);
            expect(parser.results[0].decimals).toEqual(746);
            expect(parser.results[0].float).toEqual(98.746);
        });
        it("Expression:.99", (exp = ".99") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.NUMBER);
            expect(parser.results[0].decimals).toEqual(99);
            expect(parser.results[0].float).toEqual(0.99);
        });
    });

    describe("Simple Literal", () => {
        it("Expression:a", (exp = "a") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.NAME);
            expect(parser.results[0].value).toEqual("a");
        });
        it("Expression:null", (exp = "null") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.NULL);
        });
        it("Expression:name with white space", (exp = "name with white space") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.NAME);
            expect(parser.results[0].value).toEqual("name with white space");
        });
        it("Expression:x0", (exp = "x0") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.NAME);
            expect(parser.results[0].value).toEqual("x0");
        });
        it("Expression:x0 y1", (exp = "x0 y1") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.NAME);
            expect(parser.results[0].value).toEqual("x0 y1");
        });
        it('Expression:"this is a string with something :9999 inside"', (exp = '"this is a string with something :9999 inside"') => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.STRING);
            expect(parser.results[0].value).toEqual("\"this is a string with something :9999 inside\"");
        });
        it('Expression:"this is a string with \'a string\' inside"', (exp = '"this is a string with \'a string\' inside"') => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.STRING);
            expect(parser.results[0].value).toEqual("\"this is a string with 'a string' inside\"");
        });
    });

    describe("Boolean Literal", () => {
        it("Expression:true", (exp = "true") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.BOOLEAN);
            expect(parser.results[0].value).toEqual(true);
        });
        it("Expression:false", (exp = "false") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.BOOLEAN);
            expect(parser.results[0].value).toEqual(false);
        });
    });

    describe("Interval", () => {
        it("Expression:[0..9]", (exp = "[0..9]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INTERVAL);
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
            expect(parser.results[0].node).toEqual(Node.INTERVAL);
            expect(parser.results[0].open).toEqual("[");
            expect(parser.results[0].close).toEqual("]");
            expect(parser.results[0].from.node).toEqual(Node.PATH);
            expect(parser.results[0].from.object.value).toEqual("a");
            expect(parser.results[0].from.property.value).toEqual("b");
            expect(parser.results[0].to.node).toEqual(Node.PATH);
            expect(parser.results[0].to.object.value).toEqual("b");
            expect(parser.results[0].to.property.value).toEqual("a");
        });
        it("Expression:[a.b .. b.a]", (exp = "[a.b .. b.a]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INTERVAL);
            expect(parser.results[0].open).toEqual("[");
            expect(parser.results[0].close).toEqual("]");
            expect(parser.results[0].from.node).toEqual(Node.PATH);
            expect(parser.results[0].from.object.value).toEqual("a");
            expect(parser.results[0].from.property.value).toEqual("b");
            expect(parser.results[0].to.node).toEqual(Node.PATH);
            expect(parser.results[0].to.object.value).toEqual("b");
            expect(parser.results[0].to.property.value).toEqual("a");
        });
        it("Expression:[0.85...99]", (exp = "[0.85...99]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INTERVAL);
            expect(parser.results[0].open).toEqual("[");
            expect(parser.results[0].close).toEqual("]");
            expect(parser.results[0].from.node).toEqual(Node.NUMBER);
            expect(parser.results[0].from.decimals).toEqual(85);
            expect(parser.results[0].to.node).toEqual(Node.NUMBER);
            expect(parser.results[0].to.decimals).toEqual(99);
        });
        it("Expression:[from something..to something]", (exp = "[from something..to something]") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INTERVAL);
            expect(parser.results[0].open).toEqual("[");
            expect(parser.results[0].close).toEqual("]");
            expect(parser.results[0].from.node).toEqual(Node.NAME);
            expect(parser.results[0].from.value).toEqual("from something");
            expect(parser.results[0].to.node).toEqual(Node.NAME);
            expect(parser.results[0].to.value).toEqual("to something");
        });
    });

    describe("Simple Positive Unary Test", () => {
        it("Expression:> 5", (exp = "> 5") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.UNARY);
            expect(parser.results[0].operator).toEqual(">");
            expect(parser.results[0].value.node).toEqual(Node.NUMBER);
            expect(parser.results[0].value.integer).toEqual(5);
        });
    });

    
    describe("For Expressions", () => {
        it("Expression:for a in b return c", (exp = "for a in b return c") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.FOR);
            expect(parser.results[0].var.node).toEqual(Node.NAME);
            expect(parser.results[0].var.value).toEqual("a");
            expect(parser.results[0].context.node).toEqual(Node.NAME);
            expect(parser.results[0].context.value).toEqual("b");
            expect(parser.results[0].return.node).toEqual(Node.NAME);
            expect(parser.results[0].return.value).toEqual("c");
        });
        it("Expression:for my var in my context return my body", (exp = "for my var in my context return my body") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.FOR);
            expect(parser.results[0].var.node).toEqual(Node.NAME);
            expect(parser.results[0].var.value).toEqual("my var");
            expect(parser.results[0].context.node).toEqual(Node.NAME);
            expect(parser.results[0].context.value).toEqual("my context");
            expect(parser.results[0].return.node).toEqual(Node.NAME);
            expect(parser.results[0].return.value).toEqual("my body");
        });
        it("Expression:for a in c with white space  return 6", (exp = "for a in c with white space  return 6") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.FOR);
            expect(parser.results[0].var.node).toEqual(Node.NAME);
            expect(parser.results[0].var.value).toEqual("a");
            expect(parser.results[0].context.node).toEqual(Node.NAME);
            expect(parser.results[0].context.value).toEqual("c with white space");
            expect(parser.results[0].return.node).toEqual(Node.NUMBER);
            expect(parser.results[0].return.integer).toEqual(6);
        });
    });

    describe("If Expressions", () => {
        it("Expression:if name with white space then do something else do another thing", (exp = "if name with white space then do something else do another thing") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.IF);
            expect(parser.results[0].condition.node).toEqual(Node.NAME);
            expect(parser.results[0].condition.value).toEqual("name with white space");
            expect(parser.results[0].then.node).toEqual(Node.NAME);
            expect(parser.results[0].then.value).toEqual("do something");
            expect(parser.results[0].else.node).toEqual(Node.NAME);
            expect(parser.results[0].else.value).toEqual("do another thing");
        });
        it("Expression:if 1+2 then 6 else 7", (exp = "if 1+2 then 6 else 7") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.IF);
            expect(parser.results[0].condition.node).toEqual(Node.SUM);
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
            expect(parser.results[0].node).toEqual(Node.QUANTIFIED);
            expect(parser.results[0].operator).toEqual("every");
            expect(parser.results[0].variable.node).toEqual(Node.NAME);
            expect(parser.results[0].variable.value).toEqual("student");
            expect(parser.results[0].context.node).toEqual(Node.NAME);
            expect(parser.results[0].context.value).toEqual("students");
            expect(parser.results[0].satisfy.node).toEqual(Node.NAME);
            expect(parser.results[0].satisfy.value).toEqual("something");
        });
        it("Expression:every a in array satisfies 1+2", (exp = "every a in array satisfies 1+2") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.QUANTIFIED);
            expect(parser.results[0].operator).toEqual("every");
            expect(parser.results[0].variable.node).toEqual(Node.NAME);
            expect(parser.results[0].variable.value).toEqual("a");
            expect(parser.results[0].context.node).toEqual(Node.NAME);
            expect(parser.results[0].context.value).toEqual("array");
            expect(parser.results[0].satisfy.node).toEqual(Node.SUM);
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
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of.node).toEqual(Node.NAME);
            expect(parser.results[0].of.value).toEqual("b");
        });
        it("Expression:a instance of number", (exp = "a instance of number") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("number");
        });
        it("Expression:a instance of list<number>", (exp = "a instance of list<number>") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of.node).toEqual(Node.LIST_OF);
            expect(parser.results[0].of.single).toEqual("number");
        });
        it("Expression:a instance of list < string >", (exp = "a instance of list < string >") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of.node).toEqual(Node.LIST_OF);
            expect(parser.results[0].of.single).toEqual("string");
        });
        it("Expression:a instance of string", (exp = "a instance of string") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("string");
        });
        it("Expression:a instance of boolean", (exp = "a instance of boolean") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("boolean");
        });
        it("Expression:a instance of date", (exp = "a instance of date") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("date");
        });
        it("Expression:a instance of time", (exp = "a instance of time") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("time");
        });
        it("Expression:a instance of date time", (exp = "a instance of date time") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("date time");
        });
        it("Expression:a instance of day-time-duration", (exp = "a instance of day-time-duration") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
            expect(parser.results[0].instance.value).toEqual("a");
            expect(parser.results[0].of).toEqual("day-time-duration");
        });
        it("Expression:a instance of year-month-duration", (exp = "a instance of year-month-duration") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.INSTANCE_OF);
            expect(parser.results[0].instance.node).toEqual(Node.NAME);
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
            expect(parser.results[0].node).toEqual(Node.UNARYTESTS);
            expect(parser.results[0].test.node).toEqual(Node.LIST);
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({
                node: Node.NAME,
                value: "a",
            }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({
                node: Node.NAME,
                value: "b",
            }));
        });
        it("Expression:1, b,3", (exp = "1, b,3") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.UNARYTESTS);
            expect(parser.results[0].test.node).toEqual(Node.LIST);
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({
                node: Node.NAME,
                value: "b",
            }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
        });
        it("Expression:1, a+b,3", (exp = "1, a+b,3") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.UNARYTESTS);
            expect(parser.results[0].test.node).toEqual(Node.LIST);
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({
                node: Node.SUM,
            }));
            expect(parser.results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
        });
        it("Expression:not(1, a+b,3)", (exp = "not(1, a+b,3)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.UNARYTESTS);
            expect(parser.results[0].test.node).toEqual(Node.NOT);
            expect(parser.results[0].test.test.node).toEqual(Node.LIST);
            expect(parser.results[0].test.test.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
            expect(parser.results[0].test.test.entries).toContainEqual(expect.objectContaining({
                node: Node.SUM,
            }));
            expect(parser.results[0].test.test.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
        });
        it("Expression:-", (exp = "-") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.UNARYTESTS);
            expect(parser.results[0].test.node).toEqual(Node.DASH);
        });
        it("Expression: - ", (exp = " - ") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.UNARYTESTS);
            expect(parser.results[0].test.node).toEqual(Node.DASH);
        });
    });

    describe("Function Invocation", () => {
        it("Expression:test(a)", (exp = "test(a)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.FUNCTION_CALL);
            expect(parser.results[0].name.node).toEqual(Node.NAME);
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.node).toEqual(Node.LIST);
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
        });
        it("Expression:test(a, 1)", (exp = "test(a, 1)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.FUNCTION_CALL);
            expect(parser.results[0].name.node).toEqual(Node.NAME);
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.node).toEqual(Node.LIST);
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NUMBER, integer: 1 }));
        });
        it("Expression:test(a+2, 1)", (exp = "test(a+2, 1)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.FUNCTION_CALL);
            expect(parser.results[0].name.node).toEqual(Node.NAME);
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.node).toEqual(Node.LIST);
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.SUM, operator: "+" }));
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NUMBER, integer: 1 }));
        });
        it("Expression:my test(a)", (exp = "my test(a)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.FUNCTION_CALL);
            expect(parser.results[0].name.node).toEqual(Node.NAME);
            expect(parser.results[0].name.value).toEqual("my test");
            expect(parser.results[0].parameters.node).toEqual(Node.LIST);
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
        });
        it("Expression:test(param1:a)", (exp = "test(param1:a)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.FUNCTION_CALL);
            expect(parser.results[0].name.node).toEqual(Node.NAME);
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.node).toEqual(Node.LIST);
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAMED_PARAMETER, name: { node: Node.NAME, value: "param1" }, expression: { node: Node.NAME, value: "a" } }));
        });
        it("Expression:test(p1:a, p2 : 34)", (exp = "test(p1:a, p2 : 34)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.FUNCTION_CALL);
            expect(parser.results[0].name.node).toEqual(Node.NAME);
            expect(parser.results[0].name.value).toEqual("test");
            expect(parser.results[0].parameters.node).toEqual(Node.LIST);
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAMED_PARAMETER, name: { node: Node.NAME, value: "p1" }, expression: { node: Node.NAME, value: "a" } }));
            expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAMED_PARAMETER, name: { node: Node.NAME, value: "p2" }, expression: { node: Node.NUMBER, integer: 34, decimals: NaN, float: 34 } }));
        });
        it("Expression:a+test(a)", (exp = "a+test(a)") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.SUM);
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.node).toEqual(Node.NAME);
            expect(parser.results[0].left.value).toEqual("a");
            expect(parser.results[0].right.node).toEqual(Node.FUNCTION_CALL);
            expect(parser.results[0].right.name.node).toEqual(Node.NAME);
            expect(parser.results[0].right.name.value).toEqual("test");
            expect(parser.results[0].right.parameters.node).toEqual(Node.LIST);
            expect(parser.results[0].right.parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
        });
        it("Expression:a+test(a)", (exp = "test(a)+a") => {
            parse(exp);
            // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
            expect(parser.results).toBeDefined();
            expect(parser.results.length).toEqual(1);
            expect(parser.results[0].node).toEqual(Node.SUM);
            expect(parser.results[0].operator).toEqual("+");
            expect(parser.results[0].left.node).toEqual(Node.FUNCTION_CALL);
            expect(parser.results[0].left.name.node).toEqual(Node.NAME);
            expect(parser.results[0].left.name.value).toEqual("test");
            expect(parser.results[0].left.parameters.node).toEqual(Node.LIST);
            expect(parser.results[0].left.parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
            expect(parser.results[0].right.node).toEqual(Node.NAME);
            expect(parser.results[0].right.value).toEqual("a");
        });
    });

});
