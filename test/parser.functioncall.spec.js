"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();


let exp = "";
describe("Function invocaton", () => {

    it("Expression:test(a)", (exp = "test(a)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FUNCTION_CALL);
        expect(results[0].name.node).toEqual(Node.NAME);
        expect(results[0].name.value).toEqual("test");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
    });
    it("Expression:test(a, 1)", (exp = "test(a, 1)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FUNCTION_CALL);
        expect(results[0].name.node).toEqual(Node.NAME);
        expect(results[0].name.value).toEqual("test");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NUMBER, integer: 1 }));
    });
    it("Expression:test(a+2, 1)", (exp = "test(a+2, 1)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FUNCTION_CALL);
        expect(results[0].name.node).toEqual(Node.NAME);
        expect(results[0].name.value).toEqual("test");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.SUM, operator: "+" }));
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NUMBER, integer: 1 }));
    });
    it("Expression:my test(a)", (exp = "my test(a)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FUNCTION_CALL);
        expect(results[0].name.node).toEqual(Node.NAME);
        expect(results[0].name.value).toEqual("my test");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
    });
    it("Expression:test(param1:a)", (exp = "test(param1:a)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FUNCTION_CALL);
        expect(results[0].name.node).toEqual(Node.NAME);
        expect(results[0].name.value).toEqual("test");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAMED_PARAMETER, name: { node: Node.NAME, value: "param1" }, expression: { node: Node.NAME, value: "a" } }));
    });
    it("Expression:test(p1:a, p2 : 34)", (exp = "test(p1:a, p2 : 34)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FUNCTION_CALL);
        expect(results[0].name.node).toEqual(Node.NAME);
        expect(results[0].name.value).toEqual("test");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAMED_PARAMETER, name: { node: Node.NAME, value: "p1" }, expression: { node: Node.NAME, value: "a" } }));
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAMED_PARAMETER, name: { node: Node.NAME, value: "p2" }, expression: { node: Node.NUMBER, integer: 34, decimals: NaN, float: 34 } }));
    });
    it("Expression:a+test(a)", (exp = "a+test(a)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.SUM);
        expect(results[0].operator).toEqual("+");
        expect(results[0].left.node).toEqual(Node.NAME);
        expect(results[0].left.value).toEqual("a");
        expect(results[0].right.node).toEqual(Node.FUNCTION_CALL);
        expect(results[0].right.name.node).toEqual(Node.NAME);
        expect(results[0].right.name.value).toEqual("test");
        expect(results[0].right.parameters.node).toEqual(Node.LIST);
        expect(results[0].right.parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
    });
    it("Expression:a+test(a)", (exp = "test(a)+a") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.SUM);
        expect(results[0].operator).toEqual("+");
        expect(results[0].left.node).toEqual(Node.FUNCTION_CALL);
        expect(results[0].left.name.node).toEqual(Node.NAME);
        expect(results[0].left.name.value).toEqual("test");
        expect(results[0].left.parameters.node).toEqual(Node.LIST);
        expect(results[0].left.parameters.entries).toContainEqual(expect.objectContaining({ node: Node.NAME, value: "a" }));
        expect(results[0].right.node).toEqual(Node.NAME);
        expect(results[0].right.value).toEqual("a");
    });
    it("Expression:abs(number:-1)", (exp = "abs(number:-1)") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        //console.log("results: ", util.inspect(results, { showHidden: false, depth: null, colors: true }));
    });

});
