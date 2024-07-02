export class Matrix {
    rows;
    cols;
    data;
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
    matadd(that) {
        if (this.rows !== that.rows || this.cols !== that.cols) {
            new Error("Dimension mismatch");
        }
        const out = new Matrix(this.rows, this.cols);
        if (this.data !== undefined && that.data !== undefined && out.data !== undefined) {
            for (let i = 0; i < out.data.length; i++) {
                out.data[i] = this.data[i] + that.data[i];
            }
        }
        return out;
    }
    matsub(that) {
        if (this.rows !== that.rows || this.cols !== that.cols) {
            new Error("Dimension mismatch");
        }
        const out = new Matrix(this.rows, this.cols);
        if (this.data !== undefined && that.data !== undefined && out.data !== undefined) {
            for (let i = 0; i < out.data.length; i++) {
                out.data[i] = this.data[i] - that.data[i];
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
        if (this.rows !== this.cols) {
            new Error("Matrix not square");
        }
        const L = new Matrix(this.rows, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j <= i; j++) {
                let s = 0;
                for (let k = 0; k < j; k++) {
                    s += L.get(i, k) * L.get(j, k);
                }
                if (i === j) {
                    L.set(i, j, Math.sqrt(this.get(i, i) - s));
                }
                else {
                    L.set(i, j, 1 / L.get(j, j) * (this.get(i, j) - s));
                }
            }
        }
        return L;
    }
    ix(rows, cols) {
        for (let i = 0; i < rows.length; i++) {
            if (rows[i] < 0 || this.rows < rows[i]) {
                new Error("Index out of range");
            }
        }
        for (let i = 0; i < cols.length; i++) {
            if (cols[i] < 0 || this.cols < cols[i]) {
                new Error("Index out of range");
            }
        }
        const out = new Matrix(rows.length, cols.length);
        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < cols.length; j++) {
                out.set(i, j, this.get(rows[i], cols[j]));
            }
        }
        return out;
    }
    inv() {
        const L = this.cholesky();
        const R = new Matrix(L.rows, L.rows);
        for (let i = 0; i < L.rows; i++) {
            R.set(i, i, 1 / L.get(i, i));
            for (let j = 0; j < i; j++) {
                let s = 0;
                for (let k = j; k < i; k++) {
                    s = s + L.get(i, k) * R.get(k, j);
                }
                R.set(i, j, -s * R.get(i, i));
            }
        }
        return R.t().matmul(R);
    }
}
export function normize(X) {
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
export function cov(X) {
    return X.t().matmul(X);
}
export function beta(R, y, Z) {
    const Zy = R.ix(Z, [y]);
    const iZZ = R.ix(Z, Z).inv();
    return iZZ.matmul(Zy);
}
//# sourceMappingURL=matrix.js.map