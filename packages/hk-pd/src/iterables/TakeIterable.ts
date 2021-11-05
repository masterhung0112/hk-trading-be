import { TakeIterator } from '../iterators/TakeIterator'

export class TakeIterable<T> implements Iterable<T> {

    constructor(public childIterable: Iterable<T>, public numElements: number) {
      
    }

    [Symbol.iterator](): Iterator<any> {
        const childIterator = this.childIterable[Symbol.iterator]()
        return new TakeIterator(childIterator, this.numElements)
    }
}