export interface ISeries<IndexT = number, ValueT = any> extends Iterable<ValueT> {
    [Symbol.iterator](): Iterator<ValueT>

    toPairs(): ([IndexT, ValueT])[]
}