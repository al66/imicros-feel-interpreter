"use strict";

const fs = require("fs");
const util = require('util');

const { Interpreter } = require("../index.js");

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
            if (file.endsWith(".feel.examples.js")) {
                filelist.push(dir + "/" + file);
            }
        }
    });
    return filelist;
};


describe("Test FEEL interpreter", () => {

    let testFiles = findTests("./assets/FEEL");

    describe.each(testFiles)("%s", (testFile) => {
        let { tests } = require("../" + testFile);
        for (let j=0; j<tests.length; j++) {
            let test = tests[j];
            let objDescription = { expression: test.expression, data:  test.data, result: test.result};
            let description = util.inspect(objDescription , { showHidden: false, depth: null, colors: true, breakLength: Infinity });
            if (description.length > 300) description = util.inspect(objDescription , { showHidden: false, depth: null, colors: true, breakLength: 80 });
            it(description, () => {
                    const interpreter = new Interpreter();
                    if (test.analyse) interpreter.logger.activate();
                    let result = interpreter.evaluate(test.expression,test.data);
                    if (test.analyse) console.log(util.inspect(interpreter.getAst(), { showHidden: false, depth: null, colors: true, breakLength: 80 }));
                    if (test.analyse) console.log(util.inspect(interpreter.logger.getLog(), { showHidden: false, depth: null, colors: true, breakLength: 80 }));
                    interpreter.logger.deactivate();
                    expect(result).toEqual(test.result);
                });
            };
    });

});
