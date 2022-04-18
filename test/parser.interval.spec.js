"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();


let exp = "";
describe("Interval Expressions", () => {

    it("Expression:[0..9]", (exp = "[0..9]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.INTERVAL);
        expect(results[0].open).toEqual("[");
        expect(results[0].close).toEqual("]");
        expect(results[0].from.integer).toEqual(0);
        expect(results[0].to.integer).toEqual(9);
    });
    it("Expression:[a.b..b.a]", (exp = "[a.b..b.a]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.INTERVAL);
        expect(results[0].open).toEqual("[");
        expect(results[0].close).toEqual("]");
        expect(results[0].from.node).toEqual(Node.PATH);
        expect(results[0].from.object.value).toEqual("a");
        expect(results[0].from.property.value).toEqual("b");
        expect(results[0].to.node).toEqual(Node.PATH);
        expect(results[0].to.object.value).toEqual("b");
        expect(results[0].to.property.value).toEqual("a");
    });
    it("Expression:[a.b .. b.a]", (exp = "[a.b .. b.a]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.INTERVAL);
        expect(results[0].open).toEqual("[");
        expect(results[0].close).toEqual("]");
        expect(results[0].from.node).toEqual(Node.PATH);
        expect(results[0].from.object.value).toEqual("a");
        expect(results[0].from.property.value).toEqual("b");
        expect(results[0].to.node).toEqual(Node.PATH);
        expect(results[0].to.object.value).toEqual("b");
        expect(results[0].to.property.value).toEqual("a");
    });
    it("Expression:[0.85...99]", (exp = "[0.85...99]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.INTERVAL);
        expect(results[0].open).toEqual("[");
        expect(results[0].close).toEqual("]");
        expect(results[0].from.node).toEqual(Node.NUMBER);
        expect(results[0].from.decimals).toEqual(85);
        expect(results[0].to.node).toEqual(Node.NUMBER);
        expect(results[0].to.decimals).toEqual(99);
    });
    it("Expression:(0.85...99[", (exp = "(0.85...99[") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.INTERVAL);
        expect(results[0].open).toEqual("(");
        expect(results[0].close).toEqual("[");
        expect(results[0].from.node).toEqual(Node.NUMBER);
        expect(results[0].from.decimals).toEqual(85);
        expect(results[0].to.node).toEqual(Node.NUMBER);
        expect(results[0].to.decimals).toEqual(99);
    });
    it("Expression:[from something..to something]", (exp = "[from something..to something]") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.INTERVAL);
        expect(results[0].open).toEqual("[");
        expect(results[0].close).toEqual("]");
        expect(results[0].from.node).toEqual(Node.NAME);
        expect(results[0].from.value).toEqual("from something");
        expect(results[0].to.node).toEqual(Node.NAME);
        expect(results[0].to.value).toEqual("to something");
    });

});
