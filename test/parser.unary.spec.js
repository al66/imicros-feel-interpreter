"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = "";
describe("Unary test expressions", () => {

    it("Expression:a in b", (exp = "a in b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].test.node).toEqual(Node.NAME);
        expect(results[0].test.value).toEqual("b");
    });
    it("Expression:a in (<10)", (exp = "a in (<10)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].test.node).toEqual(Node.EVAL);
        expect(results[0].test.expression).toEqual(expect.objectContaining({
            node: Node.UNARY,
            operator: "<",
            value: { node: Node.NUMBER, integer: 10, decimals: NaN, float: 10 },
        }));
    });
    it("Expression:a in (b)", (exp = "a in (b)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].test.node).toEqual(Node.EVAL);
        expect(results[0].test.expression).toEqual(expect.objectContaining({
            node: Node.NAME,
            value: "b"
        }));
    });
    it("Expression:a in (b,c)", (exp = "a in (b,c)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN_LIST);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].list.node).toEqual(Node.LIST);
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({
            node: Node.NAME,
            value: "b",
        }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({
            node: Node.NAME,
            value: "c",
        }));
    });
    it("Expression:a in (<5,>10)", (exp = "a in (<5,>10)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN_LIST);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].list.node).toEqual(Node.LIST);
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({
            node: Node.UNARY,
            operator: "<",
            value: { node: Node.NUMBER, integer: 5, decimals: NaN, float: 5 },
        }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({
            node: Node.UNARY,
            operator: ">",
            value: { node: Node.NUMBER, integer: 10, decimals: NaN, float: 10 },
        }));
    });
    it("Expression:a in [3..7]", (exp = "a in [3..7]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].test.node).toEqual(Node.INTERVAL);
        expect(results[0].test.open).toEqual("[");
        expect(results[0].test.close).toEqual("]");
        expect(results[0].test.from.integer).toEqual(3);
        expect(results[0].test.to.integer).toEqual(7);
    });
    it("Expression:a in (3..7)", (exp = "a in (3..7)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].test.node).toEqual(Node.INTERVAL);
        expect(results[0].test.open).toEqual("(");
        expect(results[0].test.close).toEqual(")");
        expect(results[0].test.from.integer).toEqual(3);
        expect(results[0].test.to.integer).toEqual(7);
    });
    it("Expression:> 5", (exp = "> 5") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.UNARY);
        expect(results[0].operator).toEqual(">");
        expect(results[0].value.node).toEqual(Node.NUMBER);
        expect(results[0].value.integer).toEqual(5);
    });
    it("Expression:a,b", (exp = "a,b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.UNARYTESTS);
        expect(results[0].list.node).toEqual(Node.LIST);
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({
            node: Node.NAME,
            value: "a",
        }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({
            node: Node.NAME,
            value: "b",
        }));
    });
    it("Expression:1, b,3", (exp = "1, b,3") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.UNARYTESTS);
        expect(results[0].list.node).toEqual(Node.LIST);
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({
            node: Node.NAME,
            value: "b",
        }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
    });
    it("Expression:1, a+b,3", (exp = "1, a+b,3") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.UNARYTESTS);
        expect(results[0].list.node).toEqual(Node.LIST);
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({
            node: Node.SUM,
        }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
    });
    it("Expression:not(1, a+b,3)", (exp = "not(1, a+b,3)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.UNARY_NOT);
        expect(results[0].test.node).toEqual(Node.LIST);
        expect(results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
        expect(results[0].test.entries).toContainEqual(expect.objectContaining({
            node: Node.SUM,
        }));
        expect(results[0].test.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
    });
    it("Expression:a in not(1, a+b,3)", (exp = "a in not(1, a+b,3)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].test.node).toEqual(Node.UNARY_NOT);
        expect(results[0].test.test.node).toEqual(Node.LIST);
        expect(results[0].test.test.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
        expect(results[0].test.test.entries).toContainEqual(expect.objectContaining({
            node: Node.SUM,
        }));
        expect(results[0].test.test.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
    });
    it("Expression:-", (exp = "-") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.DASH);
    });
    it("Expression: - ", (exp = " - ") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.DASH);
    });
    it("Expression:a in -", (exp = "a in -") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].test.node).toEqual(Node.DASH);
    });
    it("Expression:a in (-)", (exp = "a in (-)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.IN);
        expect(results[0].input.node).toEqual(Node.NAME);
        expect(results[0].input.value).toEqual("a");
        expect(results[0].test.node).toEqual(Node.DASH);
    });
});
