"use strict";

const Interpreter = require("../lib/interpreter.js");
const util = require('util');

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Error", () => {
        it("it should evaluate expression:5+3:5 with error", (exp = "5+3:5") => {
            try {
                interpreter.evaluate("5+3:5");
            } catch (error) {
                // console.log(util.inspect(error, { showHidden: false, depth: null, colors: true }));
                expect(error.text).toEqual(":");
                expect(error.position).toEqual("5+3");
                expect(error.offset).toEqual(3);
                expect(error.line).toEqual(1);
                expect(error.col).toEqual(4);
            }
        });
    });
    
});
