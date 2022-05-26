
const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = `
boxed expression(context: { "Lender Acceptable DTI": 
                                    function () 0.36,
                            "Lender Acceptable PITI": function () 0.28,
                            "DTI": function (d,i) d/i,
                            "PITI": function (pmt,tax,insurance,income) (pmt+tax+insurance)/income,
                            "Credit Score.FICO": Credit Score.FICO,
                            "Credit Score Rating": decision table(
                                inputs: ["Credit Score.FICO"],
                                outputs: ["Credit Score Rating"],
                                rule list: [
                                    [>=750,"Excellent"],
                                    [[700..750),"Good"],
                                    [[650..700),"Fair"],
                                    [[600..650),"Poor"],
                                    [< 600,"Bad"]
                                ],
                                hit policy: "U"
                            ).Credit Score Rating,
                            "Back End Ratio": boxed expression(context: { "Client DTI": DTI(d: Applicant Data.Monthly.Repayments + Applicant Data.Monthly.Expenses, i: Applicant Data.Monthly.Income)},
                                                expression: if Client DTI <= Lender Acceptable DTI()
                                                then "Sufficient"
                                                else "Insufficient"
                                            ),
                            "Front End Ratio": boxed expression(context: { "Client PITI": PITI(
                                                        pmt: (Requested Product.Amount*((Requested Product.Rate/100)/12))/(1-(1/(1+(Requested Product.Rate/100)/12)**-Requested Product.Term)),
                                                        tax: Applicant Data.Monthly.Tax,
                                                        insurance: Applicant Data.Monthly.Insurance,
                                                        income: Applicant Data.Monthly.Income
                                                    )},
                                                expression: if Client PITI <= Lender Acceptable PITI()
                                                then "Sufficient"
                                                else "Insufficient"
                                            )
                          },
                expression: decision table(
                    outputs: ["Qualification","Reason"],
                    inputs: ["Credit Score Rating","Back End Ratio","Front End Ratio"],
                    rule list: [
                        [["Poor","Bad"],-,-,"Not Qualified","Credit Score too low."],
                        [-,"Insufficient","Sufficient","Not Qualified","Debt to income ratio is too high."],
                        [-,"Sufficient","Insufficient","Not Qualified","Mortgage payment to income ratio is too high."],
                        [-,"Insufficient","Insufficient","Not Qualified","Debt to income ratio is too high AND mortgage payment to income ratio is too high."],
                        [["Fair","Good","Excellent"],"Sufficient","Sufficient","Qualified","The borrower has been successfully prequalified for the requested loan."]
                    ],
                    hit policy: "First"
                )
)`
let success = interpreter.parse(exp);
if (!success) console.log(interpreter.error);

let result = interpreter.evaluate(exp,{
    "Credit Score": { FICO: 700 }, 
    "Applicant Data": { Monthly: { Repayments: 1000, Tax: 1000, Insurance: 100, Expenses: 500, Income: 5000 } },
    "Requested Product": { Amount: 600000, Rate: 0.0375, Term: 360 }
});

console.log(result);

// Alternate with collected intermediate results
exp = `
{   
    "Applicant Data": Applicant Data,
    "Credit Score": Credit Score,
    "Lender Acceptable DTI": function () 0.36,
    "Lender Acceptable PITI": function () 0.28,
    "DTI": function (d,i) d/i,
    "PITI": function (pmt,tax,insurance,income) (pmt+tax+insurance)/income,
    "Credit Score Rating": decision table(
            inputs: [Credit Score.FICO],
            outputs: ["Credit Score Rating"],
            rule list: [
                [>=750,"Excellent"],
                [[700..750),"Good"],
                [[650..700),"Fair"],
                [[600..650),"Poor"],
                [< 600,"Bad"]
            ],
            hit policy: "U"
        ).Credit Score Rating,
    "Client DTI": DTI(d: Applicant Data.Monthly.Repayments + Applicant Data.Monthly.Expenses, i: Applicant Data.Monthly.Income),
    "Client PITI": PITI(
        pmt: (Requested Product.Amount*((Requested Product.Rate/100)/12))/(1-(1/(1+(Requested Product.Rate/100)/12)**-Requested Product.Term)),
        tax: Applicant Data.Monthly.Tax,
        insurance: Applicant Data.Monthly.Insurance,
        income: Applicant Data.Monthly.Income
    ),
    "Back End Ratio": if Client DTI <= Lender Acceptable DTI()
        then "Sufficient"
        else "Insufficient",
    "Front End Ratio": if Client PITI <= Lender Acceptable PITI()
                    then "Sufficient"
                    else "Insufficient",
    "Loan PreQualification": decision table(
                    outputs: ["Qualification","Reason"],
                    inputs: [Credit Score Rating,Back End Ratio,Front End Ratio],
                    rule list: [
                        [["Poor","Bad"],-,-,"Not Qualified","Credit Score too low."],
                        [-,"Insufficient","Sufficient","Not Qualified","Debt to income ratio is too high."],
                        [-,"Sufficient","Insufficient","Not Qualified","Mortgage payment to income ratio is too high."],
                        [-,"Insufficient","Insufficient","Not Qualified","Debt to income ratio is too high AND mortgage payment to income ratio is too high."],
                        [["Fair","Good","Excellent"],"Sufficient","Sufficient","Qualified","The borrower has been successfully prequalified for the requested loan."]
                    ],
                    hit policy: "F"
                )
}
`
success = interpreter.parse(exp);
if (!success) console.log(interpreter.error);

result = interpreter.evaluate(exp,{
    "Credit Score": { FICO: 700 }, 
    "Applicant Data": { Monthly: { Repayments: 1000, Tax: 1000, Insurance: 100, Expenses: 500, Income: 5000 } },
    "Requested Product": { Amount: 600000, Rate: 0.0375, Term: 360 }
});

console.log(result);


exp = `
{
    "Season": Season,
    "Number of Guests": Number of Guests,
    "Guests with children?": Guests with children?,
    "Dish": decision table(
       inputs: [Season,Number of Guests],
       outputs: ["desiredDish"],
       rule list: [
          [not("Fall", "Winter", "Spring", "Summer"),>= 0,"Instant Soup"],
          ["Fall",<= 8,"Spareribs"],
          ["Winter",<= 8,"Roastbeef"],
          ["Spring",<= 4,"Dry Aged Gourmet Steak"],
          ["Spring",[5..8],"Steak"],
          [["Fall","Winter","Spring"],> 8,"Stew"],
          ["Summer",-,"Light Salad and a nice Steak"]
       ],
       hit policy: "Unique"
    ).desiredDish,
    "Beverages": decision table(
       inputs: [Dish,Guests with children?],
       outputs: ["beverages"],
       rule list: [
          ["Spareribs",true,"Aecht Schlenkerla Rauchbier"],
          ["Stew",true,"Guiness"],
          ["Roastbeef",true,"Bordeaux"],
          [["Steak","Dry Aged Gourmet Steak","Light Salad and a nice Steak"],true,"Pinot Noir"],
          [-,true,"Apple Juice"],
          [-,false,"Water"]
       ],
       hit policy: "Collect"
    ).beverages
 }
`
success = interpreter.parse(exp);
if (!success) console.log(interpreter.error);

result = interpreter.evaluate(exp,{
    "Season": "Winter", 
    "Number of Guests": 3,
    "Guests with children?": true
});

console.log(result);

