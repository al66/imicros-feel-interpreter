const peggy = require("peggy");

const util = require('util')
const fs = require("fs");
//const grammar =  fs.readFileSync("./lib/feel-js-feel.pegjs").toString();
const grammar =  fs.readFileSync("./lib/feel.pegjs").toString();

// console.log(grammar);

const parser = peggy.generate(grammar);
// const tree = parser.parse("This is'a name 99887 dateandtime");
//const tree = parser.parse("name with spaces + aplha - gamma *556.77/7787-30");
// const tree = parser.parse("a+2");
let tree = parser.parse("for a in c with white space  return 6 + 7");
tree = parser.parse("{a:6+5,second key: 5/8,'string key': 6}");

console.log(util.inspect(tree, { showHidden: false, depth: null, colors: true }));
