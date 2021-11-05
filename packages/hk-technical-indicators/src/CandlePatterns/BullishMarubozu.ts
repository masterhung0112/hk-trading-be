import { CandleMultiStickReversedDto } from '../Models'
import { approximateEqual } from '../utils'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishMarubozu extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishmarubozu',
            name: 'BullishMarubozu',
            requiredBarNum: 1
        })
    }

    logic(data: CandleMultiStickReversedDto) {
        const daysOpen = data.bo[0]
        const daysClose = data.bc[0]
        const daysHigh = data.bh[0]
        const daysLow = data.bl[0]

        const isBullishMarbozu = approximateEqual(daysClose, daysHigh) &&
            approximateEqual(daysLow, daysOpen) &&
            daysOpen < daysClose &&
            daysOpen < daysHigh


        return (isBullishMarbozu)
    }
}