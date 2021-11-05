export class ConcatIterator<T> implements Iterator<T> {
    
    iterator: Iterator<Iterable<T>>
    curIterator: Iterator<T> | null = null

    constructor(public iterables: Iterable<Iterable<T>>) {
        this.iterator = iterables[Symbol.iterator]()
        this._moveToNextIterable()
    }

    private _moveToNextIterable() {
        const nextIterable = this.iterator.next()
        if (nextIterable.done) {
            this.curIterator = null
        } else {
            this.curIterator = nextIterable.value[Symbol.iterator]()
        }
    }

    next(): IteratorResult<T> {
        while (true) {
            if (this.curIterator === null) {
                // Finished iterating all sub-iterators.
                // https://github.com/Microsoft/TypeScript/issues/8938
                return ({ done: true } as IteratorResult<T>)
            }

            const result = this.curIterator.next()
            if (!result.done) {
                return result
            }

            this._moveToNextIterable()
        }
    }
}