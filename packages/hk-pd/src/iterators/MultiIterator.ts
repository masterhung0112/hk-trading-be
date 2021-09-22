export class MultiIterator implements Iterator<any[]> {
    constructor(private _iterators: Iterator<any>[]) {
    }

    next(): IteratorResult<any[]> {
        if (this._iterators.length === 0) {
            return {
                done: true,
                value: [],
            }
        }

        const multiResult = []

        for (const iterator of this._iterators) {
            const result = iterator.next()
            if (result.done) {
                return {
                    done: true,
                    value: []
                }
            }
            multiResult.push(result.value)
        }

        return {
            done: false,
            value: multiResult
        }
    }
}