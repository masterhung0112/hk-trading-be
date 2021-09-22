import { ArrayIterator } from '../iterators/ArrayIterator'

export class ArrayIterable<T> implements Iterable<T> {
    constructor(protected arr: T[]) {}

    [Symbol.iterator](): Iterator<T> {
        return new ArrayIterator(this.arr)
    }
}