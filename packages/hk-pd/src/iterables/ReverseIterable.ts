import { ArrayIterator } from '../iterators/ArrayIterator'

export class ReverseIterable<T> implements Iterable<T> {

    iterable: Iterable<T>;

    constructor(iterable: Iterable<T>) {
        this.iterable = iterable
    }

    [Symbol.iterator](): Iterator<any> {
        const working = []
        for (const value of this.iterable) {
            working.push(value)
        }
        working.reverse()
        return new ArrayIterator(working)
    }
}