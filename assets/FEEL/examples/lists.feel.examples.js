
const tests = [
    {
        expression: "[[1,2],[3],[4]]",
        data: {},
        result: [[1,2],[3],[4]]
    },
    {
        expression: "[1,2,3,4][2]",
        data: {},
        result: 2
    },
    {
        expression: "[1,2,3,4][0]",
        data: {},
        result: null
    },
    {
        expression: "[1,2,3,4][-1]",
        data: {},
        result: 3
    },
    {
        expression: "[1,2,3,4][-3]",
        data: {},
        result: 1
    },
    {
        expression: "[1,2,3,4][-0]",
        data: {},
        result: 4
    },
    {
        expression: "[1,2,3,4][-5]",
        data: {},
        result: null
    },
    {
        expression: "[1,2,3,4][-(3-2)]",
        data: {},
        result: 3
    },
    {
        expression: "[1,2,3,4][a]",
        data: { a: -2 },
        result: 2
    },
    {
        expression: "[1,[5,6],3,4][2]",
        data: {},
        result: [5,6]
    },
    {
        expression: "[{a:4},{b:3},{c:2},{d:1}][2]",
        data: {},
        result: { b: 3 }
    },
    {
        expression: "[1,2,3,4][item > 2]",
        data: {},
        result: [3,4]
    },
    {
        expression: "[ {x:1, y:2}, {x:2, y:3} ][x=1]",
        data: {},
        result: [{x:1, y:2}]
    },
    {
        expression: "[ {x:1, y:2}, {x:2, y:3} ].y",
        data: {},
        result:  [2,3]
    },
    {
        expression: "[1,2,3,4][item = 2]",
        data: {},
        result: [2]
    },
    {
        expression: "[1,2,3,4][item + 1 = 3]",
        data: {},
        result: [2]
    },
    {
        expression: "[1,2,3,4,5,6,7,8,9][a*(item+1)=6]",
        data: { a: 2 },
        result: [2]
    },
    {
        expression: "[1,2,3,4][item > 5]",
        data: {},
        result: []
    },
    {
        expression: "[1,2,3,4][even(item)]",
        data: {},
        result: [2,4]
    },
    {
        expression: 'flight list[item.status = "cancelled"].flight number',
        data: { "flight list": [{ "flight number": 123, status: "boarding"},{ "flight number": 234, status: "cancelled"}] },
        result: [234]
    },
    {
        expression: "list contains([1,2,3,4],2)",
        data: {},
        result: true
    },
    {
        expression: "count([1,2,3,4])",
        data: {},
        result: 4
    },
    {
        expression: "min([1,2,3,4])",
        data: {},
        result: 1
    },
    {
        expression: "min(1,2,3,4)",
        data: {},
        result: 1
    },
    {
        expression: "max([1,2,3,4])",
        data: {},
        result: 4
    },
    {
        expression: "max(1,2,3,4)",
        data: {},
        result: 4
    },
    {
        expression: "sum([1,2,3,4])",
        data: {},
        result: 10
    },
    {
        expression: "sum(1,2,3,4)",
        data: {},
        result: 10
    },
    {
        expression: "product([1,2,3,4])",
        data: {},
        result: 24
    },
    {
        expression: "product(1,2,3,4)",
        data: {},
        result: 24
    },
    {
        expression: "mean([1,2,3,4])",
        data: {},
        result: 2.5
    },
    {
        expression: "mean(1,2,3,4)",
        data: {},
        result: 2.5
    },
    {
        expression: "median(8,2,5,3,4)",
        data: {},
        result: 4
    },
    {
        expression: "median([6,1,2,3])",
        data: {},
        result: 2.5
    },
    {
        expression: "median([])",
        data: {},
        result: null
    },
    {
        expression: "stddev([23, 4, 6, 457, 65, 7, 45, 8])",
        decription: "Sample standard deviaition",
        data: {},
        result: 155.15654537088847
    },
    {
        expression: "stddev([1,2,3,4,5])",
        decription: "Sample standard deviaition",
        data: {},
        result: 1.5811388300841898
    },
    {
        expression: "stddev(1,2,3,4,5)",
        decription: "Sample standard deviaition",
        data: {},
        result: 1.5811388300841898
    },
    {
        expression: "mode([6, 1, 9, 6, 1])",
        data: {},
        result: [1,6]
    },
    {
        expression: "mode(6, 3, 9, 6, 6)",
        data: {},
        result: [6]
    },
    {
        expression: "mode([])",
        data: {},
        result: []
    },
    {
        expression: "all(false,true)",
        data: {},
        result: false
    },
    {
        expression: "all([false,true])",
        data: {},
        result: false
    },
    {
        expression: "all([true])",
        data: {},
        result: true
    },
    {
        expression: "all([])",
        data: {},
        result: true
    },
    {
        expression: "any(false,true)",
        data: {},
        result: true
    },
    {
        expression: "any([false,true])",
        data: {},
        result: true
    },
    {
        expression: "any([true])",
        data: {},
        result: true
    },
    {
        expression: "any([])",
        data: {},
        result: false
    },
    {
        expression: "sublist([1,2,3,4,5],2)",
        data: {},
        result: [2,3,4,5]
    },
    {
        expression: "sublist([1,2,3,4,5],2,2)",
        data: {},
        result: [2,3]
    },
    {
        expression: `append(["a","b"],"c","d")`,
        data: {},
        result: ["a","b","c","d"]
    },
    {
        expression: "concatenate([1,2],[3],[4])",
        data: {},
        result: [1,2,3,4]
    },
    {
        expression: `insert before(["a","b"],2,"c","d")`,
        data: {},
        result: ["a","c","d","b"]
    },
    {
        expression: `remove(["a","b","c"],2)`,
        data: {},
        result: ["a","c"]
    },
    {
        expression: `reverse(["a","b","c"])`,
        data: {},
        result: ["c","b","a"]
    },
    {
        expression: `index of(["a","b","c","b"],"b")`,
        data: {},
        result: [2,4]
    },
    {
        expression: "union([1,2],[3,4],[5,6])",
        data: {},
        result: [1,2,3,4,5,6]
    },
    {
        expression: "distinct values([1,2,3,2,1])",
        data: {},
        result: [1,2,3]
    },
    {
        expression: "flatten([[1,2],[[3]],4])",
        data: {},
        result: [1,2,3,4]
    },
    {
        expression: "sort(list: [3,1,4,5,2], precedes: function(x,y) x < y)",
        data: {},
        result: [1,2,3,4,5]
    },
    {
        expression: "sort([3,1,4,5,2], function(x,y) x < y)",
        data: {},
        result: [1,2,3,4,5]
    },
    {
        expression: `string join(["a","b","c"])`,
        data: {},
        result: "abc"
    },
    {
        expression: `string join(["a","b","c"],", ")`,
        data: {},
        result: "a, b, c"
    },
    {
        expression: `string join(["a"],"_")`,
        data: {},
        result: "a"
    },
    {
        expression: `string join(["a","b","c"],", ","[","]")`,
        data: {},
        result: "[a, b, c]"
    },
    {
        expression: `string join(["a",null,"c"])`,
        data: {},
        result: "ac"
    },
    {
        expression: `string join([])`,
        data: {},
        result: ""
    },
    {
        expression: `concatenate(list1,list2)`,
        data: {
            list1: ["a","b","c"],
            list2: ["x","y","z"]
        },
        result: ["a","b","c","x","y","z"]
    },
    {
        expression: `[{a: {b: 1}}, {a: {b: [2.1, 2.2]}}, {a: {b: 3}}, {a: {b: 4}}, {a: {b: 5}}].a.b`,
        //analyse: "D",
        data: {},
        result: [1, [2.1, 2.2], 3, 4, 5]
    }    
];

module.exports = {
    tests
};