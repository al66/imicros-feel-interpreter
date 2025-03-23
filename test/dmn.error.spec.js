"use strict";

const fs = require("fs");
const util = require('util');

const { Decision } = require("../index.js");

const decision = new Decision();

describe("Test DMN converter - error handling", () => {

    let testFile = "./assets/Camunda/With unparsable feel.dmn";

    it("it should throw an error for " + testFile, () => {
        let xmlData = fs.readFileSync(testFile).toString();
        try {
            let success = decision.parse({ xml: xmlData });
        }
        catch (error) {
            expect(error.message).toEqual("Can't parse input: input $ with error");
            // console.log(error);
        }
    });

});
