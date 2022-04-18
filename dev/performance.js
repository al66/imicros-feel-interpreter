const Interpreter = require("../lib/interpreter.js");

const interpreter = new Interpreter();

console.log("=============== Expression =================");
let exp = "if even(i) then (i*a) else (i*b)";
console.log(exp);

console.log("=============== pure Javascript ==============")

const tsRef = new Date(); 
let resultsRef = [];
for (let i = 0; i< 10000; i++ ) {
    let data = {i,a:3,b:5};
    resultsRef.push({ i, result: data.i % 2 == 0 ? data.i*data.a : data.i*data.b });
}

const teRef = new Date();
console.log("finished pure javascript", teRef - tsRef);
console.log(resultsRef.length);
console.log(resultsRef[resultsRef.length-2]);
console.log(resultsRef[resultsRef.length-1]);
/*
finished pure javascript 7
10000
{ i: 9998, result: 29994 }
{ i: 9999, result: 49995 }
*/

console.log("=============== single parse / reuse ast ==============")

interpreter.parse(exp)
let serialized = JSON.stringify(interpreter.ast);

const ts_single = new Date(); 
let resultsSingle = [];
interpreter.ast = JSON.parse(serialized);
for (let i = 0; i< 10000; i++ ) {
    let result = interpreter.evaluate({i,a:3,b:5});
    resultsSingle.push({ i, result});
}
const te_single = new Date(); 
console.log("finished single parse / reuse ast", te_single - ts_single);
// about 50 ms -> 0,005 ms per evaluation on levono T540p laptop with windows 10 ~ about 200.000 evaluations per second => not bad
console.log(resultsSingle.length);
console.log(resultsSingle[resultsSingle.length-2]);
console.log(resultsSingle[resultsSingle.length-1]);
/*
finished single parse / reuse ast 46
10000
{ i: 9998, result: 29994 }
{ i: 9999, result: 49995 }
*/

console.log("=============== parse + evaluate ==============")

const ts = new Date(); 
let results = [];
for (let i = 0; i< 10000; i++ ) {
    let result = interpreter.evaluate(exp,{i,a:3,b:5});
    results.push({ i, result});
}

console.log("finished parse + evaluate", (new Date()) - ts);
// about 4000 ms -> 0,4 ms per evaluation on levono T540p laptop with windows 10
console.log(results.length);
console.log(results[results.length-2]);
console.log(results[results.length-1]);
/*
finished parse + evaluate 4207
10000
{ i: 9998, result: 29994 }
{ i: 9999, result: 49995 }
*/

