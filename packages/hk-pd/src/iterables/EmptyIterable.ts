import { EmptyIterator } from '../iterators/EmptyIterator'

export class EmptyIterable implements Iterable<any> {
    [Symbol.iterator](): Iterator<any, any, undefined> {
        return new EmptyIterator()
    }
}