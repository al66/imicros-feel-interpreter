/**
 * @license MIT, imicros.de (c) 2022 Andreas Leinen
 */
 "use strict";

 function set(obj, path, value) {
    if (Object(obj) !== obj) return obj; // When obj is not an object
    // If not yet an array, get the keys from the string-path
    if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || [];
    if (value !== undefined) {
        path.slice(0,-1).reduce((a, c, i) => // Iterate all of them except the last one
             Object(a[c]) === a[c] // Does the key exist and is its value an object?
                 // Yes: then follow that path
                 ? a[c] 
                 // No: create the key. Is the next key a potential array-index?
                 : a[c] = Math.abs(path[i+1])>>0 === +path[i+1] 
                       ? [] // Yes: assign a new array object
                       : {}, // No: assign a new plain object
             obj)[path[path.length-1]] = value; // Finally assign the value to the last key

    } else {
        delete path.slice(0,-1).reduce((a, c) => // Iterate all of them except the last one
             Object(a[c]) === a[c] // Does the key exist and is its value an object?
                 // Yes: then follow that path
                 ? a[c] 
                 // No: stop here
                 : {},
              obj)[path[path.length-1]]; // Finally delete the last key
    }
    return obj; // Return the top-level object to allow chaining}
}

// Topological sort - code from https://gist.github.com/shinout/1232505#file-tsort-js-L9
function tsort(edges) {
    let nodes = {}, sorted = [], visited = {};

    let Node = function (id) {
        this.id = id;
        this.afters = [];
    }

    edges.forEach( (v)=> {
        let from = v[0], to = v[1];
        if (!nodes[from]) nodes[from] = new Node(from);
        if (!nodes[to]) nodes[to] = new Node(to);
        nodes[from].afters.push(to);
    });

    Object.keys(nodes).forEach(function visit(idstr, ancestors) {
        let node = nodes[idstr],id = node.id;

        if (visited[idstr]) return;
        if (!Array.isArray(ancestors)) ancestors = [];

        ancestors.push(id);
        visited[idstr] = true;
        node.afters.forEach(function (afterID) {
            if (ancestors.indexOf(afterID) >= 0)  
                throw new Error('closed chain : ' + afterID + ' is in ' + id);
            visit(afterID.toString(), ancestors.map(function (v) { return v })); 
        });
        sorted.unshift(id);
    });

    return sorted;
}

function objectAreEqual( x, y ) {
    if ( x === y ) return true;
      // if both x and y are null or undefined and exactly the same
  
    if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
      // if they are not strictly equal, they both need to be Objects
  
    if ( x.constructor !== y.constructor ) return false;
      // they must have the exact same prototype chain, the closest we can do is
      // test there constructor.
  
    for ( var p in x ) {
      if ( ! x.hasOwnProperty( p ) ) continue;
        // other properties were tested using x.constructor === y.constructor
  
      if ( ! y.hasOwnProperty( p ) ) return false;
        // allows to compare x[ p ] and y[ p ] when set to undefined
  
      if ( x[ p ] === y[ p ] ) continue;
        // if they have the same strict value or identity then they are equal
  
      if ( typeof( x[ p ] ) !== "object" ) return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal
  
      if ( ! objectAreEqual( x[ p ],  y[ p ] ) ) return false;
        // Objects and Arrays must be tested recursively
    }
  
    for ( p in y )
      if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) )
        return false;
          // allows x[ p ] to be set to undefined
  
    return true;
}

module.exports = {
    set,
    tsort,
    objectAreEqual
};
