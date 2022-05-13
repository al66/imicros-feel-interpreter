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
## Features
 - Complete support of [DMN 1.4](https://www.omg.org/spec/DMN/1.4/Beta1/PDF). Known restrictions see below.
 - Provide build-in functions as listed below.

## Restrictions
 - Additional name symbols (./-+* according rule 30. of the sepcification) as well as keywords (for,return,if,true,false,in,and,or,between,some,every,then,else,not,string,number,boolean,null,date,time,duration) in names are ***not*** supported. (The package uses nearley as parser and I didn't found a way to implement the ambiguity). White spaces are allowed and normalized (doubled spaces will be replaced by just one space). Therefore expresssions like ***{"new example": 5}.new &nbsp;&nbsp; example*** as well as ***{ "new &nbsp;&nbsp;&nbsp; example": 5}.new example*** will work. 
 - No external functions are supported.
 - The precision of mathemathic calculations are not comparable to a scientific calculator. The expression `{ "PMT": function (p:number,r:number,n:number) (p*r/12)/(1-(1+r/12)**-n),  "MonthlyPayment": PMT(Loan.amount, Loan.rate, Loan.term) + fee }.MonthlyPayment` with the context `{Loan: { amount: 600000, rate: 0.0375, term:360 }, fee: 100}` calculates to `2878.693549432746`. With a scientific calculator it calculates to `2878.6935494327667680885203...` - there is a deviation at the 11th decimal place.

## Performance considerations
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
 - `{calc:function (a:number,b:number) a-b, y:calc(b:c,a:d)+3}.y` with context `{c:4,d:5}` --> 4
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

# Supported expressions
(list is not complete and will be continued)
## Arithmetic
Muliplication: *, Division: /, Addition: +, Subtraction: -, Exponentation: **  
 - `(x - 2)**2 + 3/a - c*2`

Negation: -
 - `-5`
## Boolean
And: and, Or: or

Equal to: =, not equal to: !=, less than: <, less than or equal to: <=, greater than: >, greater than or equal to: >=
 - `5 = 5 and 6 != 5 and 3 <= 4 and date("2022-05-08") > date("2022-05-07")`  --> true

Existence check: is defined(var)
 - `is defined({x:null}.x)` --> true
 - `is defined({}.x)` --> false
## String
Concatenate: + (only possible with both terms type string)
 - `"foo" + "bar"` --> "foobar"
# Supported build-in functions

## Conversion
 - `date(from|year,month,day)`
 - `time(from|hour,minute,second,offset?)` - missing: optional offset
 - missing: date and time(from - with named parameter|date,time)
 - missing: years and months duration(from,to)
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
 - `substring(strung,start,length)`
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
 - `decision table(output, input, rule list, hit policy)` (currently just hitpolicy unique, but will be enhanced soon)





