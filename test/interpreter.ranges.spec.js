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

        it("should evaluate overlaps([5..10],[1..6]) -> true", () => {
            let result = interpreter.evaluate("overlaps([5..10),[1..6])");
            expect(result).toEqual(true);
        });
        it("should evaluate overlaps((3..7],[1..4]) -> true", () => {
            let result = interpreter.evaluate("overlaps((3..7],[1..4])");
            expect(result).toEqual(true);
        });
        it("should evaluate overlaps([1..3],(3..6]) -> false", () => {
            let result = interpreter.evaluate("overlaps([1..3],(3..6])");
            expect(result).toEqual(false);
        });
        it("should evaluate overlaps((5..8],[1..5]) -> false", () => {
            let result = interpreter.evaluate("overlaps((5..8],[1..5])");
            expect(result).toEqual(false);
        });
        it("should evaluate overlaps([4..10],[1..5)) -> true", () => {
            let result = interpreter.evaluate("overlaps([4..10],[1..5))");
            expect(result).toEqual(true);
        });

        it("should evaluate overlaps before([1..5],[4..10]) -> true", () => {
            let result = interpreter.evaluate("overlaps before([1..5],[4..10])");
            expect(result).toEqual(true);
        });
        it("should evaluate overlaps before([3..4],[1..2]) -> false", () => {
            let result = interpreter.evaluate("overlaps before([3..4],[1..2])");
            expect(result).toEqual(false);
        });
        it("should evaluate overlaps before([1..3],(3..5]) -> false", () => {
            let result = interpreter.evaluate("overlaps before([1..3],(3..5])");
            expect(result).toEqual(false);
        });
        it("should evaluate overlaps before([1..5),(3..8]) -> true", () => {
            let result = interpreter.evaluate("overlaps before([1..5),(3..8])");
            expect(result).toEqual(true);
        });
        it("should evaluate overlaps before([1..5),[5..10]) -> false", () => {
            let result = interpreter.evaluate("overlaps before([1..5),[5..10])");
            expect(result).toEqual(false);
        });

        it("should evaluate overlaps after([4..10],[1..5]) -> true", () => {
            let result = interpreter.evaluate("overlaps after([4..10],[1..5])");
            expect(result).toEqual(true);
        });
        it("should evaluate overlaps after([1..2],[3..4]) -> false", () => {
            let result = interpreter.evaluate("overlaps after([1..2],[3..4])");
            expect(result).toEqual(false);
        });
        it("should evaluate overlaps after([3..5],[1..3)) -> false", () => {
            let result = interpreter.evaluate("overlaps after([3..5],[1..3))");
            expect(result).toEqual(false);
        });
        it("should evaluate overlaps after((5..8],[1..5)) -> false", () => {
            let result = interpreter.evaluate("overlaps after((5..8],[1..5))");
            expect(result).toEqual(false);
        });
        it("should evaluate overlaps after([4..10],[1..5)) -> true", () => {
            let result = interpreter.evaluate("overlaps after([4..10],[1..5))");
            expect(result).toEqual(true);
        });    

        it("should evaluate finishes(5,[1..5]) -> true", () => {
            let result = interpreter.evaluate("finishes(5,[1..5])");
            expect(result).toEqual(true);
        });
        it("should evaluate finishes(6,[3..4]) -> false", () => {
            let result = interpreter.evaluate("finishes(6,[3..4])");
            expect(result).toEqual(false);
        });
        it("should evaluate finishes([3..5],[1..5]) -> true", () => {
            let result = interpreter.evaluate("finishes([3..5],[1..5])");
            expect(result).toEqual(true);
        });
        it("should evaluate finishes([1..5],[1..5)) -> false", () => {
            let result = interpreter.evaluate("finishes([1..5],[1..5))");
            expect(result).toEqual(false);
        });
        it("should evaluate finishes([4..10),[1..10)) -> true", () => {
            let result = interpreter.evaluate("finishes([4..10),[1..10))");
            expect(result).toEqual(true);
        });
        
        it("should evaluate finished by([1..5],5) -> true", () => {
            let result = interpreter.evaluate("finished by([1..5],5)");
            expect(result).toEqual(true);
        });
        it("should evaluate finished by([3..4],6) -> false", () => {
            let result = interpreter.evaluate("finished by([3..4],6)");
            expect(result).toEqual(false);
        });
        it("should evaluate finished by([1..5],[3..5]) -> true", () => {
            let result = interpreter.evaluate("finished by([1..5],[3..5])");
            expect(result).toEqual(true);
        });
        it("should evaluate finished by([1..5),[1..5]) -> false", () => {
            let result = interpreter.evaluate("finished by([1..5),[1..5])");
            expect(result).toEqual(false);
        });
        it("should evaluate finished by([1..10),[4..10)) -> true", () => {
            let result = interpreter.evaluate("finished by([1..10),[4..10))");
            expect(result).toEqual(true);
        });

        it("should evaluate includes([1..5],5) -> true", () => {
            let result = interpreter.evaluate("includes([1..5],5)");
            expect(result).toEqual(true);
        });
        it("should evaluate includes([3..4],6) -> false", () => {
            let result = interpreter.evaluate("includes([3..4],6)");
            expect(result).toEqual(false);
        });
        it("should evaluate includes([1..10],[3..5]) -> true", () => {
            let result = interpreter.evaluate("includes([1..10],[3..5])");
            expect(result).toEqual(true);
        });
        it("should evaluate includes([1..5),[3..5]) -> false", () => {
            let result = interpreter.evaluate("includes([1..5),[3..5])");
            expect(result).toEqual(false);
        });
        it("should evaluate includes([1..10),[1..5)) -> true", () => {
            let result = interpreter.evaluate("includes([1..10),[1..5))");
            expect(result).toEqual(true);
        });

        it("should evaluate during(5,[1..10]) -> true", () => {
            let result = interpreter.evaluate("during(5,[1..10])");
            expect(result).toEqual(true);
        });
        it("should evaluate during(6,[3..4]) -> false", () => {
            let result = interpreter.evaluate("during(6,[3..4])");
            expect(result).toEqual(false);
        });
        it("should evaluate during(1,(1..5]) -> false", () => {
            let result = interpreter.evaluate("during(1,(1..5])");
            expect(result).toEqual(false);
        });
        it("should evaluate during([2..5],[1..6)) -> true", () => {
            let result = interpreter.evaluate("during([2..5],[1..6))");
            expect(result).toEqual(true);
        });
        it("should evaluate during((4..5),(4..10)) -> true", () => {
            let result = interpreter.evaluate("during((4..5),(4..10))");
            expect(result).toEqual(true);
        });

        it("should evaluate starts(1,[1..10]) -> true", () => {
            let result = interpreter.evaluate("starts(1,[1..10])");
            expect(result).toEqual(true);
        });
        it("should evaluate starts(3,(3..4]) -> false", () => {
            let result = interpreter.evaluate("starts(3,(3..4])");
            expect(result).toEqual(false);
        });
        it("should evaluate starts((1..5],[1..5]) -> false", () => {
            let result = interpreter.evaluate("starts((1..5],[1..5])");
            expect(result).toEqual(false);
        });
        it("should evaluate starts([1..5],[1..6)) -> true", () => {
            let result = interpreter.evaluate("starts([1..5],[1..6))");
            expect(result).toEqual(true);
        });
        it("should evaluate starts((4..5),(4..10)) -> true", () => {
            let result = interpreter.evaluate("starts((4..5),(4..10))");
            expect(result).toEqual(true);
        });

        it("should evaluate started by([1..10],1) -> true", () => {
            let result = interpreter.evaluate("started by([1..10],1)");
            expect(result).toEqual(true);
        });
        it("should evaluate started by((3..4],3) -> false", () => {
            let result = interpreter.evaluate("started by((3..4],3)");
            expect(result).toEqual(false);
        });
        it("should evaluate started by((1..5],[1..5]) -> false", () => {
            let result = interpreter.evaluate("started by((1..5],[1..5])");
            expect(result).toEqual(false);
        });
        it("should evaluate started by([1..5],[1..6)) -> true", () => {
            let result = interpreter.evaluate("started by([1..5],[1..6))");
            expect(result).toEqual(true);
        });
        it("should evaluate started by((4..5),(4..10)) -> true", () => {
            let result = interpreter.evaluate("started by((4..5),(4..10))");
            expect(result).toEqual(true);
        });

        it("should evaluate coinsides(1,1) -> true", () => {
            let result = interpreter.evaluate("coinsides(1,1)");
            expect(result).toEqual(true);
        });
        it("should evaluate coinsides(2,3) -> false", () => {
            let result = interpreter.evaluate("coinsides(2,3)");
            expect(result).toEqual(false);
        });
        it("should evaluate coinsides((1..5],[1..5]) -> false", () => {
            let result = interpreter.evaluate("coinsides((1..5],[1..5])");
            expect(result).toEqual(false);
        });
        it("should evaluate coinsides([1..5],[1..5]) -> true", () => {
            let result = interpreter.evaluate("coinsides([1..5],[1..5])");
            expect(result).toEqual(true);
        });
        it("should evaluate coinsides((4..5),(4..5)) -> true", () => {
            let result = interpreter.evaluate("coinsides((4..5),(4..5))");
            expect(result).toEqual(true);
        });

    });

});
