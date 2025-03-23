# imicros-feel-interpreter
![Build Status](https://github.com/al66/imicros-feel-interpreter/actions/workflows/CI.yml/badge.svg)

DMN decision and FEEL language interpreter written in JavaScript.

## Installation
```
$ npm install imicros-feel-interpreter
```

## Usage DMN decisions
```
const { Decision } = require("imicros-feel-interpreter");
const fs = require("fs");

const decision = new Decision();

let exampleFilePath = "./assets/Camunda/Credit limit.dmn"   // Path to .dmn file (XML file)
let xmlData = fs.readFileSync(exampleFilePath).toString();
let success = decision.parse({ xml: xmlData });
if (success) {
    decision.setAst(JSON.parse(JSON.stringify(decision.getAst())));         // you can store the parsed ast also in a database for faster execution
    let result = decision.evaluate({                                        // parse your execution data as parameter
                "Credit Score": 4.5, 
                "Turnover": 200000,
                Customer: {
                    "Bonität": "well"
                }
            });
    // {
    //      'Credit Limit': 240000
    // }
}

```
### Usage DMN analysis

```
const { Decision } = require("imicros-feel-interpreter");
const fs = require("fs");
const util = require('util');

const decision = new Decision();

let exampleFilePath = "./assets/Camunda/Credit limit.dmn"   // Path to .dmn file (XML file)
let xmlData = fs.readFileSync(exampleFilePath).toString();
let success = decision.parse({ xml: xmlData });
if (success) {
    decision.setAst(JSON.parse(JSON.stringify(decision.getAst())));         // you can store the parsed ast also in a database for faster execution
    let result = decision.analyse({                                        // parse your execution data as parameter
                "Season": "Spring", 
                "Number of Guests": 3,
                "Guests with children?": true
              });
    console.log(util.inspect(result.result, { showHidden: false, depth: null, colors: true })); 
    console.log(util.inspect(result.log, { showHidden: false, depth: null, colors: true }));        // returns in addition a log of the execuition 
    /*
    {
      log: [
        { type: 'Input', name: 'Season', value: 'Spring' },
        { type: 'Input', name: 'Number of Guests', value: 3 },
        { type: 'Input', name: 'Guests with children?', value: true },
        {
          type: 'Rule',
          decisionTable: 'Dish',
          index: 0,
          annotation: 'Default value',
          steps: [
            {
              name: 'Season',
              value: 'Spring',
              expression: 'not("Fall", "Winter", "Spring", "Summer")',
              result: false
            },
            {
              name: 'How many guests',
              value: 3,
              expression: '>= 0',
              result: true
            }
          ],
          result: false,
          output: {}
        },
        {
          type: 'Rule',
          decisionTable: 'Dish',
          index: 1,
          annotation: '',
    ...
          ],
          result: false,
          output: {}
        },
        {
          type: 'Decisiontable',
          name: 'Beverages',
          hitPolicy: 'Collect',
          inputs: [
            { name: 'Dish', value: 'Dry Aged Gourmet Steak' },
            { name: 'Guests with children', value: true }
          ],
          output: { beverages: [ 'Pinot Noir', 'Apple Juice' ] }
        }
      ],
      result: { beverages: [ 'Pinot Noir', 'Apple Juice' ] }
    }
    */
}

```

## Usage FEEL expressions
```
const { Interpreter } = require("imicros-feel-interpreter");

const interpreter = new Interpreter();

/*** parse and evaluate in a single step ***/
let result = interpreter.evaluate("a/b**-c-d",{a:1,b:2,c:4,d:3});
// 13

/*** or in two steps: parse single evaluate multiple***/
let success = interpreter.parse("a/b**-c-d");
// true

let serialized = JSON.stringify(interpreter.getAst());
interpreter.setAst(JSON.parse(serialized));
// serialized ast can be stored somewhere and restored for multiple usage with different data sets

let result = interpreter.evaluate({a:1,b:2,c:4,d:3});
// 13
```
### Usage Converter to convert a DMN file (XML) to a single FEEL expression
```
const { DMNParser, DMNConverter } = require("imicros-feel-interpreter");
const fs = require("fs");

const xmlData = fs.readFileSync(./assets/Sample.dmn).toString();
const expression = new DMNConverter().convert({ xml: xmlData });
```

## Features
 - Complete support of [DMN 1.4](https://www.omg.org/spec/DMN/1.4/Beta1/PDF). Known restrictions see below.
 - Provide build-in functions as listed in the examples.

## Restrictions
 - ***Additional name symbols ./-+\**** according rule 30. of the sepcification as well as keywords ***for,return,if,true,false,in,and,or,between,some,every,then,else,not,string,number,boolean,null,date,time,duration*** in names are ***not supported***. <br/>(The package uses nearley as parser and I didn't found a way to implement the ambiguity).<br/> ***White spaces are allowed*** and normalized (doubled spaces will be replaced by just one space). Therefore expresssions like ***{"new example": 5}.new &nbsp;&nbsp; example*** as well as ***{ "new &nbsp;&nbsp;&nbsp; example": 5}.new example*** will work. <br/>Beside white spaces the ***special characters _?'*** which are not used as operators ***are allowed***.
 - No external functions are supported.

## Performance considerations
In case of intensive usage with large number of data sets consider the pre-parsing possibility.

A simple expression `if even(i) then (i*a) else (i*b)` with parsing and evaluation in one step evaluates 2.500 data sets per second and with a single parsing you can evaluate up to 200.000 data sets per second on an average hardware with single thread processing.

## Recommended DMN editors
Camunda open source desktop editor https://camunda.com/de/download/modeler/

BPMN.iO open source embedded web-based modelling  https://bpmn.io/

### Basically tested:
Redhat Visual Studio Code Extension https://marketplace.visualstudio.com/items?itemName=redhat.vscode-extension-dmn-editor

## Example FEEL expressions
[List with examples of valid FEEL expressions](assets/FEEL/readme.md)
 


