const tests = [
    // add tests from file ../test/interpreter.comparison.spec.js here
    {
        expression: "5 = 5",
        data: {},
        result: true
    },
    {
        expression: "5 != 5",
        data: {},
        result: false
    },
    {
        expression: "null = null",
        data: {},
        result: true
    },
    {
        expression: "{x:null}.x = null",
        data: {},
        result: true
    },
    {
        expression: "{}.y = null",
        data: {},
        result: true
    },
    {
        expression: "a>b",
        data: { a: 4.1, b: 4 },
        result: true
    },
    {
        expression: "a > b",
        data: { a: 2, b: 4 },
        result: false
    },
    {
        expression: "a+b > c+d",
        data: { a: 5, b: 4, c: 3, d: 5 },
        result: true
    },
    {
        expression: "a+b > c+d",
        data: { a: 5, b: 4, c: 6, d: 5 },
        result: false
    },
    {
        expression: "a+b>8.9",
        data: { a: 5, b: 4 },
        result: true
    },
    {
        expression: "c + d > 8.1",
        data: { c: 4, d: 5 },
        result: true
    },
    {
        expression: 'date("2022-04-05") < date("2022-04-06")',
        data: {},
        result: true
    },
    {
        expression: 'date and time("2022-04-05T23:59:59") < date("2022-04-06")',
        data: {},
        result: true
    },
    {
        expression: 'date and time("2022-04-15T08:00:00") = date and time("2022-04-15T00:00:00") + @"PT8H"',
        data: {},
        result: true
    },
    {
        expression: 'date("2022-04-05") + @"P2D" > date("2022-04-06")',
        data: {},
        result: true
    },
    {
        expression: '@"P5D" > @"P2D"',
        data: {},
        result: true
    },
    {
        expression: '@"P5D" > @"P4DT23H"',
        data: {},
        result: true
    },
    {
        expression: '@"P5D" = @"P4DT24H"',
        data: {},
        result: true
    },
    {
        expression: '5 in [0..9]',
        data: {},
        result: true
    },
    {
        expression: 'a in [0..9)',
        data: { a: 8 },
        result: true
    },
    {
        expression: 'a in [0..9)',
        data: { a: 9 },
        result: false
    },
    {
        expression: 'date("2022-04-05") in [date("2022-04-04")..date("2022-04-06")]',
        data: {},
        result: true
    },
    {
        expression: '(date("2022-04-01")+duration("P3D")) in [date("2022-04-04")..date("2022-04-06")]',
        data: {},
        result: true
    },
    {
        expression: '5 between 3 and 7',
        data: {},
        result: true
    },
    {
        expression: 'date("2022-04-05") between date("2022-04-04") and date("2022-04-06")',
        data: {},
        result: true
    }
];

module.exports = {
    tests
};