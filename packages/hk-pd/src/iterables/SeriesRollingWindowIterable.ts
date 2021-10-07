import { ISeries } from '../core/ISeries'
import { WhichIndex } from '../core/WhichIndex'
import { SeriesRollingWindowIterator } from '../iterators/SeriesRollingWindowIterator'

export class SeriesRollingWindowIterable<IndexT, ValueT> implements Iterable<[IndexT,ISeries<IndexT, ValueT>]> {
    constructor(public iterable: Iterable<[IndexT, ValueT]>, public period: number, public whichIndex: WhichIndex) {

    }

    [Symbol.iterator](): Iterator<[IndexT,ISeries<IndexT, ValueT>]> {
        return new SeriesRollingWindowIterator(this.iterable, this.period, this.whichIndex)
    }
}