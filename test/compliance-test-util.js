"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const { create, all } = require('mathjs');
const bigmath = create(all, {
    number: 'BigNumber', // Choose 'number' (default), 'BigNumber', or 'Fraction'
    precision: 64 // Number of significant digits for BigNumbers
})

const { Temporal } = require("../lib/datetime.js");

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
                    test: dir + "/" + file
                });
            }
        }
    });
    return filelist;
};


function getTestCaseFilePaths(repoUrl, folderName) {
    const repoName = "tck"; // Extracted repository name
    const clonePath = path.join("./", repoName);
    let tckFolder;

    try {
        // Check if the repository is already cloned (name on github differs from local folder name)
        tckFolder = findSubfolderStartingWithTck("./");
    } catch (error) {
    }

    // Clone the repository if it doesn't already exist
    if (!fs.existsSync(clonePath) && !tckFolder) {
        console.log("Cloning repository... " + `git submodule add ${repoUrl} ${clonePath}`);
        execSync(`git submodule add  --force ${repoUrl} ${clonePath}`, { stdio: "inherit" });
    } else {
        execSync(`git submodule update --init --recursive`, { stdio: "inherit" });
    }

   tckFolder = findSubfolderStartingWithTck("./");
   const testCasesPath = path.join(tckFolder, folderName);

    // Check if the TestCases folder exists
    if (!fs.existsSync(testCasesPath)) {
        throw new Error(`Folder "${folderName}" not found in the repository.`);
    }

    console.log("TestCases folder found at: " + testCasesPath);

    let testFiles = findTests(testCasesPath);
    console.log("Testfiles found: " + testFiles.length);

    return testFiles;
}

function getTestFiles(folderName) {
    try {
        const repoUrl = "https://github.com/dmn-tck/tck.git";
        const filePaths = getTestCaseFilePaths(repoUrl, folderName);
        return filePaths;
    } catch (error) {
        console.error("Error:", error.message);
    }
}

function findSubfolderStartingWithTck(directory) {
    const subfolders = fs.readdirSync(directory, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith("tck"))
        .map(dirent => dirent.name);

    if (subfolders.length === 0) {
        throw new Error(`No subfolder starting with "tck" found in directory: ${directory}`);
    }
    return subfolders[0]; // Return the first matching subfolder
}

function toArray( value ) {
    return Array.isArray(value) ? value : ( value ? [value] : [] );
}

function buildValue( context, name, value ) {
    if (value._nil) {
        context[name] = null;
    } else if (value._type === "xsd:decimal") {
        context[name] = parseFloat(value["#text"]);
    } else if (value._type === "xsd:date") {
        //context[name] = Temporal.parse(String(value["#text"]));
        context[name] = value["#text"];
    } else if (value._type === "xsd:string") {
        context[name] = value["#text"] ? String(value["#text"]) : "";
    } else if (value.hasOwnProperty("#text")) {
        context[name] = value["#text"];
    } else {
        console.log("Build value failed: ", name, value);
    }
}

function buildInput( node ) {
    const inputs = toArray(node);
    let input = {};
    inputs.forEach((node) => {
        let name = node._name;
        if(node.value) {
            buildValue(input, name, node.value);
        } else if(node.component) {
            let component = toArray(node.component);
            let components = {};
            for (let i = 0; i < component.length; i++) {
                let name = component[i]._name;
                let value = component[i].value;
                buildValue(components, name, value);
            }
            input[name] = components;
            //input["__print"] = true;
        } else if (node.list) {
            let items = toArray(node.list.item);
            let list = [];
            for (let i = 0; i < items.length; i++) {
                let name = items[i]._name;
                let value = items[i].value;
                let item = {};
                buildValue(item, name, value);
                list.push(item[name]);
            }
            input[name] = list;
        }
    });
    if (input["__print"]) {
        delete input["__print"];
        console.log("INPUT: ", input);
    }
    return input;
}

function buildExpected( node ) {
    const resultNodeName = node._name;
    const results = toArray(node);
    let result = {};
    let expected = {};
    results.forEach(() => {
        let expected = toArray(node.expected);
        expected.forEach((single) => {
            let name = node._name || resultNodeName;
            if (single.value) {
                buildValue(result, name, single.value);
            } else if (single.component) {
                let component = toArray(single.component);
                for (let i = 0; i < component.length; i++) {
                    let name = component[i]._name;
                    let value = component[i].value;
                    buildValue(result, name, value);
                }
            } else if (single.list) {
                let items = toArray(single.list.item);
                let list = [];
                for (let i = 0; i < items.length; i++) {
                    let components = toArray(items[i].component);
                    if (components.length > 0) {
                        let item = {};
                        for (let j = 0; j < components.length; j++) {
                            let name = components[j]._name;
                            let value = components[j].value;
                            buildValue(item, name, value);
                        }
                        list.push(item);
                    } else {
                        let name = items[i]._name;
                        let value = items[i].value;
                        let item = {};
                        buildValue(item, name, value);
                        list.push(item[name]);
                    }
                }
                result[name] = list;
            } else if (single.list === "") {
                result[name] = [];
            }
        });
    });
    //expected[resultNodeName] = result;
    expected = result;
    return expected;
}

const specialPrecisionCases = [
    {
        test: "0052-feel-exp-function-test-01.xml",
        precision: 8
    },
    {
        test: "0005-literal-invocation-test-01.xml",
        precision: 10
    },
    {
        test: "0008-LX-arithmetic-test-01.xml",
        precision: 13
    },
    {
        test: "0012-list-functions-test-01.xml",
        precision: 14
    },
    {
        test: "0005-literal-invocation-test-01.xml",
        precision: 12
    }
];

function getPrecision(testFile) {
    const normalizedPath = testFile.test.replace(/\\/g, "/");
    const fileName = normalizedPath.split("/").pop();
    // Find a matching special case
    const specialCase = specialPrecisionCases.find((e) => e.test === fileName);
    // Return the precision for the special case or default to 15
    return specialCase?.precision || 15;
}

function reduceResultPrecision(obj,precision) {
    if (Array.isArray(obj)) {
        return obj.map((e) => reduceResultPrecision(e,precision)); // Recursively handle arrays
    } else if (obj && typeof obj === "object") {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            acc[key] = reduceResultPrecision(value,precision); // Recursively handle objects
            return acc;
        }, {});
    } else if (typeof obj === "number") {
        //const mult = 10 ** 14;
        //return bigmath.floor(obj * mult) / mult; // Reduce precision to 8 decimal places
        return bigmath.round(obj,precision); // Reduce precision to 8 decimal places
    }
    return obj; // Return the value as is if no substitution is needed
}


module.exports = {
    getTestCaseFilePaths,
    getTestFiles,
    findTests,
    buildInput,
    buildExpected,
    getPrecision,
    reduceResultPrecision
};