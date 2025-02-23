"use strict";

const fs = require("fs");
const util = require('util');

const { Decision } = require("../index.js");

const decision = new Decision();

describe("Test DMN converter", () => {

    describe("Convert & evaluate", () => {
        it("it should evaluate assets/simulation.dmn", () => {
            let filePath = "./assets/simulation.dmn";
            let xmlData = fs.readFileSync(filePath).toString();
            let success = decision.parse({ xml: xmlData });
            let result = decision.evaluate({
                "Season": "Spring", 
                "Number of Guests": 3,
                "Guests with children?": true
            });
            //console.log(xmlData);
            //console.log(util.inspect(expression, { showHidden: false, depth: null, colors: true }));
            //console.log(util.inspect(interpreter.ast, { showHidden: false, depth: null, colors: true }));
            //console.log(util.inspect(interpreter.log, { showHidden: false, depth: null, colors: true }));
            expect(success).toEqual(true);
            /*
            expect(result).toEqual({
                Season: 'Spring',
                'Number of Guests': 3,
                'Guests with children?': true,
                Dish: 'Dry Aged Gourmet Steak',
                Beverages: [ 'Pinot Noir', 'Apple Juice' ]
              });
            */
        });
    });
    
});
