import { SelectorWithIndexFn } from '../core/SelectorWithIndexFn'

export class SelectIterator<ValueT, ToT> implements Iterator<ToT> {
    private _index = 0
    
    constructor(private _iterator: Iterator<ValueT>, private _selector: SelectorWithIndexFn<ValueT, ToT>) {

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