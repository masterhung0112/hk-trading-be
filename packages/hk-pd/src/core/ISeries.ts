import { AggregateFn } from './AggregateFn'
import { CallbackFn } from './CallbackFn'
import { ComparerFn } from './ComparerFn'
import { IDataFrame } from './IDataFrame'
import { IIndex } from './IIndex'
import { IOrderedSeries } from './IOrderedSeries'
import { ITypeFrequency } from './ITypeFrequency'
import { IValueFrequency } from './IValueFrequency'
import { PredicateFn } from './PredicateFn'
import { SelectorFn } from './SelectorFn'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'
import { WhichIndex } from './WhichIndex'
import { Zip2Fn, Zip3Fn } from './ZipFn'

export interface ISeries<IndexT = number, ValueT = any> extends Iterable<ValueT> {
    [Symbol.iterator](): Iterator<ValueT>

    after(indexValue: IndexT): ISeries<IndexT, ValueT>
    aggregate<ToT = ValueT>(seedOrSelector: AggregateFn<ValueT, ToT> | ToT, selector?: AggregateFn<ValueT, ToT>): ToT
    all(predicate: PredicateFn<ValueT>): boolean
    amountChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    amountRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    any(predicate?: PredicateFn<ValueT>): boolean
    appendPair(pair: [IndexT, ValueT]): ISeries<IndexT, ValueT> 
    average(): number
    bake(): ISeries<IndexT, ValueT>
    before(indexValue: IndexT): ISeries<IndexT, ValueT>
    between(startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT>
    concat(...series: (ISeries<IndexT, ValueT>[]|ISeries<IndexT, ValueT>)[]): ISeries<IndexT, ValueT>
    count(): number
    detectTypes(): IDataFrame<number, ITypeFrequency>
    detectValues(): IDataFrame<number, IValueFrequency>
    endAt(indexValue: IndexT): ISeries<IndexT, ValueT>
    first(): ValueT
    forEach(callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT>
    getIndex(): IIndex<IndexT>
    head(numValues: number): ISeries<IndexT, ValueT>
    inflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>
    insertPair (pair: [IndexT, ValueT]): ISeries<IndexT, ValueT>
    last(): ValueT
    max(): number
    median(): number
    min(): number
    none(predicate?: PredicateFn<ValueT>): boolean
    orderBy<SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>
    parseDates(formatString?: string): ISeries<IndexT, Date>
    parseFloats(): ISeries<IndexT, number>
    parseInts(): ISeries<IndexT, number>
    percentChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    percentRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    proportionChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    proportionRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    reverse(): ISeries<IndexT, ValueT>
    rollingWindow(period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>>
    round(numDecimalPlaces?: number): ISeries<IndexT, ValueT>
    select<ToT>(selector: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT>
    selectMany<ToT>(selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT>
    sequentialDistinct<ToT = ValueT>(selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT>
    skip(numValues: number): ISeries<IndexT, ValueT>
    startAt(indexValue: IndexT): ISeries<IndexT, ValueT>
    sum(): number
    tail(numValues: number): ISeries<IndexT, ValueT>
    take(numRows: number): ISeries<IndexT, ValueT>
    toArray(): any[]
    toObject<KeyT = any, FieldT = any, OutT = any>(keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT
    toPairs(): ([IndexT, ValueT])[]
    toStrings(formatString?: string): ISeries<IndexT, string>
    variableWindow(comparer: ComparerFn<ValueT, ValueT>): ISeries<number, ISeries<IndexT, ValueT>>
    where(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>
    window(period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>>
    withIndex<NewIndexT>(newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): ISeries<NewIndexT, ValueT>
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>(s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, s4: ISeries<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>(s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>
    zip<Index2T, Value2T, ResultT>(s2: ISeries<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): ISeries<IndexT, ResultT>
    zip<ResultT>(...args: any[]): ISeries<IndexT, ResultT>
}