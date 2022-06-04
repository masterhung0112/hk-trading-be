export function memoize(fn: (key: string) => void) {
    const cache = Object.create(null)
    return (key: string) => cache[key] || (cache[key] = fn(key))
}
