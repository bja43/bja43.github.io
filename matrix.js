"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matrix = void 0;
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
exports.Matrix = Matrix;
//# sourceMappingURL=matrix.js.map