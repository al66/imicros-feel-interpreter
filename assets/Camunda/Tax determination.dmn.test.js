const tests = [
    {
        case: "From DE to FR, customer taxable, material full tax",
        analyse: false,
        data: {
            Plant: {
                Address: {
                    Country: "DE"
                }
            },
            "Ship to party": {
                Address: {
                    Country: "FR"
                }
            },
            Customer: {
                Address: {
                    Country: "DE"
                },
                taxClassification: "taxable"
            },
            Material: {
                taxClassification: "full tax",
                service: false
            }
        },
        result: {
            "percentage": 0,
            taxCode: "DE3"
        }
    },
    {
        case: "From DE for FR, service",
        analyse: false,
        data: {
            Plant: {
                Address: {
                    Country: "DE"
                }
            },
            "Ship to party": {
                Address: {
                    Country: "FR"
                }
            },
            Customer: {
                Address: {
                    Country: "DE"
                },
                taxClassification: "taxable"
            },
            Material: {
                taxClassification: "full tax",
                service: true
            }
        },
        result: {
            "percentage": 0,
            taxCode: "DE4"
        }
    }

];

module.exports = {
    tests
};