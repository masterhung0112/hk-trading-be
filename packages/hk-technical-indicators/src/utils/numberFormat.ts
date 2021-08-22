export function numberFormat(v: number): number {
    const precision = 10
    if (precision) {
        return parseFloat(v.toPrecision(precision))
    }
    return v
}