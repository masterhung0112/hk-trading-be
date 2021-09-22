export function toMap<InT, KeyT, ValueT>(items: Iterable<InT>, keySelector: (item: InT) => KeyT, valueSelector: (item: InT) => ValueT): any {
    const output: any = {}
    for (const item of items) {
        const key = keySelector(item)
        output[key] = valueSelector(item)
    }
    return output
}