const tests = [
    // add tests from file ../test/interpreter.logical.spec.js here
    {
        expression: "true and true",
        data: {},
        result: true
    },
    {
        expression: "true and false",
        data: {},
        result: false
    },
    {
        expression: "true or false",
        data: {},
        result: true
    },
    {
        expression: "true or null",
        data: {},
        result: true
    },
    {
        expression: "(a+b)>(8.9) and (c+d)>(8.1)",
        data: { a: 5, b: 4, c: 4, d: 5 },
        result: true
    },
    {
        expression: "a+b>11 or c+d>8.1",
        data: { a: 5, b: 4, c: 4, d: 5 },
        result: true
    },
    {
        expression: "a+b>11 and c+d>8.1",
        data: { a: 5, b: 4, c: 3, d: 5 },
        result: false
    },
    {
        expression: "not(false)",
        data: {},
        result: true
    },
    {
        expression: "not((a+1) > 4)",
        data: { a: 2 },
        result: true
    },
    {
        expression: "not((a+1) > 4)",
        data: { a: 4 },
        result: false
    },
    {
        expression: `5 = 5 and 6 != 5 and 3 <= 4 and date("2022-05-08") > date("2022-05-07")`,
        data: {},
        result: true
    },
    {
        expression: "{a:5,b:3,result: not(a<b)}.result",
        data: {},
        result: true
    },
    {
        expression: "a instance of b",
        data: { a: 3, b: 5 },
        result: true
    },
    {
        expression: "a instance of b",
        data: { a: 3, b: 0.5 },
        result: true
    },
    {
        expression: 'a instance of b',
        data: { a: "test", b: "this" },
        result: true
    },
    {
        expression: 'a instance of b',
        data: { a: true, b: false },
        result: true
    },
    {
        expression: "a instance of number",
        data: { a: 3 },
        result: true
    },
    {
        expression: "a instance of boolean",
        data: { a: true },
        result: true
    },
    {
        expression: 'a instance of string',
        data: { a: "test" },
        result: true
    },
    {
        expression: "is defined(a)",
        data: { a: 3 },
        result: true
    },
    {
        expression: "is defined(null)",
        data: {},
        result: false
    },
    {
        expression: "is defined({x: null}.x)",
        data: {},
        result: false
    },
    {
        expression: "is defined({}.x)",
        data: {},
        result: false
    },
    {
        expression: "is defined(b)",
        data: { a: 3 },
        result: false
    }
];

module.exports = {
    tests
};