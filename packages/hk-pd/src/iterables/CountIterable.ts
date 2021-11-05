import { CountIterator } from '../iterators/CountIterator'

export class CountIterable implements Iterable<any> {
    [Symbol.iterator](): Iterator<any> {
        return new CountIterator()
    }
}