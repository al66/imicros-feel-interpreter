"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Parse and evaluate", () => {
        it("should parse successfully", () => {
           let result = interpreter.parse("(a+1)/5");
            expect(result).toEqual(true);
        });
        it("should evaluate an expression", () => {
            let result = interpreter.evaluate("5");
            expect(result).toEqual(5);
        });
        it("should evaluate an expression with context", () => {
            let result = interpreter.evaluate("a",{a:6});
            expect(result).toEqual(6);
        });
        it("should evaluate a context with a pre-parsed expression", () => {
            interpreter.parse("a+b");
            let result = interpreter.evaluate({a:5,b:2});
            expect(result).toEqual(7);
            result = interpreter.evaluate({a:3,b:0.2});
            expect(result).toEqual(3.2);
        });
        it("should reset the ast", () => {
            interpreter.parse("a+b");
            let result = interpreter.evaluate({a:5,b:2});
            expect(result).toEqual(7);
            interpreter.parse("a-b");
            result = interpreter.evaluate({a:5,b:2});
            expect(result).toEqual(3);
        });
        it("should evaluate a context with a pre-parsed stored expression", () => {
            interpreter.parse("a+b");
            let ast = interpreter.getAst();
            interpreter.setAst(JSON.parse(JSON.stringify(ast)));
            let result = interpreter.evaluate({a:5,b:2});
            expect(result).toEqual(7);
            result = interpreter.evaluate({a:3,b:0.2});
            expect(result).toEqual(3.2);
        });
    });

});
