"use strict";

// get all test cases from folder TestCases from repository https://github.com/dmn-tck/tck.git
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { XMLParser } = require("fast-xml-parser");
const { Decision } = require("../index.js");
const util = require("util");

const options = {
    attributeNamePrefix: "_",
    removeNSPrefix: true,
    ignoreAttributes: false,
    ignoreNameSpace: false,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
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

let findTests = function (dir, filelist) {
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(dir + "/" +
            file).isDirectory()) {
            filelist = findTests(dir + "/" + file, filelist);
        } else {
            if (file.match(/.*-test-\d+.xml$/)) {
                filelist.push({
                    dir : dir + "/",
                    test: dir + "/" + file/*,
                    dmn: dir + "/" + file.replace(".test.js","")*/
                });
            }
        }
    });
    return filelist;
};


function getTestCaseFilePaths(repoUrl, folderName) {
    const repoName = "tck"; // Extracted repository name
    const clonePath = path.join("comliance", repoName);

    // Clone the repository if it doesn't already exist
    if (!fs.existsSync(clonePath)) {
        console.log("Cloning repository... " + `git clone ${repoUrl} ${clonePath}`);
        execSync(`git clone ${repoUrl} ${clonePath}`, { stdio: "inherit" });
    }

    const testCasesPath = path.join(clonePath, folderName);

    // Check if the TestCases folder exists
    if (!fs.existsSync(testCasesPath)) {
        throw new Error(`Folder "${folderName}" not found in the repository.`);
    }

    console.log("TestCases folder found at: " + testCasesPath);

    let testFiles = findTests(testCasesPath);
    console.log("Testfiles found: " + testFiles.length);

    return testFiles;
}

function getTestFiles() {
    try {
        const repoUrl = "https://github.com/dmn-tck/tck.git";
        //const folderName = "TestCases/compliance-level-2";
        const folderName = "TestCases/compliance-level-2/0005-simpletable-A";
        //const folderName = "TestCases/compliance-level-2/0006-simpletable-P1";
        const filePaths = getTestCaseFilePaths(repoUrl, folderName);
        return filePaths;
    } catch (error) {
        console.error("Error:", error.message);
    }
}

function toArray( value ) {
    return Array.isArray(value) ? value : ( value ? [value] : [] );
}

function buildInput( node ) {
    const inputs = toArray(node);
    let input = {};
    inputs.forEach((node) => {
        let name = node._name;
        let value = node.value;
        if (value["#text"]) {
            input[name] = value["#text"];
        }
    });
    return input;
}

function buildExpected( node ) {
    const results = toArray(node);
    let result = {};
    results.forEach((node) => {
        let expected = toArray(node.expected);
        expected.forEach((single) => {
            let name = node._name;
            let value = single.value;
            if (value._nil) {
                result[name] = null;
            }
            if (value["#text"]) {
                result[name] = value["#text"];
            }
        });
    });
    return result;
}

describe("Test DMN compliance", () => {

    describe(" Compliance level 2", () => {

        let testFiles = getTestFiles();
        let stop = -1;

        it("should clone the repository and get test case file paths", () => {
            expect(testFiles).toBeDefined();
            expect(testFiles.length > 0).toEqual(true);

        });

        describe.each(testFiles)("Test file: $test", (testFile) => {

            let xmlDataTestCases = fs.readFileSync(testFile.test).toString();
            let testCases = Parser.parse(xmlDataTestCases);
            let xmlData = fs.readFileSync(testFile.dir+testCases.testCases.modelName).toString();
            //console.log("testCases: ", testCases);

            const decision = new Decision();

            for (let i = 0; i < testCases.testCases.testCase.length; i++) {
                let testCase = testCases.testCases.testCase[i];
                if (stop > -1) {
                    // break;
                }
                stop = i;
                test("Test case: "+ (testCase.description || testCase._id), () => {
                    let success = decision.parse({ xml: xmlData, decision: testCase.resultNode?._name });
                    //console.log("decsion: ", testCase.resultNode?._name);
                    expect(success).toEqual(true);
                    //console.log(util.inspect(testCase, { showHidden: false, depth: null }));
                    let input = buildInput(testCase.inputNode);
                    let expected = buildExpected(testCase.resultNode);
                    expect(expected).toBeDefined();
                    //console.log(util.inspect(testCase.inputNode, { showHidden: false, depth: null }));
                    //console.log(util.inspect(input, { showHidden: false, depth: null }));
                    //console.log(util.inspect(expected, { showHidden: false, depth: null }));
                    //console.log("testCase: ", testCase);
                    //console.log(util.inspect(decision.getAst(), { showHidden: false, depth: null }));
                    let result = decision.evaluate(input);
                    //console.log("result: ", result);
                    //console.log(util.inspect(result, { showHidden: false, depth: null }));
                    expect (result).toEqual(expected);
                    stop = -1;
                });
            }
        });

    });

});
