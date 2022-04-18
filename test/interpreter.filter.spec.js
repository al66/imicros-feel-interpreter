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
    });

});
