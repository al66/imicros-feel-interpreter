const tests = [
    {
        case: "Tests FEEL built-in function 'replace' on string literals",
        decision: "Replace",
        analyse: false,
        data: {
            A: "banana"
        },
        result: {
            "Aao": "bonono",
            "AanplusStarstar": "b**a",
            "encloseVowels": "b[a]n[a]n[a]"
        }
    }
];

module.exports = {
    tests
};