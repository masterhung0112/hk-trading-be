import { ComparerFn } from '../core/ComparerFn'
import { ISeries } from '../core/ISeries'
import { SeriesVariableWindowIterator } from '../iterators/SeriesVariableWindowIterator'

export class SeriesVariableWindowIterable<IndexT, ValueT> implements Iterable<ISeries<IndexT, ValueT>> {
    constructor(public iterable: Iterable<[IndexT, ValueT]>, public comparer: ComparerFn<ValueT>) {
    }

    [Symbol.iterator](): Iterator<ISeries<IndexT, ValueT>> {
        return new SeriesVariableWindowIterator(this.iterable, this.comparer)
    }
}