import { CandleStickDTO } from 'hk-trading-contract'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export class Doji extends CandlestickFinder {
    constructor() {
        super({
            id: 'doji',
            name: 'Doji',
            requiredBarNum: 1
        })
    }

    logic(data: CandleStickDTO[]): boolean {
        const daysOpen = data[0].bo
        const daysClose = data[0].bc
        const daysHigh = data[0].bh
        const daysLow = data[0].bl
        const isOpenEqualsClose = approximateEqual(daysOpen, daysClose)
        const isHighEqualsOpen = isOpenEqualsClose && approximateEqual(daysOpen, daysHigh)
        const isLowEqualsClose = isOpenEqualsClose && approximateEqual(daysClose, daysLow)
        return (isOpenEqualsClose && isHighEqualsOpen == isLowEqualsClose)
    }
}

export function doji(data: CandleStickDTO[]) {
    return new Doji().hasPattern(data)
}