import { ISeries } from './ISeries'
import { IColumnGenSpec } from './IColumnGenSpec'
import { SeriesSelectorFn } from './SeriesSelectorFn'
import { PredicateFn } from './PredicateFn'
import { SelectorFn } from './SelectorFn'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'
import { IMultiColumnAggregatorSpec } from './IColumnAggregatorSpec'
import { IOrderedDataFrame } from './IOrderedDataFrame'
import { IFormatSpec } from './IFormatSpec'
import { IColumn } from './IColumn'
import { IIndex } from './IIndex'
import { IColumnRenameSpec } from './IColumnRenameSpec'
import { IColumnTransformSpec } from './IColumnTransformSpec'
import { Zip2Fn, Zip3Fn } from './ZipFn'
import { ComparerFn } from './ComparerFn'
import { JoinFn } from './JoinFn'
import { GapFillFn } from './GapFillFn'
import { ITypeFrequency } from './ITypeFrequency'
import { IValueFrequency } from './IValueFrequency'
import { CallbackFn } from './CallbackFn'

/**
 * A 2D frame object that stores data in structured tabular format
 * @param {data} data, JSON, Array, 2D Tensor
 * @param {kwargs} Object {columns: Array of column names, defaults to ordered numbers when not specified
 *                        dtypes: strings of data types, automatically inferred when not specified
 *                        index: row index for subseting array, defaults to ordered numbers when not specified}
 *
 * @returns DataFrame
 */
export interface IDataFrame<IndexT = any, ValueT = any> extends Iterable<ValueT> {
    [Symbol.iterator](): Iterator<ValueT>

    // toCSV(options?: ICSVOutputOptions): string
    after(indexValue: IndexT): IDataFrame<IndexT, ValueT>
    all(predicate: PredicateFn<ValueT>): boolean
    any(predicate?: PredicateFn<ValueT>): boolean
    appendPair(pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT>
    at(index: IndexT): ValueT | undefined
    bake(): IDataFrame<IndexT, ValueT>
    before(indexValue: IndexT): IDataFrame<IndexT, ValueT>
    between(startIndexValue: IndexT, endIndexValue: IndexT): IDataFrame<IndexT, ValueT>
    bringToBack(columnOrColumns: string | string[]): IDataFrame<IndexT, ValueT>
    bringToFront(columnOrColumns: string | string[]): IDataFrame<IndexT, ValueT>
    cast<NewValueT>(): IDataFrame<IndexT, NewValueT>
    concat(...dataframes: (IDataFrame<IndexT, ValueT>[] | IDataFrame<IndexT, ValueT>)[]): IDataFrame<IndexT, ValueT>
    count(): number
    convertColumnsToArrays(columnNames: string[]): any[][] 
    defaultIfEmpty(defaultDataFrame: ValueT[] | IDataFrame<IndexT, ValueT>): IDataFrame<IndexT, ValueT>
    deflate<ToT = ValueT>(selector?: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT>
    detectTypes(): IDataFrame<number, ITypeFrequency>
    detectValues(): IDataFrame<number, IValueFrequency>
    distinct<ToT>(selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT>
    dropSeries<NewValueT = ValueT>(columnOrColumns: string | string[]): IDataFrame<IndexT, NewValueT>
    endAt(indexValue: IndexT): IDataFrame<IndexT, ValueT>
    ensureSeries<SeriesValueT> (columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT>
    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT>(inner: IDataFrame<InnerIndexT, InnerValueT>, outerSelector?: SelectorFn<ValueT, KeyT>, innerSelector?: SelectorFn<InnerValueT, KeyT>): IDataFrame<IndexT, ValueT>
    expectSeries<SeriesValueT> (columnName: string): ISeries<IndexT, SeriesValueT>
    fillGaps(comparer: ComparerFn<[IndexT, ValueT], [IndexT, ValueT]>, generator: GapFillFn<[IndexT, ValueT], [IndexT, ValueT]>): IDataFrame<IndexT, ValueT> 
    first(): ValueT
    forEach(callback: CallbackFn<ValueT>): IDataFrame<IndexT, ValueT>
    generateSeries<NewValueT = ValueT>(generator: SelectorWithIndexFn<any, any> | IColumnTransformSpec): IDataFrame<IndexT, NewValueT>
    getColumnNames(): string[]
    getColumns(): ISeries<number, IColumn>
    getIndex(): IIndex<IndexT>
    getSeries<SeriesValueT = any>(columnName: string): ISeries<IndexT, SeriesValueT>
    groupBy<GroupT>(selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>>
    groupSequentialBy<GroupT>(selector?: SelectorFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>>
    hasSeries(columnName: string): boolean
    head(numValues?: number): IDataFrame<IndexT, ValueT>
    inflateSeries(columnName: string, selector?: SelectorWithIndexFn<IndexT, any>): IDataFrame<IndexT, ValueT>
    insertPair(pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT>
    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT>(inner: IDataFrame<InnerIndexT, InnerValueT>, outerSelector?: SelectorFn<ValueT, KeyT>, innerSelector?: SelectorFn<InnerValueT, KeyT>): IDataFrame<IndexT, ValueT>
    join<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner: IDataFrame<InnerIndexT, InnerValueT>, outerKeySelector: SelectorFn<ValueT, KeyT>, innerKeySelector: SelectorFn<InnerValueT, KeyT>, resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>): IDataFrame<number, ResultValueT>
    joinOuter<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner: IDataFrame<InnerIndexT, InnerValueT>, outerKeySelector: SelectorFn<ValueT, KeyT>, innerKeySelector: SelectorFn<InnerValueT, KeyT>, resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>): IDataFrame<number, ResultValueT>
    joinOuterLeft<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner: IDataFrame<InnerIndexT, InnerValueT>, outerKeySelector: SelectorFn<ValueT, KeyT>, innerKeySelector: SelectorFn<InnerValueT, KeyT>, resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>): IDataFrame<number, ResultValueT>
    joinOuterRight<KeyT, InnerIndexT, InnerValueT, ResultValueT>(inner: IDataFrame<InnerIndexT, InnerValueT>, outerKeySelector: SelectorFn<ValueT, KeyT>, innerKeySelector: SelectorFn<InnerValueT, KeyT>, resultSelector: JoinFn<ValueT | null, InnerValueT | null, ResultValueT>): IDataFrame<number, ResultValueT>
    last(): ValueT
    melt(idColumnOrColumns: string | Iterable<string>, valueColumnOrColumns: string | Iterable<string>): IDataFrame<IndexT, ValueT>
    merge<MergedValueT = ValueT>(...otherDataFrames: IDataFrame<IndexT, any>[]): IDataFrame<IndexT, MergedValueT>
    none(predicate?: PredicateFn<ValueT>): boolean
    orderBy<SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>
    orderByDescending<SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>
    parseDates(columnNameOrNames: string | string[], formatString?: string): IDataFrame<IndexT, ValueT>
    parseFloats(columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT>
    parseInts(columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT>
    pivot<NewValueT = ValueT> (columnOrColumns: string | Iterable<string>, valueColumnNameOrSpec: string | IMultiColumnAggregatorSpec, aggregator?: (values: ISeries<number, any>) => any): IDataFrame<number, NewValueT>
    renameSeries<NewValueT = ValueT> (newColumnNames: IColumnRenameSpec): IDataFrame<IndexT, NewValueT>
    reorderSeries<NewValueT = ValueT>(columnNames: string[]): IDataFrame<IndexT, NewValueT>
    round(numDecimalPlaces?: number): IDataFrame<IndexT, ValueT> 
    reverse(): IDataFrame<IndexT, ValueT>
    resetIndex(): IDataFrame<number, ValueT>
    select<ToT>(selector: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>
    selectMany<ToT>(selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): IDataFrame<IndexT, ToT>
    setIndex<NewIndexT = any>(columnName: string): IDataFrame<NewIndexT, ValueT>
    skip(numValues: number): IDataFrame<IndexT, ValueT>
    skipUntil(predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>
    skipWhile(predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>
    startAt(indexValue: IndexT): IDataFrame<IndexT, ValueT>
    subset<NewValueT = ValueT>(columnNames: string[]): IDataFrame<IndexT, NewValueT>
    summarize<OutputValueT = any>(spec?: IMultiColumnAggregatorSpec): OutputValueT 
    tail(numValues: number): IDataFrame<IndexT, ValueT>
    take(numRows: number): IDataFrame<IndexT, ValueT>
    takeUntil(predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>
    takeWhile(predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>
    toArray(): ValueT[]
    toHTML(): string
    toJSON(): string
    toObject<KeyT = any, FieldT = any, OutT = any>(keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT 
    toPairs(): ([IndexT, ValueT])[]
    toRows(): any[][]
    toString(): string
    toStrings(columnNames: string | string[] | IFormatSpec, formatString?: string): IDataFrame<IndexT, ValueT>
    transformSeries<NewValueT = ValueT>(columnSelectors: IColumnTransformSpec): IDataFrame<IndexT, NewValueT>
    truncateStrings(maxLength: number): IDataFrame<IndexT, ValueT>
    union<KeyT = ValueT>(other: IDataFrame<IndexT, ValueT>, selector?: SelectorFn<ValueT, KeyT>): IDataFrame<IndexT, ValueT>
    variableWindow(comparer: ComparerFn<ValueT, ValueT>): ISeries<number, IDataFrame<IndexT, ValueT>>
    where(predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT>
    window(period: number): ISeries<number, IDataFrame<IndexT, ValueT>>
    withIndex<NewIndexT>(newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): IDataFrame<NewIndexT, ValueT>
    withSeries<OutputValueT = any, SeriesValueT = any>(columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, OutputValueT>
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>(s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, s4: IDataFrame<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>(s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>
    zip<Index2T, Value2T, ResultT>(s2: IDataFrame<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): IDataFrame<IndexT, ResultT>
    zip<ResultT>(...args: any[]): IDataFrame<IndexT, ResultT>
}