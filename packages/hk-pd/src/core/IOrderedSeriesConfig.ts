import { Direction } from './Direction'
import { IOrderedSeries } from './IOrderedSeries'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'

/**
 * @hidden
 * The configuration for an ordered series.
 */
export interface IOrderedSeriesConfig<IndexT, ValueT, SortT> {

    //
    // The source values for the ordered series.
    //
    values: Iterable<ValueT>

    //
    // The source pairs (index,value) for the ordered series.
    //
    pairs: Iterable<[IndexT, ValueT]>

    //
    // The selector used to get the sorting key for the orderby operation.
    //
    selector: SelectorWithIndexFn<ValueT, SortT>

    //
    // The sort direction, ascending or descending.
    //
    direction: Direction

    //
    // The parent series in the orderby operation or null if none.
    //
    parent: IOrderedSeries<IndexT, ValueT, any> | null
}