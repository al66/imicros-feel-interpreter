const tests = [
    // add tests from file ../test/interpreter.simple.spec.js here
    {
        expression: "5",
        data: {},
        result: 5
    },
    {
        expression: "5.1",
        data: {},
        result: 5.1
    },
    {
        expression: ".1",
        data: {},
        result: 0.1
    },
    {
        expression: "-5",
        data: {},
        result: -5
    },
    {
        expression: "true",
        data: {},
        result: true
    },
    {
        expression: "false",
        data: {},
        result: false
    },
    {
        expression: "null",
        data: {},
        result: null
    },
    {
        expression: "a",
        data: { a: 7 },
        result: 7
    },
    {
        expression: "a",
        data: { a: 7 },
        result: 7
    },
    {
        expression: "a",
        data: { a: 7 },
        result: 7
    },
    {
        expression: "Bonität",
        data: { "Bonität": 7 },
        result: 7
    },
    {
        expression: "with white space",
        data: { "with white space": 7 },
        result: 7
    },
    {
        expression: "?test var",
        data: { "?test var": 7 },
        result: 7
    },
    {
        expression: `{"Mother's finest":5, "result": 5 + Mother's finest}.result`,
        data: {},
        result: 10
    },
    {
        expression: "_test var",
        data: { "_test var": 7 },
        result: 7
    },
    {
        expression: `{ "new example": 5}.new  example`,
        data: {},
        result: 5
    },
    {
        expression: `{ "new  example": 5}.new example`,
        data: {},
        result: 5
    },
    {
        expression: `date(2022,05,13)`,
        data: {},
        result: "2022-05-13"
    },
    {
        expression: `time(19,48,55)`,
        data: {},
        result: "19:48:55"
    },
    {
        expression: `number("1654.55")`,
        data: {},
        result: 1654.55
    },
    {
        expression: `string(1654.55)`,
        data: {},
        result: "1654.55"
    },
    {
        expression: `string(@"2022-05-13")`,
        data: {},
        result: "2022-05-13"
    },
    {
        expression: `context([{"key":"a", "value":1}, {"key":"b", "value":2}])`,
        data: {},
        result: { a: 1, b: 2 }
    }
];

module.exports = {
    tests
};