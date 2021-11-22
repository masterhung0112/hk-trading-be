import { CandleStickDTO } from 'hk-trading-contract'
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

    logic(data: CandleStickDTO[]) {
        const daysOpen = data[0].bo
        const daysClose = data[0].bc
        const daysHigh = data[0].bh
        const daysLow = data[0].bl

        const isBullishMarbozu = approximateEqual(daysClose, daysHigh) &&
            approximateEqual(daysLow, daysOpen) &&
            daysOpen < daysClose &&
            daysOpen < daysHigh


        return (isBullishMarbozu)
    }
}