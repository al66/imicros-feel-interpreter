"use strict";

const fs = require("fs");
const util = require("util");


const filePath = "./assets/Credit limit v10.dmn";
//const filePath = "./assets/Credit limit v3.dmn";
//const filePath = "./assets/Sample.dmn";
//const filePath = "./assets/simulation.dmn";
//const filePath = "./assets/Deep.dmn";
const xmlData = fs.readFileSync(filePath).toString();

const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

const { DMNParser, DMNConverter } = require("../lib/converter.js");


const ast = new DMNParser().parse(xmlData);

console.log(util.inspect(ast, { showHidden: false, depth: null, colors: true }));

//const expression = new DMNConverter().convert({ node: ast });
const expression = new DMNConverter().convert({ xml: xmlData });

console.log(expression);
// console.log(util.inspect(expression, { showHidden: false, depth: null, colors: true }));

let success = interpreter.parse(expression);
if (!success) console.log(interpreter.error);

let result;
if (filePath === "./assets/Sample.dmn") {
    result = interpreter.evaluate(expression,{
        "Credit Score": { FICO: 700 }, 
        "Applicant Data": { Monthly: { Repayments: 1000, Tax: 1000, Insurance: 100, Expenses: 500, Income: 5000 } },
        "Requested Product": { Amount: 600000, Rate: 0.0375, Term: 360 }
    });
}
if (filePath === "./assets/Deep.dmn") {
    result = interpreter.evaluate(expression,{
        "a": 5, 
        "b": 6,
        "c": 7
    });
}
if (filePath === "./assets/simulation.dmn") {
    result = interpreter.evaluate(expression,{
        "Season": "Spring", 
        "Number of Guests": 3,
        "Guests with children?": true
    });
}
if (filePath === "./assets/Credit limit v10.dmn") {
    result = interpreter.evaluate(expression,{
        "Credit Score": 4.9, 
        "Turnover": 100000
    });
}
if (filePath === "./assets/Credit limit v3.dmn") {
    result = interpreter.evaluate(expression,{
        "Credit Score": 4, 
        "Turnover": 100000
    });
}

console.log(result);
