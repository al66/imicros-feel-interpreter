"use strict";

const Node = require("../lib/ast.js");
const util = require('util');

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = "";
describe("Test parser", () => {

    describe("Error", () => {
        it("Expression:5+3:5", (exp = "5+3:5") => {
            let success = interpreter.parse(exp);
            let error = interpreter.error;
            // console.log(util.inspect(error, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(false);
            expect(error).toBeDefined();
            expect(error.token).toBeDefined();
            expect(error.token.line).toEqual(1);
            expect(error.token.col).toEqual(4);
            expect(error.token.text).toEqual(":");
        });
    });

});
