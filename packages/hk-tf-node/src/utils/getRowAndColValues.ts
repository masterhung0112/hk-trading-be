/**
   * retrieve row array and column names from object of the form {a: [1,2,3,4], b: [30,20, 30, 20}]
   * @param {*} data
   */
export function getRowAndColValues(data: any[]): [any[], string[]] {
    const colNames = Object.keys(data)
    const colData = Object.values(data)
    const firstColLen = colData[0].length

    colData.forEach((d) => {
        if (d.length != firstColLen) {
            throw Error('Length Error: Length of columns must be the same!')
        }
    })

    const rowsLen = colData[0].length
    const colsLen = colNames.length
    const rowsArr = []

    for (let i = 0; i <= rowsLen - 1; i++) {
        const tempRow = []
        for (let j = 0; j < colsLen; j++) {
            const arr = colData[j]
            tempRow.push(arr[i])
        }
        rowsArr.push(tempRow)
    }
    return [rowsArr, colNames]
}