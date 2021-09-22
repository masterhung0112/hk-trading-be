import t from 'typy'
import { isDate } from './isDate'

// Returns if a value is an object
export function isObject(v: any): boolean {
    return t(v).isObject && !isDate(v)
}