"use strict";
class Matrix {
    constructor(rows, cols, data) {
        this.rows = rows;
        this.cols = cols;
        if (data !== undefined) {
            this.data = data;
        }
        else {
            this.data = new Array(rows * cols).fill(0);
        }
    }
    set(i, j, x) {
        if (i > this.rows) {
            new Error("Index i out of range");
        }
        if (j > this.cols) {
            new Error("Index j out of range");
        }
        if (this.data !== undefined) {
            this.data[i * this.cols + j] = x;
        }
        new Error("Matrix data undefined");
    }
    get(i, j) {
        if (i > this.rows) {
            new Error("Index i out of range");
        }
        if (j > this.cols) {
            new Error("Index j out of range");
        }
        if (this.data !== undefined) {
            return this.data[i * this.cols + j];
        }
        new Error("Matrix data undefined");
        return 1;
    }
    add(x) {
        const out = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                out.set(i, j, this.get(i, j) + x);
            }
        }
        return out;
    }
    sub(x) {
        const out = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                out.set(i, j, this.get(i, j) - x);
            }
        }
        return out;
    }
    mul(x) {
        const out = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                out.set(i, j, this.get(i, j) * x);
            }
        }
        return out;
    }
    div(x) {
        if (x === 0) {
            new Error("Divide by zero");
        }
        const out = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                out.set(i, j, this.get(i, j) / x);
            }
        }
        return out;
    }
    matmul(that) {
        if (this.cols !== that.rows) {
            new Error("Dimension mismatch");
        }
        const out = new Matrix(this.rows, that.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < that.cols; j++) {
                for (let k = 0; k < this.cols; k++) {
                    out.set(i, j, out.get(i, j) + this.get(i, k) * that.get(k, j));
                }
            }
        }
        return out;
    }
    t() {
        const out = new Matrix(this.cols, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                out.set(j, i, this.get(i, j));
            }
        }
        return out;
    }
    cholesky() {
        // NEED TO CHECK PD
        if (this.rows !== this.cols) {
            new Error("Matrix not square");
        }
        const L = new Matrix(this.rows, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j <= i; j++) {
                let sum = 0;
                for (let k = 0; k < j; k++) {
                    sum += L.get(i, k) * L.get(j, k);
                }
                if (i === j) {
                    L.set(i, j, Math.sqrt(this.get(i, j) - sum));
                }
                else {
                    L.set(i, j, 1 / L.get(j, j) * (this.get(i, j) - sum));
                }
            }
        }
        return L;
    }
    ix(rows, cols) {
        // NEED A VALIDATION CHECK
        const out = new Matrix(rows.length, cols.length);
        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < cols.length; j++) {
                out.set(i, j, this.get(rows[i], cols[j]));
            }
        }
        return out;
    }
    inv() {
        // TODO
        if (this.rows !== this.cols) {
            new Error("Matrix not square");
        }
        const out = new Matrix(this.rows, this.rows);
        const L = this.cholesky();
        // for (let i = 0; i < this.rows; i++) {
        // out.set(i, j);
        // }
        return out;
    }
}
function normize(X) {
    for (let j = 0; j < X.cols; j++) {
        let sig2 = 0;
        for (let i = 0; i < X.rows; i++) {
            sig2 += Math.pow(X.get(i, j), 2);
        }
        sig2 = Math.sqrt(sig2 / X.rows);
        for (let i = 0; i < X.rows; i++) {
            X.set(i, j, X.get(i, j) / sig2);
        }
    }
}
function norminv(x) {
    return 2.69282508 * Math.log(1 - Math.log(-Math.log(x)) / 3.09104245 - 0.11857259);
}
function norm(x, mu, sig2) {
    return Math.pow(2 * Math.PI * sig2, -0.5) * Math.exp(-Math.pow(x - mu, 2) / (2 * sig2));
}
function rnorm(n = 1) {
    const X = Array.from({ length: n }, () => Math.random());
    for (let i = 0; i < n; i++) {
        if (X[i] < 0.5) {
            X[i] = -norminv(1 - X[i]);
        }
        else {
            X[i] = norminv(X[i]);
        }
    }
    return X;
}
function fisherz(r, n, alpha) {
    return Math.sqrt(n - 3) * Math.abs(Math.atanh(r)) <= norminv(1 - alpha / 2);
}
function draw_scatter(ctx, X) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    ctx.fillStyle = "#181818";
    ctx.beginPath();
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(w / 20, w / 20);
    ctx.fillStyle = "#585858";
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
            ctx.fillStyle = "#E82424";
        }
        else {
            ctx.fillStyle = "#585858";
        }
        ctx.beginPath();
        const pdf = norm(i * b / q, 0, Math.pow(std, 2));
        ctx.rect(i * b / q, 0, b / q, -1 * pdf);
        ctx.rect(i * b / -q, 0, b / -q, -1 * pdf);
        ctx.fill();
    }
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "#E82424";
    ctx.beginPath();
    ctx.moveTo(3, 0.2);
    ctx.lineTo(-3, 0.2);
    ctx.stroke();
    ctx.strokeStyle = "#2424E8";
    ctx.beginPath();
    ctx.moveTo(cutoff, 0.2);
    ctx.lineTo(-cutoff, 0.2);
    ctx.stroke();
    if (fisherz(r, n, a)) {
        ctx.strokeStyle = "#2424E8";
    }
    else {
        ctx.strokeStyle = "#E82424";
    }
    ctx.lineWidth = 0.02;
    ctx.beginPath();
    const z = Math.atanh(r);
    ctx.moveTo(z, 1.2);
    ctx.lineTo(z, -0.8);
    ctx.stroke();
    ctx.restore();
}
const scatter_container = document.getElementById("scatter-container");
const pdf_container = document.getElementById("pdf-container");
const scatter_plot = document.getElementById("scatter_plot");
const signif_pdf = document.getElementById("signif_pdf");
const sample_range = document.getElementById("sample_range");
const corr_range = document.getElementById("corr_range");
const alpha_range = document.getElementById("alpha_range");
const sample = document.getElementById("sample");
const corr = document.getElementById("corr");
const alpha = document.getElementById("alpha");
if (scatter_container === null) {
    throw new Error("No canvas with `id` scatter_container was found");
}
if (pdf_container === null) {
    throw new Error("No canvas with `id` pdf_container was found");
}
if (scatter_plot === null) {
    throw new Error("No canvas with `id` scatter_plot was found");
}
if (signif_pdf === null) {
    throw new Error("No canvas with `id` signif_pdf was found");
}
if (sample_range === null) {
    throw new Error("No input with `id` sample_range was found");
}
if (corr_range === null) {
    throw new Error("No input with `id` corr_range was found");
}
if (alpha_range === null) {
    throw new Error("No input with `id` alpha_range was found");
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
    normize(Y);
    draw_scatter(scatter_ctx, Y.matmul(L.t()));
}
draw_pdf(pdf_ctx, n, r, a);
sample_range.addEventListener('input', function () {
    n = Math.round(Math.pow(10, 1 + (3 / 100) * parseFloat(sample_range.value)));
    sample.textContent = n.toString();
    if (X.data !== undefined) {
        Y = new Matrix(n, 2, X.data.slice(0, 2 * n));
        normize(Y);
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