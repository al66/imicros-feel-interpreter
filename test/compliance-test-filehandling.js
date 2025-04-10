"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");


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

module.exports = {
    getTestCaseFilePaths,
    getTestFiles,
    findTests,
    buildInput,
    buildExpected
};