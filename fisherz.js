import { Matrix, normalize } from "./matrix.js";
import { norminv, norm, rnorm, fisherz } from "./stats.js";
function draw_scatter(ctx, X) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.fillStyle = "#181818";
    ctx.beginPath();
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(w / 20, w / 20);
    ctx.fillStyle = "#a8a8a8";
    for (let i = 0; i < X.rows; i++) {
        ctx.beginPath();
        ctx.arc(X.get(i, 0), -X.get(i, 1), 0.1, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.restore();
}
function draw_pdf(ctx, n, r, a) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.fillStyle = "#181818";
    ctx.beginPath();
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(ctx.canvas.width / 2, (9 / 10) * ctx.canvas.height);
    ctx.scale(ctx.canvas.width / 3, ctx.canvas.width / 30);
    const std = 1 / Math.sqrt(n - 3);
    const cutoff = norminv(1 - a / 2) / Math.sqrt(n - 3);
    const q = 100;
    const b = 5 / Math.sqrt(n);
    for (let i = 0; i < q; i++) {
        if (i * b / q >= cutoff) {
            ctx.fillStyle = "#e82424";
        }
        else {
            ctx.fillStyle = "#a8a8a8";
        }
        ctx.beginPath();
        const pdf = norm(i * b / q, 0, Math.pow(std, 2));
        ctx.rect(i * b / q, 0, b / q, -1 * pdf);
        ctx.rect(i * b / -q, 0, b / -q, -1 * pdf);
        ctx.fill();
    }
    ctx.lineWidth = 0.2;
    ctx.strokeStyle = "#e82424";
    ctx.beginPath();
    ctx.moveTo(3, 0.2);
    ctx.lineTo(-3, 0.2);
    ctx.stroke();
    ctx.strokeStyle = "#2424e8";
    ctx.beginPath();
    ctx.moveTo(cutoff, 0.2);
    ctx.lineTo(-cutoff, 0.2);
    ctx.stroke();
    if (fisherz(r, n, a)) {
        ctx.strokeStyle = "#2424e8";
    }
    else {
        ctx.strokeStyle = "#e82424";
    }
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    const z = Math.atanh(r);
    ctx.moveTo(z, 1.2);
    ctx.lineTo(z, -0.8);
    ctx.stroke();
    ctx.restore();
}
const scatter_container = document.getElementById("scatter-container");
const pdf_container = document.getElementById("pdf-container");
const scatter_plot = document.getElementById("scatter-plot");
const signif_pdf = document.getElementById("signif-pdf");
const sample_range = document.getElementById("sample-range");
const corr_range = document.getElementById("corr-range");
const alpha_range = document.getElementById("alpha-range");
const sample = document.getElementById("sample");
const corr = document.getElementById("corr");
const alpha = document.getElementById("alpha");
if (scatter_container === null) {
    throw new Error("No canvas with `id` scatter-container was found");
}
if (pdf_container === null) {
    throw new Error("No canvas with `id` pdf-container was found");
}
if (scatter_plot === null) {
    throw new Error("No canvas with `id` scatter-plot was found");
}
if (signif_pdf === null) {
    throw new Error("No canvas with `id` signif-pdf was found");
}
if (sample_range === null) {
    throw new Error("No input with `id` sample-range was found");
}
if (corr_range === null) {
    throw new Error("No input with `id` corr-range was found");
}
if (alpha_range === null) {
    throw new Error("No input with `id` alpha-range was found");
}
if (sample === null) {
    throw new Error("No input with `id` sample was found");
}
if (corr === null) {
    throw new Error("No input with `id` corr was found");
}
if (alpha === null) {
    throw new Error("No input with `id` alpha was found");
}
scatter_plot.width = scatter_container.clientWidth;
scatter_plot.height = 0.8 * scatter_container.clientWidth;
signif_pdf.width = pdf_container.clientWidth;
signif_pdf.height = 0.8 * pdf_container.clientWidth;
const scatter_ctx = scatter_plot.getContext("2d");
const pdf_ctx = signif_pdf.getContext("2d");
if (scatter_ctx === null) {
    throw new Error("2D context is not supported");
}
if (pdf_ctx === null) {
    throw new Error("2D context is not supported");
}
let n = Math.round(Math.pow(10, 1 + (3 / 100) * parseFloat(sample_range.value)));
sample.textContent = n.toString();
let r = (2 / 100) * parseFloat(corr_range.value) - 1;
corr.textContent = r.toFixed(2);
let a = Math.pow(10, -(3 / 100) * (100 - parseFloat(alpha_range.value)));
alpha.textContent = a.toFixed(3);
const N = 10000;
const X = new Matrix(N, 2, rnorm(2 * N));
let Y = new Matrix(n, 2);
let L = new Matrix(2, 2, [1, r, r, 1]).cholesky();
if (X.data !== undefined) {
    Y = new Matrix(n, 2, X.data.slice(0, 2 * n));
    normalize(Y);
    draw_scatter(scatter_ctx, Y.matmul(L.t()));
}
draw_pdf(pdf_ctx, n, r, a);
window.addEventListener("resize", function () {
    scatter_plot.width = scatter_container.clientWidth;
    scatter_plot.height = 0.8 * scatter_container.clientWidth;
    signif_pdf.width = pdf_container.clientWidth;
    signif_pdf.height = 0.8 * pdf_container.clientWidth;
    if (X.data !== undefined) {
        Y = new Matrix(n, 2, X.data.slice(0, 2 * n));
        normalize(Y);
        draw_scatter(scatter_ctx, Y.matmul(L.t()));
    }
    draw_pdf(pdf_ctx, n, r, a);
});
sample_range.addEventListener('input', function () {
    n = Math.round(Math.pow(10, 1 + (3 / 100) * parseFloat(sample_range.value)));
    sample.textContent = n.toString();
    if (X.data !== undefined) {
        Y = new Matrix(n, 2, X.data.slice(0, 2 * n));
        normalize(Y);
        draw_scatter(scatter_ctx, Y.matmul(L.t()));
    }
    draw_pdf(pdf_ctx, n, r, a);
});
corr_range.addEventListener('input', function () {
    r = (2 / 100) * parseFloat(corr_range.value) - 1;
    corr.textContent = r.toFixed(2);
    L = new Matrix(2, 2, [1, r, r, 1]).cholesky();
    draw_scatter(scatter_ctx, Y.matmul(L.t()));
    draw_pdf(pdf_ctx, n, r, a);
});
alpha_range.addEventListener('input', function () {
    a = Math.pow(10, -(3 / 100) * (100 - parseFloat(alpha_range.value)));
    alpha.textContent = a.toFixed(3);
    draw_pdf(pdf_ctx, n, r, a);
});
//# sourceMappingURL=index.js.map