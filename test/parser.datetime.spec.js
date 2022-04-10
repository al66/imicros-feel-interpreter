"use strict";

const nearley = require("nearley");
const grammar = require("../lib/feel.grammar.js");
const Node = require("../lib/ast.js");
const util = require('util');

function create() {
    return new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
}

var parser;
function parse(exp) {
    try {
        parser.feed(exp);
        return parser.results;
    } catch(e) {
        console.log("ERROR",util.inspect({ msg: e.message, offset: e.offset, token: e.token }, { showHidden: false, depth: null, colors: true }))
        return {};
    }
}


let exp = "";
describe("Date and time expressions", () => {

    beforeEach(() => { parser = create() });
    
    it("Expression:date and time(\"2022-04-06T08:00:00\")", (exp = "date and time(\"2022-04-06T08:00:00\")") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.DATE_AND_TIME);
        expect(parser.results[0].name).toEqual("date and time");
        expect(parser.results[0].parameters.node).toEqual(Node.LIST);
        expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.STRING, value: "\"2022-04-06T08:00:00\"" }));
    });
    it("Expression:date(\"2022-04-06\")", (exp = "date(\"2022-04-06\")") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.DATE_AND_TIME);
        expect(parser.results[0].name).toEqual("date");
        expect(parser.results[0].parameters.node).toEqual(Node.LIST);
        expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.STRING, value: "\"2022-04-06\"" }));
    });
    it("Expression:time(\"08:00:00\")", (exp = "time(\"08:00:00\")") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.DATE_AND_TIME);
        expect(parser.results[0].name).toEqual("time");
        expect(parser.results[0].parameters.node).toEqual(Node.LIST);
        expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.STRING, value: "\"08:00:00\"" }));
    });
    it("Expression:duration(\"P1Y6M\")", (exp = "duration(\"P1Y6M\")") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.DATE_AND_TIME);
        expect(parser.results[0].name).toEqual("duration");
        expect(parser.results[0].parameters.node).toEqual(Node.LIST);
        expect(parser.results[0].parameters.entries).toContainEqual(expect.objectContaining({ node: Node.STRING, value: "\"P1Y6M\"" }));
    });
    it("Expression:@\"2022-04-06T08:00:00\")", (exp = "@\"2022-04-06T08:00:00\"") => {
        parse(exp);
        // console.log(util.inspect(parser.results, { showHidden: false, depth: null, colors: true }));
        expect(parser.results).toBeDefined();
        expect(parser.results.length).toEqual(1);
        expect(parser.results[0].node).toEqual(Node.AT_LITERAL);
        expect(parser.results[0].expression.node).toEqual(Node.STRING);
        expect(parser.results[0].expression.value).toEqual("\"2022-04-06T08:00:00\"");
    });

});
