export class ColumnsToArraysIterator implements Iterator<any> {
    private _columnNamesIterator: Iterator<string>
    // private _rowsIterator: Iterator<any>

    constructor(columnNames: Iterable<string>, protected rowsIterable: Iterable<any>) {
        this._columnNamesIterator = columnNames[Symbol.iterator]()
        // this._rowsIterator = rowsIterable[Symbol.iterator]()
    }

    next(): IteratorResult<any> {
        const currentColumnNameValue = this._columnNamesIterator.next()
        if (currentColumnNameValue.done) {
            return { done: true } as IteratorResult<any>
        }

        const value: any = []

        for (const row of this.rowsIterable) {
            value.push(row[currentColumnNameValue.value])
        }

        return {
            done: false,
            value: value,
        }
    }
}