const tests = [
    // add tests from file ../test/interpreter.arithmetic.spec.js here
    {
        expression: "1 + 1",
        data: {},
        result: 2
    },
    {
        expression: "1 - 1",
        data: {},
        result: 0
    },
    {
        expression: "2 * 3",
        data: {},
        result: 6
    },
    {
        expression: "6 / 3",
        data: {},
        result: 2
    },
    {
        expression: "modulo(12,5)",
        data: {},
        result: 2
    },
    {
        expression: "2 ** 3",
        data: {},
        result: 8
    },
    {
        expression: "-1",
        data: {},
        result: -1
    },
    {
        expression: "a + b",
        data: { a: 1, b: 2 },
        result: 3
    },
    {
        expression: "a - b",
        data: { a: 1, b: 2 },
        result: -1
    },
    {
        expression: "a * b",
        data: { a: 2, b: 3 },
        result: 6
    },
    {
        expression: "a / b",
        data: { a: 6, b: 3 },
        result: 2
    },
    {
        expression: "modulo(a,b)",
        data: { a: 12, b: 5 },
        result: 2
    },
    {
        expression: "a ** b",
        data: { a: 2, b: 3 },
        result: 8
    },
    {
        expression: "-a",
        data: { a: 1 },
        result: -1
    },
    {
        expression: "5+3",
        data: {},
        result: 8
    },
    {
        expression: "5*3",
        data: {},
        result: 15
    },
    {
        expression: "5/a",
        data: { a: 2 },
        result: 2.5
    },
    {
        expression: "1/2**-4-3",
        data: {},
        result: 13
    },
    {
        expression: "a/b**-c-d",
        data: { a: 1, b: 2, c: 4, d: 3 },
        result: 13
    },
    {
        expression: "5 - with white space",
        data: { "with white space": 7 },
        result: -2
    },
    {
        expression: "((9.5)- 8.6 ) + 77",
        data: {},
        result: 77.9
    },
    {
        expression: "((x0)- y0 ) + z0",
        data: { x0: 9.5, y0: 8.6, z0: 77 },
        result: 77.9
    },
    {
        expression: "\"a\"+3",
        data: {},
        result: "a3"
    },
    {
        expression: "decimal(-3.6,0)",
        data: {},
        result: -4
    },
    {
        expression: "decimal(3.216,2)",
        data: {},
        result: 3.22
    },
    {
        expression: "decimal(3.214,2)",
        data: {},
        result: 3.21
    },
    {
        expression: "decimal(1/3,2)",
        data: {},
        result: 0.33
    },
    {
        expression: "floor(-3.6)",
        data: {},
        result: -4
    },
    {
        expression: "floor(-3.05)",
        data: {},
        result: -4
    },
    {
        expression: "floor(45.95)",
        data: {},
        result: 45
    },
    {
        expression: "ceiling(-3.6)",
        data: {},
        result: -3
    },
    {
        expression: "ceiling(-3.05)",
        data: {},
        result: -3
    },
    {
        expression: "ceiling(45.95)",
        data: {},
        result: 46
    },
    {
        expression: "round up(7.4)",
        data: {},
        result: 8
    },
    {
        expression: "round up(-7.4)",
        data: {},
        result: -8
    },
    {
        expression: "round up(1.131,2)",
        data: {},
        result: 1.14
    },
    {
        expression: "round up(-1.131,2)",
        data: {},
        result: -1.14
    },
    {
        expression: "round down(7.8)",
        data: {},
        result: 7
    },
    {
        expression: "round down(-7.8)",
        data: {},
        result: -7
    },
    {
        expression: "round down(1.131,2)",
        data: {},
        result: 1.13
    },
    {
        expression: "round down(-1.137,2)",
        data: {},
        result: -1.13
    },
    {
        expression: "round half up(7.5)",
        data: {},
        result: 8
    },
    {
        expression: "round half up(-7.5)",
        data: {},
        result: -8
    },
    {
        expression: "round half up(1.131,2)",
        data: {},
        result: 1.13
    },
    {
        expression: "round half up(-1.135,2)",
        data: {},
        result: -1.14
    },
    {
        expression: "round half down(7.5)",
        data: {},
        result: 7
    },
    {
        expression: "round half down(-7.5)",
        data: {},
        result: -7
    },
    {
        expression: "round half down(1.135,2)",
        data: {},
        result: 1.13
    },
    {
        expression: "round half down(-1.136,2)",
        data: {},
        result: -1.14
    },
    {
        expression: "abs(-3.5)",
        data: {},
        result: 3.5
    },
    {
        expression: "modulo(17,5)",
        data: {},
        result: 2
    },
    {
        expression: "sqrt(16)",
        data: {},
        result: 4
    },
    {
        expression: "log(10)",
        data: {},
        result: 2.302585092994046
    },
    {
        expression: "exp(2)",
        data: {},
        result: 7.38905609893065
    },
    {
        expression: "odd(3)",
        data: {},
        result: true
    },
    {
        expression: "odd(4)",
        data: {},
        result: false
    },
    {
        expression: "even(4)",
        data: {},
        result: true
    },
    {
        expression: "even(3)",
        data: {},
        result: false
    },
    {
        expression: "0",
        //analyse: true,
        data: {},
        result: 0
    },
    {
        expression: "--10",
        //analyse: true,
        data: {},
        result: 10
    }
];

module.exports = {
    tests
};