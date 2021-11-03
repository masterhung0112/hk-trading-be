import { RavelIterator } from '../iterators/RavelIterator'

export class RavelIterable<T> implements Iterable<T> {

    constructor(protected iterables: Iterable<T>[]) {
    }

    [Symbol.iterator](): Iterator<T> {
        return new RavelIterator<T>(this.iterables)
    }
}