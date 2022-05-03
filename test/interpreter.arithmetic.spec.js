"use strict";

const { Interpreter } = require("../index.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Arithmetic expressions", () => {
        it("should calculate 5+3 -> 8", () => {
            let result = interpreter.evaluate("5+3");
            expect(result).toEqual(8);
        });
        it("should calculate 5*3 -> 15", () => {
            let result = interpreter.evaluate("5*3");
            expect(result).toEqual(15);
        });
        it("should calculate 5/a with context {a:2} -> 2.5", () => {
            let result = interpreter.evaluate("5/a",{a:2});
            expect(result).toEqual(2.5);
        });
        it("should calculate 1/2**-4-3 -> 13", () => {
            let result = interpreter.evaluate("1/2**-4-3");
            expect(result).toEqual(13);
        });
        it("should calculate a/b**-c-d with context {a:1,b:2,c:4,d:3} -> 13", () => {
            let result = interpreter.evaluate("a/b**-c-d",{a:1,b:2,c:4,d:3});
            expect(result).toEqual(13);
        });
        it("should calculate 5 - with white space .. with context {'with white space': 7} -> -2", () => {
            let result = interpreter.evaluate("5 - with white space",{"with white space": 7});
            expect(result).toEqual(-2);
        });
        it("should calculate ((9.5)- 8.6 ) + 77 -> 77.9", () => {
            let result = interpreter.evaluate("((9.5)- 8.6 ) + 77");
            expect(result).toEqual(77.9);
        });
        it("should calculate ((x0)- y0 ) + z0 with context {x0:9.5,y0:8.6,z0:77} -> 77.9", () => {
            let result = interpreter.evaluate("((x0)- y0 ) + z0",{x0:9.5,y0:8.6,z0:77});
            expect(result).toEqual(77.9);
        });
        it("should calculate \"a\"+3 -> \"a3\"", () => {
            let result = interpreter.evaluate("\"a\"+3");
            expect(result).toEqual("a3");
        });
    });

    describe("Arithmetic - build-in functions", () => {
        it("should calculate decimal(-3.6,0) -> -4", () => {
            let result = interpreter.evaluate("decimal(-3.6,0)");
            expect(result).toEqual(-4);
        });
        it("should calculate decimal(3.216,2) -> 3.22", () => {
            let result = interpreter.evaluate("decimal(3.216,2)");
            expect(result).toEqual(3.22);
        });
        it("should calculate decimal(3.214,2) -> 3.21", () => {
            let result = interpreter.evaluate("decimal(3.214,2)");
            expect(result).toEqual(3.21);
        });
        it("should calculate decimal(1/3,2) -> 0.33", () => {
            let result = interpreter.evaluate("decimal(1/3,2)");
            expect(result).toEqual(0.33);
        });
        it("should calculate floor(-3.6) -> -4", () => {
            let result = interpreter.evaluate("floor(-3.6)");
            expect(result).toEqual(-4);
        });
        it("should calculate floor(-3.05) -> -4", () => {
            let result = interpreter.evaluate("floor(-3.05)");
            expect(result).toEqual(-4);
        });
        it("should calculate floor(45.95) -> 45", () => {
            let result = interpreter.evaluate("floor(45.95)");
            expect(result).toEqual(45);
        });
        it("should calculate ceiling(-3.6) -> -3", () => {
            let result = interpreter.evaluate("ceiling(-3.6)");
            expect(result).toEqual(-3);
        });
        it("should calculate ceiling(-3.05) -> -3", () => {
            let result = interpreter.evaluate("ceiling(-3.05)");
            expect(result).toEqual(-3);
        });
        it("should calculate ceiling(45.95) -> 46", () => {
            let result = interpreter.evaluate("ceiling(45.95)");
            expect(result).toEqual(46);
        });
        it("should calculate abs(-3.5) -> 3.5", () => {
            let result = interpreter.evaluate("abs(-3.5)");
            expect(result).toEqual(3.5);
        });
        it("should calculate modulo(17,5) -> 2", () => {
            let result = interpreter.evaluate("modulo(17,5)");
            expect(result).toEqual(2);
        });
        it("should calculate sqrt(16) -> 4", () => {
            let result = interpreter.evaluate("sqrt(16)");
            expect(result).toEqual(4);
        });
        it("should calculate log(10) -> 2.302585092994046", () => {
            let result = interpreter.evaluate("log(10)");
            expect(result).toEqual(2.302585092994046);
        });
        it("should calculate exp(2) -> 7.38905609893065", () => {
            let result = interpreter.evaluate("exp(2)");
            expect(result).toEqual(7.38905609893065);
        });
        it("should calculate odd(3) -> true", () => {
            let result = interpreter.evaluate("odd(3)");
            expect(result).toEqual(true);
        });
        it("should calculate odd(4) -> false", () => {
            let result = interpreter.evaluate("odd(4)");
            expect(result).toEqual(false);
        });
        it("should calculate even(4) -> true", () => {
            let result = interpreter.evaluate("even(4)");
            expect(result).toEqual(true);
        });
        it("should calculate even(3) -> false", () => {
            let result = interpreter.evaluate("even(3)");
            expect(result).toEqual(false);
        });
    });
});
