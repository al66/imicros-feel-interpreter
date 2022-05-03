# imicros-feel-interpreter
[![Build Status](https://img.shields.io/github/workflow/status/al66/imicros-feel-interpreter/CI)](https://github.com/al66/imicros-feel-interpreter/actions?query=workflow%3ACI)

FEEL interpreter written in JavaScript.

Developed for of the imicros backend but can be used also stand-alone.

## Installation
```
$ npm install imicros-feel-interpreter
```

# Usage
```
const { Interpreter } = require("imicros-feel-interpreter");

const interpreter = new Interpreter();

/*** parse and evaluate in a single step ***/
let result = interpreter.evaluate("a/b**-c-d",{a:1,b:2,c:4,d:3});
// 13

/*** or in two steps: parse single evaluate multiple***/
let success = interpreter.parse("a/b**-c-d");
// true

let serialized = JSON.stringify(interpreter.ast);
interpreter.ast = JSON.parse(serialized);
// serialized ast can be stored somewhere and restored for multiple usage with different data sets

let result = interpreter.evaluate({a:1,b:2,c:4,d:3});
// 13
```
# Features
 - Complete support of [DMN 1.4](https://www.omg.org/spec/DMN/1.4/Beta1/PDF) planned. Known restrictions see below.
 - Provide build-in functions as listed below.

# Restrictions
 - Currently no additional name symbols (./-+* according rule 30.) as well as keywords (for,return,if,true,false,in,and,or,between,some,every,then,else,not,string,number,boolean,null,date,time,duration) in names are supported. (The package uses nearley as parser and I didn't found a way to implement the ambiguity)
 - No external functions supported.

# Performance considerations
In case of intensive usage with large number of data sets consider the pre-parsing possibility.

A simple expression `if even(i) then (i*a) else (i*b)` with parsing and evaluation in one step evaluates 2.500 data sets per second and with a single parsing you can evaluate up to 200.000 data sets per second on an average hardware with single thread processing.

# Example expressions
 - `date and time("2022-04-05T23:59:59") < date("2022-04-06")` w/o context --> `true`
 - `if a>b then c+4 else d` with context `{a:3,b:2,c:5.1,d:4}` --> `9.1`
 - `"best of " + lower case("IMicros")` w/o context --> `"best of imicros"` 
 - `[{a:3,b:1},{a:4,b:2}][item.a > 3]` w/o context --> `[{a:4,b:2}]`
 - `[1,2,3,4,5,6,7,8,9][a*(item+1)=6]` with context `{a:2}` --> `[2]`
 - `a+b > c+d` with context `{a:5,b:4,c:3,d:5}` --> `true`
 - `flight list[item.status = "cancelled"].flight number` with context `{"flight list": [{ "flight number": 123, status: "boarding"},{ "flight number": 234, status: "cancelled"}]}` --> `[234]`
 - `deep.a.b + deep.c` with context `{deep:{a:{b:3},c:2}}` --> `5`
 - `{a:3}.a`w/o context --> `3`
 - `extract("references are 1234, 1256, 1378", "12[0-9]*")` w/o context --> `["1234","1256"]`
 - `(a+b)>(8.9) and (c+d)>(8.1)` with context `{a:5,b:4,c:4,d:5}`--> `true`
 - `@"2022-04-10T13:15:20" + @"P1M"` w/o context --> `"2022-05-10T13:15:20"`
 - `day of year(@"2022-04-16")` w/o context --> `106`
 - `@"P7M2Y" + @"P5D"` w/o context --> `"P5D7M2Y"`
 - `decision table(
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
            ) ` with context `{"Applicant Age": 65, "Medical History": "bad"}` --> `{ "Applicant Risk Rating": "High" }`
# Supported build-in functions
## Arithmetic

## Lists

## Strings

## Decisions





