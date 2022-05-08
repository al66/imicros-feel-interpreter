"use strict";

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Ranges", () => {
        it("should evaluate before(a,b) with context {a:2,b:10} -> true", () => {
            let result = interpreter.evaluate("before(a,b)",{a:2,b:10});
            expect(result).toEqual(true);
        });
        it(`should evaluate before(@"2022-05-08",@"2022-05-09") -> true`, () => {
            let result = interpreter.evaluate(`before(@"2022-05-08",@"2022-05-09")`);
            expect(result).toEqual(true);
        });
        it("should evaluate before(a,[b..c]) with context {a:2,b:3,c:6} -> true", () => {
            let result = interpreter.evaluate("before(a,[b..c])",{a:2,b:3,c:6});
            expect(result).toEqual(true);
        });
        it("should evaluate before(5,(5..10]) -> true", () => {
            let result = interpreter.evaluate("before(5,(5..10])");
            expect(result).toEqual(true);
        });
        it("should evaluate before([5..10],11) -> true", () => {
            let result = interpreter.evaluate("before([5..10],11)");
            expect(result).toEqual(true);
        });
        it("should evaluate before([5..10),10) -> true", () => {
            let result = interpreter.evaluate("before([5..10),10)");
            expect(result).toEqual(true);
        });
        it("should evaluate before([5..10],[11..15]) -> true", () => {
            let result = interpreter.evaluate("before([5..10],[11..15])");
            expect(result).toEqual(true);
        });
        it("should evaluate before([5..10),[10..15]) -> true", () => {
            let result = interpreter.evaluate("before([5..10),[10..15])");
            expect(result).toEqual(true);
        });

        it("should evaluate after(8,1) -> true", () => {
            let result = interpreter.evaluate("after(8,1)");
            expect(result).toEqual(true);
        });
        it("should evaluate after(1,8) -> false", () => {
            let result = interpreter.evaluate("after(1,8)");
            expect(result).toEqual(false);
        });
        it("should evaluate after([5..10],4) -> true", () => {
            let result = interpreter.evaluate("after([5..10],4)");
            expect(result).toEqual(true);
        });
        it("should evaluate after((5..10],5) -> true", () => {
            let result = interpreter.evaluate("after((5..10],5)");
            expect(result).toEqual(true);
        });
        it("should evaluate after(11,[5..10]) -> true", () => {
            let result = interpreter.evaluate("after(11,[5..10])");
            expect(result).toEqual(true);
        });
        it("should evaluate after(10,[5..10)) -> true", () => {
            let result = interpreter.evaluate("after(10,[5..10))");
            expect(result).toEqual(true);
        });
        it("should evaluate after([11..15],[5..10]) -> true", () => {
            let result = interpreter.evaluate("after([11..15],[5..10])");
            expect(result).toEqual(true);
        });
        it("should evaluate after([10..15],[5..10)) -> true", () => {
            let result = interpreter.evaluate("after([10..15],[5..10))");
            expect(result).toEqual(true);
        });

        it("should evaluate meets([10..15],[15..20)) -> true", () => {
            let result = interpreter.evaluate("meets([10..15],[15..20))");
            expect(result).toEqual(true);
        });
        it("should evaluate meets([10..15],[16..20)) -> false", () => {
            let result = interpreter.evaluate("meets([10..15],[16..20))");
            expect(result).toEqual(false);
        });
        it("should evaluate meets([10..15),[15..20)) -> false", () => {
            let result = interpreter.evaluate("meets([10..15),[15..20))");
            expect(result).toEqual(false);
        });
        it(`should evaluate meets([@"2022-05-01"..@"2022-05-15"],[@"2022-05-15"..@"2022-05-31"]) -> true`, () => {
            let result = interpreter.evaluate(`meets([@"2022-05-01"..@"2022-05-15"],[@"2022-05-15"..@"2022-05-31"])`);
            expect(result).toEqual(true);
        });

        it("should evaluate met by([15..20),[10..15]) -> true", () => {
            let result = interpreter.evaluate("met by([15..20),[10..15])");
            expect(result).toEqual(true);
        });
        it("should evaluate met by([16..20),[10..15]) -> false", () => {
            let result = interpreter.evaluate("met by([16..20),[10..15])");
            expect(result).toEqual(false);
        });
        it("should evaluate met by([15..20),[10..15)) -> false", () => {
            let result = interpreter.evaluate("met by([15..20),[10..15))");
            expect(result).toEqual(false);
        });
        it(`should evaluate met by([@"2022-05-15"..@"2022-05-31"],[@"2022-05-01"..@"2022-05-15"]) -> true`, () => {
            let result = interpreter.evaluate(`met by([@"2022-05-15"..@"2022-05-31"],[@"2022-05-01"..@"2022-05-15"])`);
            expect(result).toEqual(true);
        });
    });

});
