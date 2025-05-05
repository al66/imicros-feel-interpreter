/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
"use strict";

const { XMLParser } = require("fast-xml-parser");
const Interpreter = require("./interpreter.js");
const Node = require("./ast.js");
const _ = require("./lodash");
const util = require('util');
const { type } = require("os");

const options = {
    attributeNamePrefix : "_",
    removeNSPrefix: true,
    ignoreAttributes : false,
    ignoreNameSpace : false,
    allowBooleanAttributes : true,
    parseNodeValue : true,
    parseAttributeValue : true,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPropName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false
    //    attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
    //    tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
    // stopNodes: ["dmndi:DMNDI"] ...doesn't work...
};

class FeelParserError extends Error {
    constructor(e, expression,  origin) {
        super(e);
        Error.captureStackTrace(this, this.constructor);
        this.originalMessage = e.message || e;
        this.message = ( e.message || e ) + ": " + expression;
        this.expression = expression;
        this.name = this.constructor.name;
        this.text = origin.text;
        this.position = origin.position;
        this.offset = origin.offset;
        this.line = origin.line;
        this.col = origin.col;
        this.original = origin.original;
        this.error = e;
    }
}

const Parser = new XMLParser(options);

const interpreter = new Interpreter();

class Decision {

    parse({ xml, decision = null }) {
        if (!xml) return false;
        this.dmn = new DMNParser().parse(xml);
        this.decision = decision;
        if (this.decision === "simpleIf") {
            delete this.decision
            this.evaluateDecision = "simpleIf"
        };
        if (!this.dmn) return false;
        this.ast = this._build(this.dmn);
        return true;
    }

    parseFeel(expression) {
        if (!expression) return null;
        try {
            let result = interpreter.parse(expression);
            if (result) return interpreter.ast;
            return null;
        } catch (e) {
            //console.log(e);
            throw new FeelParserError("Can't parse input", expression, e);
            //return null;
        }
    }

    getAst() {
        return this.ast;
    }

    setAst(ast) {
        this.ast = ast;
    }

    getDmn() {
        return this.dmn;
    }

    evaluate({ decision, data } = {}) {
        this.data = {};
        if (decision || data) {
            this.decision = decision || this.decision;
            this.data = data || {};
        } else {
            this.data = arguments[0];
        }
        this.result = null;
        interpreter.ast = this.ast;
        interpreter.logger.deactivate();
        interpreter.logger.clear();
        //if (this.evaluateDecision === "simpleIf") console.log(util.inspect(this.ast, { showHidden: false, depth: null, colors: true }));
        if (this.decision) interpreter.setDecision(this.decision);
        this.result = interpreter.evaluate({ context: this.data });
        return this.result;
    }

    analyse({ decision, data } = {}) {
        this.data = {};
        if (decision || data) {
            this.decision = decision || this.decision;
            this.data = data || {};
        } else {
            this.data = arguments[0];
        }
        this.result = null;
        interpreter.ast = this.ast;
        interpreter.logger.activate();
        interpreter.logger.clear();
        if (this.decision) interpreter.setDecision(this.decision);
        this.result = interpreter.evaluate({ context: this.data });
        return {
            log: interpreter.logger.getLog(),
            result: this.result
        }
    }

    _build (dmn) {
        if (!dmn) throw new Error("Can't build empty dmn");

        /* istanbul ignore else */
        if (this["__"+dmn.type] && {}.toString.call(this["__"+dmn.type]) === "[object Function]") {
            return this["__"+dmn.type](dmn);
        } else {
            //console.log("Interpreter - missing function ", node, this.expression);
            throw new Error("Interpreter - missing function " + dmn.type, { dmn, partlyBuild: this.ast });
        }
    }
    
    __MAIN(dmn) {
        let node = new Node({ node: Node.MAIN, definitions: [] });
        dmn.definitions.forEach((element,index) => {
            if (element.type !== "INPUT" && element.type !== "BUSINESSKNOWLEDGEMODEL" &&this.decision && element.name !== this.decision) return;
            let definition = this._build(element);
            if (definition) node.definitions.push(definition);
        })
        return [node];
    }

    __INPUT(dmn) {
        let node = new Node({ node: Node.INPUT, name: dmn.name, varType: dmn.variable?.varType, value: this.parseFeel(dmn.name)[0] });
        return node;
    }

    __RETURN(dmn) {
        let node = new Node({ node: Node.RETURN, name: dmn.name, expression: dmn.expression, value: this.parseFeel(dmn.expression)[0] });
        node.variable = dmn.variable ? { name: dmn.variable.name, type: dmn.variable.varType } : null;
        return node;
    }

    __LIST(dmn) {
        let entries = [];
        dmn.entries.forEach((element,index) => {
            entries.push(this.parseFeel(element)[0]);
        })
        let node = new Node({ node: Node.EXPRESSIONLIST, name: dmn.name, entries });
        node.variable = dmn.variable ? { name: dmn.variable.name, type: dmn.variable.varType } : null;
        return node;
    }

    __BUSINESSKNOWLEDGEMODEL(dmn) {
        // pass to ast as a context and a single context entry with the name of the function
        let parameters = [];
        dmn.parameters.forEach((element,index) => {
            let parameter = new Node({ node: Node.FORMAL_PARAMETER, name: this.parseFeel(element.name)[0], type: element.type });
            parameters.push(parameter);
        })
        let parameterList = new Node({ node: Node.LIST, entries: parameters });
        let definition = new Node({ node: Node.FUNCTION_DEFINITION, parameters: parameterList, expression: this.parseFeel(dmn.expression)[0] });
        let entries = [];
        let entry = new Node({ node: Node.CONTEXT_ENTRY, key: this.parseFeel(dmn.variable?.name)[0], expression: definition });
        entries.push(entry);
        let list = new Node({ node: Node.LIST, entries });
        let node = new Node({ node: Node.CONTEXT, name: dmn.name, data: list });
        node.variable = dmn.variable ? { name: dmn.variable.name, type: dmn.variable.varType } : null;
        return node;
    }

    __CONTEXT(dmn) {
        let entries = [];
        dmn.entries.forEach((element,index) => {
            //let entry = new Node({ node: Node.CONTEXT_ENTRY, key: this.parseFeel(element.variable?.name)[0], expression: this.parseFeel(element.expression)[0] });
            let entry = new Node({ node: Node.CONTEXT_ENTRY, key: element.variable?.name, expression: this.parseFeel(element.expression)[0] });
            entries.push(entry);
        })
        let list = new Node({ node: Node.LIST, entries });
        let node = new Node({ node: Node.CONTEXT, name: dmn.name, data: list });
        node.variable = dmn.variable ? { name: dmn.variable.name, type: dmn.variable.varType } : null;
        return node;
    }

    __DECISIONTABLE(dmn) {
        let node = new Node({ node: Node.DECISIONTABLE, name: dmn.name, hitPolicy: dmn.hitPolicy, aggregation: dmn.aggregation ,inputs: [], outputs: [], rules: [] });
        node.variable = dmn.variable ? { name: dmn.variable.name, type: dmn.variable.varType } : null;
        let inputs = node.inputs;
        dmn.inputs.forEach((element,index) => {
            let ast = this.parseFeel(element.expression);
            let input = new Node({ node: Node.INPUT, name: element.name, type: element.type, value: ast ? ast[0] : null });
            node.inputs.push(input);
        })
        dmn.outputs.forEach((element,index) => {
            let ast = this.parseFeel(element.values);
            let defaultValue = this.parseFeel(String(element.defaultValue));
            node.outputs.push({
                label: element.label,
                name: element.name,
                id: element.id,
                type: element.type,
                decisionVariable: element.decisionVariable || false,
                values: ast ? ast[0] : null,
                defaultValue: defaultValue ? defaultValue[0] : null
            });
        })
        dmn.rules.forEach((element,index) => {
            let rule = new Node({ node: Node.RULE, decisionTable: dmn.name,index, annotation: element.annotation, inputs: [], outputs: [] });
            element.inputs.forEach((input,index) => {
                let inputString = typeof input === "string" ? ( input.replace(/\s/g, "").length === 0 ? "-" : input ) : ( input === null ? "-" : input.toString() );
                let ast = this.parseFeel(inputString);
                if (!ast) throw new Error("Can't parse input: " + inputString);
                //let test = ast[0].node === Node.LIST ? new Node({ node: Node.IN_LIST, input: inputs[index].value, list: ast[0]}) : new Node({ node: Node.IN, input: inputs[index].value, test: ast[0] });
                let test = new Node({ node: Node.IN, input: inputs[index].value, test: ast[0] });
                rule.inputs.push({
                    name: inputs[index].name,
                    value: inputs[index].value,
                    expression: input.toString(),
                    test
                });
            })
            element.outputs.forEach((output,index) => {
                let ast = this.parseFeel(typeof output !== String ? ( output === null || output === undefined ? "" : output.toString() ) : output );
                rule.outputs.push({
                    label: dmn.outputs[index].label,
                    name: dmn.outputs[index].name,
                    decisionVariable: dmn.outputs[index].decisionVariable || false,
                    value: ast ? ast[0] : null,
                    values: node.outputs[index].values
                });
            })
            node.rules.push(rule);
        })
        return node;
    }

}

class DMNNodes {
    static get MAIN() { return "MAIN"; }
    static get INPUT() { return "INPUT"; }
    static get INVOCATION() { return "INVOCATION"; }
    static get CONTEXT() { return "CONTEXT"; }
    static get FUNCTION() { return "FUNCTION"; }
    static get DECISIONTABLE() { return "DECISIONTABLE"; }
    static get BUSINESSKNOWLEDGEMODEL() { return "BUSINESSKNOWLEDGEMODEL"; }
    static get RETURN() { return "RETURN"; }
    static get LIST() { return "LIST"; }
}

class DMNParser {

    // context entry
    parseContextEntry(element,list) {
        // console.log(util.inspect({ start: "ContextEntry", element}, { showHidden: false, depth: null, colors: true }));
        const node = this.createNode(element);
        this.parseDependencies(element,node);
        this.parseVariable(element,node);
        this.parseInvocation(element,node);
        this.parseContext(element,node);
        this.parseDecisionTable(element,node);
        this.parseReturnValue(element,node);
        this.parseList(element,node);
        list.push(node)
    }

    parseInvocation(element,node) {
        if (element.invocation) {
            node.type = DMNNodes.INVOCATION;
            node.functionName = element.invocation.literalExpression?.text ?? "#undefined";
            node.parameters = [];
            const bindings = Array.isArray(element.invocation.binding) ? element.invocation.binding : [element.invocation.binding];
            bindings.forEach(binding => {
                node.parameters.push({
                    name: binding.parameter._name,
                    expression: binding.literalExpression.text
                })
            });
        }
    }

    parseReturnValue(element,node) {
        if (element.literalExpression) {
            node.type = DMNNodes.RETURN;
            node.expression = String(element.literalExpression.text);
        }
    }

    parseContext(element, node) {
        if (element.context) {
            // can be deep structur
            this.parseContext(element.context,node);
            node.type = DMNNodes.CONTEXT;
            node.entries = [];
            const entries = Array.isArray(element.context.contextEntry) ? element.context.contextEntry : [element.context.contextEntry];
            // console.log(util.inspect({ start: "****", context: element.context}, { showHidden: false, depth: null, colors: true }));
            entries.forEach((entry) => {
                this.parseContextEntry(entry,node.entries);
            })
        }
    }

    parseFunctionDefinition(element,node) {
        if (element.encapsulatedLogic) {
            node.type = DMNNodes.FUNCTION;
            node.kind = element.encapsulatedLogic._kind || "not supported";
            node.parameters = [];
            if (Array.isArray(element.encapsulatedLogic.formalParameter)) {
                element.encapsulatedLogic.formalParameter.forEach(parameter => {
                    node.parameters.push({
                        name: parameter._name,
                        type: parameter._typeRef || undefined 
                    })
                })
            }
            node.expression = element.encapsulatedLogic.literalExpression?.text || null;
        }
    }

    parseDecisionTable(element,node) {
        if (element.decisionTable) {
            node.type = DMNNodes.DECISIONTABLE;
            // can be array or single -> convert to array
            const input = this.toArray(element.decisionTable.input);
            node.inputs = [];
            input.forEach((input) => {
                if (input.inputExpression) {
                    node.inputs.push({
                        //name: input.inputExpression.text || undefined,
                        name: input._inputVariable || input._label || input.inputExpression.text?.__cdata || input.inputExpression.text || undefined,
                        type: input.inputExpression._typeRef || undefined,
                        expression: input.inputExpression.text?.__cdata || input.inputExpression.text || undefined 
                    }) 
                }
            })
            // can be array or single -> convert to array
            const output = this.toArray(element.decisionTable.output);
            const length = output.length;
            node.outputs = [];
            output.forEach((output) => {
                if (output._name || output._label) {
                    node.outputs.push({
                        label: output._label || undefined,
                        name: output._name || node.variable?.name || output._label || undefined,
                        id: output._id || undefined,
                        type: output._typeRef || node.variable?.varType || undefined,
                        decisionVariable: length  === 1 ? ( node.variable?.name && (output._name || output._label) ? false : true ) : false,
                        values: output.outputValues?.text?.__cdata || output.outputValues?.text || undefined,
                        defaultValue: output.defaultOutputEntry ? output.defaultOutputEntry.text : undefined
                    }) 
                }
            })
            // single output column without decsion variable -> add as decision variable
            if (length === 1 && !node.variable) node.variable = { name: output[0]._name || output[0]._label, varType: output[0]._typeRef || undefined };
            if (node.outputs.length <= 0 && node.variable) node.outputs.push({ 
                label: node.variable.name || undefined,
                name: node.variable.name || undefined,
                type: node.variable.varType || undefined,
                decisionVariable: true,
                values: output.length > 0 ? output[0].outputValues?.text?.__cdata || output[0].outputValues?.text || undefined : undefined
            });
            // rules
            const rules = this.toArray(element.decisionTable.rule);
            // console.log(util.inspect({ start: "rules", rules}, { showHidden: false, depth: null, colors: true }));
            node.rules = [];
            rules.forEach(rule => {
                const input = this.toArray(rule.inputEntry);
                const output = this.toArray(rule.outputEntry);
                const r = {
                    inputs: input.map(element => element.text?.__cdata ? element.text.__cdata : element.text) || [],
                    outputs:output.map(element => element.text?.__cdata ? element.text.__cdata : element.text) || [],
                    annotation: rule.description ?? rule.annotationEntry?.text ?? ""
                }
                node.rules.push(r);
            })

            // hit policy
            switch ((element.decisionTable._hitPolicy || "Unique").toUpperCase()) {
                case "A":
                case "ANY": node.hitPolicy = "Any"; break;
                case "F":
                case "FIRST": node.hitPolicy = "First"; break;
                case "P":
                case "PRIORITY": node.hitPolicy = "Priority"; break;
                case "U":
                case "UNIQUE": node.hitPolicy = "Unique"; break;
                case "R":
                case "RULE ORDER": node.hitPolicy = "Rule order"; break;
                case "O":
                case "OUTPUT ORDER": node.hitPolicy = "Output order"; break;
                case "C":
                case "COLLECT": node.hitPolicy = "Collect"; break;
                case "C+": node.hitPolicy = "C+"; break;
                case "C<": node.hitPolicy = "C<"; break;
                case "C>": node.hitPolicy = "C>"; break;
                case "C#": node.hitPolicy = "C#"; break;
            }

            // aggregation function
            if (element.decisionTable._aggregation) node.aggregation = element.decisionTable._aggregation.toUpperCase();
        }
    }

    parseInputData(element,list) {
        const node = this.createNode(element);
        this.parseVariable(element,node);
        node.type = DMNNodes.INPUT;
        list.push(node);
    }

    parseBusinessKnowledgeModel(element,list) {
        const node = this.createNode(element);
        this.parseVariable(element,node);
        this.parseFunctionDefinition(element,node);
        node.type = DMNNodes.BUSINESSKNOWLEDGEMODEL;
        list.push(node);
    }

    parseList(element, node) {
        if (element.list) {
            node.type = node.type = DMNNodes.LIST;
            node.entries = []
            const list = this.toArray(element.list.literalExpression);
            if (list.length > 0) {
                node.entries =  list.map(element => String(element.text));
            }
        }
    }

    parseDecision(element,list) {
        // console.log(util.inspect(element, { showHidden: false, depth: null, colors: true }));
        const node = this.createNode(element);
        this.parseDependencies(element,node);
        this.parseVariable(element,node);
        this.parseContext(element,node);
        this.parseDecisionTable(element,node);
        this.parseReturnValue(element,node);
        this.parseList(element,node);
        list.push(node);
        // console.log(util.inspect(element, { showHidden: false, depth: null, colors: true }));
    }

    parseDependency(element) {
        function parseHref(href) {
            if (typeof href === 'string') {
                let matches = /^#(.*)/g.exec(href);
                // console.log(matches);
                return matches[1] ? matches[1] : "#undefined";
            }
            return "#undefined";
        }
        if (element.requiredInput) {
            return parseHref(element.requiredInput._href);
        }
        if (element.requiredKnowledge) {
            return parseHref(element.requiredKnowledge._href);
        }
        if (element.requiredDecision) {
            return parseHref(element.requiredDecision._href);
        }
        return "#undefined";
    }

    parseDependencies(element,node) {
        let dependencies = [];
        dependencies = dependencies.concat(this.toArray(element.informationRequirement).map(element => this.parseDependency(element)));
        dependencies = dependencies.concat(this.toArray(element.knowledgeRequirement).map(element => this.parseDependency(element))); 
        if (dependencies.length > 0) node.dependencies = dependencies
    }

    parseVariable(element,node) {
        if (element.variable) {
            node.variable = {
                name: element.variable._name || undefined,
                varType: element.variable._typeRef || undefined
            }
        }
    }

    createNode(element) {
        const node = {};
        // node.sequence = 0;
        if (element._id) node.id = element._id || null;
        if (element._name) node.name = element._name || null;
        return node;
    }

    toArray(e) {
        return  Array.isArray(e) ? e : ( e ? [e] : []);
    }
       
    parse(xmlData) {

        const obj = Parser.parse(xmlData);

        return this.parseMain(obj);
    }

    parseToObject(xmlData) {

        const obj = Parser.parse(xmlData);
        //console.log(util.inspect(obj, { showHidden: false, depth: null, colors: true }));

        return {
            id: obj.definitions?._id,
            name: obj.definitions?._name,
            node: this.parseMain(obj)
        }
    }

    parseMain(obj) {
        const node = this.createNode(obj);
        node.type = DMNNodes.MAIN;
        node.definitions = []; 

        // input data
        if (obj.definitions.inputData) {
            const models = this.toArray(obj.definitions.inputData);
            models.forEach(element => {
                this.parseInputData(element,node.definitions)
            });
        }

        // business knowledge models
        if (obj.definitions.businessKnowledgeModel) {
            const models = this.toArray(obj.definitions.businessKnowledgeModel);
            models.forEach(element => {
                this.parseBusinessKnowledgeModel(element,node.definitions);
            });
        }

        // decisions
        if (obj.definitions.decision) {
            const decisions = this.toArray(obj.definitions.decision);
            decisions.forEach(element => {
                this.parseDecision(element,node.definitions);
            });
        }

        // sort by dependencies
        const independent = [];
        const edges = []
        node.definitions.forEach(element => {
            if (element.dependencies) {
                element.dependencies.forEach(d => {
                    edges.push([d,element.id]);
                })
            } else {
                // without dependencies
                independent.push(element.id); 
            }
        });
        const sorted = independent.concat(_.tsort(edges));
        const mapped = node.definitions.map((element,index) => { return { index, sort: sorted.indexOf(element.id) }});
        mapped.sort((a,b) => a.sort > b.sort ? 1 : (a.sort < b.sort ? -1 : 0));
        node.definitions = mapped.map(element => node.definitions[element.index]);

        return node;
    }

}

module.exports = {
    Decision
}