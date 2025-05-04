"use strict";

const Interpreter = require("../lib/interpreter.js");
const util = require('util');

const interpreter = new Interpreter();

const silent = true; // Set to true to suppress console output

describe("Test interpreter", () => {

    describe("Error", () => {
        it("it should evaluate expression:5+3:5 with error", (exp = "5+3") => {
            interpreter.logger.activate("D");
            const result = interpreter.evaluate(`[{a:3,b:1},{a:4,b:2}][item.a > 3]`,{  });
            if (!silent) {
                console.log(util.inspect(interpreter.getAst(), { showHidden: false, depth: null }));
                console.log(util.inspect(interpreter.logger.getLog(), { showHidden: false, depth: null }));
                console.log(util.inspect(result, { showHidden: false, depth: null }));
            }
            expect(result).toEqual([ { a: 4, b: 2 } ]);
        });
    });
    
});
