/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

const nearley = require("nearley");
const grammar = require("./feel.grammar.js");
const Node = require("./ast.js");
const { Temporal, DateAndTime, DateOnly,  Time, Duration, YearsAndMonthDuration, DaysAndTimeDuration} = require("./datetime.js");
const { Strings } = require("./strings.js");
const Decimal = require('decimal.js');
Decimal.set({ precision: 64 })
const Composer = require("./composer.js").Composer;
const { Logger } = require("./logger.js");

const _ = require("./lodash");

const util = require('util');

const { create, all, re, number } = require('mathjs');
const { type } = require("os");
const bigmath = create(all, {
    number: 'BigNumber', // Choose 'number' (default), 'BigNumber', or 'Fraction'
    precision: 34 // Number of significant digits for BigNumbers
})

class InterpreterError extends Error {
    constructor(e,  { node, error }) {
        super(e);
        Error.captureStackTrace(this, this.constructor);
        this.message = e.message || e;
        this.name = this.constructor.name;
        this.node = node;
        this.error = error;
    }
}

class ParserError extends Error {
    constructor(e,  { text, position, offset, line, col, original }) {
        super(e);
        Error.captureStackTrace(this, this.constructor);
        this.message = ( e.message || e ) + " at position '" + position + "' (line " + line + ", col " + col + ")";
        this.name = this.constructor.name;
        this.text = text;
        this.position = position;
        this.offset = offset;
        this.line = line;
        this.col = col;
        this.error = e;
        this.original = original;
    }
}

class FeelError extends Error {
    constructor(e,  { node, error }) {
        super(e);
        Error.captureStackTrace(this, this.constructor);
        this.message = e.message || e;
        this.name = this.constructor.name;
        this.node = node;
        this.error = error;
    }
}


function substituteInternals(obj) {
    if (Array.isArray(obj)) {
        return obj.map(substituteInternals); // Recursively handle arrays
    } else if (obj && typeof obj === "object") {
        if (obj instanceof Decimal) return obj.toDecimalPlaces(34).toNumber();  // Truncate to 34 decimal places
        if (obj instanceof Temporal) return obj.exp;                            // Substitute Temporal instances with their `exp` property
        return Object.entries(obj).reduce((acc, [key, value]) => {
            acc[key] = substituteInternals(value); // Recursively handle objects
            return acc;
        }, {});
    }
    return obj; // Return the value as is if no substitution is needed
}

function mapToInternals(obj) {
    if (Array.isArray(obj)) {
        return obj.map(mapToInternals); // Recursively handle arrays
    } else if (obj && typeof obj === "number") {
        return new Decimal(obj); // Convert numbers to Decimal instances
    } else if (obj && typeof obj === "object") {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            acc[key] = mapToInternals(value); // Recursively handle objects
            return acc;
        }, {});
    }
    return obj; // Return the value as is if no substitution is needed
}

function deepClone(obj) {
    if (Array.isArray(obj)) {
        return obj.map(deepClone);                                  // Recursively handle arrays
    } else if (obj && typeof obj === "object") {
        if (obj instanceof Decimal) return new Decimal(obj);        // Clone Decimal instances
        if (obj instanceof Temporal) return obj.clone();            // Clone Temporal instances
        return Object.entries(obj).reduce((acc, [key, value]) => {
            acc[key] = deepClone(value);                            // Recursively handle objects
            return acc;
        }, {});
    }
    if (typeof obj === "number") return new Decimal(obj);           // Convert numbers to Decimal instances
    return obj;                                                     // Return the value as is if no clone is needed
}

function objectAreEqual( x, y ) {
    if ( x === y ) return true;
      // if both x and y are null or undefined and exactly the same
  
    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
      // if they are not strictly equal, they both need to be Objects
  
    if ( x.constructor !== y.constructor ) return false;
      // they must have the exact same prototype chain, the closest we can do is
      // test there constructor.
  
    for ( var p in x ) {
      if ( ! x.hasOwnProperty( p ) ) continue;
        // other properties were tested using x.constructor === y.constructor
  
      if ( ! y.hasOwnProperty( p ) ) return false;
        // allows to compare x[ p ] and y[ p ] when set to undefined
  
      if ( x[ p ] === y[ p ] ) continue;
        // if they have the same strict value or identity then they are equal
  
      if ( typeof( x[ p ] ) !== "object" ) return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal
  
      if ( ! objectAreEqual( x[ p ],  y[ p ] ) ) return false;
        // Objects and Arrays must be tested recursively
    }
  
    for ( p in y )
      if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) )
        return false;
          // allows x[ p ] to be set to undefined
  
    return true;
  }

class Interpreter {

    constructor () {
        this.logger = new Logger();
    }
 
    parse (exp) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

        try {
            this.error = null;
            parser.feed(exp);
            this.ast = parser.results;
            this.exp = exp;
            return true;
        } catch(e) {
            this.ast = {};
            //console.log("Parser error",e);
            this.error = {
                text: e.token?.text || null,
                position: exp.substring(e.token?.offset > 10 ? e.token?.offset - 100 : 0, e.token?.offset || 0),
                offset: e.token?.offset || null,
                line: e.token?.line || null,
                col: e.token?.col || null,
                original: e
            };
            this.logger.error({
                type: "Parser",
                message: e.message,
                ...this.error
            });
            //console.log("Parser error",util.inspect(this.error, { showHidden: false, depth: null, colors: true }));
            throw new ParserError("Parsing failed",this.error);
        } 
    }

    evaluate ({ expression, context } = {}) {
        this.data = {};
        this.error = null;
        this.composer = new Composer();
        if (expression || context) {
            if (expression) this.parse(expression);
            this.data = structuredClone(context) || {};
        } else {
            if (arguments.length > 1) {
                this.parse(arguments[0]);
                this.data = structuredClone(arguments[1])
            } else if (typeof arguments[0] === "string" ) {
                this.parse(arguments[0]);
                this.data = {};
            } else {
                this.data = structuredClone(arguments[0]);
            }
        }
        if (this.ast && this.ast.length) {
            if (!this.ast.length > 0) {
                this.error = {
                    exp: this.exp,
                    number: 300 // 300 no parsing result
                };
                return null;
            // TODO should be checked, but already as a part of parse method  - currently 2 of the interpreter tests are with more than 1 result 
            /*
            } else if (this.ast.length > 1) {
                console.log(this.ast);
                this.error = {
                    exp: this.exp,
                    number: 400 // 400 multiple parsing results
                };
                return null;
            */
            }
        } 
        if (!this.error) {
            this.decisionContext = {};
            this.functionDefinitions = {};
            this.logger.add({
                type: "Data",
                value: this.data
            })
            try {
                const result = substituteInternals(this._build(this.ast[0], this.data));
                return result;
            } catch(e) {
                this.error = {
                    exp: this.exp,
                    number: 200, // 200 evaluation error
                    message: e.message
                };
                throw e;
            }
        }
        return null;
    }

    getAst() {
        return this.ast;
    }

    setAst(ast) {
        this.ast = ast;
    }

    setDecision(decision) {
        this.decision = decision;
    }

    getDecision() {
        return this.decision;
    }

    getType(value) {
        if (value instanceof DateAndTime) return "date and time";
        if (value instanceof DateOnly) return "date";
        if (value instanceof Time) return "time";
        if (value instanceof YearsAndMonthDuration) return "years and months duration";
        if (value instanceof DaysAndTimeDuration) return "days and time duration";
        if (value instanceof Duration) return "duration";
        if (value instanceof Temporal) return "temporal";
        if (value instanceof Decimal) return "decimal";
        return typeof value;
    }

    toNumber(value) {
        if (value instanceof Decimal) return value.toNumber();
        return value;
    }

    compare(a, b)  {
        if ( a instanceof Decimal && b instanceof Decimal ) {
            return a.cmp(b);
        } else if ( a instanceof Temporal && b instanceof Temporal ) {
            if ( a.value < b.value ) return -1;
            if ( a.value > b.value ) return 1;
            return 0;
        } else if (typeof a === 'object' && typeof b === 'object') {
            // cannot compare objects, so check if they are equal
            return objectAreEqual(a,b) ? 0 : -1;
        } else {
            if ( a < b ) return -1;
            if ( a > b ) return 1;
            return 0;
        }
    }
    
    getScaleParameter(value) {
        let scale;
        if (value instanceof Decimal) {
            scale = value.toNumber();
        } else if (typeof value === 'number') {
            scale = value;
        }
        // invalid type
        if (typeof scale !== 'number') throw new Error("Invalid scale parameter: " + value);
        //If scale is decimal numbers, the implicit conversion from decimal to integer is applied.
        scale = Math.floor(scale);
        // Scale must be in the range [−6111..6176]
        if (scale < -6111 || scale > 6176) throw new Error("Scale parameter out of allowed range [−6111..6176]: " + value);
        return scale;
    }


    _build (node,context) {
        if (!node) return "#undefined";
        /* istanbul ignore else */
        if (this["__"+node.node] && {}.toString.call(this["__"+node.node]) === "[object Function]") {
            let result = null;
            try {
                result = this["__"+node.node](node,context);
            } catch (e) {
                this.logger.error({
                    type: "Build",
                    name: node.node,
                    message: e.message
                });
            }
            return result;
        } else {
            //console.log("_build",util.inspect(node, { showHidden: false, depth: null, colors: true }));
            throw new Error("Interpreter - missing function " + node.node, node);
        }
    }


    __NUMBER (node) {
        //let value = bigmath.bignumber(node.float);
        let value = new Decimal(node.float);
        this.logger.debug({
            type: "Number",
            number: node,
            value: value
        });
        return value;
    }

    __NAME (node,context) {
        let tmp = undefined;
        if (context && node.value in context) tmp = context[node.value];
        if (tmp === undefined && this.decisionContext && node.value in this.decisionContext) tmp = this.decisionContext[node.value];
        if (tmp === undefined) tmp = this.data[node.value];
        let value = null;
        if (typeof tmp === 'number') {
            value = new Decimal(tmp);
        } else if (tmp instanceof Decimal) {
            value = new Decimal(tmp);
        } else if (tmp instanceof Temporal) {
            value = tmp.clone();
        } else if (tmp !== undefined) {
            value = deepClone(tmp);
        }
        this.logger.debug({
            type: "Name",
            name: node.value,
            value
        });
        return value;
    }

    __BOOLEAN (node) {
        return node.value;
    }


    __STRING (node) {
        return node.value.replace(/^"(.+)"$/,'$1');
    }

    __NULL (node) {
        return null;
    } 

    __DASH (node) {
        return true;
    }

    __SUM (node,context) {
        let result;
        let left = this._build(node.left,context);
        const right = this._build(node.right,context);
        // one term is null -> null
        if (left === null || right === null) throw new Error(`Cannot evaluate sum with null values - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        // one term is undefined -> null
        if (left === undefined || right === undefined) throw new Error(`Cannot evaluate sum with undefined values - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        // one term is context -> null
        if (typeof left === 'object' && !(left instanceof Decimal) && !(left instanceof Temporal)) throw new Error(`Cannot evaluate sum with context - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        if (typeof right === 'object' && !(right instanceof Decimal) && !(right instanceof Temporal)) throw new Error(`Cannot evaluate sum with context - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        //*** spec table 58: number +/- number */
        if ( typeof left === 'number' && typeof right !== 'number' ) throw new Error(`Cannot evaluate sum with number and other term - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        if ( typeof left !== 'number' && typeof right === 'number' ) throw new Error(`Cannot evaluate sum with number and other term - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        //*** spec table 58: date and time + date and time not defined  */
        if ( left instanceof DateAndTime && right instanceof DateAndTime && node.operator === "+") throw new Error(`Cannot evaluate sum with date and time - operator: ${ node.operator }, left: ${left.exp}, right: ${right.exp}`);
        //*** spec table 58: time + time not defined  */
        if ( left instanceof Time && right instanceof Time && node.operator === "+") throw new Error(`Cannot evaluate sum with time - operator: ${ node.operator }, left: ${left.exp}, right: ${right.exp}`);
        //*** spec table 58: years and month duration - date and time not defined  */
        if ( left instanceof YearsAndMonthDuration && right instanceof DateAndTime && node.operator === "-") throw new Error(`Cannot evaluate substraction with years and month duration - operator: ${ node.operator }, left: ${left.exp}, right: ${right.exp}`);
        //*** spec table 58: years and month duration +/- time not defined  */
        if ( left instanceof YearsAndMonthDuration && right instanceof Time && node.operator === "+") throw new Error(`Cannot evaluate sum with years and month duration - operator: ${ node.operator }, left: ${left.exp}, right: ${right.exp}`);
        //*** spec table 58: years and month duration - date not defined  */
        if ( left instanceof YearsAndMonthDuration && right instanceof DateOnly && node.operator === "-") throw new Error(`Cannot evaluate substraction with years and month duration - operator: ${ node.operator }, left: ${left.exp}, right: ${right.exp}`);
        //*** spec table 58: days and time duration - date and time not defined  */
        if ( left instanceof DaysAndTimeDuration && right instanceof DateAndTime && node.operator === "-") throw new Error(`Cannot evaluate substraction with days and time duration - operator: ${ node.operator }, left: ${left.exp}, right: ${right.exp}`);
        //*** spec table 58: days and time duration - date and time not defined  */
        if ( left instanceof DaysAndTimeDuration && right instanceof Time && node.operator === "-") throw new Error(`Cannot evaluate substraction with days and time duration - operator: ${ node.operator }, left: ${left.exp}, right: ${right.exp}`);
        //*** spec table 58: days and time duration - date not defined  */
        if ( left instanceof DaysAndTimeDuration && right instanceof DateOnly && node.operator === "-") throw new Error(`Cannot evaluate substraction with days and time duration - operator: ${ node.operator }, left: ${left.exp}, right: ${right.exp}`);
        //*** spec table 58: string + string */
        // both terms ar strings and oprator is minus -> null
        if (typeof left === 'string' && typeof right === 'string' && node.operator === "-") throw new Error(`Cannot evaluate substraction with string - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        // left term is string - right term must be also string -> otherwise null
        if (typeof left === 'string' && typeof right !== 'string' && !(right instanceof Temporal)) throw new Error(`Cannot evaluate sum with string and other term - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        if (typeof left !== 'string' && typeof right === 'string' && !(left instanceof Temporal)) throw new Error(`Cannot evaluate sum with string and other term - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        //*** spec table 58: boolean +/- boolean not defined */
        if (typeof left === 'boolean' || typeof right === 'boolean') throw new Error(`Cannot evaluate sum with boolean - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        switch (node.operator) {
            case "-": {
                if (left instanceof Temporal) {
                    result = left.subtract(right);
                } else if (right instanceof Temporal) {
                    //try to convert left to temporal
                    left = Temporal.parse(left);
                    result = left.subtract(right);
                } else if (left instanceof Decimal && right instanceof Decimal) {
                    result = left.minus(right);
                } else {
                    result = left - right;
                }
                break;
            }
            case "+": {
                if (left instanceof Temporal) {
                    result = left.add(right);
                } else if (right instanceof Temporal) {
                    //try to convert left to temporal
                    left = Temporal.parse(left);
                    result = left.add(right);
                } else if (left instanceof Decimal && right instanceof Decimal) {
                    result = left.add(right);
                } else {
                    result = left + right;
                } 
                break;
            }
        }
        if (result == null) throw new Error(`Cannot evaluate sum with these values- operator: ${ node.operator }, left: ${left}, right: ${right}`);
        this.logger.debug({
            type: "Sum",
            operator: node.operator,
            left,
            right,
            result,
            type: typeof result
        });
        return result;
    }

    __PRODUCT (node,context) {
        let result;
        const left = this._build(node.left,context);
        const right = this._build(node.right,context);
        if (left === null || right === null) throw new Error(`Cannot evaluate product with null values - operator: ${ node.operator }, left: ${left}, right: ${right}`);
        switch (node.operator) {
            case "/": {
                const divisor = new Decimal(right || NaN).toNumber();
                if (divisor === 0) throw new Error(`Division by zero - operator: ${ node.operator }, left: ${left}, right: ${right}`);
                if (isNaN(divisor)) throw new Error(`Division by NaN - operator: ${ node.operator }, left: ${left}, right: ${right}`);
                if (left instanceof Decimal && right instanceof Decimal) {
                    result = left.div(right);
                }
                break; 
            }
            case "*": {
                if (left instanceof Decimal && right instanceof Decimal) {
                    result = left.mul(right);
                }
                break;
            }
        }
        if (result == null) throw new Error(`Cannot evaluate product with these values- operator: ${ node.operator }, left: ${left}, right: ${right}`);
        this.logger.debug({
            type: "Product",
            operator: node.operator,
            left,
            right,
            result,
            type: typeof result
        });
        return result;
    }

    __EXPONENTATION (node,context) {
        let result;
        const base = this._build(node.left,context);
        const exponent = this._build(node.right,context);
        // check if exponent is null
        if (exponent === null) throw new Error(`Cannot evaluate exponentiation with null values - operator: ${ node.operator }, base: ${base}, exponent: ${exponent}`);
        // exponent is string
        if (typeof exponent === 'string' || typeof base === 'string') throw new Error(`Cannot evaluate exponentiation with string value - operator: ${ node.operator }, base: ${base}, exponent: ${exponent}`);
        // exponent is boolean
        if (typeof exponent === 'boolean' || typeof base === 'boolean') throw new Error(`Cannot evaluate exponentiation with boolean value - operator: ${ node.operator }, base: ${base}, exponent: ${exponent}`);
        // exponent is Temporal
        if (exponent instanceof Temporal) throw new Error(`Cannot evaluate exponentiation with temporal value - operator: ${ node.operator }, base: ${base}, exponent: ${exponent}`);
        // exponent is not Decimal
        if (!(exponent instanceof Decimal)) {
            if (typeof exponent === 'number') {
                exponent = new Decimal(exponent);
            } else {
                throw new Error(`Cannot evaluate exponentiation with this value - operator: ${ node.operator }, base: ${base}, exponent: ${exponent}`);
            }
        }
        // base is not Decimal
        if (!(base instanceof Decimal)) {
            if (typeof base === 'number') {
                base = new Decimal(base);
            } else {
                throw new Error(`Cannot evaluate exponentiation with this value - operator: ${ node.operator }, base: ${base}, exponent: ${exponent}`);
            }
        }
        result = base.pow(exponent);
        this.logger.debug({
            type: "Exponentiation",
            base,
            exponent,
            result
        });
        return result;
    }

    __NEGATION (node,context) {
        // check if expression is null or undefined
        if (node.expression === null || node.expression === undefined) throw new Error(`Cannot evaluate negation with null or undefined value`);
        const value = this._build(node.expression,context);
        let result;
        if (value instanceof Decimal) {
            result = value.negated();
        } else if (value instanceof Duration) {
            result = value.negate();
        } else {
            throw new Error(`Cannot evaluate negation with this value "${value}"`);
        }
        this.logger.debug({
            type: "Negation",
            value,
            result
        });
        return result;
    }

    __COMPARISON (node,context) {
        let left = this._build(node.left,context);
        let right = this._build(node.right,context);
        //if (left instanceof Temporal) left = left.value;
        //if (right instanceof Temporal) right = right.value;
        // if (context?._debug) console.log(node.left, context, right);
        let result = null;
        switch (node.operator) {
            case "=": {
                if (left instanceof Decimal && right instanceof Decimal) {
                    result = left.eq(right);
                } else if (left instanceof Temporal && right instanceof Temporal) {
                    result = left.value == right.value;
                } else {
                    result = left == right;
                }
                break;
            }
            case "<": {
                if (left instanceof Decimal && right instanceof Decimal) {
                    result = left.lt(right);
                } else if (left instanceof Temporal && right instanceof Temporal) {
                    result = left.value < right.value;
                } else {
                    result = left < right;
                }
                break;
            }
            case ">": {
                if (left instanceof Decimal && right instanceof Decimal) {
                    result = left.gt(right);
                } else if (left instanceof Temporal && right instanceof Temporal) {
                    result = left.value > right.value;
                } else {
                    result = left > right;
                }
                break;
            }
            case ">=": {
                if (left instanceof Decimal && right instanceof Decimal) {
                    result = left.gte(right);
                } else if (left instanceof Temporal && right instanceof Temporal) {
                    result = left.value >= right.value;
                } else {
                    result = left >= right;
                }
                break;
            }
            case "<=": {
                if (left instanceof Decimal && right instanceof Decimal) {
                    result = left.lte(right);
                } else if (left instanceof Temporal && right instanceof Temporal) {
                    result = left.value <= right.value;
                } else {
                    result = left <= right;
                }
                break;
            };
            case "!=": {
                if (left instanceof Decimal && right instanceof Decimal) {
                    result = !left.eq(right);
                } else if (left instanceof Temporal && right instanceof Temporal) {
                    result = left.value !== right.value;
                } else {
                    result = left !== right;
                }
                break;
            }
        }
        this.logger.debug({
            type: "Comparison",
            operator: node.operator,
            left,
            leftType: this.getType(left),
            right,
            rightType: this.getType(right),
            result
        });
        return result;
    }

    __LOGICAL (node,context) {
        switch (node.operator) {
            case "and": return this._build(node.left,context) && this._build(node.right,context);
            case "or": return this._build(node.left,context) || this._build(node.right,context);
        }
    }

    __NOT (node,context) {
        const value = this._build(node.parameters,context);
        // undefined or null -> null
        if (value === undefined || value === null) throw new Error(`Cannot evaluate not with null or undefined value`);
        // string, number -> null
        if (typeof value === 'string' || typeof value === 'number' || value instanceof Decimal) throw new Error(`Cannot evaluate not with string or number value`);   
        // date, time, duration -> null
        if (value instanceof Temporal) throw new Error(`Cannot evaluate not with date, time or duration value`);
        const result = !value;
        this.logger.debug({
            type: "Not",
            value,
            result
        });  
        return result;
    }

    __EVAL (node,context) {
        return this._build(node.expression,context);
    } 

    __LIST (node,context) {
        let list = [];
        if (Array.isArray(node.entries)) {
            node.entries.forEach((entry) => {
                list.push(this._build(entry,context));
            });
        }
        this.logger.debug({
            type: "List",
            name: node.name,
            entries: node.entries,
            result: list
        });
        return list;
    }

    __PATH (node, context) {
        let obj = this._build(node.object, context);
        if (Array.isArray(obj)) {
            let projection = [];
            obj.forEach((entry) => {
                projection.push(entry && node.property && node.property.value ? entry[node.property.value] : null);
            });
            return projection;
        }
        let tmp = obj && node.property && node.property.value ? ( obj[node.property.value] === undefined ? null : obj[node.property.value] ) : null;
        let value = tmp ;
        // cast to decimal if number
        if (typeof tmp === 'number') {
            value = new Decimal(tmp);
        // clone if decinal
        } else if (tmp instanceof Decimal) {
            value = new Decimal(tmp);
        // clone if date, time, duration
        } else if (tmp instanceof Temporal) {
            value = tmp.clone();
        } else {
            value = deepClone(tmp);
        }
        this.logger.debug({
            type: "Path",
            object: obj,
            property: node.property?.value,
            value
        });
        return value;
    }

    __IF (node) {
        return this._build(node.condition) ? this._build(node.then) : this._build(node.else);
    }

    __CONTEXT (node,context) {
        let result = {};
        if (node.data && Array.isArray(node.data.entries)) {
            node.data.entries.forEach((entry) => {
                let element = this._build(entry,context);
                if (element) {
                    // normalize spaces in key
                    element.key = element.key.replace(/\s\s+/g, ' ');
                    result[element.key] = element.value;
                    // store for use in following expressions
                    this.decisionContext[element.key] = element.value;
                }
            });
        }
        this.logger.add({
            type: "Context",
            value: result
        })
        return result;
    }

    __CONTEXT_ENTRY (node,context) {
        try {
            // console.log("_CONTEXT_ENTRY",util.inspect(context, { showHidden: false, depth: null, colors: true }));
            if (node.expression.node === Node.FUNCTION_DEFINITION) {
                const name =  node.key.node === Node.NAME ? node.key.value : this._build(node.key,context);
                this.functionDefinitions[name] = node.expression;
                return null;
            }
            // if from decision, the key is not parsed
            const key = node.key.node === Node.NAME ? node.key.value : ( typeof node.key === 'string' ? node.key : this._build(node.key,context) );
            let result = { key, value: this._build(node.expression,context) };
            this.logger.debug({ type: "Context entry", ...result, expression: node.expression, context });
            return result;
        } catch (e) {
            console.log("_CONTEXT_ENTRY",util.inspect(node, { showHidden: false, depth: null, colors: true }));
            console.log(e);
            throw new InterpreterError(`Failed evaluation of context entry`, { node, context, error: e });
        }
    }

    __DATE_AND_TIME (node,context) {
        // functions date, time, date and time, duration
        let result = null;        
        let parameters = null;
        switch (node.name) {
            case "date": {
                // get parameters
                if (!node.parameters) throw new Error("Missing parameters for date function");
                if (node.parameters.node === Node.LIST && node.parameters.entries.length === 1) {
                    parameters = this.buildParameters(node.parameters,["from"],context);
                } else if (node.parameters.node === Node.LIST && node.parameters.entries.length === 3) {
                    parameters = this.buildParameters(node.parameters,["year","month","day"],context);
                } else {
                    throw new Error("Unvalid parameters for date function");
                }
                // build date
                if (parameters && parameters.year && parameters.month && parameters.day) {
                    const year = this.toNumber(parameters.year);
                    const month = this.toNumber(parameters.month);
                    const day = this.toNumber(parameters.day);
                    result = DateOnly.build({ year, month, day });
                } else if (parameters && parameters.from) {
                    if (parameters.from instanceof DateOnly) {
                        result = parameters.from.clone();                    
                    } else if (parameters.from instanceof DateAndTime) {
                        result = parameters.from.toDateOnly();
                    } else  {
                        result = DateOnly.parse(parameters.from);
                    }
                } else {
                    throw new Error("Date function called with unknown parameters");
                }
                break;
            }
            case "time": {
                // get parameters
                if (!node.parameters) throw new Error("Missing parameters for time function");
                if (node.parameters.node === Node.LIST && node.parameters.entries.length === 1) {
                    parameters = this.buildParameters(node.parameters,["from"],context);
                } else if (node.parameters.node === Node.LIST && node.parameters.entries.length === 3) {
                    parameters = this.buildParameters(node.parameters,["hour","minute","second"],context);
                } else if (node.parameters.node === Node.LIST && node.parameters.entries.length === 4) {
                    parameters = this.buildParameters(node.parameters,["hour","minute","second","offset"],context);
                } else {
                    throw new Error("Unvalid parameters for time function");
                }
                // build time
                if (parameters && parameters.hasOwnProperty("hour") && parameters.hasOwnProperty("minute") && parameters.hasOwnProperty("second")) {
                    result = Time.build({ ...parameters });
                } else if (parameters && parameters.from) {
                    if (parameters.from instanceof DateAndTime) {
                        result = parameters.from.toTime();                    
                    } else if (parameters.from instanceof DateOnly) {
                        result = parameters.from.toTime();                    
                    } else if (parameters.from instanceof Time) {
                        result = parameters.from.clone();                    
                    } else  {
                        result = Time.parse(parameters.from);
                    }
                } else {
                    throw new Error("Time function called with unknown parameters");
                }
                break;
            }
            case "date and time": {
                // get parameters
                if (!node.parameters) throw new Error("Missing parameters for date and time function");
                if (node.parameters.node === Node.LIST && node.parameters.entries.length === 1) {
                    parameters = this.buildParameters(node.parameters,["from"],context);
                } else if (node.parameters.node === Node.LIST && node.parameters.entries.length === 2) {
                    parameters = this.buildParameters(node.parameters,["date","time"],context);
                } else if (node.parameters.node === Node.LIST && node.parameters.entries.length === 3) {
                    parameters = this.buildParameters(node.parameters,["year","month","day"],context);
                } else {
                    throw new Error("Unvalid parameters for date and time function");
                }
                // build date and time
                if (parameters && parameters.date && parameters.time) {
                    if (parameters.date instanceof DateOnly && parameters.time instanceof Time) {
                        result = DateAndTime.from({ ...parameters });
                    } else if (parameters.date instanceof DateAndTime && parameters.time instanceof Time) {
                        result = DateAndTime.from({ ...parameters });
                    }
                } else if (parameters && parameters.from) {
                    if (parameters.from instanceof DateAndTime) {
                        result = parameters.from.clone();                    
                    } else  {
                        result = DateAndTime.parse(parameters.from);
                    }
                } else {
                    throw new Error("Date and time function called with unknown parameters");
                }
                break;
            }
            case "duration": {
                // get parameters
                if (!node.parameters) throw new Error("Missing parameters for duration function");
                if (node.parameters.node === Node.LIST && node.parameters.entries.length === 1) {
                    parameters = this.buildParameters(node.parameters,["from"],context);
                } else {
                    throw new Error("Unvalid parameters for duration function");
                }
                result =  Duration.parse(parameters.from);
                break;
            }
        }
        this.logger.debug({
            type: "Date and time",
            name: node.name,
            rawParameters: node.parameters,
            parameters,
            value: result,
            exp: result.exp
        });
        return result;
    }

    __AT_LITERAL (node,context) {
        let expression = this._build(node.expression,context);
        let value = Temporal.parse(expression ? expression : null);
        this.logger.add({
            type: "@ Literal",
            name: node.name,
            rawParameters: node.expression,
            parameters: expression,
            value
        });
        return value;
    }

    __FILTER (node) {
        let result = null;
        let list = this._build(node.list);
        if (Array.isArray(list)) {
            switch (node.filter.node) {
                case Node.NUMBER:
                    let i = this.toNumber(this._build(node.filter));
                    result =  i > 0 ? (i <= list.length ? list[i-1] : null) : null;
                    break;
                case Node.NEGATION:
                    let n = this.toNumber(this._build(node.filter));
                    result =  list.length + n > 0 ? list[list.length + n-1] : null;
                    break;
                case Node.NAME:
                    let m = this.toNumber(this._build(node.filter));
                    result =  m >= 0 ? (m <= list.length ? list[m-1] : null) : (list.length + m > 0 ? list[list.length + m-1] : null);
                    break;
                case Node.COMPARISON:
                    let filtered = [];
                    // filter by key
                    if (node.filter.operator === "=" && node.filter.left.node === Node.NAME && node.filter.left.value.toUpperCase() === "KEY") {
                        let key = this._build(node.filter.right);
                        filtered = list.find((item) => { return typeof item === 'object' && item.key === key; });
                    } else {
                        let check = false;
                        list.forEach((item) => {
                            if (this._build(node.filter, { ...item, item }) === true) filtered.push(item);
                        })
                    }
                    result =  filtered;
                    break;
                default:
                    let r = [];
                    list.forEach((item) => {
                        if (this._build(node.filter, { ...item, item }) == true) r.push(item);
                    })
                    result =  r;
                    break;
            }
        }
        this.logger.debug({
            type: "Filter",
            list,
            filter: node.filter,
            result
        });
        return result;
    }

    __FOR (node,context) {
        let list = this._build(node.context);
        const key = node.var?.value || null;
        if (!Array.isArray(list)) return null;
        let r = [];
        list.forEach((item) => {
            const local = {};
            local[key] = item;
            r.push(this._build(node.return, Object.assign(context || {},local)));
        })
        return r;
    } 

    __IN (node,context) {
        let result;
        switch (node.test.node) {
            case Node.DASH: result = true; break;
            case Node.EVAL:
                if (node.test.expression.node === Node.UNARY) {
                    node.test.expression.input = node.input;
                    result = this._build(node.test.expression,context);  
                } else if (node.test.expression.node === Node.INTERVAL) {
                    let testNode = new Node({ node: Node.IN, input: node.input, test: node.test.expression });
                    result = this._build(testNode,context);
                }
                break;
            case Node.NAME:
            case Node.STRING:
            case Node.BOOLEAN:
            case Node.NUMBER:
            case Node.FUNCTION_CALL: {
                let input = this._build(node.input,context);
                let value = this._build(node.test,context);
                if (input instanceof Temporal && value instanceof Temporal) {
                    result = input.value == value.value;
                } else if (input instanceof Decimal && value instanceof Decimal) {
                    result = input.eq(value);
                } else {
                    result = input === value;
                }
                break;
            }
            case Node.INTERVAL:
                let lower = false, upper = false;
                let input = this._build(node.input,context);
                if (input instanceof Temporal) input = input.value;
                let from = this._build(node.test.from,context);
                let to = this._build(node.test.to,context);
                if (from instanceof Temporal) from = from.value;
                if (to instanceof Temporal) to = to.value;
                switch (node.test.open) {
                    case "[": {
                        if (input instanceof Temporal && from instanceof Temporal) {
                            lower = input.value >= from.value;
                        } else if (input instanceof Decimal && from instanceof Decimal) {
                            lower = input.gte(from);
                        } else {
                            lower = input >= from;
                        }
                        break;
                    }
                    case "(":
                    case "]": {
                        if (input instanceof Temporal && from instanceof Temporal) {
                            lower = input.value > from.value;
                        } else if (input instanceof Decimal && from instanceof Decimal) {
                            lower = input.gt(from);
                        } else {
                            lower = input > from;
                        }
                        break;
                    }
                }
                switch (node.test.close) {
                    case "]": {
                        if (input instanceof Temporal && to instanceof Temporal) {
                            upper = input.value <= to.value;
                        } else if (input instanceof Decimal && to instanceof Decimal) {
                            upper = input.lte(to);
                        } else {
                            upper = input <= to;
                        }
                        break;
                    }
                    case ")":
                    case "[": {
                        if (input instanceof Temporal && to instanceof Temporal) {
                            upper = input.value < to.value;
                        } else if (input instanceof Decimal && to instanceof Decimal) {
                            upper = input.lt(to);
                        } else {
                            upper = input < to;
                        }
                        break;
                    }
                }
                result = lower && upper;
                break;
            case Node.UNARY:
                node.test.input = node.input;
                result = this._build(node.test,context);  
                break;
            case Node.UNARYTESTS:
                let final = false;
                // unary tests like >8, <10, >=8, <=10, =8, !=8, "any", "list" - just one of them must evaluate to true
                node.test.list.entries.forEach((test) => {
                    let testNode = new Node({ node: Node.IN, input: node.input, test });
                    // if (this.logger.active) console.log("_UNARYTEST",util.inspect({ testNode, result: this._build(testNode,context) }, { showHidden: false, depth: null, colors: true }));
                    final = final || this._build(testNode,context);
                })
                result = final;
                break;  
            default:
                result = false;
        }
        this.logger.debug({
            type: "In",
            input: node.input,
            test: node.test,
            result
        });
        return result;
    }

    __BETWEEN (node,context) {
        let test = this._build(node.expression,context);
        if (test instanceof Temporal) test = test.value;
        let lower = this._build(node.left,context);
        if (lower instanceof Temporal) lower = lower.value;
        let upper = this._build(node.right,context);
        if (upper instanceof Temporal) upper = upper.value;
        // console.log({test,lower,upper});
        return test > lower && test < upper;
    }

    __IN_LIST (node,context) {
        if (!node.list || !Array.isArray(node.list.entries)) return false;
        let result = false;
        node.list.entries.forEach((entry) => {
            switch (entry.node) {
                case Node.UNARY: 
                    entry.input = node.input;
                    result = result || this._build(entry,context);
                    break;
                default: {
                    const input = this._build(node.input,context);
                    const listEntry = this._build(entry,context);
                    if (input instanceof Temporal && value instanceof Temporal) {
                        result = result || input.value == listEntry.value;
                    } else if (input instanceof Decimal && listEntry instanceof Decimal) {
                        result = result || input.eq(listEntry);
                    } else if (input instanceof Temporal && listEntry instanceof Temporal) {
                        result = result || input.value == listEntry.value;
                    } else {
                        result = result || input === listEntry;
                    }
                    this.logger.debug({
                        type: "In list: single entry",
                        input,
                        inputType: this.getType(input), 
                        listEntry,
                        listEntryType: this.getType(listEntry),
                        result
                    });
                }
            }
        });
        this.logger.debug({
            type: "In list",
            input: node.input,
            list: node.list.entries,
            result
        });
        return result;
    }

    __UNARY (node,context) {
        let result;
        let input = undefined;
        let value = undefined;
        if (node.input) {
            if (node.input instanceof Temporal) {
                input = node.input.value;
            } else if (node.input instanceof Decimal) {
                input = node.input;
            } else {
                input = this._build(node.input,context);
            }
            if ( value instanceof Temporal) {  
                value = node.value.value;
            } else if (node.value instanceof Decimal) {
                value = node.value;
            } else {
                value = this._build(node.value,context);
            }
            switch (node.operator) {
                case "!=": {
                    if (input instanceof Decimal && value instanceof Decimal) {
                        result = !input.eq(value);
                    } else if (input instanceof Temporal && value instanceof Temporal) {
                        result = input.value !== value.value;
                    } else {
                        result = input !== value;
                    }
                    break;
                }
                case "<": {
                    if (input instanceof Decimal && value instanceof Decimal) {
                        result = input.lt(value);
                    } else if (input instanceof Temporal && value instanceof Temporal) {
                        result = input.value < value.value;
                    } else {
                        result = input < value;
                    }
                    break;
                }
                case ">": { 
                    if (input instanceof Decimal && value instanceof Decimal) {
                        result = input.gt(value);
                    } else if (input instanceof Temporal && value instanceof Temporal) {
                        result = input.value > value.value;
                    } else {
                        result = input > value;
                    }
                    break;
                }
                case ">=": { 
                    if (input instanceof Decimal && value instanceof Decimal) {
                        result = input.gte(value);
                    } else if (input instanceof Temporal && value instanceof Temporal) {
                        result = input.value >= value.value;
                    } else {
                        result = input >= value;
                    }
                    break;
                }
                case "<=": {
                    if (input instanceof Decimal && value instanceof Decimal) {
                        result = input.lte(value);
                    } else if (input instanceof Temporal && value instanceof Temporal) {
                        result = input.value <= value.value;
                    } else {
                        result = input <= value;
                    }
                    break;
                }
            }
        };
        if (result == null) throw new Error(`Cannot evaluate unary test with these values- operator: ${ node.operator }, input: ${input}, value: ${value}`);
        this.logger.debug({
            type: "Unary",
            operator: node.operator,
            input,
            value,
            result
        });
        return result;
    }

    __UNARYTESTS (node,context) {
        return this._build(node.list,context);
    }

    __INSTANCE_OF (node,context) {
        let instance = this._build(node.instance,context);
        // a instance of b
        if (node.of.node && node.of.node == Node.NAME) return typeof instance == typeof this._build(node.of,context);
        // TODO a instance of list<..>
        // TODO a instance of range<..>
        // TODO a instance of date|time|date and time|day-time-duration|year-month-duration
        // TODO a instance of context|function
        // a instance of number|string|boolean
        if (typeof node.of == 'string') {
            switch (node.of) {
                case "number": return typeof instance == 'number' || instance instanceof Decimal;
                case "string": return typeof instance == 'string';
                case "boolean": return typeof instance == 'boolean';
                case "date": return instance instanceof DateOnly;
                case "time": return instance instanceof Time;
                case "date and time": return instance instanceof DateAndTime;
                case "days and time duration": return instance instanceof DaysAndTimeDuration;
                case "years and months duration": return instance instanceof YearsAndMonthDuration;
                default: return false;
            }
        }
    }

    __BOXED (node,context) {
        let boxedContext = this._build(node.context);
        const result = this._build(node.result,Object.assign(context || {},boxedContext || {}));
        // if boxed context is not null and the result node is a negation -> null
        if (node.context && node.result && node.result.node === Node.NEGATION) {
            const term = result instanceof Decimal ? result.toNumber() : ( result instanceof Temporal ? result.exp : result );
            throw new Error(`Cannot evaluate boxed context with substraction: ${ term }`);
        }
        this.logger.debug({
            type: "Boxed",
            context: boxedContext,
            result
        });
        return this._build(node.result,Object.assign(context || {},this._build(node.context)  || {}));
    }

    // DMN Main
    __MAIN (node,context) {
        let result = {};
        for (let i = 0; i < node.definitions.length; i++) {
            let output = {};
            switch (node.definitions[i].node) {
                case Node.INPUT: this._build(node.definitions[i],context); break;
                //case Node.FUNCTION: this._build(node.definitions[i],localContext); break;
                case Node.RETURN: output = this._build(node.definitions[i],context); break;
                case Node.DECISIONTABLE: output = this._build(node.definitions[i],context); break;
                //case Node.CONTEXT: output[node.definitions[i].name] = this._build(node.definitions[i],localContext); break;
                case Node.CONTEXT: output = this._build(node.definitions[i],context); break;
                case Node.EXPRESSIONLIST: output = this._build(node.definitions[i],context); break;
            }
            // return only requested decision result
            if (output && ( !this.decision || this.decision === node.definitions[i].name ) ) {
                result = { ...output, ...result };
                this.logger.debug({
                    type: "Decision",
                    name: node.definitions[i].name,
                    value: output,
                    result
                });
            }
        }
        return result;
    }

    // DMN Input Expression
    __INPUT (node,context) {
        let result = {};
        context[node.name] = this._build(node.value,context);
        if (node.varType === "date" && typeof context[node.name] === "string") {
            context[node.name] = Temporal.parse(context[node.name]);
        }
        result[node.name] = context[node.name];
        this.decisionContext[node.name] = context[node.name];
        this.logger.add({
            type: "Input",
            name: node.name,
            value: context[node.name]
        });
        return  result;
    }

    // DMN Rule
    __RULE (node,context) {
        let steps = [];
        for (let i = 0; i < node.inputs.length; i++) {
            steps.push({
                name: node.inputs[i].name,
                value: this._build(node.inputs[i].value,context),
                expression: node.inputs[i].expression,
                //ast: node.inputs[i].test,
                result: this._build(node.inputs[i].test,context)
            });
        };
        let rule = {
            result: true,
            output: {}
        };
        steps.forEach(step => { rule.result = rule.result && step.result; });
        let outputs = [];
        if (rule.result) {
            rule.priority = -1;
            for (let i = 0; i < node.outputs.length; i++) {
                let value = node.outputs[i].value ? this._build(node.outputs[i].value,context) : null
                _.set(rule.output,node.outputs[i].name,value,context);
                if (node.outputs[i].decisionVariable) {
                    rule.decisionVariable = true;
                    rule.outputValue = value;
                }
                // build list of output values (for hitpolicy Priority)
                let values = node.outputs[i].values ? this._build(node.outputs[i].values,context) : null;
                if (Array.isArray(values) && values.indexOf(value) >= 0) {
                    rule.priority = values.indexOf(value) + 1;
                }
            }
        }
        this.logger.add({
            type: "Rule",
            decisionTable: node.decisionTable,
            index: node.index,
            annotation: node.annotation,
            steps,
            ...rule
        });
        return rule;
    }

    // DMN Decision Table
    __DECISIONTABLE (node,context) {
        // build inputs
        let inputs = [];
        for (let i = 0; i < node.inputs.length; i++) {
            inputs.push({
                name: node.inputs[i].name,
                value: this._build(node.inputs[i].value,context)
            });
        }
        let outputs = [];
        let defaultOutput = {};
        for (let i = 0; i < node.outputs.length; i++) {
            outputs.push({
                name: node.outputs[i].name,
                values: node.outputs[i].values ? this._build(node.outputs[i].values,context) : null
            });
            if (node.outputs[i].defaultValue) {
                const value = this._build(node.outputs[i].defaultValue,context);
                _.set(defaultOutput,node.outputs[i].name,value);
            }
        }   
        // evaluate rules
        let results = [];
        for (let i = 0; i < node.rules.length; i++) {
            results.push(this._build(node.rules[i],context));
        }
        // evaluate rule results according to hit policy
        let output = {};
        // Hit policy
        switch (node.hitPolicy) {
            // Unique: no overlap is possible and all rules are disjoint. Only a single rule can be matched.
            case "U":
            case "Unique": {
                results.some((rule) => {
                    if (rule.result) {
                        output = rule.output;
                        //context = Object.assign(context,rule.output);
                        return true;
                    } else {
                        return false;
                    }
                });
                break;
            }
            // Any: there may be overlap, but all the matching rules show equal output entries for each output (ignoring rule
            //      annotations), so any match can be used. If the output entries are non-equal (ignoring rule annotations), the
            //      hit policy is incorrect and the result is undefined. 
            // currently handled as unique
            case "A":
            case "Any": {
                results.some((rule) => {
                    if (rule.result) {
                        output = rule.output;
                        //context = Object.assign(context,rule.output);
                        return true;
                    } else {
                        return false;
                    }
                });
                break;
            }
            // Output order: there may be overlap, but all the matching rules show equal output entries for each output (ignoring rule
            case "O":
            case "Output order": {
                let list = [];
                results.forEach((rule) => {
                    if (rule.result && rule.priority >= 0) {
                        list.push({
                            priority: rule.priority,
                            output: rule.decisionVariable ? rule.outputValue : rule.output
                        }) 
                    }
                });
                if (list.length === 0) {
                    output = defaultOutput;
                } else {
                    // filter list by priority and return array of outputs
                    const flattened = list.sort((a,b) => a.priority - b.priority).map((item) => item.output);
                    // return as variable, if variable is defined
                    node.variable?.name ?  output[node.variable.name] = flattened : output = flattened;
                }
                break;
            }
            // Priority: multiple rules can match, with different output entries. This policy returns the matching rule
            //           with the highest output priority. Output priorities are specified in the ordered list of output values, in
            //           decreasing order of priority. Note that priorities are independent from rule sequence.
            case "P":
            case "Priority": {
                let p = -1;
                results.forEach((rule) => {
                    if (rule.result && rule.priority >= 0 && ( p < 0 || rule.priority < p )) {
                        p = rule.priority;
                        output = rule.output;
                    }
                });
                //context = Object.assign(context,output);                        
                break;
            }
            // First: multiple (overlapping) rules can match, with different output entries. The first hit by rule order is returned
            //        (and evaluation can halt). This is still a common usage, because it resolves inconsistencies by forcing the
            //        first hit. However, first hit tables are not considered good practice because they do not offer a clear
            //        overview of the decision logic. It is important to distinguish this type of table from others because the
            //        meaning depends on the order of the rules. The last rule is often the catch-remainder. Because of this order,
            //        the table is hard to validate manually and therefore has to be used with care.
            // currently handled as unique
            case "F":
            case "First": {
                results.some((rule) => {
                    if (rule.result) {
                        output = rule.output;
                        //context = Object.assign(context,rule.output);
                        return true;
                    } else {
                        return false;
                    }
                });
                break;
            }
            // Rule order: returns all hits in rule order. Note: the meaning may depend on the sequence of the rules.
            case "R":
            case "Rule order": {
                const list = [];
                results.forEach((rule) => {
                    if (rule.result) {
                        // add output to list
                        rule.decisionVariable ? list.push(rule.outputValue) : list.push(rule.output);
                    }
                });
                // return as variable, if variable is defined
                node.variable?.name ?  output[node.variable.name] = list : output = list;
                break;
            }
            // Collect: returns all hits in arbitrary order.
            case "C":
            case "Collect": {
                switch (node.aggregation) {
                    case "SUM": {
                        results.forEach((rule) => {
                            if (rule.result) {
                                for (let key in rule.output) {
                                    output[key] ? output[key] = output[key].add(rule.output[key]) : output[key] = rule.output[key];
                                }
                            }
                        });
                        if (Object.keys(output).length === 0) output = defaultOutput;
                        break;
                    }
                    case "MIN": {
                        const self =  this;
                        results.forEach((rule) => {
                            if (rule.result) {
                                for (let key in rule.output) {
                                    if (!output[key] || self.compare(rule.output[key], output[key]) < 0) output[key] = rule.output[key];
                                }
                            }
                        });
                        if (Object.keys(output).length === 0) output = defaultOutput;
                        break;
                    }
                    case "MAX": {
                        const self =  this;
                        results.forEach((rule) => {
                            if (rule.result) {
                                for (let key in rule.output) {
                                    if (!output[key] || self.compare(rule.output[key], output[key]) > 0) output[key] = rule.output[key];
                                }
                            }
                        });
                        if (Object.keys(output).length === 0) output = defaultOutput;
                        break;
                    }
                    case "COUNT": {
                        results.forEach((rule) => {
                            if (rule.result) {
                                for (let key in rule.output) {
                                    output[key] ? output[key]++ : output[key] = 1;
                                }
                            }
                        });
                        break;
                    }
                    default: {
                        const list = [];
                        results.forEach((rule) => {
                            if (rule.result) {
                                // add output to list
                                rule.decisionVariable ? list.push(rule.outputValue) : list.push(rule.output);
                            }
                        });
                        if (list.length === 0) {
                            output = defaultOutput;
                        } else {
                            // return as variable, if variable is defined
                            node.variable?.name ?  output[node.variable.name] = list : output = list;
                        }
                    }
                };
                break;
            }
        }
        this.logger.add({
            type : "Decisiontable",
            name : node.name,
            hitPolicy : node.hitPolicy,
            inputs : inputs,
            defaultOutput,
            output
        });
        /*
        // return as variable, if variable is defined
        if (node.variable?.name) {
            output[node.variable.name] = output;
        }
        */
        // add output to local context
        context = Object.assign(context,output);
        return output;
    }

    // DMN RETURN
    __RETURN (node,context) {
        let result = {};
        // check if value is undefined or null
        if (node.value === null || node.value === undefined) {
            result[node.name] = null;
        } else {
            result[node.name] = this._build(node.value,context);
        }   
        context[node.name] = result[node.name];
        this.logger.add({
            type: "Return",
            name: node.name,
            expression: node.expression, 
            value: result[node.name]
        });
        return result;
    }

    // DMN EXPRSSIONLIST
    __EXPRESSIONLIST (node,context) {
        let result = {};
        result[node.name] = [];
        this.logger.add({
            type: "Expression list",
            name: node.name,
            entries: node.entries
        });
        if (Array.isArray(node.entries)) {
            node.entries.forEach((entry) => {
                result[node.name].push(this._build(entry,context));
            });
        }
        context[node.name] = result[node.name];
        this.logger.add({
            type: "Expression list",
            name: node.name,
            entries: node.entries, 
            value: result[node.name]
        });
        return result;
    }

    buildParameters (node,names,context) {
        let parameters = {};
        if (node && node.node === Node.LIST) {
            node.entries.forEach((entry,index) => {
                if (entry.node == Node.NAMED_PARAMETER) {
                    // named parameters                
                    let name = entry.name?.value ?? null;
                    if (names.indexOf(name) >= 0) parameters[name] = this._build(entry.expression,context);
                } else {
                    // positional parameters
                    parameters[names[index]] = this._build(entry,context);
                }
            })
        }
        return parameters;
    } 

    getRawParameters (node,names) {
        let parameters = {};
        if (node && node.node === Node.LIST) {
            node.entries.forEach((entry,index) => {
                if (entry.node == Node.NAMED_PARAMETER) {
                    // named parameters                
                    let name = entry.name?.value ?? null;
                    if (names.indexOf(name) >= 0) parameters[name] = entry.expression;
                } else {
                    // positional parameters
                    parameters[names[index]] = entry;
                }
            })
        }
        return parameters;
    } 

    getRangeParameters (entries,context) {
        const compare = Object.entries(entries).map(([key,value]) => {
            let parameter = {
                raw: value,
                type: value?.node === Node.INTERVAL ? "interval" : "point"
            };
            if (parameter.type === "point") {
                parameter.value = this._build(parameter.raw,context);
                if (parameter.value instanceof Temporal) parameter.value =  parameter.value.value
            } else {
                parameter.from = this._build(value.from,context);
                if (parameter.from instanceof Temporal) parameter.from =  parameter.from.value
                parameter.to = this._build(value.to,context);
                if (parameter.to instanceof Temporal) parameter.to =  parameter.to.value
                parameter.includeFrom = value.open === "[" ? true : false;
                parameter.includeTo = value.close === "]" ? true : false;
            }
            return parameter;
        })
        return compare;
    }

    callFunctionDefinition (definition,parameters,context) {
        // build formal paramater list
        const parameterList = definition.parameters?.entries?.map(entry => entry.name?.value ?? null);
        // map parameters to build local context
        const localContext = this.buildParameters(parameters,parameterList,context);
        // call function defintion and return result
        // TODO: shouldn't we restrict her to the use of the local context only? Couldn't find any explanation about the valid scope in the DMN notation
        return this._build(definition.expression,Object.assign(context || {}, localContext));
    }

    __FUNCTION_CALL (node,context) {
        // console.log("_FUNCTION_CALL",util.inspect(context, { showHidden: false, depth: null, colors: true }));
        // defined functions
        if (this.functionDefinitions[node.name.value]) {
            return this.callFunctionDefinition(this.functionDefinitions[node.name.value],node.parameters,context);
        }
        // build-in functions
        switch (node.name.value) {
            case "today": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 0) throw new Error("Too many parameters for today function");
                const result = Temporal.today();
                this.logger.debug({
                    type: "Function",
                    result
                });
                return result;
            }
            case "now": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 0) return null;
                return Temporal.now();
            }
            case "day of week": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for day of week function");
                const parameters = this.buildParameters(node.parameters,["date"],context);
                return Temporal.dayOfWeek(parameters);
            }
            case "day of year": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for day of year function");
                const parameters = this.buildParameters(node.parameters,["date"],context);
                return Temporal.dayOfYear(parameters);
            }
            case "week of year": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for week of year function");
                const parameters = this.buildParameters(node.parameters,["date"],context);
                return Temporal.weekOfYear(parameters);
            }
            case "month of year": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for month of year function");
                const parameters = this.buildParameters(node.parameters,["date"],context);
                return Temporal.monthOfYear(parameters);
            }
            case "years and months duration": {
                const parameters = this.buildParameters(node.parameters,["from","to"],context);
                return Temporal.monthBetween(parameters);
            }

            case "number": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 3) throw new Error("Too many parameters for number function");
                const parameters = this.buildParameters(node.parameters,["from","grouping separator","decimal separator"],context);
                // shorten parameter names
                parameters.grouping = parameters["grouping separator"];
                parameters.decimal = parameters["decimal separator"];
                // check if grouping parameter is valid
                if (parameters.grouping !== '' && parameters.grouping !== ' ' && parameters.grouping !== undefined && parameters.grouping !== null && parameters.grouping !== ',' && parameters.grouping !== '.') {
                    throw new Error("Invalid grouping separator for number function");
                }
                // check if decimal parameter is valid
                if (parameters.decimal !== '' && parameters.decimal !== undefined && parameters.decimal !== null && parameters.decimal !== ',' && parameters.decimal !== '.') {
                    throw new Error("Invalid decimal separator for number function");
                }
                // check if groupng and decimal parameter are the same
                if (parameters.grouping && parameters.decimal && parameters.grouping === parameters.decimal) {
                    throw new Error("Grouping separator and decimal separator for number function are the same");
                }
                let from = parameters.from;
                // convert format: remove grouping separator and replace decimal separator
                if (parameters.grouping) {
                    from = from.replace(new RegExp(`\\${parameters.grouping}`, 'g'), '');
                }
                // check, if any commas are left which are not part of the decimal separator
                if (from.match(/,/g) && parameters.decimal !== ',') {
                    throw new Error("Goruping separator seems to be not correct - still commas left");
                }
                if (parameters.decimal) {
                    from = from.replace(new RegExp(`\\${parameters.decimal}`, 'g'), '.');
                }
                const value = new Decimal(parseFloat(from));
                // check if value is a number
                if (isNaN(value)) {
                    throw new Error("Invalid number format");
                }
                // FEEL supports literal scientific notation, e.g., 1.2e3, which is equivalent to 1.2*10**3
                this.logger.debug({
                    type: "function number",
                    parameters,
                    result: value
                });
                return value;
            }
            case "string": {
                let value;
                const parameters = this.buildParameters(node.parameters,["from"],context);
                if (parameters.from instanceof Temporal) {
                    value = parameters.from.exp;
                } else if (parameters.from instanceof Decimal) {
                    value = parameters.from.toDecimalPlaces(34).toString();
                } else {
                    value = parameters.from;
                }
                return String(value);
            }
            case "context": {
                const parameters = this.buildParameters(node.parameters,["entries"],context);
                return Array.isArray(parameters.entries) ? parameters.entries.reduce((prev,curr) => { if (curr.key) prev[curr.key] = curr.value; return prev; },{}) : undefined;
            }

            case "is defined": {
                const parameters = this.buildParameters(node.parameters,["value"],context);
                return parameters.value === undefined || parameters.value === null ? false : true;
            }
            case "substring": {
                let parameters = this.buildParameters(node.parameters,["string","start position","length"],context);
                // check if patameter string is defined -> if not, return null
                if (!parameters.string) throw new Error("function substring: parameter string is missing");
                // parameter start position is obligatory 
                if (!parameters["start position"]) throw new Error("function substring: parameter start position is missing");
                // parameter string must be type string
                if (typeof parameters.string !== 'string') throw new Error("function substring: parameter string is not a string");
                // get start psoition
                let start = this.toNumber(parameters["start position"]);
                start = start < 1 ? parameters.string.length + start : start - 1;
                // get length
                const length = this.toNumber(parameters.length);
                // result
                const result = parameters.string.substring(start, length ? start+length : parameters.string.length);
                this.logger.debug({
                    type: "function substring",
                    parameters,
                    start,
                    length,
                    result
                });
                return result;
            }
            case "string length": {
                const parameters = this.buildParameters(node.parameters,["string"],context);
                return (typeof parameters.string == 'string') ? parameters.string.length : undefined;
            }
            case "upper case": {
                const parameters = this.buildParameters(node.parameters,["string"],context);
                return (typeof parameters.string == 'string') ? parameters.string.toUpperCase() : undefined;
            }
            case "lower case": {
                const parameters = this.buildParameters(node.parameters,["string"],context);
                return (typeof parameters.string == 'string') ? parameters.string.toLowerCase() : undefined;
            }
            case "substring before": {
                const parameters = this.buildParameters(node.parameters,["string","match"],context);
                return (typeof parameters.string == 'string') ? parameters.string.substring(0, parameters.string.indexOf(parameters.match)) : undefined;
            }
            case "substring after": {
                const parameters = this.buildParameters(node.parameters,["string","match"],context);
                if (typeof parameters.match !== 'string') throw new Error("function substring after: parameter match is not a string");
                if (typeof parameters.string !== 'string') throw new Error("function substring after: parameter string is not a string");
                let result;
                if (parameters.string === "") {
                    result = ""
                } else if (parameters.match === "") {
                    result = parameters.string;
                } else if (parameters.string.indexOf(parameters.match) < 0) {
                    result = "";
                } else {
                    result = parameters.string.substring(parameters.string.indexOf(parameters.match)+parameters.match.length,parameters.string.length);
                }
                this.logger.debug({
                    type: "function substring after",
                    parameters,
                    result
                });
                return result;
            }
            case "contains": {
                const parameters = this.buildParameters(node.parameters,["string","match"],context);
                // check if any parameter is null
                if (parameters.string === null || parameters.match === null) throw new Error("function contains: parameter string or match is null");
                // check if both parameters are strings
                if (typeof parameters.string !== 'string') throw new Error("function contains: parameter string is not a string");
                if (typeof parameters.match !== 'string') throw new Error("function contains: parameter match is not a string");
                const result = parameters.string.indexOf(parameters.match) >= 0 ? true : false;
                this.logger.debug({
                    type: "function contains",
                    parameters,
                    result
                });
                return result;
            }
            case "starts with": {
                const parameters = this.buildParameters(node.parameters,["string","match"],context);
                return (typeof parameters.string == 'string') ? parameters.string.startsWith(parameters.match) : undefined;
            }
            case "ends with": {
                const parameters = this.buildParameters(node.parameters,["string","match"],context);
                return (typeof parameters.string == 'string') ? parameters.string.endsWith(parameters.match) : undefined;
            }
            case "matches": {
                const parameters = this.buildParameters(node.parameters,["input","pattern"],context);
                return Strings.matches(parameters);
            } 
            case "replace": {
                const parameters = this.buildParameters(node.parameters,["input","pattern","replacement","flags"],context);
                // input is obligatory
                if (typeof parameters.input !== 'string') throw new Error("function replace: parameter input is missing or not a string");
                // pattern is obligatory
                if (typeof parameters.pattern !== 'string') throw new Error("function replace: parameter pattern is missing or not a string");
                // replacement is obligatory
                if (typeof parameters.replacement !== 'string') throw new Error("function replace: parameter replacement is missing or not a string");
                return Strings.replace({ ...parameters, logger: this.logger });
            }
            case "split": {
                const parameters = this.buildParameters(node.parameters,["string","delimiter"],context);
                return Strings.split(parameters);
            }
            case "extract": {
                const parameters = this.buildParameters(node.parameters,["string","pattern"],context);
                return Strings.extract(parameters);
            }

            case "list contains": {
                const parameters = this.buildParameters(node.parameters,["list","element"],context);
                if (!Array.isArray(parameters.list)) throw new Error("function list contains: parameter list is not a list");
                let result;
                const self = this;
                // check if element is a list (list can be a list of any type including objects)
                result = parameters.list.reduce((result,item) => self.compare(item,parameters.element) === 0 || result, false);
                this.logger.debug({
                    type: "function list contains",
                    parameters,
                    result
                });
                return result;
            }
            case "count": {
                const parameters = this.buildParameters(node.parameters,["list"],context);
                if (!Array.isArray(parameters.list)) throw new Error("function count: parameter is not a list");
                const result = new Decimal(parameters.list.length);
                this.logger.debug({
                    type: "function count",
                    parameters,
                    result
                });
                return result;
            }
            case "min": {
                if (node.parameters?.entries?.length > 1) return bigmath.min(...this._build(node.parameters));
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? bigmath.min(...parameters.list) : undefined;
            }
            case "max": {
                if (node.parameters?.entries?.length > 1) return bigmath.max(...this._build(node.parameters));
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? bigmath.max(...parameters.list) : undefined;
            }
            case "sum": {
                const parameters = node.parameters?.entries?.length > 1 ? [...this._build(node.parameters)] : this.buildParameters(node.parameters,["list"],context).list;
                if (!Array.isArray(parameters)) throw new Error("function mean: parameter is not a list or a list of numbers");
                const result = new Decimal(parameters.reduce((a,b)=>a.plus(b)));
                this.logger.debug({
                    type: "function sum",
                    parameters,
                    result
                });
                return result;
            }
            case "product": {
                const parameters = node.parameters?.entries?.length > 1 ? [...this._build(node.parameters)] : this.buildParameters(node.parameters,["list"],context).list;
                if (!Array.isArray(parameters)) throw new Error("function mean: parameter is not a list or a list of numbers");
                const result = new Decimal(parameters.reduce((a,b)=>a.mul(b)));
                this.logger.debug({
                    type: "function product",
                    parameters,
                    result
                });
                return result;
            }
            case "mean": {
                const parameters = node.parameters?.entries?.length > 1 ? [...this._build(node.parameters)] : this.buildParameters(node.parameters,["list"],context).list;
                if (!Array.isArray(parameters)) throw new Error("function mean: parameter is not a list or a list of numbers");
                const result = new Decimal(parameters.reduce((a,b)=>a.plus(b)).div(parameters.length));
                this.logger.debug({
                    type: "function mean",
                    parameters,
                    result
                });
                return result;
            }
            case "median": {
                let parameters = node.parameters?.entries?.length > 1 ? [...this._build(node.parameters)] : this.buildParameters(node.parameters,["list"],context).list;
                // handle single number as list
                if (parameters instanceof Decimal) parameters = [parameters];
                if (!Array.isArray(parameters)) throw new Error("function median: parameter is not a list or a list of numbers");
                const self = this;
                let result;
                function median(values) {
                    values.sort(function(a,b){
                        if (!(a instanceof Decimal)) throw new Error(`function median: list member "${a}" is not a number`);
                        if (!(b instanceof Decimal)) throw new Error(`function median: list member "${b}" is not a number`);
                        return self.compare(a,b);
                    });
                    const half = bigmath.floor(values.length / 2);
                    if (values.length % 2) return values[half];
                    return new Decimal((values[half - 1].add(values[half])).div(2));
                }
                result = median(parameters);
                this.logger.debug({
                    type: "function median",
                    parameters,
                    result
                });
                return result;
            }
            case "stddev": {    
                // returns sample standard deviation
                const parameters = node.parameters?.entries?.length > 1 ? [...this._build(node.parameters)] : this.buildParameters(node.parameters,["list"],context).list;
                if (!Array.isArray(parameters)) throw new Error("function stddev: parameter is not a list or a list of numbers");
                // Ensure all elements are Decimal instances
                const decimals = parameters.map((x) => {
                    if (!(x instanceof Decimal)) {
                        throw new Error(`function stddev: list member "${x}" is not a number`);
                    }
                    return x;
                });
                // Count
                const n = decimals.length;
                if (n === 0) throw new Error("function stddev: list is empty");
                if (n === 1) throw new Error("function stddev: list has only one element");
                // Calculate the mean
                const mean = decimals.reduce((a, b) => a.add(b)).div(n);
                // Calculate the variance
                const variance = decimals
                    .map((x) => x.sub(mean).pow(2)) // (x_i - mean)^2
                    .reduce((a, b) => a.add(b)) // Sum of squared differences
                    .div(n -1); // Divide by N - 1 (sample variance)
                // Calculate the standard deviation
                const result = variance.sqrt();
                // Log the result
                this.logger.debug({
                    type: "function stddev",
                    parameters,
                    mean: mean.toString(),
                    variance: variance.toString(),
                    result: result.toString(),
                });
                return result;                
            }
            case "mode": {
                let parameters = node.parameters?.entries?.length > 1 ? [...this._build(node.parameters)] : this.buildParameters(node.parameters,["list"],context).list;
                // handle single number as list
                if (parameters instanceof Decimal) parameters = [parameters];
                if (!Array.isArray(parameters)) throw new Error("function mode: parameter is not a list or a list of numbers");
                // map decimals to numbers
                const array = parameters.map((item) => this.toNumber(item));
                let result;
                function getModes(array) {
                    let unique = []; // array of unique values.
                    let count = []; // array of frequency
                    let maxFreq = 0; // holds the max frequency.
                    let modes = [];
                  
                    array.forEach((item,index) => {
                        let n = unique.indexOf(item);
                        if (n < 0) {
                            unique.push(item);
                            n = unique.length - 1;
                        }
                        count[n] ? count[n]++ : count[n] = 1;
                        if (count[n] > maxFreq) maxFreq = count[n];
                    })
                    for (let k in count) {
                      if (count[k] == maxFreq) {
                        modes.push(unique[k]);
                      }
                    }
                  
                    return modes.sort();
                }
                const modesArray = getModes(array);
                // map back to decimals
                result = modesArray.map((item) => new Decimal(item));
                this.logger.debug({
                    type: "function mode",
                    parameters,
                    result
                });
                return result;
            }
            case "all":
            case "and": {
                if (node.parameters?.entries?.length > 1) return this._build(node.parameters).reduce((a,b)=> a && b);
                const parameters = this.buildParameters(node.parameters,["list"],context);
                // console.log(util.inspect(parameters, { showHidden: false, depth: null, colors: true }));
                return (Array.isArray(parameters.list)) ? (parameters.list.length > 0 ? parameters.list.reduce((a,b) => a && b) : true ) : undefined;
            }
            case "any": 
            case "or": {
                if (node.parameters?.entries?.length > 1) return this._build(node.parameters).reduce((a,b)=> a || b);
                const parameters = this.buildParameters(node.parameters,["list"],context);
                // console.log(util.inspect(parameters, { showHidden: false, depth: null, colors: true }));
                return (Array.isArray(parameters.list)) ? (parameters.list.length > 0 ? parameters.list.reduce((a,b) => a || b) : false ) : undefined;
            }
            case "sublist": {
                const parameters = this.buildParameters(node.parameters,["list","start position","length"],context);
                if (!Array.isArray(parameters.list)) throw new Error("function sublist: list parameter is not a list");
                const startPosition = parameters["start position"] ? this.toNumber(parameters["start position"]) : 0;
                const length = parameters.length ? this.toNumber(parameters.length) : parameters.list.length;
                let start = startPosition > 0 ? startPosition - 1 : 0;
                // negative start position -> count from end of list
                start = startPosition < 0 ? parameters.list.length + startPosition : start;
                const end = length > 0 ? start + length : parameters.list.length;
                const result = parameters.list.slice(start,end)
                this.logger.debug({
                    type: "function sublist",
                    parameters,
                    result
                });
                return result;
            }
            case "append": {
                const parameters = this.buildParameters(node.parameters,["list"],context);
                const elements = node.parameters?.entries?.length > 1 ? this._build(node.parameters).slice(1) : [];
                return (Array.isArray(parameters.list)) ? parameters.list.concat(elements) : undefined;
            }
            case "union":
                const elements = node.parameters?.entries?.length > 1 ? this._build(node.parameters) : [];
                const concat = elements.reduce((a,b) => { return Array.isArray(b) ? ( Array.isArray(a) ? a.concat(b) : [].concat(b) ) : a; });
                return [...new Set(concat)];
            case "concatenate": {
                // console.log(util.inspect(node.parameters, { showHidden: false, depth: null, colors: true }));
                const elements = node.parameters?.entries?.length > 1 ? this._build(node.parameters) : [];
                return elements.reduce((a,b) => { return Array.isArray(b) ? ( Array.isArray(a) ? a.concat(b) : [].concat(b) ) : a; });
            }
            case "insert before": {
                const parameters = this.buildParameters(node.parameters,["list","position"],context);
                const elements = node.parameters?.entries?.length > 2 ? this._build(node.parameters).slice(2) : [];
                Array.isArray(parameters.list) && parameters.position > 0 ? parameters.list.splice(parameters.position - 1, 0, ...elements) : parameters.list = undefined;
                return parameters.list;
            }
            case "remove": {
                const parameters = this.buildParameters(node.parameters,["list","position"],context);
                Array.isArray(parameters.list) && parameters.position > 0 ? parameters.list.splice(parameters.position - 1, 1) : parameters.list = undefined;
                return parameters.list;
            }
            case "reverse": {
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? parameters.list.reverse() : undefined;
            }
            case "index of": {
                function getAllIndexes(arr, val) {
                    var indexes = [], i;
                    for(i = 0; i < arr.length; i++)
                        if (arr[i] === val)
                            indexes.push(i+1);
                    return indexes;
                }                
                const parameters = this.buildParameters(node.parameters,["list","match"],context);
                return (Array.isArray(parameters.list)) ? getAllIndexes(parameters.list,parameters.match) : undefined;
            }
            case "distinct values": {
                const parameters = this.buildParameters(node.parameters,["list"],context);
                if (!Array.isArray(parameters.list)) throw new Error("function distinct values: parameter is not a list");
                let result = parameters.list.filter(
                    (value, index, self) =>
                        self.findIndex((obj) =>
                            JSON.stringify(obj) === JSON.stringify(value)) ===
                        index
                );
                this.logger.debug({
                    type: "function distinct values",
                    parameters,
                    result
                });
                return result;
            }
            case "flatten": {
                const parameters = this.buildParameters(node.parameters,["list"],context);
                function flattenDeep(arr1) {
                    return arr1.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
                 }
                 return (Array.isArray(parameters.list)) ? flattenDeep(parameters.list) : undefined;
            }
            case "sort": {
                const parameters = this.getRawParameters(node.parameters,["list","precedes"]);
                var list = this._build(parameters.list,context);
                const functionParameter = parameters.precedes?.parameters?.entries?.map(entry => entry.name?.value ?? null);
                if (Array.isArray(list)) {
                    list.sort((a,b) => {
                        const context = {};
                        context[functionParameter[0]] = a;
                        context[functionParameter[1]] = b;
                        return this._build(parameters.precedes.expression,context) ? -1 : 1;
                    });
                }
                return list;
            }
            case "string join": {
                const parameters = this.buildParameters(node.parameters,["list","delimiter","prefix","suffix"],context);
                const prefix = parameters.prefix ? parameters.prefix : "";
                const suffix = parameters.suffix ? parameters.suffix : "";
                const delimiter = parameters.delimiter ? parameters.delimiter : "";
                return prefix + (Array.isArray(parameters.list) ? parameters.list.join(delimiter) : "") + suffix;
            }

            case "get value": {
                const parameters = this.buildParameters(node.parameters,["context", "key"],context);
                return parameters.context && parameters.key ? ( parameters.context[parameters.key] === undefined ? null: parameters.context[parameters.key] ) : null;
            }
            case "get entries": {
                const parameters = this.buildParameters(node.parameters,["context"],context);
                return typeof parameters.context == 'object' ? Object.entries(parameters.context).map(([key,value]) => { return { key, value };}) : [];
            }
            case "put": {
                // console.log("_FUNCTION_CALL:put",util.inspect(context, { showHidden: false, depth: null, colors: true }));
                const parameters = this.buildParameters(node.parameters,["context", "key", "value"],context);
                if (parameters.context && parameters.key) parameters.context[parameters.key] = parameters.value;
                return parameters.context;
            }
            case "put all": {
                const args = this._build(node.parameters,context);
                return Array.isArray(args) ? Object.assign(...args) : undefined;
            }

            case "decimal": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 2) throw new Error("Too many parameters for decimal function");
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                if (!(parameters.n instanceof Decimal)) throw new Error(`function decimal: parameter n "${parameters.n}" is not a number`);
                if (!(parameters.scale instanceof Decimal)) throw new Error(`function decimal: parameter scale "${parameters.scale}" is not a number`);
                // bankers rounding
                let result;
                // ignore digits in scale -> floor
                const offset = parameters.scale ? new Decimal(10).pow(parameters.scale.floor()) : 0;
                const base = offset ? parameters.n.mul(offset) : parameters.n;
                const floored = base.floor();
                const decimalPart = parameters.n.sub(floored);
                let rounded;
                if (decimalPart.toNumber() === 0.5) {
                    rounded = (floored.mod(2).eq(0)) ? floored : floored.add(1);
                } else {
                    rounded = base.round();
                }
                result = offset ? rounded.div(offset) : rounded;
                //const result = parameters.n.toDecimalPlaces(this.toNumber(parameters.scale));
                this.logger.debug({
                    type: "function decimal",
                    parameters,
                    result
                });
                return result;
            }
            case "floor": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 2) throw new Error("Too many parameters for floor function");
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                // undefined or null -> null
                if (parameters.n === undefined || parameters.n === null) throw new Error(`function floor: parameter "${parameters.n}" is undefined or null`);
                if (parameters.scale === null) throw new Error(`function floor: parameter scale "${parameters.scale}" is null`);
                // unknwown parameter -> null
                if (node.parameters?.entries?.length === 2 && parameters.scale === undefined) throw new Error(`function floor: unknown named parameter`);
                // scale not a number -> null
                if (parameters.scale && !(parameters.scale instanceof Decimal)) throw new Error(`function floor: parameter scale "${parameters.scale}" must be a number`);
                // string, boolean, date, time -> null
                if (typeof parameters.n === 'string' || typeof parameters.n === 'boolean') throw new Error(`function floor: parameter "${parameters.n}" is not a number`);
                // temporal -> null
                if (parameters.n instanceof Temporal ) throw new Error(`function floor: parameter "${parameters.n}" is a temporal instead of a number`);
                // not a number -> null
                if (!(parameters.n instanceof Decimal)) throw new Error(`function floor: parameter "${parameters.n}" is not a number`);
                const scale = parameters.scale ? new Decimal(10).pow(this.getScaleParameter(parameters.scale)) : 1;
                const result = parameters.n.mul(scale).floor().div(scale);
                this.logger.debug({
                    type: "function floor",
                    parameters,
                    result
                });
                return result;
            }
            case "ceiling": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 2) throw new Error("Too many parameters for ceiling function");
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                // undefined or null -> null
                if (parameters.n === undefined || parameters.n === null) throw new Error(`function ceiling: parameter "${parameters.n}" is undefined or null`);
                if (parameters.scale === null) throw new Error(`function ceiling: parameter scale "${parameters.scale}" is null`);
                // unknwown parameter -> null
                if (node.parameters?.entries?.length === 2 && parameters.scale === undefined) throw new Error(`function ceiling: unknown named parameter`);
                // scale not a number -> null
                if (parameters.scale && !(parameters.scale instanceof Decimal)) throw new Error(`function ceiling: parameter scale "${parameters.scale}" must be a number`);
                // string, boolean -> null
                if (typeof parameters.n === 'string' || typeof parameters.n === 'boolean') throw new Error(`function ceiling: parameter "${parameters.n}" is not a number`);
                // temporal -> null
                if (parameters.n instanceof Temporal ) throw new Error(`function ceiling: parameter "${parameters.n}" is a temporal instead of a number`);
                // not a number -> null
                if (!(parameters.n instanceof Decimal)) throw new Error(`function ceiling: parameter "${parameters.n}" is not a number`);
                const scale = parameters.scale ? new Decimal(10).pow(this.getScaleParameter(parameters.scale)) : 1;
                const result = parameters.n.mul(scale).ceil().div(scale);
                this.logger.debug({
                    type: "function ceiling",
                    parameters,
                    result
                });
                return result;
            }
            case "round up": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 2) throw new Error("Too many parameters for round up function");
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                // undefined or null -> null
                if (parameters.n === undefined || parameters.n === null) throw new Error(`function round up: parameter "${parameters.n}" is undefined or null`);
                if (parameters.scale === null) throw new Error(`function round up: parameter scale "${parameters.scale}" is null`);
                // unknwown parameter -> null
                if (node.parameters?.entries?.length === 2 && parameters.scale === undefined) throw new Error(`function round up: unknown named parameter`);
                // scale not a number -> null
                if (parameters.scale && !(parameters.scale instanceof Decimal)) throw new Error(`function round up: parameter scale "${parameters.scale}" must be a number`);
                // string, boolean, date, time -> null
                if (typeof parameters.n === 'string' || typeof parameters.n === 'boolean') throw new Error(`function round up: parameter "${parameters.n}" is not a number`);
                // temporal -> null
                if (parameters.n instanceof Temporal ) throw new Error(`function round up: parameter "${parameters.n}" is a temporal instead of a number`);
                // not a number -> null
                if (!(parameters.n instanceof Decimal)) throw new Error(`function round up: parameter n "${parameters.n}" is not a number`);
                const scale = parameters.scale ? this.getScaleParameter(parameters.scale) : 0;
                // scale not a number -> null
                //if (typeof scale !== 'number') throw new Error(`function round up: parameter scale "${parameters.scale}" is not a number`);
                const result = parameters.n.toDecimalPlaces(scale,Decimal.ROUND_UP);
                this.logger.debug({
                    type: "function round up",
                    parameters,
                    result
                });
                return result;
            }
            case "round down": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 2) throw new Error("Too many parameters for round down function");
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                // undefined or null -> null
                if (parameters.n === undefined || parameters.n === null) throw new Error(`function round down: parameter "${parameters.n}" is undefined or null`);
                if (parameters.scale === null) throw new Error(`function round down: parameter scale "${parameters.scale}" is null`);
                // unknwown parameter -> null
                if (node.parameters?.entries?.length === 2 && parameters.scale === undefined) throw new Error(`function round down: unknown named parameter`);
                // scale not a number -> null
                if (parameters.scale && !(parameters.scale instanceof Decimal)) throw new Error(`function round down: parameter scale "${parameters.scale}" must be a number`);
                // string, boolean, date, time -> null
                if (typeof parameters.n === 'string' || typeof parameters.n === 'boolean') throw new Error(`function round down: parameter "${parameters.n}" is not a number`);
                // temporal -> null
                if (parameters.n instanceof Temporal ) throw new Error(`function round down: parameter "${parameters.n}" is a temporal instead of a number`);
                // not a number -> null
                if (!(parameters.n instanceof Decimal)) throw new Error(`function round down: parameter n "${parameters.n}" is not a number`);
                const scale = parameters.scale ? this.getScaleParameter(parameters.scale) : 0;
                const result = parameters.n.toDecimalPlaces(scale,Decimal.ROUND_DOWN);
                this.logger.debug({
                    type: "function round down",
                    parameters,
                    result
                });
                return result;
            }
            case "round half up": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 2) throw new Error("Too many parameters for round half up function");
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                // undefined or null -> null
                if (parameters.n === undefined || parameters.n === null) throw new Error(`function round half up: parameter "${parameters.n}" is undefined or null`);
                if (parameters.scale === null) throw new Error(`function round half up: parameter scale "${parameters.scale}" is null`);
                // unknwown parameter -> null
                if (node.parameters?.entries?.length === 2 && parameters.scale === undefined) throw new Error(`function round half up: unknown named parameter`);
                // scale not a number -> null
                if (parameters.scale && !(parameters.scale instanceof Decimal)) throw new Error(`function round half up: parameter scale "${parameters.scale}" must be a number`);
                // string, boolean, date, time -> null
                if (typeof parameters.n === 'string' || typeof parameters.n === 'boolean') throw new Error(`function round half up: parameter "${parameters.n}" is not a number`);
                // temporal -> null
                if (parameters.n instanceof Temporal ) throw new Error(`function round half up: parameter "${parameters.n}" is a temporal instead of a number`);
                // not a number -> null
                if (!(parameters.n instanceof Decimal)) throw new Error(`function round half up: parameter n "${parameters.n}" is not a number`);
                const scale = parameters.scale ? this.getScaleParameter(parameters.scale) : 0;
                const result = parameters.n.toDecimalPlaces(scale,Decimal.ROUND_HALF_UP);
                this.logger.debug({
                    type: "function round half up",
                    parameters,
                    result
                });
                return result;
            }
            case "round half down": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 2) throw new Error("Too many parameters for round half down function");
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                // undefined or null -> null
                if (parameters.n === undefined || parameters.n === null) throw new Error(`function round half down: parameter "${parameters.n}" is undefined or null`);
                if (parameters.scale === null) throw new Error(`function round half down: parameter scale "${parameters.scale}" is null`);
                // unknwown parameter -> null
                if (node.parameters?.entries?.length === 2 && parameters.scale === undefined) throw new Error(`function round half down: unknown named parameter`);
                // scale not a number -> null
                if (parameters.scale && !(parameters.scale instanceof Decimal)) throw new Error(`function round half down: parameter scale "${parameters.scale}" must be a number`);
                // string, boolean, date, time -> null
                if (typeof parameters.n === 'string' || typeof parameters.n === 'boolean') throw new Error(`function round half down: parameter "${parameters.n}" is not a number`);
                // temporal -> null
                if (parameters.n instanceof Temporal ) throw new Error(`function round half down: parameter "${parameters.n}" is a temporal instead of a number`);
                // not a number -> null
                if (!(parameters.n instanceof Decimal)) throw new Error(`function round half down: parameter n "${parameters.n}" is not a number`);
                const scale = parameters.scale ? this.getScaleParameter(parameters.scale) : 0;
                const result = parameters.n.toDecimalPlaces(scale,Decimal.ROUND_HALF_DOWN);
                this.logger.debug({
                    type: "function round half down",
                    parameters,
                    result
                });
                return result;
            }
            case "abs": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for abs function");
                const parameters = this.buildParameters(node.parameters,["n"],context);
                // undefined or null -> null
                if (parameters.n === undefined || parameters.n === null) throw new Error(`function abs: parameter "${parameters.n}" is undefined or null`);
                // string, boolean, date, time -> null
                if (typeof parameters.n === 'string' || typeof parameters.n === 'boolean') throw new Error(`function abs: parameter "${parameters.n}" is not a number`);
                if (parameters.n instanceof DateAndTime || parameters.n instanceof DateOnly || parameters.n instanceof Time ) throw new Error(`function abs: parameter "${parameters.n}" is a date or time`);
                let result;
                // duration -> absolute value of duration
                if (parameters.n instanceof Duration) {
                    result = parameters.n.abs();
                } else if (parameters.n instanceof Decimal) {
                    // decimal -> absolute value of decimal
                    result = parameters.n.abs();
                } else {
                    throw new Error(`function abs: invalid parameter "${parameters.n}"`);
                }
                this.logger.debug({
                    type: "function abs",
                    parameters,
                    result
                });
                return result;
            }
            case "modulo": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 2) throw new Error("Too many parameters for modulo function");
                const parameters = this.buildParameters(node.parameters,["dividend","divisor"],context);
                if (!(parameters.dividend instanceof Decimal) || !(parameters.divisor instanceof Decimal)) throw new Error("function modulo: parameters are not numbers");
                // divisor = 0 -> null
                if (parameters.divisor.isZero()) throw new Error("function modulo: divisor is zero");
                // defintion in spec: modulo (dividend,divisor) = dividend - divisor*floor (dividen d/divisor).
                const result = parameters.dividend.sub(parameters.divisor.mul(bigmath.floor(parameters.dividend.div(parameters.divisor))));
                this.logger.debug({
                    type: "function modulo",
                    parameters,
                    result
                });
                return result;
            }
            case "sqrt": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for sqrt function");
                const parameters = this.buildParameters(node.parameters,["number"],context);
                // undefined or null -> null
                if (parameters.number === undefined || parameters.number === null) throw new Error(`function sqrt: parameter "${parameters.number}" is undefined or null`);
                // string, boolean -> null
                if (typeof parameters.number === 'string' || typeof parameters.number === 'boolean') throw new Error(`function sqrt: parameter "${parameters.number}" is not a number`);
                // temporal -> null
                if (parameters.number instanceof Temporal ) throw new Error(`function sqrt: parameter "${parameters.number}" is a temporal instead of a number`);                
                const result = parameters.number instanceof Decimal ? parameters.number.sqrt() : new Decimal(parameters.number).sqrt();
                if (result.isNaN()) throw new Error(`function sqrt: parameter "${parameters.number}" is negative`);
                this.logger.debug({
                    type: "function sqrt",
                    parameters,
                    result
                });
                return result;
            }
            case "log": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for log function");
                const parameters = this.buildParameters(node.parameters,["number"],context);
                // undefined or null -> null
                if (parameters.number === undefined || parameters.number === null) throw new Error(`function log: parameter "${parameters.number}" is undefined or null`);
                // string, boolean -> null
                if (typeof parameters.number === 'string' || typeof parameters.number === 'boolean') throw new Error(`function log: parameter "${parameters.number}" is not a number`);
                // temporal -> null
                if (parameters.number instanceof Temporal ) throw new Error(`function log: parameter "${parameters.number}" is a temporal instead of a number`);
                const n = parameters.number instanceof Decimal ? parameters.number : new Decimal(parameters.number);
                // negative number -> null
                if (n.isNegative()) throw new Error(`function log: parameter "${parameters.number}" is negative`);
                // zero -> null
                if (n.isZero()) throw new Error(`function log: parameter "${parameters.number}" is zero`);
                const result = n.ln();
                this.logger.debug({
                    type: "function log",
                    parameters,
                    result
                });
                return result;
            }
            case "exp": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for exp function");
                const parameters = this.buildParameters(node.parameters,["number"],context);
                // undefined or null -> null
                if (parameters.number === undefined || parameters.number === null) throw new Error(`function exp: parameter "${parameters.number}" is undefined or null`);
                // string, boolean -> null
                if (typeof parameters.number === 'string' || typeof parameters.number === 'boolean') throw new Error(`function exp: parameter "${parameters.number}" is not a number`);
                // temporal -> null
                if (parameters.number instanceof Temporal ) throw new Error(`function exp: parameter "${parameters.number}" is a temporal instead of a number`);
                const result = parameters.number instanceof Decimal ? parameters.number.exp() : new Decimal(parameters.number).exp();
                this.logger.debug({
                    type: "function exp",
                    parameters,
                    result
                });
                return result;
            }
            case "odd": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for odd function");
                const parameters = this.buildParameters(node.parameters,["number"],context);
                // undefined or null -> null
                if (parameters.number === undefined || parameters.number === null) throw new Error(`function odd: parameter "${parameters.number}" is undefined or null`);
                // string, boolean -> null
                if (typeof parameters.number === 'string' || typeof parameters.number === 'boolean') throw new Error(`function odd: parameter "${parameters.number}" is not a number`);;
                // temporal -> null
                if (parameters.number instanceof Temporal ) throw new Error(`function odd: parameter "${parameters.number}" is not a number`);
                // not a number -> null
                if (typeof parameters.number !== 'number' && !(parameters.number instanceof Decimal)) throw new Error(`function odd: parameter "${parameters.number}" is not a number`);
                const number = parameters.number instanceof Decimal ? parameters.number : new Decimal(parameters.number);
                const result = number.mod(2) != 0 ? true : false;
                this.logger.debug({
                    type: "function odd",
                    parameters,
                    result
                });
                return result;
            }
            case "even": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) throw new Error("Too many parameters for even function");
                const parameters = this.buildParameters(node.parameters,["number"],context);
                // undefined or null -> null
                if (parameters.number === undefined || parameters.number === null) throw new Error(`function even: parameter "${parameters.number}" is undefined or null`);
                // string, boolean -> null
                if (typeof parameters.number === 'string' || typeof parameters.number === 'boolean') throw new Error(`function even: parameter "${parameters.number}" is not a number`);
                // temporal -> null
                if (parameters.number instanceof Temporal ) throw new Error(`function even: parameter "${parameters.number.exp}" is a temporal instead of a number`);
                // not a number -> null
                if (typeof parameters.number !== 'number' && !(parameters.number instanceof Decimal)) throw new Error(`function even: parameter "${parameters.number}" is not a number`);
                const number = parameters.number instanceof Decimal ? parameters.number : new Decimal(parameters.number);
                const result = number.mod(2) == 0 ? true : false;
                this.logger.debug({
                    type: "function even",
                    parameters,
                    result
                });
                return result;
            }

            case "before": {
                // named parameter doesn't make sence as (range, point) is allowed as well as (point, range)
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-point":
                        result = this.compare(compare[0].value, compare[1].value) < 0;
                        break;
                    case "point-interval":
                        result = compare[1].includeFrom ? this.compare(compare[0].value, compare[1].from) < 0 : this.compare(compare[0].value, compare[1].from) <= 0;
                        break;
                    case "interval-point":
                        result = compare[0].includeTo ? this.compare(compare[0].to, compare[1].value) < 0 : this.compare(compare[0].to, compare[1].value) <= 0;
                        break;
                    case "interval-interval":
                        result =  compare[0].includeTo && compare[1].includeFrom ? this.compare(compare[0].to, compare[1].from) < 0 : this.compare(compare[0].to, compare[1].from) <= 0;
                        break;
                    default:
                        throw new Error(`function before: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "before",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "after": {
                // named parameter doesn't make sence as (range, point) is allowed as well as (point, range)
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-point":
                        result = compare[0].value > compare[1].value;
                        break;
                    case "point-interval":
                        result = compare[1].includeTo ? this.compare(compare[0].value, compare[1].to) > 0 : this.compare(compare[0].value, compare[1].to) >= 0;
                        break;
                    case "interval-point":
                        result = compare[0].includeFrom ? this.compare(compare[0].from, compare[1].value) > 0 : this.compare(compare[0].from, compare[1].value) >= 0;
                        break;
                    case "interval-interval":
                        result = compare[0].includeFrom && compare[1].includeTo ? this.compare(compare[0].from, compare[1].to) > 0 : this.compare(compare[0].from, compare[1].to) >= 0;
                        break;
                    default:
                        throw new Error(`function after: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "after",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "meets": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        result = compare[0].includeTo && compare[1].includeFrom ? this.compare(compare[0].to, compare[1].from) === 0 : false;
                        break;
                    default:
                        throw new Error(`function meets: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "meets",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "met by": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        result = compare[0].includeFrom && compare[1].includeTo ? this.compare(compare[0].from, compare[1].to) === 0 : false;
                        break;
                    default:
                        throw new Error(`function met by: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "met by",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "overlaps": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        result = (!(compare[0].includeTo && compare[1].includeFrom) ? this.compare(compare[0].to, compare[1].from) > 0 : this.compare(compare[0].to, compare[1].from) >= 0) &&
                               (!(compare[0].includeFrom && compare[1].includeTo) ? this.compare(compare[0].from, compare[1].to) < 0 : this.compare(compare[0].from, compare[1].to) <= 0);
                        break;
                    default:
                        throw new Error(`function overlaps: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "overlaps",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "overlaps before": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        result = (!(compare[0].includeTo && compare[1].includeFrom) ? this.compare(compare[0].to, compare[1].from) > 0 : this.compare(compare[0].to, compare[1].from) >= 0) &&
                                 (!(compare[0].includeFrom && compare[1].includeTo) ? this.compare(compare[0].from, compare[1].from) < 0 : this.compare(compare[0].from, compare[1].from) <= 0);
                        break;
                    default:
                        throw new Error(`function overlaps before: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "overlaps before",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "overlaps after": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        result = (!(compare[0].includeTo && compare[1].includeFrom) ? this.compare(compare[0].to, compare[1].to) > 0 : this.compare(compare[0].to, compare[1].to) >= 0) &&
                                 (!(compare[0].includeFrom && compare[1].includeTo) ? this.compare(compare[0].from, compare[1].to) < 0 : this.compare(compare[0].from, compare[1].to) <= 0);
                        break;
                    default:
                        throw new Error(`function overlaps after: invalid parameter combination ${compare[0].type}-${compare[1].type}`);

                }
                this.logger.debug({
                    function: "overlaps after",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "finishes": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-interval":
                        result = compare[1].includeTo ? this.compare(compare[0].value, compare[1].to) === 0 : false;
                        break;
                    case "interval-interval":
                        result =  (this.compare(compare[0].includeTo, compare[1].includeTo) === 0 && this.compare(compare[0].to, compare[1].to) === 0);
                        break;
                    default:
                        throw new Error(`function finishes: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "finishes",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "finished by": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-point":
                        result = compare[0].includeTo ? this.compare(compare[0].to, compare[1].value) === 0 : false;
                        break;
                    case "interval-interval":
                        result = (this.compare(compare[0].includeTo, compare[1].includeTo) === 0 && this.compare(compare[0].to, compare[1].to) === 0);
                        break;
                    default:
                        throw new Error(`function finished by: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "finished by",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "includes": {
                const compare = this.getRangeParameters(node.parameters.entries, context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-point":
                        result = ((compare[0].includeTo ? this.compare(compare[0].to, compare[1].value) >= 0 : this.compare(compare[0].to, compare[1].value) > 0) &&
                                  (compare[0].includeFrom ? this.compare(compare[0].from, compare[1].value) <= 0 : this.compare(compare[0].from, compare[1].value) < 0));
                        break;
                    case "interval-interval":
                        result = ((this.compare(compare[0].includeTo, compare[1].includeTo) === 0 ? this.compare(compare[0].to, compare[1].to) >= 0 : this.compare(compare[0].to, compare[1].to) > 0) &&
                                  (this.compare(compare[0].includeFrom, compare[1].includeFrom) === 0 ? this.compare(compare[0].from, compare[1].from) <= 0 : this.compare(compare[0].from, compare[1].from) < 0));
                        break;
                    default:
                        throw new Error(`function includes: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "includes",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "during": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-interval":
                        result = ((compare[1].includeTo ? this.compare(compare[1].to, compare[0].value)  >= 0 : this.compare(compare[1].to, compare[0].value)  > 0) && 
                                 (compare[1].includeFrom ? this.compare(compare[1].from, compare[0].value)  <= 0 : this.compare(compare[1].from, compare[0].value) < 0));
                        break;
                    case "interval-interval":
                        result = ((this.compare(compare[0].includeTo, compare[1].includeTo)  === 0 ? this.compare(compare[1].to, compare[0].to)  >= 0 : this.compare(compare[1].to, compare[0].to)  > 0) && 
                                 (this.compare(compare[0].includeFrom, compare[1].includeFrom) === 0 ? this.compare(compare[1].from, compare[0].from) <= 0 : this.compare(compare[1].from, compare[0].from) < 0));
                        break;
                    default:
                        throw new Error(`function during: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "during",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "starts": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-interval":
                        result = compare[1].includeFrom ? this.compare(compare[0].value, compare[1].from) === 0 : false;
                        break;
                    case "interval-interval":
                        result = (this.compare(compare[0].includeFrom, compare[1].includeFrom)  === 0 && this.compare(compare[0].from, compare[1].from)  === 0);
                        break;
                    default:
                        throw new Error(`function starts: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "starts",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "started by": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-point":
                        result = compare[0].includeFrom ? this.compare(compare[0].from, compare[1].value) === 0 : false;
                        break;
                    case "interval-interval":
                        result = (this.compare(compare[0].includeFrom, compare[1].includeFrom)  === 0 && this.compare(compare[0].from, compare[1].from)  === 0);
                        break;
                    default:
                        throw new Error(`function started by: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "started by",
                    compare: compare,
                    result: result
                });
                return result;
            }
            case "coincides": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                let result;
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-point":
                        result = this.compare(compare[0].value, compare[1].value) === 0;
                        break;
                    case "interval-interval":
                        result = ((this.compare(compare[0].includeFrom, compare[1].includeFrom) === 0  && this.compare(compare[0].from, compare[1].from)  === 0) &&
                                (this.compare(compare[0].includeTo, compare[1].includeTo)  === 0  && this.compare(compare[0].to, compare[1].to) === 0));
                        break;
                    default:
                        throw new Error(`function coincides: invalid parameter combination ${compare[0].type}-${compare[1].type}`);
                }
                this.logger.debug({
                    function: "coincides",
                    compare: compare,
                    result: result
                });
                return result;
            }

            case "decision table": {
                return this.decisionTable(node,context);
            }
            case "boxed expression": {
                return this.boxedExpression(node,context);
            }
        }
    }

    decisionTable(node,context) {
        let parameterList = node?.parameters?.entries ?? [];        
        let parameters = {};
        // log
        if (!this.logger.decisiontables)  this.logger.decisiontables = [];
        let log = { rules: [] };
        this.logger.decisiontables.push(log);
        parameterList.forEach((entry, index) => {
            if (entry.node == Node.NAMED_PARAMETER) {
                // named parameters                
                let name = entry.name?.value ?? null;
                if (["inputs","outputs","rule list"].indexOf(name) >= 0) parameters[name] = entry.expression?.entries ?? [];
                if (name == "hit policy" ) parameters[name] = this._build(entry.expression) ?? "Unique";
            } else {
                // positional parameters
                if (index < 3) {
                    parameters[["inputs","outputs","rule list"][index]] = entry.expression?.entries ?? [];
                } else if (index == 3){
                    parameters["hit policy"]  = this._build(entry.expression) ?? "Unique";
                }
            }
        })
        let final = null;
        let results = [];
        parameters["rule list"].forEach((rule, indexRule) => {
            let result = { rule: indexRule, result: true, output: {}, tests: [] };
            parameters["inputs"].forEach((input, indexInput) => {
                // for inputs defined as strings we must first construct a name node to retrieve the context
                const inputNode = input.node === Node.STRING ? new Node({ node: Node.NAME, value: this._build(input)}) : input;
                // log
                let test = { input: { name: inputNode.value, value: this._build(inputNode) }, test: this.composer.expression(rule.entries[indexInput]) };
                result.tests.push(test);
                if (rule.entries[indexInput]?.node === Node.LIST) {
                    test.result = this._build(new Node({ node: Node.IN_LIST, input: inputNode, list: rule.entries[indexInput]}),context);
                    result.result = result.result && test.result;
                    // console.log(new Node({ node: Node.IN_LIST, input: inputNode, list: rule.entries[indexInput]}),this.decisionContext,result.result);
                } else {
                    test.result = this._build(new Node({ node: Node.IN, input: inputNode, test: rule.entries[indexInput]}),context)
                    result.result = result.result && test.result;
                    // console.log(new Node({ node: Node.IN, input: inputNode, list: rule.entries[indexInput]}),this.decisionContext,result.result);
                }
                // console.log(indexInput, rule, rule.entries[indexInput],result.result,new Node({ node: Node.NAME, value: this._build(input)}));
            })
            parameters["outputs"].forEach((output, indexOutput) => {
                let name = this._build(output,context);
                // result.output[name] = this._build(rule.entries[parameters["inputs"].length + indexOutput],context);
                _.set(result.output,name,this._build(rule.entries[parameters["inputs"].length + indexOutput],context));
            })
            //console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
            results.push(result);
            log.rules.push(result);
        })
        // console.log(results);
        // Hit policy
        switch (parameters["hit policy"]) {
            /* Unique: no overlap is possible and all rules are disjoint. Only a single rule can be matched. */
            case "U":
            case "Unique": {
                results.forEach((result) => {
                    if (result.result) {
                        final === null ? final = result.output : final = undefined;
                    }
                });
                return final;
            }
            /* Any: there may be overlap, but all the matching rules show equal output entries for each output (ignoring rule
                    annotations), so any match can be used. If the output entries are non-equal (ignoring rule annotations), the
                    hit policy is incorrect and the result is undefined. */
            case "A":
            case "Any": {
                results.forEach((result) => {
                    if (result.result) {
                        final === null || final === result.output ? final = result.output : final = undefined;
                    }
                });
                return final;
            }
            /* First: multiple (overlapping) rules can match, with different output entries. The first hit by rule order is returned
                        (and evaluation can halt). This is still a common usage, because it resolves inconsistencies by forcing the
                        first hit. However, first hit tables are not considered good practice because they do not offer a clear
                        overview of the decision logic. It is important to distinguish this type of table from others because the
                        meaning depends on the order of the rules. The last rule is often the catch-remainder. Because of this order,
                        the table is hard to validate manually and therefore has to be used with care.*/
            case "F":
            case "First": {
                results.forEach((result) => {
                    if (result.result) {
                        final = result.output;
                        return;
                    }
                });
                return final;
            }
            /* Rule order: returns all hits in rule order. Note: the meaning may depend on the sequence of the rules. */
            case "R":
            case "Rule order": {
                final = [];
                results.forEach((result) => {
                    if (result.result) {
                        final.push(result.output);
                    }
                });
                return final;
            }
            /* Collect: returns all hits in arbitrary order. */
            case "C":
            case "Collect": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                results.forEach((result) => {
                    if (result.result)  !final[key] ? final[key] = [result.output[key]] : final[key].push(result.output[key]);
                });
                return final;
            }
            /* Collect + (sum): the result of the decision table is the sum of all the outputs */
            case "C+": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                results.forEach((result) => {
                    if (result.result)  !final[key] ? final[key] = result.output[key] : final[key] = final[key].plus(result.output[key]);
                });
                return final;
            }
            /* Collect < (min): the result of the decision table is the smallest value of all the outputs */
            case "C<": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                const self = this;
                results.forEach((result) => {
                    if (result.result && (!final[key] || self.compare(result.output[key], final[key]) < 0 )) final[key] = result.output[key];
                });
                return final;
            }
            /* Collect > (max): the result of the decision table is the largest value of all the outputs */
            case "C>": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                const self = this;
                results.forEach((result) => {
                    if (result.result && (!final[key] || self.compare(result.output[key], final[key]) > 0 )) final[key] = result.output[key];
                });
                return final;
            }
            /* Collect # (count): the result of the decision table is the number of outputs */
            case "C#": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                final[key] = 0;
                results.forEach((result) => {
                    if (result.result) final[key]++;
                });
                return final;
            }
        }
        return undefined;
    }

    boxedExpression(node,context) {
        const parameterList = node?.parameters?.entries ?? [];  
        // console.log(util.inspect(parameterList, { showHidden: false, depth: null, colors: true }));
        let parameters = {};
        parameterList.forEach((entry, index) => {
            if (entry.node == Node.NAMED_PARAMETER) {
                // named parameters                
                let name = entry.name?.value ?? null;
                if (["context","expression"].indexOf(name) >= 0) parameters[name] = entry.expression ?? [];
            } else {
                // positional parameters
                parameters[["context","expression"][index]] = entry ?? [];
            }
        })
        return this._build(parameters.expression,Object.assign(context || {},this._build(parameters.context)  || {}));
    }

 }
 
 module.exports = Interpreter;
 