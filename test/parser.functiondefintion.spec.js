"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();


let exp = "";
describe("Function definition", () => {

    it("Expression:function (a:number,b:number) a+b", (exp = "function (a:number,b:number) a+b") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.FUNCTION_DEFINITION);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.FORMAL_PARAMETER, name: { node: Node.NAME, value: "a" }, type: "number" }));
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.FORMAL_PARAMETER, name: { node: Node.NAME, value: "b" }, type: "number" }));
        expect(results[0].expression).toEqual(expect.objectContaining({ node: Node.SUM, left: { node: Node.NAME, value: "a" }, operator: "+", right: { node: Node.NAME, value: "b" } }));
    });

    it("Expression:{calc:function (a:number,b:number) a+b, y:calc(4,5)+3}", (exp = "{calc:function (a:number,b:number) a+b, y:calc(4,5)+3}") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
    });

});
