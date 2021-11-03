import { RepeatIterator } from '../iterators/RepeatIterator'

export class RepeatIterable<T> implements Iterable<T> {
    constructor(protected iterable: Iterable<T>, protected count: number) {
  
    }

    [Symbol.iterator](): Iterator<any> {
        return new RepeatIterator(this.iterable, this.count)
    }
}