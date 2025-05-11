"use strict";

// get all test cases from folder TestCases from repository https://github.com/dmn-tck/tck.git
const fs = require("fs");
const { XMLParser } = require("fast-xml-parser");
const { Decision } = require("../index.js");
const util = require("util");
const {
    getTestFiles,
    buildInput,
    buildExpected,
    getPrecision,
    reduceResultPrecision } = require("./compliance-test-util.js");

const options = {
    attributeNamePrefix: "_",
    removeNSPrefix: true,
    ignoreAttributes: false,
    ignoreNameSpace: false,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: false,
    cdataTagName: "__cdata", //default is 'false'
    cdataPropName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false
    //    attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
    //    tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
    // stopNodes: ["dmndi:DMNDI"] ...doesn't work...
};

const Parser = new XMLParser(options);

const tck = [
    {
        folder: "TestCases/compliance-level-2",
        description: "Compliance level 2",
        skip: [
            //"0001-input-data-string",
            //"002-input-data-number",
            //"0003-input-data-string-allowed-values",
            //"0004-simpletable-U",
            //"0005-simpletable-A",
            //"0006-simpletable-P1",
            //"0007-simpletable-P2",
            //"0008-LX-arithmetic",             
            //"0009-invocation-arithmetic",           
            //"0010-multi-output-U",
            //"0100-feel-constants",
            //"0101-feel-constants",
            //"0102-feel-constants",
            //"0105-feel-math",
            //"0106-feel-ternary-logic",
            //"0107-feel-ternary-logic-not",
            //"0108-first-hitpolicy",
            //"0109-ruleOrder-hitpolicy",
            //"0110-outputOrder-hitpolicy",             
            //"0111-first-hitpolicy-singleoutputcol",
            //"0112-ruleOrder-hitpolicy-singleinoutcol",    
            //"0113-outputOrder-hitpolicy-singleinoutcol",    
            //"0114-min-collect-hitpolicy",
            //"0115-sum-collect-hitpolicy",
            //"0116-count-collect-hitpolicy",
            //"0117-multi-any-hitpolicy",
            //"0118-multi-priority-hitpolicy",
            //"0119-multi-collect-hitpolicy"
        ],
        skipCases: {
            //"0008-LX-arithmetic": [1,2,3],          // tck calulation is not correct - we get same results as Camunda (calculating internally with a high precision)
            //"0009-invocation-arithmetic": [1,2,3],  // tck calulation is not correct - we get same results as Camunda (calculating internally with a high precision)
            //"0057-feel-context": [5,6,7]
        },
        analyse: {
            //"0113-outputOrder-hitpolicy-singleinoutcol": [2]
        }
    },
    {
        folder: "TestCases/compliance-level-3",
        description: "Compliance level 3",
        skip: [
            //"0001-filter",
            //"0002-string-functions",
           // "0003-iteration",
            //"0004-lending",
            //"0005-literal-invocation",            
            //"0006-join",
            //"0007-date-time",
            //"0008-listGen",
            //"0009-append-flatten",
            //"0010-concatenate",
            //"0011-insert-remove",
            //"0012-list-functions",
            //"0013-sort",
            //"0014-loan-comparison",
            "0016-some-every",
            //"0017-tableTests",
            //"0020-vacation-days",             
            //"0021-singleton-list",
            //"0030-user-defined-functions",
            "0031-user-defined-functions",
            "0032-conditionals",
            "0033-for-loops",
            "0034-drg-scopes",
            "0035-test-structure-output",
            //"0036-dt-variable-input",
            "0037-dt-on-bkm-implicit-params",
            "0038-dt-on-bkm-explicit-params",
            "0039-dt-list-semantics",
            "0040-singlenestedcontext",
            "0041-multiple-nestedcontext",
            //"0050-feel-abs-function",
            //"0051-feel-sqrt-function",
            //"0052-feel-exp-function",
            //"0053-feel-log-function",                    
            //"0054-feel-even-function",
            //"0055-feel-odd-function",
            //"0056-feel-modulo-function",                
            "0057-feel-context",
            //"0058-feel-number-function",                
            "0059-feel-all-function",
            "0060-feel-any-function",
            //"0061-feel-median-function",
            //"0062-feel-mode-function",              
            //"0063-feel-stddev-function",          
            "0064-feel-conjunction",
            "0065-feel-disjunction",
            //"0066-feel-negation",
            "0067-feel-split-function",
            "0068-feel-equality",
            "0069-feel-list",
            "0070-feel-instance-of",                    //<<<<<<<<<<<<<< 39 failed test
            "0071-feel-between",
            "0072-feel-in",
            //"0073-feel-comments",
            "0074-feel-properties",
            //"0075-feel-exponent",           
            "0076-feel-external-java",
            "0077-feel-nan",
            "0078-feel-infinity",
            "0080-feel-getvalue-function",
            "0081-feel-getentries-function",
            "0082-feel-coercion",
            "0083-feel-unicode",
            "0084-feel-for-loops",
            "0085-decision-services",
            "0086-import",
            "0087-chapter-11-example",
            "0088-no-decision-logic",
            "0089-nested-inputdata-imports",
            "0090-feel-paths",
            "0091-local-hrefs",
            "0092-feel-lambda",
            //"0093-feel-at-literals",
            //"0094-feel-product-function",         
            //"0095-feel-day-of-year-function",     
            //"0096-feel-day-of-week-function",           
            //"0097-feel-month-of-year-function",                 
            //"0098-feel-week-of-year-function",              
            //"0099-arithmetic-negation",     
            "0100-arithmetic",                      // long running test!!
            "0103-feel-is-function",
            //"1100-feel-decimal-function",                 
            //"1101-feel-floor-function",             
            //"1102-feel-ceiling-function",              
            //"1103-feel-substring-function",       
            //"1104-feel-string-length-function",         
            //"1105-feel-upper-case-function",
            //"1106-feel-lower-case-function",
            //"1107-feel-substring-before-function",   
            //"1108-feel-substring-after-function",          
            //"1109-feel-replace-function",       
            //"1110-feel-contains-function",            
            "1111-feel-matches-function",                   //<<<<<<<<<<<<<< 31 failed tests
            //"1115-feel-date-function",
            //"1116-feel-time-function",
            //"1117-feel-date-and-time-function",
            //"1120-feel-duration-function",                
            //"1121-feel-years-and-months-duration-function",
            "1130-feel-interval",
            "1131-feel-function-invocation",
            "1140-feel-string-join-function",               //<<<<<<<<<<<<<< 12 failed tests
            //"1141-feel-round-up-function",                   
            //"1142-feel-round-down-function",                   
            //"1143-feel-round-half-up-function",              
            //"1144-feel-round-half-down-function",              
            "1145-feel-context-function",
            "1146-feel-context-put-function",
            "1147-feel-context-merge-function",
            //"1148-feel-now-function",
            //"1149-feel-today-function",
            "1150-boxed-conditional",
            "1151-boxed-filter",
            "1152-boxed-for",
            "1153-boxed-some",
            "1154-boxed-every",
            "1155-list-replace-function",
            "1156-range-function"
        ],
        skipCases: {
            "0057-feel-context": [5,6,7],                   // field names with special characters ([]) are not supported
            "0099-arithmetic-negation": ["decision_012"],    // -(function(a) a)(10)  is an unvalid (and senseless) expresssion...
            "0100-arithmetic": ["subtract_lhs_date_minus_rhs_dateAndTime_002",  // date minus date and time not defined according spec -> null
                                "subtract_lhs_date_minus_rhs_dateAndTime_003",  // date minus date and time not defined according spec -> null      
                                "subtract_lhs_date_minus_rhs_dateAndTime_004",  // date minus date and time not defined according spec -> null
                                "subtract_lhs_date_minus_rhs_dateAndTime_005",  // date minus date and time not defined according spec -> null
                                "subtract_lhs_dateAndTime_minus_rhs_date_002",  // date and time minus date not defined according spec -> null
                                "subtract_lhs_dateAndTime_minus_rhs_date_003",  // date and time minus date not defined according spec -> null
                                "subtract_lhs_dateAndTime_minus_rhs_date_004",  // date and time minus date not defined according spec -> null
                                "subtract_lhs_dateAndTime_minus_rhs_date_005",  // date and time minus date not defined according spec -> null
                                ]  
        },
        analyse: {
            //"0099-arithmetic-negation": ["decision_012"],
            //"0062-feel-mode-function": [8]
            //"0058-feel-number-function": [13]
            //"0063-feel-stddev-function": [9],
            //"0061-feel-median-function": [8]
            //"0051-feel-sqrt-function": [2]
            //"0005-literal-invocation": [3]
            //"0012-list-functions": [5],
            //"0020-vacation-days": [1]
            //"1116-feel-time-function": ["feel-time-function_083_6b608254c7"]
            //"0096-feel-day-of-week-function": ["date_001"]
            //"0098-feel-week-of-year-function": ["date_008"],
            //"0095-feel-day-of-year-function": ["datetime_004"]
            //"0017-tableTests": [3],
        }
    }
];

describe("Test DMN compliance", () => {

    describe.each(tck)("$description", (single) => {

        let testFiles = getTestFiles(single.folder);
        testFiles = testFiles.filter((testFile) => {
            const match = testFile.dir.match(/([^\\/]+)[\\/]*$/);
            let dir = match ? match[1] : null;
            return !single.skip.includes(dir);
        });

        it("should clone the repository and get test case file paths", () => {
            expect(testFiles).toBeDefined();
            expect(testFiles.length > 0).toEqual(true);

        });

        describe.each(testFiles)("Test file $test", (testFile) => {

            let xmlDataTestCases = fs.readFileSync(testFile.test).toString();
            let testCases = Parser.parse(xmlDataTestCases);
            let xmlData = fs.readFileSync(testFile.dir + testCases.testCases.modelName).toString();

            // get path for test case exceptions
            const match = testFile.dir.match(/([^\\/]+)[\\/]*$/);
            let dir = match ? match[1] : null;

            const decision = new Decision();

            for (let i = 0; i < testCases.testCases.testCase.length; i++) {
                let testCase = testCases.testCases.testCase[i];
                // skip single test cases
                if (single.skipCases[dir]?.indexOf(testCase._id) > -1) continue;
                test("Test case: " + (testCase.description || testCase._id), () => {
                    let result = null;
                    let success = decision.parse({ xml: xmlData });
                    expect(success).toEqual(true);
                    let input = buildInput(testCase.inputNode);
                    let expected = buildExpected(testCase.resultNode);
                    expect(expected).toBeDefined();

                    let analyse = Object.keys(single.analyse).includes(dir);
                    if (analyse && single.analyse[dir]?.indexOf(testCase._id) > -1) {
                       console.log(util.inspect(decision.getAst(), { showHidden: false, depth: null }));
                        console.log(util.inspect(input, { showHidden: false, depth: null }));
                        result = decision.analyse({ data: input, decision: testCase.resultNode?._name });
                        console.log(util.inspect(result, { showHidden: false, depth: null }));
                        result = result?.result ?? null;
                    } else {
                        result = decision.evaluate({ data: input, decision: testCase.resultNode?._name });
                    }
                    // Get precision for the current test file
                    const precision = getPrecision(testFile);
                    // Reduce result precision
                    result = reduceResultPrecision(result, precision);
                    // Reduce expected precision
                    expected = reduceResultPrecision(expected, precision);
                    // Assert the result matches the expected value
                    expect(result).toEqual(expected);
                });
            }
        });

    });

});
