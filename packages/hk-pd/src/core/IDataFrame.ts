import { ISeries } from './ISeries'
import { IColumnGenSpec } from './IColumnGenSpec'
import { SeriesSelectorFn } from './SeriesSelectorFn'
import { PredicateFn } from './PredicateFn'
import { SelectorFn } from './SelectorFn'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'
import { IMultiColumnAggregatorSpec } from './IColumnAggregatorSpec'
import { IOrderedDataFrame } from './IOrderedDataFrame'
import { IFormatSpec } from './IFormatSpec'

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

    getColumnNames(): string[]

    cast<NewValueT>(): IDataFrame<IndexT, NewValueT>
    
    /**
     * Prints the first n values in a dataframe
     * @param {rows}  rows --> int
     * @returns DataFrame
     */
    head(numValues?: number): IDataFrame<IndexT, ValueT>

    none(predicate?: PredicateFn<ValueT>): boolean

    setIndex<NewIndexT = any>(columnName: string): IDataFrame<NewIndexT, ValueT>
    withIndex<NewIndexT>(newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): IDataFrame<NewIndexT, ValueT>
    resetIndex(): IDataFrame<number, ValueT>

    /**
     * Return a sequence of axis dimension along row and columns
     * @params col_name: the name of a column in the database.
     * @returns tensor of shape 1
     */
    getSeries<SeriesValueT = any>(columnName: string): ISeries<IndexT, SeriesValueT>

    withSeries<OutputValueT = any, SeriesValueT = any>(columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, OutputValueT>

    hasSeries(columnName: string): boolean

    dropSeries<NewValueT = ValueT>(columnOrColumns: string | string[]): IDataFrame<IndexT, NewValueT>
    
    expectSeries<SeriesValueT> (columnName: string): ISeries<IndexT, SeriesValueT>
    ensureSeries<SeriesValueT> (columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT>
    reorderSeries<NewValueT = ValueT>(columnNames: string[]): IDataFrame<IndexT, NewValueT>

    merge<MergedValueT = ValueT>(...otherDataFrames: IDataFrame<IndexT, any>[]): IDataFrame<IndexT, MergedValueT>

    select<ToT>(selector: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT>
    selectMany<ToT>(selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): IDataFrame<IndexT, ToT>
    
    pivot<NewValueT = ValueT> (
        columnOrColumns: string | Iterable<string>, 
        valueColumnNameOrSpec: string | IMultiColumnAggregatorSpec, 
        aggregator?: (values: ISeries<number, any>) => any
            ): IDataFrame<number, NewValueT>

    groupBy<GroupT>(selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>>
    orderBy<SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT>

    first(): ValueT
    last(): ValueT

    concat(...dataframes: (IDataFrame<IndexT, ValueT>[] | IDataFrame<IndexT, ValueT>)[]): IDataFrame<IndexT, ValueT>
    insertPair(pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT>
    appendPair(pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT>

    window (period: number): ISeries<number, IDataFrame<IndexT, ValueT>>

    startAt(indexValue: IndexT): IDataFrame<IndexT, ValueT>
    endAt(indexValue: IndexT): IDataFrame<IndexT, ValueT>
    before(indexValue: IndexT): IDataFrame<IndexT, ValueT>
    after(indexValue: IndexT): IDataFrame<IndexT, ValueT>
    between(startIndexValue: IndexT, endIndexValue: IndexT): IDataFrame<IndexT, ValueT>

    toArray(): ValueT[]
    toPairs(): ([IndexT, ValueT])[]

    parseInts(columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT>
    parseFloats(columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT>
    parseDates(columnNameOrNames: string | string[], formatString?: string): IDataFrame<IndexT, ValueT>

    toStrings(columnNames: string | string[] | IFormatSpec, formatString?: string): IDataFrame<IndexT, ValueT>
    /**
     * Transpose index and columns.
     * Reflect the DataFrame over its main diagonal by writing rows as columns and vice-versa.
     * The property T is an accessor to the method transpose().
     */
    // transpose(): IDataFrame

    /**
     * Purely label based indexing. Can accept string label names for both rows and columns
     * @param {kwargs} kwargs object {rows: Array of index, columns: Array of column name(s)}
     * @return INDframe data stucture
     */
    // loc(kwargs?: LocArgs): IDataFrame
    // iloc(kwargs?: ILocArgs): IDataFrame

    // get ctypes(): INDframe
}