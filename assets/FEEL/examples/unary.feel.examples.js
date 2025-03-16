const tests = [
    // add tests from file ../test/interpreter.unary.spec.js here
    {
        expression: "5 in -",
        data: {},
        result: true
    },
    {
        expression: "5 in (-)",
        data: {},
        result: true
    },
    {
        expression: "5 in (<10)",
        data: {},
        result: true
    },
    {
        expression: "5 in (>10)",
        data: {},
        result: false
    },
    {
        expression: "2 in (<3,>10)",
        data: {},
        result: true
    },
    {
        expression: "5 in (<3,>10)",
        data: {},
        result: false
    },
    {
        expression: "5 in (<3,a+b,>10)",
        data: { a: 2, b: 3 },
        result: true
    },
    {
        expression: "a in b",
        data: { a: 3, b: 5 },
        result: false
    },
    {
        expression: "a in b",
        data: { a: 5, b: 5 },
        result: true
    },
    {
        expression: "2 in [1,2,3,4]",
        data: {},
        result: true
    }
];

module.exports = {
    tests
};