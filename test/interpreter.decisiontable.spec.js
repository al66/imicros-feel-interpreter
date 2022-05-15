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
        it("should evaluate hit policy C", () => {
            let exp = `decision table(
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
            )`
            let result = interpreter.evaluate(exp,{"any": 0});
            expect(result).toEqual({ result: [1,2,3,4,5] });
        });
        it("should evaluate hit policy C", () => {
            let exp = `decision table(
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
            )`
            let result = interpreter.evaluate(exp,{"any": 0});
            expect(result).toEqual({ result: ["this","is","the","collected","result"] });
        });
        it("should evaluate hit policy C+", () => {
            let exp = `decision table(
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
            )`
            let result = interpreter.evaluate(exp,{"any": 0});
            expect(result).toEqual({ result: 15 });
        });
        it("should evaluate hit policy C<", () => {
            let exp = `decision table(
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
            )`
            let result = interpreter.evaluate(exp,{"any": 0});
            expect(result).toEqual({ result: 1 });
        });
        it("should evaluate hit policy C>", () => {
            let exp = `decision table(
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
            )`
            let result = interpreter.evaluate(exp,{"any": 0});
            expect(result).toEqual({ result: 5 });
        });
        it("should evaluate hit policy C#", () => {
            let exp = `decision table(
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
            )`
            let result = interpreter.evaluate(exp,{"any": 0});
            expect(result).toEqual({ result: 4 });
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
            // let exp = `decimal({ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),
            //                     "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee }.MonthlyPayment,10)`
             let exp = `{ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),
                         "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee }.MonthlyPayment`
            let result = interpreter.evaluate(exp,{Loan: { amount: 600000, rate: 0.0375, term:360 }, fee: 100});
            expect(result).toEqual(2878.6935494327668);
        });
        it("should evaluate the same as a boxed expression", () => {
            let exp = `boxed expression({ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),
                                          "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee },
                                        MonthlyPayment )`
            let result = interpreter.evaluate(exp,{Loan: { amount: 600000, rate: 0.0375, term:360 }, fee: 100});
            expect(result).toEqual(2878.6935494327668);
        });
    });

    

});
