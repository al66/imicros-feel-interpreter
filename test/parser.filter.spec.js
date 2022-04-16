"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();


let exp = "";
describe("Filter Expressions", () => {

    it("Expression:a[b]", (exp = "a[b]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FILTER);
        expect(results[0].list.node).toEqual(Node.NAME);
        expect(results[0].list.value).toEqual("a");
        expect(results[0].filter.node).toEqual(Node.NAME);
        expect(results[0].filter.value).toEqual("b");
    });
    it("Expression:a[0]", (exp = "a[0]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FILTER);
        expect(results[0].list.node).toEqual(Node.NAME);
        expect(results[0].list.value).toEqual("a");
        expect(results[0].filter.node).toEqual(Node.NUMBER);
        expect(results[0].filter.integer).toEqual(0);
    });
    it("Expression:[1,2,3,4][-2]", (exp = "[1,2,3,4][-2]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FILTER);
        expect(results[0].list.node).toEqual(Node.LIST);
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 2 }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 4 }));
        expect(results[0].filter.node).toEqual(Node.NEGATION);
        expect(results[0].filter.expression.node).toEqual(Node.NUMBER);
        expect(results[0].filter.expression.integer).toEqual(2);
    });
    it("Expression:[1,2,3,4][item > 2]", (exp = "[1,2,3,4][item > 2]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FILTER);
        expect(results[0].list.node).toEqual(Node.LIST);
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 1 }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 2 }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 3 }));
        expect(results[0].list.entries).toContainEqual(expect.objectContaining({ integer: 4 }));
        expect(results[0].filter.node).toEqual(Node.COMPARISON);
        expect(results[0].filter.operator).toEqual(">");
        expect(results[0].filter.left.node).toEqual(Node.NAME);
        expect(results[0].filter.left.value).toEqual("item");
        expect(results[0].filter.right.node).toEqual(Node.NUMBER);
        expect(results[0].filter.right.integer).toEqual(2);
    });

});
