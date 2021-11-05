import { isBoolean } from './isBoolean'
import { isNumber } from './isNumber'
import { isString } from './isString'

export function determineType (value: any): string {
    if (value === undefined) {
        return 'undefined'
    }
    else if (isNumber(value)) {
        return 'number'
    }
    else if (isString(value)) {
        return 'string'
    }
    else if (value instanceof Date) {
        return 'date'
    }
    else if (isBoolean(value)) {
        return 'boolean'
    }
    else {
        return 'unsupported'
    }
}