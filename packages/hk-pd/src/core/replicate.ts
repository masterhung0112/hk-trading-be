import { ISeries } from './ISeries'
import { Series } from './Series'

/**
 * Replicate a particular value N times to create a series.
 * 
 * @param value The value to replicate.
 * @param count The number of times to replicate the value.
 * 
 * @returns Returns a new series that contains N copies of the value.
 */
 export function replicate<ValueT> (value: ValueT, count: number): ISeries<number, ValueT> {
    const values: ValueT[] = []
    for (let i = 0; i < count; ++i) {
        values.push(value)
    }

    return new Series<number, ValueT>(values)
}