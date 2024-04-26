"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Unary expression", () => {
        it("should evaluate 5 in - -> true", () => {
            let result = interpreter.evaluate("5 in -");
            expect(result).toEqual(true);
        });
        it("should evaluate 5 in (-) -> true", () => {
            let result = interpreter.evaluate("5 in (-)");
            expect(result).toEqual(true);
        });
        it("should evaluate 5 in (<10) -> true", () => {
            let result = interpreter.evaluate("5 in (<10)");
            expect(result).toEqual(true);
        });
        it("should evaluate 5 in (>10) -> false", () => {
            let result = interpreter.evaluate("5 in (>10)");
            expect(result).toEqual(false);
        });
        it("should evaluate 2 in (<3,>10) -> true", () => {
            let result = interpreter.evaluate("2 in (<3,>10)");
            expect(result).toEqual(true);
        });
        it("should evaluate 5 in (<3,>10) -> false", () => {
            let result = interpreter.evaluate("5 in (<3,>10)");
            expect(result).toEqual(false);
        });
        it("should evaluate 5 in (<3,a+b,>10) with {a:2,b:3} -> true", () => {
            let result = interpreter.evaluate("5 in (<3,a+b,>10)",{a:2,b:3});
            expect(result).toEqual(true);
        });
        it("should evaluate a in b with {a:3,b:5} -> false", () => {
            let result = interpreter.evaluate("a in b",{a:3,b:5});
            expect(result).toEqual(false);
        });
        it("should evaluate a in b with {a:5,b:5} -> true", () => {
            let result = interpreter.evaluate("a in b",{a:5,b:5});
            expect(result).toEqual(true);
        });
        it("should evaluate 2 in [1,2,3,4] -> true", () => {
            let result = interpreter.evaluate("2 in [1,2,3,4]");
            expect(result).toEqual(true);
        });
    });

});
