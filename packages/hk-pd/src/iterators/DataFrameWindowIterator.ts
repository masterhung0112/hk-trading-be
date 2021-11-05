import { IDataFrame } from '../core/IDataFrame'
import { DataFrame } from '../core/DataFrame'

export class DataFrameWindowIterator<IndexT, ValueT> implements Iterator<IDataFrame<IndexT, ValueT>> {
    iterator: Iterator<[IndexT, ValueT], [IndexT, ValueT]> | undefined = undefined

    constructor(
        public columnNames: Iterable<string>, 
        public iterable: Iterable<[IndexT, ValueT]>, 
        public period: number) {

    }

    next(): IteratorResult<IDataFrame<IndexT, ValueT>> {
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
            return ({done: true} as IteratorResult<IDataFrame<IndexT, ValueT>>)
        }

        const window = new DataFrame<IndexT, ValueT>({
            columnNames: this.columnNames,
            pairs: curWindow,
        })

        return {
            done: false,
            value: window,
        }
    }
}