import { ColumnType } from '../core/ColumnType'

/**
 * retrieve row array and column names from object of the form {a: [1,2,3,4], b: [30, 20, 30, 20}]
 * @param {*} data
 */
export function getRowAndColValues(data: Record<ColumnType, any>): [any[], ColumnType[]] {
    const colNames = Object.keys(data)
    const colData = Object.values(data)
    const firstColLen = colData.length > 0 ? colData[0].length : 0

    colData.forEach((d) => {
        if (d.length != firstColLen) {
            throw Error('Length Error: Length of columns must be the same!')
        }
    })

    const colsLen = colNames.length
    const rowsArr = []

    for (let i = 0; i < firstColLen; ++i) {
        const tempRow = []
        for (let j = 0; j < colsLen; ++j) {
            tempRow.push(colData[j][i])
        }
        rowsArr.push(tempRow)
    }
    return [rowsArr, colNames]
}