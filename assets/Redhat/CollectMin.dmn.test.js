const tests = [
    {
        case: "Age 27, account creation year 1998",
        decision: "CreditLimit",
        data: {
            Age: 27,
            "Account Creation Year": 1998
        },
        result: {
            "CreditLimit": 15000
        }
    }
];

module.exports = {
    tests
};