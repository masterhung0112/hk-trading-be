//
// Helper function to map an array of objects.
//
export function toMap2<InT, KeyT, ValueT>(items: Iterable<InT>, keySelector: (item: InT) => KeyT, valueSelector: (item: InT) => ValueT): Map<KeyT, ValueT> {
    const output = new Map<KeyT, ValueT>()
    for (const item of items) {
        output.set(keySelector(item), valueSelector(item))
    }
    return output
}