import { ColumnType } from '../core/ColumnType'

// filter element present in an aray
export function removeArr(arr: any[], index: ColumnType[]) {
    return arr.filter(function (_, i) {
        return !index.includes(i)
    })
}