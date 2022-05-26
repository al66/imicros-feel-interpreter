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
        it("should allow named parameters - both", () => {
            let result = interpreter.evaluate({ expression: "a", context: {a: 7} });
            expect(result).toEqual(7);
        });
        it("should allow named parameters - just context", () => {
            interpreter.parse("a");
            let result = interpreter.evaluate({ context: {a: 7} });
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
        it("should return a variable with ' like Mother's finest", () => {
            let result = interpreter.evaluate(`{"Mother's finest":5, "result": 5 + Mother's finest}.result`);
            expect(result).toEqual(10);
        });
        it("should return a variable with leading _", () => {
            let result = interpreter.evaluate("_test var",{"_test var": 7});
            expect(result).toEqual(7);
        });
        it("should normalize white spaces in names", () => {
            let result = interpreter.evaluate(`{ "new example": 5}.new  example`);
            expect(result).toEqual(5);
        });
        it("should normalize white spaces in names", () => {
            let result = interpreter.evaluate(`{ "new  example": 5}.new example`);
            expect(result).toEqual(5);
        });
    });

    describe("Conversion built-in functions", () => {
        it(`should evaluate date(2022,05,13) -> "2022-05-13"`, () => {
            let result = interpreter.evaluate(`date(2022,05,13)`);
            expect(result).toEqual("2022-05-13");
        });
        it(`should evaluate time(19,48,55) -> "19:48:55"`, () => {
            let result = interpreter.evaluate(`time(19,48,55)`);
            expect(result).toEqual("19:48:55");
        });
        it(`should evaluate time(19,48,55,duration("PT1H")) -> "20:48:55"`, () => {
            let result = interpreter.evaluate(`time(19,48,55,duration("PT1H"))`);
            expect(result).toEqual("20:48:55");
        });
        it(`should evaluate number("1654.55") -> 1654.55`, () => {
            let result = interpreter.evaluate(`number("1654.55")`);
            expect(result).toEqual(1654.55);
        });
        it(`should evaluate string(1654.55) -> "1654.55"`, () => {
            let result = interpreter.evaluate(`string(1654.55)`);
            expect(result).toEqual("1654.55");
        });
        it(`should evaluate string(@"2022-05-13") -> "2022-05-13"`, () => {
            let result = interpreter.evaluate(`string(@"2022-05-13")`);
            expect(result).toEqual("2022-05-13");
        });
        it(`should evaluate context([{"key":"a", "value":1}, {"key":"b", "value":2}]) -> {a:1,b:2}`, () => {
            let result = interpreter.evaluate(`context([{"key":"a", "value":1}, {"key":"b", "value":2}])`);
            expect(result).toEqual({a:1,b:2});
        });
    });

});
