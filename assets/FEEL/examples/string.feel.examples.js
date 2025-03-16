const tests = [
    // add tests from file ../test/interpreter.string.spec.js here
    {
        expression: '"This is a test"',
        data: {},
        result: "This is a test"
    },
    {
        expression: '"This is a test"',
        data: {},
        result: "This is a test"
    },
    {
        expression: `"This is a test with escaped characters \\ \' \n \r \t \u269D \u101EF "`,
        data: {},
        result: "This is a test with escaped characters \\ \' \n \r \t \u269D \u101EF "
    },
    {
        expression: '"foo" + "bar"',
        data: {},
        result: "foobar"
    },
    {
        expression: 'substring("imicros",3)',
        data: {},
        result: "icros"
    },
    {
        expression: 'substring("imicros",3,3)',
        data: {},
        result: "icr"
    },
    {
        expression: 'string length("imicros")',
        data: {},
        result: 7
    },
    {
        expression: 'upper case("imicros")',
        data: {},
        result: "IMICROS"
    },
    {
        expression: 'lower case("IMicros")',
        data: {},
        result: "imicros"
    },
    {
        expression: '"best of " + lower case("IMicros")',
        data: {},
        result: "best of imicros"
    },
    {
        expression: 'substring before("imicros","cros")',
        data: {},
        result: "imi"
    },
    {
        expression: 'substring after("imicros","mic")',
        data: {},
        result: "ros"
    },
    {
        expression: 'starts with("imicros","imi")',
        data: {},
        result: true
    },
    {
        expression: 'ends with("imicros","cros")',
        data: {},
        result: true
    },
    {
        expression: 'ends with("imicros","cro")',
        data: {},
        result: false
    },
    {
        expression: 'matches("imicros","^im.cros")',
        data: {},
        result: true
    },
    {
        expression: 'split("i;m;i;c;r;o;s",";")',
        data: {},
        result: ["i","m","i","c","r","o","s"]
    },
    {
        expression: 'split("John Doe","\\s")',
        data: {},
        result: ["John","Doe"]
    },
    {
        expression: 'split("a;b;c;;", ";")',
        data: {},
        result: ["a", "b", "c", "", ""]
    },
    {
        expression: 'extract("references are 1234, 1256, 1378", "12[0-9]*")',
        data: {},
        result: ["1234","1256"]
    },
    {
        expression: 'replace("abcd", "(ab)|(a)", "[1=$1][2=$2]")',
        data: {},
        result: "[1=ab][2=]cd"
    },
    {
        expression: 'replace("0123456789", "(\\d{3})(\\d{3})(\\d{4})", "($1) $2-$3")',
        data: {},
        result: "(012) 345-6789"
    },
    {
        expression: 'replace("0123456789", "([0-9]{3})([0-9]{3})([0-9]{4})", "($1) $2-$3")',
        data: {},
        result: "(012) 345-6789"
    }
];

module.exports = {
    tests
};