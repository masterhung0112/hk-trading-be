export class ExtractElementIterator implements Iterator<any> {
    constructor(private _iterator: Iterator<any[]>, private _extractIndex: number) {

    }

    next(): IteratorResult<any> {
        const result = this._iterator.next()
        if (result.done) {
            return result
        } else {
            return {
                done: false,
                value: result.value[this._extractIndex]
            }
        }
    }
}