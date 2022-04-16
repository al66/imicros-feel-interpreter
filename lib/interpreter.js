/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

const nearley = require("nearley");
const grammar = require("./../lib/feel.grammar.js");
const Node = require("./ast.js");
const { Temporal, DateAndTime, DateOnly,  Time, Duration} = require("./datetime.js");
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

    _build (node) {
        if (!node) console.log(node);
        /* istanbul ignore else */
        if (this["__"+node.node] && {}.toString.call(this["__"+node.node]) === "[object Function]") {
            return this["__"+node.node](node);
        } else {
            throw new Error("Interpreter - missing function " + node.node);
        }
    }

    __NUMBER (node) {
        return node.float;
    }

    __NAME (node) {
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

    __SUM (node) {
        let left = this._build(node.left);
        const right = this._build(node.right);
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

    __PRODUCT (node) {
        switch (node.operator) {
            case "/": return this._build(node.left) / this._build(node.right); break;
            case "*": return this._build(node.left) * this._build(node.right); break;
        }
    }

    __EXPONENTATION (node) {
        return this._build(node.left) ** this._build(node.right);
    }

    __NEGATION (node) {
        return -(this._build(node.expression));
    }

    __COMPARISON (node) {
        let left = this._build(node.left);
        let right = this._build(node.right);
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
            case "and": return this._build(node.left) && this._build(node.right); break;
            case "or": return this._build(node.left) || this._build(node.right); break;
        }
    }

    __EVAL (node) {
        return this._build(node.expression);
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
                return null;
        }
    }

    __IN (node) {
        switch (node.test.node) {
            case Node.DASH: return true;
            case Node.EVAL:
                if (node.test.expression.node === Node.UNARY) {
                    node.test.expression.input = node.input;
                    return this._build(node.test.expression);  
                }
                break;
            case Node.NAME:
                return  (this._build(node.input) === this._build(node.test));
            default:
                return false;
        }
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

    __FUNCTION_CALL (node) {
        switch (node.name.value) {
            case "today": return Temporal.today();
            case "now": return Temporal.now();
        }
    }

 }
 
 module.exports = Interpreter;
 