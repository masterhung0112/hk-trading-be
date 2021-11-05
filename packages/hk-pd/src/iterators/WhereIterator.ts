import { PredicateFn } from '../core/PredicateFn'

export class WhereIterator<T> implements Iterator<T> {
    constructor(public childIterator: Iterator<T>, public predicate: PredicateFn<T>) {
    }

    next(): IteratorResult<T> {
        while (true) {
            const result = this.childIterator.next()
            if (result.done) {
                return result
            }

            if (this.predicate(result.value)) {
                return result
            }
        }
    }
}