import { CandleStickDTO } from 'hk-trading-contract'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishInvertedHammerStick extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishinvertedhammer', 
            name: 'BullishInvertedHammerStick', 
            requiredBarNum: 1
        })
    }
    
    logic(data: CandleStickDTO[]) {
        const daysOpen = data[0].bo
        const daysClose = data[0].bc
        const daysHigh = data[0].bh
        const daysLow = data[0].bl

        let isBullishInvertedHammer = daysClose > daysOpen
        isBullishInvertedHammer = isBullishInvertedHammer && approximateEqual(daysOpen, daysLow)
        isBullishInvertedHammer = isBullishInvertedHammer && (daysClose - daysOpen) <= 2 * (daysHigh - daysClose)

        return isBullishInvertedHammer
    }
}

export function hasBullishInvertedHammerStick(data: CandleStickDTO[]) {
    return new BullishInvertedHammerStick().hasPattern(data)
}