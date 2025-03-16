const tests = [
    // add tests from file ../test/interpreter.decisiontable.spec.js here
    {
        expression: `decision table(
            outputs: ["Applicant Risk Rating"],
            inputs: ["Applicant Age","Medical History"],
            rule list: [
                [>60,"good","Medium"],
                [>60,"bad","High"],
                [[25..60],-,"Medium"],
                [<25,"good","Low"],
                [<25,"bad","Medium"]
            ],
            hit policy: "Unique"
        )`,
        data: { "Applicant Age": 65, "Medical History": "bad" },
        result: { "Applicant Risk Rating": "High" }
    },
    {
        expression: `decision table(
            outputs: ["first","second","third"],
            inputs: ["any"],
            rule list: [
                [5,1,"other text",false],
                [-,2,"any text",true]
            ],
            hit policy: "First"
        )`,
        data: { "any": 0 },
        result: { first: 2, second: "any text", third: true }
    },
    {
        expression: `decision table(
            outputs: ["first","second","third"],
            inputs: ["any"],
            rule list: [
                [5,1,"other text",false],
                [-,2,"any text",true]
            ],
            hit policy: "A"
        )`,
        data: { "any": 0 },
        result: { first: 2, second: "any text", third: true }
    },
    {
        expression: `decision table(
            outputs: ["result"],
            inputs: ["any"],
            rule list: [
                [-,1],
                [-,2],
                [-,3],
                [-,4],
                [-,5]
            ],
            hit policy: "C"
        )`,
        data: { "any": 0 },
        result: { result: [1, 2, 3, 4, 5] }
    },
    {
        expression: `decision table(
            outputs: ["result"],
            inputs: ["any"],
            rule list: [
                [-,"this"],
                [-,"is"],
                [-,"the"],
                [-,"collected"],
                [-,"result"]
            ],
            hit policy: "C"
        )`,
        data: { "any": 0 },
        result: { result: ["this", "is", "the", "collected", "result"] }
    },
    {
        expression: `decision table(
            outputs: ["result"],
            inputs: ["any"],
            rule list: [
                [-,1],
                [-,2],
                [-,3],
                [-,4],
                [-,5]
            ],
            hit policy: "C+"
        )`,
        data: { "any": 0 },
        result: { result: 15 }
    },
    {
        expression: `decision table(
            outputs: ["result"],
            inputs: ["any"],
            rule list: [
                [-,2],
                [-,1],
                [-,3],
                [-,4],
                [-,5]
            ],
            hit policy: "C<"
        )`,
        data: { "any": 0 },
        result: { result: 1 }
    },
    {
        expression: `decision table(
            outputs: ["result"],
            inputs: ["any"],
            rule list: [
                [-,2],
                [-,1],
                [-,3],
                [-,5],
                [-,4]
            ],
            hit policy: "C>"
        )`,
        data: { "any": 0 },
        result: { result: 5 }
    },
    {
        expression: `decision table(
            outputs: ["result"],
            inputs: ["any"],
            rule list: [
                [-,2],
                [-,1],
                [5,3],
                [-,5],
                [-,4]
            ],
            hit policy: "C#"
        )`,
        data: { "any": 0 },
        result: { result: 4 }
    },
    {
        expression: `{ a: 5*b} a`,
        data: { b: 3 },
        result: 15
    },
    {
        expression: `{ "Applicant Age": patient.age,
        "Medical History": patient.history } 
            decision table(
                outputs: ["Applicant Risk Rating"],
                inputs: ["Applicant Age","Medical History"],
                rule list: [
                    [>60,"good","Medium"],
                    [>60,"bad","High"],
                    [[25..60],-,"Medium"],
                    [<25,"good","Low"],
                    [<25,"bad","Medium"]
                ],
                hit policy: "Unique"
            )`,
        data: { patient: { age: 65, history: "bad" } },
        result: { "Applicant Risk Rating": "High" }
    },
    {
        expression: `boxed expression({ "Applicant Age": patient.age,
        "Medical History": patient.history }, 
            decision table(
                outputs: ["Applicant Risk Rating"],
                inputs: ["Applicant Age","Medical History"],
                rule list: [
                    [>60,"good","Medium"],
                    [>60,"bad","High"],
                    [[25..60],-,"Medium"],
                    [<25,"good","Low"],
                    [<25,"bad","Medium"]
                ],
                hit policy: "Unique"
            ))`,
        data: { patient: { age: 65, history: "bad" } },
        result: { "Applicant Risk Rating": "High" }
    },
    {
        expression: `boxed expression(context: { "Applicant Age": patient.age,
        "Medical History": patient.history }, 
            expression: decision table(
                outputs: ["Applicant Risk Rating"],
                inputs: ["Applicant Age","Medical History"],
                rule list: [
                    [>60,"good","Medium"],
                    [>60,"bad","High"],
                    [[25..60],-,"Medium"],
                    [<25,"good","Low"],
                    [<25,"bad","Medium"]
                ],
                hit policy: "Unique"
            ))`,
        data: { patient: { age: 65, history: "bad" } },
        result: { "Applicant Risk Rating": "High" }
    },
    {
        expression: `{ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),
                     "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee }.MonthlyPayment`,
        data: { Loan: { amount: 600000, rate: 0.0375, term: 360 }, fee: 100 },
        result: 2878.6935494327668
    },
    {
        expression: `boxed expression({ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),
                                      "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee },
                                    MonthlyPayment )`,
        data: { Loan: { amount: 600000, rate: 0.0375, term: 360 }, fee: 100 },
        result: 2878.6935494327668
    }
];

module.exports = {
    tests
};