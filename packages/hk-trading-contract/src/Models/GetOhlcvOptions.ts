import { isObject } from 'hk-utils'
import { ResolutionType } from './ResolutionType'

export interface GetOhlcvOptions {
    symbolId: string
    resolution: ResolutionType
    ts?: Date
    count?: number
}

export function isGetOhlcvOptionsValid(v: GetOhlcvOptions | null | undefined): Error | null {
    if (!isObject(v)) {
        return Error(`expected options is object type, but got ${JSON.stringify(v)}`)
    }
    if (!v.symbolId) {
        return Error(`expected options.symbolId is available, but got ${JSON.stringify(v)}`)
    }

    if (!v.resolution) {
        return Error(`expected options.resolution is available, but got ${JSON.stringify(v)}`)
    }

    return null    
}