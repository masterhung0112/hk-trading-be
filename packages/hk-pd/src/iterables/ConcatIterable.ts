import { ConcatIterator } from '../iterators/ConcatIterator'

export class ConcatIterable<T> implements Iterable<T> {    
    constructor(public iterables: Iterable<Iterable<T>>) {

    }

    [Symbol.iterator](): Iterator<any> {
        return new ConcatIterator(this.iterables)
    }
}