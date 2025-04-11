// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

    /**
    * @license MIT, imicros.de (c) 2022 Andreas Leinen
    *
    */
    "use strict";

    const moo = require("moo");

    const Node = require("./ast.js");

    const lexer = moo.compile({
        singlelinecomment   : { match: /\/\/.*/ },
        multilinecomment   : { match: /\/\*[.\s\S]+?\*+\//, lineBreaks: true },
        string      : { match: /"(?:\\"|[^"])*?"/, value: s => s.slice(1, -1) },
        dayandtime  : /date[ ]+and[ ]+time/,
        fn          : /put[ ]+all|string[ ]+length|string[ ]+join|week[ ]+of[ ]+year|month[ ]+of[ ]+year|day[ ]+of[ ]+year|month[ ]+of[ ]+year|day[ ]+of[ ]+week|years[ ]+and[ ]+months[ ]+duration/,            
        types       : /day-time-duration|year-month-duration/,
        instance    : /instance[ ]+of/,
        whitespace  : { match: /[ \t\n\r\u00A0\uFEFF\u000D\u000A]+/, lineBreaks: true },
        word        : { match: /[\?_'A-Za-z\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc\u00df]+/, type: moo.keywords({
            keywords    : ['for','return','if','true','false','in','and','or','between','some','every','then','else'],
            not         : ['not'],
            types       : ['string','number','boolean'],
            null        : ['null'],
            dayandtime  : ['date','time','duration'],
            fn          : ['even','abs','length','all','any']
        }) },
        number      : /[0-9]+/,
        comparator  : /!=|==|<=|>=|<{1}|>{1}|={1}/,
        operator    : /-|\+|\.\.|\/|\*{1,2}/,
        punctuator  : /@|[.,:;[\](){}]/
    });

    // store context keys to check names with special characters
    var keys = [];
    var locations = [];

    function addToContext(key) {
        if (key?.value && keys.indexOf(key.value) < 0) keys.push(key.value);
    } 

    function concat(e) {
        if (Array.isArray(e)) return e.reduce((prev,curr) => prev.concat(concat(curr)), [] ).join(''); 
        return e;
    }

    function reduce(data) {
        if (Array.isArray(data) && data.length === 1) return reduce(data[0]); 
        return data
    }

    function extract(data, i) {
        if (Array.isArray(data)) return data.reduce((prev,curr) => prev.concat(concat(curr[i])), [] ); 
        return [];
    }

    function extractObj(data, i) {
        if (Array.isArray(data)) return data.reduce((prev,curr) => prev.concat(reduce(curr[i])), [] ); 
        return [];
    }

    /*
    function checkSpecialName(data, location) {
        // console.log("check",data, keys, keys.indexOf(data));
        if (keys.indexOf(data) >= 0) locations.push(location);
        if (keys.indexOf(data) >= 0) return true;
        return false;
    }
    */

    function checkLocation(location,data) {
        /*
        console.log("check", location,locations,reduce([data]));
        return false;
        if (locations.indexOf(location) >= 0) {
            if (data?.node == Node.NAME && keys.indexOf(data?.value) >= 0) return false;
            return true;
        }
        return false;
        return locations.indexOf(location) >= 0 ? true : false;
        function check(obj, reject) {
            Object.keys(obj).forEach(function(key,index) {
                if (typeof obj[key] == 'object' && obj[key] instanceof Node) {
                    if (obj[key].node == Node.NAME && obj[key].location == location && keys.indexOf(obj[key].value) < 0) reject = true;
                    check(obj[key]);
                }
            });
            return reject;
        };
        // return locations.indexOf(location) >= 0 ? true : false;
        // console.log(location,locations,reduce([data]),locations.indexOf(location));
        if (locations.indexOf(location) >= 0 && typeof data == 'object') {
            const result = check(data, false);
            // console.log("checked", location,locations,reduce([data]),result);
            return result;
            // console.log("reject", location,locations,reduce([data]),locations.indexOf(location));
            // return false; 
        }
        // console.log("accept", location,locations,reduce([data]),locations.indexOf(location));
        */
        return false;
    }

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["UnaryTests"], "postprocess": (data) => reduce([data[0]])},
    {"name": "main", "symbols": ["_", "Expression", "_"], "postprocess": (data) => reduce([data[1]])},
    {"name": "Expression", "symbols": ["BoxedExpression"]},
    {"name": "Expression", "symbols": ["TextualExpression"], "postprocess": (data) => reduce([data])},
    {"name": "TextualExpression", "symbols": ["ForExpression"]},
    {"name": "TextualExpression", "symbols": ["IfExpression"]},
    {"name": "TextualExpression", "symbols": ["QuantifiedExpression"]},
    {"name": "TextualExpression", "symbols": ["LogicalExpression"], "postprocess": (data,location,reject) => { if (checkLocation(location,data)) return reject; return data; }},
    {"name": "NonArithmeticExpression", "symbols": ["InstanceOf"]},
    {"name": "NonArithmeticExpression", "symbols": ["PathExpression"]},
    {"name": "NonArithmeticExpression", "symbols": ["FilterExpression"]},
    {"name": "NonArithmeticExpression", "symbols": ["SimplePositiveUnaryTest"]},
    {"name": "NonArithmeticExpression", "symbols": [{"literal":"("}, "_", "Expression", "_", {"literal":")"}], "postprocess": (data) => { return new Node({ node: Node.EVAL, expression: data[2] }); }},
    {"name": "SimplePositiveUnaryTest$subexpression$1", "symbols": [{"literal":"!="}]},
    {"name": "SimplePositiveUnaryTest$subexpression$1", "symbols": [{"literal":"<"}]},
    {"name": "SimplePositiveUnaryTest$subexpression$1", "symbols": [{"literal":"<="}]},
    {"name": "SimplePositiveUnaryTest$subexpression$1", "symbols": [{"literal":">"}]},
    {"name": "SimplePositiveUnaryTest$subexpression$1", "symbols": [{"literal":">="}]},
    {"name": "SimplePositiveUnaryTest", "symbols": ["SimplePositiveUnaryTest$subexpression$1", "_", "Endpoint"], "postprocess": (data) => { return new Node({ node: Node.UNARY, operator: reduce(data[0]).value, value: reduce(data[2]) }); }},
    {"name": "SimplePositiveUnaryTest", "symbols": ["Interval"]},
    {"name": "SimplePositiveUnaryTest", "symbols": [{"literal":"("}, "_", {"literal":"-"}, "_", {"literal":")"}], "postprocess": (data) => { return new Node({ node: Node.DASH }); }},
    {"name": "Interval$subexpression$1", "symbols": [{"literal":"("}]},
    {"name": "Interval$subexpression$1", "symbols": [{"literal":"]"}]},
    {"name": "Interval$subexpression$1", "symbols": [{"literal":"["}]},
    {"name": "Interval$subexpression$2", "symbols": [{"literal":")"}]},
    {"name": "Interval$subexpression$2", "symbols": [{"literal":"["}]},
    {"name": "Interval$subexpression$2", "symbols": [{"literal":"]"}]},
    {"name": "Interval", "symbols": ["Interval$subexpression$1", "_", "Endpoint", "_", {"literal":".."}, "_", "Endpoint", "_", "Interval$subexpression$2"], "postprocess": (data) => { return new Node({ node: Node.INTERVAL, open: reduce(data[0]).value, from: reduce(data[2]), to: reduce(data[6]), close: reduce(data[8]).value }) }},
    {"name": "Interval", "symbols": ["FunctionInvocation"]},
    {"name": "Interval", "symbols": ["Literal"]},
    {"name": "PositiveUnarytest", "symbols": ["Expression"]},
    {"name": "PositiveUnarytests$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "PositiveUnarytest"]},
    {"name": "PositiveUnarytests$ebnf$1", "symbols": ["PositiveUnarytests$ebnf$1$subexpression$1"]},
    {"name": "PositiveUnarytests$ebnf$1$subexpression$2", "symbols": [{"literal":","}, "_", "PositiveUnarytest"]},
    {"name": "PositiveUnarytests$ebnf$1", "symbols": ["PositiveUnarytests$ebnf$1", "PositiveUnarytests$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PositiveUnarytests", "symbols": ["PositiveUnarytest", "_", "PositiveUnarytests$ebnf$1"], "postprocess": (data) => { return new Node({ node:Node.LIST, entries: [].concat(data[0]).concat(extractObj(data[2],2)) }) ;}},
    {"name": "UnaryTests", "symbols": ["PositiveUnarytests"], "postprocess": (data) => { return new Node({ node: Node.UNARYTESTS, list: reduce([data]) }); }},
    {"name": "UnaryTests", "symbols": ["Expression", "_", {"literal":"in"}, "_", "List"], "postprocess": (data) => { return new Node({ node:Node.IN_LIST, input: reduce(data[0]), list: reduce(data[4]) });}},
    {"name": "UnaryTests", "symbols": ["UnaryNot"]},
    {"name": "UnaryTests", "symbols": ["UnaryDash"]},
    {"name": "UnaryNot", "symbols": [(lexer.has("not") ? {type: "not"} : not), "_", {"literal":"("}, "_", "PositiveUnarytests", "_", {"literal":")"}], "postprocess": (data) => { return new Node({ node: Node.UNARY_NOT, test: reduce(data[4]) }); }},
    {"name": "UnaryDash", "symbols": ["_", {"literal":"-"}, "_"], "postprocess": (data) => { return new Node({ node: Node.DASH }); }},
    {"name": "Endpoint", "symbols": ["SimpleValue"]},
    {"name": "SimpleValue", "symbols": ["QualifiedName"]},
    {"name": "SimpleValue", "symbols": ["SimpleLiteral"]},
    {"name": "ArithmeticNegation", "symbols": [{"literal":"-"}, "_", "NonArithmeticExpression"], "postprocess": (data) => { return new Node({ node: Node.NEGATION, expression: reduce(data[2]) });}},
    {"name": "ArithmeticNegation", "symbols": ["NonArithmeticExpression"]},
    {"name": "Sum$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "Sum$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "Sum", "symbols": ["Sum", "_", "Sum$subexpression$1", "_", "Product"], "postprocess": (data) => { return new Node({ node: Node.SUM, left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }); }},
    {"name": "Sum", "symbols": ["Product"]},
    {"name": "Product$subexpression$1", "symbols": [{"literal":"*"}]},
    {"name": "Product$subexpression$1", "symbols": [{"literal":"/"}]},
    {"name": "Product", "symbols": ["Product", "_", "Product$subexpression$1", "_", "Exponentation"], "postprocess": (data) => { return new Node({ node: Node.PRODUCT, left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }); }},
    {"name": "Product", "symbols": ["Exponentation"]},
    {"name": "Exponentation$subexpression$1", "symbols": [{"literal":"**"}]},
    {"name": "Exponentation", "symbols": ["Exponentation", "_", "Exponentation$subexpression$1", "_", "ArithmeticNegation"], "postprocess": (data, location, reject) => { return new Node({ node: Node.EXPONENTATION, left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }); }},
    {"name": "Exponentation", "symbols": ["ArithmeticNegation"]},
    {"name": "QualifiedName", "symbols": ["Name", "_", {"literal":"."}, "_", "Name"], "postprocess": (data) => { return new Node({ node: Node.PATH, object:data[0], property:data[4]}); }},
    {"name": "QualifiedName", "symbols": ["Name"]},
    {"name": "Name", "symbols": ["PotentialName"], "postprocess": (data, location, reject) => {  return new Node({ node: Node.NAME, value: concat([data]) }); }},
    {"name": "ParameterName", "symbols": ["PotentialParameterName"], "postprocess": (data, location, reject) => {  return new Node({ node: Node.NAME, value: concat([data]) }); }},
    {"name": "PotentialParameterName$ebnf$1", "symbols": []},
    {"name": "PotentialParameterName$ebnf$1$subexpression$1", "symbols": ["__", "NamePart"]},
    {"name": "PotentialParameterName$ebnf$1", "symbols": ["PotentialParameterName$ebnf$1", "PotentialParameterName$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PotentialParameterName", "symbols": ["NamePart", "PotentialParameterName$ebnf$1"], "postprocess": (data) => { return concat([data]); }},
    {"name": "PotentialName$ebnf$1", "symbols": []},
    {"name": "PotentialName$ebnf$1$subexpression$1", "symbols": ["__", "NamePart"]},
    {"name": "PotentialName$ebnf$1", "symbols": ["PotentialName$ebnf$1", "PotentialName$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PotentialName", "symbols": ["NameStart", "PotentialName$ebnf$1"], "postprocess": (data) => { return concat([data]); }},
    {"name": "NameStart$ebnf$1", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": id},
    {"name": "NameStart$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NameStart", "symbols": [(lexer.has("word") ? {type: "word"} : word), "NameStart$ebnf$1"], "postprocess": (data) => { return concat(data)}},
    {"name": "NamePart$ebnf$1", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": id},
    {"name": "NamePart$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NamePart", "symbols": [(lexer.has("word") ? {type: "word"} : word), "NamePart$ebnf$1"], "postprocess": (data) => { return concat(data)}},
    {"name": "NamePart", "symbols": [(lexer.has("types") ? {type: "types"} : types)], "postprocess": (data) => { return concat(data)}},
    {"name": "Literal", "symbols": ["SimpleLiteral"]},
    {"name": "Literal", "symbols": [(lexer.has("null") ? {type: "null"} : null)], "postprocess": (data) => { return new Node({ node: Node.NULL }); }},
    {"name": "SimpleLiteral", "symbols": ["NumericLiteral"]},
    {"name": "SimpleLiteral", "symbols": ["BooleanLiteral"]},
    {"name": "SimpleLiteral", "symbols": ["StringLiteral"]},
    {"name": "SimpleLiteral", "symbols": ["DateTimeLiteral"]},
    {"name": "StringLiteral", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": (data) => { return new Node({ node: Node.STRING, value: String.raw`${ data }` }); }},
    {"name": "BooleanLiteral$subexpression$1", "symbols": [{"literal":"true"}]},
    {"name": "BooleanLiteral$subexpression$1", "symbols": [{"literal":"false"}]},
    {"name": "BooleanLiteral", "symbols": ["BooleanLiteral$subexpression$1"], "postprocess": (data) => { return new Node({ node: Node.BOOLEAN, value: concat([data]) === "true" ? true : false });}},
    {"name": "NumericLiteral$ebnf$1$subexpression$1", "symbols": [{"literal":"."}, "Digits"]},
    {"name": "NumericLiteral$ebnf$1", "symbols": ["NumericLiteral$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "NumericLiteral$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NumericLiteral", "symbols": ["Digits", "NumericLiteral$ebnf$1"], "postprocess": (data) => { return new Node({ node:Node.NUMBER, integer: parseInt(data[0]), decimals: parseInt(data[1] ? data[1][1] : null), float: parseFloat(concat([data]))  }); }},
    {"name": "NumericLiteral", "symbols": [{"literal":"."}, "Digits"], "postprocess": (data) => { return new Node({ node: Node.NUMBER, decimals: parseInt(concat(data[1])), float: parseFloat("."+concat([data[1]])) }); }},
    {"name": "Digits", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": (data) => { return concat([data]); }},
    {"name": "FunctionInvocation", "symbols": ["FunctionName", "_", "Parameters"], "postprocess": (data, location, reject) => { return new Node({ node: Node.FUNCTION_CALL, name: reduce(data[0]), parameters: reduce(data[2]) });}},
    {"name": "FunctionInvocation", "symbols": [(lexer.has("not") ? {type: "not"} : not), "_", {"literal":"("}, "_", "Expression", "_", {"literal":")"}], "postprocess": (data, location, reject) => { return new Node({ node: Node.NOT, parameters: reduce(data[4]) });}},
    {"name": "FunctionName", "symbols": [(lexer.has("fn") ? {type: "fn"} : fn)], "postprocess": (data) => { return new Node({ node: Node.NAME, value: concat([data]) }); }},
    {"name": "FunctionName", "symbols": ["PotentialName"], "postprocess": (data) => { return new Node({ node: Node.NAME, value: concat([data]) }); }},
    {"name": "FunctionName", "symbols": [{"literal":"number"}], "postprocess": (data) => { return new Node({ node: Node.NAME, value: concat([data]) }); }},
    {"name": "FunctionName", "symbols": [{"literal":"string"}], "postprocess": (data) => { return new Node({ node: Node.NAME, value: concat([data]) }); }},
    {"name": "FunctionName", "symbols": [{"literal":"context"}], "postprocess": (data) => { return new Node({ node: Node.NAME, value: concat([data]) }); }},
    {"name": "Parameters$ebnf$1$subexpression$1", "symbols": ["NamedParameterList"]},
    {"name": "Parameters$ebnf$1$subexpression$1", "symbols": ["PositionalParameterList"]},
    {"name": "Parameters$ebnf$1", "symbols": ["Parameters$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "Parameters$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Parameters", "symbols": [{"literal":"("}, "_", "Parameters$ebnf$1", "_", {"literal":")"}], "postprocess": (data) => reduce(data[2])},
    {"name": "NamedParameterList$ebnf$1", "symbols": []},
    {"name": "NamedParameterList$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "NamedParameter"]},
    {"name": "NamedParameterList$ebnf$1", "symbols": ["NamedParameterList$ebnf$1", "NamedParameterList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NamedParameterList", "symbols": ["NamedParameter", "_", "NamedParameterList$ebnf$1"], "postprocess": (data) => { return new Node({ node: Node.LIST, entries: [].concat(data[0]).concat(extractObj(data[2],2)) });}},
    {"name": "NamedParameter", "symbols": ["ParameterName", "_", {"literal":":"}, "_", "Expression"], "postprocess": (data) => { return new Node({ node: Node.NAMED_PARAMETER, name: concat(data[0]), expression: reduce(data[4]) });}},
    {"name": "PositionalParameterList$ebnf$1", "symbols": []},
    {"name": "PositionalParameterList$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "Expression"]},
    {"name": "PositionalParameterList$ebnf$1", "symbols": ["PositionalParameterList$ebnf$1", "PositionalParameterList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PositionalParameterList", "symbols": ["Expression", "_", "PositionalParameterList$ebnf$1"], "postprocess": (data) => { return new Node({ node: Node.LIST, entries: [].concat(reduce(data[0])).concat(reduce(extractObj(data[2],2))) });}},
    {"name": "PathExpression", "symbols": ["NonArithmeticExpression", {"literal":"."}, "Name"], "postprocess": (data) => { return new Node({ node: Node.PATH, object:reduce(data[0]), property:data[2]});}},
    {"name": "PathExpression", "symbols": ["BoxedExpression", {"literal":"."}, "Name"], "postprocess": (data) => { return new Node({ node: Node.PATH, object:reduce(data[0]), property:data[2]});}},
    {"name": "PathExpression", "symbols": ["Name"]},
    {"name": "ForExpression", "symbols": [{"literal":"for"}, "__", "Name", "__", {"literal":"in"}, "__", "Expression", "__", {"literal":"return"}, "__", "Expression"], "postprocess": (data) => { return new Node({ node: Node.FOR, var: data[2], context: reduce(data[6]), return: reduce(data[10])}); }},
    {"name": "IfExpression", "symbols": [{"literal":"if"}, "__", "Expression", "__", {"literal":"then"}, "__", "Expression", "__", {"literal":"else"}, "__", "Expression", "_"], "postprocess": (data) => { return new Node({ node: Node.IF, condition: data[2], then: data[6], else: data[10]}); }},
    {"name": "QuantifiedExpression$subexpression$1", "symbols": [{"literal":"some"}]},
    {"name": "QuantifiedExpression$subexpression$1", "symbols": [{"literal":"every"}]},
    {"name": "QuantifiedExpression", "symbols": ["QuantifiedExpression$subexpression$1", "__", "Name", "__", {"literal":"in"}, "__", "Expression", "__", {"literal":"satisfies"}, "__", "Expression"], "postprocess": (data) => { return new Node({ node: Node.QUANTIFIED, operator: reduce(data[0]).value, variable: data[2], context: data[6], satisfy: data[10]}); }},
    {"name": "LogicalExpression$subexpression$1", "symbols": [{"literal":"and"}]},
    {"name": "LogicalExpression$subexpression$1", "symbols": [{"literal":"or"}]},
    {"name": "LogicalExpression", "symbols": ["LogicalExpression", "__", "LogicalExpression$subexpression$1", "__", "Comparison"], "postprocess": (data) => { return new Node({ node: Node.LOGICAL, left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4])}); }},
    {"name": "LogicalExpression", "symbols": ["Comparison"]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"="}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"!="}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"<"}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"<="}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":">"}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":">="}]},
    {"name": "Comparison", "symbols": ["Comparison", "_", "Comparison$subexpression$1", "_", "Sum"], "postprocess": (data) => { return new Node({ node: Node.COMPARISON, operator: reduce(data[2]).value, left: reduce(data[0]), right: reduce(data[4])});}},
    {"name": "Comparison", "symbols": ["Expression", "__", {"literal":"between"}, "__", "Expression", "__", {"literal":"and"}, "__", "Expression"], "postprocess": (data) => { return new Node({ node: Node.BETWEEN, expression: reduce(data[0]), left: reduce(data[4]), right: reduce(data[8])});}},
    {"name": "Comparison", "symbols": ["Expression", "__", {"literal":"in"}, "__", "PositiveUnarytest"], "postprocess": (data) => { return new Node({ node: Node.IN, input: reduce(data[0]), test: reduce(data[4])});}},
    {"name": "Comparison", "symbols": ["Expression", "__", {"literal":"in"}, "__", "UnaryNot"], "postprocess": (data) => { return new Node({ node: Node.IN, input: reduce(data[0]), test: reduce(data[4])});}},
    {"name": "Comparison", "symbols": ["Expression", "__", {"literal":"in"}, "__", "UnaryDash"], "postprocess": (data) => { return new Node({ node: Node.IN, input: reduce(data[0]), test: reduce(data[4])});}},
    {"name": "Comparison", "symbols": ["Expression", "__", {"literal":"in"}, "_", {"literal":"("}, "_", "PositiveUnarytests", "_", {"literal":")"}], "postprocess": (data) => { return new Node({ node: Node.IN_LIST, input: reduce(data[0]), list: reduce(data[6])});}},
    {"name": "Comparison", "symbols": ["Sum"]},
    {"name": "FilterExpression", "symbols": ["Expression", "_", {"literal":"["}, "_", "Expression", "_", {"literal":"]"}], "postprocess": (data) => { return new Node({ node: Node.FILTER, list: reduce(data[0]), filter: reduce(data[4])});}},
    {"name": "InstanceOf", "symbols": ["Expression", "_", (lexer.has("instance") ? {type: "instance"} : instance), "_", "Type"], "postprocess": (data) => { return new Node({ node: Node.INSTANCE_OF, instance: reduce(data[0]), of: reduce(data[4])}); }},
    {"name": "Type", "symbols": ["QualifiedName"]},
    {"name": "Type", "symbols": [{"literal":"list"}, "_", {"literal":"<"}, "_", "Type", "_", {"literal":">"}], "postprocess": (data) => { return new Node({ node: Node.LIST_OF, single: reduce(data[4]) }); }},
    {"name": "Type", "symbols": [{"literal":"context"}, "_", {"literal":"<"}, "_", "ContextElements", "_", {"literal":">"}], "postprocess": (data) => { return new Node({ node: Node.CONTEXT_TYPE, elements: reduce(data[4]) }); }},
    {"name": "Type$ebnf$1$subexpression$1$ebnf$1", "symbols": []},
    {"name": "Type$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "Type"]},
    {"name": "Type$ebnf$1$subexpression$1$ebnf$1", "symbols": ["Type$ebnf$1$subexpression$1$ebnf$1", "Type$ebnf$1$subexpression$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Type$ebnf$1$subexpression$1", "symbols": ["Type", "_", "Type$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "Type$ebnf$1", "symbols": ["Type$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "Type$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Type", "symbols": [{"literal":"function"}, "_", {"literal":"<"}, "_", "Type$ebnf$1", "_", {"literal":">"}, "_", {"literal":"->"}, "_", "Type"]},
    {"name": "Type", "symbols": ["BasicType"], "postprocess": (data) => reduce(data)},
    {"name": "ContextElements$ebnf$1", "symbols": []},
    {"name": "ContextElements$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "ContextElement"]},
    {"name": "ContextElements$ebnf$1", "symbols": ["ContextElements$ebnf$1", "ContextElements$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ContextElements", "symbols": ["ContextElement", "_", "ContextElements$ebnf$1"], "postprocess": (data) => { return new Node({ node: Node.LIST, entries: [].concat(data[0]).concat(extract(data[2],2)) });}},
    {"name": "ContextElement", "symbols": ["Name", "_", {"literal":":"}, "_", "Type"], "postprocess": (data) => { return new Node({ node: Node.CONTEXT_ELEMENT, name: concat(data[0]), type: reduce(data[4]) });}},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"boolean"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"number"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"string"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"date"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"time"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"date and time"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"day-time-duration"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"year-month-duration"}]},
    {"name": "BasicType", "symbols": ["BasicType$subexpression$1"], "postprocess": (data) => reduce(data).value},
    {"name": "BasicType", "symbols": [{"literal":"date"}, "__", {"literal":"time"}], "postprocess": (data) => concat(data)},
    {"name": "BoxedExpression", "symbols": ["List"]},
    {"name": "BoxedExpression", "symbols": ["FunctionDefintion"], "postprocess": (data) => { return reduce(data);}},
    {"name": "BoxedExpression", "symbols": ["Context", "__", "Expression"], "postprocess": (data) => { return new Node({ node: Node.BOXED, context: reduce(data[0]), result: reduce(data[2]) }); }},
    {"name": "BoxedExpression", "symbols": ["Context"], "postprocess": (data) => { return reduce(data);}},
    {"name": "List", "symbols": [{"literal":"["}, "_", "ListEntries", "_", {"literal":"]"}], "postprocess": (data) => { return new Node({ node: Node.LIST, entries: data[2] }); }},
    {"name": "List", "symbols": [{"literal":"["}, "_", {"literal":"]"}], "postprocess": (data) => { return new Node({ node: Node.LIST, entries: [] }); }},
    {"name": "ListEntries$ebnf$1", "symbols": []},
    {"name": "ListEntries$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "ListEntry"]},
    {"name": "ListEntries$ebnf$1", "symbols": ["ListEntries$ebnf$1", "ListEntries$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ListEntries", "symbols": ["ListEntry", "_", "ListEntries$ebnf$1"], "postprocess": (data) => { return [].concat(data[0]).concat(extractObj(data[2],2)); }},
    {"name": "ListEntry", "symbols": ["Expression"], "postprocess": (data) => reduce(data)},
    {"name": "ListEntry", "symbols": ["UnaryDash"]},
    {"name": "ListEntry", "symbols": ["UnaryNot"]},
    {"name": "FunctionDefintion$ebnf$1", "symbols": ["FormalParameterList"], "postprocess": id},
    {"name": "FunctionDefintion$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "FunctionDefintion", "symbols": [{"literal":"function"}, "_", {"literal":"("}, "_", "FunctionDefintion$ebnf$1", "_", {"literal":")"}, "_", "Expression"], "postprocess": (data) => { return new Node({ node: Node.FUNCTION_DEFINITION, parameters: reduce(data[4]), expression: reduce(data[8]) });}},
    {"name": "FormalParameterList$ebnf$1", "symbols": []},
    {"name": "FormalParameterList$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "FormalParameter"]},
    {"name": "FormalParameterList$ebnf$1", "symbols": ["FormalParameterList$ebnf$1", "FormalParameterList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "FormalParameterList", "symbols": ["FormalParameter", "_", "FormalParameterList$ebnf$1"], "postprocess": (data) => { return new Node({ node: Node.LIST, entries: [].concat(reduce(data[0])).concat(reduce(extractObj(data[2],2))) });}},
    {"name": "FormalParameter$ebnf$1", "symbols": ["FormalParameterType"], "postprocess": id},
    {"name": "FormalParameter$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "FormalParameter", "symbols": ["Name", "_", "FormalParameter$ebnf$1"], "postprocess": (data) => { return new Node({ node: Node.FORMAL_PARAMETER, name: concat(data[0]), type: reduce(data[2]) });}},
    {"name": "FormalParameterType", "symbols": [{"literal":":"}, "_", "Type"], "postprocess": (data) => { return reduce(data[2]); }},
    {"name": "Context$ebnf$1$subexpression$1", "symbols": ["ContextEntries"]},
    {"name": "Context$ebnf$1", "symbols": ["Context$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "Context$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Context", "symbols": [{"literal":"{"}, "_", "Context$ebnf$1", "_", {"literal":"}"}], "postprocess": (data) => { return new Node({ node: Node.CONTEXT, data: reduce(data[2]) }); }},
    {"name": "ContextEntries$ebnf$1", "symbols": []},
    {"name": "ContextEntries$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "ContextEntry"]},
    {"name": "ContextEntries$ebnf$1", "symbols": ["ContextEntries$ebnf$1", "ContextEntries$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ContextEntries", "symbols": ["ContextEntry", "_", "ContextEntries$ebnf$1"], "postprocess": (data) => { return new Node({ node: Node.LIST, entries: [].concat(data[0]).concat(extractObj(data[2],2)) });}},
    {"name": "ContextEntry", "symbols": ["Key", "_", {"literal":":"}, "_", "Expression"], "postprocess": (data) => { addToContext(reduce(data[0])); return new Node({ node: Node.CONTEXT_ENTRY, key: reduce(data[0]), expression: reduce(data[4]) });}},
    {"name": "Key", "symbols": ["Name"]},
    {"name": "Key", "symbols": ["StringLiteral"]},
    {"name": "DateTimeLiteral", "symbols": ["AtLiteral"]},
    {"name": "DateTimeLiteral", "symbols": ["DateTimeFunction"]},
    {"name": "DateTimeFunction", "symbols": [(lexer.has("dayandtime") ? {type: "dayandtime"} : dayandtime), "_", "Parameters"], "postprocess": (data) => { return new Node({ node: Node.DATE_AND_TIME, name: data[0].value, parameters: reduce(data[2]) });}},
    {"name": "WhiteSpace", "symbols": [(lexer.has("whitespace") ? {type: "whitespace"} : whitespace)]},
    {"name": "WhiteSpace", "symbols": [(lexer.has("singlelinecomment") ? {type: "singlelinecomment"} : singlelinecomment)]},
    {"name": "WhiteSpace", "symbols": [(lexer.has("multilinecomment") ? {type: "multilinecomment"} : multilinecomment)]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "WhiteSpace"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => { return " "; }},
    {"name": "__$ebnf$1", "symbols": ["WhiteSpace"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "WhiteSpace"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": () => { return " "; }},
    {"name": "AtLiteral", "symbols": [{"literal":"@"}, "StringLiteral"], "postprocess": (data) => {return new Node({ node: Node.AT_LITERAL, expression: reduce(data[1]) });}}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
