export function isNumber(v: any): v is number {
    return Number.isFinite(v)
}