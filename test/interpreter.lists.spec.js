"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Filter expression", () => {
        it("should evaluate [1,2,3,4][2] -> 2", () => {
            let result = interpreter.evaluate("[1,2,3,4][2]");
            expect(result).toEqual(2);
        });
        it("should evaluate [1,2,3,4][0] -> null", () => {
            let result = interpreter.evaluate("[1,2,3,4][0]");
            expect(result).toBeNull();
        });
        it("should evaluate [1,2,3,4][-1] -> 3", () => {
            let result = interpreter.evaluate("[1,2,3,4][-1]");
            expect(result).toEqual(3);
        });
        it("should evaluate [1,2,3,4][-3] -> 1", () => {
            let result = interpreter.evaluate("[1,2,3,4][-3]");
            expect(result).toEqual(1);
        });
        it("should evaluate [1,2,3,4][-0] -> 4", () => {
            let result = interpreter.evaluate("[1,2,3,4][-0]");
            expect(result).toEqual(4);
        });
        it("should evaluate [1,2,3,4][-5] -> null", () => {
            let result = interpreter.evaluate("[1,2,3,4][-5]");
            expect(result).toBeNull();
        });
        it("should evaluate [1,2,3,4][-(3-2)] -> 3", () => {
            let result = interpreter.evaluate("[1,2,3,4][-(3-2)]");
            expect(result).toEqual(3);
        });
        it("should evaluate [1,2,3,4][a] with context {a:-2} -> 2", () => {
            let result = interpreter.evaluate("[1,2,3,4][a]",{a:-2});
            expect(result).toEqual(2);
        });
        it("should evaluate [1,[5,6],3,4][2] -> [5,6]", () => {
            let result = interpreter.evaluate("[1,[5,6],3,4][2]");
            expect(result).toEqual([5,6]);
        });
        it("should evaluate [{a:4},{b:3},{c:2},{d:1}][2] -> {b:3}", () => {
            let result = interpreter.evaluate("[{a:4},{b:3},{c:2},{d:1}][2]");
            expect(result).toEqual({b:3});
        });
        it("should evaluate [1,2,3,4][item > 2] -> [3,4]", () => {
            let result = interpreter.evaluate("[1,2,3,4][item > 2]");
            expect(result).toEqual([3,4]);
        });
        it("should evaluate [1,2,3,4][item = 2] -> [2]", () => {
            let result = interpreter.evaluate("[1,2,3,4][item = 2]");
            expect(result).toEqual([2]);
        });
        it("should evaluate [1,2,3,4][item + 1 = 3] -> [2]", () => {
            let result = interpreter.evaluate("[1,2,3,4][item + 1 = 3]");
            expect(result).toEqual([2]);
        });
        it("should evaluate [1,2,3,4,5,6,7,8,9][a*(item+1)=6] with {a:2}-> [2]", () => {
            let result = interpreter.evaluate("[1,2,3,4,5,6,7,8,9][a*(item+1)=6]",{a:2});
            expect(result).toEqual([2]);
        });
        it("should evaluate [1,2,3,4][item > 5] -> []", () => {
            let result = interpreter.evaluate("[1,2,3,4][item > 5]");
            expect(result).toEqual([]);
        });
        it("should evaluate [1,2,3,4][even(item)] -> [2,4]", () => {
            let result = interpreter.evaluate("[1,2,3,4][even(item)]");
            expect(result).toEqual([2,4]);
        });
        it('should evaluate flight list[item.status = "cancelled"].flight number -> [234]', () => {
            let result = interpreter.evaluate('flight list[item.status = "cancelled"].flight number', {"flight list": [{ "flight number": 123, status: "boarding"},{ "flight number": 234, status: "cancelled"}]});
            expect(result).toEqual([234]);
        });
    });

    describe("List functions", () => {
        it("should evaluate list contains([1,2,3,4],2) -> true", () => {
            let result = interpreter.evaluate("list contains([1,2,3,4],2)");
            expect(result).toEqual(true);
        });
        it("should evaluate count([1,2,3,4]) -> 4", () => {
            let result = interpreter.evaluate("count([1,2,3,4])");
            expect(result).toEqual(4);
        });
        it("should evaluate min([1,2,3,4]) -> 1", () => {
            let result = interpreter.evaluate("min([1,2,3,4])");
            expect(result).toEqual(1);
        });
        it("should evaluate min(1,2,3,4) -> 1", () => {
            let result = interpreter.evaluate("min(1,2,3,4)");
            expect(result).toEqual(1);
        });
        it("should evaluate max([1,2,3,4]) -> 4", () => {
            let result = interpreter.evaluate("max([1,2,3,4])");
            expect(result).toEqual(4);
        });
        it("should evaluate max(1,2,3,4) -> 4", () => {
            let result = interpreter.evaluate("max(1,2,3,4)");
            expect(result).toEqual(4);
        });
        it("should evaluate sum([1,2,3,4]) -> 10", () => {
            let result = interpreter.evaluate("sum([1,2,3,4])");
            expect(result).toEqual(10);
        });
        it("should evaluate sum(1,2,3,4) -> 10", () => {
            let result = interpreter.evaluate("sum(1,2,3,4)");
            expect(result).toEqual(10);
        });
        it("should evaluate product([1,2,3,4]) -> 24", () => {
            let result = interpreter.evaluate("product([1,2,3,4])");
            expect(result).toEqual(24);
        });
        it("should evaluate product(1,2,3,4) -> 24", () => {
            let result = interpreter.evaluate("product(1,2,3,4)");
            expect(result).toEqual(24);
        });
        it("should evaluate mean([1,2,3,4]) -> 2.5", () => {
            let result = interpreter.evaluate("mean([1,2,3,4])");
            expect(result).toEqual(2.5);
        });
        it("should evaluate mean(1,2,3,4) -> 2.5", () => {
            let result = interpreter.evaluate("mean(1,2,3,4)");
            expect(result).toEqual(2.5);
        });

        it("should evaluate stddev([23,4,6,457,65,7,45,8]) -> 145.13565852332775", () => {
            let result = interpreter.evaluate("stddev([23, 4, 6, 457, 65, 7, 45, 8])");
            expect(result).toEqual(145.13565852332775);
        });
        it("should evaluate stddev([1,2,3,4,5]) -> 1.4142135623730951", () => {
            let result = interpreter.evaluate("stddev([1,2,3,4,5])");
            expect(result).toEqual(1.4142135623730951);
        });
        it("should evaluate stddev(1,2,3,4,5) -> 1.4142135623730951", () => {
            let result = interpreter.evaluate("stddev(1,2,3,4,5)");
            expect(result).toEqual(1.4142135623730951);
        });

        it("should evaluate all(false,true) -> false", () => {
            let result = interpreter.evaluate("all(false,true)");
            expect(result).toEqual(false);
        });
        it("should evaluate all([false,true]) -> false", () => {
            let result = interpreter.evaluate("all([false,true])");
            expect(result).toEqual(false);
        });
        it("should evaluate all([true]) -> true", () => {
            let result = interpreter.evaluate("all([true])");
            expect(result).toEqual(true);
        });
        it("should evaluate all([]) -> true", () => {
            let result = interpreter.evaluate("all([])");
            expect(result).toEqual(true);
        });

        it("should evaluate any(false,true) -> true", () => {
            let result = interpreter.evaluate("any(false,true)");
            expect(result).toEqual(true);
        });
        it("should evaluate any([false,true]) -> true", () => {
            let result = interpreter.evaluate("any([false,true])");
            expect(result).toEqual(true);
        });
        it("should evaluate any([true]) -> true", () => {
            let result = interpreter.evaluate("any([true])");
            expect(result).toEqual(true);
        });
        it("should evaluate any([]) -> false", () => {
            let result = interpreter.evaluate("any([])");
            expect(result).toEqual(false);
        });

    });


});
