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
    });

    describe("Evaluate", () => {
        describe("Simple expressions", () => {
            it("5 should return a number", () => {
                interpreter.parse("5");
                let result = interpreter.evaluate();
                expect(result).toEqual(5);
            });
            it("true should return a boolean", () => {
                interpreter.parse("true");
                let result = interpreter.evaluate();
                expect(result).toEqual(true);
            });
            it("null should return null", () => {
                let result = interpreter.evaluate("null");
                expect(result).toEqual(null);
            });
            it('"This is a test" should return a string', () => {
                let result = interpreter.evaluate('"This is a test"');
                expect(result).toEqual("This is a test");
            });
            it("\"This is a test\" should return also a string", () => {
                let result = interpreter.evaluate("\"This is a test\"");
                expect(result).toEqual("This is a test");
            });
            it("should calculate 5+3 -> 8", () => {
                let result = interpreter.evaluate("5+3");
                expect(result).toEqual(8);
            });
            it("should calculate 5*3 -> 15", () => {
                let result = interpreter.evaluate("5*3");
                expect(result).toEqual(15);
            });
            it("should calculate 5/a with context {a:2} -> 2.5", () => {
                let result = interpreter.evaluate("5/a",{a:2});
                expect(result).toEqual(2.5);
            });
            it("should calculate 1/2**-4-3 -> 13", () => {
                let result = interpreter.evaluate("1/2**-4-3");
                expect(result).toEqual(13);
            });
            it("should calculate a/b**-c-d with context {a:1,b:2,c:4,d:3} -> 13", () => {
                let result = interpreter.evaluate("a/b**-c-d",{a:1,b:2,c:4,d:3});
                expect(result).toEqual(13);
            });
            it("should return a variable from context", () => {
                let result = interpreter.evaluate("a",{a: 7});
                expect(result).toEqual(7);
            });
            it("should return a variable with white space from context", () => {
                let result = interpreter.evaluate("with white space",{"with white space": 7});
                expect(result).toEqual(7);
            });
            it("should calculate 5 - with white space .. with context {'with white space': 7} -> -2", () => {
                let result = interpreter.evaluate("5 - with white space",{"with white space": 7});
                expect(result).toEqual(-2);
            });
            it("should calculate ((9.5)- 8.6 ) + 77 -> 77.9", () => {
                let result = interpreter.evaluate("((9.5)- 8.6 ) + 77");
                expect(result).toEqual(77.9);
            });
            it("should calculate ((x0)- y0 ) + z0 with context {x0:9.5,y0:8.6,z0:77} -> 77.9", () => {
                let result = interpreter.evaluate("((x0)- y0 ) + z0",{x0:9.5,y0:8.6,z0:77});
                expect(result).toEqual(77.9);
            });
            it("should calculate \"a\"+3 -> \"a3\"", () => {
                let result = interpreter.evaluate("\"a\"+3");
                expect(result).toEqual("a3");
            });
        });

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

        describe("Comparison", () => {
            it("should evaluate a>b with context {a:4.1,b:4} -> true", () => {
                let result = interpreter.evaluate("a>b",{a:4.1,b:4});
                expect(result).toEqual(true);
            });
            it("should evaluate a>b with context {a:2,b:4} -> false", () => {
                let result = interpreter.evaluate("a > b",{a:2,b:4});
                expect(result).toEqual(false);
            });
            it("should evaluate a+b > c+d with {a:5,b:4,c:3,d:5} -> true", () => {
                let result = interpreter.evaluate("a+b > c+d",{a:5,b:4,c:3,d:5});
                expect(result).toEqual(true);
            });
            it("should evaluate a+b>c+d with {a:5,b:4,c:6,d:5} -> false", () => {
                let result = interpreter.evaluate("a+b > c+d",{a:5,b:4,c:6,d:5});
                expect(result).toEqual(false);
            });
            it("should evaluate a+b>8.9 with {a:5,b:4} -> true", () => {
                let result = interpreter.evaluate("a+b>8.9",{a:5,b:4});
                expect(result).toEqual(true);
            });
            it("should evaluate c + d > 8.1 with {c:4,d:5} -> true", () => {
                let result = interpreter.evaluate("c + d > 8.1",{c:4,d:5});
                expect(result).toEqual(true);
            });
        });

        describe("Logical", () => {
            it("should evaluate true and true -> true", () => {
                let result = interpreter.evaluate("true and true");
                expect(result).toEqual(true);
            });
            it("should evaluate true and false -> false", () => {
                let result = interpreter.evaluate("true and false");
                expect(result).toEqual(false);
            });
            it("should evaluate true or false -> true", () => {
                let result = interpreter.evaluate("true or false");
                expect(result).toEqual(true);
            });
            it("should evaluate a+b>8.9 and c+d>8.1 with {a:5,b:4,c:4,d:5} -> true", () => {
                let result = interpreter.evaluate("(a+b)>(8.9) and (c+d)>(8.1)",{a:5,b:4,c:4,d:5});
                expect(result).toEqual(true);
            });
            it("should evaluate a+b>11 or c+d>8.1 with {a:5,b:4,c:3,d:5} -> true", () => {
                let result = interpreter.evaluate("a+b>11 or c+d>8.1",{a:5,b:4,c:4,d:5});
                expect(result).toEqual(true);
            });
            it("should evaluate a+b>11 and c+d>8.1 with {a:5,b:4,c:3,d:5} -> false", () => {
                let result = interpreter.evaluate("a+b>11 and c+d>8.1",{a:5,b:4,c:3,d:5});
                expect(result).toEqual(false);
            });
        });

        describe("IF expression", () => {
            it("should evaluate if 1 > 2 then 3 else 4 -> 4", () => {
                let result = interpreter.evaluate("if 1 > 2 then 3 else 4");
                expect(result).toEqual(4);
            });
            it("should evaluate if a>b then c+4 else d with context {a:3,b:2,c:5.1,d:4} -> 9.1", () => {
                let result = interpreter.evaluate("if a>b then c+4 else d",{a:3,b:2,c:5.1,d:4});
                expect(result).toEqual(9.1);
            });
        });

        describe("Context", () => {
            it("should evaluate {} to javascript object -> {}", () => {
                let result = interpreter.evaluate("{}");
                expect(result).toEqual({});
            });
            it("should evaluate {a:3} -> {a:3}", () => {
                let result = interpreter.evaluate("{a:3}");
                expect(result).toEqual({a:3});
            });
            it("should evaluate {\"a\":3} -> {a:3}", () => {
                let result = interpreter.evaluate("{\"a\":3}");
                expect(result).toEqual({a:3});
            });
            it("should evaluate {\"with white space\":3} -> {\"with white space\":3}", () => {
                let result = interpreter.evaluate("{\"with white space\":3}");
                expect(result).toEqual({"with white space":3});
            });
            it("should evaluate {a:3,deep:{b:2,more:{d:5},c:4}} -> {a:3,deep:{b:2,more:{d:5},c:4}}", () => {
                let result = interpreter.evaluate("{a:3,deep:{b:2,more:{d:5},c:4}}");
                expect(result).toEqual({a:3,deep:{b:2,more:{d:5},c:4}});
            });
            it("should evaluate {a:b} with context {b:3} -> {a:3}", () => {
                let result = interpreter.evaluate("{a:b}",{b:3});
                expect(result).toEqual({a:3});
            });
            it("should evaluate {a:3,deep:{b:2,more:{d:2+b},c:4}} with context {b:5} -> {a:3,deep:{b:2,more:{d:7},c:4}}", () => {
                let result = interpreter.evaluate("{a:3,deep:{b:2,more:{d:2+b},c:4}}",{b:5});
                expect(result).toEqual({a:3,deep:{b:2,more:{d:7},c:4}});
            });
            it("should evaluate [{a:\"p1\",b:1},{a:\"p2\",b:2}].a -> [\"p1\",\"p2\"]", () => {
                let result = interpreter.evaluate("[{a:\"p1\",b:1},{a:\"p2\",b:2}].a");
                expect(result).toEqual(["p1","p2"]);
            });
        });

    });

});
