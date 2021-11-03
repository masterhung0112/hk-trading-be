import { TileIterator } from '../iterators/TileIterator'

export class TileIterable<T> implements Iterable<T> {
    constructor(protected iterable: Iterable<T>, protected count: number) {
    }

    [Symbol.iterator](): Iterator<any> {
        return new TileIterator(this.iterable, this.count)
    }
}