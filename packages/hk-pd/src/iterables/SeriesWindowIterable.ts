import { ISeries } from '../core/ISeries'
import { WhichIndex } from '../core/WhichIndex'
import { SeriesWindowIterator } from '../iterators/SeriesWindowIterator'

export class SeriesWindowIterable<IndexT, ValueT> implements Iterable<[IndexT,ISeries<IndexT, ValueT>]> {   
    constructor(public iterable: Iterable<[IndexT, ValueT]>, public period: number, public whichIndex: WhichIndex) {
        
    }

    [Symbol.iterator](): Iterator<[IndexT,ISeries<IndexT, ValueT>]> {
        return new SeriesWindowIterator(this.iterable, this.period, this.whichIndex)
    }
}