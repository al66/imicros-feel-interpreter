"use strict";

const fs = require("fs");
const util = require('util');

const { Interpreter } = require("../index.js");
const { DMNParser, DMNConverter } = require("../index.js");

const interpreter = new Interpreter();

describe("Test DMN converter", () => {

    describe("Convert & evaluate", () => {
        it("it should evaluate assets/Deep.js", () => {
            let filePath = "./assets/Deep.dmn";
            let xmlData = fs.readFileSync(filePath).toString();
            let expression = new DMNConverter().convert({ xml: xmlData });
            let success = interpreter.parse(expression);
            interpreter.logger.activate();
            interpreter.logger.clear();
            let result = interpreter.evaluate({
                "a": 5, 
                "b": 6,
                "c": 7
            });
            //console.log(util.inspect(expression, { showHidden: false, depth: null, colors: true }));
            //console.log(util.inspect(interpreter.logger.getLog(), { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(result).toEqual({ First: 4});
        });
        it("it should evaluate assets/Sample.dmn", () => {
            let filePath = "./assets/Sample.dmn";
            let xmlData = fs.readFileSync(filePath).toString();
            let expression = new DMNConverter().convert({ xml: xmlData });
            let success = interpreter.parse(expression);
            let result = interpreter.evaluate({
                "Credit Score": { FICO: 700 }, 
                "Applicant Data": { Monthly: { Repayments: 1000, Tax: 1000, Insurance: 100, Expenses: 500, Income: 5000 } },
                "Requested Product": { Amount: 600000, Rate: 0.0375, Term: 360 }
            });
            // console.log(util.inspect(expression, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(result).toEqual({
                'Credit Score': { FICO: 700 },
                'Applicant Data': {
                  Monthly: {
                    Repayments: 1000,
                    Tax: 1000,
                    Insurance: 100,
                    Expenses: 500,
                    Income: 5000
                  }
                },
                'Requested Product': { Amount: 600000, Rate: 0.0375, Term: 360 },
                'Credit Score Rating': 'Good',
                'Back End Ratio': 'Sufficient',
                'Front End Ratio': 'Sufficient',
                'Loan PreQualification': {
                  Qualification: 'Qualified',
                  Reason: 'The borrower has been successfully prequalified for the requested loan.'
                }
            });
        });
        it("it should evaluate assets/simulation.dmn", () => {
            let filePath = "./assets/simulation.dmn";
            let xmlData = fs.readFileSync(filePath).toString();
            let expression = new DMNConverter().convert({ xml: xmlData });
            let success = interpreter.parse(expression);
            let result = interpreter.evaluate({
                "Season": "Spring", 
                "Number of Guests": 3,
                "Guests with children?": true
            });
            //console.log(xmlData);
            //console.log(util.inspect(expression, { showHidden: false, depth: null, colors: true }));
            //console.log(util.inspect(interpreter.ast, { showHidden: false, depth: null, colors: true }));
            //console.log(util.inspect(interpreter.log, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            expect(result).toEqual({
                Season: 'Spring',
                'Number of Guests': 3,
                'Guests with children?': true,
                Dish: 'Dry Aged Gourmet Steak',
                Beverages: [ 'Pinot Noir', 'Apple Juice' ]
              });
        });
    });
    
});
