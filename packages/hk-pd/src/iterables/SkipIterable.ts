import { SkipIterator } from '../iterators/SkipIterator'

export class SkipIterable implements Iterable<any> {

    iterable: Iterable<any>;
    numValues: number;

    constructor(iterable: Iterable<any>, numValues: number) {
        this.iterable = iterable
        this.numValues = numValues
    }

    [Symbol.iterator](): Iterator<any> {
        const iterator = this.iterable[Symbol.iterator]()
        return new SkipIterator(iterator, this.numValues)
    }
}