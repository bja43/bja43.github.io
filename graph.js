export class Vertex {

    x;
    y;
    parents;
    children;
    neighbors;
    betas;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.parents = new Array;
        this.children = new Array;
        this.neighbors = new Array;
        this.betas = new Array;
    }

    is_adjacent(that) {
        for (let i = 0; i < this.parents.length; i++) {
            if (this.parents[i] === that) {
                return true;
            }
        }
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] === that) {
                return true;
            }
        }
        for (let i = 0; i < this.neighbors.length; i++) {
            if (this.neighbors[i] === that) {
                return true;
            }
        }
        return false;
    }

    distance(that) {
        const dx = this.x - that.x;
        const dy = this.y - that.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    add_parent(that, beta = undefined) {
        this.parents.push(that);
        this.betas.push(beta);
        that.children.push(this);
    }

    add_child(that, beta = undefined) {
        this.children.push(that);
        that.parents.push(this);
        that.betas.push(beta);
    }

    add_neighbor(that) {
        this.neighbors.push(that);
        that.neighbors.push(this);
    }

    del_parent(that) {
        let idx;
        idx = this.parents.indexOf(that, 0);
        if (idx > -1) {
            this.parents.splice(idx, 1);
            this.betas.splice(idx, 1);
        }
        idx = that.children.indexOf(this, 0);
        if (idx > -1) {
            that.children.splice(idx, 1);
        }
    }

    del_child(that) {
        let idx;
        idx = this.children.indexOf(that, 0);
        if (idx > -1) {
            this.children.splice(idx, 1);
        }
        idx = that.parents.indexOf(this, 0);
        if (idx > -1) {
            that.parents.splice(idx, 1);
            that.betas.splice(idx, 1);
        }
    }

    del_neighbor(that) {
        let idx;
        idx = this.neighbors.indexOf(that, 0);
        if (idx > -1) {
            this.neighbors.splice(idx, 1);
        }
        idx = that.neighbors.indexOf(this, 0);
        if (idx > -1) {
            that.neighbors.splice(idx, 1);
        }
    }

    del_adjacent(that) {
        this.del_parent(that);
        this.del_child(that);
        this.del_neighbor(that);
    }
}

export function get_order(g) {
    const order = new Array;
    let prev;
    do {
        prev = order.length;
        for (let i = 0; i < g.length; i++) {
            if (order.includes(i)) {
                continue;
            }
            let source = true;
            for (let j = 0; j < g[i].parents.length; j++) {
                const k = g.indexOf(g[i].parents[j]);
                if (!order.includes(k)) {
                    source = false;
                    break;
                }
            }
            if (source) {
                order.push(i);
            }
        }
    } while (order.length > prev);
    return order;
}

export function ext_pdag(g) {
    const oriented = new Array;
    while (oriented.length < g.length) {
        for (let i = 0; i < g.length; i++) {
            const x = g[i];
            if (oriented.includes(x)) {
                continue;
            }
            let sink = true;
            for (let j = 0; j < x.children.length; j++) {
                if (!oriented.includes(x.children[j])) {
                    sink = false;
                    break;
                }
            }
            if (!sink) {
                continue;
            }
            if (!adjacent(x.neighbors, x.neighbors)) {
                continue;
            }
            if (!adjacent(x.neighbors, x.parents)) {
                continue;
            }
            const N = [...x.neighbors];
            for (let j = 0; j < N.length; j++) {
                const y = N[j];
                x.del_neighbor(y);
                x.add_parent(y);
            }
            oriented.push(x);
            break;
        }
    }
}

export function get_edges(g) {
    const edges = new Array;
    const order = get_order(g);
    while (order.length > 0) {
        let i = order.pop();
        if (i !== undefined) {
            for (let j = 0; j < order.length; j++) {
                if (!g[i].parents.includes(g[order[j]])) {
                    continue;
                }
                edges.push([order[j], i]);
            }
        }
    }
    return edges;
}

export function get_cpdag(dag) {
    const cpdag = new Array;
    for (let i = 0; i < dag.length; i++) {
        cpdag.push(new Vertex(dag[i].x, dag[i].y));
    }
    const unknown = get_edges(dag);
    while (unknown.length > 0) {
        const x = unknown[unknown.length - 1][0];
        const y = unknown[unknown.length - 1][1];
        let restart = false;
        for (let i = 0; i < cpdag[x].parents.length; i++) {
            const w = cpdag.indexOf(cpdag[x].parents[i], 0);
            if (!dag[y].parents.includes(dag[w])) {
                for (let j = unknown.length - 1; j >= 0; j--) {
                    if (unknown[j][1] !== y) {
                        continue;
                    }
                    const u = unknown[j][0];
                    unknown.splice(j, 1); 
                    cpdag[y].add_parent(cpdag[u]);
                    restart = true;
                }                
            }
            else {
                for (let j = unknown.length - 1; j >= 0; j--) {
                    if (unknown[j][0] !== w) {
                        continue;
                    }
                    if (unknown[j][1] !== y) {
                        continue;
                    }
                    unknown.splice(j, 1); 
                    cpdag[y].add_parent(cpdag[w]);
                    break;
                }
            }
        }
        if (restart) {
            continue;
        }
        for (let i = 0; i < dag[y].parents.length; i++) {
            const z = dag.indexOf(dag[y].parents[i], 0);
            if (z === x) {
                continue;
            }
            if (!dag[x].parents.includes(dag[z])) {
                for (let j = unknown.length - 1; j >= 0; j--) {
                    if (unknown[j][1] !== y) {
                        continue;
                    }
                    const u = unknown[j][0];
                    unknown.splice(j, 1); 
                    cpdag[y].add_parent(cpdag[u]);
                    restart = true;
                }                
            }
        }
        if (restart) {
            continue;
        }
        for (let j = unknown.length - 1; j >= 0; j--) {
            if (unknown[j][1] !== y) {
                continue;
            }
            const u = unknown[j][0];
            unknown.splice(j, 1); 
            cpdag[y].add_neighbor(cpdag[u]);
        }                
    }
    return cpdag;
}

export function adjacent(A, B) {
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B.length; j++) {
            if (A[i] === B[j]) {
                continue;
            }
            if (!A[i].is_adjacent(B[j])) {
                return false;
            }
        }
    }
    return true;
}
