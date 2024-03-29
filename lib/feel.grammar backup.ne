@{%
    /**
    * @license MIT, imicros.de (c) 2022 Andreas Leinen
    *
    */
    "use strict";

    const moo = require("moo");

    const Node = require("./ast.js");

    const lexer = moo.compile({
        // string      : /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)/
        string      : { match: /"(?:\\"|[^"])*?"/, value: s => s.slice(1, -1) },
        dayandtime  : /date[ ]+and[ ]+time/,
        fn          : /string[ ]+length|week[ ]+of[ ]+year|month[ ]+of[ ]+year|day[ ]+of[ ]+year|month[ ]+of[ ]+year|day[ ]+of[ ]+week/,            
        types       : /day-time-duration|year-month-duration/,
        instance    : /instance[ ]+of/,
        whitespace  : { match: /[ \t\n\r\u00A0\uFEFF\u000D\u000A]+/, lineBreaks: true },
        word        : { match: /[\?_A-Za-z]+/, type: moo.keywords({
            keywords    : ['for','return','if','true','false','in','and','or','between','some','every','then','else'],
            not         : ['not'],
            types       : ['string','number','boolean'],
            null        : ['null'],
            dayandtime  : ['date','time','duration'],
            fn          : ['even','abs','length']
        }) },
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

    function allowedPath(data) {
        return [Node.SUM,Node.PRODUCT,Node.EXPONENTATION,Node.NEGATION].indexOf(data && data.node ? data.node : "") >= 0 ? false : true;
    }

    function allowedTerm(data) {
        return [Node.LOGICAL,Node.QUANTIFIED].indexOf(data && data.node ? data.node : "") >= 0 ? false : true;
    }

    function allowedNegationTerm(data) {
        return [Node.SUM,Node.PRODUCT].indexOf(data && data.node ? data.node : "") >= 0 ? false : true;
    }
%}

@lexer lexer

main -> UnaryTests {% (data) => reduce([data[0]]) %}
    | _ Expression {% (data) => reduce([data[1]]) %}

Expression -> BoxedExpression
    | TextualExpression {% (data) => reduce([data]) %}

TextualExpression -> ForExpression | IfExpression | QuantifiedExpression
    | LogicalExpression

#ArithmeticExpression -> Sum
#ArithmeticExpression -> ArithmeticNegation

NonArithmeticExpression -> InstanceOf
    | PathExpression
    | FilterExpression
    | ArithmeticNegation
    | SimplePositiveUnaryTest
    | "(" _ Expression _ ")" {% (data) => { return new Node({ node: Node.EVAL, expression: data[2] }); } %}

SimplePositiveUnaryTest -> ("<"|"<="|">"|">=") _ Endpoint {% (data) => { return new Node({ node: Node.UNARY, operator: reduce(data[0]).value, value: reduce(data[2]) }); } %}
    | Interval

Interval -> ("("|"]"|"[") _ Endpoint _ ".." _ Endpoint _ (")"|"["|"]") {% (data) => { return new Node({ node: Node.INTERVAL, open: reduce(data[0]).value, from: reduce(data[2]), to: reduce(data[6]), close: reduce(data[8]).value }) } %}
    | FunctionInvocation
    | Literal
      

PositiveUnarytest -> Expression

PositiveUnarytests -> PositiveUnarytest _ ("," _ PositiveUnarytest):+ {% (data) => { return new Node({ node:Node.LIST, entries: [].concat(data[0]).concat(extractObj(data[2],2)) }) ;} %}

UnaryTests -> PositiveUnarytests {% (data) => { return new Node({ node: Node.UNARYTESTS, list: reduce([data]) }); } %} 
    | Expression _ "in" _ List {% (data) => { return new Node({ node:Node.IN_LIST, input: reduce(data[0]), list: reduce(data[4]) });} %}
    | UnaryNot
    | UnaryDash

UnaryNot -> %not _ "(" _ PositiveUnarytests _ ")" {% (data) => { return new Node({ node: Node.UNARY_NOT, test: reduce(data[4]) }); } %}

UnaryDash -> _ "-" _  {% (data) => { return new Node({ node: Node.DASH }); } %}

Endpoint -> SimpleValue

SimpleValue -> QualifiedName
    | SimpleLiteral

ArithmeticNegation -> "-" _ Expression {% (data, location, reject) => { if (!allowedNegationTerm(reduce(data[2]))) return reject; return new Node({ node: Node.NEGATION, expression: data[2] });} %}
#ArithmeticNegation -> "-" _ Sum {% (data) => { return new Node({ node: Node.NEGATION, expression: data[2] });} %}
#    | Sum

Sum -> Sum _ ("+"|"-") _ Product {% (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return new Node({ node: Node.SUM, left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }); } %}
    | Product
Product -> Product _ ("*"|"/") _ Exponentation {% (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return new Node({ node: Node.PRODUCT, left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }); } %}
    | Exponentation
Exponentation -> NonArithmeticExpression _ ("**") _ Exponentation {% (data, location, reject) => { return new Node({ node: Node.EXPONENTATION, left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4]) }); } %}
    | NonArithmeticExpression

QualifiedName -> Name _ "." _ Name {% (data) => { return new Node({ node: Node.PATH, object:data[0], property:data[4]}); } %}
    | Name

Name -> PotentialName {% (data) => {  return new Node({ node: Node.NAME, value: concat([data]) }); } %}

PotentialName -> NameStart (__ NamePart):* {% (data) => { return concat([data]); } %}
NameStart -> %word %number:? {% (data) => { return concat(data)} %}
NamePart -> %word %number:?  {% (data) => { return concat(data)} %}
    | %types {% (data) => { return concat(data)} %}

Literal -> SimpleLiteral
    | %null {% (data) => { return new Node({ node: Node.NULL }); } %}

SimpleLiteral -> NumericLiteral | BooleanLiteral 
    | StringLiteral
    | DateTimeLiteral

StringLiteral -> %string {% (data) => { return new Node({ node: Node.STRING, value: String.raw`${ data }` }); } %}

BooleanLiteral -> ("true"|"false") {% (data) => { return new Node({ node: Node.BOOLEAN, value: concat([data]) === "true" ? true : false });} %}

NumericLiteral -> Digits ("." Digits):? {% (data) => { return new Node({ node:Node.NUMBER, integer: parseInt(data[0]), decimals: parseInt(data[1] ? data[1][1] : null), float: parseFloat(concat([data]))  }); } %}
    | "." Digits {% (data) => { return new Node({ node: Node.NUMBER, decimals: parseInt(concat(data[1])), float: parseFloat("."+concat([data[1]])) }); } %}

Digits -> %number {% (data) => { return concat([data]); } %}

FunctionInvocation -> FunctionName _ Parameters {% (data, location, reject) => { return new Node({ node: Node.FUNCTION_CALL, name: reduce(data[0]), parameters: reduce(data[2]) });} %}
    | %not _ "(" _ Expression _ ")" {% (data, location, reject) => { return new Node({ node: Node.NOT, parameters: reduce(data[4]) });} %}

FunctionName -> %fn {% (data) => { return new Node({ node: Node.NAME, value: concat([data]) }); } %}
    | PotentialName {% (data) => { return new Node({ node: Node.NAME, value: concat([data]) }); } %}

Parameters -> "(" _ (NamedParameterList|PositionalParameterList):?  _ ")" {% (data) => reduce(data[2]) %}

NamedParameterList -> NamedParameter _ ("," _ NamedParameter):* {% (data) => { return new Node({ node: Node.LIST, entries: [].concat(data[0]).concat(extractObj(data[2],2)) });} %}

NamedParameter -> Name _ ":" _ Expression {% (data) => { return new Node({ node: Node.NAMED_PARAMETER, name: concat(data[0]), expression: reduce(data[4]) });} %}

PositionalParameterList -> Expression _ ("," _ Expression):*  {% (data) => { return new Node({ node: Node.LIST, entries: [].concat(reduce(data[0])).concat(reduce(extractObj(data[2],2))) });} %}

PathExpression -> Expression "." Name {% (data, location, reject) => { return allowedPath(data[0]) ? new Node({ node: Node.PATH, object:reduce(data[0]), property:data[2]}) : reject ;} %}
    | Name

ForExpression -> "for" __ Name __ "in" __ Expression __ "return" __ Expression {% (data) => { return new Node({ node: Node.FOR, var: data[2], context: data[6], return: data[10]}); } %}

IfExpression -> "if" __ Expression __ "then" __ Expression __ "else" __ Expression _ {% (data) => { return new Node({ node: Node.IF, condition: data[2], then: data[6], else: data[10]}); } %}

QuantifiedExpression -> ("some"|"every") __ Name __ "in" __ Expression __ "satisfies" __ Expression {% (data) => { return new Node({ node: Node.QUANTIFIED, operator: reduce(data[0]).value, variable: data[2], context: data[6], satisfy: data[10]}); } %}

# Instead of Disjunction + Conjunction
LogicalExpression -> LogicalExpression __ ("and"|"or") __ Comparison {% (data) => { return new Node({ node: Node.LOGICAL, left: reduce(data[0]), operator: reduce(data[2]).value, right: reduce(data[4])}); } %}
    | Comparison

Comparison -> Comparison _ ("="|"!="|"<"|"<="|">"|">=") _ Sum {% (data) => { return new Node({ node: Node.COMPARISON, operator: reduce(data[2]).value, left: reduce(data[0]), right: reduce(data[4])});} %}
    | Expression __ "between" __ Expression __ "and" __ Expression {% (data) => { return new Node({ node: Node.BETWEEN, expression: reduce(data[0]), left: reduce(data[4]), right: reduce(data[8])});} %}
    | Expression __ "in" __ PositiveUnarytest {% (data) => { return new Node({ node: Node.IN, input: reduce(data[0]), test: reduce(data[4])});} %}
    | Expression __ "in" __ UnaryNot {% (data) => { return new Node({ node: Node.IN, input: reduce(data[0]), test: reduce(data[4])});} %}
    | Expression __ "in" __ UnaryDash {% (data) => { return new Node({ node: Node.IN, input: reduce(data[0]), test: reduce(data[4])});} %}
    | Expression __ "in" _ "(" _ PositiveUnarytests _ ")" {% (data) => { return new Node({ node: Node.IN_LIST, input: reduce(data[0]), list: reduce(data[6])});} %}
    | Sum
 #   | ArithmeticNegation

FilterExpression -> Expression _ "[" _ Expression _ "]" {% (data) => { return new Node({ node: Node.FILTER, list: reduce(data[0]), filter: reduce(data[4])});} %}

InstanceOf -> Expression _ %instance _ Type {% (data) => { return new Node({ node: Node.INSTANCE_OF, instance: reduce(data[0]), of: reduce(data[4])}); } %}

Type -> QualifiedName
    | "list" _ "<" _ Type _ ">" {% (data) => { return new Node({ node: Node.LIST_OF, single: reduce(data[4]) }); } %}
    | "context" _ "<" _ ContextElements _ ">" {% (data) => { return new Node({ node: Node.CONTEXT_TYPE, elements: reduce(data[4]) }); } %}
    | "function" _ "<" _ (Type _ ("," _ Type):*):? _ ">" _ "->" _ Type 
    | BasicType {% (data) => reduce(data) %}

ContextElements -> ContextElement _ ("," _ ContextElement):* {% (data) => { return new Node({ node: Node.LIST, entries: [].concat(data[0]).concat(extract(data[2],2)) });} %} 

ContextElement -> Name _ ":" _ Type {% (data) => { return new Node({ node: Node.CONTEXT_ELEMENT, name: concat(data[0]), type: reduce(data[4]) });} %}

BasicType -> ("boolean"|"number"|"string"|"date"|"time"|"date and time"|"day-time-duration"|"year-month-duration") {% (data) => reduce(data).value %}
    | "date" __ "time" {% (data) => concat(data) %}

BoxedExpression -> List
    | FunctionDefintion {% (data) => { return reduce(data);} %}
    | Context __ Expression {% (data) => { return new Node({ node: Node.BOXED, context: reduce(data[0]), result: reduce(data[2]) }); } %}
    | Context {% (data) => { return reduce(data);} %}

List -> "[" _ ListEntries _ "]" {% (data) => { return new Node({ node: Node.LIST, entries: data[2] }); } %}
    | "[" _ "]" {% (data) => { return new Node({ node: Node.LIST, entries: [] }); } %}

ListEntries -> ListEntry _ ("," _ ListEntry):* {% (data) => { return [].concat(data[0]).concat(extractObj(data[2],2)); } %}

ListEntry -> Expression {% (data) => reduce(data) %}
    | UnaryDash 

FunctionDefintion -> "function" _ "(" _ FormalParameterList _ ")" _ Expression  {% (data) => { return new Node({ node: Node.FUNCTION_DEFINITION, parameters: reduce(data[4]), expression: reduce(data[8]) });} %}

FormalParameterList-> FormalParameter _ ("," _ FormalParameter):* {% (data) => { return new Node({ node: Node.LIST, entries: [].concat(reduce(data[0])).concat(reduce(extractObj(data[2],2))) });} %}

FormalParameter -> Name _ FormalParameterType:? {% (data) => { return new Node({ node: Node.FORMAL_PARAMETER, name: concat(data[0]), type: reduce(data[2]) });} %}

FormalParameterType -> ":" _ Type {% (data) => { return reduce(data[2]); } %}

Context -> "{" _ (ContextEntries):? _ "}" {% (data) => { return new Node({ node: Node.CONTEXT, data: reduce(data[2]) }); } %}

ContextEntries -> ContextEntry _ ("," _ ContextEntry):* {% (data) => { return new Node({ node: Node.LIST, entries: [].concat(data[0]).concat(extractObj(data[2],2)) });} %}

ContextEntry -> Key _ ":" _ Expression {% (data) => { return new Node({ node: Node.CONTEXT_ENTRY, key: reduce(data[0]), expression: reduce(data[4]) });} %}

Key -> Name
    | StringLiteral

DateTimeLiteral -> AtLiteral 
    | DateTimeFunction

DateTimeFunction -> %dayandtime _ Parameters {% (data) => { return new Node({ node: Node.DATE_AND_TIME, name: data[0].value, parameters: reduce(data[2]) });} %}

WhiteSpace -> %whitespace

_  -> WhiteSpace:* {% null %}

__  -> WhiteSpace:+  {% null %}

AtLiteral -> "@" StringLiteral {% (data) => {return new Node({ node: Node.AT_LITERAL, expression: reduce(data[1]) });} %}

