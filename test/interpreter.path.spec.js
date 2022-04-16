"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Path", () => {
        it("should evaluate deep.a with context {deep:{a:3}} -> 3", () => {
            let result = interpreter.evaluate("deep.a",{deep:{a:3}});
            expect(result).toEqual(3);
        });
        it("should evaluate {a:3}.a -> 3", () => {
            let result = interpreter.evaluate("{a:3}.a");
            expect(result).toEqual(3);
        });
        it("should evaluate deep.a.b with context {deep:{a:{b:3}}} -> 3", () => {
            let result = interpreter.evaluate("deep.a.b",{deep:{a:{b:3}}});
            expect(result).toEqual(3);
        });
        it("should evaluate deep.a.b + deep.c with context {deep:{a:{b:3},c:2}} -> 5", () => {
            let result = interpreter.evaluate("deep.a.b + deep.c",{deep:{a:{b:3},c:2}});
            expect(result).toEqual(5);
        });
    });

});
