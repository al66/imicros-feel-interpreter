"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Filter expression", () => {
        it("should evaluate [[1,2],[3],[4]] -> [[1,2],[3],[4]]", () => {
            let result = interpreter.evaluate("[[1,2],[3],[4]]");
            expect(result).toEqual([[1,2],[3],[4]]);
        });
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
        it(`should evaluate median(8,2,5,3,4) -> 4`, () => {
            let result = interpreter.evaluate(`median(8,2,5,3,4)`);
            expect(result).toEqual(4);
        });
        it(`should evaluate median([6,1,2,3]) -> 2.5`, () => {
            let result = interpreter.evaluate(`median([6,1,2,3])`);
            expect(result).toEqual(2.5);
        });
        it(`should evaluate median([]) -> null`, () => {
            let result = interpreter.evaluate(`median([])`);
            expect(result).toEqual(null);
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
        it("should evaluate mode([6, 1, 9, 6, 1]) -> [1,6]", () => {
            let result = interpreter.evaluate("mode([6, 1, 9, 6, 1])");
            expect(result).toEqual([1,6]);
        });
        it("should evaluate mode(6, 3, 9, 6, 6) -> [6]", () => {
            let result = interpreter.evaluate("mode(6, 3, 9, 6, 6)");
            expect(result).toEqual([6]);
        });
        it("should evaluate mode([]) -> []", () => {
            let result = interpreter.evaluate("mode([])");
            expect(result).toEqual([]);
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
        it("should evaluate sublist([1,2,3,4,5],2) -> [2,3,4,5]", () => {
            let result = interpreter.evaluate("sublist([1,2,3,4,5],2)");
            expect(result).toEqual([2,3,4,5]);
        });
        it("should evaluate sublist([1,2,3,4,5],2,2) -> [2,3]", () => {
            let result = interpreter.evaluate("sublist([1,2,3,4,5],2,2)");
            expect(result).toEqual([2,3]);
        });
        it(`should evaluate append(["a","b"],"c","d") -> ["a","b","c","d"]`, () => {
            let result = interpreter.evaluate(`append(["a","b"],"c","d")`);
            expect(result).toEqual(["a","b","c","d"]);
        });
        it("should evaluate concatenate([1,2],[3],[4]) -> [1,2,3,4]", () => {
            let result = interpreter.evaluate("concatenate([1,2],[3],[4])");
            expect(result).toEqual([1,2,3,4]);
        });
        it(`should evaluate insert before(["a","b"],2,"c","d") -> ["a","c","d","b"]`, () => {
            let result = interpreter.evaluate(`insert before(["a","b"],2,"c","d")`);
            expect(result).toEqual(["a","c","d","b"]);
        });
        it(`should evaluate remove(["a","b","c"],2) -> ["a","c"]`, () => {
            let result = interpreter.evaluate(`remove(["a","b","c"],2)`);
            expect(result).toEqual(["a","c"]);
        });
        it(`should evaluate reverse(["a","b","c"]) -> ["c","b","a"]`, () => {
            let result = interpreter.evaluate(`reverse(["a","b","c"])`);
            expect(result).toEqual(["c","b","a"]);
        });
        it(`should evaluate index of(["a","b","c","b"],"b") -> [2,4]`, () => {
            let result = interpreter.evaluate(`index of(["a","b","c","b"],"b")`);
            expect(result).toEqual([2,4]);
        });
        it("should evaluate union([1,2],[3,4],[5,6]) -> [1,2,3,4,5,6]", () => {
            let result = interpreter.evaluate("union([1,2],[3,4],[5,6])");
            expect(result).toEqual([1,2,3,4,5,6]);
        });
        it("should evaluate distinct values([1,2,3,2,1]) -> [1,2,3]", () => {
            let result = interpreter.evaluate("distinct values([1,2,3,2,1])");
            expect(result).toEqual([1,2,3]);
        });
        it("should evaluate flatten([[1,2],[[3]],4]) -> [1,2,3,4]", () => {
            let result = interpreter.evaluate("flatten([[1,2],[[3]],4])");
            expect(result).toEqual([1,2,3,4]);
        });
        it("should evaluate sort(list: [3,1,4,5,2], precedes: function(x,y) x < y)  -> [1,2,3,4,5]", () => {
            let result = interpreter.evaluate("sort(list: [3,1,4,5,2], precedes: function(x,y) x < y)");
            expect(result).toEqual([1,2,3,4,5]);
        });
        it("should evaluate sort([3,1,4,5,2], function(a,b) a < b)  -> [1,2,3,4,5]", () => {
            let result = interpreter.evaluate("sort([3,1,4,5,2], function(x,y) x < y)");
            expect(result).toEqual([1,2,3,4,5]);
        });
        it(`should evaluate string join(["a","b","c"]) -> "abc"`, () => {
            let result = interpreter.evaluate(`string join(["a","b","c"])`);
            expect(result).toEqual("abc");
        });
        it(`should evaluate string join(["a","b","c"],", ") -> "a, b, c"`, () => {
            let result = interpreter.evaluate(`string join(["a","b","c"],", ")`);
            expect(result).toEqual("a, b, c");
        });
        it(`should evaluate string join(["a"],"_") -> "a"`, () => {
            let result = interpreter.evaluate(`string join(["a"],"_")`);
            expect(result).toEqual("a");
        });
        it(`should evaluate string join(["a","b","c"],", ","[","]") -> "[a, b, c]"`, () => {
            let result = interpreter.evaluate(`string join(["a","b","c"],", ","[","]")`);
            expect(result).toEqual("[a, b, c]");
        });
        it(`should evaluate string join(["a",null,"c"]) -> "ac"`, () => {
            let result = interpreter.evaluate(`string join(["a",null,"c"])`);
            expect(result).toEqual("ac");
        });
        it(`should evaluate string join([]) -> ""`, () => {
            let result = interpreter.evaluate(`string join([])`);
            expect(result).toEqual("");
        });

    });


});
