import { range } from '../utils'
import { ColumnType } from './ColumnType'
import { INDframe } from './INDframe'

export interface IndexLocArgs {
    rows?: ColumnType[]
    columns?: ColumnType[]
    type: string
}

/**
 * Obtain the defined the set of row and column index
 * @param {*} kwargs object {rows:Array, columns:Array of column name, type: ["iloc","loc"]}
 * @return Array
 */
export function indexLoc(ndframe: INDframe, kwargs: IndexLocArgs): [any[], ColumnType[], ColumnType[]] {
    let rows: ColumnType[] = []
    let columns: ColumnType[] = null
    let isColumnSplit = false

    // check if the object has the key
    if (Object.prototype.hasOwnProperty.call(kwargs), 'rows') {
        const kwargsRows = kwargs['rows']
        if (!Array.isArray(kwargsRows)) {
            throw new Error('rows parameter must be a Array')
        }

        if (kwargsRows.length == 1 && typeof kwargsRows[0] === 'string') {
            if (kwargsRows[0].includes(':')) {
                const columnSplit = kwargsRows[0].split(':')

                if (kwargs.type === 'loc') {
                    // get index of first and last occurence of label
                    let start, end
                    if (isNaN(Number(columnSplit[0]))) {
                        start = ndframe.index.indexOf(columnSplit[0])
                    } else {
                        start = Number(columnSplit[0])
                    }

                    if (isNaN(Number(columnSplit[1]))) {
                        end = ndframe.index.lastIndexOf(columnSplit[1]) - 1 || (ndframe.values.length - 1)
                    } else {
                        end = Number(columnSplit[1]) - 1 || (ndframe.values.length - 1)
                    }
                    rows = range(start, end)
                } else {
                    const start = parseInt(columnSplit[0]) || 0
                    const end = parseInt(columnSplit[1]) - 1 || (ndframe.values.length - 1)

                    if (typeof start == 'number' && typeof end == 'number') {
                        rows = range(start, end)
                    }
                }
            } else { // kwargsRows[0].includes(':')
                if (kwargs['type'] != 'loc') {
                    throw new Error('Slice index must be separated by \':\'')
                }
                const rowIdx = []
                ndframe.index.map((idx, i) => {
                    if (kwargs.rows[0] == idx) {
                        rowIdx.push(i)
                    }
                })
                rows = rowIdx
            }
        } else { // kwargsRows.length == 1 && typeof kwargsRows[0] === 'string'
            if (kwargs.type == 'loc') {
                //get all the index of specified labels
                const rowIdx = []
                ndframe.index.map((idx, i) => {
                    if (kwargs.rows.includes(idx + '')) {
                        rowIdx.push(i)
                    }
                })
                rows = rowIdx
            } else {
                //return int index
                rows = kwargs.rows
            }
        }
    } else {
        rows = range(0, Number(ndframe.shape[0]) - 1)
    }

    if (Object.prototype.hasOwnProperty.call(kwargs, 'columns')) {
        if (Array.isArray(kwargs['columns'])) {
            if (kwargs['columns'].length == 1 && kwargs['columns'][0].includes(':')) {

                const columnSplit = kwargs['columns'][0].split(':')
                let start, end

                if (kwargs['type'] == 'iloc') {
                    if (columnSplit[0] == '') {
                        start = 0
                    } else {
                        start = parseInt(columnSplit[0]) || 0
                    }

                    if (columnSplit[1] == '') {
                        end = ndframe.columnNames.length - 1
                    } else {
                        end = parseInt(columnSplit[1]) - 1 === 0 ? 0 : parseInt(columnSplit[1]) - 1
                    }

                } else { // (kwargs['type'] == 'iloc')
                    start = ndframe.columnNames.indexOf(columnSplit[0] + '')
                    end = ndframe.columnNames.indexOf(columnSplit[1] + '') - 1
                }

                if (typeof start == 'number' && typeof end == 'number') {
                    columns = range(start, end)
                    isColumnSplit = true
                }

            } else { // (kwargs['columns'].length == 1 && kwargs['columns'][0].includes(':'))
                columns = kwargs['columns']
            }

        } else { // Array.isArray(kwargs['columns'])
            throw new Error('columns must be a list')
        }
    } else { // Object.prototype.hasOwnProperty.call(kwargs, 'columns')
        //Return all column
        if (kwargs['type'] == 'loc') {
            columns = ndframe.columnNames
        } else {
            columns = range(0, Number(ndframe.shape[1]) - 1)
        }
    }

    const dataValues = ndframe.values
    const newData: any[] = [] // store the data from the for loop

    for (let index = 0; index < rows.length; index++) {
        const rowVal = rows[index]
        const maxRowIndex = dataValues.length - 1 //obtain the maximum row index

        if (rowVal > maxRowIndex) { //check if the input row index is greater than the maximum row index
            throw new Error(`Specified row index ${rowVal} is bigger than maximum row index of ${maxRowIndex}`)
        }

        if (Array.isArray(dataValues[0])) {
            const value = dataValues[rowVal]
            const rowData = []

            for (const i in columns) {
                let colIndex: ColumnType = -1
                if (kwargs['type'] == 'loc' && !isColumnSplit) {
                    colIndex = ndframe.columnNames.indexOf(columns[i] + '') //obtain the column index

                    if (colIndex == -1) {
                        throw new Error(`Column ${columns[i]} does not exist`)
                    }
                } else {
                    colIndex = columns[i]
                    const maxColIndex = ndframe.columnNames.length - 1 //assign the maximum column index to a value

                    if (colIndex > maxColIndex) {
                        throw new Error(`column index ${colIndex} is bigger than ${maxColIndex}`)
                    }
                }

                const elem = value[colIndex] //obtain the element at the column index
                rowData.push(elem)
            }

            newData.push(rowData) //store the data for each row in the new_data

        } else {
            newData.push(dataValues[rowVal])
        }
    }

    let columnNames: ColumnType[] = []
    if (kwargs.type == 'iloc' || isColumnSplit) {
        // let axes = ndframe.axes
        columns.map((col) => {
            columnNames.push(ndframe.columnNames[col])
        })
    } else {
        columnNames = columns
    }

    // get index of columns
    const finalRow: number[] = []
    rows.forEach((i) => {
        finalRow.push(ndframe.index[i])
    })

    return [newData, columnNames, finalRow]
}