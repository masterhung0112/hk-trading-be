// import { OrderedIterable } from '../iterables/OrderedIterable'
// import { DataFrame } from './DataFrame'
// import { Direction } from './Direction'
// import { IOrderedDataFrame } from './IOrderedDataFrame'
// import { IOrderedDataFrameConfig } from './IOrderedDataFrameConfig'
// import { ISortSpec } from './ISortSpec'
// import { SelectorWithIndexFn } from './SelectorWithIndexFn'

// export class OrderedDataFrame<IndexT = number, ValueT = any, SortT = any>
//     extends DataFrame<IndexT, ValueT>
//     implements IOrderedDataFrame<IndexT, ValueT, SortT> {

//         private _config: IOrderedDataFrameConfig<IndexT, ValueT, SortT>

//         private static _makeSortSpec<ValueT, SortT>(sortLevel: number, selector: SelectorWithIndexFn<ValueT, SortT>, direction: Direction): ISortSpec {
//             return { sortLevel: sortLevel, selector: selector, direction: direction }
//         }
    
//         //
//         // Helper function to make a sort selector for pairs, this captures the parent correct when generating the closure.
//         //
//         private static _makePairsSelector<ValueT, SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): SelectorWithIndexFn<ValueT, SortT> {
//             return (pair: any, index: number) => selector(pair[1], index)
//         }

//         constructor(config: IOrderedDataFrameConfig<IndexT, ValueT, SortT>) {
//             const valueSortSpecs: ISortSpec[] = []
//             const pairSortSpecs: ISortSpec[] = []
//             let sortLevel = 0

//             let parent = config.parent as OrderedDataFrame<IndexT, ValueT, SortT>
//             const parents: OrderedDataFrame<IndexT, ValueT, SortT>[] = []
//             while (parent !== null) {
//                 parents.push(parent)
//                 parent = parent._config.parent as OrderedDataFrame<IndexT, ValueT, SortT>
//             }

//             parents.reverse()
            
//             for (const p of parents) {
//                 const parentConfig = p._config
//                 valueSortSpecs.push(OrderedDataFrame._makeSortSpec(sortLevel, parentConfig.selector, parentConfig.direction))
//                 pairSortSpecs.push(OrderedDataFrame._makeSortSpec(sortLevel, OrderedDataFrame._makePairsSelector(parentConfig.selector), parentConfig.direction))
//                 ++sortLevel
//             }

//             valueSortSpecs.push(OrderedDataFrame._makeSortSpec(sortLevel, config.selector, config.direction))
//             pairSortSpecs.push(OrderedDataFrame._makeSortSpec(sortLevel, OrderedDataFrame._makePairsSelector(config.selector), config.direction))

//             super({
//                 columnNames: config.columnNames,
//                 values: new OrderedIterable(config.values, valueSortSpecs),
//                 pairs: new OrderedIterable(config.pairs, pairSortSpecs)
//             })

//             this._config = config
//         }
    
//         thenBy(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
//             return new OrderedDataFrame<IndexT, ValueT, SortT>({
//                 columnNames: this._config.columnNames,
//                 values: this._config.values, 
//                 pairs: this._config.pairs, 
//                 selector: selector, 
//                 direction: Direction.Ascending, 
//                 parent: this,
//             })
//         }

//         thenByDescending(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
//             return new OrderedDataFrame<IndexT, ValueT, SortT>({
//                 columnNames: this._config.columnNames,
//                 values: this._config.values, 
//                 pairs: this._config.pairs, 
//                 selector: selector, 
//                 direction: Direction.Descending, 
//                 parent: this,
//             })
//         }
// }