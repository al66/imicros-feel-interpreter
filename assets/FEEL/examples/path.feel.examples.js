const tests = [
    // add tests from file ../test/interpreter.path.spec.js here
    {
        expression: "deep.a",
        data: { deep: { a: 3 } },
        result: 3
    },
    {
        expression: "{a:3}.a",
        data: {},
        result: 3
    },
    {
        expression: "deep.a.b",
        data: { deep: { a: { b: 3 } } },
        result: 3
    },
    {
        expression: "deep.a.b + deep.c",
        data: { deep: { a: { b: 3 }, c: 2 } },
        result: 5
    }
];

module.exports = {
    tests
};