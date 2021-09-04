import { CandleMultiStickReversedDto } from '../Models'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishHarami extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishharami',
            name: 'BullishHarami',
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

        const isBullishHaramiPattern = ((firstdaysOpen > seconddaysOpen) &&
            (firstdaysClose < seconddaysOpen) &&
            (firstdaysClose < seconddaysClose) &&
            (firstdaysOpen > seconddaysLow) &&
            (firstdaysHigh > seconddaysHigh))

        return (isBullishHaramiPattern)
    }
}