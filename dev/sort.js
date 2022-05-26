const imageDependencies = {
    A: [],
    B: ['A'],
    C: ['A', 'B'],
    D: ['F'],
    E: ['D', 'C'],
    F: []
}

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


const createEdges = (dep) => {
    let result = []
    Object.keys(dep).forEach(key => {
        dep[key].forEach(n => {
            result.push([n, key])
        })
    })
    return result
}

const list = createEdges(imageDependencies)
console.log(list);
console.log(tsort(list))