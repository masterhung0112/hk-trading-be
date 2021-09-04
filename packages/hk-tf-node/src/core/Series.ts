import { config } from '../Config'
import { convert2DTo1D, isObject, throwStrDtypeError, throwWrongParamsError } from '../utils'
import { ColumnType } from './ColumnType'
import { indexLoc, IndexLocArgs } from './indexLoc'
import { INDframe, ILocArgs, LocArgs } from './INDframe'
import { NDframe } from './NDframe'
import { table, ColumnUserConfig } from 'table'

export interface SeriesArgs {
    index?: ColumnType[]
    columns?: ColumnType[]
    dtypes?: string[]
}

/**
 * One-dimensional ndarray with axis labels (including time series).
 * The object supports both integer- and label-based indexing and provides a host of methods for performing operations involving the index.
 * Operations between Series (+, -, /, , *) align values based on their associated index values– they need not be the same length.
 * @param {data} data Array, JSON of 1D values
 * @param {kwargs} Object {columns: column names, dtypes : data type of values}
 *
 * @returns Series
 */
export class Series extends NDframe {
    constructor(data: any[], kwargs: SeriesArgs) {
        if (Array.isArray(data[0]) || isObject(data[0])) {
            data = convert2DTo1D(data)
            super(data, kwargs)
        } else {
            super(data, kwargs)
        }
    }

    loc(kwargs?: LocArgs): INDframe {
        const paramsNeeded = ['rows']
        throwWrongParamsError(kwargs, paramsNeeded)

        const indexLocArgs: IndexLocArgs = {
            ...kwargs,
            type: 'loc'
        }

        const [newData, columns, rows] = indexLoc(this, indexLocArgs)
        return new Series(newData, { columns: columns, index: rows })
    }

    min(): number {
        throwStrDtypeError(this, 'min')
        return this.rowDataTensor.min().arraySync() as number
    }

    max(): number {
        throwStrDtypeError(this, 'max')
        return this.rowDataTensor.max().arraySync() as number
    }

    iloc(kwargs?: ILocArgs): INDframe {
        const paramsNeeded = ['rows']
        throwWrongParamsError(kwargs, paramsNeeded)

        const indexLocArgs: IndexLocArgs = {
            ...kwargs,
            type: 'iloc'
        }

        const [newData, columns, rows] = indexLoc(this, indexLocArgs)
        return new Series(newData, { columns: columns, index: rows })
    }

    toString() {
        const tableWidth = 20
        const tableTruncate = 20
        const maxRow = config.tableMaxRow
        const dataArr = []
        const tableConfig: { [index: number]: ColumnUserConfig } = {}
        let idx: ColumnType[], data: any[]
        let header: ColumnType[] = ['']
        header = header.concat(this.columns)

        if (this.values.length > maxRow) {
            // slice Object to show a max of [max_rows]
            data = this.values.slice(0, maxRow)
            idx = this.index.slice(0, maxRow)
        } else {
            data = this.values
            idx = this.index
        }

        idx.forEach((val, i) => {
            const row = [val].concat(data[i])
            dataArr.push(row)
        })

        // set column width of all columns
        tableConfig[0] = { width: 10 }
        tableConfig[1] = { width: tableWidth, truncate: tableTruncate }

        const tableData = [header].concat(dataArr) //Add the column names to values before printing
        return table(tableData, { columns: tableConfig })
    }

    print() {
        console.log(this + '')
    }
}