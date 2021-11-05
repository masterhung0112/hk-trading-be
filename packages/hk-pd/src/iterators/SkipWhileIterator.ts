import { PredicateFn } from '../core/PredicateFn'

export class SkipWhileIterator<T> implements Iterator<T> {
    doneSkipping = false
    
    constructor(public childIterator: Iterator<T>, public predicate: PredicateFn<T>) {

    }

    next(): IteratorResult<T> {
        while (true) {
            const result = this.childIterator.next()
            if (result.done) {
                return result
            }

            if (!this.doneSkipping && this.predicate(result.value)) {
                continue
            }

            this.doneSkipping = true
            return result
        }
    }
}