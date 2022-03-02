import { CandleStickDTO } from 'hk-trading-contract'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishSpinningTop extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishspinningtop',
            name: 'BullishSpinningTop',
            requiredBarNum: 2
        })
    }

    logic(data: CandleStickDTO[]) {
        const daysOpen = data[0].bo
        const daysClose = data[0].bc
        const daysHigh = data[0].bh
        const daysLow = data[0].bl

        const bodyLength = Math.abs(daysClose - daysOpen)
        const upperShadowLength = Math.abs(daysHigh - daysClose)
        const lowerShadowLength = Math.abs(daysOpen - daysLow)
        const isBullishSpinningTop = bodyLength < upperShadowLength &&
            bodyLength < lowerShadowLength

        return isBullishSpinningTop
    }
}