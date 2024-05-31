/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 *
 */
 "use strict";

const { XMLParser } = require("fast-xml-parser");
const Interpreter = require("./interpreter.js");
const _ = require("./lodash");
const util = require('util');
const { name } = require("../../imicros-core/lib/services/flow.js");

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
const Parser = new XMLParser(options);

const interpreter = new Interpreter();

class DMNConverter {

    convert({ node = null, xml = null }) {
        if (!node && !xml) return null;
        if (!node) {
            node = new DMNParser().parse(xml);
        }
        this.lines = [];
        this.indent = 0;
        this.lastName = [];
        this._build(node);
        this.expression = "";
        this.tab = "   ";
        this.newline = "\n";
        this.lines.forEach(line => {
            this.expression += this.tab.repeat(line.indent) + line.text;// + this.newline;
        });
        return this.expression;
    }

    convertToObject({ xml = null }) {
        if (!xml) return null;
        const parsed = new DMNParser().parseToObject(xml);
        this.lines = [];
        this.indent = 0;
        this.lastName = [];
        this._build(parsed.node);
        this.expression = "";
        this.tab = "   ";
        this.newline = "\n";
        this.lines.forEach(line => {
            this.expression += this.tab.repeat(line.indent) + line.text;// + this.newline;
        });
        return {
            id: parsed.id,
            name: parsed.name,
            expression: this.expression
        };
    }

    _build (node,context) {
        if (!node) throw new Error("Can't build empty node");
        /* istanbul ignore else */
        if (this["__"+node.type] && {}.toString.call(this["__"+node.type]) === "[object Function]") {
            return this["__"+node.type](node,context);
        } else {
            //console.log("Interpreter - missing function ", node, this.expression);
            throw new Error("Interpreter - missing function " + node.type, { node, partlyBuild: this.expression });
        }
    }
    
    __MAIN(node,context) {
        this.lines.push({ 
            indent: this.indent++, 
            text: "{\n"
        })
        node.definitions.forEach((element,index) => {
            this._build(element,{ more: (index+1) < node.definitions.length });
        })
        this.lines.push({ 
            indent: --this.indent, 
            // text: `}${this.lastName ? "." + this.lastName : ""}\n` 
            text: `}\n` 
        });
    }

    __INPUT(node,context) {
        this.lines.push({ 
            indent: this.indent, 
            text: `"${node.variable?.name ?? node.name}": ${node.variable?.name ?? node.name}${context.more ? ",\n" : "\n"}`
        });
    }

    __FUNCTION(node,context) {
        const parameterList = node.parameters.map(p => `${p.name}${p.type ? ":" + p.type : ""}`).join(",");
        this.lines.push({
            indent: this.indent, 
            text: `"${node.variable.name}": function (${parameterList}) ${node.expression}${context.more ? ",\n" : "\n"}`
        })
    }

    __INVOCATION(node,context) {
        const parameterList = node.parameters.map(p => `${p.name}: ${p.expression}`).join(",");
        this.lines.push({
            indent: this.indent, 
            text: `"${node.variable.name}": ${node.functionName}(${parameterList})${context.more ? ",\n" : "\n"}`
        })
    }

    __RETURN(node,context) {
        this.lastName[this.lastName.length - 1] = node.variable?.name || "__return";
        this.lines.push({
            indent: this.indent, 
            text: `"${this.lastName[this.lastName.length - 1]}": ${node.expression}${context.more ? ",\n" : "\n"}`
        })
    }
   
    __CONTEXT(node,context) {
        this.lastName.push("");
        this.lines.push({ 
            indent: this.indent++, 
            text: `"${node.variable.name}": {\n`
        });
        node.entries.forEach((element,index) => {
            this._build(element,{ more: (index+1) < node.entries.length });
        })
        this.lines.push({ 
            indent: --this.indent, 
            text: `}${this.lastName[this.lastName.length - 1] ? "." + this.lastName[this.lastName.length - 1] : ""}${context.more ? "," : ""}\n` 
        });
        this.lastName.pop();
    }

    __DECISIONTABLE(node,context) {
        function checkList(p) {
            if (typeof p === 'string') {
                // check for unary tests list --> must be framed with brackets as a list
                interpreter.parse(p);
                const element = interpreter.ast;
                // console.log(util.inspect({ p , element}, { showHidden: false, depth: null, colors: true }));
                if (interpreter.ast && Array.isArray(interpreter.ast) && interpreter.ast[0]?.node === "UNARYTESTS") return `[${p}]`;

                // empty string --> dash
                if (p.length === 0) return "-";
            }
            return p;
        }
        // function start
        this.lines.push({ 
            indent: this.indent++, 
            text: `"${node.variable?.name ?? node.name}": decision table(\n`
        });
        // inputs
        const inputs = node.inputs.map(p => `${p.name}`).join(",");
        this.lines.push({ 
            indent: this.indent, 
            text: `inputs: [${inputs}],\n`
        });
        // outputs
        const outputs = node.outputs.map(p => `"${p.name}"`).join(",");
        this.lines.push({ 
            indent: this.indent, 
            text: `outputs: [${outputs}],\n`
        });
        // rule list
        this.lines.push({ 
            indent: this.indent++, 
            text: `rule list: [\n`
        });
        node.rules.forEach((rule,index) => {
            const arr = rule.inputs.map(p => `${checkList(p)}`).concat(rule.outputs.map(p => `${p}`)).join(",");
            this.lines.push({ 
                indent: this.indent, 
                text: `[${arr}]${(index + 1) < node.rules.length ? "," : ""}${rule.annotation ? " // " + rule.annotation : "" }\n`
            });
        });
        this.lines.push({ 
            indent: --this.indent, 
            text: `],\n`
        });
        // hit policy
        this.lines.push({ 
            indent: this.indent, 
            text: `hit policy: "${node.hitPolicy}"\n`
        });
        // function end
        this.lines.push({ 
            indent: --this.indent, 
            text: `)${node.outputs.length === 1 ? "." + node.outputs[0].name : ""}${context.more ? ",\n" : "\n"}`
        });
    }

}

class DMNNodes {
    static get MAIN() { return "MAIN"; }
    static get INPUT() { return "INPUT"; }
    static get INVOCATION() { return "INVOCATION"; }
    static get CONTEXT() { return "CONTEXT"; }
    static get FUNCTION() { return "FUNCTION"; }
    static get DECISIONTABLE() { return "DECISIONTABLE"; }
    static get RETURN() { return "RETURN"; }
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
            node.expression = element.literalExpression.text;
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
                        name: input.inputExpression.text || undefined,
                        type: input.inputExpression._typeRef || undefined 
                    }) 
                }
            })
            // can be array or single -> convert to array
            const output = this.toArray(element.decisionTable.output);
            node.outputs = [];
            output.forEach((output) => {
                if (output._name) {
                    node.outputs.push({
                        name: output._name || undefined,
                        type: output._typeRef || undefined 
                    }) 
                }
            })
            if (node.outputs.length <= 0 && node.variable) node.outputs.push(node.variable);
            // rules
            const rules = this.toArray(element.decisionTable.rule);
            // console.log(util.inspect({ start: "rules", rules}, { showHidden: false, depth: null, colors: true }));
            node.rules = [];
            rules.forEach(rule => {
                const input = this.toArray(rule.inputEntry);
                const output = this.toArray(rule.outputEntry);
                const r = {
                    inputs: input.map(element => element.text) || [],
                    outputs:output.map(element => element.text) || [],
                    annotation: rule.annotationEntry?.text ?? ""
                }
                node.rules.push(r);
            })

            // hit policy
            switch ((element.decisionTable._hitPolicy || "Unique").toUpperCase()) {
                case "A":
                case "ANY": node.hitPolicy = "Any"; break;
                case "F":
                case "FIRST": node.hitPolicy = "First"; break;
                case "U":
                case "UNIQUE": node.hitPolicy = "Unique"; break;
                case "R":
                case "RULE ORDER": node.hitPolicy = "Rule order"; break;
                case "C":
                case "COLLECT": node.hitPolicy = "Collect"; break;
                case "C+": node.hitPolicy = "C+"; break;
                case "C<": node.hitPolicy = "C<"; break;
                case "C>": node.hitPolicy = "C>"; break;
                case "C#": node.hitPolicy = "C#"; break;
            }
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
        list.push(node);
    }

    parseDecision(element,list) {
        // console.log(util.inspect(element, { showHidden: false, depth: null, colors: true }));
        const node = this.createNode(element);
        this.parseDependencies(element,node);
        this.parseVariable(element,node);
        this.parseContext(element,node);
        this.parseDecisionTable(element,node);
        this.parseReturnValue(element,node);
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
                type: element.variable._typeRef || undefined
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
        console.log(util.inspect(obj, { showHidden: false, depth: null, colors: true }));

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
    DMNParser,
    DMNConverter
}