export function isBoolean(v: any): v is boolean {
    return typeof v === typeof true
}