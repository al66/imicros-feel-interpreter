
let data = `profit 
        /* test 
           */`;

console.log(data,data.match(/\/\*.+[\s\S]*?\*\/|\/\/.*/))

//let result = key.match(new RegExp(data+"[\s\+-\.]+[.]+"))
// let result = key.match(new RegExp(data+"[\s \+\.\-\/\*]+[.]*"))

// console.log(new RegExp(data+"[\s\+\.\-\/\*]+[.]*"));
//console.log(result);
