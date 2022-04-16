"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Error", () => {
        it("it should evaluate expression:5+3:5 with error", (exp = "5+3:5") => {
            let result = interpreter.evaluate("5+3:5");
            let error = interpreter.error;
            // console.log(util.inspect(error, { showHidden: false, depth: null, colors: true }));
            expect(error).toBeDefined();
            expect(error.token).toBeDefined();
            expect(error.token.line).toEqual(1);
            expect(error.token.col).toEqual(4);
            expect(error.token.text).toEqual(":");
            expect(result).toEqual(null);
        });
    });
    
});
