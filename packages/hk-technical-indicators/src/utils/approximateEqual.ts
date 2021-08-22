export function approximateEqual(a: number, b: number): boolean {
    const left = parseFloat(Math.abs(a - b).toPrecision(4))// * 1
    const right = parseFloat((a * 0.001).toPrecision(4))// * 1
    return left <= right
}