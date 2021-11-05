import { ArrayIterator } from './ArrayIterator'

export class ColumnNamesIterator implements Iterator<string> {
    private _columnNamesIterator: Iterator<string> | null = null

    constructor(private _values: Iterable<any>, private _considerAllRows: boolean) {

    }

    next(): IteratorResult<string> {
        if (this._columnNamesIterator === null) {
            if (this._considerAllRows) {
                const combinedFields: any = {}

                // Check all items
                for (const value of this._values) {
                    for (const fieldName of Object.keys(value)) {
                        combinedFields[fieldName] = true
                    }
                }

                this._columnNamesIterator = new ArrayIterator(Object.keys(combinedFields))
            } else {
                // just check the first item
                const valuesIterator = this._values[Symbol.iterator]()
                const firstResult = valuesIterator.next()
                if (firstResult.done) {
                    return {
                        done: true,
                        value: ''
                    }
                }

                this._columnNamesIterator = new ArrayIterator(Object.keys(firstResult.value))
            }
        }

        return this._columnNamesIterator.next()
    }
}