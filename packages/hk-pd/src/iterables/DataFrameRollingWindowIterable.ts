import { IDataFrame } from '../core/IDataFrame'
import { DataFrameRollingWindowIterator } from '../iterators/DataFrameRollingWindowIterator'

export class DataFrameRollingWindowIterable<IndexT, ValueT> implements Iterable<IDataFrame<IndexT, ValueT>> {

    constructor(public columnNames: Iterable<string>, public iterable: Iterable<[IndexT, ValueT]>, public period: number) {

    }

    [Symbol.iterator](): Iterator<IDataFrame<IndexT, ValueT>> {
        return new DataFrameRollingWindowIterator(this.columnNames, this.iterable, this.period)
    }
}