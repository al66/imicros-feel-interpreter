const tests = [
    // add tests from file ../test/interpreter.context.spec.js here
    {
        expression: "{}",
        data: {},
        result: {}
    },
    {
        expression: `{a:3}`,
        data: {},
        result: { a:3 }
    },
    {
        expression: "{\"a\":3}",
        data: {},
        result: { a:3 }
    },
    {
        expression: "{\"with white space\":3}",
        data: {},
        result: {"with white space":3}
    },
    {
        expression: "{a:3,deep:{b:2,more:{d:5},c:4}}",
        data: {},
        result: {a:3,deep:{b:2,more:{d:5},c:4}}
    },
    {
        expression: "{ a: 2, b: a * 2 }",
        data: {},
        result: { a: 2, b: 4 }
    },
    {
        expression: "{a:1, b:2, c:3}",
        data: {},
        result: { a: 1, b: 2, c: 3 }
    },
    {
        expression: "{a:1, b:2, c:3}.a",
        data: {},
        result: 1
    },
    {
        expression: "{a:1, b:2, c:3}.d",
        data: {},
        result: null
    },
    {
        expression: "{a:1, b:2, c:3}.b",
        data: {},
        result: 2
    },
    {
        expression: "{a:1, b:2, c:3}.c",
        data: {},
        result: 3
    },
    {
        expression: "{a:3,deep:{b:2,more:{d:5},c:4}}",
        data: {},
        result: {a:3,deep:{b:2,more:{d:5},c:4}}
    },
    {
        expression: "{a:b}",
        data: {b:3},
        result: {a:3}
    },
    {
        expression: "{a:3,deep:{b:2,more:{d:2+b+x},c:4}}",
        data: {x:3},
        result: {a:3,deep:{b:2,more:{d:7},c:4}}
    },
    {
        expression: "[{a:\"p1\",b:1},{a:\"p2\",b:2}].a",
        data: {},
        result: ["p1","p2"]
    },
    {
        expression: "[{a:3,b:1},{a:4,b:2}][item.a > 3]",
        data: {},
        result: [{a:4,b:2}]
    },


    {
        expression: "get value({a:3},key)",
        data: { key: "a" },
        result: 3
    },
    {
        expression: "get value(context,key)",
        data: { context: {a:1, b:2, c:3}, key: "b" },
        result: 2
    },
    {
        expression: "get value({a:1, b:2, c:3},key)",
        data: { key: "b" },
        result: 2
    },
    {
        expression: "get value({a:1, b:2, c:3},\"not a key\")",
        data: {},
        result: null
    },
    {
        expression: "get value({a:1, b:2, c:3},key)",
        data: { key: "not a key" },
        result: null
    },
    {
        expression: 'get value(key: "a",context: {a:3})',
        data: {},
        result: 3
    },
    {
        expression: 'get entries({a:3})',
        data: {},
        result: [{ key: "a", value: 3 }]
    },
    {
        expression: 'put({a:3},"b",4).b',
        data: {},
        result: 4
    },
    {
        expression: 'put all({a:3},{b:4},{c:5})',
        data: {},
        result: {a:3, b:4, c:5}
    }
];

module.exports = {
    tests
};