
const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();
const util = require("util");

let exp = `
{
    "is overdue": function (item) (date(item.dueDate) < today()),
    "get area": function (item) (
        decision table(
            inputs: [item.companyCode],
            outputs: ["area"],
            rule list: [
               ["1000","9000"],
               ["1100","9000"],
               ["1100","9000"],
               ["2000","9100"]
            ],
            hit policy: "Unique"
         )
    ),
    "payments behavior": function (average) (
        decision table(
            inputs: [average],
            outputs: ["score"],
            rule list: [
                [<=2,9],
                [(2..20],4],
                [(20..40],3],
                [(40..60],2],
                [(60..90],1],
                [>90,0]
            ],
            hit policy: "Unique"
        ).score
    ),
    "OpenItems": for item in open items return put all(item, 
                                                        { overdue: is overdue(item) },
                                                        { age: (today() - date(item.dueDate)).days + (today() - date(item.dueDate)).months * 30 },
                                                        { area: get area(item).area }
                                                    ),
    "PaidItems": for item in paid items return put all(item,
                                                        { daysToPay: (date(item.clearingDate) - date(item.dueDate)).days },
                                                        { age: (today() - date(item.dueDate)).days + (today() - date(item.dueDate)).months * 30 },
                                                        { area: get area(item).area }
                                                    ),
    "Areas": distinct values(concatenate(OpenItems.area,PaidItems.area)),
    "Turnover": sum(OpenItems.amountGroupCurrency) + sum(PaidItems.amountGroupCurrency),
    "TurnoverPerArea": for area in Areas return {
        area: area,
        turnover: sum(OpenItems[item.area = area].amountGroupCurrency) + sum(PaidItems[item.area = area].amountGroupCurrency)
    },
    "OpenAmount": sum(OpenItems.amountGroupCurrency),
    "OverdueAmount": sum(OpenItems[item.overdue].amountGroupCurrency),
    "OldestOpenItem": max(OpenItems.age),
    "DaysToPay30": { days: sum(PaidItems[item.age <= 30].daysToPay), count: count(PaidItems[item.age <= 30]), average: days / count },
    "DaysToPay180": { days: sum(PaidItems[item.age <= 180].daysToPay), count: count(PaidItems[item.age <= 180]), average: days / count },
    "DaysToPay360": { days: sum(PaidItems[item.age <= 360].daysToPay), count: count(PaidItems[item.age <= 360]), average: days / count },
    "PaymentBehavior30": {
        score:  payments behavior(DaysToPay30.average),
        weight: 0.6,
        weighted: score * weight
    },
    "PaymentBehavior180": {
        score:  payments behavior(DaysToPay180.average),
        weight: 0.3,
        weighted: score * weight
    },
    "PaymentBehavior360": {
        score:  payments behavior(DaysToPay360.average),
        weight: 0.1,
        weighted: score * weight
    },
    "Score": {
        "PaymentBehavior": {
            score: decimal(sum(PaymentBehavior30.weighted,PaymentBehavior180.weighted,PaymentBehavior360.weighted),2),
            weight: 0.6,
            weighted: score * weight
        },
        "OldestOpenItem": {
            score: 
                decision table(
                    inputs: [OldestOpenItem],
                    outputs: ["score"],
                    rule list: [
                        [>30,0],
                        [[20..30],1],
                        [[30..20],2],
                        [[20..10],3],
                        [<10,4]
                    ],
                    hit policy: "First"
                ).score,
            weight: 0.4,
            weighted: score * weight
        },
        "Final": decimal(sum(PaymentBehavior.weighted,OldestOpenItem.weighted),2)
    },
    "RiskClass": decision table(
       inputs: [Score.Final],
       outputs: ["RiskClass","Multiplier"],
       rule list: [
          [[0..1),"F",0],
          [[1..3),"E",0],
          [[3..5),"D",1],
          [[5..7),"C",1],
          [[7..8),"B",1.5],
          [[8..9],"A",2]
       ],
       hit policy: "Unique"
    ),
    "CreditLimit": RiskClass.Multiplier * Turnover
 }
`
try {
    result = interpreter.evaluate({ expression: exp, context: {
        "Turnover": 100000,
        "open items": [
            { companyCode: "1000", postingKey: "01", amountGroupCurrency: 100.00, postingDate: "2022-05-24", daysNet: 30, dueDate: "2022-06-24" },
            { companyCode: "1000", postingKey: "01", amountGroupCurrency: 200.00, postingDate: "2022-06-06", daysNet: 20, dueDate: "2022-06-26" },
            { companyCode: "1000", postingKey: "11", amountGroupCurrency: -110.00, postingDate: "2022-06-04", daysNet: 0, dueDate: "2022-06-04" },
            { companyCode: "2000", postingKey: "01", amountGroupCurrency: 120.00, postingDate: "2022-05-25", daysNet: 30, dueDate: "2022-06-25" }
        ],
        "paid items": [
            { companyCode: "1000", postingKey: "01", amountGroupCurrency: 100.00, postingDate: "2022-04-24", daysNet: 30, dueDate: "2022-05-24", clearingDate:"2022-05-20" },
            { companyCode: "1000", postingKey: "01", amountGroupCurrency: 200.00, postingDate: "2022-05-06", daysNet: 20, dueDate: "2022-05-26", clearingDate:"2022-05-20" },
            { companyCode: "1000", postingKey: "11", amountGroupCurrency: -110.00, postingDate: "2022-05-04", daysNet: 0, dueDate: "2022-05-04", clearingDate:"2022-05-10" },
            { companyCode: "1000", postingKey: "01", amountGroupCurrency: 120.00, postingDate: "2022-04-25", daysNet: 30, dueDate: "2022-05-25", clearingDate:"2022-05-20" },
            { companyCode: "1000", postingKey: "01", amountGroupCurrency: 100.00, postingDate: "2022-03-24", daysNet: 30, dueDate: "2022-04-24", clearingDate:"2022-04-23" },
            { companyCode: "1000", postingKey: "01", amountGroupCurrency: 200.00, postingDate: "2022-04-06", daysNet: 20, dueDate: "2022-04-26", clearingDate:"2022-04-25" },
            { companyCode: "1000", postingKey: "11", amountGroupCurrency: -110.00, postingDate: "2022-04-04", daysNet: 0, dueDate: "2022-04-04", clearingDate:"2022-04-10" },
            { companyCode: "2000", postingKey: "01", amountGroupCurrency: 120.00, postingDate: "2022-03-25", daysNet: 30, dueDate: "2022-04-25", clearingDate:"2022-04-26" }
        ]
    }});
    console.log(result);
} catch (e) {
    console.log(e);
}
