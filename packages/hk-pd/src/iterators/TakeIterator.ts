export class TakeIterator<T> implements Iterator<T> {
    constructor(private _childIterator: Iterator<T>, private _numElements: number) {

    }
    
    next(): IteratorResult<T> {
        if (this._numElements < 0) {
            return {done: true, value: undefined}
        }

        --this._numElements
        return this._childIterator.next()
    }
}