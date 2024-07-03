import { Vertex, get_cpdag } from "./graph.js";
import { rnorm } from "./stats.js";
function draw_vertex(ctx, v) {
    ctx.fillStyle = "#585858";
    ctx.beginPath();
    ctx.arc(v.x, v.y, RADIUS, 0, 2 * Math.PI);
    ctx.fill();
}
function draw_edge(ctx, from, to, beta, padding = RADIUS) {
    if (from.distance(to) < 2 * RADIUS)
        return;
    const headlen = RADIUS / 2;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const x = to.x - (padding + headlen) * Math.cos(angle);
    const y = to.y - (padding + headlen) * Math.sin(angle);
    draw_line(ctx, from.x, from.y, x, y);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 7), y - headlen * Math.sin(angle - Math.PI / 7));
    ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 7), y - headlen * Math.sin(angle + Math.PI / 7));
    ctx.lineTo(x, y);
    ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 7), y - headlen * Math.sin(angle - Math.PI / 7));
    ctx.stroke();
    if (beta !== undefined) {
        const t = 0.55;
        const midx = t * from.x + (1 - t) * to.x;
        const midy = t * from.y + (1 - t) * to.y;
        ctx.fillStyle = "#585858";
        ctx.beginPath();
        ctx.roundRect(midx - 5, midy - 20, 42, 28, 2);
        ctx.fill();
        ctx.fillStyle = "#181818";
        ctx.font = "18px sans-serif";
        ctx.fillText(beta.toFixed(2), midx, midy, 32);
    }
}
function draw_line(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = "#585858";
    ctx.lineWidth = RADIUS / 5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function draw_background(ctx) {
    ctx.fillStyle = "#181818";
    ctx.beginPath();
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}
function draw_graph(ctx, g) {
    for (let i = 0; i < g.length; i++) {
        for (let j = 0; j < g[i].parents.length; j++) {
            draw_edge(ctx, g[i].parents[j], g[i], g[i].betas[j]);
        }
        for (let j = 0; j < g[i].neighbors.length; j++) {
            if (i < j) {
                break;
            }
            draw_line(ctx, g[i].x, g[i].y, g[i].neighbors[j].x, g[i].neighbors[j].y);
        }
    }
    ctx.font = "24px sans-serif";
    for (let i = g.length - 1; i >= 0; i--) {
        draw_vertex(ctx, g[i]);
        ctx.fillStyle = "#181818";
        ctx.beginPath();
        ctx.fillText((i + 1).toFixed(0), g[i].x - 6, g[i].y + 8);
    }
    console.log(g);
}
function draw_buttons(ctx, mode) {
    ctx.strokeStyle = "#585858";
    ctx.fillStyle = "#585858";
    ctx.font = "24px sans-serif";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(10, 10, 30, 30, 2);
    if (mode === Mode.Placement) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(50, 10, 30, 30, 2);
    if (mode === Mode.Movement) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(90, 10, 30, 30, 2);
    if (mode === Mode.Connect) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(130, 10, 30, 30, 2);
    if (mode === Mode.Delete) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    if (mode === Mode.Placement) {
        ctx.fillStyle = "#181818";
    }
    ctx.beginPath();
    ctx.fillText("1", 18, 33);
    ctx.fillStyle = "#585858";
    if (mode === Mode.Movement) {
        ctx.fillStyle = "#181818";
    }
    ctx.beginPath();
    ctx.fillText("2", 58, 33);
    ctx.fillStyle = "#585858";
    if (mode === Mode.Connect) {
        ctx.fillStyle = "#181818";
    }
    ctx.beginPath();
    ctx.fillText("3", 98, 33);
    ctx.fillStyle = "#585858";
    if (mode === Mode.Delete) {
        ctx.fillStyle = "#181818";
    }
    ctx.beginPath();
    ctx.fillText("4", 138, 33);
    ctx.fillStyle = "#585858";
    ctx.strokeStyle = "#585858";
    ctx.fillStyle = "#585858";
    let desc = "";
    if (mode === Mode.Placement) {
        desc = "Placing";
    }
    if (mode === Mode.Movement) {
        desc = "Moving";
    }
    if (mode === Mode.Connect) {
        desc = "Connecting";
    }
    if (mode === Mode.Delete) {
        desc = "Deleteing";
    }
    ctx.fillText(desc, 10, 70);
}
// \u2AEB\u0338
var Mode;
(function (Mode) {
    Mode[Mode["Placement"] = 0] = "Placement";
    Mode[Mode["Movement"] = 1] = "Movement";
    Mode[Mode["Connect"] = 2] = "Connect";
    Mode[Mode["Delete"] = 3] = "Delete";
})(Mode || (Mode = {}));
const dag_container = document.getElementById("dag-container");
const cpdag_container = document.getElementById("cpdag-container");
const dag_canvas = document.getElementById("dag-canvas");
const cpdag_canvas = document.getElementById("cpdag-canvas");
if (dag_container === null) {
    throw new Error("No canvas with `id` dag_container was found");
}
if (cpdag_container === null) {
    throw new Error("No canvas with `id` cpdag_container was found");
}
if (dag_canvas === null) {
    throw new Error("No canvas with `id` dag_canvas was found");
}
if (cpdag_canvas === null) {
    throw new Error("No canvas with `id` cpdag_canvas was found");
}
dag_canvas.width = dag_container.clientWidth;
dag_canvas.height = 0.8 * dag_canvas.clientWidth;
cpdag_canvas.width = cpdag_container.clientWidth;
cpdag_canvas.height = 0.8 * cpdag_container.clientWidth;
const dag_ctx = dag_canvas.getContext("2d");
const cpdag_ctx = cpdag_canvas.getContext("2d");
if (dag_ctx === null) {
    throw new Error("2D context is not supported");
}
if (cpdag_ctx === null) {
    throw new Error("2D context is not supported");
}
let WIDTH = dag_canvas.width;
let HEIGHT = dag_canvas.height;
const RADIUS = 30;
let mode = Mode.Placement;
let selected;
let offset;
const g = new Array;
draw_background(dag_ctx);
draw_background(cpdag_ctx);
draw_buttons(dag_ctx, mode);
window.addEventListener("keypress", (event) => {
    switch (event.code) {
        case "Digit1":
            mode = Mode.Placement;
            break;
        case "Digit2":
            mode = Mode.Movement;
            break;
        case "Digit3":
            mode = Mode.Connect;
            break;
        case "Digit4":
            mode = Mode.Delete;
            break;
    }
    draw_background(dag_ctx);
    draw_buttons(dag_ctx, mode);
    draw_graph(dag_ctx, g);
    selected = undefined;
});
dag_canvas.addEventListener("mouseout", (event) => {
    draw_background(dag_ctx);
    draw_buttons(dag_ctx, mode);
    draw_graph(dag_ctx, g);
    selected = undefined;
});
dag_canvas.addEventListener("mousedown", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    if (10 < x && x < 40 && 10 < y && y < 40) {
        mode = Mode.Placement;
    }
    if (50 < x && x < 80 && 10 < y && y < 40) {
        mode = Mode.Movement;
    }
    if (90 < x && x < 120 && 10 < y && y < 40) {
        mode = Mode.Connect;
    }
    if (130 < x && x < 160 && 10 < y && y < 40) {
        mode = Mode.Delete;
    }
    else if (mode === Mode.Placement) {
        if (x > 170 + RADIUS || y > 80 + RADIUS) {
            g.push(new Vertex(x, y));
            draw_background(dag_ctx);
            draw_background(cpdag_ctx);
            draw_buttons(dag_ctx, mode);
            draw_graph(dag_ctx, g);
            draw_graph(cpdag_ctx, get_cpdag(g));
        }
    }
    if (mode === Mode.Movement || mode === Mode.Connect) {
        for (let i = 0; i < g.length; i++) {
            let dx = g[i].x - x;
            let dy = g[i].y - y;
            if ((dx * dx + dy * dy) < (RADIUS * RADIUS)) {
                selected = g[i];
                offset = [dx, dy];
                break;
            }
        }
    }
    if (mode === Mode.Delete) {
        for (let i = 0; i < g.length; i++) {
            let dx = g[i].x - x;
            let dy = g[i].y - y;
            if ((dx * dx + dy * dy) < (RADIUS * RADIUS)) {
                del_vertex(g, i);
                break;
            }
        }
        for (let i = 0; i < g.length; i++) {
            for (let j = 0; j < i; j++) {
                if (!g[i].is_adjacent(g[j])) {
                    continue;
                }
                const pos = new Vertex(event.offsetX, event.offsetY);
                const dist = pos.distance(g[i]) + pos.distance(g[j]);
                if (dist < g[i].distance(g[j]) + 5) {
                    g[i].del_parent(g[j]);
                    g[i].del_child(g[j]);
                    g[i].del_neighbor(g[j]);
                }
            }
        }
    }
});
function del_vertex(g, i) {
    for (let j = 0; j < g.length; j++) {
        g[i].del_parent(g[j]);
        g[i].del_child(g[j]);
        g[i].del_neighbor(g[j]);
    }
    const idx = g.indexOf(g[i], 0);
    if (idx > -1) {
        g.splice(idx, 1);
    }
}
dag_canvas.addEventListener("mouseup", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    if (selected !== undefined && mode === Mode.Connect) {
        for (let i = 0; i < g.length; i++) {
            if (g[i] === selected)
                continue;
            let dx = g[i].x - x;
            let dy = g[i].y - y;
            if ((dx * dx + dy * dy) < (RADIUS * RADIUS)) {
                if (!selected.is_adjacent(g[i])) {
                    selected.add_child(g[i], rnorm()[0]);
                }
                break;
            }
        }
    }
    draw_background(dag_ctx);
    draw_background(cpdag_ctx);
    draw_buttons(dag_ctx, mode);
    draw_graph(dag_ctx, g);
    draw_graph(cpdag_ctx, get_cpdag(g));
    selected = undefined;
});
function update_pos(x, y) {
    if (selected === undefined)
        return;
    selected.x = Math.min(Math.max(x, 0), WIDTH);
    selected.y = Math.min(Math.max(y, 0), HEIGHT);
    if (x < 170 + RADIUS && y < 80 + RADIUS) {
        const dx = 170 + RADIUS - x;
        const dy = 80 + RADIUS - y;
        if (dx <= dy) {
            selected.x = x + dx;
        }
        if (dy <= dx) {
            selected.y = y + dy;
        }
    }
}
dag_canvas.addEventListener("mousemove", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    if (selected !== undefined && mode === Mode.Movement) {
        update_pos(x + offset[0], y + offset[1]);
    }
    draw_background(dag_ctx);
    draw_background(cpdag_ctx);
    draw_buttons(dag_ctx, mode);
    if (selected !== undefined && mode === Mode.Connect) {
        draw_edge(dag_ctx, selected, new Vertex(x, y), undefined, 0);
    }
    draw_graph(dag_ctx, g);
    draw_graph(cpdag_ctx, get_cpdag(g));
});
//# sourceMappingURL=index.js.map
