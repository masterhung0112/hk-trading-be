import { PredicateFn } from '../core/PredicateFn'
import { SkipWhileIterator } from '../iterators/SkipWhileIterator'

export class SkipWhileIterable<T> implements Iterable<T> {

    constructor(public childIterable: Iterable<T>, public predicate: PredicateFn<T>) {

    }

    [Symbol.iterator](): Iterator<any> {
        const childIterator = this.childIterable[Symbol.iterator]()
        return new SkipWhileIterator(childIterator, this.predicate)
    }
}