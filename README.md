# imicros-feel-interpreter
[![Build Status](https://img.shields.io/github/workflow/status/al66/imicros-feel-interpreter/CI)](https://github.com/al66/imicros-feel-interpreter/actions?query=workflow%3ACI)

FEEL interpreter written in JavaScript.

Developed for of the imicros backend but can be used also stand-alone.

## Installation
```
$ npm install imicros-feel-interpreter
```

## Usage
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
### Usage Converter to convert a DMN file (XML) to a single FEEL expression
```
const { DMNParser, DMNConverter } = require("imicros-feel-interpreter");
const fs = require("fs");

const xmlData = fs.readFileSync(./assets/Sample.dmn).toString();
const expression = new DMNConverter().convert({ xml: xmlData });
```

## Features
 - Complete support of [DMN 1.4](https://www.omg.org/spec/DMN/1.4/Beta1/PDF). Known restrictions see below.
 - Provide build-in functions as listed below.

## Restrictions
 - ***Additional name symbols ./-+\**** according rule 30. of the sepcification as well as keywords ***for,return,if,true,false,in,and,or,between,some,every,then,else,not,string,number,boolean,null,date,time,duration*** in names are ***not supported***. <br/>(The package uses nearley as parser and I didn't found a way to implement the ambiguity).<br/> ***White spaces are allowed*** and normalized (doubled spaces will be replaced by just one space). Therefore expresssions like ***{"new example": 5}.new &nbsp;&nbsp; example*** as well as ***{ "new &nbsp;&nbsp;&nbsp; example": 5}.new example*** will work. <br/>Beside white spaces the ***special characters _?'*** which are not used as operators ***are allowed***.
 - No external functions are supported.

## Performance considerations
In case of intensive usage with large number of data sets consider the pre-parsing possibility.

A simple expression `if even(i) then (i*a) else (i*b)` with parsing and evaluation in one step evaluates 2.500 data sets per second and with a single parsing you can evaluate up to 200.000 data sets per second on an average hardware with single thread processing.

# Example expressions
 - `date and time("2022-04-05T23:59:59") < date("2022-04-06")` w/o context --> `true`
 - `if a>b then c+4 else d` with context `{a:3,b:2,c:5.1,d:4}` --> `9.1`
 - `{"Mother's finest":5, "result": 5 + Mother's finest}.result` --> `10`
 - `"best of " + lower case("IMicros")` w/o context --> `"best of imicros"` 
 - `[{a:3,b:1},{a:4,b:2}][item.a > 3]` w/o context --> `[{a:4,b:2}]`
 - `[1,2,3,4,5,6,7,8,9][a*(item+1)=6]` with context `{a:2}` --> `[2]`
 - `a+b > c+d` with context `{a:5,b:4,c:3,d:5}` --> `true`
 - `flight list[item.status = "cancelled"].flight number` with context `{"flight list": [{ "flight number": 123, status: "boarding"},{ "flight number": 234, status: "cancelled"}]}` --> `[234]`
 - `{calc:function (a:number,b:number) a-b, y:calc(b:c,a:d)+3}.y` with context `{c:4,d:5}` --> `4`
 - `deep.a.b + deep.c` with context `{deep:{a:{b:3},c:2}}` --> `5`
 - `{a:3}.a`w/o context --> `3`
 - `extract("references are 1234, 1256, 1378", "12[0-9]*")` w/o context --> `["1234","1256"]`
 - `(a+b)>(8.9) and (c+d)>(8.1)` with context `{a:5,b:4,c:4,d:5}`--> `true`
 - `@"2022-04-10T13:15:20" + @"P1M"` w/o context --> `"2022-05-10T13:15:20"`
 - `day of year(@"2022-04-16")` w/o context --> `106`
 - `@"P7M2Y" + @"P5D"` w/o context --> `"P5D7M2Y"`
 - `{ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),  "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee }.MonthlyPayment` with context `{Loan: { amount: 600000, rate: 0.0375, term:360 }, fee: 100}` --> `2878.6935494327668`
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

# Supported expressions
(not the complete list - refer to the test cases for a complete list of tested expressions)
## Arithmetic
Muliplication: *, Division: /, Addition: +, Subtraction: -, Exponentation: **  
 - `(x - 2)**2 + 3/a - c*2`

Negation: -
 - `-5`
## Boolean
And: and, Or: or

Equal to: =, not equal to: !=, less than: <, less than or equal to: <=, greater than: >, greater than or equal to: >=
 - `5 = 5 and 6 != 5 and 3 <= 4 and date("2022-05-08") > date("2022-05-07")`  --> `true`

Existence check: is defined(var)
 - `is defined({x:null}.x)` --> `true`
 - `is defined({}.x)` --> `false`

Negation: not(***expression***)
- `{a:5,b:3,result: not(a<b)}.result` --> `true`

Type check: ***expression*** instance of ***type***
- `a instance of b` with context `{a:3,b:5}` --> `true`
- `a instance of string` with context `{a:"test"}` --> `true`
- `a instance of number` with context `{a:3}` --> `true`
- `a instance of boolean` with context `{a:true}` --> `true`

## String
Concatenate: + (only possible with both terms type string)
 - `"foo" + "bar"` --> `"foobar"`

## Context and path
Context is a defintion in JSON notation with { ***key***: ***value*** }.  
The key must evaluate to a string, the value can be any expression (including function definitions and complete decision table calls).  
With the .***name*** notation an attribute of the context is accessed.
- `{a:3}.a` --> `3`
- `deep.a.b + deep.c` with context `{deep:{a:{b:3},c:2}}` --> `5`
- `{calc:function (a:number,b:number) a-b, y:calc(b:c,a:d)+3}.y` with context `{c:4,d:5}` --> `4`
- `{calc:function (a:number,b:number) a+b, y:calc(4,5)+3}` --> `{y:12}`

## Filter (Lists)
Get element by index (index count is starting with 1)
- `[1,2,3,4][2]` --> `2`

Negative indices are counted from the end
- `[1,2,3,4][-1]` --> `3`
- `[1,2,3,4][-0]` --> `4`

Reduce list based on logic expression - variable ***item*** is the current element
- `[1,2,3,4][item > 2]` --> `[3,4]` 
- `[1,2,3,4,5,6,7,8,9][a*(item+1)=6]` with context `{a:2}` --> `[2]`
- `[1,2,3,4][even(item)]` --> `[2,4]`
- `flight list[item.status = "cancelled"].flight number` with context `{"flight list": [{ "flight number": 123, status: "boarding"},{ "flight number": 234, status: "cancelled"}]}` --> `[234]`

## Temporal
Date or date and time expressions as well as durations can be written with the @***String*** notation
- `@"2022-05-10T13:15:20" - @"P1M"` --> `"2022-04-10T13:15:20"`
- `@"13:45:20" - @"PT30M"` --> `"13:15:20"`
- `date("2022-05-14") - date("2020-09-10")` --> `"P4D8M1Y"`
- `date("2020-09-10")-date("2022-05-14")` --> `"-P4D8M1Y"`

Comparison with <,<=,>,>=,=   
Additon/Subtraction with ***date***|***date and time*** +/- ***duration***  
- `date("2022-04-05") < date("2022-04-06")` --> `true`
- `date and time("2022-04-15T08:00:00") = date and time("2022-04-15T00:00:00") + @"P8H"` --> `true`
- `@"P5D" > @"P2D"` --> `true`
- `@"P5D" > @"P4DT23H"` --> `true`

Comparison with in ***interval***  
- `date("2022-04-05") in [date("2022-04-04")..date("2022-04-06")]` --> `true`
- `(date("2022-04-01")+duration("P3D")) in [date("2022-04-04")..date("2022-04-06")]` --> `true`

Comparison with between ***date***|***date and time*** and ***date***|***date and time***
- `date("2022-04-05") between date("2022-04-04") and date("2022-04-06")` --> `true`

Access of attributes of the temporal type
- `@"2022-04-10".month` --> `4`
- `date("2022-04-10").day` --> `10`
- `date and time("2022-04-10T13:15:20").year` --> `2022`
- `date and time("2022-04-10T13:15:20").hour` --> `13`
- `date and time("2022-04-10T13:15:20").minute` --> `15`
- `date and time("2022-04-10T13:15:20").second` --> `20`
- `@"P12D5M".months` --> `5`
- `today().year` --> current year
- `now().minute` --> current minute
- `day of week(@"2022-04-16")` --> `"Saturday"`
- `day of year(@"2022-04-16")` --> `106`
- `week of year(@"2022-04-16")` --> `15`
- `abs(@"-P7M2Y")` --> `"P7M2Y"`

## If
if ***condition*** then ***expression*** else ***expression***
- `if 1 > 2 then 3 else 4`

## For
for ***name*** in ***iteration context*** return ***expression***
- `for a in [1,2,3] return a*2` -->  `[2,4,6]`

## Comments
single line comments starting with `//` until the end of the line
single line or multiline comments framed with `/*` and `*/`.

```
/*  start 
    comment */ 
decision table(
    outputs: ["Applicant Risk Rating"],  
    inputs: ["Applicant Age","Medical History"],
    /* multi line
        between */
    rule list: [
        [>60,"good","Medium"],
        [>60,"bad","High"],
        [[25..60],-,"Medium"],
        /**** 
         * important comment 
         ****/
        [<25,"good","Low"],
        [<25,"bad","Medium"] // single line comment
    ],
    hit policy: "Unique"
) /* end comment */
```
# Supported build-in functions

## Conversion
 - `date(from|year,month,day)`
 - `time(from|hour,minute,second,offset?)` with offset type duration (e.g. @"PT1H")
 - missing: date and time(from - with named parameter|date,time)
 - `years and months duration(from,to)` with from,to type date
 - `number(from)` with from type string
 - `string(from)`
 - `context(entries)` with entries type object with attributes key and value (e.g. {key: "a",value: 1})
## Temporal
 - `today()`
 - `now()` 
 - `day of week(date)`
 - `day of year(date)`
 - `week of year(date)`
 - `month of year(date)`
 - `abs(duration)`

## Arithmetic
 - `decimal(n,scale)`
 - `floor(n)`
 - `ceiling(n)`
 - `round up(n,scale?)`
 - `round down(n,scale?)`
 - `round half up(n,scale?)`
 - `round half down(n,scale?)`
 - `abs(number)`
 - `modulo(dividend,divisor)`
 - `sqrt(number)`
 - `log(number)`
 - `exp(number)`
 - `odd(number)`
 - `even(number)`

## Logical
 - `is defined(value)`
 - `not(negand)`

## Ranges
 - `before(a,b)` with a,b either point or interval
 - `after(a,b)` with a,b either point or interval
 - `meets(a,b)` with a,b intervals 
 - `met by(a,b)` with a,b intervals
 - `overlaps(a,b)` with a,b intervals
 - `overlaps before(a,b)` with a,b intervals
 - `overlaps after(a,b)` with a,b intervals
 - `finishes(a,b)` with a eiter point or interval and b interval
 - `finished by(a,b)` with a interval and b either point or interval
 - `includes(a,b)` with a interval and b either point or interval
 - `during(a,b)` with a eiter point or interval and b interval
 - `starts(a,b)` with a eiter point or interval and b interval
 - `started by(a,b)` with a interval and b either point or interval
 - `coinsides(a,b)` with a,b either both points or both intervals

## Lists
 - `list contains(list,element)`
 - `count(list) / count(...item)`
 - `min(list) / min(...item)`
 - `max(list) / max(...item)`
 - `sum(list) / sum(...item)`
 - `product(list) / product(...item)`
 - `mean(list) / mean(...item)`
 - `median(list) / median(...item)`
 - `stddev(list) / stddev(...item)`
 - `mode(list) / mode(...item)`
 - `all(list) / all(...item)`
 - `and(list)`
 - `any(list) / any(...item)`
 - `or(list)`
 - `sublist(list, startposition, length?)`
 - `append(list,...item)`
 - `union(...list)`
 - `concatenate(...list)`
 - `insert before(list,position,newItem)`
 - `remove(list,position)`
 - `reverse(list)`
 - `index of(list,match)`
 - `distinct values(list)`
 - `flatten(list)`
 - `sort(list,precedes)`
 - `string join(list,delimiter?,prefix?,suffix?)`

## Strings
 - `substring(string,start,length)`
 - `string length(string)`
 - `upper case(string)`
 - `lower case(string)`
 - `substring before(string,match)`
 - `substring after(string,match)`
 - `contains(string,match)`
 - `starts with(string,match)`
 - `ends with(string,match)`
 - `matches(input,pattern)`
 - `replace(input,pattern,replacement,flags)`
 - `split(string,delimiter)`
 - `extract(string,pattern)`

## Context
 - `get value(context,key)`
 - `get entries(context)`
 - `put(context,key,value)`
 - `put all(entries)`

## Decisions
 - `boxed expression(context,expression)`
 - `decision table(output, input, rule list, hit policy)` (supported hit policies: "U"|"Unique","A"|"Any","F"|"First","R"|"Rule order","C"|"Collect","C+"|"C<"|"C>"|"C#")

# Complete (complex) decisions
Also complex decisions like the example under assets/Sample.dmn can be written as a complex FEEL expression and evaluated - here for example as a context returning the last evaluated context entry.

```
const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

let exp = `
{   "Lender Acceptable DTI": function () 0.36,
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
                    inputs: ["Credit Score Rating","Back End Ratio","Front End Ratio"],
                    rule list: [
                        [["Poor","Bad"],-,-,"Not Qualified","Credit Score too low."],
                        [-,"Insufficient","Sufficient","Not Qualified","Debt to income ratio is too high."],
                        [-,"Sufficient","Insufficient","Not Qualified","Mortgage payment to income ratio is too high."],
                        [-,"Insufficient","Insufficient","Not Qualified","Debt to income ratio is too high AND mortgage payment to income ratio is too high."],
                        [["Fair","Good","Excellent"],"Sufficient","Sufficient","Qualified","The borrower has been successfully prequalified for the requested loan."]
                    ],
                    hit policy: "F"
                )
}.Loan PreQualification
`
let success = interpreter.parse(exp);
if (!success) console.log(interpreter.error);

result = interpreter.evaluate(exp,{
    "Credit Score": { FICO: 700 }, 
    "Applicant Data": { Monthly: { Repayments: 1000, Tax: 1000, Insurance: 100, Expenses: 500, Income: 5000 } },
    "Requested Product": { Amount: 600000, Rate: 0.0375, Term: 360 }
});

console.log(result);
// {
//   Qualification: 'Qualified',
//   Reason: 'The borrower has been successfully prequalified for the requested loan.'
// }

```



