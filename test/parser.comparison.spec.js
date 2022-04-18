"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = "";
describe("Comparison expressions", () => {

    it("Expression:a = b", (exp = "a = b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.COMPARISON);
        expect(results[0].operator).toEqual("=");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.NAME);
        expect(results[0].right.value).toEqual("b");
    });
    it("Expression:a > b", (exp = "a > b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.COMPARISON);
        expect(results[0].operator).toEqual(">");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.NAME);
        expect(results[0].right.value).toEqual("b");
    });
    it("Expression:a < b", (exp = "a < b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.COMPARISON);
        expect(results[0].operator).toEqual("<");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.NAME);
        expect(results[0].right.value).toEqual("b");
    });
    it("Expression:a <= b", (exp = "a <= b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.COMPARISON);
        expect(results[0].operator).toEqual("<=");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.NAME);
        expect(results[0].right.value).toEqual("b");
    });
    it("Expression:a >= b", (exp = "a >= b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.COMPARISON);
        expect(results[0].operator).toEqual(">=");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.NAME);
        expect(results[0].right.value).toEqual("b");
    });
    it("Expression:a != b", (exp = "a != b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.COMPARISON);
        expect(results[0].operator).toEqual("!=");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.NAME);
        expect(results[0].right.value).toEqual("b");
    });
    it("Expression:a != null", (exp = "a != null") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.COMPARISON);
        expect(results[0].operator).toEqual("!=");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.NULL);
    });
    it("Expression:a between 2 and 4", (exp = "a between 2 and 4") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.BETWEEN);
        expect(results[0].expression.node).toEqual(Node.NAME);
        expect(results[0].expression.value).toEqual("a");
        expect(results[0].left.integer).toEqual(2);
        expect(results[0].right.integer).toEqual(4);
    });
    it("Expression:a or b", (exp = "a or b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.LOGICAL);
        expect(results[0].operator).toEqual("or");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.NAME);
        expect(results[0].right.value).toEqual("b");
    });
    it("Expression:a and b", (exp = "a and b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.LOGICAL);
        expect(results[0].operator).toEqual("and");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.NAME);
        expect(results[0].right.value).toEqual("b");
    });
    it("Expression:a and b+2", (exp = "a and b+2") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.LOGICAL);
        expect(results[0].operator).toEqual("and");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.SUM);
        expect(results[0].right.left.node).toEqual(Node.NAME);
        expect(results[0].right.left.value).toEqual("b");
        expect(results[0].right.right.integer).toEqual(2);
    });
    it("Expression:(a and b)+2", (exp = "(a and b)+2") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.SUM);
        expect(results[0].operator).toEqual("+");
        expect(results[0].left.node).toEqual(Node.EVAL);
        expect(results[0].left.expression.node).toEqual(Node.LOGICAL);
        expect(results[0].left.expression.left.value).toEqual("a");
        expect(results[0].left.expression.right.value).toEqual("b");
        expect(results[0].right.integer).toEqual(2);
    });
    it("Expression:a/3 and b+2", (exp = "a/3 and b+2") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.LOGICAL);
        expect(results[0].operator).toEqual("and");
        expect(results[0].left.node).toEqual(Node.PRODUCT);
        expect(results[0].left.left.node).toEqual(Node.NAME);
        expect(results[0].left.left.value).toEqual("a");
        expect(results[0].left.right.integer).toEqual(3);
        expect(results[0].right.node).toEqual(Node.SUM);
        expect(results[0].right.left.node).toEqual(Node.NAME);
        expect(results[0].right.left.value).toEqual("b");
        expect(results[0].right.right.integer).toEqual(2);
    });
    it('Expression:a = "this is a string"', (exp = 'a = "this is a string"') => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.COMPARISON);
        expect(results[0].operator).toEqual("=");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.STRING);
        expect(results[0].right.value).toEqual("this is a string");
    });
    it("Expression:5 in [0..9]", (exp = "5 in [0..9]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN);
        expect(results[0].test.node).toEqual(Node.INTERVAL);
        expect(results[0].test.open).toEqual("[");
        expect(results[0].test.close).toEqual("]");
        expect(results[0].test.from.integer).toEqual(0);
        expect(results[0].test.to.integer).toEqual(9);
    });

});
