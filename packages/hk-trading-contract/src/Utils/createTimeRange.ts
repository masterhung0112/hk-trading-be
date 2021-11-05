import { TimeRange } from '../Models/TimeRange'

export function createTimeRange(from: number, to: number, exp?: boolean): TimeRange {
    return {
        from,
        to,
        exp,
    }
}