import { CsvRowsIterator } from '../iterators/CsvRowsIterator'

export class CsvRowsIterable implements Iterable<any> {
    constructor(private _columnNames: Iterable<string>, private _rows: Iterable<any>) {

    }

    [Symbol.iterator](): Iterator<any> {
        return new CsvRowsIterator(this._columnNames, this._rows)
    }
}