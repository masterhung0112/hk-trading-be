import { isBoolean } from './primitives/isBoolean'
import { isDate } from './primitives/isDate'
import { isNumber } from './primitives/isNumber'
import { isString } from './primitives/isString'

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
    else if (isDate(value)) {
        return 'date'
    }
    else if (isBoolean(value)) {
        return 'boolean'
    }
    else {
        return 'unsupported'
    }
}