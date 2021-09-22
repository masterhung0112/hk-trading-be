import { MultiIterator } from '../iterators/MultiIterator'

export class MultiIterable implements Iterable<any> {
    constructor(private _iterables: Iterable<any>[]) {
    }

    [Symbol.iterator](): Iterator<any> {
        const iterators: Iterator<any>[] = []
        for (const iterable of this._iterables) {
            iterators.push(iterable[Symbol.iterator]())
        }
        return new MultiIterator(iterators)
    }
}