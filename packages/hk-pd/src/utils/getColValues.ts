// transpose row array into column wise array
export function getColValues(data: any[]) {
    const rowLen = data.length
    const colLen = rowLen > 0 ? data[0].length : 0
    const colsArr = []
    for (let i = 0; i < colLen; ++i) {
        const tempCol = []
        for (let j = 0; j < rowLen; ++j) {
            tempCol.push(data[j][i])
        }
        colsArr.push(tempCol)
    }
    return colsArr
}