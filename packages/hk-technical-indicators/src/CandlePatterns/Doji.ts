import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export class Doji extends CandlestickFinder {
    constructor() {
        super('doji', 'Doji', 1)
    }

    logic(data: CandleMultiStickReversedDto): boolean {
        const daysOpen = data.bo[0]
        const daysClose = data.bc[0]
        const daysHigh = data.bh[0]
        const daysLow = data.bl[0]
        const isOpenEqualsClose = approximateEqual(daysOpen, daysClose)
        const isHighEqualsOpen = isOpenEqualsClose && approximateEqual(daysOpen, daysHigh)
        const isLowEqualsClose = isOpenEqualsClose && approximateEqual(daysClose, daysLow)
        return (isOpenEqualsClose && isHighEqualsOpen == isLowEqualsClose)
    }
}

export function doji(data: CandleMultiStickReversedDto) {
    return new Doji().hasPattern(data)
}