"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("FOR expression", () => {
        it("should evaluate for a in [1,2,3] return a*2 -> [2,4,6]", () => {
            let result = interpreter.evaluate("for a in [1,2,3] return a*2");
            expect(result).toEqual([2,4,6]);
        });
    });

});
