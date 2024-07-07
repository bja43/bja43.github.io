import { Vertex, get_cpdag, get_order, adjacent, ext_pdag } from "./graph.js";
import { Matrix, cov, normalize } from "./matrix.js";
import { ncdf, rnorm, } from "./stats.js";
function draw_vertex(ctx, v, fg = FG2) {
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(v.x, v.y, RADIUS, 0, 2 * Math.PI);
    ctx.fill();
}
function draw_edge(ctx, from, to, beta, hide_betas = false, fg = FG2, bg = BG2, padding = RADIUS) {
    if (from.distance(to) < 2 * RADIUS)
        return;
    const headlen = RADIUS / 2;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const x = to.x - (padding + headlen) * Math.cos(angle);
    const y = to.y - (padding + headlen) * Math.sin(angle);
    draw_line(ctx, from.x, from.y, x, y, fg);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 7), y - headlen * Math.sin(angle - Math.PI / 7));
    ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 7), y - headlen * Math.sin(angle + Math.PI / 7));
    ctx.lineTo(x, y);
    ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 7), y - headlen * Math.sin(angle - Math.PI / 7));
    ctx.stroke();
    if (beta !== undefined && !hide_betas) {
        const t = 0.55;
        const midx = t * from.x + (1 - t) * to.x;
        const midy = t * from.y + (1 - t) * to.y;
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.roundRect(midx - 5, midy - 20, 42, 28, 2);
        ctx.fill();
        ctx.fillStyle = bg;
        ctx.font = "18px sans-serif";
        ctx.textAlign = "left";
        ctx.beginPath();
        ctx.fillText(beta.toFixed(2), midx, midy, 32);
    }
}
function draw_line(ctx, x1, y1, x2, y2, fg = FG2) {
    ctx.strokeStyle = fg;
    ctx.lineWidth = RADIUS / 5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function draw_background(ctx, bg = BG2) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.fillRect(0, 0, w, h);
}
function draw_graph(ctx, g, hide_betas = true, fg = FG2, bg = BG2) {
    for (let i = 0; i < g.length; i++) {
        for (let j = 0; j < g[i].parents.length; j++) {
            draw_edge(ctx, g[i].parents[j], g[i], g[i].betas[j], hide_betas, fg, bg);
        }
        for (let j = 0; j < g[i].neighbors.length; j++) {
            if (i < j) {
                break;
            }
            draw_line(ctx, g[i].x, g[i].y, g[i].neighbors[j].x, g[i].neighbors[j].y, fg);
        }
    }
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    for (let i = g.length - 1; i >= 0; i--) {
        draw_vertex(ctx, g[i], fg);
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.fillText((i + 1).toFixed(0), g[i].x, g[i].y + 8);
    }
}
function draw_graph_buttons(ctx, mode, hide_betas, fg = FG2, bg = BG2) {
    const w = ctx.canvas.width;
    ctx.strokeStyle = fg;
    ctx.fillStyle = fg;
    ctx.font = "24px sans-serif";
    ctx.textAlign = "left";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(10, 10, 30, 30, 2);
    if (mode === Graph_Mode.Place) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(50, 10, 30, 30, 2);
    if (mode === Graph_Mode.Move) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(90, 10, 30, 30, 2);
    if (mode === Graph_Mode.Connect) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(130, 10, 30, 30, 2);
    if (mode === Graph_Mode.Delete) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(w - 40, 10, 30, 30, 2);
    if (!hide_betas) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    if (mode === Graph_Mode.Place) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("1", 18, 33);
    ctx.fillStyle = fg;
    if (mode === Graph_Mode.Move) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("2", 58, 33);
    ctx.fillStyle = fg;
    if (mode === Graph_Mode.Connect) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("3", 98, 33);
    ctx.fillStyle = fg;
    if (mode === Graph_Mode.Delete) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("4", 138, 33);
    ctx.fillStyle = fg;
    if (!hide_betas) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("5", w - 32, 33);
    ctx.fillStyle = fg;
    ctx.strokeStyle = fg;
    let desc = "";
    if (mode === Graph_Mode.Place) {
        desc = "Place";
    }
    if (mode === Graph_Mode.Move) {
        desc = "Move";
    }
    if (mode === Graph_Mode.Connect) {
        desc = "Connect";
    }
    if (mode === Graph_Mode.Delete) {
        desc = "Delete";
    }
    ctx.fillText(desc, 10, 70);
    ctx.textAlign = "right";
    if (hide_betas) {
        desc = "Hide";
    }
    else {
        desc = "Show";
    }
    ctx.fillText(desc, w - 10, 70);
    ctx.textAlign = "left";
}
function draw_data(ctx, X, fg = FG2) {
    const w = ctx.canvas.width;
    ctx.fillStyle = fg;
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    if (X === undefined) {
        ctx.beginPath();
        ctx.fillText("NO DATA", w / 2, 180);
    }
    else {
        for (let i = 0; i < X.cols; i++) {
            ctx.beginPath();
            ctx.fillText((i + 1).toString(), 150 + i * 80, 100);
            if (170 + (i + 3) * 80 > w && i + 3 < X.cols) {
                ctx.beginPath();
                ctx.fillText("\u22ef", 150 + (i + 1) * 80, 100);
                ctx.beginPath();
                ctx.fillText(X.cols.toString(), 150 + (i + 2) * 80, 100);
                break;
            }
        }
        ctx.textAlign = "right";
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.fillText((i + 1).toString(), 60, 140 + i * 30);
        }
        for (let i = 0; i < X.cols; i++) {
            for (let j = 0; j < 5; j++) {
                ctx.beginPath();
                ctx.fillText(X.get(j, i).toFixed(2), 170 + i * 80, 140 + j * 30);
            }
            if (170 + (i + 3) * 80 > w && i + 3 < X.cols) {
                for (let j = 0; j < 5; j++) {
                    ctx.beginPath();
                    ctx.fillText("\u22ef", 155 + (i + 1) * 80, 140 + j * 30);
                }
                for (let j = 0; j < 5; j++) {
                    ctx.beginPath();
                    ctx.fillText(X.get(j, X.cols - 1).toFixed(2), 160 + (i + 2) * 80, 140 + j * 30);
                }
                break;
            }
        }
        ctx.beginPath();
        ctx.fillText("".concat("[ ", X.rows.toString(), " \u00d7 ", X.cols.toString(), " ]"), Math.min(100 + X.cols * 80, w - 50), 300);
    }
}
function draw_data_buttons(ctx, mode, fg = FG2, bg = BG1) {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.fillRect(10, 17, 290, 30);
    ctx.strokeStyle = fg;
    ctx.fillStyle = fg;
    ctx.font = "24px sans-serif";
    ctx.textAlign = "left";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(10, 17, 110, 30, 2);
    if (mode === Data_Mode.Simulate) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(135, 17, 165, 30, 2);
    if (mode === Data_Mode.Redraw) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    if (mode === Data_Mode.Simulate) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("Simulate", 17, 40);
    ctx.fillStyle = fg;
    if (mode === Data_Mode.Redraw) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("Redraw Betas", 142, 40);
    ctx.fillStyle = fg;
}
function draw_search(ctx, search, fg1 = FG1, fg2 = FG2, fg3 = FG3, bg = BG2) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    draw_background(ctx);
    ctx.fillStyle = fg2;
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    if (search.g === undefined) {
        ctx.beginPath();
        ctx.fillText("NO DATA", w / 2, h / 2);
    }
    else {
        if (search.pval !== undefined) {
            ctx.fillStyle = fg2;
            ctx.font = "24px sans-serif";
            ctx.textAlign = "right";
            ctx.beginPath();
            ctx.fillText("p-value:  " + search.pval.toFixed(3), h + 80, 33);
        }
        if (search.line !== -1 && search.line < 14) {
            draw_graph(ctx, search.g, true, fg1);
        }
        if (search.line === 14) {
            draw_graph(ctx, search.g, true, fg2);
        }
        if (search.x !== undefined) {
            const x = search.g[search.x];
            if (search.y !== undefined) {
                const y = search.g[search.y];
                if (x.parents.includes(y)) {
                    draw_line(ctx, x.x, x.y, y.x, y.y, bg);
                    draw_edge(ctx, y, x, undefined, true, fg3);
                }
                else {
                    draw_line(ctx, x.x, x.y, y.x, y.y, fg3);
                }
                if (search.Z !== undefined) {
                    let cond = (search.x + 1).toString() + "  \u2aeb  " + (search.y + 1).toString();
                    if (search.Z.length > 0) {
                        cond += "  | ";
                    }
                    for (let i = 0; i < search.Z.length; i++) {
                        const z = search.g[search.Z[i]];
                        cond += " " + search.Z[i].toString();
                        draw_vertex(ctx, z, fg3);
                        ctx.font = "24px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillStyle = bg;
                        ctx.beginPath();
                        ctx.fillText((search.Z[i] + 1).toFixed(0), z.x, z.y + 8);
                    }
                    ctx.fillStyle = fg2;
                    ctx.font = "24px sans-serif";
                    ctx.textAlign = "left";
                    ctx.beginPath();
                    ctx.fillText(cond, 18, 33);
                }
                draw_vertex(ctx, y, fg3);
                ctx.font = "24px sans-serif";
                ctx.textAlign = "center";
                ctx.fillStyle = bg;
                ctx.beginPath();
                ctx.fillText((search.y + 1).toFixed(0), y.x, y.y + 8);
            }
            draw_vertex(ctx, x, fg3);
            ctx.font = "24px sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.fillText((search.x + 1).toFixed(0), x.x, x.y + 8);
        }
    }
}
function draw_info(ctx, search, fg = FG2) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.fillStyle = fg;
    ctx.font = "24px courier";
    ctx.textAlign = "left";
    let best = "Best CIT:    ";
    let max_pval = "Max p-value: ";
    if (search.best !== undefined) {
        let CIT = search.best;
        best += CIT[0].toString() + " \u2aeb " + CIT[1].toString();
        if (search.best[2].length > 0) {
            best += " | ";
            for (let i = 0; i < CIT[2].length; i++) {
                best += CIT[2][i].toString();
            }
        }
    }
    if (search.max_pval !== undefined) {
        max_pval += search.max_pval.toFixed(3);
    }
    ctx.beginPath();
    ctx.fillText(best, 0, 50);
    ctx.beginPath();
    ctx.fillText(max_pval.toString(), 0, 100);
}
function draw_code(ctx, fg1 = FG1, fg2 = FG2, fg3 = FG3) {
    const pseudocode = new Array;
    pseudocode.push([0, "\u{1d4a2} \u2190 fully connected"]);
    pseudocode.push([0, "repeat"]);
    pseudocode.push([1, "best \u2190 none"]);
    pseudocode.push([1, "max-pval \u2190 \u03b1"]);
    pseudocode.push([1, "for x in \u{1d4a2}"]);
    pseudocode.push([2, "for y, Z in CITs(\u{1d4a2}, x, k)"]);
    pseudocode.push([3, "pval \u2190 test(x, y, Z)"]);
    pseudocode.push([3, "if max-pval < pval"]);
    pseudocode.push([4, "best \u2190 (x, y, Z)"]);
    pseudocode.push([4, "max-pval \u2190 pval"]);
    pseudocode.push([1, "if \u03b1 < max-pval"]);
    pseudocode.push([2, "\u{1d4a2} \u2190 update(\u{1d4a2}, best)"]);
    pseudocode.push([1, "else"]);
    pseudocode.push([2, "break"]);
    pseudocode.push([0, "return \u{1d4a2}"]);
    ctx.font = "24px courier";
    for (let i = 0; i < pseudocode.length; i++) {
        ctx.fillStyle = fg1;
        for (let j = 0; j < pseudocode[i][0]; j++) {
            ctx.beginPath();
            ctx.fillText("|", j * 38, (i + 1) * 32);
            if (pseudocode[i + 1][0] > j) {
                ctx.beginPath();
                ctx.fillText("|", j * 38, (i + 1.5) * 32);
            }
            else if (pseudocode[i + 1][1] !== "else") {
                ctx.beginPath();
                ctx.fillText("_", j * 38 + 7, (i + 1) * 32);
            }
        }
        if (search.line === -1) {
            ctx.fillStyle = fg2;
        }
        else if (i === search.line) {
            ctx.fillStyle = fg3;
        }
        else {
            ctx.fillStyle = fg1;
        }
        ctx.beginPath();
        ctx.fillText(pseudocode[i][1], pseudocode[i][0] * 38, (i + 1) * 32);
    }
}
function draw_code_buttons(ctx, mode, fg = FG2, bg = BG1) {
    const y = 512;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.fillRect(10, y, 249, 30);
    ctx.strokeStyle = fg;
    ctx.fillStyle = fg;
    ctx.font = "24px sans-serif";
    ctx.textAlign = "left";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(10, y, 93, 30, 2);
    if (mode === Code_Mode.Restart) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(118, y, 63, 30, 2);
    if (mode === Code_Mode.Step) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.roundRect(196, y, 63, 30, 2);
    if (mode === Code_Mode.Auto) {
        ctx.fill();
    }
    else {
        ctx.stroke();
    }
    if (mode === Code_Mode.Restart) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("Restart", 17, y + 23);
    ctx.fillStyle = fg;
    if (mode === Code_Mode.Step) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("Step", 125, y + 23);
    ctx.fillStyle = fg;
    if (mode === Code_Mode.Auto) {
        ctx.fillStyle = bg;
    }
    ctx.beginPath();
    ctx.fillText("Auto", 203, y + 23);
    ctx.fillStyle = fg;
}
function draw_all(dag_ctx, cpdag_ctx, data_ctx, search_ctx, code_ctx, info_ctx) {
    draw_background(dag_ctx);
    draw_background(cpdag_ctx);
    draw_background(data_ctx, BG1);
    draw_background(code_ctx, BG1);
    draw_background(info_ctx, BG1);
    draw_graph(dag_ctx, g, hide_betas);
    draw_graph(cpdag_ctx, get_cpdag(g));
    draw_data(data_ctx, X);
    draw_search(search_ctx, search);
    draw_code(code_ctx);
    draw_info(info_ctx, search);
    draw_graph_buttons(dag_ctx, graph_mode, hide_betas);
    draw_data_buttons(data_ctx, data_mode);
    draw_code_buttons(code_ctx, code_mode);
}
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
function update_pos(ctx, x, y) {
    if (selected === undefined)
        return;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    selected.x = Math.min(Math.max(x, 0), w);
    selected.y = Math.min(Math.max(y, 0), h);
    if (x < 170 + RADIUS && y < 50 + RADIUS) {
        const dx = 170 + RADIUS - x;
        const dy = 50 + RADIUS - y;
        if (dx <= dy) {
            selected.x = x + dx;
        }
        if (dy <= dx) {
            selected.y = y + dy;
        }
    }
    if (x > w - 50 - RADIUS && y < 50 + RADIUS) {
        const dx = w - 50 - RADIUS - x;
        const dy = 50 + RADIUS - y;
        if (-dx <= dy) {
            selected.x = x + dx;
        }
        if (dy <= -dx) {
            selected.y = y + dy;
        }
    }
}
var Graph_Mode;
(function (Graph_Mode) {
    Graph_Mode[Graph_Mode["Place"] = 0] = "Place";
    Graph_Mode[Graph_Mode["Move"] = 1] = "Move";
    Graph_Mode[Graph_Mode["Connect"] = 2] = "Connect";
    Graph_Mode[Graph_Mode["Delete"] = 3] = "Delete";
})(Graph_Mode || (Graph_Mode = {}));
var Data_Mode;
(function (Data_Mode) {
    Data_Mode[Data_Mode["Simulate"] = 0] = "Simulate";
    Data_Mode[Data_Mode["Redraw"] = 1] = "Redraw";
    Data_Mode[Data_Mode["None"] = 2] = "None";
})(Data_Mode || (Data_Mode = {}));
var Code_Mode;
(function (Code_Mode) {
    Code_Mode[Code_Mode["Restart"] = 0] = "Restart";
    Code_Mode[Code_Mode["Step"] = 1] = "Step";
    Code_Mode[Code_Mode["Auto"] = 2] = "Auto";
    Code_Mode[Code_Mode["None"] = 3] = "None";
})(Code_Mode || (Code_Mode = {}));
const dag_container = document.getElementById("dag-container");
const cpdag_container = document.getElementById("cpdag-container");
const data_container = document.getElementById("data-container");
const search_container = document.getElementById("search-container");
const code_container = document.getElementById("code-container");
const info_container = document.getElementById("info-container");
const dag_canvas = document.getElementById("dag-canvas");
const cpdag_canvas = document.getElementById("cpdag-canvas");
const data_canvas = document.getElementById("data-canvas");
const search_canvas = document.getElementById("search-canvas");
const code_canvas = document.getElementById("code-canvas");
const info_canvas = document.getElementById("info-canvas");
if (dag_container === null) {
    throw new Error("No canvas with `id` dag-container was found");
}
if (cpdag_container === null) {
    throw new Error("No canvas with `id` cpdag-container was found");
}
if (data_container === null) {
    throw new Error("No canvas with `id` data-container was found");
}
if (search_container === null) {
    throw new Error("No canvas with `id` search-container was found");
}
if (code_container === null) {
    throw new Error("No canvas with `id` code-container was found");
}
if (info_container === null) {
    throw new Error("No canvas with `id` info-container was found");
}
if (dag_canvas === null) {
    throw new Error("No canvas with `id` dag-canvas was found");
}
if (cpdag_canvas === null) {
    throw new Error("No canvas with `id` cpdag-canvas was found");
}
if (data_canvas === null) {
    throw new Error("No canvas with `id` data-canvas was found");
}
if (search_canvas === null) {
    throw new Error("No canvas with `id` search-canvas was found");
}
if (code_canvas === null) {
    throw new Error("No canvas with `id` code-canvas was found");
}
if (info_canvas === null) {
    throw new Error("No canvas with `id` info-canvas was found");
}
dag_canvas.width = dag_container.clientWidth;
dag_canvas.height = 0.8 * dag_canvas.clientWidth;
cpdag_canvas.width = cpdag_container.clientWidth;
cpdag_canvas.height = 0.8 * cpdag_container.clientWidth;
data_canvas.width = data_container.clientWidth;
data_canvas.height = 320;
search_canvas.width = search_container.clientWidth;
search_canvas.height = 0.8 * search_canvas.clientWidth;
code_canvas.width = code_container.clientWidth;
code_canvas.height = 600;
info_canvas.width = info_container.clientWidth;
info_canvas.height = 200;
const dag_ctx = dag_canvas.getContext("2d");
const cpdag_ctx = cpdag_canvas.getContext("2d");
const data_ctx = data_canvas.getContext("2d");
const search_ctx = search_canvas.getContext("2d");
const code_ctx = code_canvas.getContext("2d");
const info_ctx = info_canvas.getContext("2d");
if (dag_ctx === null) {
    throw new Error("2D context is not supported");
}
if (cpdag_ctx === null) {
    throw new Error("2D context is not supported");
}
if (data_ctx === null) {
    throw new Error("2D context is not supported");
}
if (search_ctx === null) {
    throw new Error("2D context is not supported");
}
if (code_ctx === null) {
    throw new Error("2D context is not supported");
}
if (info_ctx === null) {
    throw new Error("2D context is not supported");
}
const RADIUS = 25;
const VLIMIT = 7;
const SAMPLES = 1000;
const ALPHA = 0.01;
const AMSPS = 50;
const BG1 = "#242424";
const BG2 = "#181818";
const FG1 = "#686868";
const FG2 = "#a8a8a8";
const FG3 = "#e8e8e8";
const FF1 = "sans-serif";
const FF2 = "courier";
document.body.style.backgroundColor = BG1;
document.body.style.color = FG2;
document.body.style.fontFamily = FF1;
let graph_mode = Graph_Mode.Place;
let selected;
let offset;
let hide_betas = false;
const g = new Array;
let data_mode = Data_Mode.None;
let X;
let R;
let code_mode = Code_Mode.None;
let search = { line: -1, a: ALPHA };
draw_all(dag_ctx, cpdag_ctx, data_ctx, search_ctx, code_ctx, info_ctx);
window.addEventListener("resize", () => {
    dag_canvas.width = dag_container.clientWidth;
    dag_canvas.height = 0.8 * dag_container.clientWidth;
    cpdag_canvas.width = cpdag_container.clientWidth;
    cpdag_canvas.height = 0.8 * cpdag_container.clientWidth;
    data_canvas.width = data_container.clientWidth;
    search_canvas.width = search_container.clientWidth;
    search_canvas.height = 0.8 * search_container.clientWidth;
    info_canvas.width = info_container.clientWidth;
    for (let i = 0; i < g.length; i++) {
        selected = g[i];
        update_pos(dag_ctx, g[i].x, g[i].y);
        g[i].x = selected.x;
        g[i].y = selected.y;
        selected = undefined;
    }
    draw_all(dag_ctx, cpdag_ctx, data_ctx, search_ctx, code_ctx, info_ctx);
});
window.addEventListener("keypress", (event) => {
    switch (event.code) {
        case "Digit1":
            graph_mode = Graph_Mode.Place;
            break;
        case "Digit2":
            graph_mode = Graph_Mode.Move;
            break;
        case "Digit3":
            graph_mode = Graph_Mode.Connect;
            break;
        case "Digit4":
            graph_mode = Graph_Mode.Delete;
            break;
        case "Digit5":
            hide_betas = !hide_betas;
            break;
    }
    draw_background(dag_ctx);
    draw_graph_buttons(dag_ctx, graph_mode, hide_betas);
    draw_graph(dag_ctx, g, hide_betas);
    selected = undefined;
});
dag_canvas.addEventListener("mouseout", () => {
    draw_background(dag_ctx);
    draw_graph_buttons(dag_ctx, graph_mode, hide_betas);
    draw_graph(dag_ctx, g, hide_betas);
    selected = undefined;
});
dag_canvas.addEventListener("mousedown", (event) => {
    const w = dag_ctx.canvas.width;
    const x = event.offsetX;
    const y = event.offsetY;
    if (10 < x && x < 40 && 10 < y && y < 40) {
        graph_mode = Graph_Mode.Place;
    }
    else if (50 < x && x < 80 && 10 < y && y < 40) {
        graph_mode = Graph_Mode.Move;
    }
    else if (90 < x && x < 120 && 10 < y && y < 40) {
        graph_mode = Graph_Mode.Connect;
    }
    else if (130 < x && x < 160 && 10 < y && y < 40) {
        graph_mode = Graph_Mode.Delete;
    }
    else if (w - 40 < x && x < w - 10 && 10 < y && y < 40) {
        hide_betas = !hide_betas;
    }
    else if (graph_mode === Graph_Mode.Place && g.length < VLIMIT) {
        if ((x > 170 + RADIUS || y > 50 + RADIUS) && (x < w - 50 - RADIUS || y > 50 + RADIUS)) {
            g.push(new Vertex(x, y));
            X = undefined;
            R = undefined;
            search = { line: -1, a: ALPHA };
            draw_all(dag_ctx, cpdag_ctx, data_ctx, search_ctx, code_ctx, info_ctx);
        }
    }
    else if (graph_mode === Graph_Mode.Move || graph_mode === Graph_Mode.Connect) {
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
    else if (graph_mode === Graph_Mode.Delete) {
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
        X = undefined;
        R = undefined;
        search = { line: -1, a: ALPHA };
        draw_all(dag_ctx, cpdag_ctx, data_ctx, search_ctx, code_ctx, info_ctx);
    }
});
dag_canvas.addEventListener("mouseup", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    if (selected !== undefined && graph_mode === Graph_Mode.Connect) {
        for (let i = 0; i < g.length; i++) {
            if (g[i] === selected)
                continue;
            let dx = g[i].x - x;
            let dy = g[i].y - y;
            if ((dx * dx + dy * dy) < (RADIUS * RADIUS)) {
                // if (!selected.is_adjacent(g[i])) { selected.add_child(g[i], rnorm()[0]); }
                if (!selected.is_adjacent(g[i])) {
                    selected.add_child(g[i], 2 * Math.random() - 1);
                }
                X = undefined;
                R = undefined;
                search = { line: -1, a: ALPHA };
                break;
            }
        }
    }
    draw_all(dag_ctx, cpdag_ctx, data_ctx, search_ctx, code_ctx, info_ctx);
    selected = undefined;
});
dag_canvas.addEventListener("mousemove", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    if (selected !== undefined && graph_mode === Graph_Mode.Move) {
        update_pos(dag_ctx, x + offset[0], y + offset[1]);
    }
    draw_background(dag_ctx);
    draw_background(cpdag_ctx);
    draw_graph_buttons(dag_ctx, graph_mode, hide_betas);
    if (selected !== undefined && graph_mode === Graph_Mode.Connect) {
        draw_edge(dag_ctx, selected, new Vertex(x, y), undefined, true, FG2, BG2, 0);
    }
    draw_graph(dag_ctx, g, hide_betas);
    draw_graph(cpdag_ctx, get_cpdag(g));
});
data_canvas.addEventListener("mousedown", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    if (10 < x && x < 120 && 17 < y && y < 47) {
        data_mode = Data_Mode.Simulate;
    }
    if (135 < x && x < 300 && 17 < y && y < 47) {
        data_mode = Data_Mode.Redraw;
    }
    if (data_mode === Data_Mode.Simulate) {
        X = undefined;
        R = undefined;
        search = { line: 0, a: ALPHA };
        if (g.length > 0) {
            X = new Matrix(SAMPLES, g.length, rnorm(SAMPLES * g.length));
            const order = get_order(g);
            for (let i = 0; i < order.length; i++) {
                const x = order[i];
                const betas = g[x].betas;
                if (betas === undefined) {
                    continue;
                }
                for (let j = 0; j < g[x].parents.length; j++) {
                    const beta = betas[j];
                    if (beta === undefined) {
                        continue;
                    }
                    const y = g.indexOf(g[x].parents[j]);
                    for (let k = 0; k < X.rows; k++) {
                        X.set(k, x, X.get(k, x) + beta * X.get(k, y));
                    }
                }
            }
            normalize(X);
            R = cov(X);
        }
        draw_background(search_ctx);
        draw_background(code_ctx, BG1);
        draw_background(info_ctx, BG1);
        draw_search(search_ctx, search);
        draw_code(code_ctx);
        draw_info(info_ctx, search);
        draw_code_buttons(code_ctx, code_mode);
    }
    if (data_mode === Data_Mode.Redraw) {
        for (let i = 0; i < g.length; i++) {
            if (g[i].betas === undefined) {
                continue;
            }
            for (let j = 0; j < g[i].betas.length; j++) {
                //g[i].betas[j] = rnorm()[0];
                g[i].betas[j] = 2 * Math.random() - 1;
            }
        }
        draw_background(dag_ctx);
        draw_graph_buttons(dag_ctx, graph_mode, hide_betas);
        draw_graph(dag_ctx, g, hide_betas);
    }
    draw_background(data_ctx, BG1);
    draw_data(data_ctx, X);
    draw_data_buttons(data_ctx, data_mode);
});
data_canvas.addEventListener("mouseup", () => {
    data_mode = Data_Mode.None;
    draw_data(data_ctx, X);
    draw_data_buttons(data_ctx, data_mode);
});
code_canvas.addEventListener("mousedown", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    if (10 < x && x < 103 && 512 < y && y < 542) {
        code_mode = Code_Mode.Restart;
    }
    if (118 < x && x < 181 && 512 < y && y < 542) {
        code_mode = Code_Mode.Step;
    }
    if (196 < x && x < 259 && 512 < y && y < 542) {
        if (code_mode === Code_Mode.Auto) {
            code_mode = Code_Mode.None;
            draw_code_buttons(code_ctx, code_mode);
            return;
        }
        else {
            code_mode = Code_Mode.Auto;
        }
    }
    if (code_mode === Code_Mode.None) {
        return;
    }
    if (X !== undefined && R !== undefined) {
        if (code_mode === Code_Mode.Restart) {
            search = { line: 0, a: ALPHA };
        }
        if (code_mode === Code_Mode.Step && search.line < 14) {
            step(g, R, X.rows);
        }
    }
    if (search.line < 14) {
        draw_search(search_ctx, search, FG1);
    }
    else {
        draw_search(search_ctx, search, FG2);
    }
    draw_background(code_ctx, BG1);
    draw_background(info_ctx, BG1);
    draw_code(code_ctx);
    draw_info(info_ctx, search);
    draw_code_buttons(code_ctx, code_mode);
});
code_canvas.addEventListener("mouseup", (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    if (code_mode === Code_Mode.Auto && 196 < x && x < 259 && 512 < y && y < 542) {
        return;
    }
    else {
        code_mode = Code_Mode.None;
    }
    draw_code_buttons(code_ctx, code_mode);
});
window.setInterval(auto, AMSPS);
function auto() {
    if (code_mode !== Code_Mode.Auto) {
        return;
    }
    if (search_ctx === null || code_ctx === null || info_ctx === null) {
        return;
    }
    if (X === undefined || R === undefined) {
        return;
    }
    if (search.line !== -1 && search.line < 14) {
        step(g, R, X.rows);
        draw_search(search_ctx, search, FG1);
        draw_background(code_ctx, BG1);
        draw_background(info_ctx, BG1);
        draw_code(code_ctx);
        draw_info(info_ctx, search);
        draw_code_buttons(code_ctx, code_mode);
    }
    if (search.line === 14) {
        draw_search(search_ctx, search, FG2);
    }
}
function* subsets(set, r) {
    function* backtrack(idx, subset) {
        if (subset.length === r) {
            yield [...subset];
            return;
        }
        for (let i = idx; i < set.length; i++) {
            subset.push(set[i]);
            yield* backtrack(i + 1, subset);
            subset.pop();
        }
    }
    yield* backtrack(0, []);
}
function get_cits(g, i, cache) {
    const cits = new Array;
    const x = g[i];
    for (let j = 0; j < g.length; j++) {
        let y = g[j];
        if (x === y) {
            continue;
        }
        if (!x.is_adjacent(y)) {
            continue;
        }
        if (x.children.includes(y)) {
            continue;
        }
        const NA = new Array;
        for (let k = 0; k < x.neighbors.length; k++) {
            const w = x.neighbors[k];
            if (w.is_adjacent(y)) {
                NA.push(w);
            }
        }
        let r = g.length - x.parents.length - 2;
        if (x.parents.includes(y)) {
            r += 1;
        }
        while (r >= 0) {
            for (const tmp of subsets(NA, r)) {
                if (!adjacent(tmp, tmp)) {
                    continue;
                }
                const Z = new Array;
                for (let k = 0; k < x.parents.length; k++) {
                    if (x.parents[k] == y) {
                        continue;
                    }
                    Z.push(g.indexOf(x.parents[k]));
                }
                for (let l = 0; l < r; l++) {
                    Z.push(g.indexOf(tmp[l]));
                }
                if (cache !== undefined) {
                    const key = hash(i, j, Z);
                    if (cache.includes(key)) {
                        continue;
                    }
                    cache.push(key);
                }
                cits.push([j, [...Z]]);
            }
            r -= 1;
        }
    }
    return cits;
}
function update_graph(g, cit) {
    const x = g[cit[0]];
    const y = g[cit[1]];
    const Z = new Array;
    for (let i = 0; i < cit[2].length; i++) {
        Z.push(g[cit[2][i]]);
    }
    x.del_adjacent(y);
    const N = [...x.neighbors];
    for (let i = 0; i < N.length; i++) {
        const w = N[i];
        if (!w.is_adjacent(y)) {
            continue;
        }
        if (Z.includes(w)) {
            x.del_adjacent(w);
            x.add_parent(w);
        }
        else {
            x.del_adjacent(w);
            x.add_child(w);
            y.del_adjacent(w);
            y.add_child(w);
        }
    }
    ext_pdag(g);
    return get_cpdag(g);
}
function fisherz(R, n, x, y, Z) {
    const I = R.ix([x, y, ...Z], [x, y, ...Z]).inv();
    let z = Math.atanh(-I.get(0, 1) / Math.sqrt(I.get(0, 0) * I.get(1, 1)));
    z = Math.sqrt(n - Z.length - 3) * Math.abs(z);
    const pval = 1 - ncdf(z) + ncdf(-z);
    return pval;
}
function hash(x, y, Z) {
    const sorted = [...Z];
    sorted.sort();
    if (x < y) {
        return [x, y, ...sorted].join("");
    }
    else {
        return [y, x, ...sorted].join("");
    }
}
function step(g, R, n) {
    if (R === undefined) {
        return;
    }
    switch (search.line) {
        case 0: {
            search.g = new Array;
            for (let i = 0; i < g.length; i++) {
                search.g.push(new Vertex(g[i].x, g[i].y));
            }
            for (let i = 0; i < search.g.length; i++) {
                for (let j = 0; j < i; j++) {
                    search.g[i].add_neighbor(search.g[j]);
                }
            }
            search.line += 1;
            break;
        }
        case 1: {
            search.cache = new Array;
            search.max_pval = undefined;
            search.best = undefined;
            search.x = undefined;
            search.y = undefined;
            search.pval = undefined;
            search.line += 1;
            break;
        }
        case 2: {
            search.best = undefined;
            search.line += 1;
            break;
        }
        case 3: {
            search.max_pval = search.a;
            search.line += 1;
            break;
        }
        case 4: {
            if (search.g === undefined) {
                throw new Error("g is undefined on line " + search.line);
            }
            if (search.x === undefined) {
                search.x = -1;
            }
            if (search.x < search.g.length - 1) {
                search.x += 1;
                search.line += 1;
            }
            else {
                search.x = undefined;
                search.line = 10;
            }
            break;
        }
        case 5: {
            if (search.g === undefined) {
                throw new Error("g is undefined on line " + search.line);
            }
            if (search.x === undefined) {
                throw new Error("x is undefined on line " + search.line);
            }
            if (search.CITs === undefined) {
                search.CITs = get_cits(search.g, search.x, search.cache);
            }
            if (search.CITs.length > 0) {
                const CIT = search.CITs.pop();
                if (CIT === undefined) {
                    throw new Error("CIT is undefined on line " + search.line);
                }
                search.y = CIT[0];
                search.Z = CIT[1];
                search.line += 1;
            }
            else {
                search.CITs = undefined;
                search.line = 4;
            }
            break;
        }
        case 6: {
            if (search.x === undefined) {
                throw new Error("x is undefined on line " + search.line);
            }
            if (search.y === undefined) {
                throw new Error("y is undefined on line " + search.line);
            }
            if (search.Z === undefined) {
                throw new Error("Z is undefined on line " + search.line);
            }
            search.pval = fisherz(R, n, search.x, search.y, search.Z);
            search.line += 1;
            break;
        }
        case 7: {
            if (search.max_pval === undefined) {
                throw new Error("max_pval is undefined on line " + search.line);
            }
            if (search.pval === undefined) {
                throw new Error("pval is undefined on line " + search.line);
            }
            if (search.max_pval < search.pval) {
                search.line += 1;
            }
            else {
                search.line = 5;
            }
            break;
        }
        case 8: {
            if (search.x === undefined) {
                throw new Error("x is undefined on line " + search.line);
            }
            if (search.y === undefined) {
                throw new Error("y is undefined on line " + search.line);
            }
            if (search.Z === undefined) {
                throw new Error("Z is undefined on line " + search.line);
            }
            search.best = [search.x, search.y, search.Z];
            search.line += 1;
            break;
        }
        case 9: {
            if (search.pval === undefined) {
                throw new Error("pval is undefined on line " + search.line);
            }
            search.max_pval = search.pval;
            search.line = 5;
            break;
        }
        case 10: {
            if (search.max_pval === undefined) {
                throw new Error("max_pval is undefined on line " + search.line);
            }
            if (search.a < search.max_pval) {
                search.line += 1;
            }
            else {
                search.line = 12;
            }
            break;
        }
        case 11: {
            if (search.g === undefined) {
                throw new Error("g is undefined on line " + search.line);
            }
            if (search.best === undefined) {
                throw new Error("best is undefined on line " + search.line);
            }
            search.g = update_graph(search.g, search.best);
            search.line = 1;
            break;
        }
        case 12: {
            search.line += 1;
            break;
        }
        case 13: {
            search.line += 1;
            break;
        }
        default: {
            console.log("search complete");
            break;
        }
    }
}
//# sourceMappingURL=index.js.map
