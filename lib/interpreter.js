/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

const nearley = require("nearley");
const grammar = require("./feel.grammar.js");
const Node = require("./ast.js");
const { Temporal, DateAndTime, DateOnly,  Time, Duration} = require("./datetime.js");
const { Strings } = require("./strings.js");

// const util = require('util');

class Interpreter {
 
    parse (exp) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

        try {
            parser.feed(exp);
            this.ast = parser.results;
            return true;
        } catch(e) {
            this.ast = {};
            this.error = e;
            return false;
        } 
    }

    evaluate () {
        if (arguments.length > 1) {
            this.parse(arguments[0]);
            this.data = arguments[1];
        } else if (typeof arguments[0] === "string" ) {
            this.parse(arguments[0]);
            this.data = {};
        } else {
            this.data = arguments[0];
        }
        if (!this.ast.length > 0) return null;
        const result = this._build(this.ast[0]);
        return result && result instanceof Temporal ? result.exp : result;
     }

    _build (node,context) {
        if (!node) console.log(node);
        /* istanbul ignore else */
        if (this["__"+node.node] && {}.toString.call(this["__"+node.node]) === "[object Function]") {
            return this["__"+node.node](node,context);
        } else {
            throw new Error("Interpreter - missing function " + node.node);
        }
    }

    __NUMBER (node) {
        return node.float;
    }

    __NAME (node,context) {
        if (context && node.value in context) return context[node.value];
        return this.data[node.value];
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
        let left = this._build(node.left,context);
        const right = this._build(node.right,context);
        if (left instanceof Temporal) {
            switch (node.operator) {
                case "-": return left.subtract(right);
                case "+": return left.add(right);
            }
        }
        switch (node.operator) {
            case "-": return left - right;
            case "+": return left + right;
        }
    }

    __PRODUCT (node,context) {
        switch (node.operator) {
            case "/": return this._build(node.left,context) / this._build(node.right,context); break;
            case "*": return this._build(node.left,context) * this._build(node.right,context); break;
        }
    }

    __EXPONENTATION (node,context) {
        return this._build(node.left,context) ** this._build(node.right,context);
    }

    __NEGATION (node,context) {
        return -(this._build(node.expression,context));
    }

    __COMPARISON (node,context) {
        let left = this._build(node.left,context);
        let right = this._build(node.right,context);
        if (left instanceof Temporal) left = left.value;
        if (right instanceof Temporal) right = right.value;
        switch (node.operator) {
            case "=": return left == right;
            case "<": return left < right;
            case ">": return left > right;
            case ">=": return left >= right;
            case "<=": return left <= right;
            case "!=": return left !== right;
        }
    }

    __LOGICAL (node) {
        switch (node.operator) {
            case "and": return this._build(node.left) && this._build(node.right);
            case "or": return this._build(node.left) || this._build(node.right);
        }
    }

    __NOT (node,context) {
        return !(this._build(node.parameters,context));
    }

    __EVAL (node,context) {
        return this._build(node.expression,context);
    } 

    __LIST (node) {
        let list = [];
        if (Array.isArray(node.entries)) {
            node.entries.forEach((entry) => {
                list.push(this._build(entry));
            });
        }
        return list;
    }

    __PATH (node) {
        let obj = this._build(node.object);
        if (Array.isArray(obj)) {
            let projection = [];
            obj.forEach((entry) => {
                projection.push(entry && node.property && node.property.value ? entry[node.property.value] : null);
            });
            return projection;
        }
        return obj && node.property && node.property.value ? obj[node.property.value] : null;
    }

    __IF (node) {
        return this._build(node.condition) ? this._build(node.then) : this._build(node.else);
    }

    __CONTEXT (node) {
        let context = {};
        if (node.data && Array.isArray(node.data.entries)) {
            node.data.entries.forEach((entry) => {
                let element = this._build(entry);
                context[element.key] = element.value;
            });
        }
        return context;
    }

    __CONTEXT_ENTRY (node) {
        return { key: node.key.node === Node.NAME ? node.key.value : this._build(node.key), value: this._build(node.expression) };
    }

    __DATE_AND_TIME (node) {
        let parameters = this._build(node.parameters);
        return Temporal.parse(parameters ? parameters[0] : null);
    }

    __AT_LITERAL (node) {
        let expression = this._build(node.expression);
        return Temporal.parse(expression ? expression : null);
    }

    __FILTER (node) {
        let list = this._build(node.list);
        if (!Array.isArray(list)) return null;
        switch (node.filter.node) {
            case Node.NUMBER:
                let i = this._build(node.filter);
                return i > 0 ? (i <= list.length ? list[i-1] : null) : null;
            case Node.NEGATION:
                let n = this._build(node.filter);
                return list.length + n > 0 ? list[list.length + n-1] : null;
            case Node.NAME:
                let m = this._build(node.filter);
                return m >= 0 ? (m <= list.length ? list[m-1] : null) : (list.length + m > 0 ? list[list.length + m-1] : null);
            default:
                let r = [];
                list.forEach((item) => {
                    if (this._build(node.filter, { item }) == true) r.push(item);
                })
                return r;
            // default:
            //     return null;
        }
    }

    __IN (node,context) {
        switch (node.test.node) {
            case Node.DASH: return true;
            case Node.EVAL:
                if (node.test.expression.node === Node.UNARY) {
                    node.test.expression.input = node.input;
                    return this._build(node.test.expression,context);  
                }
                break;
            case Node.NAME:
                return  (this._build(node.input,context) === this._build(node.test,context));
            case Node.INTERVAL:
                let lower = false, upper = false;
                let input = this._build(node.input,context);
                if (input instanceof Temporal) input = input.value;
                let from = this._build(node.test.from,context);
                let to = this._build(node.test.to,context);
                if (from instanceof Temporal) from = from.value;
                if (to instanceof Temporal) to = to.value;
                switch (node.test.open) {
                    case "[": lower = input >= from; break;
                    case "(":
                    case "]": lower = input > from; break;
                }
                switch (node.test.close) {
                    case "]": upper = input <= to; break;
                    case ")":
                    case "[": upper = input < to; break;
                }
                return lower && upper;
            default:
                return false;
        }
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

    __IN_LIST (node) {
        if (!node.list || !Array.isArray(node.list.entries)) return false;
        let result = false;
        node.list.entries.forEach((entry) => {
            switch (entry.node) {
                case Node.UNARY: 
                    entry.input = node.input;
                    result = result || this._build(entry);
                    break;
                default:
                    result = result || (this._build(node.input) === this._build(entry));
            }
        });
        return result;
    }

    __UNARY (node) {
        if (!node.input) return false;
        switch (node.operator) {
            case "<": return this._build(node.input) < this._build(node.value);
            case ">": return this._build(node.input) > this._build(node.value);
            case ">=": return this._build(node.input) >= this._build(node.value);
            case "<=": return this._build(node.input) <= this._build(node.value);
        }
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
                case "number": return typeof instance == 'number';
                case "string": return typeof instance == 'string';
                case "boolean": return typeof instance == 'boolean';
                case "date": return instance instanceof DateOnly;
                case "date and time": return instance instanceof DateAndTime;
                default: return false;
            }
        }
    }

    buildParameters (node,names,context) {
        let parameters = {};
        if (node && node.node === Node.LIST) {
            node.entries.forEach((entry,index) => {
                parameters[names[index]] = this._build(entry,context);
            })
        }
        return parameters;
    } 

    __FUNCTION_CALL (node,context) {
        switch (node.name.value) {
            case "today": return Temporal.today();
            case "now": return Temporal.now();
            case "day of week": {
                const parameters = this.buildParameters(node.parameters,["date"],context);
                return Temporal.dayOfWeek(parameters);
            }
            case "day of year": {
                const parameters = this.buildParameters(node.parameters,["date"],context);
                return Temporal.dayOfYear(parameters);
            }
            case "week of year": {
                const parameters = this.buildParameters(node.parameters,["date"],context);
                return Temporal.weekOfYear(parameters);
            }
            case "month of year": {
                const parameters = this.buildParameters(node.parameters,["date"],context);
                return Temporal.monthOfYear(parameters);
            }
            case "is defined": {
                const parameters = this.buildParameters(node.parameters,["value"],context);
                return typeof parameters.value == 'undefined' ? false : true;
            }
            case "even": {
                const parameters = this.buildParameters(node.parameters,["value"],context);
                return (typeof parameters.value == 'number' && parameters.value % 2 == 0) ? true : false;
            }
            case "substring": {
                const parameters = this.buildParameters(node.parameters,["string","start","length"],context);
                return (typeof parameters.string == 'string') ? parameters.string.substring(parameters.start-1, parameters.length ? parameters.start+parameters.length-1 : parameters.string.length) : undefined;
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
                return (typeof parameters.string == 'string') ? parameters.string.substring(parameters.string.indexOf(parameters.match)+parameters.match.length,parameters.string.length) : undefined;
            }
            case "contains": {
                const parameters = this.buildParameters(node.parameters,["string","match"],context);
                return (typeof parameters.string == 'string') ? ( parameters.string.indexOf(parameters.match) >= 0 ? true : false ) : undefined;
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
                return Strings.replace(parameters);
            }
            case "split": {
                const parameters = this.buildParameters(node.parameters,["string","delimiter"],context);
                return Strings.split(parameters);
            }
            case "extract": {
                const parameters = this.buildParameters(node.parameters,["string","pattern"],context);
                return Strings.extract(parameters);
            }
        }
    }

 }
 
 module.exports = Interpreter;
 