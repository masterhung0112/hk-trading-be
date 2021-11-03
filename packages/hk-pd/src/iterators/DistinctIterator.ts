import { SelectorFnNoIndex } from '../core/SelectorFnNoIndex'

export class DistinctIterator<FromT, ToT> implements Iterator<FromT> {

    iterator: Iterator<FromT>;
    selector?: SelectorFnNoIndex<FromT, ToT>;
    valuesAlreadySeen: Set<any> = new Set<any>();

    constructor(iterable: Iterable<FromT>, selector?: SelectorFnNoIndex<FromT, ToT>) {
        this.iterator = iterable[Symbol.iterator]()
        this.selector = selector
    }

    next(): IteratorResult<FromT> {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const result = this.iterator.next()
            if (result.done) {
                return ({ done: true } as IteratorResult<FromT>)
            }

            let potentialOutput: ToT
            if (this.selector) {
                potentialOutput = this.selector(result.value)
            }
            else {
                potentialOutput = <ToT> <any> result.value
            }

           
            if (this.valuesAlreadySeen.has(potentialOutput)) {
                // Already seen this value.
                // Skip it and continue to next item.
                continue
            }
            
            this.valuesAlreadySeen.add(potentialOutput)
            return {
                done: false,
                value: result.value,
            }
        }
    }
}