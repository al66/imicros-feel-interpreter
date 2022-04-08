@{%
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
%}

@lexer lexer

main -> UnaryTests {% (data) => { return { type: "unarytests", test: reduce([data]) }; } %} 
    | Expression {% (data) => reduce([data]) %}

Expression -> BoxedExpression
    | TextualExpression {% (data) => reduce([data]) %}

TextualExpression -> ForExpression | IfExpression | QuantifiedExpression
    | LogicalExpression
    | Comparison
    | ArithmeticExpression

ArithmeticExpression -> Sum

NonArithmeticExpression -> InstanceOf
    | PathExpression
    | FilterExpression
    | ArithmeticNegation
    | SimplePositiveUnaryTest
    #| Literal
    | "(" _ Expression _ ")" {% (data) => { return { type:"eval", expression: data[2] }; } %}

SimplePositiveUnaryTest -> ("<"|"<="|">"|">=") __ Endpoint {% (data) => { return { type: "unary", operator: reduce(data[0]).value, value: reduce(data[2]) }; } %}
    | Interval

Interval -> ("("|"]"|"[") _ Endpoint _ ".." _ Endpoint _ (")"|"["|"]") {% (data) => { return { type: "interval", open: reduce(data[0]).value, from: reduce(data[2]), to: reduce(data[6]), close: reduce(data[8]).value } } %}
    | FunctionInvocation
    | Literal
      

PositiveUnarytest -> Expression

PositiveUnarytests -> PositiveUnarytest _ ("," _ PositiveUnarytest):+ {% (data) => { return { type:"list", entries: [].concat(data[0]).concat(extractObj(data[2],2)) };} %}

UnaryTests -> PositiveUnarytests
    | "not" _ "(" _ PositiveUnarytests _ ")" {% (data) => { return { type: "not", test: reduce(data[4]) }; } %}
    | _ "-" _  {% (data) => { return { type: "dash" }; } %}

Endpoint -> SimpleValue

SimpleValue -> QualifiedName
    | SimpleLiteral

ArithmeticNegation -> "-" _ Expression {% (data, location, reject) => { if (!allowedNegationTerm(reduce(data[2]))) return reject; return { type: "negation", expression: data[2] };} %}

Sum -> Sum _ ("+"|"-") _ Product {% (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return { type: "sum", left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }; } %}
    | Product
Product -> Product _ ("*"|"/") _ Exponentation {% (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return { type: "product", left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }; } %}
    | Exponentation
Exponentation -> NonArithmeticExpression _ ("**") _ Exponentation {% (data, location, reject) => { return { type: "exponentation", left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }; } %}
    | NonArithmeticExpression

QualifiedName -> Name _ "." _ Name {% (data) => { return { type: "path", object:data[0], property:data[4]}; } %}
    | Name

Name -> NameStart (__ NamePart):* {% (data, location, reject) => { if (isKeyword(concat([data[0]]))) return reject; return { type: "name", value: concat([data]) }; } %}
#NameStart -> %keyword:? %word %number:?   --- doesn't work
#NamePart -> %keyword:? %word %number:?    --- doesn't work

# no other way found to exclude string type here - should not be found by the grammar rules below, but is found ... :-(
NameStart -> NameStartChar (NamePartChar):* {% (data, location, reject) => { if(data[0] && data[0][0] && data[0][0].type === "string") return reject; return concat([data]); } %}

NamePart -> NameStartChar (NamePartChar):*  {% (data, location, reject) => { if (isKeyword(concat([data]))) return reject; return concat([data]); } %}

NameStartChar -> [A-Z] | [a-z] 
#NameStartChar -> %keyword:? %word

NamePartChar -> NameStartChar | %number 

Literal -> SimpleLiteral
    | "null" {% (data) => { return { type: "null" }; } %}

SimpleLiteral -> NumericLiteral | BooleanLiteral 
    | StringLiteral
    | DateTimeLiteral

StringLiteral -> %string {% (data) => { return { type:"string", value: concat(data) }; } %}

BooleanLiteral -> ("true"|"false") {% (data) => { return { type:"boolean", value: concat([data]) === "true" ? true : false };} %}

NumericLiteral -> Digits ("." Digits):? {% (data) => { return { type:"number", integer: parseInt(data[0]), decimals: parseInt(data[1] ? data[1][1] : null)  }; } %}
    | "." Digits {% (data) => { return { type:"number", decimals: parseInt(concat(data[1]))  }; } %}

Digits -> %number {% (data) => { return concat([data]); } %}

#FunctionInvocation -> Expression _ Parameters {% (data, location, reject) => { if(isKeyword(concat([data[0]]))) return reject;  return { type: "call", name: reduce(data[0]), parameters: reduce(data[2]) };} %}
FunctionInvocation -> Name _ Parameters {% (data, location, reject) => { if(isKeyword(concat([data[0]]))) return reject;  return { type: "call", name: reduce(data[0]), parameters: reduce(data[2]) };} %}

Parameters -> "(" _ (NamedParameterList|PositionalParameterList)  _ ")" {% (data) => reduce(data[2]) %}

NamedParameterList -> NamedParameter _ ("," _ NamedParameter):* {% (data) => { return { type:"list", entries: [].concat(data[0]).concat(extract(data[2],2)) };} %}

NamedParameter -> Name _ ":" _ Expression {% (data) => { return { type:"named", name: concat(data[0]), expression: reduce(data[4]) };} %}

PositionalParameterList -> Expression _ ("," _ Expression):*  {% (data) => { return { type:"list", entries: [].concat(data[0]).concat(extract(data[2],2)) };} %}

PathExpression -> Expression "." Name {% (data, location, reject) => { return allowedPath(data[0]) ? { type: "path", object:data[0], property:data[2]} : reject ;} %}
    | Name

ForExpression -> "for" __ Name __ "in" __ Expression __ "return" __ Expression {% (data) => { return { type: "for", var: data[2], context: data[6], return: data[10]}; } %}

IfExpression -> "if" __ Expression __ "then" __ Expression __ "else" __ Expression {% (data) => { return { type: "if", condition: data[2], then: data[6], else: data[10]}; } %}

QuantifiedExpression -> ("some"|"every") __ Name __ "in" __ Expression __ "satisfies" __ Expression {% (data) => { return { type:"quantified", operator: reduce(data[0]).value, variable: data[2], context: data[6], satisfy: data[10]}; } %}

# Instead of Disjunction + Conjunction
LogicalExpression -> Expression __ ("and"|"or") __ Expression {% (data) => { return { type: "logical", left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4])}; } %}

Comparison -> Expression __ ("="|"!="|"<"|"<="|">"|">=") __ Expression {% (data) => { return { type: "comparison", operator: reduce(data[2]).value, left: reduce(data[0]), right: reduce(data[4])};} %}
    | Expression __ "between" __ Expression __ "and" __ Expression {% (data) => { return { type: "between", expression: reduce(data[0]), left: reduce(data[4]), right: reduce(data[8])};} %}
    | Expression __ "in" __ PositiveUnarytest {% (data) => { return { type: "comparison", operator: reduce(data[2]).value, left: reduce(data[0]), right: reduce(data[4])};} %}
    | Expression __ "in" _ "(" _ PositiveUnarytests _ ")" {% (data) => { return { type: "comparison", operator: reduce(data[2]).value, left: reduce(data[0]), right: reduce(data[6])};} %}

FilterExpression -> Expression _ "[" _ Expression _ "]" {% (data) => { return { type:"filter", list: reduce(data[0]), filter: reduce(data[4])};} %}

InstanceOf -> Expression _ "instance" _ "of" _ Type {% (data) => { return { type: "instanceOf", instance: reduce(data[0]), of: reduce(data[6])}; } %}

Type -> QualifiedName
    | "list" _ "<" _ Type _ ">" {% (data) => { return { type: "listOf", single: reduce(data[4]) }; } %}
    | "context" _ "<" _ Name _ ":" _ Type _ ("," _ Name _ ":" _ Type):*
    | "function" _ "<" _ (Type _ ("," _ Type):*):? _ ">" _ "->" _ Type 
    | BasicType {% (data) => reduce(data) %}

BasicType -> ("boolean"|"number"|"string"|"date"|"time"|"day-time-duration"|"year-month-duration") {% (data) => reduce(data).value %}
    | "date" __ "time" {% (data) => concat(data) %}

BoxedExpression -> List
    | Context

List -> "[" _ Expression _ ("," _ Expression):* _ "]" {% (data) => { return { type:"list", entries: [].concat(data[2]).concat(extract(data[4],2)) };} %}

Context -> "{" _ (ContextEntries):? _ "}" {% (data) => { return { type: "context", data: reduce(data[2]) }; } %}

ContextEntries -> ContextEntry _ ("," _ ContextEntry):* {% (data) => { return { type:"list", entries: [].concat(data[0]).concat(extract(data[2],2)) };} %}

ContextEntry -> Key _ ":" _ Expression {% (data) => { return { type:"entry", key: reduce(data[0]), expression: reduce(data[4]) };} %}

Key -> Name
    | StringLiteral

DateTimeLiteral -> AtLiteral
    | DateTimeFunction

DateTimeFunction -> Name _ Parameters {% (data, location, reject) => { if(!isDateTimeFunction(concat([data[0]]))) return reject;  return { type: "dateandtime", name: reduce(data[0]), parameters: reduce(data[2]) };} %}

WhiteSpace -> %whitespace
    | VerticalSpace

VerticalSpace
    -> [\u000A]
    | [\u000D]

_  -> WhiteSpace:* {% null %}

__  -> WhiteSpace:+  {% null %}

AtLiteral -> "@" StringLiteral

