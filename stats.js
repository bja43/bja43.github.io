// Very Simply Explicitly Invertible Approximations of Normal Cumulative and Normal Quantile Function
// Soranzo, A. and Epure, E.
export function norminv(x) {
    return 2.69282508 * Math.log(1 - Math.log(-Math.log(x)) / 3.09104245 - 0.11857259);
}
export function norm(x, mu, sig2) {
    return Math.pow(2 * Math.PI * sig2, -0.5) * Math.exp(-Math.pow(x - mu, 2) / (2 * sig2));
}
export function rnorm(n = 1) {
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
// A Logistic Approximation to the Cumulative Normal Distribution
// Bowling S. R., Khasawneh M. T., Kaewkuekool S. and Cho B. R.
export function ncdf(z) {
    return 1 / (1 + Math.exp(-1.5976 * z - 0.07056 * Math.pow(z, 3)));
}
export function fisherz(r, n, alpha) {
    return Math.sqrt(n - 3) * Math.abs(Math.atanh(r)) <= norminv(1 - alpha / 2);
}
//# sourceMappingURL=stats.js.map