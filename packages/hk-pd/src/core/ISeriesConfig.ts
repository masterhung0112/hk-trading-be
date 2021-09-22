export interface ISeriesConfig<IndexT, ValueT> {
    values?: Iterable<ValueT>

    index?: Iterable<IndexT>

    pairs?: Iterable<[IndexT, ValueT]>

    /***
     * Set to true when the series has been baked into memory
     * and does not need to be lazily evaluated.
     */
    baked?: boolean,
}