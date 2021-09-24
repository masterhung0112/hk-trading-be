import { IDataFrame } from '../core/IDataFrame'
import { DataFrameWindowIterator } from '../iterators/DataFrameWindowIterator'

export class DataFrameWindowIterable<IndexT, ValueT> implements Iterable<IDataFrame<IndexT, ValueT>> {
    constructor(public columnNames: Iterable<string>, public iterable: Iterable<[IndexT, ValueT]>, public period: number) {

    }

    [Symbol.iterator](): Iterator<IDataFrame<IndexT, ValueT>> {
        return new DataFrameWindowIterator(this.columnNames, this.iterable, this.period)
    }
}