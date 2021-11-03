import { ColumnNamesIterable } from '../iterables/ColumnNamesIterable'
import { ConcatIterable } from '../iterables/ConcatIterable'
import { CountIterable } from '../iterables/CountIterable'
import { CsvRowsIterable } from '../iterables/CsvRowsIterable'
import { DataFrameRollingWindowIterable } from '../iterables/DataFrameRollingWindowIterable'
import { DataFrameVariableWindowIterable } from '../iterables/DataFrameVariableWindowIterable'
import { DataFrameWindowIterable } from '../iterables/DataFrameWindowIterable'
import { DistinctIterable } from '../iterables/DistinctIterable'
import { EmptyIterable } from '../iterables/EmptyIterable'
import { ExtractElementIterable } from '../iterables/ExtractElementIterable'
import { MultiIterable } from '../iterables/MultiTerable'
import { SelectIterable } from '../iterables/SelectIterable'
import { SelectManyIterable } from '../iterables/SelectManyIterable'
import { SkipWhileIterable } from '../iterables/SkipWhileIterable'
import { TakeIterable } from '../iterables/TakeIterable'
import { TakeWhileIterable } from '../iterables/TakeWhileIterable'
import { WhereIterable } from '../iterables/WhereIterable'
import { ZipIterable } from '../iterables/ZipIterable'
import { determineType } from '../utils/determineType'
import { isArray } from '../utils/isArray'
import { isFunction } from '../utils/isFunction'
import { isNumber } from '../utils/isNumber'
import { isObject } from '../utils/isObject'
import { isString } from '../utils/isString'
import { makeDistinct } from '../utils/makeDistinct'
import { toMap } from '../utils/toMap'
import { toMap2 } from '../utils/toMap2'
import { ComparerFn } from './ComparerFn'
import { DataFrameConfigFn } from './DataFrameConfigFn'
import { Direction } from './Direction'
import { IColumn } from './IColumn'
import { IColumnAggregatorSpec, IMultiColumnAggregatorSpec } from './IColumnAggregatorSpec'
import { IColumnConfig } from './IColumnConfig'
import { IColumnGenSpec } from './IColumnGenSpec'
import { IColumnRenameSpec } from './IColumnRenameSpec'
import { IColumnTransformSpec } from './IColumnTransformSpec'
import { IDataFrame } from './IDataFrame'
import { IDataFrameConfig } from './IDataFrameConfig'
import { IDataFrameContent } from './IDataFrameContent'
import { IFormatSpec } from './IFormatSpec'
import { IIndex } from './IIndex'
import { Index } from './IndexT'
import { IOrderedDataFrame } from './IOrderedDataFrame'
import { ISeries } from './ISeries'
import { JoinFn } from './JoinFn'
import { OrderedDataFrame } from './OrderedDataFrame'
import { PredicateFn } from './PredicateFn'
import { SelectorFn } from './SelectorFn'
import { SelectorWithIndexFn } from './SelectorWithIndexFn'
import { Series } from './Series'
import { SeriesSelectorFn } from './SeriesSelectorFn'
import { Zip2Fn, Zip3Fn, ZipNFn } from './ZipFn'

export class DataFrame<IndexT, ValueT> implements IDataFrame<IndexT, ValueT> {
    private _configFn: DataFrameConfigFn<IndexT, ValueT> | null = null;
    private _content: IDataFrameContent<IndexT, ValueT> | null = null;

    private static readonly _defaultEmptyIterable = new EmptyIterable();
    private static readonly _defaultCountIterable = new CountIterable();

    private _indexedContent: Map<any, ValueT> | null = null

    private static _initEmpty<IndexT, ValueT>(): IDataFrameContent<IndexT, ValueT> {
        return {
            index: DataFrame._defaultEmptyIterable,
            values: DataFrame._defaultEmptyIterable,
            pairs: DataFrame._defaultEmptyIterable,
            isBaked: true,
            columnNames: []
        }
    }

    private static _initFromArray<IndexT, ValueT>(arr: Iterable<ValueT>): IDataFrameContent<IndexT, ValueT> {
        const firstResult = arr[Symbol.iterator]().next()
        const columnNames = !firstResult.done ? Object.keys(firstResult.value) : []
        return {
            index: DataFrame._defaultCountIterable,
            values: arr,
            pairs: new MultiIterable([DataFrame._defaultCountIterable, arr]),
            isBaked: true,
            columnNames: columnNames
        }
    }

    private static _checkIterable<T>(input: T[] | Iterable<T>, fieldName: string): void {
        if (isArray(input)) {
            // OK
        }
        else if (isFunction(input[Symbol.iterator])) {
            // OK
        } else {
            throw new Error(`Expected ${fieldName} field of Series config Object to be an array of values or an iterable of values`)
        }
    }

    private static _initColumnNames(inputColumnNames: Iterable<string>, isCaseSensitive?: boolean): Iterable<string> {
        const outputColumnNames: string[] = []
        const columnNamesMap: any = {}

        // Convert column names to strings.
        const columnNames = Array.from(inputColumnNames).map(columnName => columnName.toString())

        // Search for duplicate column names
        for (const columnName of columnNames) {
            const columnNameLwr = isCaseSensitive !== undefined && isCaseSensitive ? columnName : columnName.toLowerCase()

            if (columnNamesMap[columnNameLwr] === undefined) {
                columnNamesMap[columnNameLwr] = 1
            } else {
                columnNamesMap[columnNameLwr] += 1
            }
        }

        const columnNoMap: any = {}

        for (const columnName of columnNames) {
            const columnNameLwr = isCaseSensitive !== undefined && isCaseSensitive ? columnName : columnName.toLowerCase()

            if (columnNamesMap[columnNameLwr] > 1) {
                let curColumnNo = 1

                // There are duplicates of this column
                if (columnNoMap[columnNameLwr] !== undefined) {
                    curColumnNo = columnNoMap[columnNameLwr]
                }

                outputColumnNames.push(`${columnName}.${curColumnNo}`)
                columnNoMap[columnNameLwr] = curColumnNo + 1
            } else {
                // No duplicates.
                outputColumnNames.push(columnName)
            }
        }

        return outputColumnNames
    }

    private static _initFromConfig<IndexT, ValueT>(config: IDataFrameConfig<IndexT, ValueT>): IDataFrameContent<IndexT, ValueT> {
        let index: Iterable<IndexT>
        let values: Iterable<ValueT>
        let pairs: Iterable<[IndexT, ValueT]> | undefined
        let isBaked = false
        let columnNames: Iterable<string>

        if (config.pairs) {
            DataFrame._checkIterable(config.pairs, 'pairs')
            pairs = config.pairs
        }

        if (config.columns) {
            let columnsConfig = config.columns
            if (isArray(columnsConfig) || isFunction(columnsConfig)[Symbol.iterator]) {
                const iterableColumnsConfig = columnsConfig as Iterable<IColumnConfig>
                columnNames = Array.from(iterableColumnsConfig).map(column => column.name)
                columnsConfig = toMap(iterableColumnsConfig, column => column.name, column => column.series)
            } else {
                if (!isObject(columnsConfig)) {
                    throw new Error('Expected \'columns\' member of \'config\' parameter to DataFrame constructor to be an object with fields that define columns.')
                }

                columnNames = Object.keys(columnsConfig)
            }

            const columnIterables: any[] = []
            for (const columnName of columnNames) {
                DataFrame._checkIterable(columnsConfig[columnName], columnName)
                columnIterables.push(columnsConfig[columnName])
            }

            values = new CsvRowsIterable(columnNames, new MultiIterable(columnIterables))
        } else {
            if (config.columnNames) {
                columnNames = this._initColumnNames(config.columnNames, config.caseSensitive)
            }

            if (config.rows) {
                if (!config.columnNames) {
                    columnNames = new SelectIterable(new CountIterable(), c => 'Column.' + c.toString())
                }

                DataFrame._checkIterable(config.rows, 'rows')
                values = new CsvRowsIterable(columnNames!, config.rows)
            } else if (config.values) {
                DataFrame._checkIterable(config.values, 'values')
                values = config.values
                if (!config.columnNames) {
                    columnNames = new ColumnNamesIterable(values, config.considerAllRows || false)
                }
            } else if (pairs) {
                values = new ExtractElementIterable(pairs, 1)
                if (!config.columnNames) {
                    columnNames = new ColumnNamesIterable(values, config.considerAllRows || false)
                }
            } else {
                values = DataFrame._defaultEmptyIterable
                if (!config.columnNames) {
                    columnNames = DataFrame._defaultEmptyIterable
                }
            }
        }

        if (config.index) {
            DataFrame._checkIterable(config.index, 'index')
            index = config.index
        } else if (pairs) {
            index = new ExtractElementIterable(pairs, 0)
        } else {
            index = DataFrame._defaultCountIterable
        }

        if (!pairs) {
            pairs = new MultiIterable([index, values])
        }

        if (config.baked !== undefined) {
            isBaked = config.baked
        }

        return {
            index: index,
            values: values,
            pairs: pairs,
            isBaked: isBaked,
            columnNames: columnNames!,
        }
    }

    constructor(config?: Iterable<ValueT> | IDataFrameConfig<IndexT, ValueT> | DataFrameConfigFn<IndexT, ValueT>) {
        if (config) {
            if (isFunction(config)) {
                this._configFn = config
            } else if (isArray(config) ||
                isFunction((config as any)[Symbol.iterator])) {
                    this._content = DataFrame._initFromArray(config as Iterable<ValueT>)
                } else {
                    this._content = DataFrame._initFromConfig(config as IDataFrameConfig<IndexT, ValueT>)
                }
        } else {
            this._content = DataFrame._initEmpty()
        }
    }

    private _lazyInit() {
        if (this.getContent() === null && this._configFn !== null) {
            this._content = DataFrame._initFromConfig(this._configFn())
        }
    }

    private _getRowByIndex(index: IndexT): ValueT | undefined {
        if (!this._indexedContent) {
            this._indexedContent = new Map<any, ValueT>()
            for (const pair of this.getContent().pairs) {
                this._indexedContent.set(pair[0], pair[1])
            }
        }
       
        return this._indexedContent.get(index)
    }

    at(index: IndexT): ValueT | undefined {
        if (this.none()) {
            return undefined
        }

        return this._getRowByIndex(index)
    }

    any(predicate?: PredicateFn<ValueT>): boolean {
        if (predicate) {
            if (!isFunction(predicate)) throw new Error('Expected optional \'predicate\' parameter to \'DataFrame.any\' to be a function.')
        }

        if (predicate) {
            // Use the predicate to check each value.
            for (const value of this) {
                if (predicate(value)) {
                    return true
                }
            }
        }
        else {
            // Just check if there is at least one item.
            const iterator = this[Symbol.iterator]()
            return !iterator.next().done
        }

        return false // Nothing passed.
    }

    getContent() {
        this._lazyInit()
        return this._content
    }

    generateSeries<NewValueT = ValueT>(generator: SelectorWithIndexFn<any, any> | IColumnTransformSpec): IDataFrame<IndexT, NewValueT> {
        if (!isObject(generator)) {
            if (!isFunction(generator)) {
                throw new Error('Expected \'generator\' parameter to \'DataFrame.generateSeries\' function to be a function or an object.')
            }

            const selector = generator as SelectorWithIndexFn<any, any>
            const newColumns = this.select(selector) // Build a new dataframe.
                .bake() //TODO: Bake should be needed here, but it causes problems if not.
            const newColumnNames = newColumns.getColumnNames()

            let working: IDataFrame<IndexT, any> = this

            //TODO: There must be a cheaper implementation!
            for (const newColumnName of newColumnNames) {
                working = working.withSeries(newColumnName, newColumns.getSeries(newColumnName))
            }

            return working
        } else {
            const columnTransformSpec = generator as IColumnTransformSpec
            const newColumnNames = Object.keys(columnTransformSpec)
            
            let working: IDataFrame<IndexT, any> = this

            for (const newColumnName of newColumnNames) {
                working = working.withSeries(newColumnName, working.select(columnTransformSpec[newColumnName]).deflate())
            }

            return working
        }
    }    

    getColumnNames(): string[] {
        return Array.from(this.getContent().columnNames)
    }

    getColumns(): ISeries<number, IColumn> {
        return new Series<number, IColumn>(() => {
            const columnNames = this.getColumnNames()

            return {
                values: columnNames.map(columnName => {
                    const series = this.getSeries(columnName)
                    const firstValue = series.any() ? series.first() : undefined
                    return {
                        name: columnName,
                        type: determineType(firstValue),
                        series: series
                    }
                })
            }
        })
    }

    getIndex(): IIndex<IndexT> {
        return new Index<IndexT>(() => ({
            values: this.getContent().index
        }))
    }

    [Symbol.iterator](): Iterator<any> {
        return this.getContent().values[Symbol.iterator]()
    }

    count(): number {
        let total = 0
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const value of this.getContent().values) {
            ++total
        }
        return total
    }

    /**
     * Prints the first n values in a dataframe
     * @param {rows}  rows --> int
     * @returns DataFrame
     */
    head(numValues: number): IDataFrame<IndexT, ValueT> {
        if (!isNumber(numValues)) {
            throw new Error('Expected \'numValues\' parameter to \'DataFrame.head\' function to be a number.')
        }

        if (numValues === 0) {
            return new DataFrame<IndexT, ValueT>()
        }

        const toTake = numValues < 0 ? this.count() - Math.abs(numValues) : numValues
        return this.take(toTake)
    }

    take(numRows: number): IDataFrame<IndexT, ValueT> {
        if (!isNumber(numRows)) {
            throw new Error('Expected \'numRows\' parameter to \'DataFrame.take\' function to be a number.')
        }

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent()
            return {
                columnNames: content.columnNames,
                index: new TakeIterable(content.index, numRows),
                values: new TakeIterable(content.values, numRows),
                pairs: new TakeIterable(content.pairs, numRows),
            }
        })
    }

    withIndex<NewIndexT>(newIndex: Iterable<NewIndexT> | SelectorFn<ValueT, NewIndexT>): IDataFrame<NewIndexT, ValueT> {
        if (isFunction(newIndex)) {
            return new DataFrame<NewIndexT, ValueT>(() => {
                const content = this.getContent()
                return {
                    columnNames: content.columnNames,
                    values: content.values,
                    index: this.deflate(newIndex),
                }
            })
        } else {
            DataFrame._checkIterable(newIndex, 'newIndex')

            return new DataFrame<NewIndexT, ValueT>(() => {
                const content = this.getContent()
                return {
                    columnNames: content.columnNames,
                    values: content.values,
                    index: newIndex as Iterable<NewIndexT>,
                }
            })
        }
    }

    resetIndex(): IDataFrame<number, ValueT> {
        return new DataFrame<number, ValueT>(() => {
            const content = this.getContent()
            return {
                columnNames: content.columnNames,
                values: content.values,
                // Strip the index.
            }
        })
    }

    cast<NewValueT>(): IDataFrame<IndexT, NewValueT> {
        return this as any as IDataFrame<IndexT, NewValueT>
    }

    none(predicate?: PredicateFn<ValueT>): boolean {
        if (predicate) {
            if (!isFunction(predicate)) {
                throw new Error('Expected \'predicate\' parameter to \'DataFrame.none\' to be a function.')
            }
        }
        
        if (predicate) {
            // Use predicate to check each value
            for (const value of this) {
                if (predicate(value)) {
                    return false
                }
            }
        } else {
            // just check if empty
            const iterator = this[Symbol.iterator]()
            return iterator.next().done || false
        }

        return true // nothing failed the predicate
    }
    
    setIndex<NewIndexT = any>(columnName: string): IDataFrame<NewIndexT, ValueT> {
        if (!isString(columnName)) throw new Error('Expected \'columnName\' parameter to \'DataFrame.setIndex\' to be a string that specifies the name of the column to set as the index for the dataframe.')

        return this.withIndex<NewIndexT>(this.getSeries(columnName))
    }

    startAt(indexValue: IndexT): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent()
            const lessThan = this.getIndex().getLessThan()
            return {
                columnNames: content.columnNames,
                index: new SkipWhileIterable(content.index, index => lessThan(index, indexValue)),
                pairs: new SkipWhileIterable(content.pairs, pair => lessThan(pair[0], indexValue))
            }
        })
    }

    endAt(indexValue: IndexT): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent()
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo()
            return {
                columnNames: content.columnNames,
                index: new TakeWhileIterable(content.index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new TakeWhileIterable(content.pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            }
        })
    }

    bake(): IDataFrame<IndexT, ValueT> {

        if (this.getContent().isBaked) {
            // Already baked.
            return this
        }

        return new DataFrame({
            columnNames: this.getColumnNames(),
            values: this.toArray(),
            pairs: this.toPairs(),
            baked: true,
        })
    }

    before(indexValue: IndexT): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent()
            const lessThan = this.getIndex().getLessThan()
            return {
                columnNames: content.columnNames,
                index: new TakeWhileIterable(content.index, index => lessThan(index, indexValue)),
                pairs: new TakeWhileIterable(content.pairs, pair => lessThan(pair[0], indexValue)),
            }
        })
    }

    after(indexValue: IndexT): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent()
            const lessThanOrEqualTo = this.getIndex().getLessThanOrEqualTo()
            return {
                columnNames: content.columnNames,
                index: new SkipWhileIterable(content.index, index => lessThanOrEqualTo(index, indexValue)),
                pairs: new SkipWhileIterable(content.pairs, pair => lessThanOrEqualTo(pair[0], indexValue)),
            }
        })
    }

    between(startIndexValue: IndexT, endIndexValue: IndexT): IDataFrame<IndexT, ValueT> {
        return this.startAt(startIndexValue).endAt(endIndexValue)
    }

    bringToFront(columnOrColumns: string | string[]): IDataFrame<IndexT, ValueT> {
        if (isArray(columnOrColumns)) {
            for (const columnName of columnOrColumns) {
                if (!isString(columnName)) {
                    throw new Error('Expect \'columnOrColumns\' parameter to \'DataFrame.bringToFront\' function to specify a column or columns via a string or an array of strings.')	
                }
            }
        }
        else {
            if (!isString(columnOrColumns)) {
                throw new Error('Expect \'columnOrColumns\' parameter to \'DataFrame.bringToFront\' function to specify a column or columns via a string or an array of strings.')
            }

            columnOrColumns = [columnOrColumns] // Convert to array for coding convenience.
        }

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent()
            const existingColumns = Array.from(content.columnNames)
            const columnsToMove: string[] = []
            for (const columnToMove of columnOrColumns) {
                if (existingColumns.indexOf(columnToMove) !== -1) {
                    // The request column actually exists, so we will move it.
                    columnsToMove.push(columnToMove)
                }
            }

            const untouchedColumnNames: string[] = []
            for (const existingColumnName of existingColumns) {
                if (columnOrColumns.indexOf(existingColumnName) === -1) {
                    untouchedColumnNames.push(existingColumnName)
                }
            }
            
            return {
                columnNames: columnsToMove.concat(untouchedColumnNames),
                index: content.index,
                values: content.values,
                pairs: content.pairs,
            }
        })
    }

    bringToBack(columnOrColumns: string | string[]): IDataFrame<IndexT, ValueT> {

        if (isArray(columnOrColumns)) {
            for (const columnName of columnOrColumns) {
                if (!isString(columnName)) {
                    throw new Error('Expect \'columnOrColumns\' parameter to \'DataFrame.bringToBack\' function to specify a column or columns via a string or an array of strings.')	
                }
            }
        }
        else {
            if (!isString(columnOrColumns)) {
                throw new Error('Expect \'columnOrColumns\' parameter to \'DataFrame.bringToBack\' function to specify a column or columns via a string or an array of strings.')
            }

            columnOrColumns = [columnOrColumns] // Convert to array for coding convenience.
        }

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent()
            const existingColumns = Array.from(content.columnNames)
            const columnsToMove: string[] = []
            for (const columnToMove of columnOrColumns) {
                if (existingColumns.indexOf(columnToMove) !== -1) {
                    // The request column actually exists, so we will move it.
                    columnsToMove.push(columnToMove)
                }
            }

            const untouchedColumnNames: string[] = []
            for (const existingColumnName of existingColumns) {
                if (columnOrColumns.indexOf(existingColumnName) === -1) {
                    untouchedColumnNames.push(existingColumnName)
                }
            }
            
            return {
                columnNames: untouchedColumnNames.concat(columnsToMove),
                index: content.index,
                values: content.values,
                pairs: content.pairs,
            }
        })
    }

    withSeries<OutputValueT = any, SeriesValueT = any>(columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, OutputValueT> {
        if (isObject(columnNameOrSpec)) {
            if (series !== undefined) {
                throw new Error('Expected \'series\' parameter to \'DataFrame.withSeries\' to not be set when \'columnNameOrSpec is an object.')
            }
        } else {
            if (!isString(columnNameOrSpec)) {
                throw new Error('Expected \'columnNameOrSpec\' parameter to \'DataFrame.withSeries\' function to be a string that specifies the column to set or replace.')
            }
            if (!isFunction(series as Object) && !isObject(series)) {
                throw new Error('Expected \'series\' parameter to \'DataFrame.withSeries\' to be a Series object or a function that takes a dataframe and produces a Series.')
            }
        }

        if (isObject(columnNameOrSpec)) {
            const columnSpec: IColumnGenSpec = <IColumnGenSpec> columnNameOrSpec
            const columnNames = Object.keys(columnSpec)
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let workingDataFrame: IDataFrame<IndexT, ValueT> = this
            for (const columnName of columnNames) {
                workingDataFrame = workingDataFrame.withSeries(columnName, columnSpec[columnName])
            }
            return workingDataFrame.cast<OutputValueT>()
        }

        const columnName: string = <string> columnNameOrSpec

        // We have an empty data frame
        if (this.none()) {
            let importSeries: ISeries<IndexT, SeriesValueT>

            if (isFunction(series)) {
                importSeries = (series! as SeriesSelectorFn<IndexT, ValueT, SeriesValueT>)(this)
            } else {
                importSeries = series! as ISeries<IndexT, SeriesValueT>
            }

            return importSeries.inflate<ValueT>(value => {
                const row: any = {}
                row[columnName] = value
                return row
            }).cast<OutputValueT>()
        }

        return new DataFrame<IndexT, OutputValueT>(() => {
            let importSeries: ISeries<IndexT, SeriesValueT>
            if (isFunction(series)) {
                importSeries = (series! as SeriesSelectorFn<IndexT, ValueT, SeriesValueT>)(this)
            } else {
                importSeries = series! as ISeries<IndexT, SeriesValueT>
            }

            const seriesValueMap = toMap2(importSeries.toPairs(), pair => pair[0], pair => pair[1])
            const newColumnNames = makeDistinct(this.getColumnNames().concat([columnName]))

            return {
                columnNames: newColumnNames,
                index: this.getContent().index,
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, OutputValueT]>(this.getContent().pairs, pair => {
                    const index = pair[0]
                    const value = pair[1]
                    const modified: any = Object.assign({}, value)
                    modified[columnName] = seriesValueMap.get(index)
                    return [
                        index,
                        modified
                    ]
                })
            }
        })
    }

    getSeries<SeriesValueT = any>(columnName: string): ISeries<IndexT, SeriesValueT> {
        if (!isString(columnName)) {
            throw new Error('Expected \'columnName\' parameter to \'DataFrame.getSeries\' function to be a string that specifies the name of the column to retreive.')
        }

        return new Series<IndexT, SeriesValueT>(() => ({
            values: new SelectIterable<ValueT, SeriesValueT>(
                this.getContent().values,
                (row: any) => row[columnName]
            ),
            index: this.getContent().index,
        }))
    }

    deflate<ToT = ValueT>(selector?: SelectorWithIndexFn<ValueT, ToT>): ISeries<IndexT, ToT> {
        if (selector) {
            if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'DataFrame.deflate\' function to be a selector function.')
        }

        return new Series<IndexT, ToT>(() => {
            const content = this.getContent()
            if (selector) {
                return {
                    index: content.index,
                    values: new SelectIterable<ValueT, ToT>(content.values, selector),
                    pairs: new SelectIterable<[IndexT, ValueT], [IndexT, ToT]>(content.pairs, (pair, index) => {
                        return [
                            pair[0],
                            selector(pair[1], index)
                        ]
                    })
                }
            } else {
                return {
                    index: content.index,
                    values: content.values as any as Iterable<ToT>,
                    pairs: content.pairs as any as Iterable<[IndexT, ToT]>,
                }
            }
        })
    }

    distinct<ToT>(selector?: SelectorFn<ValueT, ToT>): IDataFrame<IndexT, ValueT> {
        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent()
            return {
                columnNames: content.columnNames,
                values: new DistinctIterable<ValueT, ToT>(content.values, selector),
                pairs: new DistinctIterable<[IndexT, ValueT],ToT>(content.pairs, (pair: [IndexT, ValueT]): ToT => selector && selector(pair[1]) || <ToT> <any> pair[1])
            }
        })
    }

    dropSeries<NewValueT = ValueT>(columnOrColumns: string | string[]): IDataFrame<IndexT, NewValueT> {
        if (!isArray(columnOrColumns)) {
            if (!isString(columnOrColumns)) {
                throw new Error('\'DataFrame.dropSeries\' expected either a string or an array or strings.')
            }

            columnOrColumns = [columnOrColumns as string]
        }

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent()
            const newColumnNames = []

            for (const columnName of content.columnNames) {
                if (columnOrColumns.indexOf(columnName) === -1) {
                    newColumnNames.push(columnName)
                }
            }
            return {
                columnNames: newColumnNames,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, value => {
                    const clone: any = Object.assign({}, value)
                    for (const droppedColumnName of columnOrColumns) {
                        delete clone[droppedColumnName]
                    }
                    return clone
                }),
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, pair => {
                    const clone: any = Object.assign({}, pair[1])
                    for (const droppedColumnName of columnOrColumns) {
                        delete clone[droppedColumnName]
                    }
                    return [pair[0], clone]
                })
            }
        })
    }

    hasSeries(columnName: string): boolean {
        const columnNameLwr = columnName.toLowerCase()
        for (const existingColumnName of this.getColumnNames()) {
            if (existingColumnName.toLowerCase() == columnNameLwr) {
                return true
            }
        }
        return false
    }

    except<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT> {

        if (outerSelector) {
            if (!isFunction(outerSelector)) throw new Error('Expected optional \'outerSelector\' parameter to \'DataFrame.except\' to be a function.')
        }
        else {
            outerSelector = value => <KeyT> <any> value
        }

        if (innerSelector) {
            if (!isFunction(innerSelector)) throw new Error('Expected optional \'innerSelector\' parameter to \'DataFrame.except\' to be a function.')
        }
        else {
            innerSelector = value => <KeyT> <any> value
        }

        const outer = this
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue)
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .none()
            })
    }

    expectSeries<SeriesValueT> (columnName: string): ISeries<IndexT, SeriesValueT> {
        if (!this.hasSeries(columnName)) {
            throw new Error('Expected dataframe to contain series with column name: \'' + columnName + '\'.')
        }

        return this.getSeries(columnName)
    }

    ensureSeries<SeriesValueT> (columnNameOrSpec: string | IColumnGenSpec, series?: ISeries<IndexT, SeriesValueT> | SeriesSelectorFn<IndexT, ValueT, SeriesValueT>): IDataFrame<IndexT, ValueT> {
        if (!isObject(columnNameOrSpec)) {
            if (!isString(columnNameOrSpec)) throw new Error('Expected \'columnNameOrSpec\' parameter to \'DataFrame.ensureSeries\' function to be a string that specifies the column to set or replace.')
            if (!isFunction(series as Object)) {
                if (!isObject(series)) throw new Error('Expected \'series\' parameter to \'DataFrame.ensureSeries\' to be a Series object or a function that takes a dataframe and produces a Series.')
            }
        }
        else {
            if (series !== undefined) throw new Error('Expected \'series\' parameter to \'DataFrame.ensureSeries\' to not be set when \'columnNameOrSpec is an object.')
        }

        if (isObject(columnNameOrSpec)) {
            const columnSpec: IColumnGenSpec = <IColumnGenSpec> columnNameOrSpec
            const columnNames = Object.keys(columnNameOrSpec)
            let workingDataFrame = <IDataFrame<IndexT,any>> this
            for (const columnName of columnNames) {
                workingDataFrame = workingDataFrame.ensureSeries(columnName, columnSpec[columnName])
            }

            return workingDataFrame
        }

        const columnName: string = <string> columnNameOrSpec
        if (this.hasSeries(columnName)) {
            return this // Already have the series.
        }
        else {
            return this.withSeries(columnName, series)
        }
    }

    renameSeries<NewValueT = ValueT>(newColumnNames: IColumnRenameSpec): IDataFrame<IndexT, NewValueT> {
        if (!isObject(newColumnNames)) throw new Error('Expected parameter \'newColumnNames\' to \'DataFrame.renameSeries\' to be an array with column names.')

        const existingColumnsToRename = Object.keys(newColumnNames)
        for (const existingColumnName of existingColumnsToRename) {
            if (!isString(existingColumnName)) throw new Error('Expected existing column name \'' + existingColumnName + '\' of \'newColumnNames\' parameter to \'DataFrame.renameSeries\' to be a string.')
            if (!isString(newColumnNames[existingColumnName])) throw new Error('Expected new column name \'' + newColumnNames[existingColumnName] + '\' for existing column \'' + existingColumnName + '\' of \'newColumnNames\' parameter to \'DataFrame.renameSeries\' to be a string.')
        }

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent()
            const renamedColumns: string[] = []

            for (const existingColumnName of content.columnNames) { // Convert the column rename spec to array of new column names.
                const columnIndex = existingColumnsToRename.indexOf(existingColumnName)
                if (columnIndex === -1) {
                    renamedColumns.push(existingColumnName) // This column is not renamed.                    
                }
                else {
                    renamedColumns.push(newColumnNames[existingColumnName]) // This column is renamed.
                }
            }
    
            //
            // Remap each row of the data frame to the new column names.
            //
            function remapValue (value: any): any {
                const clone = Object.assign({}, value)
    
                for (const existingColumName of existingColumnsToRename) {
                    clone[newColumnNames[existingColumName]] = clone[existingColumName]
                    delete clone[existingColumName]
                }
    
                return clone
            }
    
            return {
                columnNames: renamedColumns,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, remapValue),
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, pair => {
                    return [pair[0], remapValue(pair[1])]
                }),
            }
        })
    }

    reorderSeries<NewValueT = ValueT>(columnNames: string[]): IDataFrame<IndexT, NewValueT> {
        if (!isArray(columnNames)) throw new Error('Expected parameter \'columnNames\' to \'DataFrame.reorderSeries\' to be an array with column names.')

        for (const columnName of columnNames) {
            if (!isString(columnName)) throw new Error('Expected parameter \'columnNames\' to \'DataFrame.reorderSeries\' to be an array with column names.')
        }

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent()
            return {
                columnNames: columnNames,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, (value: any) => {
                    const output: any = {}
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName]
                    }

                    return <NewValueT> output
                }),
                pairs:  new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, (pair: [IndexT, ValueT]) => {
                    const value: any = <any> pair[1]
                    const output: any = {}
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName]
                    }

                    return [pair[0], <NewValueT> output]
                }),
            }
        })
    }

    static merge<MergedValueT = any, IndexT = any, ValueT = any>(dataFrames: Iterable<IDataFrame<IndexT, ValueT>>): IDataFrame<IndexT, MergedValueT> {
        const rowMap = new Map<IndexT, any>()
        const allColumnNames: string[] = []

        for (const dataFrame of dataFrames) {
            allColumnNames.push(...dataFrame.getColumnNames())

            for (const pair of dataFrame.toPairs()) {
                const index = pair[0]
                if (!rowMap.has(index)) {
                    const clone = Object.assign({}, pair[1])
                    rowMap.set(index, clone)
                } else {
                    rowMap.set(index, Object.assign(rowMap.get(index), pair[1]))
                }
            }
        }

        const newColumnNames = makeDistinct(allColumnNames)
        const mergedPairs = Array.from(rowMap.keys()).map(index => [index, rowMap.get(index)])

        mergedPairs.sort((a, b) => {
            if (a[0] === b[0]) {
                return 0
            } else if (a[0] > b[0]) {
                return 1
            } else {
                return -1
            }
        })

        return new DataFrame<IndexT, MergedValueT>({
            columnNames: newColumnNames,
            pairs: mergedPairs as [IndexT, MergedValueT][]
        })
    }

    merge<MergedValueT = ValueT>(...otherDataFrames: IDataFrame<IndexT, any>[]): IDataFrame<IndexT, MergedValueT> {
        return DataFrame.merge<MergedValueT, IndexT, any>([this as IDataFrame<IndexT, ValueT>].concat(otherDataFrames))
    }

    toArray(): ValueT[] {
        const values = []
        for (const value of this.getContent().values) {
            if (value !== undefined && value !== null) {
                values.push(value)
            }
        }
        return values
    }

    toObject<KeyT = any, FieldT = any, OutT = any>(keySelector: (value: ValueT) => KeyT, valueSelector: (value: ValueT) => FieldT): OutT {
        if (!isFunction(keySelector)) throw new Error('Expected \'keySelector\' parameter to DataFrame.toObject to be a function.')
        if (!isFunction(valueSelector)) throw new Error('Expected \'valueSelector\' parameter to DataFrame.toObject to be a function.')

        return toMap(this, keySelector, valueSelector)
    }

    toPairs(): ([IndexT, ValueT])[] {
        const pairs = []
        for (const pair of this.getContent().pairs) {
            if (pair[1] != undefined && pair[1] !== null) {
                pairs.push(pair)
            }
        }
        return pairs
    }

    toRows(): any[][] {
        const columnNames = this.getColumnNames()
        const rows = []
        for (const value of this.getContent().values) {
            const row = []
            for (let columnIndex = 0; columnIndex < columnNames.length; ++columnIndex) {
                row.push((<any>value)[columnNames[columnIndex]])
            }

            rows.push(row)
        }
        
        return rows
    }

    select<ToT>(selector: SelectorWithIndexFn<ValueT, ToT>): IDataFrame<IndexT, ToT> {
        if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'DataFrame.select\' function to be a function.')

        return new DataFrame(() => {
            const content = this.getContent()
            return {
                values: new SelectIterable<ValueT, ToT>(content.values, selector),
                index: content.index,    
            }
        })
    }

    selectMany<ToT>(selector: SelectorWithIndexFn<ValueT, Iterable<ToT>>): IDataFrame<IndexT, ToT> {
        if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'DataFrame.selectMany\' to be a function.')

        return new DataFrame(() => ({
            pairs: new SelectManyIterable(
                this.getContent().pairs, 
                (pair: [IndexT, ValueT], index: number): Iterable<[IndexT, ToT]> => {
                    const outputPairs: [IndexT, ToT][] = []
                    for (const transformed of selector(pair[1], index)) {
                        outputPairs.push([
                            pair[0],
                            transformed
                        ])
                    }
                    return outputPairs
                }
            )
        }))
    }

    subset<NewValueT = ValueT> (columnNames: string[]): IDataFrame<IndexT, NewValueT> {
        if (!isArray(columnNames)) throw new Error('Expected \'columnNames\' parameter to \'DataFrame.subset\' to be an array of column names to keep.')	

        return new DataFrame<IndexT, NewValueT>(() => {
            const content = this.getContent()
            return {
                columnNames: columnNames,
                index: content.index,
                values: new SelectIterable<ValueT, NewValueT>(content.values, (value: any) => {
                    const output: any = {}
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName]
                    }
                    return output
                }),
                pairs: new SelectIterable<[IndexT, ValueT], [IndexT, NewValueT]>(content.pairs, (pair: any) => {
                    const output: any = {}
                    const value = pair[1]
                    for (const columnName of columnNames) {
                        output[columnName] = value[columnName]
                    }
                    return [pair[0], output]
                }),
            }
        })
    }

    pivot<NewValueT = ValueT> (
        columnOrColumns: string | Iterable<string>, 
        valueColumnNameOrSpec: string | IMultiColumnAggregatorSpec, 
        aggregator?: (values: ISeries<number, any>) => any
            ): IDataFrame<number, NewValueT> {
        let columnNames: string[]

        if (isString(columnOrColumns)) {
            columnNames = [columnOrColumns as string]
        } else {
            if (!isArray(columnOrColumns)) {
                throw new Error('Expected \'columnOrColumns\' parameter to \'DataFrame.pivot\' to be a string or an array of strings that identifies the column(s) whose values make the new DataFrame\'s columns.')
            }

            columnNames = Array.from(columnOrColumns)

            if (columnNames.length === 0) throw new Error('Expected \'columnOrColumns\' parameter to \'DataFrame.pivot\' to contain at least one string.')

            for (const columnName of columnNames) {
                if (!isString(columnName)) throw new Error('Expected \'columnOrColumns\' parameter to \'DataFrame.pivot\' to be an array of strings, each string identifies a column in the DataFrame on which to pivot.')
            }
        }

        let aggSpec: IMultiColumnAggregatorSpec
        if (!isObject(valueColumnNameOrSpec)) {
            if (!isString(valueColumnNameOrSpec)) throw new Error('Expected \'value\' parameter to \'DataFrame.pivot\' to be a string that identifies the column whose values to aggregate or a column spec that defines which column contains the value ot aggregate and the ways to aggregate that value.')
            if (!isFunction(aggregator)) throw new Error('Expected \'aggregator\' parameter to \'DataFrame.pivot\' to be a function to aggregate pivoted values.')

            const aggColumnName = valueColumnNameOrSpec as string

            const outputSpec: IColumnAggregatorSpec = {}
            outputSpec[aggColumnName] = aggregator!

            aggSpec = {}
            aggSpec[aggColumnName] = outputSpec
        } else {
            aggSpec = valueColumnNameOrSpec as IMultiColumnAggregatorSpec
            
            for (const inputColumnName of Object.keys(aggSpec)) {
                const columnAggSpec = aggSpec[inputColumnName]
                if (isFunction(columnAggSpec)) {
                    aggSpec[inputColumnName] = {} as IColumnAggregatorSpec // Expand the pivot spec.
                    (aggSpec[inputColumnName] as IColumnAggregatorSpec)[inputColumnName] = columnAggSpec
                }
            }
        }

        const firstColumnName = columnNames[0]
        let working = this.groupBy((row: any) => row[firstColumnName])
            .select(group => {
                const output: any = {}
                output[firstColumnName] = (group.first() as any)[firstColumnName]
                output.src = group
                return output
            })
        
        for (let columnNameIndex = 1; columnNameIndex < columnNames.length; ++columnNameIndex) {
            const nextColumnName = columnNames[columnNameIndex]
            working = working.selectMany(parentGroup => {
                const src: IDataFrame<IndexT, ValueT> = parentGroup.src
                return src.groupBy((row: any) => row[nextColumnName])
                    .select(subGroup => {
                        const output = Object.assign({}, parentGroup)
                        output[nextColumnName] = (subGroup.first() as any)[nextColumnName]
                        output.src = subGroup
                        return output
                    })
            })
        }

        const valueColumnNames = Object.keys(aggSpec)
        const outputColumnMaps = toMap(
            valueColumnNames,
            valueColumnName => valueColumnName,
            valueColumnName => Object.keys(aggSpec[valueColumnName])
        )

        const pivotted = working.inflate<NewValueT>((row: any) => {
            for (const valueColumnName of valueColumnNames) {
                const outputColumnNames = outputColumnMaps[valueColumnName]
                for (const outputColumnName of outputColumnNames) {
                    const aggregatorFn = (aggSpec[valueColumnName] as IColumnAggregatorSpec)[outputColumnName]
                    row[outputColumnName] = aggregatorFn(row.src.deflate((srcRow: any) => srcRow[valueColumnName]))
                }
            }

            delete row.src
            return row
        })

        let ordered = pivotted.orderBy((row: any) => row[firstColumnName])
        for (let columnNameIndex = 1; columnNameIndex < columnNames.length; ++columnNameIndex) {
            const nextColumnName = columnNames[columnNameIndex]
            ordered = ordered.thenBy((row: any) => row[nextColumnName])
        }
        return ordered
    }

    groupBy<GroupT>(selector: SelectorWithIndexFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>> {
        if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'DataFrame.groupBy\' to be a selector function that determines the value to group the series by.')

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const groups: any[] = [] // Each group, in order of dicovery
            const groupMap: any = {} // Group map, records groups by key

            let valueIndex = 0

            for (const pair of this.getContent().pairs) {
                const groupKey = selector(pair[1], valueIndex)
                ++valueIndex
                const existingGroup = groupMap[groupKey]
                if (existingGroup) {
                    existingGroup.push(pair)
                } else {
                    const newGroup: any[] = []
                    newGroup.push(pair)
                    groups.push(newGroup)
                    groupMap[groupKey] = newGroup
                }
            }

            return {
                values: groups.map(group => new DataFrame<IndexT, ValueT>({ pairs: group }))
            }
        })
    }

    groupSequentialBy<GroupT>(selector?: SelectorFn<ValueT, GroupT>): ISeries<number, IDataFrame<IndexT, ValueT>> {
        if (selector) {
            if (!isFunction(selector)) throw new Error('Expected \'selector\' parameter to \'DataFrame.groupSequentialBy\' to be a selector function that determines the value to group the series by.')
        }
        else {
            selector = value => <GroupT> <any> value
        }
        
        return this.variableWindow((a: ValueT, b: ValueT): boolean => selector!(a) === selector!(b))
    }

    orderBy<SortT> (selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        const content = this.getContent()
        return new OrderedDataFrame<IndexT, ValueT, SortT>({
            columnNames: content.columnNames,
            values: content.values,
            pairs: content.pairs,
            selector: selector,
            direction: Direction.Ascending,
            parent: null,
        })
    }

    orderByDescending<SortT>(selector: SelectorWithIndexFn<ValueT, SortT>): IOrderedDataFrame<IndexT, ValueT, SortT> {
        const content = this.getContent()
        return new OrderedDataFrame<IndexT, ValueT, SortT>({
            columnNames: content.columnNames,
            values: content.values, 
            pairs: content.pairs, 
            selector: selector, 
            direction: Direction.Descending, 
            parent: null,
        })
    }

    inflateSeries(columnName: string, selector?: SelectorWithIndexFn<IndexT, any>): IDataFrame<IndexT, ValueT> {
        if (!isString(columnName)) throw new Error('Expected \'columnName\' parameter to \'DataFrame.inflateSeries\' to be a string that is the name of the column to inflate.')

        if (selector) {
            if (!isFunction(selector)) throw new Error('Expected optional \'selector\' parameter to \'DataFrame.inflateSeries\' to be a selector function, if it is specified.')
        }

        return this.zip(
            this.getSeries(columnName).inflate(selector),
            (row1, row2) => Object.assign({}, row1, row2) //todo: this be should zip's default operation.
        )
    }

    insertPair(pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT> {
        if (!isArray(pair)) throw new Error('Expected \'pair\' parameter to \'DataFrame.insertPair\' to be an array.')
        if (pair.length !== 2) throw new Error('Expected \'pair\' parameter to \'DataFrame.insertPair\' to be an array with two elements. The first element is the index, the second is the value.')

        return (new DataFrame<IndexT, ValueT>(({
            pairs: [pair]
        }))).concat(this)
    }

    intersection<InnerIndexT = IndexT, InnerValueT = ValueT, KeyT = ValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerSelector?: SelectorFn<ValueT, KeyT>,
        innerSelector?: SelectorFn<InnerValueT, KeyT>): 
            IDataFrame<IndexT, ValueT> {

        if (outerSelector) {
            if (!isFunction(outerSelector)) throw new Error('Expected optional \'outerSelector\' parameter to \'DataFrame.intersection\' to be a function.')
        }
        else {
            outerSelector = value => <KeyT> <any> value
        }
        
        if (innerSelector) {
            if (!isFunction(innerSelector)) throw new Error('Expected optional \'innerSelector\' parameter to \'DataFrame.intersection\' to be a function.')
        }
        else {
            innerSelector = value => <KeyT> <any> value
        }

        const outer = this
        return outer.where(outerValue => {
                const outerKey = outerSelector!(outerValue)
                return inner
                    .where(innerValue => outerKey === innerSelector!(innerValue))
                    .any()
            })
    }

    join<KeyT, InnerIndexT, InnerValueT, ResultValueT> (
        inner: IDataFrame<InnerIndexT, InnerValueT>, 
        outerKeySelector: SelectorFn<ValueT, KeyT>, 
        innerKeySelector: SelectorFn<InnerValueT, KeyT>, 
        resultSelector: JoinFn<ValueT, InnerValueT, ResultValueT>):
            IDataFrame<number, ResultValueT> {

        if (!isFunction(outerKeySelector)) throw new Error('Expected \'outerKeySelector\' parameter of \'DataFrame.join\' to be a selector function.')
        if (!isFunction(innerKeySelector)) throw new Error('Expected \'innerKeySelector\' parameter of \'DataFrame.join\' to be a selector function.')
        if (!isFunction(resultSelector)) throw new Error('Expected \'resultSelector\' parameter of \'DataFrame.join\' to be a selector function.')

        const outer = this

        return new DataFrame<number, ResultValueT>(() => {
            const innerMap = inner
                .groupBy(innerKeySelector)
                .toObject(
                    group => innerKeySelector(group.first()), 
                    group => group
                )

            const output: ResultValueT[] = []
            
            for (const outerValue of outer) { //TODO: There should be an enumerator that does this.
                const outerKey = outerKeySelector(outerValue)
                const innerGroup = innerMap[outerKey]
                if (innerGroup) {
                    for (const innerValue of innerGroup) {
                        output.push(resultSelector(outerValue, innerValue))
                    }    
                }
            }

            return {
                values: output
            }
        })
    }

    appendPair(pair: [IndexT, ValueT]): IDataFrame<IndexT, ValueT> {
        if (!isArray(pair)) throw new Error('Expected \'pair\' parameter to \'DataFrame.appendPair\' to be an array.')
        if (pair.length !== 2) throw new Error('Expected \'pair\' parameter to \'DataFrame.appendPair\' to be an array with two elements. The first element is the index, the second is the value.')

        return this.concat(new DataFrame<IndexT, ValueT>({ pairs: [pair] }))
    }

    static concat<IndexT = any, ValueT = any> (dataframes: IDataFrame<IndexT, ValueT>[]): IDataFrame<IndexT, ValueT > {
        if (!isArray(dataframes)) throw new Error('Expected \'dataframes\' parameter to \'DataFrame.concat\' to be an array of dataframes.')

        return new DataFrame(() => {
            const upcast = <DataFrame<IndexT, ValueT>[]> dataframes
            const contents = upcast.map(dataframe => dataframe.getContent())

            let columnNames: string[] = []
            for (const content of contents) {
                for (const columnName of content.columnNames) {
                    columnNames.push(columnName)
                }
            }

            columnNames = makeDistinct(columnNames)

            return {
                columnNames: columnNames,
                values: new ConcatIterable(contents.map(content => content.values)),
                pairs: new ConcatIterable(contents.map(content => content.pairs)),
            }
        })
    }

    concat(...dataframes: (IDataFrame<IndexT, ValueT>[] | IDataFrame<IndexT, ValueT>)[]): IDataFrame<IndexT, ValueT> {
        const concatInput: IDataFrame<IndexT, ValueT>[] = [this]

        for (const input of dataframes) {
            if (isArray(input)) {
                for (const subInput of input) {
                    concatInput.push(subInput)
                }
            } else {
                concatInput.push(input)
            }
        }

        return DataFrame.concat<IndexT, ValueT>(concatInput)
    }

    where(predicate: PredicateFn<ValueT>): IDataFrame<IndexT, ValueT> {
        if (!isFunction(predicate)) throw new Error('Expected \'predicate\' parameter to \'DataFrame.where\' function to be a function.')

        return new DataFrame<IndexT, ValueT>(() => {
            const content = this.getContent()
            return {
                columnNames: content.columnNames,
                values: new WhereIterable(content.values, predicate),
                pairs: new WhereIterable(content.pairs, pair => predicate(pair[1]))
            }
        })
    }

    window(period: number): ISeries<number, IDataFrame<IndexT, ValueT>> {
        if (!isNumber(period)) throw new Error('Expected \'period\' parameter to \'DataFrame.window\' to be a number.')

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const content = this.getContent()

            return {
                values: new DataFrameWindowIterable<IndexT, ValueT>(content.columnNames, content.pairs, period)
            }
        })
    }

    rollingWindow(period: number): ISeries<number, IDataFrame<IndexT, ValueT>> {
        if (!isNumber(period)) throw new Error('Expected \'period\' parameter to \'DataFrame.rollingWindow\' to be a number.')

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const content = this.getContent()
            return {
                values: new DataFrameRollingWindowIterable<IndexT, ValueT>(content.columnNames, content.pairs, period)
            }            
        })
    }

    first(): ValueT {
        for (const value of this) {
            return value // Only need the first value.
        }

        throw new Error('DataFrame.first: No values in DataFrame.')
    }

    last(): ValueT {
        let lastValue = null

        for (const value of this) {
            lastValue = value // Throw away all values until we get to the last one.
        }

        if (lastValue === null) {
            throw new Error('DataFrame.last: No values in DataFrame.')
        }

        return lastValue
    }

    parseInts(columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT> {
        if (isArray(columnNameOrNames)) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let working: IDataFrame<IndexT, ValueT> = this
            for (const columnName of columnNameOrNames) {
                working = working.parseInts(columnName)
            }
            
            return working
        } else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).parseInts())
        }
    }

    parseFloats(columnNameOrNames: string | string[]): IDataFrame<IndexT, ValueT> {
        if (isArray(columnNameOrNames)) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let working: IDataFrame<IndexT, ValueT> = this
            for (const columnName of columnNameOrNames) {
                working = working.parseFloats(columnName)
            }
            
            return working
        }
        else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).parseFloats())
        }
    }

    parseDates(columnNameOrNames: string | string[], formatString?: string): IDataFrame<IndexT, ValueT> {
        if (formatString) {
            if (!isString(formatString)) throw new Error('Expected optional \'formatString\' parameter to \'DataFrame.parseDates\' to be a string (if specified).')
        }

        if (isArray(columnNameOrNames)) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let working: IDataFrame<IndexT, ValueT> = this
            for (const columnName of columnNameOrNames) {
                working = working.parseDates(columnName, formatString)
            }
            
            return working
        }
        else {
            return this.withSeries(columnNameOrNames, this.getSeries(columnNameOrNames).parseDates(formatString))
        }
    }

    toStrings(columnNames: string | string[] | IFormatSpec, formatString?: string): IDataFrame<IndexT, ValueT> {
        if (isObject(columnNames)) {
            for (const columnName of Object.keys(columnNames)) {
                if (!isString((columnNames as any)[columnName])) throw new Error('Expected values of \'columnNames\' parameter to be strings when a format spec is passed in.')
            }

            if (formatString !== undefined) throw new Error('Optional \'formatString\' parameter to \'DataFrame.toStrings\' should not be set when passing in a format spec.')
        }
        else {
            if (!isArray(columnNames)) {
                if (!isString(columnNames)) throw new Error('Expected \'columnNames\' parameter to \'DataFrame.toStrings\' to be a string, array of strings or format spec that specifes which columns should be converted to strings.')
            }

            if (formatString) {
                if (!isString(formatString)) throw new Error('Expected optional \'formatString\' parameter to \'DataFrame.toStrings\' to be a string (if specified).')
            }
        }

        if (isObject(columnNames)) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let working: IDataFrame<IndexT, ValueT> = this
            for (const columnName of Object.keys(columnNames)) {
                working = working.toStrings(columnName, formatString)
            }
            
            return working
        }
        else if (isArray(columnNames)) {
            let working: IDataFrame<IndexT, ValueT> = this
            for (const columnName of columnNames) {
                const columnFormatString = (columnNames as any)[columnName]
                working = working.toStrings(columnName, columnFormatString)
            }
            
            return working
        }
        else {
            const singleColumnName = columnNames as string
            return this.withSeries(singleColumnName, this.getSeries(singleColumnName).toStrings(formatString))
        }
    }

    transformSeries<NewValueT = ValueT>(columnSelectors: IColumnTransformSpec): IDataFrame<IndexT, NewValueT> {
        if (!isObject(columnSelectors)) throw new Error('Expected \'columnSelectors\' parameter of \'DataFrame.transformSeries\' function to be an object. Field names should specify columns to transform. Field values should be selector functions that specify the transformation for each column.')

        let working: IDataFrame<IndexT, any> = this

        for (const columnName of Object.keys(columnSelectors)) {
            if (working.hasSeries(columnName)) {
                working = working.withSeries(
                    columnName, 
                    working.getSeries(columnName)
                        .select(columnSelectors[columnName])
                )
            }
        }

        return working
    }

    union<KeyT = ValueT>(other: IDataFrame<IndexT, ValueT>, selector?: SelectorFn<ValueT, KeyT>): IDataFrame<IndexT, ValueT> {
        if (selector) {
            if (!isFunction(selector)) throw new Error('Expected optional \'selector\' parameter to \'DataFrame.union\' to be a selector function.')
        }

        return this.concat(other).distinct(selector)
    }

    variableWindow(comparer: ComparerFn<ValueT, ValueT>): ISeries<number, IDataFrame<IndexT, ValueT>> {
        if (!isFunction(comparer)) throw new Error('Expected \'comparer\' parameter to \'DataFrame.variableWindow\' to be a function.')

        return new Series<number, IDataFrame<IndexT, ValueT>>(() => {
            const content = this.getContent()
            return {
                values: new DataFrameVariableWindowIterable<IndexT, ValueT>(content.columnNames, content.pairs, comparer)
            }            
        })
    }
 
    static zip<IndexT = any, ValueT = any, ResultT = any>(dataframes: Iterable<IDataFrame<IndexT, ValueT>>, zipper: ZipNFn<ValueT, ResultT>): IDataFrame<IndexT, ResultT> {
        const input = Array.from(dataframes)

        if (input.length === 0) {
            return new DataFrame<IndexT, ResultT>()
        }

        const firstSeries = input[0]
        if (firstSeries.none()) {
            return new DataFrame<IndexT, ResultT>()
        }

        return new DataFrame<IndexT, ResultT>(() => {
            const firstSeriesUpCast = <DataFrame<IndexT, ValueT>> firstSeries
            const upcast = <DataFrame<IndexT, ValueT>[]> input // Upcast so that we can access private index, values and pairs.
            
            return {
                index: <Iterable<IndexT>> firstSeriesUpCast.getContent().index,
                values: new ZipIterable<ValueT, ResultT>(upcast.map(s => s.getContent().values), zipper),
            }
        })
    }

    zip<Index2T, Value2T, ResultT>(s2: IDataFrame<Index2T, Value2T>, zipper: Zip2Fn<ValueT, Value2T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, ResultT>(s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<Index2T, Value2T, Index3T, Value3T, Index4T, Value4T, ResultT>(s2: IDataFrame<Index2T, Value2T>, s3: IDataFrame<Index3T, Value3T>, s4: IDataFrame<Index4T, Value4T>, zipper: Zip3Fn<ValueT, Value2T, Value3T, ResultT> ): IDataFrame<IndexT, ResultT>;
    zip<ResultT>(...args: any[]): IDataFrame<IndexT, ResultT> {
        const selector: Function = args[args.length-1]
        const input: IDataFrame<IndexT, any>[] = [this].concat(args.slice(0, args.length-1))
        return DataFrame.zip<IndexT, any, ResultT>(input, values => selector(...values))
    } 
}