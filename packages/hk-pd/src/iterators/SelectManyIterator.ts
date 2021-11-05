export type SelectorManyFn<ValueT, ToT> = (value: ValueT, index: number) => Iterable<ToT>

export class SelectManyIterator<ValueT, ToT> implements Iterator<ToT> {
    index = 0
    outputIterator: Iterator<ToT> | null = null

    constructor(public iterator: Iterator<ValueT>, public selector: SelectorManyFn<ValueT, ToT>) {

    }

    next(): IteratorResult<ToT> {
        while (true) {
            if (this.outputIterator === null) {
                const result = this.iterator.next()
                if (result.done) {
                    return { done: true } as IteratorResult<ToT>
                }

                const outputIterator = this.selector(result.value, this.index++)
                this.outputIterator = outputIterator[Symbol.iterator]()
            }

            const outputResult = this.outputIterator!.next()
            if (outputResult.done) {
                this.outputIterator = null
                continue
            } else {
                return outputResult
            }
        }
    }
}