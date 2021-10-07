import { AggregateFn } from './AggregateFn'
import { ComparerFn } from './ComparerFn'
import { IDataFrame } from './IDataFrame'
import { IIndex } from './IIndex'
import { PredicateFn } from './PredicateFn'
import { SelectorFn } from './SelectorFn'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'
import { WhichIndex } from './WhichIndex'

export interface ISeries<IndexT = number, ValueT = any> extends Iterable<ValueT> {
    [Symbol.iterator](): Iterator<ValueT>

    toPairs(): ([IndexT, ValueT])[]
    inflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>
    any(predicate?: PredicateFn<ValueT>): boolean
    first (): ValueT
    last(): ValueT
    skip(numValues: number): ISeries<IndexT, ValueT>
    getIndex(): IIndex<IndexT>
    select<ToT>(selector: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT>
    selectMany<ToT>(selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT>
    parseInts(): ISeries<IndexT, number>
    parseFloats(): ISeries<IndexT, number>
    parseDates(formatString?: string): ISeries<IndexT, Date>
    toStrings(formatString?: string): ISeries<IndexT, string>
    bake(): ISeries<IndexT, ValueT>
    toArray(): any[]
    toObject<KeyT = any, FieldT = any, OutT = any>(keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT

    withIndex<NewIndexT>(newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): ISeries<NewIndexT, ValueT>
    
    window(period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>>
    rollingWindow(period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>>
    variableWindow(comparer: ComparerFn<ValueT, ValueT>): ISeries<number, ISeries<IndexT, ValueT>>
    sequentialDistinct<ToT = ValueT>(selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT>
    aggregate<ToT = ValueT>(seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT

    amountRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number>

    min(): number
    max(): number
}