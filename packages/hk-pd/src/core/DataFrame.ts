import { ColumnNamesIterable } from '../iterables/ColumnNamesIterable'
import { CountIterable } from '../iterables/CountIterable'
import { CsvRowsIterable } from '../iterables/CsvRowsIterable'
import { EmptyIterable } from '../iterables/EmptyIterable'
import { ExtractElementIterable } from '../iterables/ExtractElementIterable'
import { MultiIterable } from '../iterables/MultiTerable'
import { SelectIterable } from '../iterables/SelectIterable'
import { TakeIterable } from '../iterables/TakeIterable'
import { isArray } from '../utils/isArray'
import { isFunction } from '../utils/isFunction'
import { isNumber } from '../utils/isNumber'
import { isObject } from '../utils/isObject'
import { isString } from '../utils/isString'
import { toMap } from '../utils/toMap'
import { DataFrameConfigFn } from './DataFrameConfigFn'
import { IColumnConfig } from './IColumnConfig'
import { IDataFrame } from './IDataFrame'
import { IDataFrameConfig } from './IDataFrameConfig'
import { IDataFrameContent } from './IDataFrameContent'
import { ISeries } from './ISeries'
import { Series } from './Series'

export class DataFrame<IndexT, ValueT> implements IDataFrame<IndexT, ValueT> {
    private _configFn: DataFrameConfigFn<IndexT, ValueT> | null = null;
    private _content: IDataFrameContent<IndexT, ValueT> | null = null;

    private static readonly _defaultEmptyIterable = new EmptyIterable();
    private static readonly _defaultCountIterable = new CountIterable();

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
        if (this.content === null && this._configFn !== null) {
            this._content = DataFrame._initFromConfig(this._configFn())
        }
    }

    get content() {
        this._lazyInit()
        return this._content
    }

    [Symbol.iterator](): Iterator<any> {
        return this.content.values[Symbol.iterator]()
    }

    count(): number {
        let total = 0
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const value of this.content.values) {
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
            const content = this.content
            return {
                columnNames: content.columnNames,
                index: new TakeIterable(content.index, numRows),
                values: new TakeIterable(content.values, numRows),
                pairs: new TakeIterable(content.pairs, numRows),
            }
        })
    }

    getSeries<SeriesValueT = any>(columnName: string): ISeries<IndexT, SeriesValueT> {
        if (!isString(columnName)) {
            throw new Error('Expected \'columnName\' parameter to \'DataFrame.getSeries\' function to be a string that specifies the name of the column to retreive.')
        }

        return new Series<IndexT, SeriesValueT>(() => ({
            values: new SelectIterable<ValueT, SeriesValueT>(
                this.content.values,
                (row: any) => row[columnName]
            ),
            index: this.content.index,
        }))
    }

//     drop(kwargs: DropArgs) {
//         const paramsNeeded = ['columns', 'index', 'inplace', 'axis']
//         throwWrongParamsError(kwargs, paramsNeeded)

//         kwargs.inplace = kwargs.inplace || false

//         if (!('axis' in kwargs)) {
//             kwargs.axis = 1
//         }

//         let toDrop: ColumnType[] = null
//         if ('index' in kwargs && kwargs.axis == 0) {
//             toDrop = kwargs.index
//         } else {
//             toDrop = kwargs.columns
//         }

//         if (kwargs.axis == 1) {
//             // Drop column
//             if (!('columns' in kwargs)) {
//                 throw Error(
//                     'No column found. Axis of 1 must be accompanied by an array of column(s) names'
//                 )
//             }

//             const newColData: Record<ColumnType, any> = {}
//             const newDtype: string[] = []

//             const colIndex = toDrop.map((column) => {
//                 const colIdx = this.columns.indexOf(column)
//                 if (colIdx == -1) {
//                     throw new Error(`column "${column}" does not exist`)
//                 }
//                 return colIdx
//             })

//             this.colData.forEach((col, idx) => {
//                 if (!colIndex.includes(idx)) {
//                     newColData[this.columnNames[idx]] = col
//                     newDtype.push(this.dtypes[idx])
//                 }
//             })

//             if (!kwargs.inplace) {
//                 const oldCols = this.columns
//                 const newColumns = Object.keys(newColData)
//                 const df = new DataFrame(newColData, {
//                     index: this.index,
//                     dtypes: newDtype
//                 })
//                 df._setColProperty(df, df.colData, newColumns, oldCols)
//                 return df
//             } else {
//                 const oldCols = this.columns
//                 const newColumns = Object.keys(newColData)
//                 this._updateFrameInPlace(null, null, newColData, null, newDtype)
//                 this._setColProperty(this, this.colData, newColumns, oldCols)
//             }
//         } else { // (kwargs.axis == 1)
//             if (!keyInObject(kwargs, 'index')) {
//                 throw Error(
//                     'No index label found. Axis of 0 must be accompanied by an array of index labels'
//                 )
//             }
//             toDrop.forEach((x) => {
//                 if (!this.index.includes(x))
//                     throw new Error(`${x} does not exist in index`)
//             })
//             const values = this.values
//             const dataIdx = []
//             let newData, newIndex
//             if (typeof toDrop[0] == 'string') {
//                 //get index of strings labels in rows
//                 this.index.forEach((idx, i) => {
//                     if (toDrop.includes(idx)) {
//                         dataIdx.push(i)
//                     }
//                 })
//                 newData = removeArr(values, dataIdx)
//                 newIndex = removeArr(this.index, dataIdx)
//             } else {
//                 newData = removeArr(values, toDrop)
//                 newIndex = removeArr(this.index, toDrop)
//             }

//             if (!kwargs['inplace']) {
//                 return new DataFrame(newData, {
//                     columns: this.columns,
//                     index: newIndex
//                 })
//             } else {
//                 this.rowDataTensor = tensor(newData)
//                 this.data = newData
//                 this.setIndex(newIndex)
//             }
//         }
//     }

//     /**
//      * Returns the data types in the DataFrame
//      * @return {Array} list of data types for each column
//      */
//     get ctypes() {
//         const cols = this.columnNames
//         const dTypes = this.colTypes
//         const sf = new Series(dTypes, { index: cols })
//         return sf
//     }

//     loc(kwargs: LocArgs = {}): IDataFrame {
//         const paramsNeeded = ['columns', 'rows']
//         throwWrongParamsError(kwargs, paramsNeeded)

//         const indexLocArgs: IndexLocArgs = {
//             ...kwargs,
//             type: 'loc'
//         }
//         const [newData, columns, rows] = indexLoc(this, indexLocArgs)
//         const df = new DataFrame(newData, { columns: columns })
//         df.setIndex(rows)
//         return df
//     }

//     iloc(kwargs: ILocArgs = {}): IDataFrame {
//         const paramsNeeded = ['columns', 'rows']
//         throwWrongParamsError(kwargs, paramsNeeded)

//         const indexLocArgs: IndexLocArgs = {
//             ...kwargs,
//             type: 'iloc'
//         }

//         const [newData, columns, rows] = indexLoc(this, indexLocArgs)
//         const df = new DataFrame(newData, { columns: columns })
//         df.setIndex(rows)
//         return df
//     }

//     column(colName: string): Series {
//         if (!this.columns.includes(colName)) {
//             throw new Error(`column ${colName} does not exist`)
//         }
//         const colIdxObjs = arrToObj(this.columns)
//         const indx = colIdxObjs[colName]
//         const data = this.colData[indx]
//         return new Series(data, { columns: [colName] })
//     }

//     // transpose(): IDataFrame {
//     //     return new DataFrame(this.colData, {
//     //         columns: this.columnNames,
//     //         index: this.index
//     //     })
//     // }

//     // set all columns to DataFrame Property. This ensures easy access to columns as Series
//     private _setColProperty(self: IDataFrame, colVals: any[], colNames: ColumnType[], oldColNames: ColumnType[]) {
//         // delete old name
//         oldColNames.forEach((name) => {
//             delete self[name]
//         })

//         colVals.forEach((col, i) => {
//             Object.defineProperty(this, colNames[i], {
//                 configurable: true,
//                 get() {
//                     return new Series(col, { columns: [colNames[i]], index: self.index })
//                 },
//                 set(value) {
//                     this.addColumn({ column: colNames[i], value: value })
//                 }
//             })
//         })
//     }

//     // update a DataFrame in place
//     private _updateFrameInPlace(rowData: any[], columnNames: ColumnType[], colObj: Record<ColumnType, any>, index: ColumnType[], dtypes: string[]) {
//         if (rowData != undefined) {
//             this.data = rowData
//         } else {
//             // check column is available and create row from column
//             if (colObj != undefined) {
//                 const res = getRowAndColValues(colObj)
//                 this.data = res[0]
//                 this.columns = res[1]
//                 columnNames = res[1]
//             }
//         }

//         if (colObj != undefined) {
//             this.colData = Object.values(colObj)
//             this.columns = Object.keys(colObj)
//             columnNames = Object.keys(colObj)
//         } else {
//             // check if row data is available and create column data from rows
//             if (rowData != undefined) {
//                 this.colData = getColValues(rowData) //get column data from row
//             }
//         }

//         if (columnNames != undefined) {
//             this.columns = columnNames
//         }
//         if (index != undefined) {
//             this.indexArr = index
//         }
//         if (dtypes != undefined) {
//             this.colTypes = dtypes
//         }
//     }
}