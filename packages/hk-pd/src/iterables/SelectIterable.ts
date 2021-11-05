import { SelectorWithIndexFn } from '../core/SelectorWithIndexFn'
import { SelectIterator } from '../iterators/SelectIterator'

export class SelectIterable<ValueT, ToT> implements Iterable<ToT> {
    constructor(private _iterable: Iterable<ValueT>, private _selector: SelectorWithIndexFn<ValueT, ToT>) {

    }

    [Symbol.iterator](): Iterator<ToT> {
        const iterator = this._iterable[Symbol.iterator]()
        return new SelectIterator<ValueT, ToT>(iterator, this._selector)
    }
}