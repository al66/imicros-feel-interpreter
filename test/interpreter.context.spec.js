"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

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
        it("should evaluate {a:3,deep:{b:2,more:{d:2+b+x},c:4}} with context {b:5} -> {a:3,deep:{b:2,more:{d:7},c:4}}", () => {
            let result = interpreter.evaluate("{a:3,deep:{b:2,more:{d:2+b+x},c:4}}",{x:3});
            expect(result).toEqual({a:3,deep:{b:2,more:{d:7},c:4}});
        });
        it("should evaluate [{a:\"p1\",b:1},{a:\"p2\",b:2}].a -> [\"p1\",\"p2\"]", () => {
            let result = interpreter.evaluate("[{a:\"p1\",b:1},{a:\"p2\",b:2}].a");
            expect(result).toEqual(["p1","p2"]);
        });
        it("should evaluate [{a:3,b:1},{a:4,b:2}][item.a > 3] -> [{a:4,b:2}]", () => {
            let result = interpreter.evaluate("[{a:3,b:1},{a:4,b:2}][item.a > 3]");
            expect(result).toEqual([{a:4,b:2}]);
        });
    });

    describe("Context - build in functions", () => {
        it('should evaluate get value({a:3},"a") -> 3', () => {
            let result = interpreter.evaluate('get value({a:3},"a")');
            expect(result).toEqual(3);
        });
        it('should evaluate get value(key: "a",context: {a:3}) -> 3', () => {
            let result = interpreter.evaluate('get value(key: "a",context: {a:3})');
            expect(result).toEqual(3);
        });
        it('should evaluate get entries({a:3}) -> [{ key: "a", value: 3 }]', () => {
            let result = interpreter.evaluate('get entries({a:3})');
            expect(result).toEqual([{ key: "a", value: 3 }]);
        });
        it('should evaluate put({a:3},"b",4).b -> 4', () => {
            let result = interpreter.evaluate('put({a:3},"b",4).b');
            expect(result).toEqual(4);
        });
        it('should evaluate put all({a:3},{b:4},{c:5}) -> {a:3, b:4, c:5}', () => {
            let result = interpreter.evaluate('put all({a:3},{b:4},{c:5})');
            expect(result).toEqual({a:3, b:4, c:5});
        });
    })

});
