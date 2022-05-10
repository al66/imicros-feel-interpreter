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

const util = require('util');

class Interpreter {
 
    parse (exp) {
        const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

        try {
            this.error = null;
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
        this.decisionContext = {};
        this.functionDefinitions = {};
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
        if (left instanceof Temporal) {
            switch (node.operator) {
                case "-": return left.subtract(right);
                case "+": return left.add(right);
            }
        }
        switch (node.operator) {
            case "-": return typeof left === 'number' && typeof right === 'number' ? ( left * 10 - right * 10 ) / 10 : left - right;
            case "+": return typeof left === 'number' && typeof right === 'number' ? ( left * 10 + right * 10 ) / 10 : left + right;
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

    __PATH (node, context) {
        let obj = this._build(node.object, context);
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
        let result = {};
        if (node.data && Array.isArray(node.data.entries)) {
            node.data.entries.forEach((entry) => {
                let element = this._build(entry);
                if (element) {
                    // normalize spaces in key
                    element.key = element.key.replace(/\s\s+/g, ' ');
                    result[element.key] = element.value;
                    // store for use in following expressions
                    this.decisionContext[element.key] = element.value;
                }
            });
        }
        return result;
    }

    __CONTEXT_ENTRY (node) {
        if (node.expression.node === Node.FUNCTION_DEFINITION) {
            const name =  node.key.node === Node.NAME ? node.key.value : this._build(node.key);
            this.functionDefinitions[name] = node.expression;
            return null;
        }
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
                    // console.log(node.filter, item, this._build(node.filter, { item, _debug:true }));
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
            case Node.STRING:
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

    __BOXED (node,context) {
        return this._build(node.result,Object.assign(context || {},this._build(node.context)  || {}));
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

            case "is defined": {
                const parameters = this.buildParameters(node.parameters,["value"],context);
                return typeof parameters.value == 'undefined' ? false : true;
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
                return (Array.isArray(parameters.list)) ? parameters.list.reduce((a,b)=>a+b) : undefined;
            }
            case "product": {
                if (node.parameters?.entries?.length > 1) return this._build(node.parameters).reduce((a,b)=>a*b);
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? parameters.list.reduce((a,b)=>a*b) : undefined;
            }
            case "mean": {
                if (node.parameters?.entries?.length > 1) return (this._build(node.parameters).reduce((a,b)=>a+b) / node.parameters.entries.length) || 0;
                const parameters = this.buildParameters(node.parameters,["list"],context);
                return (Array.isArray(parameters.list)) ? (parameters.list.reduce((a,b)=>a+b) / parameters.list.length) || 0 : undefined;
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
                return parameters.context && parameters.key ? parameters.context[parameters.key] : null;
            }
            case "get entries": {
                const parameters = this.buildParameters(node.parameters,["context"],context);
                return typeof parameters.context == 'object' ? Object.entries(parameters.context).map(([key,value]) => { return { key, value };}) : [];
            }
            case "put": {
                const parameters = this.buildParameters(node.parameters,["context", "key", "value"],context);
                if (parameters.context && parameters.key) parameters.context[parameters.key] = parameters.value;
                return parameters.context;
            }
            case "put all": {
                const args = this._build(node.parameters);
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
                const parameters = this.buildParameters(node.parameters,["number"],context);
                if (parameters.number instanceof Duration) return parameters.number.abs();
                return (typeof parameters.number == 'number' ) ? Math.abs(parameters.number) : undefined;
            }
            case "modulo": {
                const parameters = this.buildParameters(node.parameters,["dividend","divisor"],context);
                return (typeof parameters.dividend == 'number' && typeof parameters.divisor == 'number' ) ? parameters.dividend % parameters.divisor : undefined;
            }
            case "sqrt": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number == 'number') ? Math.sqrt(parameters.number) : undefined;
            }
            case "log": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number == 'number') ? Math.log(parameters.number) : undefined;
            }
            case "exp": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number == 'number') ? Math.exp(parameters.number) : undefined;
            }
            case "odd": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number == 'number' && parameters.number % 2 != 0) ? true : false;
            }
            case "even": {
                const parameters = this.buildParameters(node.parameters,["number"],context);
                return (typeof parameters.number == 'number' && parameters.number % 2 == 0) ? true : false;
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
                        return compare[0].includeTo && compare[1].includeFrom ? compare[0].to == compare[1].from : false;
                }
                return undefined;
            }
            case "met by": {
                const compare = this.getRangeParameters(node.parameters.entries,context);
                // console.log(util.inspect(compare, { showHidden: false, depth: null, colors: true }));
                switch (`${compare[0].type}-${compare[1].type}`) {
                    case "interval-interval":
                        return compare[0].includeFrom && compare[1].includeTo ? compare[0].from == compare[1].to : false;
                }
                return undefined;
            }
            // TODO overlaps
            // TODO overlaps before
            // TODO overlaps after
            // TODO finishes
            // TODO finished by
            // TODO includes
            // TODO during
            // TODO starts
            // TODO started by
            // TODO coinsides

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
        parameterList.forEach((entry, index) => {
            if (entry.node == Node.NAMED_PARAMETER) {
                // named parameters                
                let name = entry.name?.value ?? null;
                if (["inputs","outputs","rule list"].indexOf(name) >= 0) parameters[name] = entry.expression?.entries ?? [];
                if (name == "hit policy" ) parameters[name] = entry.expression ?? "Unique";
            } else {
                // positional parameters
                if (index < 3) {
                    parameters[["inputs","outputs","rule list"][index]] = entry.expression?.entries ?? [];
                } else if (index == 3){
                    parameters["hit policy"]  = entry.expression ?? "Unique";
                }
            }
        })

        let final = null;
        let results = [];
        parameters["rule list"].forEach((rule, indexRule) => {
            let result = { rule: indexRule, result: true, output: {} };
            parameters["inputs"].forEach((input, indexInput) => {
                // results.push({rule: indexRule, input, test: rule.entries[indexInput], result: this._build(new Node({ node: Node.IN, input, test: rule.entries[indexInput]})) });
                result.result = result.result && this._build(new Node({ node: Node.IN, input: new Node({ node: Node.NAME, value: this._build(input)}), test: rule.entries[indexInput]}),context)
                // console.log(indexInput, rule, rule.entries[indexInput],result.result,new Node({ node: Node.NAME, value: this._build(input)}));
            })
            parameters["outputs"].forEach((output, indexOutput) => {
                let name = this._build(output,context);
                result.output[name] = this._build(rule.entries[parameters["inputs"].length + indexOutput],context);
                if (result.result) final = result.output;
            })
            results.push(result);
        })
        // console.log(results);
        // console.log(final);
        return final;
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
 