import { tensor, Tensor } from '@tensorflow/tfjs-node'
import { ILocArgs, INDframe, LocArgs } from './INDframe'
import { table, ColumnUserConfig } from 'table'
import { config } from '../Config'
import { getColValues, getRowAndColValues, getType, is1DArray, isNumber, isObject, isString, replaceUndefinedWithNaN } from '../utils'
import { ColumnType } from './ColumnType'

export abstract class NDframe implements INDframe {
    protected data: any[] = []
    protected colData: any[] = []
    protected indexArr: (number | string)[] = []
    protected series = false
    protected colTypes: string[] = []
    protected columns: ColumnType[] = []

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
    constructor(data: any[], public kwargs: {
        index?: ColumnType[]
        columns?: ColumnType[]
        dtypes?: string[]
    } = {}) {
        if (data instanceof Tensor) {
            data = data.arraySync()
        }

        if (is1DArray(data)) {
            this.series = true
            this.readArray(data)
        } else {
            this.series = false
            
            if (data.length > 0 && isObject(data[0])) {
                //check the type of the first object in the data
                this.readObject(data, 1) //type 1 object are of JSON form [{a: 1, b: 2}, {a: 30, b: 20}]
            } else if (isObject(data)) {
                this.readObject(data, 2) //type 2 object are of the form {a: [1,2,3,4], b: [30,20, 30, 20}]
            } else if (
                Array.isArray(data[0]) ||
                isNumber(data[0]) ||
                isString(data[0])
            ) {
                this.readArray(data)
            } else {
                throw new Error('File format not supported')
            }
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
        const tableConfig: { [index: number]: ColumnUserConfig } = {}
        let header: ColumnType[] = []

        const colLen = this.columns.length

        if (colLen > maxColInConsole) {
            //truncate displayed columns to fit in the console
            const first4Cols = this.columns.slice(0, 4)
            const last3Cols = this.columns.slice(colLen - 4)
            //join columns with truncate ellipse in the middle
            header = [ '' ]
            header = header.concat(first4Cols).concat([ '...' ]).concat(last3Cols)

            let subIdx, values1, values2

            if (this.values.length > maxRow) {
                //slice Object to show [maxRows]
                const dfSubset1 = this.iloc({
                rows: [ `0:${maxRow}` ],
                columns: [ '0:4' ]
                })
                const dfSubset2 = this.iloc({
                rows: [ `0:${maxRow}` ],
                columns: [ `${colLen - 4}:` ]
                })
                subIdx = this.index.slice(0, maxRow)
                values1 = dfSubset1.values
                values2 = dfSubset2.values
            } else {
                const dfSubset1 = this.iloc({ rows: [ '0:' ], columns: [ '0:4' ] })
                const dfSubset2 = this.iloc({
                rows: [ '0:' ],
                columns: [ `${colLen - 4}:` ]
                })
                subIdx = this.index.slice(0, maxRow)
                values1 = dfSubset1.values
                values2 = dfSubset2.values
            }

            // merge dfs
            subIdx.map((val, i) => {
                const row = [ val ].concat(values1[i]).concat([ '...' ]).concat(values2[i])
                dataArr.push(row)
            })
        } else {
            // Display all columns
            header = ['']
            header = header.concat(this.columns)
            let idx: ColumnType[], values: any[]

            if (this.values.length > maxRow) {
                // Slice Object to show a max of [maxRows]
                const data = this.loc({ rows: [`0:${maxRow}`], columns: this.columns })
                idx = data.index
                values = data.values
            } else {
                values = this.values
                idx = this.index
            }

            // merge cols
            idx.forEach((val, i) => {
                const row = [val].concat(values[i])
                dataArr.push(row)
            })
        }

        // Set column width of all columns
        tableConfig[0] = { width: 10 }
        for (let index = 1; index < header.length; index++) {
            tableConfig[index] = { width: tableWidth, truncate: tableTruncate }
        }

        // Adds the column names to values before printing
        const tableData = [header].concat(dataArr)
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

    /**
     * Sets the data type of the NDFrame. Supported types are ['float32', "int32", 'string', 'boolean']
     * @param {Array<String>} dtypes Array of data types.
     * @param {Boolean} infer Whether to automatically infer the dtypes from the Object
     */
    protected setColTypes(dtypes: string[], infer: boolean) {
        const supportedDtypes = ['float32', 'int32', 'string', 'boolean']

        if (infer) {
            if (this.series) {
                this.colTypes = getType(this.values)
            } else {
                this.colTypes = getType(this.colData)
            }
        } else {
            if (this.series) {
                this.colTypes = dtypes
            } else {
                if (dtypes.length != this.columns.length) {
                    throw new Error(
                        `length Mixmatch: Length of specified dtypes is ${dtypes.length}, but length of columns is ${this.columns.length}`
                    )
                }

                if (!Array.isArray(dtypes)) {
                    throw new Error('dtypes must be an Array of types')
                }

                dtypes.forEach((type, idx) => {
                    if (!supportedDtypes.includes(type)) {
                        throw new Error(
                            `dtype error: dtype specified at index ${idx} is not supported`
                        )
                    }
                })
                this.colTypes = dtypes
            }
        }
    }

    protected readArray(data: any[]) {
        this.data = replaceUndefinedWithNaN(data, this.series)
        this.rowDataTensor = tensor(this.data)

        if (this.series) {
            this.colData = [this.values]
        } else {
            this.colData = getColValues(this.values)
        }

        this.colDataTensor = tensor(this.colData)

        if ('index' in this.kwargs) {
            this.setIndex(this.kwargs.index)
        } else {
            this.indexArr = [...Array(this.rowDataTensor.shape[0]).keys()]
        }

        if (this.ndim === 1) {
            // series array
            if ('columns' in this.kwargs) {
                this.columns = this.kwargs.columns
            } else {
                this.columns = ['0']
            }
        } else {
            // 2D array
            if ('columns' in this.kwargs) {
                if (this.kwargs.columns.length == Number(this.rowDataTensor.shape[1])) {
                    this.columns = this.kwargs.columns
                } else {
                    throw `Column length mismatch. You provided a column of length ${this.kwargs.columns.length} but data has lenght of ${this.rowDataTensor.shape[1]}`
                }
            } else {
                this.columns = [...Array(this.rowDataTensor.shape[1]).keys()]
            }
        }

        if ('dtypes' in this.kwargs) {
            this.setColTypes(this.kwargs.dtypes, false)
        } else {
            this.setColTypes(null, true) //infer dtypes
        }
    }

    /**
     *  Convert Javascript Object of arrays into NDFrame
     * @param {*} data Object of Arrays
     * @param {*} type type 1 object are of JSON form [{a: 1, b: 2}, {a: 30, b: 20}],
     *                 type 2 object are of the form {a: [1,2,3,4], b: [30,20, 30, 20}]
     */
    protected readObject(data: any[], type: number) {
        if (type == 2) {
            const [rowArr, colNames] = getRowAndColValues(data)
            this.kwargs.columns = colNames
            this.readArray(rowArr)
        } else {
            const dataArr = data.map((item) => {
                return Object.values(item)
            })

            this.data = replaceUndefinedWithNaN(dataArr, this.series) //Default array data in row format
            this.rowDataTensor = tensor(this.data) //data saved as row tensors
            this.kwargs.columns = Object.keys(Object.values(data)[0]) //get names of the column from the first entry

            if (this.series) {
                this.colData = [this.values] //data saved as 1D column tensors
            } else {
                this.colData = getColValues(this.data)
            }

            this.colDataTensor = tensor(this.colData)

            if ('index' in this.kwargs) {
                this.setIndex(this.kwargs.index)
            } else {
                this.indexArr = [...Array(this.rowDataTensor.shape[0]).keys()]
            }

            if (this.ndim === 1) {
                // series array
                if ('columns' in this.kwargs) {
                    this.columns = this.kwargs.columns
                } else {
                    this.columns = ['0']
                }
            } else {
                // 2D array
                if ('columns' in this.kwargs) {
                    if (this.kwargs.columns.length == Number(this.rowDataTensor.shape[1])) {
                        this.columns = this.kwargs.columns
                    } else {
                        throw `Column length mismatch. You provided a column of length ${this.kwargs.columns.length} but data has lenght of ${this.rowDataTensor.shape[1]}`
                    }
                } else {
                    this.columns = [...Array(this.rowDataTensor.shape[1]).keys()]
                }
            }

            if ('dtypes' in this.kwargs) {
                this.setColTypes(this.kwargs.dtypes, false)
            } else {
                this.setColTypes(null, true) //infer dtypes
            }
        }
    }
}