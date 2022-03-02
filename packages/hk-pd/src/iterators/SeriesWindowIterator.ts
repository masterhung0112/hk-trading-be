import { Series } from '../core/Series'
import { ISeries } from '../core/ISeries'
import { WhichIndex } from '../core/WhichIndex'

export class SeriesWindowIterator<IndexT, ValueT> implements Iterator<[IndexT, ISeries<IndexT, ValueT>]> {
    iterator: Iterator<[IndexT, ValueT]> | undefined

    constructor(public iterable: Iterable<[IndexT, ValueT]>, public period: number, public whichIndex: WhichIndex) {

    }

    next(): IteratorResult<[IndexT, ISeries<IndexT, ValueT>]> {
        if (!this.iterator) {
            this.iterator = this.iterable[Symbol.iterator]()
        }

        const curWindow = []

        for (let i = 0; i < this.period; ++i) {
            const curPos = this.iterator.next()
            if (curPos.done) {
                break
            }
            curWindow.push(curPos.value)
        }

        if (curWindow.length === 0) {
            return ({ done: true }) as IteratorResult<[IndexT, ISeries<IndexT, ValueT>]> 
        }

        const window = new Series<IndexT, ValueT>({
            pairs: curWindow
        })

        return {
            value: [this.whichIndex === WhichIndex.Start ? window.getIndex().first(): window.getIndex().last(), window],
            done: false
        }
    }
}