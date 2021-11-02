import { ISeries } from 'hk-pd'
import { Indicator, IndicatorInput } from '../indicator/Indicator'

export class AvgLossInput extends IndicatorInput {
    values: ISeries<number>
    period: number
}

export class AverageLoss extends Indicator<number> {
    generator: Iterator<number | undefined, number, number>

    constructor(input: AvgLossInput) {
        super(input)
        const values = input.values
        const periodVal = input.period
        const format = this.format

        this.generator = (function* (period) {
            let currentValue = yield
            let counter = 1
            let lossSum = 0
            let avgLoss
            let loss
            let lastValue = currentValue
            currentValue = yield
            while (true) {
                loss = lastValue - currentValue
                loss = loss > 0 ? loss : 0
                if (loss > 0) {
                    lossSum = lossSum + loss
                }
                if (counter < period) {
                    counter++
                }
                else if (avgLoss === undefined) {
                    avgLoss = lossSum / period
                } else {
                    avgLoss = ((avgLoss * (period - 1)) + loss) / period
                }
                lastValue = currentValue
                avgLoss = (avgLoss !== undefined) ? format(avgLoss) : undefined
                currentValue = yield avgLoss
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

    static calculate(input: AvgLossInput): number[] {
        Indicator.reverseInputs(input)
        const result = new AverageLoss(input).result
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

// export function averageLoss(input: AvgLossInput): number[] {
//     Indicator.reverseInputs(input)
//     const result = new AverageLoss(input).result
//     if (input.reversedInput) {
//         result.reverse()
//     }
//     Indicator.reverseInputs(input)
//     return result
// }