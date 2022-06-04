import { isObject } from './primitives/isObject'

export function isWindow(v: any): boolean {
    return isObject(v) && v instanceof Window && v === v.window
}