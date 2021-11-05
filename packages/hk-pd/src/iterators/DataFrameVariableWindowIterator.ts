import { ComparerFn } from '../core/ComparerFn'
import { DataFrame } from '../core/DataFrame'
import { IDataFrame } from '../core/IDataFrame'

/**
 * Compares to values and returns true if they are equivalent.
 */
// export type ComparerFn<ValueT> = (a: ValueT, b: ValueT) => boolean;

export class DataFrameVariableWindowIterator<IndexT, ValueT> implements Iterator<IDataFrame<IndexT, ValueT>> {

    columnNames: Iterable<string>;
    iterator: Iterator<[IndexT, ValueT]>;
    nextValue: IteratorResult<[IndexT, ValueT]>;
    comparer: ComparerFn<ValueT>

    constructor(columnNames: Iterable<string>, iterable: Iterable<[IndexT, ValueT]>, comparer: ComparerFn<ValueT>) {
        this.columnNames = columnNames
        this.iterator = iterable[Symbol.iterator]()
        this.nextValue = this.iterator.next()
        this.comparer = comparer
    }

    next(): IteratorResult<IDataFrame<IndexT, ValueT>> {
        if (this.nextValue.done) {
            // Nothing more to read.
            // https://github.com/Microsoft/TypeScript/issues/8938
            return ({ done: true } as IteratorResult<IDataFrame<IndexT, ValueT>>)  // <= explicit cast here!;
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

            if (!this.comparer(prevValue[1], this.nextValue.value[1])) {
                prevValue = this.nextValue.value
                break // Doesn't compare. Start a new window.
            }

            pairs.push(this.nextValue.value)
            prevValue = this.nextValue.value
        }

        const window = new DataFrame<IndexT, ValueT>({
            columnNames: this.columnNames,
            pairs: pairs,
        })

        return {
            value: window,
            done: false,
        }
    }
}