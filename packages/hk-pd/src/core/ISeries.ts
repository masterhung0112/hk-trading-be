import { IDataFrame } from './IDataFrame'
import { PredicateFn } from './PredicateFn'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'

export interface ISeries<IndexT = number, ValueT = any> extends Iterable<ValueT> {
    [Symbol.iterator](): Iterator<ValueT>

    toPairs(): ([IndexT, ValueT])[]
    inflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>
    any(predicate?: PredicateFn<ValueT>): boolean
    first (): ValueT
    last(): ValueT
    select<ToT> (selector: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT>
    selectMany<ToT> (selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT>
}