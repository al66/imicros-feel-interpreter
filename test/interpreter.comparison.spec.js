"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Comparison", () => {
        it("should evaluate 5 = 5 -> true", () => {
            let result = interpreter.evaluate("5 = 5");
            expect(result).toEqual(true);
        });
        it("should evaluate 5 != 5 -> false", () => {
            let result = interpreter.evaluate("5 != 5");
            expect(result).toEqual(false);
        });
        it("should evaluate null = null -> true", () => {
            let result = interpreter.evaluate("null = null");
            expect(result).toEqual(true);
        });
        it("should evaluate {x:null}.x = null -> true", () => {
            let result = interpreter.evaluate("{x:null}.x = null");
            expect(result).toEqual(true);
        });
        it("should evaluate {}.y = null -> true", () => {
            let result = interpreter.evaluate("{}.y = null");
            expect(result).toEqual(true);
        });
        it("should evaluate a>b with context {a:4.1,b:4} -> true", () => {
            let result = interpreter.evaluate("a>b",{a:4.1,b:4});
            expect(result).toEqual(true);
        });
        it("should evaluate a>b with context {a:2,b:4} -> false", () => {
            let result = interpreter.evaluate("a > b",{a:2,b:4});
            expect(result).toEqual(false);
        });
        it("should evaluate a+b > c+d with {a:5,b:4,c:3,d:5} -> true", () => {
            let result = interpreter.evaluate("a+b > c+d",{a:5,b:4,c:3,d:5});
            expect(result).toEqual(true);
        });
        it("should evaluate a+b>c+d with {a:5,b:4,c:6,d:5} -> false", () => {
            let result = interpreter.evaluate("a+b > c+d",{a:5,b:4,c:6,d:5});
            expect(result).toEqual(false);
        });
        it("should evaluate a+b>8.9 with {a:5,b:4} -> true", () => {
            let result = interpreter.evaluate("a+b>8.9",{a:5,b:4});
            expect(result).toEqual(true);
        });
        it("should evaluate c + d > 8.1 with {c:4,d:5} -> true", () => {
            let result = interpreter.evaluate("c + d > 8.1",{c:4,d:5});
            expect(result).toEqual(true);
        });
        it('should evaluate date("2022-04-05") < date("2022-04-06") -> true', () => {
            let result = interpreter.evaluate('date("2022-04-05") < date("2022-04-06")');
            expect(result).toEqual(true);
        });
        it('should evaluate date and time("2022-04-05T23:59:59") < date("2022-04-06") -> true', () => {
            let result = interpreter.evaluate('date and time("2022-04-05T23:59:59") < date("2022-04-06")');
            expect(result).toEqual(true);
        });
        it('should evaluate date and time("2022-04-15T08:00:00") = date and time("2022-04-15T00:00:00") + @"P8H" -> true', () => {
            let result = interpreter.evaluate('date and time("2022-04-15T08:00:00") = date and time("2022-04-15T00:00:00") + @"PT8H"');
            expect(result).toEqual(true);
        });
        it('should evaluate date("2022-04-05") + @"P2D" > date("2022-04-06") -> true', () => {
            let result = interpreter.evaluate('date("2022-04-05") + @"P2D" > date("2022-04-06")');
            expect(result).toEqual(true);
        });
        it('should evaluate @"P5D" > @"P2D" -> true', () => {
            let result = interpreter.evaluate('@"P5D" > @"P2D"');
            expect(result).toEqual(true);
        });
        it('should evaluate @"P5D" > @"P4DT23H" -> true', () => {
            let result = interpreter.evaluate('@"P5D" > @"P4DT23H"');
            expect(result).toEqual(true);
        });
        it('should evaluate @"P5D" = @"P4DT24H" -> true', () => {
            let result = interpreter.evaluate('@"P5D" = @"P4DT24H"');
            expect(result).toEqual(true);
        });
        it('should evaluate 5 in [0..9] -> true', () => {
            let result = interpreter.evaluate('5 in [0..9]');
            expect(result).toEqual(true);
        });
        it('should evaluate a in [0..9) with {a:8} -> true', () => {
            let result = interpreter.evaluate('a in [0..9)',{a:8});
            expect(result).toEqual(true);
        });
        it('should evaluate a in [0..9) with {a:9} -> false', () => {
            let result = interpreter.evaluate('a in [0..9)',{a:9});
            expect(result).toEqual(false);
        });
        it('should evaluate date("2022-04-05") in [date("2022-04-04")..date("2022-04-06")] -> true', () => {
            let result = interpreter.evaluate('date("2022-04-05") in [date("2022-04-04")..date("2022-04-06")]');
            expect(result).toEqual(true);
        });
        it('should evaluate (date("2022-04-01")+duration("P3D")) in [date("2022-04-04")..date("2022-04-06")] -> true', () => {
            let result = interpreter.evaluate('(date("2022-04-01")+duration("P3D")) in [date("2022-04-04")..date("2022-04-06")]');
            expect(result).toEqual(true);
        });
        it('should evaluate 5 between 3 and 7 -> true', () => {
            let result = interpreter.evaluate('5 between 3 and 7');
            expect(result).toEqual(true);
        });
        it('should evaluate date("2022-04-05") between date("2022-04-04") and date("2022-04-06") -> true', () => {
            let result = interpreter.evaluate('date("2022-04-05") between date("2022-04-04") and date("2022-04-06")');
            expect(result).toEqual(true);
        });
    });

});
