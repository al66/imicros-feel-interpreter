"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Simple expressions", () => {
        it("5 should return a number", () => {
            interpreter.parse("5");
            let result = interpreter.evaluate();
            expect(result).toEqual(5);
        });
        it("5.1 should return a float", () => {
            interpreter.parse("5.1");
            let result = interpreter.evaluate();
            expect(result).toEqual(5.1);
        });
        it(".1 should return a float", () => {
            interpreter.parse(".1");
            let result = interpreter.evaluate();
            expect(result).toEqual(0.1);
        });
        it("-5 should return a negative number", () => {
            interpreter.parse("-5");
            let result = interpreter.evaluate();
            expect(result).toEqual(-5);
        });
        it("true should return a boolean", () => {
            interpreter.parse("true");
            let result = interpreter.evaluate();
            expect(result).toEqual(true);
        });
        it("false should return a boolean", () => {
            interpreter.parse("false");
            let result = interpreter.evaluate();
            expect(result).toEqual(false);
        });
        it("null should return null", () => {
            let result = interpreter.evaluate("null");
            expect(result).toEqual(null);
        });
        it("should return a variable from context", () => {
            let result = interpreter.evaluate("a",{a: 7});
            expect(result).toEqual(7);
        });
        it("should return a variable with white space from context", () => {
            let result = interpreter.evaluate("with white space",{"with white space": 7});
            expect(result).toEqual(7);
        });
        it("should return a variable with leading ?", () => {
            let result = interpreter.evaluate("?test var",{"?test var": 7});
            expect(result).toEqual(7);
        });
        it("should return a variable with leading _", () => {
            let result = interpreter.evaluate("_test var",{"_test var": 7});
            expect(result).toEqual(7);
        });
    });

});
