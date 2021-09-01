import { checker } from './checker'
import { is1DArray } from './is1DArray'

// infer types from an array of array
export function getType(arrVal: any[]) {
    if (is1DArray(arrVal)) {
        return [checker(arrVal)]
    } else {
        const dtypes = arrVal.map((arr) => {
            return checker(arr)
        })
        return dtypes
    }
}