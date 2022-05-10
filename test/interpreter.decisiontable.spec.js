const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

describe("Test interpreter", () => {

    describe("Decision table", () => {
        it("should evaluate a single table", () => {
            let exp = `decision table(
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
            )`
            let result = interpreter.evaluate(exp,{"Applicant Age": 65, "Medical History": "bad"});
            expect(result).toEqual({ "Applicant Risk Rating": "High" });
        });
    });

    describe("boxed expression", () => {
        it("should evaluate a context for use in the result", () => {
            let exp = `{ a: 5*b} a`
            let result = interpreter.evaluate(exp,{b:3});
            expect(result).toEqual(15);
        });
        it("should evaluate a context for use in a following decision table", () => {
            let exp = `{ "Applicant Age": patient.age,
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
                )`
            let result = interpreter.evaluate(exp,{patient: { age: 65, history: "bad"}});
            expect(result).toEqual({ "Applicant Risk Rating": "High" });
        });
        it("should evaluate a context for use in a following decision table", () => {
            let exp = `boxed expression({ "Applicant Age": patient.age,
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
                ))`
            let result = interpreter.evaluate(exp,{patient: { age: 65, history: "bad"}});
            expect(result).toEqual({ "Applicant Risk Rating": "High" });
        });
        it("should evaluate a context for use in a following decision table", () => {
            let exp = `boxed expression(context: { "Applicant Age": patient.age,
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
                ))`
            let result = interpreter.evaluate(exp,{patient: { age: 65, history: "bad"}});
            expect(result).toEqual({ "Applicant Risk Rating": "High" });
        });
        it("should evaluate a complex expression", () => {
            let exp = `decimal({ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),
                                 "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee }.MonthlyPayment,10)`
            // let exp = `{ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),
            //             "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee }.MonthlyPayment`
            let result = interpreter.evaluate(exp,{Loan: { amount: 600000, rate: 0.0375, term:360 }, fee: 100});
            expect(result).toEqual(2878.6935494327);
        });
        it("should evaluate the same as a boxed expression", () => {
            let exp = `boxed expression({ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),
                                          "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee },
                                        decimal(MonthlyPayment,10) )`
            let result = interpreter.evaluate(exp,{Loan: { amount: 600000, rate: 0.0375, term:360 }, fee: 100});
            expect(result).toEqual(2878.6935494327);
        });
    });

    

});
