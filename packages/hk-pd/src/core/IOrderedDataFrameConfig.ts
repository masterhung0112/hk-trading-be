import { Direction } from './Direction'
import { IOrderedDataFrame } from './IOrderedDataFrame'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'

export interface IOrderedDataFrameConfig<IndexT, ValueT, SortT> {
    columnNames: string[] | Iterable<string>
    values: Iterable<ValueT>
    pairs: Iterable<[IndexT, ValueT]>
    selector: SelectorWithIndexFn<ValueT, SortT>
    direction: Direction
    parent: IOrderedDataFrame<IndexT, ValueT, any> | null
}