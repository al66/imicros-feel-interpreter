"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = "";
describe("Test parser", () => {

    describe("Numeric Literal", () => {
        it("Expression:5", (exp = "5") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.NUMBER);
            expect(results[0].integer).toEqual(5);
        });
        it("Expression:98.746", (exp = "98.746") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.NUMBER);
            expect(results[0].integer).toEqual(98);
            expect(results[0].decimals).toEqual(746);
            expect(results[0].float).toEqual(98.746);
        });
        it("Expression:.99", (exp = ".99") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.NUMBER);
            expect(results[0].decimals).toEqual(99);
            expect(results[0].float).toEqual(0.99);
        });
    });

    describe("Simple Literal", () => {
        it("Expression:a", (exp = "a") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.NAME);
            expect(results[0].value).toEqual("a");
        });
        it("Expression:null", (exp = "null") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.NULL);
        });
        it("Expression:name with white space", (exp = "name with white space") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.NAME);
            expect(results[0].value).toEqual("name with white space");
        });
        it("Expression:x0", (exp = "x0") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.NAME);
            expect(results[0].value).toEqual("x0");
        });
        it("Expression:x0 y1", (exp = "x0 y1") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.NAME);
            expect(results[0].value).toEqual("x0 y1");
        });
        it('Expression:"this is a string with something :9999 inside"', (exp = '"this is a string with something :9999 inside"') => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.STRING);
            expect(results[0].value).toEqual("this is a string with something :9999 inside");
        });
        it('Expression:"this is a string with \'a string\' inside"', (exp = '"this is a string with \'a string\' inside"') => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.STRING);
            expect(results[0].value).toEqual("this is a string with 'a string' inside");
        });
        // TODO: Escape character \" - must be already fixed in the tokenizer!
        it('Expression:"this is a string with \"escaped quotes\" inside"', (exp = "\"this is a string with \\\"escaped quotes\\\" inside\"") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            // console.log(util.inspect(interpreter.error, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.STRING);
            // TODO: how to test string in string in string...
            expect(results[0].value).toEqual("this is a string with \\\"escaped quotes\\\" inside");
        });
        it('Expression:"(d{3})(\d{3})"', (exp = '"(d{3})(\d{3})"') => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            // console.log(util.inspect(interpreter.error, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.STRING);
            expect(results[0].value).toEqual("(d{3})(\d{3})");
        });
    });

    describe("Boolean Literal", () => {
        it("Expression:true", (exp = "true") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.BOOLEAN);
            expect(results[0].value).toEqual(true);
        });
        it("Expression:false", (exp = "false") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.BOOLEAN);
            expect(results[0].value).toEqual(false);
        });
        it("Expression:not(a)", (exp = "not(a)") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.NOT);
            expect(results[0].parameters.node).toEqual(Node.NAME);
            expect(results[0].parameters.value).toEqual("a");
        });
    });

    describe("For Expressions", () => {
        it("Expression:for a in b return c", (exp = "for a in b return c") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.FOR);
            expect(results[0].var.node).toEqual(Node.NAME);
            expect(results[0].var.value).toEqual("a");
            expect(results[0].context.node).toEqual(Node.NAME);
            expect(results[0].context.value).toEqual("b");
            expect(results[0].return.node).toEqual(Node.NAME);
            expect(results[0].return.value).toEqual("c");
        });
        it("Expression:for my var in my context return my body", (exp = "for my var in my context return my body") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.FOR);
            expect(results[0].var.node).toEqual(Node.NAME);
            expect(results[0].var.value).toEqual("my var");
            expect(results[0].context.node).toEqual(Node.NAME);
            expect(results[0].context.value).toEqual("my context");
            expect(results[0].return.node).toEqual(Node.NAME);
            expect(results[0].return.value).toEqual("my body");
        });
        it("Expression:for a in c with white space  return 6", (exp = "for a in c with white space  return 6") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.FOR);
            expect(results[0].var.node).toEqual(Node.NAME);
            expect(results[0].var.value).toEqual("a");
            expect(results[0].context.node).toEqual(Node.NAME);
            expect(results[0].context.value).toEqual("c with white space");
            expect(results[0].return.node).toEqual(Node.NUMBER);
            expect(results[0].return.integer).toEqual(6);
        });
    });

    describe("If Expressions", () => {
        it("Expression:if name with white space then do something else do another thing", (exp = "if name with white space then do something else do another thing") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.IF);
            expect(results[0].condition.node).toEqual(Node.NAME);
            expect(results[0].condition.value).toEqual("name with white space");
            expect(results[0].then.node).toEqual(Node.NAME);
            expect(results[0].then.value).toEqual("do something");
            expect(results[0].else.node).toEqual(Node.NAME);
            expect(results[0].else.value).toEqual("do another thing");
        });
        it("Expression:if 1+2 then 6 else 7", (exp = "if 1+2 then 6 else 7") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.IF);
            expect(results[0].condition.node).toEqual(Node.SUM);
            expect(results[0].condition.operator).toEqual("+");
            expect(results[0].condition.left.integer).toEqual(1);
            expect(results[0].condition.right.integer).toEqual(2);
            expect(results[0].then.integer).toEqual(6);
            expect(results[0].else.integer).toEqual(7);
        });
    });

    describe("Quantified Expressions", () => {
        it("Expression:every student in students satisfies something", (exp = "every student in students satisfies something") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.QUANTIFIED);
            expect(results[0].operator).toEqual("every");
            expect(results[0].variable.node).toEqual(Node.NAME);
            expect(results[0].variable.value).toEqual("student");
            expect(results[0].context.node).toEqual(Node.NAME);
            expect(results[0].context.value).toEqual("students");
            expect(results[0].satisfy.node).toEqual(Node.NAME);
            expect(results[0].satisfy.value).toEqual("something");
        });
        it("Expression:every a in array satisfies 1+2", (exp = "every a in array satisfies 1+2") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.QUANTIFIED);
            expect(results[0].operator).toEqual("every");
            expect(results[0].variable.node).toEqual(Node.NAME);
            expect(results[0].variable.value).toEqual("a");
            expect(results[0].context.node).toEqual(Node.NAME);
            expect(results[0].context.value).toEqual("array");
            expect(results[0].satisfy.node).toEqual(Node.SUM);
            expect(results[0].satisfy.left.integer).toEqual(1);
            expect(results[0].satisfy.right.integer).toEqual(2);
        });
    });

});
