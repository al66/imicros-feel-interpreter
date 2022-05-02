
let key = "profit and loss";
let data = "profit";

//console.log(data,data.match(/[\+\.\-\/\*]/))

//let result = key.match(new RegExp(data+"[\s\+-\.]+[.]+"))
let result = key.match(new RegExp(data+"[\s \+\.\-\/\*]+[.]*"))

console.log(new RegExp(data+"[\s\+\.\-\/\*]+[.]*"));
console.log(result);
