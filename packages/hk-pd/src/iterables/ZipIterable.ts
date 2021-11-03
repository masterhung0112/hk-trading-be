import { ZipFn, ZipIterator } from '../iterators/ZipIterator'

export class ZipIterable<ValueT, ReturnT> implements Iterable<ReturnT> {
    constructor(protected iterables: Iterable<ValueT>[], protected zipper: ZipFn<ValueT, ReturnT>) {
    }

    [Symbol.iterator](): Iterator<ReturnT> {
        return new ZipIterator<ValueT, ReturnT>(this.iterables, this.zipper)
    }
}