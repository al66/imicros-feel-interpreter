
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
            'Credit Limit': 240000
        }
    }
];

module.exports = {
    tests
};