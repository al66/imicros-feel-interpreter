/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

const nearley = require("nearley");
const grammar = require("./../lib/feel.grammar.js");
const Node = require("./ast.js");

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
        const result = this._build(this.ast[0]);
        return result && result.DateAndTime ? result.toString() : result;
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
        switch (node.operator) {
            case "-": return this._build(node.left) - this._build(node.right); break;
            case "+": return this._build(node.left) + this._build(node.right); break;
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
        switch (node.operator) {
            case "=": return this._build(node.left) == this._build(node.right); break;
            case "<": return this._build(node.left) < this._build(node.right); break;
            case ">": return this._build(node.left) > this._build(node.right); break;
            case ">=": return this._build(node.left) >= this._build(node.right); break;
            case "<=": return this._build(node.left) <= this._build(node.right); break;
            case "!=": return this._build(node.left) !== this._build(node.right); break;
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

 }
 
 module.exports = Interpreter;
 