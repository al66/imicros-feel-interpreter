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
# Supported build-in functions
## Arithmetic

## Lists

## Strings

## Decisions





