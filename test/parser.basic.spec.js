"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = "";
describe("Test parser", () => {

    describe("Error", () => {
        it("Expression:5+3:5", (exp = "5+3:5") => {
            try {
                interpreter.parse(exp);
            } catch(error) {
                //console.log(util.inspect(error, { showHidden: false, depth: null, colors: true }));
                expect(error.text).toEqual(":");
                expect(error.position).toEqual("5+3");
                expect(error.offset).toEqual(3);
                expect(error.line).toEqual(1);
                expect(error.col).toEqual(4);
            };
        });
        it("Multiline expression", () => {
            let exp = `decision table(  // test
                outputs: ["Applicant Risk Rating"],
                inputs: ["Applicant Age","Medical History"],
                rule list: [ xxx
                    [>60,"good","Medium"], // test
                    [>60,"bad","High"],
                    [[25..60],-,"Medium"],
                    [<25,"good","Low"],
                    [<25,"bad","Medium"]
                ],
                hit policy: "Unique"
            ) // test`
            try {
                interpreter.parse(exp);
            } catch(error) {
                // console.log(util.inspect(error, { showHidden: false, depth: null, colors: true }));
                expect(error.text).toEqual(",");
                expect(error.position).toBeDefined();
            };
        });
    });

    describe("Comments", () => {
        it("it should parse expression with singe line comments", () => {
            let exp = `decision table(  // test
                outputs: ["Applicant Risk Rating"],
                inputs: ["Applicant Age","Medical History"],
                rule list: [
                    [>60,"good","Medium"], // test
                    [>60,"bad","High"],
                    [[25..60],-,"Medium"],
                    [<25,"good","Low"],
                    [<25,"bad","Medium"]
                ],
                hit policy: "Unique"
            ) // test`
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            // console.log(util.inspect(interpreter.error, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
        });
        it("it should parse expression with multi line comments", () => {
            let exp = `/* start 
                          comment */ 
                decision table(
                outputs: ["Applicant Risk Rating"],  
                inputs: ["Applicant Age","Medical History"],
                rule list: [
                    [>60,"good","Medium"],
                    [>60,"bad","High"],
                    [[25..60],-,"Medium"],
                    [<25,"good","Low"],
                    [<25,"bad","Medium"] // test
                ],
                hit policy: "Unique"
            ) /* end comment */`
            let success = interpreter.parse(exp);
            let results = interpreter.ast;
            // console.log(util.inspect(results, { showHidden: false, depth: null, colors: true }));
            // console.log(util.inspect(interpreter.error, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(results).toBeDefined();
            expect(results.length).toEqual(1);
        });
        it("it should parse context with multi line comments", () => {
            let exp = `/* start 
                          comment */ 
                { 
                    outputs: ["Applicant Risk Rating"],  
                    /* multi line
                       between */
                    inputs: ["Applicant Age","Medical History"],
                    rule list: [
                        [>60,"good","Medium"],
                        [>60,"bad","High"],
                        /**** 
                         * important comment 
                         ****/
                        [[25..60],-,"Medium"],
                        [<25,"good","Low"],
                        [<25,"bad","Medium"] // test
                    ],
                    hit policy: "Unique"
                } /* end comment */`
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
