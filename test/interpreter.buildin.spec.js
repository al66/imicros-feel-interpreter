"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Build-in functions - temporal", () => {
        it("should evaluate today().year -> current year", () => {
            let result = interpreter.evaluate("today().year");
            expect(result).toEqual(new Date().getFullYear());
        });
        it("should evaluate now().minute -> current minute", () => {
            let result = interpreter.evaluate("now().minute");
            expect(result).toEqual(new Date().getMinutes());
        });
    });

});
