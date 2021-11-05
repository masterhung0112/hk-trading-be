import { PredicateFn } from '../core/PredicateFn'

export class TakeWhileIterator<T> implements Iterator<T> {
    done = false;

    constructor(public childIterator: Iterator<T>, public predicate: PredicateFn<T>) {
    }

    next(): IteratorResult<T> {
        if (!this.done) {
            const result = this.childIterator.next()
            if (result.done) {
                this.done = true
            }
            else if (this.predicate(result.value)) {
                return result
            }
            else {
                this.done = true
            }
        }

        // https://github.com/Microsoft/TypeScript/issues/8938
        return ({ done: true } as IteratorResult<T>)  // <= explicit cast here!;
    }
}