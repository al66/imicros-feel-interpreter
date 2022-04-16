"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("IF expression", () => {
        it("should evaluate if 1 > 2 then 3 else 4 -> 4", () => {
            let result = interpreter.evaluate("if 1 > 2 then 3 else 4");
            expect(result).toEqual(4);
        });
        it("should evaluate if a>b then c+4 else d with context {a:3,b:2,c:5.1,d:4} -> 9.1", () => {
            let result = interpreter.evaluate("if a>b then c+4 else d",{a:3,b:2,c:5.1,d:4});
            expect(result).toEqual(9.1);
        });
    });

});
