"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = "";
describe("Date and time expressions", () => {

    it("Expression:date and time(\"2022-04-06T08:00:00\")", (exp = "date and time(\"2022-04-06T08:00:00\")") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.DATE_AND_TIME);
        expect(results[0].name).toEqual("date and time");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.STRING, value: "2022-04-06T08:00:00" }));
    });
    it("Expression:date(\"2022-04-06\")", (exp = "date(\"2022-04-06\")") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.DATE_AND_TIME);
        expect(results[0].name).toEqual("date");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.STRING, value: "2022-04-06" }));
    });
    it("Expression:time(\"08:00:00\")", (exp = "time(\"08:00:00\")") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.DATE_AND_TIME);
        expect(results[0].name).toEqual("time");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.STRING, value: "08:00:00" }));
    });
    it("Expression:duration(\"P1Y6M\")", (exp = "duration(\"P1Y6M\")") => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.DATE_AND_TIME);
        expect(results[0].name).toEqual("duration");
        expect(results[0].parameters.node).toEqual(Node.LIST);
        expect(results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.STRING, value: "P1Y6M" }));
    });
    it("Expression:@\"2022-04-06T08:00:00\")", (exp = '@"2022-04-06T08:00:00"') => {
        let success = interpreter.parse(exp);
        let results = interpreter.ast;
        // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
        expect(success).toEqual(true);
        expect(results).toBeDefined();
        expect(results.length).toEqual(1);
        expect(results[0].node).toEqual(Node.AT_LITERAL);
        expect(results[0].expression.node).toEqual(Node.STRING);
        expect(results[0].expression.value).toEqual("2022-04-06T08:00:00");
    });

});
