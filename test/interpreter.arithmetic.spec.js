"use strict";

const Interpreter = require("../lib/interpreter.js");

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

});
