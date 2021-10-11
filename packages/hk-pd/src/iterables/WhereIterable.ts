import { PredicateFn } from '../core/PredicateFn'
import { WhereIterator } from '../iterators/WhereIterator'

export class WhereIterable<T> implements Iterable<T> {
    constructor(public childIterable: Iterable<T>, public predicate: PredicateFn<T>) {

    }

    [Symbol.iterator](): Iterator<any> {
        const childIterator = this.childIterable[Symbol.iterator]()
        return new WhereIterator(childIterator, this.predicate)
    }
}