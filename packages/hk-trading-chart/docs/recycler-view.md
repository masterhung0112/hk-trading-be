With a list of drawable objects, I just want to update data

```ts
interface IRecyclerView {
    calculateSize(): void
    getMaxScrollSize(): number
    setData(data: T[]): void
    insert(index: number, ...data, T[]): void
    splice(start: number, end?: number) => void
    push(...items: T[]): void
}
interface RecyclerViewRenderer {
}

```