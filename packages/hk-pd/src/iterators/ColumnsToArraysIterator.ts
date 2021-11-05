export class ColumnsToArraysIterator implements Iterator<any> {
    private _columnNames: string[]
    private _rowsIterator: Iterator<any>

    constructor(columnNames: Iterable<string>, rowsIterable: Iterable<any>) {
        this._columnNames = Array.from(columnNames)
        this._rowsIterator = rowsIterable[Symbol.iterator]()
    }

    next(): IteratorResult<any> {
        const result = this._rowsIterator.next()
        if (result.done) {
            return ({ done: true, value: undefined })
        }

        const row = result.value
        const value: any = []

        for (let cellIndex = 0; cellIndex < this._columnNames.length; ++cellIndex) {
            const columnName = this._columnNames[cellIndex]
            value.push(row[columnName])
        }

        return {
            done: false,
            value: value,
        }
    }
}