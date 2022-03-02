import { CandleStickDTO } from 'hk-trading-contract'
import { approximateEqual } from '../utils'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishHaramiCross extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishharamicross',
            name: 'BullishHaramiCross',
            requiredBarNum: 2
        })
    }

    logic(data: CandleStickDTO[]) {
        const firstdaysOpen = data[0].bo
        const firstdaysClose = data[0].bc
        const firstdaysHigh = data[0].bh
        const seconddaysOpen = data[1].bo
        const seconddaysClose = data[1].bc
        const seconddaysHigh = data[1].bh
        const seconddaysLow = data[1].bl

        const isBullishHaramiCrossPattern = ((firstdaysOpen > seconddaysOpen) &&
            (firstdaysClose < seconddaysOpen) &&
            (firstdaysClose < seconddaysClose) &&
            (firstdaysOpen > seconddaysLow) &&
            (firstdaysHigh > seconddaysHigh))

        const isSecondDayDoji = approximateEqual(seconddaysOpen, seconddaysClose)

        return (isBullishHaramiCrossPattern && isSecondDayDoji)
    }
}