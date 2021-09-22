export interface ISeriesContent<IndexT, ValueT> {
    index: Iterable<IndexT>
    values: Iterable<ValueT>
    pairs: Iterable<[IndexT, ValueT]>

    //  Records if a series is baked into memory.
    isBaked: boolean
}