const tests = [
    {
        expression: "{calc:function (a:number,b:number) a+b, y:calc(4,5)+3}",
        data: {},
        result: {y:12}
    },
    {
        expression: "{calc:function (a:number,b:number) a-b, y:calc(b:4,a:5)+3}",
        data: {},
        result: {y:4}
    },
    {
        expression: "{calc:function (a:number,b:number) a-b, y:calc(b:c,a:d)+3}.y",
        data: {c:4,d:5},
        result: 4
    },
    {
        expression: "{calc:function (a:number,b:number) a-b, y:calc(c,d)+3}",
        data: {c:4,d:5},
        result: {y:2}
    }
];

module.exports = {
    tests
};