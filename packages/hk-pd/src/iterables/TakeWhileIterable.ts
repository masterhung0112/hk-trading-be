import { PredicateFn } from '../core/PredicateFn'
import { TakeWhileIterator } from '../iterators/TakeWhileIterator'

export class TakeWhileIterable<T> implements Iterable<T> {

    constructor(public childIterable: Iterable<T>, public predicate: PredicateFn<T>) {

    }

    [Symbol.iterator](): Iterator<any> {
        const childIterator = this.childIterable[Symbol.iterator]()
        return new TakeWhileIterator(childIterator, this.predicate)
    }
}