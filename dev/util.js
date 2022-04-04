function concat(e) {
    if (Array.isArray(e)) return e.reduce((prev,curr) => prev.concat(concat(curr,[])), [] ).join(''); 
    return e;
}

let list = ['a','b',['0','c',['v','e']],'D'];
console.log(concat(list));

list = 'x'
console.log(concat(list));

list = ['x']
console.log(concat(list));
