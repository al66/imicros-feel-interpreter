
const tests = [
    // examples from DMN spec 1.6
    {
        expression: "5 in (<=5 ) ",
        data: {},
        result: true
    },
    {
        expression: "5 in (5..10] ",
        data: {},
        result: false
    },
    {
        expression: "5 in ( (5..10] ) ",
        data: {},
        result: false
    },
    {
        expression: "5 in ( [5..10] )",
        data: {},
        result: true
    },
    {
        expression: "5 in (4, 5, 6)",
        data: {},
        result: true
    },
    {
        expression: "5 in (<5, >5)",
        data: {},
        result: false
    },
    {
        expression: '"2012-12-31" in ( ("2012-12-25".."2013-02-14") )',
        data: {},
        result: true
    },
    {
        expression: 'date("2012-12-31") in ( (date("2012-12-25")..date("2013-02-14")) )',
        data: {},
        result: true
    },
    // add tests from file ../test/interpreter.ranges.spec.js here
    {
        expression: "before(a,b)",
        data: { a: 2, b: 10 },
        result: true
    },
    {
        expression: `before(@"2022-05-08",@"2022-05-09")`,
        data: {},
        result: true
    },
    {
        expression: "before(a,[b..c])",
        data: { a: 2, b: 3, c: 6 },
        result: true
    },
    {
        expression: "before(5,(5..10])",
        data: {},
        result: true
    },
    {
        expression: "before([5..10],11)",
        data: {},
        result: true
    },
    {
        expression: "before([5..10),10)",
        data: {},
        result: true
    },
    {
        expression: "before([5..10],[11..15])",
        data: {},
        result: true
    },
    {
        expression: "before([5..10),[10..15])",
        data: {},
        result: true
    },
    {
        expression: "after(8,1)",
        data: {},
        result: true
    },
    {
        expression: "after(1,8)",
        data: {},
        result: false
    },
    {
        expression: "after([5..10],4)",
        data: {},
        result: true
    },
    {
        expression: "after((5..10],5)",
        data: {},
        result: true
    },
    {
        expression: "after(11,[5..10])",
        data: {},
        result: true
    },
    {
        expression: "after(10,[5..10))",
        data: {},
        result: true
    },
    {
        expression: "after([11..15],[5..10])",
        data: {},
        result: true
    },
    {
        expression: "after([10..15],[5..10))",
        data: {},
        result: true
    },
    {
        expression: "meets([10..15],[15..20))",
        data: {},
        result: true
    },
    {
        expression: "meets([10..15],[16..20))",
        data: {},
        result: false
    },
    {
        expression: "meets([10..15),[15..20))",
        data: {},
        result: false
    },
    {
        expression: `meets([@"2022-05-01"..@"2022-05-15"],[@"2022-05-15"..@"2022-05-31"])`,
        data: {},
        result: true
    },
    {
        expression: "met by([15..20),[10..15])",
        data: {},
        result: true
    },
    {
        expression: "met by([16..20),[10..15])",
        data: {},
        result: false
    },
    {
        expression: "met by([15..20),[10..15))",
        data: {},
        result: false
    },
    {
        expression: `met by([@"2022-05-15"..@"2022-05-31"],[@"2022-05-01"..@"2022-05-15"])`,
        data: {},
        result: true
    },
    {
        expression: "overlaps([5..10],[1..6])",
        data: {},
        result: true
    },
    {
        expression: "overlaps((3..7],[1..4])",
        data: {},
        result: true
    },
    {
        expression: "overlaps([1..3],(3..6])",
        data: {},
        result: false
    },
    {
        expression: "overlaps((5..8],[1..5])",
        data: {},
        result: false
    },
    {
        expression: "overlaps([4..10],[1..5))",
        data: {},
        result: true
    },
    {
        expression: "overlaps before([1..5],[4..10])",
        data: {},
        result: true
    },
    {
        expression: "overlaps before([3..4],[1..2])",
        data: {},
        result: false
    },
    {
        expression: "overlaps before([1..3],(3..5])",
        data: {},
        result: false
    },
    {
        expression: "overlaps before([1..5),(3..8])",
        data: {},
        result: true
    },
    {
        expression: "overlaps before([1..5),[5..10])",
        data: {},
        result: false
    },
    {
        expression: "overlaps after([4..10],[1..5])",
        data: {},
        result: true
    },
    {
        expression: "overlaps after([1..2],[3..4])",
        data: {},
        result: false
    },
    {
        expression: "overlaps after([3..5],[1..3))",
        data: {},
        result: false
    },
    {
        expression: "overlaps after((5..8],[1..5))",
        data: {},
        result: false
    },
    {
        expression: "overlaps after([4..10],[1..5))",
        data: {},
        result: true
    },
    {
        expression: "finishes(5,[1..5])",
        data: {},
        result: true
    },
    {
        expression: "finishes(6,[3..4])",
        data: {},
        result: false
    },
    {
        expression: "finishes([3..5],[1..5])",
        data: {},
        result: true
    },
    {
        expression: "finishes([1..5],[1..5))",
        data: {},
        result: false
    },
    {
        expression: "finishes([4..10),[1..10))",
        data: {},
        result: true
    },
    {
        expression: "finished by([1..5],5)",
        data: {},
        result: true
    },
    {
        expression: "finished by([3..4],6)",
        data: {},
        result: false
    },
    {
        expression: "finished by([1..5],[3..5])",
        data: {},
        result: true
    },
    {
        expression: "finished by([1..5),[1..5])",
        data: {},
        result: false
    },
    {
        expression: "finished by([1..10),[4..10))",
        data: {},
        result: true
    },
    {
        expression: "includes([1..5],5)",
        data: {},
        result: true
    },
    {
        expression: "includes([3..4],6)",
        data: {},
        result: false
    },
    {
        expression: "includes([1..10],[3..5])",
        data: {},
        result: true
    },
    {
        expression: "includes([1..5),[3..5])",
        data: {},
        result: false
    },
    {
        expression: "includes([1..10),[1..5))",
        data: {},
        result: true
    },
    {
        expression: "during(5,[1..10])",
        data: {},
        result: true
    },
    {
        expression: "during(6,[3..4])",
        data: {},
        result: false
    },
    {
        expression: "during(1,(1..5])",
        data: {},
        result: false
    },
    {
        expression: "during([2..5],[1..6))",
        data: {},
        result: true
    },
    {
        expression: "during((4..5),(4..10))",
        data: {},
        result: true
    },
    {
        expression: "starts(1,[1..10])",
        data: {},
        result: true
    },
    {
        expression: "starts(3,(3..4])",
        data: {},
        result: false
    },
    {
        expression: "starts((1..5],[1..5])",
        data: {},
        result: false
    },
    {
        expression: "starts([1..5],[1..6))",
        data: {},
        result: true
    },
    {
        expression: "starts((4..5),(4..10))",
        data: {},
        result: true
    },
    {
        expression: "started by([1..10],1)",
        data: {},
        result: true
    },
    {
        expression: "started by((3..4],3)",
        data: {},
        result: false
    },
    {
        expression: "started by((1..5],[1..5])",
        data: {},
        result: false
    },
    {
        expression: "started by([1..5],[1..6))",
        data: {},
        result: true
    },
    {
        expression: "started by((4..5),(4..10))",
        data: {},
        result: true
    },
    {
        expression: "coincides(1,1)",
        data: {},
        result: true
    },
    {
        expression: "coincides(2,3)",
        data: {},
        result: false
    },
    {
        expression: "coincides((1..5],[1..5])",
        data: {},
        result: false
    },
    {
        expression: "coincides([1..5],[1..5])",
        data: {},
        result: true
    },
    {
        expression: "coincides((4..5),(4..5))",
        data: {},
        result: true
    }
];

module.exports = {
    tests
};