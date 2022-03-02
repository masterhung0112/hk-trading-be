export function isArray<T = any>(v: any): v is T[] {
    return Array.isArray(v)
}