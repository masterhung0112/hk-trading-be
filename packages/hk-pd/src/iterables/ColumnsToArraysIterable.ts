import { ColumnsToArraysIterator } from '../iterators/ColumnsToArraysIterator'

export class ColumnsToArraysIterable<ValueT, ToT> implements Iterable<ToT> {
    constructor(protected columnNames: string[], protected iterable: Iterable<ValueT>) {

    }

    [Symbol.iterator](): Iterator<ToT> {
        return new ColumnsToArraysIterator(this.columnNames, this.iterable)
    }
}