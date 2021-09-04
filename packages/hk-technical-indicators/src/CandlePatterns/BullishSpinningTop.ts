import { CandleMultiStickReversedDto } from '../Models'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishSpinningTop extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishspinningtop',
            name: 'BullishSpinningTop',
            requiredBarNum: 2
        })
    }

    logic(data: CandleMultiStickReversedDto) {
        const daysOpen = data.bo[0]
        const daysClose = data.bc[0]
        const daysHigh = data.bh[0]
        const daysLow = data.bl[0]

        const bodyLength = Math.abs(daysClose - daysOpen)
        const upperShadowLength = Math.abs(daysHigh - daysClose)
        const lowerShadowLength = Math.abs(daysOpen - daysLow)
        const isBullishSpinningTop = bodyLength < upperShadowLength &&
            bodyLength < lowerShadowLength

        return isBullishSpinningTop
    }
}