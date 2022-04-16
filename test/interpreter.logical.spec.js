"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Logical", () => {
        it("should evaluate true and true -> true", () => {
            let result = interpreter.evaluate("true and true");
            expect(result).toEqual(true);
        });
        it("should evaluate true and false -> false", () => {
            let result = interpreter.evaluate("true and false");
            expect(result).toEqual(false);
        });
        it("should evaluate true or false -> true", () => {
            let result = interpreter.evaluate("true or false");
            expect(result).toEqual(true);
        });
        it("should evaluate true or null -> true", () => {
            let result = interpreter.evaluate("true or null");
            expect(result).toEqual(true);
        });
        it("should evaluate a+b>8.9 and c+d>8.1 with {a:5,b:4,c:4,d:5} -> true", () => {
            let result = interpreter.evaluate("(a+b)>(8.9) and (c+d)>(8.1)",{a:5,b:4,c:4,d:5});
            expect(result).toEqual(true);
        });
        it("should evaluate a+b>11 or c+d>8.1 with {a:5,b:4,c:3,d:5} -> true", () => {
            let result = interpreter.evaluate("a+b>11 or c+d>8.1",{a:5,b:4,c:4,d:5});
            expect(result).toEqual(true);
        });
        it("should evaluate a+b>11 and c+d>8.1 with {a:5,b:4,c:3,d:5} -> false", () => {
            let result = interpreter.evaluate("a+b>11 and c+d>8.1",{a:5,b:4,c:3,d:5});
            expect(result).toEqual(false);
        });
    });

});
