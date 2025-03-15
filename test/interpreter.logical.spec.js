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
        it("should evaluate not(false) -> true", () => {
            let result = interpreter.evaluate("not(false)");
            expect(result).toEqual(true);
        });
        it("should evaluate not((a+1) > 4) with {a:2} -> true", () => {
            let result = interpreter.evaluate("not((a+1) > 4)",{a:2});
            expect(result).toEqual(true);
        });
        it("should evaluate not((a+1) > 4) with {a:4} -> false", () => {
            let result = interpreter.evaluate("not((a+1) > 4)",{a:4});
            expect(result).toEqual(false);
        });
        it(`should evaluate 5 = 5 and 6 != 5 and 3 <= 4 and date("2022-05-08") > date("2022-05-07") -> true`, () => {
            let result = interpreter.evaluate(`5 = 5 and 6 != 5 and 3 <= 4 and date("2022-05-08") > date("2022-05-07")`);
            expect(result).toEqual(true);
        });
        it("should evaluate {a:5,b:3,result: not(a<b)}.result -> true", () => {
            let result = interpreter.evaluate("{a:5,b:3,result: not(a<b)}.result");
            expect(result).toEqual(true);
        });
    });

    describe("instance of", () => {
        it("should evaluate a instance of b with {a:3,b:5} -> true", () => {
            let result = interpreter.evaluate("a instance of b",{a:3,b:5});
            expect(result).toEqual(true);
        });
        it("should evaluate a instance of b with {a:3,b:.5} -> true", () => {
            let result = interpreter.evaluate("a instance of b",{a:3,b:.5});
            expect(result).toEqual(true);
        });
        it('should evaluate a instance of b with {a:"test",b:"this"} -> true', () => {
            let result = interpreter.evaluate("a instance of b",{a:"test",b:"this"});
            expect(result).toEqual(true);
        });
        it('should evaluate a instance of b with {a:true,b:false} -> true', () => {
            let result = interpreter.evaluate("a instance of b",{a:true,b:false});
            expect(result).toEqual(true);
        });
        it("should evaluate a instance of number with {a:3} -> true", () => {
            let result = interpreter.evaluate("a instance of number",{a:3});
            expect(result).toEqual(true);
        });
        it("should evaluate a instance of boolean with {a:true} -> true", () => {
            let result = interpreter.evaluate("a instance of boolean",{a:true});
            expect(result).toEqual(true);
        });
        it('should evaluate a instance of string with {a:"test"} -> true', () => {
            let result = interpreter.evaluate("a instance of string",{a:"test"});
            expect(result).toEqual(true);
        });
    });

    describe("Build-in functions - is defined", () => {
        it("should evaluate is defined(a) with {a:3} -> true", () => {
            let result = interpreter.evaluate("is defined(a)",{a:3});
            expect(result).toEqual(true);
        });
        it("should evaluate is defined(null) -> false", () => {
            let result = interpreter.evaluate("is defined(null)");
            expect(result).toEqual(false);
        });
        it("should evaluate is defined({x: null}.x) -> false", () => {
            let result = interpreter.evaluate("is defined({x: null}.x)");
            expect(result).toEqual(false);
        });
        it("should evaluate is defined({}.x) -> false", () => {
            let result = interpreter.evaluate("is defined({}.x)");
            expect(result).toEqual(false);
        });
        it("should evaluate is defined(b) with {a:3} -> false", () => {
            let result = interpreter.evaluate("is defined(b)",{a:3});
            expect(result).toEqual(false);
        });
    });

});
