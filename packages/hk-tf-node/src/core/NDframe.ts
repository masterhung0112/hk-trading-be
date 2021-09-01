import { tensor, Tensor } from '@tensorflow/tfjs-node'
import { ILocArgs, INDframe, LocArgs } from './INDframe'
import { table, ColumnUserConfig } from 'table'
import { Config } from '../Config'
import { getColValues, is1DArray, replaceUndefinedWithNaN } from '../utils'
import { ColumnType } from './ColumnType'

const config = new Config()

export abstract class NDframe implements INDframe {
    protected data: any[] = []
    protected colData: any[] = []
    protected indexArr: (number | string)[] = []
    protected series = false
    protected colTypes: string[] = []
    protected columns: string[] = []

    protected rowDataTensor: Tensor
    protected colDataTensor: Tensor

    /**
    * N-Dimensional data structure. Stores multi-dimensional
    * data in a size-mutable, labeled data structure. Analogous to the Python Pandas DataFrame.
    *
    * @param {data} Array JSON, Tensor. Block of data.
    * @param {kwargs} Object Optional Configuration Object
    *                 {columns: Array of column names. If not specified and data is an array of array, use range index.
    *                  dtypes: Data types of the columns,
    *                  index: row index for subseting array }
    *
    * @returns NDframe
    */
    constructor(data: any[], public kwargs = {}) {
        if (data instanceof Tensor) {
            data = data.arraySync()
        }

        if (is1DArray(data)) {
            this.series = true
            this.readArray(data)
        }
    }

    abstract loc(kwargs?: LocArgs): INDframe
    abstract iloc(kwargs?: ILocArgs): INDframe

    /**
     * Gets index of the NDframe
     * @return {Array} array of index from series
     */
    get index() {
        return this.indexArr
    }

    get dtypes() {
        return this.colTypes
    }

    get ndim() {
        if (this.series) {
            return 1
        } else {
            return this.rowDataTensor.shape.length
        }
    }

    get values() {
        return this.data
    }

    get columnNames() {
        return this.columns
    }

    get shape() {
        if (this.series) {
            return [this.values.length, 1]
        } else {
            return this.rowDataTensor.shape
        }
    }

    toString() {
        const tableWidth = config.tableWidth
        const tableTruncate = config.tableTruncate
        const maxRow = config.tableMaxRow
        const maxColInConsole = config.tableMaxColInConsole

        const dataArr = []
        const tableConfig: {[index: number]: ColumnUserConfig} = {}
        let header = []

        const colLen = this.columns.length

        if (colLen > maxColInConsole) {
        } else {
            // Display all columns
            header = [ '' ].concat(this.columns)
            let idx: ColumnType[], values: any[]

            if (this.values.length > maxRow) {
                // Slice Object to show a max of [max_rows]
                const data = this.loc({ rows: [ `0:${maxRow}` ], columns: this.columns })
                idx = data.index
                values = data.values
            } else {
                values = this.values
                idx = this.index
            }

            // merge cols
            idx.forEach((val, i) => {
                const row = [ val ].concat(values[i])
                dataArr.push(row)
            })
        }

        // Set column width of all columns
        tableConfig[0] = { width: 10 }
        for (let index = 1; index < header.length; index++) {
            tableConfig[index] = { width: tableWidth, truncate: tableTruncate }
        }

        // Adds the column names to values before printing
        const tableData = [ header ].concat(dataArr) 
        return table(tableData, { columns: tableConfig })
    }

    print() {
        console.log(this + '')
    }

    // Sets index of the NDFrame
    protected setIndex(labels: ColumnType[]) {
        if (!Array.isArray(labels)) {
            throw Error('Value Error: index must be an array')
          }
        if ((labels.length > this.shape[0] || labels.length < this.shape[0])) {
            throw Error('Value Error: length of labels must match row shape of data')
        }
        this.indexArr = labels
    }

    protected readArray(data: any[]) {
        this.data = replaceUndefinedWithNaN(data, this.series)
        this.rowDataTensor = tensor(this.data)

        if (this.series) {
            this.colData = [ this.values ]
        } else {
            this.colData = getColValues(this.values)
        }

        this.colDataTensor = tensor(this.colData)

        if ('index' in this.kwargs) {

        }
    }
}