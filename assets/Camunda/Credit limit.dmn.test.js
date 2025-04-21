
const tests = [
    {
        case: "Credit Score 4.5, Turnover 200000, Bonität well",
        data: {
            "Credit Score": 4.5, 
            "Turnover": 200000,
            Customer: {
                "Bonität": "well"
                }
            },
        result: {
            'Credit Limit': 240000,
            "Risk class": "C",
            "Multiplier": 1.2
        }
    }
];

module.exports = {
    tests
};