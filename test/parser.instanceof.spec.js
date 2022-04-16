"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = "";
describe("Test parser", () => {

    describe("Instance Of", () => {
        it("Expression:a instance of b", (exp = "a instance of b") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of.node).toEqual(Node.NAME);
            expect(results[0].of.value).toEqual("b");
        });
        it("Expression:a instance of number", (exp = "a instance of number") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of).toEqual("number");
        });
        it("Expression:a instance of list<number>", (exp = "a instance of list<number>") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of.node).toEqual(Node.LIST_OF);
            expect(results[0].of.single).toEqual("number");
        });
        it("Expression:a instance of list < string >", (exp = "a instance of list < string >") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of.node).toEqual(Node.LIST_OF);
            expect(results[0].of.single).toEqual("string");
        });
        it("Expression:a instance of string", (exp = "a instance of string") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of).toEqual("string");
        });
        it("Expression:a instance of boolean", (exp = "a instance of boolean") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of).toEqual("boolean");
        });
        it("Expression:a instance of date", (exp = "a instance of date") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of).toEqual("date");
        });
        it("Expression:a instance of time", (exp = "a instance of time") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of).toEqual("time");
        });
        it("Expression:a instance of date and time", (exp = "a instance of date and time") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of).toEqual("date and time");
        });
        it("Expression:a instance of day-time-duration", (exp = "a instance of day-time-duration") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of).toEqual("day-time-duration");
        });
        it("Expression:a instance of year-month-duration", (exp = "a instance of year-month-duration") => {
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
            expect(results[0].node).toEqual(Node.INSTANCE_OF);
            expect(results[0].instance.node).toEqual(Node.NAME);
            expect(results[0].instance.value).toEqual("a");
            expect(results[0].of).toEqual("year-month-duration");
        });
    });

});
