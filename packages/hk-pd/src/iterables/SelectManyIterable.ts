import { SelectManyIterator, SelectorManyFn } from "../iterators/SelectManyIterator";

export class SelectManyIterable<ValueT, ToT> implements Iterable<ToT> {

    iterable: Iterable<ValueT>;
    selector: SelectorManyFn<ValueT, ToT>;

    constructor(iterable: Iterable<ValueT>, selector: SelectorManyFn<ValueT, ToT>) {
        this.iterable = iterable;
        this.selector = selector;
    }

    [Symbol.iterator](): Iterator<ToT> {
        var iterator = this.iterable[Symbol.iterator]()
        return new SelectManyIterator<ValueT, ToT>(iterator, this.selector)
    }
}