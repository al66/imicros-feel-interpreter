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

function buildInput({ result = {}, node, name, testFile = {}, testCase = {} })  {
    // no inpput node
    if (node === undefined || node === null) return result;
    // multiple input nodes...
    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
            buildInput({ result, node: node[i], name, testFile, testCase });
        }
        return result;
    };
    if (node._name) name = node._name;
    if (node.value?._nil) {
        result[name] = null;
    } else if (node.value?._type === "xsd:decimal") {
        result[name] = parseFloat(node.value["#text"]);
    } else if (node.value?._type === "xsd:boolean") {
        result[name] = node.value["#text"] === "true" || node.value["#text"] === true ? true : false;
    } else if (node.value?._type === "xsd:date") {
        result[name] = node.value["#text"];
    } else if (node.value?._type === "xsd:string") {
        result[name] = node.value["#text"] ? String(node.value["#text"]) : "";
    } else if (node.value?.hasOwnProperty("#text")) {
        result[name] = node.value["#text"];
    } else if (node.list) {
        let items = toArray(node.list.item);
        let list = [];
        for (let i = 0; i < items.length; i++) {
            const item = buildInput({ result: {}, node: items[i], name: i, testFile, testCase });
            list.push(item[i]);
        }
        result[name] = list;
    } else if (node.list === "") {
        result[name] = [];
    } else if (node.component) {
        let context = {};
        let component = toArray(node.component);
        for (let i = 0; i < component.length; i++) {
            buildInput({ result: context, node: component[i], name, testFile, testCase });
        }
        result[name] = context;
        //console.log("Context: ", context);
    } else {
        console.log("Build input failed: ", result, node, name, testFile.test, testCase.description || testCase._id );
    }
    return result;
}


function buildExpected({ result = {}, node, name, testFile = {}, testCase = {} })  {
    // special case: multiple result nodes...
    if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i++) {
            buildExpected({ result, node: node[i], name, testFile, testCase });
        }
        return result;
    };
    if (node._name) name = node._name;
    if (node.expected) {
        let expected = toArray(node.expected);
        for (let i = 0; i < expected.length; i++) {
            buildExpected({ result, node: expected[i], name, testFile, testCase });
        }
    } else if (node.value?._nil) {
        result[name] = null;
    } else if (node.value?._type === "xsd:decimal") {
        result[name] = parseFloat(node.value["#text"]);
    } else if (node.value?._type === "xsd:boolean") {
        result[name] = node.value["#text"] === "true" || node.value["#text"] === true ? true : false;
    } else if (node.value?._type === "xsd:date") {
        result[name] = node.value["#text"];
    } else if (node.value?._type === "xsd:string") {
        result[name] = node.value["#text"] ? String(node.value["#text"]) : "";
    } else if (node.value?.hasOwnProperty("#text")) {
        result[name] = node.value["#text"];
    } else if (node.list) {
        let items = toArray(node.list.item);
        let list = [];
        for (let i = 0; i < items.length; i++) {
            const item = buildExpected({ result: {}, node: items[i], name: i, testFile, testCase });
            list.push(item[i]);
        }
        result[name] = list;
    } else if (node.list === "") {
        result[name] = [];
    } else if (node.component) {
        let context = {};
        let component = toArray(node.component);
        for (let i = 0; i < component.length; i++) {
            buildExpected({ result: context, node: component[i], name, testFile, testCase });
        }
        result[name] = context;
        //console.log("Context: ", context);
    } else {
        console.log("Build expected failed: ", result, node, name, testFile.test, testCase.description || testCase._id );
    }
    return result;
}

const specialPrecisionCases = [
    {
        test: "0008-LX-arithmetic-test-01.xml",
        precision: 10
    },{
        test: "0009-invocation-arithmetic-test-01.xml",
        precision: 10
    },{
        test: "0052-feel-exp-function-test-01.xml",
        precision: 8
    },{
        test: "0005-literal-invocation-test-01.xml",
        precision: 10
    },{
        test: "0008-LX-arithmetic-test-01.xml",
        precision: 13
    },{
        test: "0012-list-functions-test-01.xml",
        precision: 14
    },{
        test: "0005-literal-invocation-test-01.xml",
        precision: 12
    },{
        test: "0063-feel-stddev-function-test-01.xml",
        precision: 12
    },{
        test: "0053-feel-log-function-test-01.xml",
        precision: 8
    },{
        test: "0100-arithmetic-test-01.xml",
        precision: 10
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