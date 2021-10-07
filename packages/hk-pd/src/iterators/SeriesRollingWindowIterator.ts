import { ISeries } from '../core/ISeries'
import { Series } from '../core/Series'
import { WhichIndex } from '../core/WhichIndex'

export class SeriesRollingWindowIterator<IndexT, ValueT> implements Iterator<[IndexT,ISeries<IndexT, ValueT>]> {
    curWindow: [IndexT, ValueT][] | undefined
    iterator: Iterator<[IndexT, ValueT]> | undefined

    constructor(public iterable: Iterable<[IndexT, ValueT]>, public period: number, public whichIndex: WhichIndex) {
    }

    next(): IteratorResult<[IndexT, ISeries<IndexT, ValueT>]> {
        if (!this.curWindow) {
            this.curWindow = []
            this.iterator = this.iterable[Symbol.iterator]()
            for (let i = 0; i < this.period; ++i) {
                const curPos = this.iterator.next()
                if (curPos.done) {
                    // Underlying iterator doesn't have required number of elements.
                    return ({ done: true } as IteratorResult<[IndexT,ISeries<IndexT, ValueT>]>)
                }
                this.curWindow.push(curPos.value)
            }
        } else {
            this.curWindow.shift() // Remove first item from window.
            
            const curPos = this.iterator!.next()
            if (curPos.done) {
                // Underlying iterator doesn't have enough elements left.
                return ({ done: true } as IteratorResult<[IndexT,ISeries<IndexT, ValueT>]>)
            }

            this.curWindow.push(curPos.value) // Add next item to window.
        }

        const window = new Series<IndexT, ValueT>({
            pairs: this.curWindow
        })

        return {
            //TODO: The way the index is figured out could have much better performance.
            value: [this.whichIndex === WhichIndex.Start ? window.getIndex().first() : window.getIndex().last(), window],
            done: false,
        }
    }
}