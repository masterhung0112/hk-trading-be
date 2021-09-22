export interface IDataFrameContent<IndexT, ValueT> {
    index: Iterable<IndexT>
    values: Iterable<ValueT>
    pairs: Iterable<[IndexT, ValueT]>

    columnNames: string[] | Iterable<string>
    isBaked: boolean
}
