/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 */
 "use strict";

 module.exports = {
     Interpreter: require("./lib/interpreter.js"),
     DMNConverter: require("./lib/converter.js").DMNConverter,
     DMNParser: require("./lib/converter.js").DMNParser
 };