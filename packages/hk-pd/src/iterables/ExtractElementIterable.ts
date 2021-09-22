import { ExtractElementIterator } from '../iterators/ExtractElementIterator'

export class ExtractElementIterable implements Iterable<any> {
    constructor(private _arrayIterable: Iterable<any[]>, private _extractIndex: number) {
    }

    [Symbol.iterator](): Iterator<any> {
        const arrayIterator = this._arrayIterable[Symbol.iterator]()
        return new ExtractElementIterator(arrayIterator, this._extractIndex)
    }
}