import { ComparerFn } from '../core/ComparerFn'
import { ISeries } from '../core/ISeries'
import { Series } from '../core/Series'

export class SeriesVariableWindowIterator<IndexT, ValueT> implements Iterator<ISeries<IndexT, ValueT>> {

    iterator: Iterator<[IndexT, ValueT]>;
    nextValue: IteratorResult<[IndexT, ValueT]>;
    comparer: ComparerFn<ValueT>
    
    constructor(iterable: Iterable<[IndexT, ValueT]>, comparer: ComparerFn<ValueT>) {
        this.iterator = iterable[Symbol.iterator]()
        this.nextValue = this.iterator.next()
        this.comparer = comparer
    }

    next(): IteratorResult<ISeries<IndexT, ValueT>> {
        if (this.nextValue.done) {
            // Nothing more to read.
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<ISeries<IndexT, ValueT>>)  // <= explicit cast here!;
        }

        const pairs = [
            this.nextValue.value,
        ]

        let prevValue = this.nextValue.value

        // Pull values until there is one that doesn't compare.
        // eslint-disable-next-line no-constant-condition
        while (true) {
            this.nextValue = this.iterator.next()
            if (this.nextValue.done) {
                break // No more values.
            }

            // comparer returns True if data should be in the same window
            if (!this.comparer(prevValue[1], this.nextValue.value[1])) {
                prevValue = this.nextValue.value
                break // Doesn't compare. Start a new window.
            }      
            
            pairs.push(this.nextValue.value)
            prevValue = this.nextValue.value
        }

        const window = new Series<IndexT, ValueT>({
            pairs: pairs,
        })

        return {
            value: window,
            done: false,
        }
    }
}