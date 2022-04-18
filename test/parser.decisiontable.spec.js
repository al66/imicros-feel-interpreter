"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test parser", () => {

    describe("Decision table function", () => {
        it("it should parse a simple table", () => {
            let exp = `decision table(
                outputs: ["Applicant Risk Rating"],
                inputs: ["Applicant Age","Medical History"],
                rule list: [
                    [>60,"good","Medium"],
                    [>60,"bad","High"],
                    [[25..60],-,"Medium"],
                    [<25,"good","Low"],
                    [<25,"bad","Medium"]
                ],
                hit policy: "Unique"
            )`
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            // console.log(util.inspect(interpreter.error, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
        });
    });

    describe("Decision table function as part of a context in a list", () => {
        it("it should parse a context with decision table expression", () => {
            let exp = `[{ first: a,
                second: decision table(
                outputs: ["Applicant Risk Rating"],
                inputs: ["Applicant Age","Medical History"],
                rule list: [
                    [>60,"good","Medium"],
                    [>60,"bad","High"],
                    [[25..60],-,"Medium"],
                    [<25,"good","Low"],
                    [<25,"bad","Medium"]
                ],
                hit policy: "Unique"
            ) }, a]`
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            // console.log(util.inspect(interpreter.error, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
        });
    });

    describe("Decision table function as part of boxed context", () => {
        it("it should parse a boxed context with decision table expression and result", () => {
            let exp = `{ first: a,
                second: decision table(
                outputs: ["Applicant Risk Rating"],
                inputs: ["Applicant Age","Medical History"],
                rule list: [
                    [>60,"good","Medium"],
                    [>60,"bad","High"],
                    [[25..60],-,"Medium"],
                    [<25,"good","Low"],
                    [<25,"bad","Medium"]
                ],
                hit policy: "Unique"
            ) } a`
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            // console.log(util.inspect(interpreter.error, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
        });
    });

});
