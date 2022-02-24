import { isArray } from './primitives/isArray'
import { isObject } from './primitives/isObject'

export function copy<T = any>(o: T, isObj = isObject): T {
    let out: any

    if (isArray(o)) {
        const val = o.find(v => v != null)

        if (isArray(val) || isObj(val)) {
            out = Array(o.length)
            for (let i = 0; i < o.length; i++) {
                out[i] = copy(o[i], isObj)
            }
        } else {
            out = o.slice()
        }
    } else if (isObj(o)) {
        out = {}
        for (const k in o)
            out[k] = copy(o[k], isObj)
    } else {
        out = o
    }

    return out
}