"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Function defintion and invocation", () => {
        it("should evaluate {calc:function (a:number,b:number) a+b, y:calc(4,5)+3} -> {y:12}", () => {
            let result = interpreter.evaluate("{calc:function (a:number,b:number) a+b, y:calc(4,5)+3}");
            expect(result).toEqual({y:12});
        });
        it("should evaluate {calc:function (a:number,b:number) a-b, y:calc(b:4,a:5)+3} -> {y:4}", () => {
            let result = interpreter.evaluate("{calc:function (a:number,b:number) a-b, y:calc(b:4,a:5)+3}");
            expect(result).toEqual({y:4});
        });
        it("should evaluate {calc:function (a:number,b:number) a-b, y:calc(b:c,a:d)+3}.y with context {c:4,d:5} -> 4", () => {
            let result = interpreter.evaluate("{calc:function (a:number,b:number) a-b, y:calc(b:c,a:d)+3}.y",{c:4,d:5});
            expect(result).toEqual(4);
        });
        it("should evaluate {calc:function (a:number,b:number) a-b, y:calc(c,d)+3} with context {c:4,d:5} -> {y:2}", () => {
            let result = interpreter.evaluate("{calc:function (a:number,b:number) a-b, y:calc(c,d)+3}",{c:4,d:5});
            expect(result).toEqual({y:2});
        });
    });

});
