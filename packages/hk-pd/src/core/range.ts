import { isNumber } from 'hk-utils'
import { ISeries } from './ISeries'
import { Series } from './Series'

/**
 * Generate a series from a range of numbers.
 *
 * @param start - The value of the first number in the range.
 * @param count - The number of sequential values in the range.
 * 
 * @returns Returns a series with a sequence of generated values. The series contains 'count' values beginning at 'start'. 
 */
 export function range (start: number, count: number): ISeries<number, number> {
    if (!isNumber(start)) throw new Error('Expect \'start\' parameter to \'dataForge.range\' function to be a number.')
    if (!isNumber(count)) throw new Error('Expect \'count\' parameter to \'dataForge.range\' function to be a number.')

    const values: number[] = []
    for (let valueIndex = 0; valueIndex < count; ++valueIndex) {
        values.push(start + valueIndex)
    }

    return new Series<number, number>(values)
}