import { Indicator } from '../indicator/Indicator'
import { MAInput } from './MAInput'
import { SMA } from './SMA'

export class EMA extends Indicator<number> {
    period: number;
    price: number[];
    generator: Generator<number, number, number>

    constructor(input: MAInput) {
        super(input)
        const period = input.period
        const priceArray = input.values
        const exponent = (2 / (period + 1))
        this.result = []
        const sma = new SMA({ period: period, values: [] })

        const genFn = (function* (): Generator<number, number, number> {
            let tick = yield
            let prevEma
            while (true) {
                if (prevEma !== undefined && tick !== undefined) {
                    prevEma = ((tick - prevEma) * exponent) + prevEma
                    tick = yield prevEma
                } else {
                    tick = yield
                    prevEma = sma.nextValue(tick)
                    if (prevEma)
                        tick = yield prevEma
                }
            }
        })

        this.generator = genFn()

        this.generator.next()
        this.generator.next()

        priceArray.forEach((tick) => {
            const result = this.generator.next(tick)
            if (result.value != undefined) {
                this.result.push(this.format(result.value))
            }
        })
    }

    nextValue(price: number) {
        const result = this.generator.next(price).value
        if (result != undefined)
            return this.format(result)
    }

    static calculate(input: MAInput): number[] {
        Indicator.reverseInputs(input)
        const result = new EMA(input).result
        if (input.reversedInput) {
            result.reverse()
        }
        Indicator.reverseInputs(input)
        return result
    }
}