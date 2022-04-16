"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("String expressions", () => {
        it('"This is a test" should return a string"', () => {
            let result = interpreter.evaluate('"This is a test"');
            expect(result).toEqual("This is a test");
        });
        it("\"This is a test\" should return also a string", () => {
            let result = interpreter.evaluate("\"This is a test\"");
            expect(result).toEqual("This is a test");
        });
        // TODO: Escape character \" - must be already fixed in the tokenizer!
        it("This is a test with escaped characters \\ \' \" \n \r \t \u269D \u101EF \" should return also a string", () => {
            let result = interpreter.evaluate("\"This is a test with escaped characters \\ \' \n \r \t \u269D \u101EF \"");
            // console.log(JSON.stringify(result));
            expect(JSON.stringify(result)).toEqual(JSON.stringify("\"This is a test with escaped characters \\ \' \n \r \t \u269D \u101EF \""));
        });
        it('Should evaluate "foo" + "bar" -> "foobar"', () => {
            let result = interpreter.evaluate('"foo" + "bar"');
            expect(result).toEqual("foobar");
        });
    });

});
