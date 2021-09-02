import { tensor } from '@tensorflow/tfjs-node'
import { arrToObj, getColValues, getRowAndColValues, keyInObject, removeArr, throwWrongParamsError } from '../utils'
import { ColumnType } from './ColumnType'
import { DropArgs, IDataFrame } from './IDataFrame'
import { indexLoc, IndexLocArgs } from './indexLoc'
import { ILocArgs, INDframe, LocArgs } from './INDframe'
import { NDframe } from './NDframe'
import { Series } from './Series'

export interface DataFrameArgs {
    index?: ColumnType[]
    columns?: ColumnType[]
    dtypes?: string[]
}

export class DataFrame extends NDframe implements IDataFrame {
    constructor(data, kwargs: DataFrameArgs = {}) {
        super(data, kwargs)
        this._setColumnProperty() //set column property on DataFrame Class for easy accessing using the format df['colname']
    }

    private _setColumnProperty() {
        //
    }

    /**
     * Prints the first n values in a dataframe
     * @param {rows}  rows --> int
     * @returns DataFrame
     */
    head(rows = 5): IDataFrame {
        if (rows > this.data.length || rows < 1) {
            // Return All values
            return this
        } else {
            // Creates a new dataframe with first [rows]
            const data = this.data.slice(0, rows)
            const idx = this.index.slice(0, rows)
            const config = { columns: this.columnNames, index: idx }
            return new DataFrame(data, config)
        }
    }

    drop(kwargs: DropArgs) {
        const paramsNeeded = ['columns', 'index', 'inplace', 'axis']
        throwWrongParamsError(kwargs, paramsNeeded)

        kwargs.inplace = kwargs.inplace || false

        if (!('axis' in kwargs)) {
            kwargs.axis = 1
        }

        let toDrop: ColumnType[] = null
        if ('index' in kwargs && kwargs.axis == 0) {
            toDrop = kwargs.index
        } else {
            toDrop = kwargs.columns
        }

        if (kwargs.axis == 1) {
            // Drop column
            if (!('columns' in kwargs)) {
                throw Error(
                    'No column found. Axis of 1 must be accompanied by an array of column(s) names'
                )
            }

            const newColData: Record<ColumnType, any> = {}
            const newDtype: string[] = []

            const colIndex = toDrop.map((column) => {
                const colIdx = this.columns.indexOf(column)
                if (colIdx == -1) {
                    throw new Error(`column "${column}" does not exist`)
                }
                return colIdx
            })

            this.colData.forEach((col, idx) => {
                if (!colIndex.includes(idx)) {
                    newColData[this.columnNames[idx]] = col
                    newDtype.push(this.dtypes[idx])
                }
            })

            if (!kwargs.inplace) {
                const oldCols = this.columns
                const newColumns = Object.keys(newColData)
                const df = new DataFrame(newColData, {
                    index: this.index,
                    dtypes: newDtype
                })
                df._setColProperty(df, df.colData, newColumns, oldCols)
                return df
            } else {
                const oldCols = this.columns
                const newColumns = Object.keys(newColData)
                this._updateFrameInPlace(null, null, newColData, null, newDtype)
                this._setColProperty(this, this.colData, newColumns, oldCols)
            }
        } else { // (kwargs.axis == 1)
            if (!keyInObject(kwargs, 'index')) {
                throw Error(
                    'No index label found. Axis of 0 must be accompanied by an array of index labels'
                )
            }
            toDrop.forEach((x) => {
                if (!this.index.includes(x))
                    throw new Error(`${x} does not exist in index`)
            })
            const values = this.values
            const dataIdx = []
            let newData, newIndex
            if (typeof toDrop[0] == 'string') {
                //get index of strings labels in rows
                this.index.forEach((idx, i) => {
                    if (toDrop.includes(idx)) {
                        dataIdx.push(i)
                    }
                })
                newData = removeArr(values, dataIdx)
                newIndex = removeArr(this.index, dataIdx)
            } else {
                newData = removeArr(values, toDrop)
                newIndex = removeArr(this.index, toDrop)
            }

            if (!kwargs['inplace']) {
                return new DataFrame(newData, {
                    columns: this.columns,
                    index: newIndex
                })
            } else {
                this.rowDataTensor = tensor(newData)
                this.data = newData
                this.setIndex(newIndex)
            }
        }
    }

    /**
     * Returns the data types in the DataFrame
     * @return {Array} list of data types for each column
     */
    get ctypes() {
        const cols = this.columnNames
        const dTypes = this.colTypes
        const sf = new Series(dTypes, { index: cols })
        return sf
    }

    loc(kwargs: LocArgs = {}): IDataFrame {
        const paramsNeeded = ['columns', 'rows']
        throwWrongParamsError(kwargs, paramsNeeded)

        const indexLocArgs: IndexLocArgs = {
            ...kwargs,
            type: 'loc'
        }
        const [newData, columns, rows] = indexLoc(this, indexLocArgs)
        const df = new DataFrame(newData, { columns: columns })
        df.setIndex(rows)
        return df
    }

    iloc(kwargs: ILocArgs = {}): IDataFrame {
        const paramsNeeded = ['columns', 'rows']
        throwWrongParamsError(kwargs, paramsNeeded)

        const indexLocArgs: IndexLocArgs = {
            ...kwargs,
            type: 'iloc'
        }

        const [newData, columns, rows] = indexLoc(this, indexLocArgs)
        const df = new DataFrame(newData, { columns: columns })
        df.setIndex(rows)
        return df
    }

    column(colName: string): INDframe {
        if (!this.columns.includes(colName)) {
            throw new Error(`column ${colName} does not exist`)
        }
        const colIdxObjs = arrToObj(this.columns)
        const indx = colIdxObjs[colName]
        const data = this.colData[indx]
        return new Series(data, { columns: [colName] })
    }

    transpose(): IDataFrame {
        return new DataFrame(this.colData, {
            columns: this.columnNames,
            index: this.index
        })
    }

    // set all columns to DataFrame Property. This ensures easy access to columns as Series
    private _setColProperty(self: IDataFrame, colVals: any[], colNames: ColumnType[], oldColNames: ColumnType[]) {
        // delete old name
        oldColNames.forEach((name) => {
            delete self[name]
        })

        colVals.forEach((col, i) => {
            Object.defineProperty(this, colNames[i], {
                configurable: true,
                get() {
                    return new Series(col, { columns: [colNames[i]], index: self.index })
                },
                set(value) {
                    this.addColumn({ column: colNames[i], value: value })
                }
            })
        })
    }

    // update a DataFrame in place
    private _updateFrameInPlace(rowData: any[], columnNames: ColumnType[], colObj: Record<ColumnType, any>, index: ColumnType[], dtypes: string[]) {
        if (rowData != undefined) {
            this.data = rowData
        } else {
            // check column is available and create row from column
            if (colObj != undefined) {
                const res = getRowAndColValues(colObj)
                this.data = res[0]
                this.columns = res[1]
                columnNames = res[1]
            }
        }

        if (colObj != undefined) {
            this.colData = Object.values(colObj)
            this.columns = Object.keys(colObj)
            columnNames = Object.keys(colObj)
        } else {
            // check if row data is available and create column data from rows
            if (rowData != undefined) {
                this.colData = getColValues(rowData) //get column data from row
            }
        }

        if (columnNames != undefined) {
            this.columns = columnNames
        }
        if (index != undefined) {
            this.indexArr = index
        }
        if (dtypes != undefined) {
            this.colTypes = dtypes
        }
    }
}