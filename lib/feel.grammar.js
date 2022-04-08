// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

    const moo = require("moo");

    const lexer = moo.compile({
        // string      : /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)/
        string      : /["][^"]*["]/,
        whitespace  : /[ \t]+|\u00A0|\uFEFF/,
        types       : /day-time-duration|year-month-duration/,
        instance    : /instance|of/,
        keywords    : /for|return|if|true|false|in|and|or|between|some|every/,
        word        : /[A-Za-z]+/,
        number      : /[0-9]+/,
        comparator  : /!=|==|<=|>=|<{1}|>{1}|={1}/,
        operator    : /-|\+|\.\.|\/|\*{1,2}/,
        punctuator  : /@|[.,:;[\](){}]/
    });

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
        if (Array.isArray(data)) return data.reduce((prev,curr) => prev.concat(curr[i]), [] ); 
        return [];
    }

    function isKeyword(data) {
        if (["for","if","some","every","satisfies","true","false","in","and","or","instance","of","null","not","number","string","boolean","date","time","day-time-duration","year-month-duration"].indexOf(concat([data])) >= 0) return true;
        return false;
    }

    function isDateTimeFunction(data) {
        if (["date","time","duration"].indexOf(concat([data])) >= 0) return true;
        return false;
    }

    function allowedPath(data) {
        return ["sum","product","exponentation","negation"].indexOf(data && data.type ? data.type : "") >= 0 ? false : true;
    }

    function allowedTerm(data) {
        return ["logical","quantified"].indexOf(data && data.type ? data.type : "") >= 0 ? false : true;
    }

    function allowedNegationTerm(data) {
        return ["sum","product"].indexOf(data && data.type ? data.type : "") >= 0 ? false : true;
    }
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main", "symbols": ["UnaryTests"], "postprocess": (data) => { return { type: "unarytests", test: reduce([data]) }; }},
    {"name": "main", "symbols": ["Expression"], "postprocess": (data) => reduce([data])},
    {"name": "Expression", "symbols": ["BoxedExpression"]},
    {"name": "Expression", "symbols": ["TextualExpression"], "postprocess": (data) => reduce([data])},
    {"name": "TextualExpression", "symbols": ["ForExpression"]},
    {"name": "TextualExpression", "symbols": ["IfExpression"]},
    {"name": "TextualExpression", "symbols": ["QuantifiedExpression"]},
    {"name": "TextualExpression", "symbols": ["LogicalExpression"]},
    {"name": "TextualExpression", "symbols": ["Comparison"]},
    {"name": "TextualExpression", "symbols": ["ArithmeticExpression"]},
    {"name": "ArithmeticExpression", "symbols": ["Sum"]},
    {"name": "NonArithmeticExpression", "symbols": ["InstanceOf"]},
    {"name": "NonArithmeticExpression", "symbols": ["PathExpression"]},
    {"name": "NonArithmeticExpression", "symbols": ["FilterExpression"]},
    {"name": "NonArithmeticExpression", "symbols": ["ArithmeticNegation"]},
    {"name": "NonArithmeticExpression", "symbols": ["SimplePositiveUnaryTest"]},
    {"name": "NonArithmeticExpression", "symbols": [{"literal":"("}, "_", "Expression", "_", {"literal":")"}], "postprocess": (data) => { return { type:"eval", expression: data[2] }; }},
    {"name": "SimplePositiveUnaryTest$subexpression$1", "symbols": [{"literal":"<"}]},
    {"name": "SimplePositiveUnaryTest$subexpression$1", "symbols": [{"literal":"<="}]},
    {"name": "SimplePositiveUnaryTest$subexpression$1", "symbols": [{"literal":">"}]},
    {"name": "SimplePositiveUnaryTest$subexpression$1", "symbols": [{"literal":">="}]},
    {"name": "SimplePositiveUnaryTest", "symbols": ["SimplePositiveUnaryTest$subexpression$1", "__", "Endpoint"], "postprocess": (data) => { return { type: "unary", operator: reduce(data[0]).value, value: reduce(data[2]) }; }},
    {"name": "SimplePositiveUnaryTest", "symbols": ["Interval"]},
    {"name": "Interval$subexpression$1", "symbols": [{"literal":"("}]},
    {"name": "Interval$subexpression$1", "symbols": [{"literal":"]"}]},
    {"name": "Interval$subexpression$1", "symbols": [{"literal":"["}]},
    {"name": "Interval$subexpression$2", "symbols": [{"literal":")"}]},
    {"name": "Interval$subexpression$2", "symbols": [{"literal":"["}]},
    {"name": "Interval$subexpression$2", "symbols": [{"literal":"]"}]},
    {"name": "Interval", "symbols": ["Interval$subexpression$1", "_", "Endpoint", "_", {"literal":".."}, "_", "Endpoint", "_", "Interval$subexpression$2"], "postprocess": (data) => { return { type: "interval", open: reduce(data[0]).value, from: reduce(data[2]), to: reduce(data[6]), close: reduce(data[8]).value } }},
    {"name": "Interval", "symbols": ["FunctionInvocation"]},
    {"name": "Interval", "symbols": ["Literal"]},
    {"name": "PositiveUnarytest", "symbols": ["Expression"]},
    {"name": "PositiveUnarytests$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "PositiveUnarytest"]},
    {"name": "PositiveUnarytests$ebnf$1", "symbols": ["PositiveUnarytests$ebnf$1$subexpression$1"]},
    {"name": "PositiveUnarytests$ebnf$1$subexpression$2", "symbols": [{"literal":","}, "_", "PositiveUnarytest"]},
    {"name": "PositiveUnarytests$ebnf$1", "symbols": ["PositiveUnarytests$ebnf$1", "PositiveUnarytests$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PositiveUnarytests", "symbols": ["PositiveUnarytest", "_", "PositiveUnarytests$ebnf$1"], "postprocess": (data) => { return { type:"list", entries: [].concat(data[0]).concat(extractObj(data[2],2)) };}},
    {"name": "UnaryTests", "symbols": ["PositiveUnarytests"]},
    {"name": "UnaryTests", "symbols": [{"literal":"not"}, "_", {"literal":"("}, "_", "PositiveUnarytests", "_", {"literal":")"}], "postprocess": (data) => { return { type: "not", test: reduce(data[4]) }; }},
    {"name": "UnaryTests", "symbols": ["_", {"literal":"-"}, "_"], "postprocess": (data) => { return { type: "dash" }; }},
    {"name": "Endpoint", "symbols": ["SimpleValue"]},
    {"name": "SimpleValue", "symbols": ["QualifiedName"]},
    {"name": "SimpleValue", "symbols": ["SimpleLiteral"]},
    {"name": "ArithmeticNegation", "symbols": [{"literal":"-"}, "_", "Expression"], "postprocess": (data, location, reject) => { if (!allowedNegationTerm(reduce(data[2]))) return reject; return { type: "negation", expression: data[2] };}},
    {"name": "Sum$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "Sum$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "Sum", "symbols": ["Sum", "_", "Sum$subexpression$1", "_", "Product"], "postprocess": (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return { type: "sum", left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }; }},
    {"name": "Sum", "symbols": ["Product"]},
    {"name": "Product$subexpression$1", "symbols": [{"literal":"*"}]},
    {"name": "Product$subexpression$1", "symbols": [{"literal":"/"}]},
    {"name": "Product", "symbols": ["Product", "_", "Product$subexpression$1", "_", "Exponentation"], "postprocess": (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return { type: "product", left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }; }},
    {"name": "Product", "symbols": ["Exponentation"]},
    {"name": "Exponentation$subexpression$1", "symbols": [{"literal":"**"}]},
    {"name": "Exponentation", "symbols": ["NonArithmeticExpression", "_", "Exponentation$subexpression$1", "_", "Exponentation"], "postprocess": (data, location, reject) => { return { type: "exponentation", left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }; }},
    {"name": "Exponentation", "symbols": ["NonArithmeticExpression"]},
    {"name": "QualifiedName", "symbols": ["Name", "_", {"literal":"."}, "_", "Name"], "postprocess": (data) => { return { type: "path", object:data[0], property:data[4]}; }},
    {"name": "QualifiedName", "symbols": ["Name"]},
    {"name": "Name$ebnf$1", "symbols": []},
    {"name": "Name$ebnf$1$subexpression$1", "symbols": ["__", "NamePart"]},
    {"name": "Name$ebnf$1", "symbols": ["Name$ebnf$1", "Name$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Name", "symbols": ["NameStart", "Name$ebnf$1"], "postprocess": (data, location, reject) => { if (isKeyword(concat([data[0]]))) return reject; return { type: "name", value: concat([data]) }; }},
    {"name": "NameStart$ebnf$1", "symbols": []},
    {"name": "NameStart$ebnf$1$subexpression$1", "symbols": ["NamePartChar"]},
    {"name": "NameStart$ebnf$1", "symbols": ["NameStart$ebnf$1", "NameStart$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NameStart", "symbols": ["NameStartChar", "NameStart$ebnf$1"], "postprocess": (data, location, reject) => { if(data[0] && data[0][0] && data[0][0].type === "string") return reject; return concat([data]); }},
    {"name": "NamePart$ebnf$1", "symbols": []},
    {"name": "NamePart$ebnf$1$subexpression$1", "symbols": ["NamePartChar"]},
    {"name": "NamePart$ebnf$1", "symbols": ["NamePart$ebnf$1", "NamePart$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NamePart", "symbols": ["NameStartChar", "NamePart$ebnf$1"], "postprocess": (data, location, reject) => { if (isKeyword(concat([data]))) return reject; return concat([data]); }},
    {"name": "NameStartChar", "symbols": [/[A-Z]/]},
    {"name": "NameStartChar", "symbols": [/[a-z]/]},
    {"name": "NamePartChar", "symbols": ["NameStartChar"]},
    {"name": "NamePartChar", "symbols": [(lexer.has("number") ? {type: "number"} : number)]},
    {"name": "Literal", "symbols": ["SimpleLiteral"]},
    {"name": "Literal", "symbols": [{"literal":"null"}], "postprocess": (data) => { return { type: "null" }; }},
    {"name": "SimpleLiteral", "symbols": ["NumericLiteral"]},
    {"name": "SimpleLiteral", "symbols": ["BooleanLiteral"]},
    {"name": "SimpleLiteral", "symbols": ["StringLiteral"]},
    {"name": "SimpleLiteral", "symbols": ["DateTimeLiteral"]},
    {"name": "StringLiteral", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": (data) => { return { type:"string", value: concat(data) }; }},
    {"name": "BooleanLiteral$subexpression$1", "symbols": [{"literal":"true"}]},
    {"name": "BooleanLiteral$subexpression$1", "symbols": [{"literal":"false"}]},
    {"name": "BooleanLiteral", "symbols": ["BooleanLiteral$subexpression$1"], "postprocess": (data) => { return { type:"boolean", value: concat([data]) === "true" ? true : false };}},
    {"name": "NumericLiteral$ebnf$1$subexpression$1", "symbols": [{"literal":"."}, "Digits"]},
    {"name": "NumericLiteral$ebnf$1", "symbols": ["NumericLiteral$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "NumericLiteral$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NumericLiteral", "symbols": ["Digits", "NumericLiteral$ebnf$1"], "postprocess": (data) => { return { type:"number", integer: parseInt(data[0]), decimals: parseInt(data[1] ? data[1][1] : null)  }; }},
    {"name": "NumericLiteral", "symbols": [{"literal":"."}, "Digits"], "postprocess": (data) => { return { type:"number", decimals: parseInt(concat(data[1]))  }; }},
    {"name": "Digits", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": (data) => { return concat([data]); }},
    {"name": "FunctionInvocation", "symbols": ["Name", "_", "Parameters"], "postprocess": (data, location, reject) => { if(isKeyword(concat([data[0]]))) return reject;  return { type: "call", name: reduce(data[0]), parameters: reduce(data[2]) };}},
    {"name": "Parameters$subexpression$1", "symbols": ["NamedParameterList"]},
    {"name": "Parameters$subexpression$1", "symbols": ["PositionalParameterList"]},
    {"name": "Parameters", "symbols": [{"literal":"("}, "_", "Parameters$subexpression$1", "_", {"literal":")"}], "postprocess": (data) => reduce(data[2])},
    {"name": "NamedParameterList$ebnf$1", "symbols": []},
    {"name": "NamedParameterList$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "NamedParameter"]},
    {"name": "NamedParameterList$ebnf$1", "symbols": ["NamedParameterList$ebnf$1", "NamedParameterList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NamedParameterList", "symbols": ["NamedParameter", "_", "NamedParameterList$ebnf$1"], "postprocess": (data) => { return { type:"list", entries: [].concat(data[0]).concat(extract(data[2],2)) };}},
    {"name": "NamedParameter", "symbols": ["Name", "_", {"literal":":"}, "_", "Expression"], "postprocess": (data) => { return { type:"named", name: concat(data[0]), expression: reduce(data[4]) };}},
    {"name": "PositionalParameterList$ebnf$1", "symbols": []},
    {"name": "PositionalParameterList$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "Expression"]},
    {"name": "PositionalParameterList$ebnf$1", "symbols": ["PositionalParameterList$ebnf$1", "PositionalParameterList$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PositionalParameterList", "symbols": ["Expression", "_", "PositionalParameterList$ebnf$1"], "postprocess": (data) => { return { type:"list", entries: [].concat(data[0]).concat(extract(data[2],2)) };}},
    {"name": "PathExpression", "symbols": ["Expression", {"literal":"."}, "Name"], "postprocess": (data, location, reject) => { return allowedPath(data[0]) ? { type: "path", object:data[0], property:data[2]} : reject ;}},
    {"name": "PathExpression", "symbols": ["Name"]},
    {"name": "ForExpression", "symbols": [{"literal":"for"}, "__", "Name", "__", {"literal":"in"}, "__", "Expression", "__", {"literal":"return"}, "__", "Expression"], "postprocess": (data) => { return { type: "for", var: data[2], context: data[6], return: data[10]}; }},
    {"name": "IfExpression", "symbols": [{"literal":"if"}, "__", "Expression", "__", {"literal":"then"}, "__", "Expression", "__", {"literal":"else"}, "__", "Expression"], "postprocess": (data) => { return { type: "if", condition: data[2], then: data[6], else: data[10]}; }},
    {"name": "QuantifiedExpression$subexpression$1", "symbols": [{"literal":"some"}]},
    {"name": "QuantifiedExpression$subexpression$1", "symbols": [{"literal":"every"}]},
    {"name": "QuantifiedExpression", "symbols": ["QuantifiedExpression$subexpression$1", "__", "Name", "__", {"literal":"in"}, "__", "Expression", "__", {"literal":"satisfies"}, "__", "Expression"], "postprocess": (data) => { return { type:"quantified", operator: reduce(data[0]).value, variable: data[2], context: data[6], satisfy: data[10]}; }},
    {"name": "LogicalExpression$subexpression$1", "symbols": [{"literal":"and"}]},
    {"name": "LogicalExpression$subexpression$1", "symbols": [{"literal":"or"}]},
    {"name": "LogicalExpression", "symbols": ["Expression", "__", "LogicalExpression$subexpression$1", "__", "Expression"], "postprocess": (data) => { return { type: "logical", left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4])}; }},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"="}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"!="}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"<"}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"<="}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":">"}]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":">="}]},
    {"name": "Comparison", "symbols": ["Expression", "__", "Comparison$subexpression$1", "__", "Expression"], "postprocess": (data) => { return { type: "comparison", operator: reduce(data[2]).value, left: reduce(data[0]), right: reduce(data[4])};}},
    {"name": "Comparison", "symbols": ["Expression", "__", {"literal":"between"}, "__", "Expression", "__", {"literal":"and"}, "__", "Expression"], "postprocess": (data) => { return { type: "between", expression: reduce(data[0]), left: reduce(data[4]), right: reduce(data[8])};}},
    {"name": "Comparison", "symbols": ["Expression", "__", {"literal":"in"}, "__", "PositiveUnarytest"], "postprocess": (data) => { return { type: "comparison", operator: reduce(data[2]).value, left: reduce(data[0]), right: reduce(data[4])};}},
    {"name": "Comparison", "symbols": ["Expression", "__", {"literal":"in"}, "_", {"literal":"("}, "_", "PositiveUnarytests", "_", {"literal":")"}], "postprocess": (data) => { return { type: "comparison", operator: reduce(data[2]).value, left: reduce(data[0]), right: reduce(data[6])};}},
    {"name": "FilterExpression", "symbols": ["Expression", "_", {"literal":"["}, "_", "Expression", "_", {"literal":"]"}], "postprocess": (data) => { return { type:"filter", list: reduce(data[0]), filter: reduce(data[4])};}},
    {"name": "InstanceOf", "symbols": ["Expression", "_", {"literal":"instance"}, "_", {"literal":"of"}, "_", "Type"], "postprocess": (data) => { return { type: "instanceOf", instance: reduce(data[0]), of: reduce(data[6])}; }},
    {"name": "Type", "symbols": ["QualifiedName"]},
    {"name": "Type", "symbols": [{"literal":"list"}, "_", {"literal":"<"}, "_", "Type", "_", {"literal":">"}], "postprocess": (data) => { return { type: "listOf", single: reduce(data[4]) }; }},
    {"name": "Type$ebnf$1", "symbols": []},
    {"name": "Type$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "Name", "_", {"literal":":"}, "_", "Type"]},
    {"name": "Type$ebnf$1", "symbols": ["Type$ebnf$1", "Type$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Type", "symbols": [{"literal":"context"}, "_", {"literal":"<"}, "_", "Name", "_", {"literal":":"}, "_", "Type", "_", "Type$ebnf$1"]},
    {"name": "Type$ebnf$2$subexpression$1$ebnf$1", "symbols": []},
    {"name": "Type$ebnf$2$subexpression$1$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "Type"]},
    {"name": "Type$ebnf$2$subexpression$1$ebnf$1", "symbols": ["Type$ebnf$2$subexpression$1$ebnf$1", "Type$ebnf$2$subexpression$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Type$ebnf$2$subexpression$1", "symbols": ["Type", "_", "Type$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "Type$ebnf$2", "symbols": ["Type$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "Type$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Type", "symbols": [{"literal":"function"}, "_", {"literal":"<"}, "_", "Type$ebnf$2", "_", {"literal":">"}, "_", {"literal":"->"}, "_", "Type"]},
    {"name": "Type", "symbols": ["BasicType"], "postprocess": (data) => reduce(data)},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"boolean"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"number"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"string"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"date"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"time"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"day-time-duration"}]},
    {"name": "BasicType$subexpression$1", "symbols": [{"literal":"year-month-duration"}]},
    {"name": "BasicType", "symbols": ["BasicType$subexpression$1"], "postprocess": (data) => reduce(data).value},
    {"name": "BasicType", "symbols": [{"literal":"date"}, "__", {"literal":"time"}], "postprocess": (data) => concat(data)},
    {"name": "BoxedExpression", "symbols": ["List"]},
    {"name": "BoxedExpression", "symbols": ["Context"]},
    {"name": "List$ebnf$1", "symbols": []},
    {"name": "List$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "Expression"]},
    {"name": "List$ebnf$1", "symbols": ["List$ebnf$1", "List$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "List", "symbols": [{"literal":"["}, "_", "Expression", "_", "List$ebnf$1", "_", {"literal":"]"}], "postprocess": (data) => { return { type:"list", entries: [].concat(data[2]).concat(extract(data[4],2)) };}},
    {"name": "Context$ebnf$1$subexpression$1", "symbols": ["ContextEntries"]},
    {"name": "Context$ebnf$1", "symbols": ["Context$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "Context$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "Context", "symbols": [{"literal":"{"}, "_", "Context$ebnf$1", "_", {"literal":"}"}], "postprocess": (data) => { return { type: "context", data: reduce(data[2]) }; }},
    {"name": "ContextEntries$ebnf$1", "symbols": []},
    {"name": "ContextEntries$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "ContextEntry"]},
    {"name": "ContextEntries$ebnf$1", "symbols": ["ContextEntries$ebnf$1", "ContextEntries$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ContextEntries", "symbols": ["ContextEntry", "_", "ContextEntries$ebnf$1"], "postprocess": (data) => { return { type:"list", entries: [].concat(data[0]).concat(extract(data[2],2)) };}},
    {"name": "ContextEntry", "symbols": ["Key", "_", {"literal":":"}, "_", "Expression"], "postprocess": (data) => { return { type:"entry", key: reduce(data[0]), expression: reduce(data[4]) };}},
    {"name": "Key", "symbols": ["Name"]},
    {"name": "Key", "symbols": ["StringLiteral"]},
    {"name": "DateTimeLiteral", "symbols": ["AtLiteral"]},
    {"name": "DateTimeLiteral", "symbols": ["DateTimeFunction"]},
    {"name": "DateTimeFunction", "symbols": ["Name", "_", "Parameters"], "postprocess": (data, location, reject) => { if(!isDateTimeFunction(concat([data[0]]))) return reject;  return { type: "dateandtime", name: reduce(data[0]), parameters: reduce(data[2]) };}},
    {"name": "WhiteSpace", "symbols": [(lexer.has("whitespace") ? {type: "whitespace"} : whitespace)]},
    {"name": "WhiteSpace", "symbols": ["VerticalSpace"]},
    {"name": "VerticalSpace", "symbols": [/[\u000A]/]},
    {"name": "VerticalSpace", "symbols": [/[\u000D]/]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "WhiteSpace"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": null},
    {"name": "__$ebnf$1", "symbols": ["WhiteSpace"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "WhiteSpace"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": null},
    {"name": "AtLiteral", "symbols": [{"literal":"@"}, "StringLiteral"]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
