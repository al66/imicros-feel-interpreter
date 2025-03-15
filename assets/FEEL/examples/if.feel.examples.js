
const tests = [
    {
        expression: "if 1 > 2 then 3 else 4",
        data: {},
        result: 4
    },
    {
        expression: "if a>b then c+4 else d",
        data: {a:3,b:2,c:5.1,d:4},
        result: 9.1
    }
];

module.exports = {
    tests
};