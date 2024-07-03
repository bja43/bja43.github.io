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
    add_parent(that, beta) {
        this.parents.push(that);
        this.betas.push(beta);
        that.children.push(this);
    }
    add_child(that, beta) {
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
        let unc = false;
        for (let i = 0; i < cpdag[x].parents.length; i++) {
            const w = cpdag.indexOf(cpdag[x].parents[i], 0);
            if (dag[y].parents.includes(dag[w])) {
                continue;
            }
            unc = true;
            break;
        }
        for (let i = unknown.length - 1; i >= 0; i--) {
            if (unknown[i][1] !== y) {
                break;
            }
            const u = unknown[i][0];
            if (unc || cpdag[x].parents.includes(cpdag[u])) {
                cpdag[y].add_parent(cpdag[u], undefined);
                unknown.splice(i, 1);
            }
        }
        if (unc) {
            continue;
        }
        let uc = false;
        for (let i = 0; i < dag[y].parents.length; i++) {
            const z = dag.indexOf(dag[y].parents[i], 0);
            if (x === z) {
                continue;
            }
            if (dag[x].parents.includes(dag[z])) {
                continue;
            }
            uc = true;
            break;
        }
        for (let i = unknown.length - 1; i >= 0; i--) {
            if (unknown[i][1] !== y) {
                break;
            }
            const u = unknown[i][0];
            if (uc) {
                cpdag[y].add_parent(cpdag[u], undefined);
            }
            else {
                cpdag[y].add_neighbor(cpdag[u]);
            }
            unknown.splice(i, 1);
        }
    }
    return cpdag;
}
//# sourceMappingURL=graph.js.map