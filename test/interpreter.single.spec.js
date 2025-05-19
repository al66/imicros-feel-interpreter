"use strict";

const Interpreter = require("../lib/interpreter.js");
const util = require('util');

const interpreter = new Interpreter();

const silent = true; // Set to true to suppress console output

describe("Test interpreter", () => {

    describe("Error", () => {
        //const exp = `@"2021-01-02" - @"2021-01-01T10:10:10+11:00"`;
        const exp = `"5" = 5`
        //const expected = "P1DT49M50S";
        const expected = null; 

        it(`it should evaluate expression: ${exp} with expected result ${expected}"`, () => {
            interpreter.logger.activate("D");
            const result = interpreter.evaluate(exp,{  });
            if (!silent) {
                console.log(util.inspect(interpreter.getAst(), { showHidden: false, depth: null }));
                console.log(util.inspect(interpreter.logger.getLog(), { showHidden: false, depth: null }));
                console.log(util.inspect(result, { showHidden: false, depth: null }));
            }
            expect(result).toEqual(expected);
        });
    });
    
});
