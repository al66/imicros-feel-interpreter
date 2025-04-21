/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

class Node {

    // basic types
    static get NUMBER() { return "NUMBER"; }
    static get NAME() { return "NAME"; }
    static get STRING() { return "STRING"; }
    static get NULL() { return "NULL"; }
    static get BOOLEAN() { return "BOOLEAN"; }
    static get DASH() { return "DASH"; }

    // calculation
    static get EVAL() { return "EVAL"; }
    static get NEGATION() { return "NEGATION"; }
    static get SUM() { return "SUM"; }
    static get PRODUCT() { return "PRODUCT"; }
    static get EXPONENTATION() { return "EXPONENTATION"; }

    // comparison
    static get LOGICAL() { return "LOGICAL"; }
    static get COMPARISON() { return "COMPARISON"; }
    static get NOT() { return "NOT"; }
    static get IN() { return "IN"; }
    static get IN_INTERVAL() { return "IN_INTERVAL"; }
    static get IN_LIST() { return "IN_LIST"; }
    static get BETWEEN() { return "BETWEEN"; }
    static get INSTANCE_OF() { return "INSTANCE_OF"; }

    // groups & lists   
    static get LIST() { return "LIST"; }
    static get INTERVAL() { return "INTERVAL"; }
    static get PATH() { return "PATH"; }
    static get FILTER() { return "FILTER"; }
    static get UNARY() { return "UNARY"; }
    static get UNARYTESTS() { return "UNARYTESTS"; }
    static get LIST_OF() { return "LIST_OF"; }
    static get CONTEXT() { return "CONTEXT"; }
    static get CONTEXT_ENTRY() { return "CONTEXT_ENTRY"; }
    static get NAMED_PARAMETER() { return "NAMED_PARAMETER"; }
    static get CONTEXT_TYPE() { return "CONTEXT_TYPE"; }
    static get CONTEXT_ELEMENT() { return "CONTEXT_ELEMENT"; }
    static get FORMAL_PARAMETER() { return "FORMAL_PARAMETER"; }

    // boxed expressions
    static get BOXED() { return "BOXED"; }

    // control flow
    static get FOR() { return "FOR"; }
    static get IF() { return "IF"; }
    static get QUANTIFIED() { return "QUANTIFIED"; }
    static get FUNCTION_CALL() { return "FUNCTION_CALL"; }
    static get FUNCTION_DEFINITION() { return "FUNCTION_DEFINITION"; }

    // conversion
    static get DATE_AND_TIME() { return "DATE_AND_TIME"; }
    static get AT_LITERAL() { return "AT_LITERAL"; }

    // DMN specific
    static get MAIN() { return "MAIN"; }
    static get RULE() { return "RULE"; }
    static get INPUT() { return "INPUT"; }
    static get RETURN() { return "RETURN"; }
    static get DECISIONTABLE() { return "DECISIONTABLE"; }
    static get BUSINESSKNOWLEDGEMODEL() { return "BUSINESSKNOWLEDGEMODEL"; }

    constructor (object) {
        Object.assign(this, object);
    }
}

module.exports = Node;