import { ISeries } from 'hk-pd'
import { Indicator, IndicatorInput } from '../indicator/Indicator'

export class AverageGainInput extends IndicatorInput {
    period: number
    values: ISeries<number>
}

export class AverageGain extends Indicator<number> {
    generator: Generator<number | undefined, number, number>;
    constructor(input: AverageGainInput) {
        super(input)
        const values = input.values
        const periodVal = input.period
        const format = this.format

        this.generator = (function* (period) {
            let currentValue = yield
            let counter = 1
            let gainSum = 0
            let avgGain
            let gain
            let lastValue = currentValue
            currentValue = yield
            while (true) {
                gain = currentValue - lastValue
                gain = gain > 0 ? gain : 0
                if (gain > 0) {
                    gainSum = gainSum + gain
                }
                if (counter < period) {
                    counter++
                }
                else if (avgGain === undefined) {
                    avgGain = gainSum / period
                } else {
                    avgGain = ((avgGain * (period - 1)) + gain) / period
                }
                lastValue = currentValue
                avgGain = (avgGain !== undefined) ? format(avgGain) : undefined
                currentValue = yield avgGain
            }
        })(periodVal)

        this.generator.next()

        this.result = []

        values.forEach((tick: number) => {
            const result = this.generator.next(tick)
            if (result.value !== undefined) {
                this.result.push(result.value)
            }
        })
    }

    static calculate(input: AverageGainInput): number[] {
        Indicator.reverseInputs(input)
        const result = new AverageGain(input).result
        if (input.reversedInput) {
            result.reverse()
        }
        Indicator.reverseInputs(input)
        return result
    }

    nextValue(price: number): number | undefined {
        return this.generator.next(price).value
    }
}

// export function averageGain(input: AverageGainInput): number[] {
//     Indicator.reverseInputs(input)
//     const result = new AverageGain(input).result
//     if (input.reversedInput) {
//         result.reverse()
//     }
//     Indicator.reverseInputs(input)
//     return result
// }