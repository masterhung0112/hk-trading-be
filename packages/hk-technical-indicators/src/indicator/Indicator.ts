import { numberFormat } from '../utils/numberFormat'

export class IndicatorInput {
    reversedInput?: boolean;
    format?: (data: number) => number
}

export class AllInputs {
    values?: number[]
    open?: number[]
    high?: number[]
    low?: number[]
    close?: number[]
    volume?: number[]
    timestamp?: number[]
}

export class Indicator<R> {
    result: R[]
    format: (data: number) => number

    constructor(input: IndicatorInput) {
        this.format = input.format || numberFormat
    }

    static reverseInputs(input: any): void {
        if (input.reversedInput) {
            input.values ? input.values.reverse() : undefined
            input.open ? input.open.reverse() : undefined
            input.high ? input.high.reverse() : undefined
            input.low ? input.low.reverse() : undefined
            input.close ? input.close.reverse() : undefined
            input.volume ? input.volume.reverse() : undefined
            input.timestamp ? input.timestamp.reverse() : undefined
        }
    }

    getResult() {
        return this.result
    }
}
