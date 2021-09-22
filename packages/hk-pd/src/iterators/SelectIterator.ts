export type SelectorFn<ValueT, ToT> = (value: ValueT, index: number) => ToT

export class SelectIterator<ValueT, ToT> implements Iterator<ToT> {
    private _index = 0
    
    constructor(private _iterator: Iterator<ValueT>, private _selector: SelectorFn<ValueT, ToT>) {

    }

    next(): IteratorResult<ToT> {
        const result = this._iterator.next()
        if (result.done) {
            return {done: true, value: undefined}
        }

        return {
            done: false,
            value: this._selector(result.value, this._index++)
        }
    }
}