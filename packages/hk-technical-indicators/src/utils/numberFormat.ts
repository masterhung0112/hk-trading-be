export function numberFormat(v: number): number {
    let precision: number = 10;
    if (precision) {
        return parseFloat(v.toPrecision(precision));
    }
    return v;
}