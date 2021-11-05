import { AggregateFn } from './AggregateFn'
import { CallbackFn } from './CallbackFn'
import { ComparerFn } from './ComparerFn'
import { GapFillFn } from './GapFillFn'
import { IDataFrame } from './IDataFrame'
import { IFrequencyTableEntry } from './IFrequencyTableEntry'
import { IFrequencyTableOptions } from './IFrequencyTableOptions'
import { IIndex } from './IIndex'
import { IOrderedSeries } from './IOrderedSeries'
import { ITypeFrequency } from './ITypeFrequency'
import { IValueFrequency } from './IValueFrequency'
import { JoinFn } from './JoinFn'
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
    at(index: IndexT): ValueT | undefined
    average(): number
    bake(): ISeries<IndexT, ValueT>
    before(indexValue: IndexT): ISeries<IndexT, ValueT>
    between(startIndexValue: IndexT, endIndexValue: IndexT): ISeries<IndexT, ValueT>
    cast<NewValueT>(): ISeries<IndexT, NewValueT>
    concat(...series: (ISeries<IndexT, ValueT>[]|ISeries<IndexT, ValueT>)[]): ISeries<IndexT, ValueT>
    count(): number
    counter(predicate: PredicateFn<ValueT>): ISeries<IndexT, number>
    cumsum(): ISeries<IndexT, number>
    defaultIfEmpty(defaultSequence: ValueT[] | ISeries<IndexT, ValueT>): ISeries<IndexT, ValueT>
    detectTypes(): IDataFrame<number, ITypeFrequency>
    detectValues(): IDataFrame<number, IValueFrequency>
    distinct<ToT>(selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT>
    endAt(indexValue: IndexT): ISeries<IndexT, ValueT>
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT>(inner: ISeries<InnerIndexT, InnerValueT>, outerSelector?: SelectorFn<ValueT, KeyT>, innerSelector?: SelectorFn<InnerValueT, KeyT>): ISeries<IndexT, ValueT>
    frequency(options?: IFrequencyTableOptions): IDataFrame<number, IFrequencyTableEntry>
    forEach(callback: CallbackFn<ValueT>): ISeries<IndexT, ValueT>
    first(): ValueT
    fillGaps(comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): ISeries<IndexT, ValueT>
    getIndex(): IIndex<IndexT>
    groupBy<GroupT>(selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>> 
    groupSequentialBy<GroupT>(selector?: SelectorFn<ValueT, GroupT>): ISeries<number, ISeries<IndexT, ValueT>>
    head(numValues: number): ISeries<IndexT, ValueT>
    inflate<ToT = ValueT> (selector?: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>
    insertPair(pair: [IndexT, ValueT]): ISeries<IndexT, ValueT>
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT>(inner: ISeries<InnerIndexT, InnerValueT>, outerSelector?: SelectorFn<ValueT, KeyT>, innerSelector?: SelectorFn<InnerValueT, KeyT>): ISeries<IndexT, ValueT> 
    invert(): ISeries<IndexT, number | null | undefined>
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (inner: ISeries<InnerIndexT, InnerValueT>, outerKeySelector: SelectorFn<ValueT, KeyT>, innerKeySelector: SelectorFn<InnerValueT, KeyT>, resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>): ISeries<number, ResultValueT> 
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT> (inner: ISeries<InnerIndexT, InnerValueT>, outerKeySelector: SelectorFn<ValueT, KeyT>, innerKeySelector: SelectorFn<InnerValueT, KeyT>, resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>): ISeries<number, ResultValueT>
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT> (inner: ISeries<InnerIndexT, InnerValueT>, outerKeySelector: SelectorFn<ValueT, KeyT>, innerKeySelector: SelectorFn<InnerValueT, KeyT>, resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>): ISeries<number, ResultValueT>
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT> (inner: ISeries<InnerIndexT, InnerValueT>, outerKeySelector: SelectorFn<ValueT, KeyT>, innerKeySelector: SelectorFn<InnerValueT, KeyT>, resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>): ISeries<number, ResultValueT>
    last(): ValueT
    map<ToT>(transformationFn: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT>
    max(): number
    mean(): number
    median(): number
    merge<MergedValueT = any>(...args: any[]): ISeries<IndexT, MergedValueT[]>
    min(): number
    mode(): any
    none(predicate?: PredicateFn<ValueT>): boolean
    orderBy<SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>
    orderByDescending<SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedSeries<IndexT, ValueT, SortT>
    parseDates(formatString?: string): ISeries<IndexT, Date>
    parseFloats(): ISeries<IndexT, number>
    parseInts(): ISeries<IndexT, number>
    percentChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    percentRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    percentRank(period?: number): ISeries<IndexT, number>
    proportionChange(period?: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    proportionRange(period: number, whichIndex?: WhichIndex): ISeries<IndexT, number>
    proportionRank(period?: number): ISeries<IndexT, number>
    range(): number
    resetIndex(): ISeries<number, ValueT>
    reverse(): ISeries<IndexT, ValueT>
    rollingWindow(period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>>
    round(numDecimalPlaces?: number): ISeries<IndexT, ValueT>
    select<ToT>(selector: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT>
    selectMany<ToT>(selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): ISeries<IndexT, ToT>
    sequentialDistinct<ToT = ValueT>(selector?: SelectorFn<ValueT, ToT>): ISeries<IndexT, ValueT>
    skip(numValues: number): ISeries<IndexT, ValueT>
    skipUntil(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>
    skipWhile(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>
    startAt(indexValue: IndexT): ISeries<IndexT, ValueT>
    std(): number
    sum(): number
    tail(numValues: number): ISeries<IndexT, ValueT>
    take(numRows: number): ISeries<IndexT, ValueT>
    takeUntil(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>
    takeWhile(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>
    toArray(): any[]
    toObject<KeyT = any, FieldT = any, OutT = any>(keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT
    toPairs(): ([IndexT, ValueT])[]
    toString(): string 
    toStrings(formatString?: string): ISeries<IndexT, string>
    truncateStrings(maxLength: number): ISeries<IndexT, ValueT>
    union<KeyT = ValueT>(other: ISeries<IndexT, ValueT>, selector?: SelectorFn<ValueT, KeyT>): ISeries<IndexT, ValueT>
    variableWindow(comparer: ComparerFn<ValueT, ValueT>): ISeries<number, ISeries<IndexT, ValueT>>
    variance(): number
    where(predicate: PredicateFn<ValueT>): ISeries<IndexT, ValueT>
    window(period: number, whichIndex?: WhichIndex): ISeries<IndexT, ISeries<IndexT, ValueT>>
    withIndex<NewIndexT>(newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): ISeries<NewIndexT, ValueT>
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>(s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, s4: ISeries<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>(s2: ISeries<Index2T, Value2T>, s3: ISeries<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): ISeries<IndexT, ResultT>
    zip<Index2T, Value2T, ResultT>(s2: ISeries<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): ISeries<IndexT, ResultT>
    zip<ResultT>(...args: any[]): ISeries<IndexT, ResultT>
}