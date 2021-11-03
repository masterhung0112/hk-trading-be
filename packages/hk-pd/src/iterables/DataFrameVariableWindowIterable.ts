import { IDataFrame } from '../core/IDataFrame'
import { DataFrameVariableWindowIterator } from '../iterators/DataFrameVariableWindowIterator'

export class DataFrameVariableWindowIterable<IndexT, ValueT> implements Iterable<IDataFrame<IndexT, ValueT>> {
    constructor(protected columnNames: Iterable<string>, protected iterable: Iterable<[IndexT, ValueT]>, protected comparer: ComparerFn<ValueT>) {
    }

    [Symbol.iterator](): Iterator<IDataFrame<IndexT, ValueT>> {
        return new DataFrameVariableWindowIterator(this.columnNames, this.iterable, this.comparer)
    }
}