import { SelectorFnNoIndex } from '../core/SelectorFnNoIndex'
import { DistinctIterator } from '../iterators/DistinctIterator'

export class DistinctIterable<FromT, ToT> implements Iterable<FromT> {

    constructor(protected iterable: Iterable<FromT>, protected selector?: SelectorFnNoIndex<FromT, ToT>) {

    }

    [Symbol.iterator](): Iterator<FromT> {
        return new DistinctIterator(this.iterable, this.selector)
    }
}