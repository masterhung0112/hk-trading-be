export function attempt<T, U>(fn: ((arg?: U) => T), arg?: U): T | U | undefined {
    try {
        return fn(arg)
    } catch {
        return arg
    }
}