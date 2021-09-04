import { CandleMultiStickReversedDto } from '../Models'
import { approximateEqual } from '../Utils'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishHaramiCross extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishharamicross',
            name: 'BullishHaramiCross',
            requiredBarNum: 2
        })
    }

    logic(data: CandleMultiStickReversedDto) {
        const firstdaysOpen = data.bo[0]
        const firstdaysClose = data.bc[0]
        const firstdaysHigh = data.bh[0]
        const seconddaysOpen = data.bo[1]
        const seconddaysClose = data.bc[1]
        const seconddaysHigh = data.bh[1]
        const seconddaysLow = data.bl[1]

        const isBullishHaramiCrossPattern = ((firstdaysOpen > seconddaysOpen) &&
            (firstdaysClose < seconddaysOpen) &&
            (firstdaysClose < seconddaysClose) &&
            (firstdaysOpen > seconddaysLow) &&
            (firstdaysHigh > seconddaysHigh))

        const isSecondDayDoji = approximateEqual(seconddaysOpen, seconddaysClose)

        return (isBullishHaramiCrossPattern && isSecondDayDoji)
    }
}