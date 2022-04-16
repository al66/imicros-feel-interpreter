"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = "";
describe("Boxed Expressions", () => {

    it("Expression:[1,2]", (exp = "[1,2]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.LIST);
        expect(results[0].entries).toContainEqual(expect.objectContaining({ node: Node.NUMBER, integer: 1 }));
        expect(results[0].entries).toContainEqual(expect.objectContaining({ node: Node.NUMBER, integer: 2 }));
    });
    it("Expression:[{a:1},{b:2}]", (exp = "[{a:1},{b:2}]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.LIST);
        expect(results[0].entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT }));
        expect(results[0].entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT }));
    });
    it("Expression:{a:1}", (exp = "{a:1}") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.CONTEXT);
        expect(results[0].data.node).toEqual(Node.LIST);
        expect(results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "a" }, expression: { node: Node.NUMBER, integer: 1, decimals: NaN, float: 1 } }));
    });
    it("Expression:{}", (exp = "{}") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.CONTEXT);
        expect(results[0].data).toEqual(null);
    });
    it("Expression:{a : 1,b:3}", (exp = "{a : 1,b:3}") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.CONTEXT);
        expect(results[0].data.node).toEqual(Node.LIST);
        expect(results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "a" }, expression: { node: Node.NUMBER, integer: 1, decimals: NaN, float: 1 } }));
        expect(results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "b" }, expression: { node: Node.NUMBER, integer: 3, decimals: NaN, float: 3 } }));
    });
    it("Expression:{\"a\" : 1,b:3}", (exp = "{\"a\" : 1,b:3}") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.CONTEXT);
        expect(results[0].data.node).toEqual(Node.LIST);
        expect(results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.STRING, value: '"a"' }, expression: { node: Node.NUMBER, integer: 1, decimals: NaN, float: 1 } }));
        expect(results[0].data.entries).toContainEqual(expect.objectContaining({ node:Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "b" }, expression: { node: Node.NUMBER, integer: 3, decimals: NaN, float: 3 } }));
    });
    it("Expression:{a:1 + 2}", (exp = "{a:1 + 2}") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.CONTEXT);
        expect(results[0].data.node).toEqual(Node.LIST);
        expect(results[0].data.entries).toContainEqual(expect.objectContaining({ node: Node.CONTEXT_ENTRY, key: { node: Node.NAME, value: "a" }, expression: { node: Node.SUM, operator: "+", left: { node: Node.NUMBER, integer: 1, decimals: NaN, float: 1 }, right: { node: Node.NUMBER, integer: 2, decimals: NaN, float: 2 } } }));
    });

});
