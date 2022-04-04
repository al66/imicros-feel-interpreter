// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
        if (["for","if","some","every","satisfies","true","false","in","and","or"].indexOf(concat([data])) >= 0) return true;
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
    Lexer: undefined,
    ParserRules: [
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
    {"name": "NonArithmeticExpression", "symbols": ["PathExpression"]},
    {"name": "NonArithmeticExpression", "symbols": ["ArithmeticNegation"]},
    {"name": "NonArithmeticExpression", "symbols": ["Literal"]},
    {"name": "NonArithmeticExpression", "symbols": [{"literal":"("}, "_", "Expression", "_", {"literal":")"}], "postprocess": (data) => { return { type:"eval", expression: data[2] }; }},
    {"name": "PositiveUnarytest", "symbols": ["Expression"]},
    {"name": "PositiveUnarytests$ebnf$1", "symbols": []},
    {"name": "PositiveUnarytests$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "PositiveUnarytest"]},
    {"name": "PositiveUnarytests$ebnf$1", "symbols": ["PositiveUnarytests$ebnf$1", "PositiveUnarytests$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PositiveUnarytests", "symbols": ["PositiveUnarytest", "_", "PositiveUnarytests$ebnf$1"], "postprocess": (data) => { return { type:"list", entries: [].concat(data[0]).concat(extractObj(data[2],2)) };}},
    {"name": "ArithmeticNegation", "symbols": [{"literal":"-"}, "_", "Expression"], "postprocess": (data, location, reject) => { if (!allowedNegationTerm(reduce(data[2]))) return reject; return { type: "negation", expression: data[2] };}},
    {"name": "LogicalExpression$subexpression$1$string$1", "symbols": [{"literal":"a"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "LogicalExpression$subexpression$1", "symbols": ["LogicalExpression$subexpression$1$string$1"]},
    {"name": "LogicalExpression$subexpression$1$string$2", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "LogicalExpression$subexpression$1", "symbols": ["LogicalExpression$subexpression$1$string$2"]},
    {"name": "LogicalExpression", "symbols": ["Expression", "__", "LogicalExpression$subexpression$1", "__", "Expression"], "postprocess": (data) => { return { type: "logical", left: reduce(data[0]), operator: reduce(data[2]), right: reduce(data[4])}; }},
    {"name": "Sum$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "Sum$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "Sum", "symbols": ["Sum", "_", "Sum$subexpression$1", "_", "Product"], "postprocess": (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return { type: "sum", left: reduce(data[0]), operator: reduce(data[2]), right: reduce(data[4]) }; }},
    {"name": "Sum", "symbols": ["Product"]},
    {"name": "Product$subexpression$1", "symbols": [{"literal":"*"}]},
    {"name": "Product$subexpression$1", "symbols": [{"literal":"/"}]},
    {"name": "Product", "symbols": ["Product", "_", "Product$subexpression$1", "_", "Exponentation"], "postprocess": (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return { type: "product", left: reduce(data[0]), operator: reduce(data[2]), right: reduce(data[4]) }; }},
    {"name": "Product", "symbols": ["Exponentation"]},
    {"name": "Exponentation$subexpression$1$string$1", "symbols": [{"literal":"*"}, {"literal":"*"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Exponentation$subexpression$1", "symbols": ["Exponentation$subexpression$1$string$1"]},
    {"name": "Exponentation", "symbols": ["NonArithmeticExpression", "_", "Exponentation$subexpression$1", "_", "Exponentation"], "postprocess": (data, location, reject) => { return { type: "exponentation", left: reduce(data[0]), operator: reduce(data[2]), right: reduce(data[4]) }; }},
    {"name": "Exponentation", "symbols": ["NonArithmeticExpression"]},
    {"name": "Name$ebnf$1", "symbols": []},
    {"name": "Name$ebnf$1$subexpression$1", "symbols": ["__", "NamePart"]},
    {"name": "Name$ebnf$1", "symbols": ["Name$ebnf$1", "Name$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Name", "symbols": ["NameStart", "Name$ebnf$1"], "postprocess": (data, location, reject) => { if (isKeyword(concat([data[0]]))) return reject; return { type: "name", value: concat([data]) }; }},
    {"name": "NameStart$ebnf$1", "symbols": []},
    {"name": "NameStart$ebnf$1$subexpression$1", "symbols": ["NamePartChar"]},
    {"name": "NameStart$ebnf$1", "symbols": ["NameStart$ebnf$1", "NameStart$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NameStart", "symbols": ["NameStartChar", "NameStart$ebnf$1"], "postprocess": (data, location, reject) => { return concat([data]); }},
    {"name": "NamePart$ebnf$1", "symbols": []},
    {"name": "NamePart$ebnf$1$subexpression$1", "symbols": ["NamePartChar"]},
    {"name": "NamePart$ebnf$1", "symbols": ["NamePart$ebnf$1", "NamePart$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NamePart", "symbols": ["NameStartChar", "NamePart$ebnf$1"], "postprocess": (data, location, reject) => { if (isKeyword(concat([data]))) return reject; return concat([data]); }},
    {"name": "NameStartChar", "symbols": [/[A-Z]/]},
    {"name": "NameStartChar", "symbols": [/[a-z]/]},
    {"name": "NamePartChar", "symbols": ["NameStartChar"]},
    {"name": "NamePartChar", "symbols": ["Digit"]},
    {"name": "Literal", "symbols": ["SimpleLiteral"]},
    {"name": "SimpleLiteral", "symbols": ["NumericLiteral"]},
    {"name": "SimpleLiteral", "symbols": ["BooleanLiteral"]},
    {"name": "BooleanLiteral$subexpression$1$string$1", "symbols": [{"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "BooleanLiteral$subexpression$1", "symbols": ["BooleanLiteral$subexpression$1$string$1"]},
    {"name": "BooleanLiteral$subexpression$1$string$2", "symbols": [{"literal":"f"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "BooleanLiteral$subexpression$1", "symbols": ["BooleanLiteral$subexpression$1$string$2"]},
    {"name": "BooleanLiteral", "symbols": ["BooleanLiteral$subexpression$1"], "postprocess": (data) => { return { type:"boolean", value: concat([data]) === "true" ? true : false };}},
    {"name": "NumericLiteral$ebnf$1$subexpression$1", "symbols": [{"literal":"."}, "Digits"]},
    {"name": "NumericLiteral$ebnf$1", "symbols": ["NumericLiteral$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "NumericLiteral$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NumericLiteral", "symbols": ["Digits", "NumericLiteral$ebnf$1"], "postprocess": (data) => { return { type:"number", integer: parseInt(data[0]), decimals: parseInt(data[1] ? data[1][1] : null)  }; }},
    {"name": "NumericLiteral", "symbols": [{"literal":"."}, "Digits"], "postprocess": (data) => { return { type:"number", decimals: parseInt(concat(data[1]))  }; }},
    {"name": "Digit", "symbols": [/[0-9]/]},
    {"name": "Digits$ebnf$1", "symbols": ["Digit"]},
    {"name": "Digits$ebnf$1", "symbols": ["Digits$ebnf$1", "Digit"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "Digits", "symbols": ["Digits$ebnf$1"], "postprocess": (data) => { return concat([data]); }},
    {"name": "PathExpression", "symbols": ["Expression", {"literal":"."}, "Name"], "postprocess": (data, location, reject) => { return allowedPath(data[0]) ? { type: "path", object:data[0], property:data[2]} : reject ;}},
    {"name": "PathExpression", "symbols": ["Name"]},
    {"name": "ForExpression$string$1", "symbols": [{"literal":"f"}, {"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ForExpression$string$2", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ForExpression$string$3", "symbols": [{"literal":"r"}, {"literal":"e"}, {"literal":"t"}, {"literal":"u"}, {"literal":"r"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "ForExpression", "symbols": ["ForExpression$string$1", "__", "Name", "__", "ForExpression$string$2", "__", "Expression", "__", "ForExpression$string$3", "__", "Expression"], "postprocess": (data) => { return { type: "for", var: data[2], context: data[6], return: data[10]}; }},
    {"name": "IfExpression$string$1", "symbols": [{"literal":"i"}, {"literal":"f"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "IfExpression$string$2", "symbols": [{"literal":"t"}, {"literal":"h"}, {"literal":"e"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "IfExpression$string$3", "symbols": [{"literal":"e"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "IfExpression", "symbols": ["IfExpression$string$1", "__", "Expression", "__", "IfExpression$string$2", "__", "Expression", "__", "IfExpression$string$3", "__", "Expression"], "postprocess": (data) => { return { type: "if", condition: data[2], then: data[6], else: data[10]}; }},
    {"name": "QuantifiedExpression$subexpression$1$string$1", "symbols": [{"literal":"s"}, {"literal":"o"}, {"literal":"m"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "QuantifiedExpression$subexpression$1", "symbols": ["QuantifiedExpression$subexpression$1$string$1"]},
    {"name": "QuantifiedExpression$subexpression$1$string$2", "symbols": [{"literal":"e"}, {"literal":"v"}, {"literal":"e"}, {"literal":"r"}, {"literal":"y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "QuantifiedExpression$subexpression$1", "symbols": ["QuantifiedExpression$subexpression$1$string$2"]},
    {"name": "QuantifiedExpression$string$1", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "QuantifiedExpression$string$2", "symbols": [{"literal":"s"}, {"literal":"a"}, {"literal":"t"}, {"literal":"i"}, {"literal":"s"}, {"literal":"f"}, {"literal":"i"}, {"literal":"e"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "QuantifiedExpression", "symbols": ["QuantifiedExpression$subexpression$1", "__", "Name", "__", "QuantifiedExpression$string$1", "__", "Expression", "__", "QuantifiedExpression$string$2", "__", "Expression"], "postprocess": (data) => { return { type:"quantified", operator: reduce(data[0]), variable: data[2], context: data[6], satisfy: data[10]}; }},
    {"name": "Disjunction$string$1", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Disjunction", "symbols": ["Expression", "__", "Disjunction$string$1", "__", "Expression"], "postprocess": (data) => { return { type: "disjunction", left: data[0], right: data[4]}; }},
    {"name": "Conjunction$string$1", "symbols": [{"literal":"a"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Conjunction", "symbols": ["Expression", "__", "Conjunction$string$1", "__", "Expression"], "postprocess": (data) => { return { type: "conjunction", left: data[0], right: data[4]}; }},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"="}]},
    {"name": "Comparison$subexpression$1$string$1", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Comparison$subexpression$1", "symbols": ["Comparison$subexpression$1$string$1"]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":"<"}]},
    {"name": "Comparison$subexpression$1$string$2", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Comparison$subexpression$1", "symbols": ["Comparison$subexpression$1$string$2"]},
    {"name": "Comparison$subexpression$1", "symbols": [{"literal":">"}]},
    {"name": "Comparison$subexpression$1$string$3", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Comparison$subexpression$1", "symbols": ["Comparison$subexpression$1$string$3"]},
    {"name": "Comparison", "symbols": ["Expression", "__", "Comparison$subexpression$1", "__", "Expression"], "postprocess": (data) => { return { type: "comparison", operator: reduce(data[2]), left: reduce(data[0]), right: reduce(data[4])};}},
    {"name": "Comparison$string$1", "symbols": [{"literal":"b"}, {"literal":"e"}, {"literal":"t"}, {"literal":"w"}, {"literal":"e"}, {"literal":"e"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Comparison$string$2", "symbols": [{"literal":"a"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Comparison", "symbols": ["Expression", "__", "Comparison$string$1", "__", "Expression", "__", "Comparison$string$2", "__", "Expression"], "postprocess": (data) => { return { type: "between", expression: reduce(data[0]), left: reduce(data[4]), right: reduce(data[8])};}},
    {"name": "Comparison$string$3", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Comparison", "symbols": ["Expression", "__", "Comparison$string$3", "__", "PositiveUnarytest"], "postprocess": (data) => { return { type: "comparison", operator: reduce(data[2]), left: reduce(data[0]), right: reduce(data[4])};}},
    {"name": "Comparison$string$4", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "Comparison", "symbols": ["Expression", "__", "Comparison$string$4", "_", {"literal":"("}, "_", "PositiveUnarytests", "_", {"literal":")"}], "postprocess": (data) => { return { type: "comparison", operator: reduce(data[2]), left: reduce(data[0]), right: reduce(data[6])};}},
    {"name": "BoxedExpression", "symbols": ["List"]},
    {"name": "List$ebnf$1", "symbols": []},
    {"name": "List$ebnf$1$subexpression$1", "symbols": [{"literal":","}, "_", "Expression"]},
    {"name": "List$ebnf$1", "symbols": ["List$ebnf$1", "List$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "List", "symbols": [{"literal":"["}, "_", "Expression", "_", "List$ebnf$1", "_", {"literal":"]"}], "postprocess": (data) => { return { type:"list", entries: [].concat(data[2]).concat(extract(data[4],2)) };}},
    {"name": "WhiteSpace", "symbols": ["VerticalSpace"]},
    {"name": "WhiteSpace", "symbols": [{"literal":" "}]},
    {"name": "WhiteSpace", "symbols": [/[\u00A0]/]},
    {"name": "WhiteSpace", "symbols": [/[\uFEFF]/]},
    {"name": "VerticalSpace", "symbols": [/[\u000A]/]},
    {"name": "VerticalSpace", "symbols": [/[\u000D]/]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1$subexpression$1", "symbols": ["WhiteSpace"]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "_$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": null},
    {"name": "__$ebnf$1$subexpression$1", "symbols": ["WhiteSpace"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1$subexpression$1"]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": ["WhiteSpace"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "__$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": null}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
