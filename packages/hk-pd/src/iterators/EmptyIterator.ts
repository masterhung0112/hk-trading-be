export class EmptyIterator implements Iterator<any> {
    next(): IteratorResult<any> {
        return {
            done: true,
            value: null,
        }
    }
}