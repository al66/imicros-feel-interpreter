@{%
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
%}

main -> Expression {% (data) => reduce([data]) %}

Expression -> BoxedExpression
    | TextualExpression {% (data) => reduce([data]) %}

TextualExpression -> ForExpression | IfExpression | QuantifiedExpression
    | LogicalExpression
    | Comparison
    | ArithmeticExpression

ArithmeticExpression -> Sum

NonArithmeticExpression -> PathExpression
    | ArithmeticNegation
    | Literal
    | "(" _ Expression _ ")" {% (data) => { return { type:"eval", expression: data[2] }; } %}

PositiveUnarytest -> Expression

PositiveUnarytests -> PositiveUnarytest _ ("," _ PositiveUnarytest):* {% (data) => { return { type:"list", entries: [].concat(data[0]).concat(extractObj(data[2],2)) };} %}

ArithmeticNegation -> "-" _ Expression {% (data, location, reject) => { if (!allowedNegationTerm(reduce(data[2]))) return reject; return { type: "negation", expression: data[2] };} %}

LogicalExpression -> Expression __ ("and"|"or") __ Expression {% (data) => { return { type: "logical", left: reduce(data[0]), operator: reduce(data[2]), right: reduce(data[4])}; } %}

Sum -> Sum _ ("+"|"-") _ Product {% (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return { type: "sum", left: reduce(data[0]), operator: reduce(data[2]), right: reduce(data[4]) }; } %}
    | Product
Product -> Product _ ("*"|"/") _ Exponentation {% (data, location, reject) => { if (!allowedTerm(reduce(data[0])) || !allowedTerm(reduce(data[4]))) return reject; return { type: "product", left: reduce(data[0]), operator: reduce(data[2]), right: reduce(data[4]) }; } %}
    | Exponentation
Exponentation -> NonArithmeticExpression _ ("**") _ Exponentation {% (data, location, reject) => { return { type: "exponentation", left: reduce(data[0]), operator: reduce(data[2]), right: reduce(data[4]) }; } %}
    | NonArithmeticExpression

Name -> NameStart (__ NamePart):* {% (data, location, reject) => { if (isKeyword(concat([data[0]]))) return reject; return { type: "name", value: concat([data]) }; } %}

NameStart -> NameStartChar (NamePartChar):* {% (data, location, reject) => { return concat([data]); } %}

NamePart -> NameStartChar (NamePartChar):*  {% (data, location, reject) => { if (isKeyword(concat([data]))) return reject; return concat([data]); } %}

NameStartChar -> [A-Z] | [a-z]

NamePartChar -> NameStartChar | Digit 

Literal -> SimpleLiteral

SimpleLiteral -> NumericLiteral | BooleanLiteral

BooleanLiteral -> ("true"|"false") {% (data) => { return { type:"boolean", value: concat([data]) === "true" ? true : false };} %}

NumericLiteral -> Digits ("." Digits):? {% (data) => { return { type:"number", integer: parseInt(data[0]), decimals: parseInt(data[1] ? data[1][1] : null)  }; } %}
    | "." Digits {% (data) => { return { type:"number", decimals: parseInt(concat(data[1]))  }; } %}

Digit -> [0-9]

Digits -> Digit:+ {% (data) => { return concat([data]); } %}

PathExpression -> Expression "." Name {% (data, location, reject) => { return allowedPath(data[0]) ? { type: "path", object:data[0], property:data[2]} : reject ;} %}
    | Name

ForExpression -> "for" __ Name __ "in" __ Expression __ "return" __ Expression {% (data) => { return { type: "for", var: data[2], context: data[6], return: data[10]}; } %}

IfExpression -> "if" __ Expression __ "then" __ Expression __ "else" __ Expression {% (data) => { return { type: "if", condition: data[2], then: data[6], else: data[10]}; } %}

QuantifiedExpression -> ("some"|"every") __ Name __ "in" __ Expression __ "satisfies" __ Expression {% (data) => { return { type:"quantified", operator: reduce(data[0]), variable: data[2], context: data[6], satisfy: data[10]}; } %}

Disjunction -> Expression __ "or" __ Expression {% (data) => { return { type: "disjunction", left: data[0], right: data[4]}; } %}

Conjunction -> Expression __ "and" __ Expression {% (data) => { return { type: "conjunction", left: data[0], right: data[4]}; } %}

Comparison -> Expression __ ("="|"!="|"<"|"<="|">"|">=") __ Expression {% (data) => { return { type: "comparison", operator: reduce(data[2]), left: reduce(data[0]), right: reduce(data[4])};} %}
    | Expression __ "between" __ Expression __ "and" __ Expression {% (data) => { return { type: "between", expression: reduce(data[0]), left: reduce(data[4]), right: reduce(data[8])};} %}
    | Expression __ "in" __ PositiveUnarytest {% (data) => { return { type: "comparison", operator: reduce(data[2]), left: reduce(data[0]), right: reduce(data[4])};} %}
    | Expression __ "in" _ "(" _ PositiveUnarytests _ ")" {% (data) => { return { type: "comparison", operator: reduce(data[2]), left: reduce(data[0]), right: reduce(data[6])};} %}

BoxedExpression -> List

List -> "[" _ Expression _ ("," _ Expression):* _ "]" {% (data) => { return { type:"list", entries: [].concat(data[2]).concat(extract(data[4],2)) };} %}

WhiteSpace -> VerticalSpace
    | " "
    | [\u00A0]
    | [\uFEFF]

VerticalSpace
    -> [\u000A]
    | [\u000D]

_  -> (WhiteSpace):* {% null %}

__  -> (WhiteSpace):+  {% null %}


