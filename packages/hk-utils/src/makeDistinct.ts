//
// Helper function to only return distinct items.
//
export function makeDistinct<ItemT, KeyT>(items: Iterable<ItemT>, selector?: (item: ItemT) => KeyT): ItemT[] {
    const set: any = {}
    const output: any[] = []
    for (const item of items) {
        const key = selector && selector(item) || item
        if (!set[key]) {
            // Haven't yet seen this key.
            set[key] = true
            output.push(item)
        }
    }

    return output
}
