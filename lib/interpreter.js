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
const Decimal = require('decimal.js');
const Composer = require("./composer.js").Composer;

const _ = require("./lodash");

const util = require('util');

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

class Logger {
    constructor () {
        this.log = [];
        this.limit = 50000;
    }

    activate () {
        this.active = true;
    }

    deactivate () {
        this.active = false;
    }

    clear () {
        this.log = [];
    }

    add (entry) {
        if (this.active && this.log.length < this.limit) this.log.push(entry);
    }

    getLog () {
        return this.log;
    }
}

function substituteTemporalValues(obj) {
    if (Array.isArray(obj)) {
        return obj.map(substituteTemporalValues); // Recursively handle arrays
    } else if (obj && typeof obj === "object") {
        if (obj instanceof Temporal) return obj.exp; // Substitute Temporal instances with their `exp` property
        return Object.entries(obj).reduce((acc, [key, value]) => {
            acc[key] = substituteTemporalValues(value); // Recursively handle objects
            return acc;
        }, {});
    }
    return obj; // Return the value as is if no substitution is needed
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
            this.error = {
                text: e.token?.text || null,
                position: exp.substring(e.token?.offset > 10 ? e.token?.offset - 100 : 0, e.token?.offset || 0),
                offset: e.token?.offset || null,
                line: e.token?.line || null,
                col: e.token?.col || null,
                original: e
            };
            throw new ParserError("Parsing failed",this.error);
        } 
    }

    evaluate ({ expression, context } = {}) {
        this.error = null;
        this.composer = new Composer();
        if (expression || context) {
            if (expression) this.parse(expression);
            this.data = context || {};
        } else {
            if (arguments.length > 1) {
                this.parse(arguments[0]);
                this.data = arguments[1];
            } else if (typeof arguments[0] === "string" ) {
                this.parse(arguments[0]);
                this.data = {};
            } else {
                this.data = arguments[0];
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
            try {
                const result = substituteTemporalValues(this._build(this.ast[0], this.data));
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

    _build (node,context) {
        if (!node) return "#undefined";
        /* istanbul ignore else */
        if (this["__"+node.node] && {}.toString.call(this["__"+node.node]) === "[object Function]") {
            return this["__"+node.node](node,context);
        } else {
            console.log("_build",util.inspect(node, { showHidden: false, depth: null, colors: true }));
            throw new Error("Interpreter - missing function " + node.node);
        }
    }


    __NUMBER (node) {
        return node.float;
    }

    __NAME (node,context) {
        if (context && node.value in context) return context[node.value];
        if (this.decisionContext && node.value in this.decisionContext) return this.decisionContext[node.value];
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
        if (left === null || right === null) return null;
        if (left instanceof Temporal) {
            switch (node.operator) {
                case "-": return left.subtract(right);
                case "+": return left.add(right);
            }
        }
        switch (node.operator) {
            case "-": return typeof left === 'number' && typeof right === 'number' ? new Decimal(left).minus(right).toNumber() : left - right;
            case "+": return typeof left === 'number' && typeof right === 'number' ? new Decimal(left).plus(right).toNumber() : left + right;
        }
    }

    __PRODUCT (node,context) {
        try {
            const left = this._build(node.left,context);
            const right = this._build(node.right,context);
            if (left === null || right === null) return null;
            switch (node.operator) {
                case "/": {
                    const divisor = new Decimal(right || NaN).toNumber();
                    if (isNaN(divisor) || divisor === 0) return null;
                    return new Decimal(left || NaN).div(new Decimal(right || NaN)).toNumber(); 
                }
                case "*": {
                    return new Decimal(left || NaN).mul(new Decimal(right) || NaN).toNumber(); 
                }
            }
        } catch (e) {
            throw new InterpreterError(`Failed evaluation of product ${node.operator}`, { node, context, error: e });
        }
    }

    __EXPONENTATION (node,context) {
        return Decimal.pow(new Decimal(this._build(node.left,context)),new Decimal(this._build(node.right,context))).toNumber();
    }

    __NEGATION (node,context) {
        return -(this._build(node.expression,context));
    }

    __COMPARISON (node,context) {
        let left = this._build(node.left,context);
        let right = this._build(node.right,context);
        if (left instanceof Temporal) left = left.value;
        if (right instanceof Temporal) right = right.value;
        // if (context?._debug) console.log(node.left, context, right);
        switch (node.operator) {
            case "=": return left == right;
            case "<": return left < right;
            case ">": return left > right;
            case ">=": return left >= right;
            case "<=": return left <= right;
            case "!=": return left !== right;
        }
    }

    __LOGICAL (node,context) {
        switch (node.operator) {
            case "and": return this._build(node.left,context) && this._build(node.right,context);
            case "or": return this._build(node.left,context) || this._build(node.right,context);
        }
    }

    __NOT (node,context) {
        return !(this._build(node.parameters,context));
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
        return obj && node.property && node.property.value ? ( obj[node.property.value] === undefined ? null : obj[node.property.value] ) : null;
    }

    __IF (node) {
        return this._build(node.condition) ? this._build(node.then) : this._build(node.else);
    }

    __CONTEXT (node,context) {
        // console.log("_CONTEXT",util.inspect(context, { showHidden: false, depth: null, colors: true }));
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
            let result = { key: node.key.node === Node.NAME ? node.key.value : this._build(node.key,context), value: this._build(node.expression,context) };
            this.logger.add({ type: "Context entry", ...result });
            return result;
        } catch (e) {
            throw new InterpreterError(`Failed evaluation of context entry`, { node, context, error: e });
        }
    }

    __DATE_AND_TIME (node,context) {
        // console.log("_DATE_AND_TIME",util.inspect(context, { showHidden: false, depth: null, colors: true }));
        let parameters = this._build(node.parameters,context);
        // console.log("_DATE_AND_TIME:parameters",util.inspect(node.parameters, { showHidden: false, depth: null, colors: true }));
        if (Array.isArray(parameters) && parameters.length === 3 && node.name === 'date') return DateOnly.build(parameters);
        if (Array.isArray(parameters) && parameters.length >= 3 && node.name === 'time') return Time.build(parameters);
        return Temporal.parse(parameters ? parameters[0] : null);
    }

    __AT_LITERAL (node,context) {
        let expression = this._build(node.expression,context);
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
            case Node.COMPARISON:
                let filtered = [];
                // filter by key
                if (node.filter.operator === "=" && node.filter.left.node === Node.NAME && node.filter.left.value.toUpperCase() === "KEY") {
                    let key = this._build(node.filter.right);
                    return list.find((item) => { return typeof item === 'object' && item.key === key; });
                }
                list.forEach((item) => {
                    if (this._build(node.filter, { ...item, item }) === true) filtered.push(item);
                })
                return filtered;
            default:
                let r = [];
                list.forEach((item) => {
                    if (this._build(node.filter, { ...item, item }) == true) r.push(item);
                })
                return r;
        }
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
        switch (node.test.node) {
            case Node.DASH: return true;
            case Node.EVAL:
                if (node.test.expression.node === Node.UNARY) {
                    node.test.expression.input = node.input;
                    return this._build(node.test.expression,context);  
                }
                if (node.test.expression.node === Node.INTERVAL) {
                    let testNode = new Node({ node: Node.IN, input: node.input, test: node.test.expression });
                    return this._build(testNode,context);
                }
                break;
            case Node.NAME:
            case Node.STRING:
            case Node.BOOLEAN:
            case Node.NUMBER:
            case Node.FUNCTION_CALL:
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
            case Node.UNARY:
                node.test.input = node.input;
                return this._build(node.test,context);  
            case Node.UNARYTESTS:
                let result = false;
                // unary tests like >8, <10, >=8, <=10, =8, !=8, "any", "list" - just one of them must evaluate to true
                node.test.list.entries.forEach((test) => {
                    let testNode = new Node({ node: Node.IN, input: node.input, test });
                    // if (this.logger.active) console.log("_UNARYTEST",util.inspect({ testNode, result: this._build(testNode,context) }, { showHidden: false, depth: null, colors: true }));
                    result = result || this._build(testNode,context);
                })
                return result;  
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

    __IN_LIST (node,context) {
        if (!node.list || !Array.isArray(node.list.entries)) return false;
        let result = false;
        node.list.entries.forEach((entry) => {
            switch (entry.node) {
                case Node.UNARY: 
                    entry.input = node.input;
                    result = result || this._build(entry,context);
                    break;
                default:
                    result = result || (this._build(node.input,context) === this._build(entry,context));
            }
        });
        return result;
    }

    __UNARY (node,context) {
        if (!node.input) return false;
        switch (node.operator) {
            case "!=": return this._build(node.input,context) !== this._build(node.value,context);
            case "<": return this._build(node.input,context) < this._build(node.value,context);
            case ">": return this._build(node.input,context) > this._build(node.value,context);
            case ">=": return this._build(node.input,context) >= this._build(node.value,context);
            case "<=": return this._build(node.input,context) <= this._build(node.value,context);
        }
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
                case "number": return typeof instance == 'number';
                case "string": return typeof instance == 'string';
                case "boolean": return typeof instance == 'boolean';
                case "date": return instance instanceof DateOnly;
                case "date and time": return instance instanceof DateAndTime;
                default: return false;
            }
        }
    }

    __BOXED (node,context) {
        return this._build(node.result,Object.assign(context || {},this._build(node.context)  || {}));
    }

    // DMN Main
    __MAIN (node,context) {
        // clone context
        let localContext = structuredClone(context);
        // console.log("_MAIN",util.inspect(node, { showHidden: false, depth: null, colors: true }));
        let result = null;
        for (let i = 0; i < node.definitions.length; i++) {
            switch (node.definitions[i].node) {
                case Node.INPUT: result = this._build(node.definitions[i],localContext); result = localContext; break;
                case Node.RETURN: result = this._build(node.definitions[i],localContext); break;
                case Node.DECISIONTABLE: result = this._build(node.definitions[i],localContext); break;
            }
        }
        return result;
    }

    // DMN Input Expression
    __INPUT (node,context) {
        let result = {};
        context[node.name] = this._build(node.value,context);
        result[node.name] = context[node.name];
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
            for (let i = 0; i < node.outputs.length; i++) {
                let value = node.outputs[i].value ? this._build(node.outputs[i].value,context) : null
                _.set(rule.output,node.outputs[i].name,value,context);
                // build list of output values (for hitpolicy Priority)
                let values = node.outputs[i].values ? this._build(node.outputs[i].values,context) : null;
               Array.isArray(values) ? rule.priority = values.indexOf(value) : -1;
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
        for (let i = 0; i < node.outputs.length; i++) {
            outputs.push({
                name: node.outputs[i].name,
                values: node.outputs[i].values ? this._build(node.outputs[i].values,context) : null
            });
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
                        context = Object.assign(context,rule.output);
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
                        context = Object.assign(context,rule.output);
                        return true;
                    } else {
                        return false;
                    }
                });
                break;
            }
            // Priority: multiple rules can match, with different output entries. This policy returns the matching rule
            //           with the highest output priority. Output priorities are specified in the ordered list of output values, in
            //           decreasing order of priority. Note that priorities are independent from rule sequence.
            case "P":
            case "Priority": {
                results.forEach((rule) => {
                    let p = -1;
                    if (rule.result && rule.priority >= 0 && ( p < 0 || rule.priority > p )) {
                        output = rule.output;
                    }
                });
                context = Object.assign(context,output);                        
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
                        context = Object.assign(context,rule.output);
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
                results.forEach((rule) => {
                    if (rule.result) {
                        output.push(rule.output);
                    }
                });
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
                                    output[key] ? output[key] += rule.output[key] : output[key] = rule.output[key];
                                }
                            }
                        });
                        break;
                    }
                    case "MIN": {
                        results.forEach((rule) => {
                            if (rule.result) {
                                for (let key in rule.output) {
                                    if (!output[key] || rule.output[key] < output[key]) output[key] = rule.output[key];
                                }
                            }
                        });
                        break;
                    }
                    case "MAX": {
                        results.forEach((rule) => {
                            if (rule.result) {
                                for (let key in rule.output) {
                                    if (!output[key] || rule.output[key] > output[key]) output[key] = rule.output[key];
                                }
                            }
                        });
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
                        results.forEach((rule) => {
                            if (rule.result) {
                                // merge outputs
                                for (let key in rule.output) {
                                    output[key] ? output[key].push(rule.output[key]) : output[key]= [rule.output[key]];
                                }
                            }
                        });
                    }
                };
                break;
            }
            /*
            // Collect + (sum): the result of the decision table is the sum of all the outputs
            case "C+": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                results.forEach((result) => {
                    if (result.result)  !final[key] ? final[key] = result.output[key] : final[key] += result.output[key];
                });
                return final;
            }
            // Collect < (min): the result of the decision table is the smallest value of all the outputs
            case "C<": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                results.forEach((result) => {
                    if (result.result && (!final[key] || result.output[key] < final[key])) final[key] = result.output[key];
                });
                return final;
            }
            // Collect > (max): the result of the decision table is the largest value of all the outputs 
            case "C>": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                results.forEach((result) => {
                    if (result.result && (!final[key] || result.output[key] > final[key])) final[key] = result.output[key];
                });
                return final;
            }
            // Collect # (count): the result of the decision table is the number of outputs
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
            */
        }
        this.logger.add({
            type : "Decisiontable",
            name : node.name,
            hitPolicy : node.hitPolicy,
            inputs : inputs,
            output
        });
        // default: return empty object
        return output;
    }

    // DMN RETURN
    __RETURN (node,context) {
        let result = {};
        result[node.name] = this._build(node.value,context);
        context[node.name] = result[node.name];
        this.logger.add({
            type: "Return",
            name: node.name,
            expression: node.expression, 
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
            case "years and months duration": {
                const parameters = this.buildParameters(node.parameters,["from","to"],context);
                return Temporal.monthBetween(parameters);
            }

            case "number": {
                const parameters = this.buildParameters(node.parameters,["from"],context);
                return typeof parameters.from == 'string' ? parseFloat(parameters.from) : undefined;
            }
            case "string": {
                const parameters = this.buildParameters(node.parameters,["from"],context);
                if (parameters.from instanceof Temporal) return parameters.from.exp;
                return String(parameters.from);
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

            case "list contains": {
                const parameters = this.buildParameters(node.parameters,["list","element"],context);
                return (Array.isArray(parameters.list)) ? parameters.list.indexOf(parameters.element) >= 0 : false;
            }
            case "count": {
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? parameters.list.length : undefined;
            }
            case "min": {
                if (node.parameters?.entries?.length > 1) return Math.min(...this._build(node.parameters));
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? Math.min(...parameters.list) : undefined;
            }
            case "max": {
                if (node.parameters?.entries?.length > 1) return Math.max(...this._build(node.parameters));
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? Math.max(...parameters.list) : undefined;
            }
            case "sum": {
                if (node.parameters?.entries?.length > 1) return this._build(node.parameters).reduce((a,b)=>a+b);
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? parameters.list.reduce((a,b)=>a+b,0) : undefined;
            }
            case "product": {
                if (node.parameters?.entries?.length > 1) return this._build(node.parameters).reduce((a,b)=>a*b);
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? ( parameters.list.length > 0 ? parameters.list.reduce((a,b)=>a*b) : 0 ) : undefined;
            }
            case "mean": {
                if (node.parameters?.entries?.length > 1) return (this._build(node.parameters).reduce((a,b)=>a+b) / node.parameters.entries.length) || 0;
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? ( parameters.list.length > 0 ? (parameters.list.reduce((a,b)=>a+b) / parameters.list.length) : 0 ) : undefined;
            }
            case "median": {
                const parameters = node.parameters?.entries?.length > 1 ? [...this._build(node.parameters)] : this.buildParameters(node.parameters,["list"],context).list;
                function median(values) {
                    values.sort(function(a,b){
                      return a-b;
                    });
                  
                    var half = Math.floor(values.length / 2);
                    
                    if (values.length % 2)
                      return values[half];
                    
                    return (values[half - 1] + values[half]) / 2.0;
                }
                return (Array.isArray(parameters) && parameters.length > 0) ? median(parameters) : null;
            }
            case "stddev": {
                const parameters = node.parameters?.entries?.length > 1 ? [...this._build(node.parameters)] : this.buildParameters(node.parameters,["list"],context).list;
                if (!Array.isArray(parameters)) return undefined;
                const n = parameters.length
                const mean = parameters.reduce((a, b) => a + b) / n
                return Math.sqrt(parameters.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
            }
            case "mode": {
                const parameters = node.parameters?.entries?.length > 1 ? [...this._build(node.parameters)] : this.buildParameters(node.parameters,["list"],context).list;
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
                return Array.isArray(parameters) ? getModes(parameters) : null;
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
                if (!Array.isArray(parameters.list)) return undefined;
                const start = parameters["start position"] && parameters["start position"] > 0 ? parameters["start position"] - 1 : 0;
                const end = parameters.length && parameters.length > 0 ? start + parameters.length : parameters.list.length;
                return parameters.list.slice(start,end);
            }
            case "append": {
                const parameters = this.buildParameters(node.parameters,["list"],context);
                const elements = node.parameters?.entries?.length > 1 ? this._build(node.parameters).slice(1) : [];
                return (Array.isArray(parameters.list)) ? parameters.list.concat(elements) : undefined;
            }
            case "union":
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
                return (Array.isArray(parameters.list)) ? [...new Set(parameters.list)] : undefined;
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
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                return (typeof parameters.n == 'number' && typeof parameters.scale == 'number') ? parseFloat(parameters.n.toFixed(parameters.scale)) : undefined;
            }
            case "floor": {
                const parameters = this.buildParameters(node.parameters,["n"],context);
                return (typeof parameters.n == 'number' ) ? Math.floor(parameters.n) : undefined;
            }
            case "ceiling": {
                const parameters = this.buildParameters(node.parameters,["n"],context);
                return (typeof parameters.n == 'number' ) ? Math.ceil(parameters.n) : undefined;
            }
            case "round up": {
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                const mult = typeof parameters.scale == 'number' ?  10 ** parameters.scale : 1;
                if (typeof parameters.n == 'number') {
                    return parameters.n >= 0 ? Math.ceil(parameters.n * mult) / mult : Math.floor(parameters.n * mult) / mult
                }
                return undefined;
            }
            case "round down": {
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                const mult = typeof parameters.scale == 'number' ?  10 ** parameters.scale : 1;
                return (typeof parameters.n == 'number') ? Math.trunc(parameters.n * mult) / mult : undefined;
            }
            case "round half up": {
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                const sign = parameters.n < 0 ? -1 : 1;
                const mult = typeof parameters.scale == 'number' ?  10 ** parameters.scale : 1;
                return (typeof parameters.n == 'number') ? (Math.round(Math.abs(parameters.n) * mult) / mult) * sign : undefined;
            }
            case "round half down": {
                const parameters = this.buildParameters(node.parameters,["n","scale"],context);
                const sign = parameters.n < 0 ? 1 : -1;
                const mult = typeof parameters.scale == 'number' ?  10 ** parameters.scale : 1;
                return (typeof parameters.n == 'number') ? (Math.round(-Math.abs(parameters.n) * mult) / mult) * sign : undefined;
            }
            case "abs": {
                // too many parameters -> null
                if (node.parameters?.entries?.length > 1) return null;
                const parameters = this.buildParameters(node.parameters,["n"],context);
                // undefined or null -> null
                if (parameters.n === undefined || parameters.n === null) return null;
                // string, boolean, date, time -> null
                if (typeof parameters.n === 'string' || typeof parameters.n === 'boolean') return null;
                if (parameters.n instanceof DateAndTime || parameters.n instanceof DateOnly || parameters.n instanceof Time ) return null;
                // duration -> absolute value of duration
                if (parameters.n instanceof Duration) return parameters.n.abs();
                // number -> absolute value of number
                return (typeof parameters.n === 'number' ) ? Math.abs(parameters.n) : undefined;
            }
            case "modulo": {
                const parameters = this.buildParameters(node.parameters,["dividend","divisor"],context);
                return (typeof parameters.dividend === 'number' && typeof parameters.divisor === 'number' ) ? parameters.dividend % parameters.divisor : undefined;
            }
            case "sqrt": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number === 'number') ? Math.sqrt(parameters.number) : undefined;
            }
            case "log": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number === 'number') ? Math.log(parameters.number) : undefined;
            }
            case "exp": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number === 'number') ? Math.exp(parameters.number) : undefined;
            }
            case "odd": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number === 'number' && parameters.number % 2 != 0) ? true : false;
            }
            case "even": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number === 'number' && parameters.number % 2 == 0) ? true : false;
            }

            case "before": {
                // named parameter doesn't make sence as (range, point) is allowed as well as (point, range)
                const compare = this.getRangeParameters(node.parameters.entries,context);
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-point":
                        return compare[0].value < compare[1].value;
                    case "point-interval":
                        return compare[1].includeFrom ? compare[0].value < compare[1].from : compare[0].value <= compare[1].from;
                    case "interval-point":
                        return compare[0].includeTo ? compare[0].to < compare[1].value : compare[0].to <= compare[1].value;
                    case "interval-interval":
                        return compare[0].includeTo && compare[1].includeFrom ? compare[0].to < compare[1].from : compare[0].to <= compare[1].from;
                }
                return undefined;
            }
            case "after": {
                // named parameter doesn't make sence as (range, point) is allowed as well as (point, range)
                const compare = this.getRangeParameters(node.parameters.entries,context);
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-point":
                        return compare[0].value > compare[1].value;
                    case "point-interval":
                        return compare[1].includeTo ? compare[0].value > compare[1].to : compare[0].value >= compare[1].to;
                    case "interval-point":
                        return compare[0].includeFrom ? compare[0].from > compare[1].value : compare[0].from >= compare[1].value;
                    case "interval-interval":
                        return compare[0].includeFrom && compare[1].includeTo ? compare[0].from > compare[1].to : compare[0].from >= compare[1].to;
                }
                return undefined;
            }
            case "meets": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        return compare[0].includeTo && compare[1].includeFrom ? compare[0].to === compare[1].from : false;
                }
                return undefined;
            }
            case "met by": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        return compare[0].includeFrom && compare[1].includeTo ? compare[0].from === compare[1].to : false;
                }
                return undefined;
            }
            case "overlaps": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        return (!(compare[0].includeTo && compare[1].includeFrom) ? compare[0].to > compare[1].from : compare[0].to >= compare[1].from) &&
                               (!(compare[0].includeFrom && compare[1].includeTo) ? compare[0].from < compare[1].to : compare[0].from <= compare[1].to);

                }
                return undefined;
            }
            case "overlaps before": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        return (!(compare[0].includeTo && compare[1].includeFrom) ? compare[0].to > compare[1].from : compare[0].to >= compare[1].from) &&
                               (!(compare[0].includeFrom && compare[1].includeTo) ? compare[0].from < compare[1].from : compare[0].from <= compare[1].from);

                }
                return undefined;
            }
            case "overlaps after": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        return (!(compare[0].includeTo && compare[1].includeFrom) ? compare[0].to > compare[1].to : compare[0].to >= compare[1].to) &&
                               (!(compare[0].includeFrom && compare[1].includeTo) ? compare[0].from < compare[1].to : compare[0].from <= compare[1].to);

                }
                return undefined;
            }
            case "finishes": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-interval":
                        return compare[1].includeTo ? compare[0].value == compare[1].to : false;
                    case "interval-interval":
                        return (compare[0].includeTo === compare[1].includeTo && compare[0].to === compare[1].to);
                }
                return undefined;
            }
            case "finished by": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-point":
                        return compare[0].includeTo ? compare[0].to == compare[1].value : false;
                    case "interval-interval":
                        return (compare[0].includeTo === compare[1].includeTo && compare[0].to === compare[1].to);
                }
                return undefined;
            }
            case "includes": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-point":
                        return ((compare[0].includeTo ? compare[0].to >= compare[1].value : compare[0].to >= compare[1].value) && 
                                (compare[0].includeFrom ? compare[0].from <= compare[1].value : compare[0].from < compare[1].value));
                    case "interval-interval":
                        return ((compare[0].includeTo === compare[1].includeTo ? compare[0].to >= compare[1].to : compare[0].to > compare[1].to) && 
                                (compare[0].includeFrom === compare[1].includeFrom ? compare[0].from <= compare[1].from : compare[0].from < compare[1].from));
                }
                return undefined;
            }
            case "during": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-interval":
                        return ((compare[1].includeTo ? compare[1].to >= compare[0].value : compare[1].to >= compare[0].value) && 
                                (compare[1].includeFrom ? compare[1].from <= compare[0].value : compare[1].from < compare[0].value));
                    case "interval-interval":
                        return ((compare[0].includeTo === compare[1].includeTo ? compare[1].to >= compare[0].to : compare[1].to > compare[0].to) && 
                                (compare[0].includeFrom === compare[1].includeFrom ? compare[1].from <= compare[0].from : compare[1].from < compare[0].from));
                }
                return undefined;
            }
            case "starts": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-interval":
                        return compare[1].includeFrom ? compare[0].value == compare[1].from : false;
                    case "interval-interval":
                        return (compare[0].includeFrom === compare[1].includeFrom && compare[0].from === compare[1].from);
                }
                return undefined;
            }
            case "started by": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-point":
                        return compare[0].includeFrom ? compare[0].from == compare[1].value : false;
                    case "interval-interval":
                        return (compare[0].includeFrom === compare[1].includeFrom && compare[0].from === compare[1].from);
                }
                return undefined;
            }
            case "coincides": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "point-point":
                        return compare[0].value === compare[1].value;
                    case "interval-interval":
                        return ((compare[0].includeFrom === compare[1].includeFrom && compare[0].from === compare[1].from) &&
                                (compare[0].includeTo === compare[1].includeTo && compare[0].to === compare[1].to));
                }
                return undefined;
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
                    if (result.result)  !final[key] ? final[key] = result.output[key] : final[key] += result.output[key];
                });
                return final;
            }
            /* Collect < (min): the result of the decision table is the smallest value of all the outputs */
            case "C<": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                results.forEach((result) => {
                    if (result.result && (!final[key] || result.output[key] < final[key])) final[key] = result.output[key];
                });
                return final;
            }
            /* Collect > (max): the result of the decision table is the largest value of all the outputs */
            case "C>": {
                final = {};
                if (parameters["outputs"].length !== 1) return undefined;
                const key = this._build(parameters["outputs"][0],context);;
                results.forEach((result) => {
                    if (result.result && (!final[key] || result.output[key] > final[key])) final[key] = result.output[key];
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
 