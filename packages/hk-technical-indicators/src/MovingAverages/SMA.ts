import { Indicator } from '../indicator/indicator'
import { LinkedList } from '../utils/LinkedList'
import { MAInput } from './MAInput'

export class SMA extends Indicator<number> {
    period: number;
    price: number[];
    generator: Iterator<number, number, number>

    constructor(input: MAInput) {
        super(input)

        this.period = input.period
        this.price = input.values
        const genFn = (function* (period: number): Generator<number, number, number> {
            const list = new LinkedList<number>()
            let sum = 0
            let counter = 1
            let current = yield
            let result
            list.push(0)
            while (true) {
                if (counter < period) {
                    counter++
                    list.push(current)
                    sum = sum + current
                }
                else {
                    sum = sum - list.shift() + current
                    result = ((sum) / period)
                    list.push(current)
                }
                current = yield result
            }
        })
        this.generator = genFn(this.period)
        this.generator.next()
        this.result = []
        this.price.forEach((tick) => {
            const result = this.generator.next(tick)
            if (result.value !== undefined) {
                this.result.push(this.format(result.value))
            }
        })
    }

    nextValue(price: number): number | undefined {
        const result = this.generator.next(price).value
        if (result != undefined)
            return this.format(result)
    }

    static calculate(input: MAInput): number[] {
        Indicator.reverseInputs(input)
        const result = new SMA(input).result
        if (input.reversedInput) {
            result.reverse()
        }
        Indicator.reverseInputs(input)
        return result
    }
}