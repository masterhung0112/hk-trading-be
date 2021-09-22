export class ArrayIterator<T> implements Iterator<T> {
    protected index = 0

    constructor(protected arr: T[]) {

    }
    
    next(): IteratorResult<T> {
        if (this.index < this.arr.length) {
            return {
                done: false,
                value: this.arr[this.index++]
            }
        } else {
            return { done: true, value: undefined }
        }
    }
}