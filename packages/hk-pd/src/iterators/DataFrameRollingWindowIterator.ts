import { IDataFrame } from '../core/IDataFrame'
import { DataFrame } from '../core/DataFrame'

export class DataFrameRollingWindowIterator<IndexT, ValueT> implements Iterator<IDataFrame<IndexT, ValueT>> {
    curWindow: [IndexT, ValueT][] | undefined;
    iterator: Iterator<[IndexT, ValueT]> | undefined;

    constructor(
        public columnNames: Iterable<string>, 
        public iterable: Iterable<[IndexT, ValueT]>, 
        public period: number) {

    }

    next(): IteratorResult<IDataFrame<IndexT, ValueT>> {
        if (!this.curWindow) {
            this.curWindow = []
            this.iterator = this.iterator[Symbol.iterator]()
            for (let i = 0; i < this.period; ++i) {
                const curPos = this.iterator.next()
                if (curPos.done) {
                    return ({ done: true } as IteratorResult<IDataFrame<IndexT, ValueT>>)
                }
                this.curWindow.push(curPos.value)
            }
        } else {
            this.curWindow.shift() // Remove first item from window

            const curPos = this.iterator!.next()
            if (curPos.done) {
                return ({ done: true } as IteratorResult<IDataFrame<IndexT, ValueT>>)
            }
            this.curWindow.push(curPos.value) 
        }

        const window = new DataFrame<IndexT, ValueT>({
            columnNames: this.columnNames,
            pairs: this.curWindow
        })

        return {
            value: window,
            done: false,
        }
    }
}