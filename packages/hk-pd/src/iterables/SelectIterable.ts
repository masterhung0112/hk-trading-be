import { SelectIterator, SelectorFn } from '../iterators/SelectIterator'

export class SelectIterable<ValueT, ToT> implements Iterable<ToT> {
    constructor(private _iterable: Iterable<ValueT>, private _selector: SelectorFn<ValueT, ToT>) {

    }

    [Symbol.iterator](): Iterator<ToT> {
        const iterator = this._iterable[Symbol.iterator]()
        return new SelectIterator<ValueT, ToT>(iterator, this._selector)
    }
}