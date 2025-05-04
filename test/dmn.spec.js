"use strict";

const fs = require("fs");
const util = require('util');

const { Decision } = require("../index.js");

const decision = new Decision();

// get all test files in assets and subfolders
let testFiles = [];
let findTests = function(dir, filelist) {    
    let files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + "/" +
            file).isDirectory()) {
            filelist = findTests(dir + "/" + file, filelist);
        } else {
            if (file.endsWith(".dmn.test.js")) {
                filelist.push({
                    test: dir + "/" + file,
                    dmn: dir + "/" + file.replace(".test.js","")
                });
            }
        }
    });
    return filelist;
};


describe("Test DMN converter", () => {

    let testFiles = findTests("./assets");

    for (let i=0; i<testFiles.length; i++) {
        let testFile = testFiles[i];
        let xmlData = fs.readFileSync(testFile.dmn).toString();
        let { tests } = require("../" + testFile.test);
        for (let j=0; j<tests.length; j++) {
            let test = tests[j];
            it("it should evaluate " + testFile.dmn + " - " + test.case, () => {
                let success = decision.parse({ xml: xmlData });
                expect(success).toEqual(true);
                decision.setAst(JSON.parse(JSON.stringify(decision.getAst()))); // clone
                if (test.analyse) {
                    console.log(util.inspect(decision.getAst(), { showHidden: false, depth: null, colors: true }));
                    let result = decision.analyse({ data: structuredClone(test.data), decision: test.decision });
                    console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
                    console.log(util.inspect(result.result, { showHidden: false, depth: null, colors: true }));
                    console.log(util.inspect(test.result, { showHidden: false, depth: null, colors: true }));
                    expect(result.result).toEqual(test.result);
                } else {
                    let result = decision.evaluate({ data: structuredClone(test.data), decision: test.decision });
                    expect(result).toEqual(test.result);
                }
            });
        };
    }

});
