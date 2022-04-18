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
        // TODO: Escape character \" - how to really test used esacped sequence in escaped string ?
        it("This is a test with escaped characters \\ \' \" \n \r \t \u269D \u101EF \" should return also a string", () => {
            let result = interpreter.evaluate("\"This is a test with escaped characters \\ \' \\\" \n \r \t \u269D \u101EF \"");
            // console.log(JSON.stringify(result));
            expect(JSON.stringify(result)).toEqual(JSON.stringify('This is a test with escaped characters \\ \' \\\" \n \r \t \u269D \u101EF '));
        });
        it('Should evaluate "foo" + "bar" -> "foobar"', () => {
            let result = interpreter.evaluate('"foo" + "bar"');
            expect(result).toEqual("foobar");
        });
        it('Should evaluate substring("imicros",3) -> "icros"', () => {
            let result = interpreter.evaluate('substring("imicros",3)');
            expect(result).toEqual("icros");
        });
        it('Should evaluate substring("imicros",3,3) -> "icr"', () => {
            let result = interpreter.evaluate('substring("imicros",3,3)');
            expect(result).toEqual("icr");
        });
        it('Should evaluate string length("imicros") -> 7', () => {
            let result = interpreter.evaluate('string length("imicros")');
            expect(result).toEqual(7);
        });
        it('Should evaluate upper case("imicros") -> "IMICROS"', () => {
            let result = interpreter.evaluate('upper case("imicros")');
            expect(result).toEqual("IMICROS");
        });
        it('Should evaluate lower case("IMicros") -> "imicros"', () => {
            let result = interpreter.evaluate('lower case("IMicros")');
            expect(result).toEqual("imicros");
        });
        it('Should evaluate "best of" + lower case("IMicros") -> "best of imicros"', () => {
            let result = interpreter.evaluate('"best of " + lower case("IMicros")');
            expect(result).toEqual("best of imicros");
        });
        it('Should evaluate substring before("imicros","cros") -> "ini"', () => {
            let result = interpreter.evaluate('substring before("imicros","cros")');
            expect(result).toEqual("imi");
        });
        it('Should evaluate substring after("imicros","mic") -> "ros"', () => {
            let result = interpreter.evaluate('substring after("imicros","mic")');
            expect(result).toEqual("ros");
        });
        it('Should evaluate starts with("imicros","imi") -> true', () => {
            let result = interpreter.evaluate('starts with("imicros","imi")');
            expect(result).toEqual(true);
        });
        it('Should evaluate ends with("imicros","cros") -> true', () => {
            let result = interpreter.evaluate('ends with("imicros","cros")');
            expect(result).toEqual(true);
        });
        it('Should evaluate ends with("imicros","cro") -> false', () => {
            let result = interpreter.evaluate('ends with("imicros","cro")');
            expect(result).toEqual(false);
        });
        it('Should evaluate matches("imicros","^im.cros") -> true', () => {
            let result = interpreter.evaluate('matches("imicros","^im.cros")');
            expect(result).toEqual(true);
        });
        it('Should evaluate split("i;m;i;c;r;o;s",";") -> ["i","m","i","c","r","o","s"]', () => {
            let result = interpreter.evaluate('split("i;m;i;c;r;o;s",";")');
            expect(result).toEqual(["i","m","i","c","r","o","s"]);
        });
        it('Should evaluate split("John Doe","\s") -> ["John","Doe"]', () => {
            let result = interpreter.evaluate('split("John Doe","\\s")');
            expect(result).toEqual(["John","Doe"]);
        });
        it('Should evaluate split("a;b;c;;", ";") -> ["a", "b", "c", "", ""]', () => {
            let result = interpreter.evaluate('split("a;b;c;;", ";")');
            expect(result).toEqual(["a", "b", "c", "", ""]);
        });
        it('Should evaluate extract("references are 1234, 1256, 1378", "12[0-9]*") -> ["1234","1256"]', () => {
            let result = interpreter.evaluate('extract("references are 1234, 1256, 1378", "12[0-9]*")');
            expect(result).toEqual(["1234","1256"]);
        });
        it('Should evaluate replace("abcd", "(ab)|(a)", "[1=$1][2=$2]") -> "[1=ab][2=]cd"', () => {
            let result = interpreter.evaluate('replace("abcd", "(ab)|(a)", "[1=$1][2=$2]")');
            expect(result).toEqual("[1=ab][2=]cd");
        });
        // backlashes must be esacaped, if used!  
        it('Should evaluate replace("0123456789", "(\\d{3})(\\d{3})(\\d{4})", "($1) $2-$3") -> "(012) 345-6789"', () => {
            let result = interpreter.evaluate('replace("0123456789", "(\\d{3})(\\d{3})(\\d{4})", "($1) $2-$3")');
            expect(result).toEqual("(012) 345-6789");
        });
        // ...or do not use them at all... 
        it('Should evaluate replace("0123456789", "([0-9]{3})([0-9]{3})([0-9]{4})", "($1) $2-$3") -> "(012) 345-6789"', () => {
            let result = interpreter.evaluate('replace("0123456789", "([0-9]{3})([0-9]{3})([0-9]{4})", "($1) $2-$3")');
            expect(result).toEqual("(012) 345-6789");
        });
    });

});
