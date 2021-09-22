import { ColumnNamesIterator } from '../iterators/ColumnNamesIterator'

export class ColumnNamesIterable implements Iterable<string> {
    constructor(private _values: Iterable<any>, private _considerAllRows: boolean) {
        
    }

    [Symbol.iterator](): Iterator<string> {
        return new ColumnNamesIterator(this._values, this._considerAllRows)
    }
}