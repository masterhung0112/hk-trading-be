import { CandleStickDTO } from 'hk-trading-contract'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export class BearishInvertedHammerStick extends CandlestickFinder {
    constructor() {
        super({
            id: 'bearishinvertedhammer', 
            name: 'BearishInvertedHammerStick', 
            requiredBarNum: 1
        })
    }
    
    logic (data: CandleStickDTO[]) {
        const daysOpen  = data[0].bo
        const daysClose = data[0].bc
        const daysHigh  = data[0].bh
        const daysLow   = data[0].bl

        let isBearishInvertedHammer = daysOpen > daysClose
        isBearishInvertedHammer = isBearishInvertedHammer && approximateEqual(daysClose, daysLow)
        isBearishInvertedHammer = isBearishInvertedHammer && (daysOpen - daysClose) <= 2 * (daysHigh - daysOpen)

        return isBearishInvertedHammer
    }
}

export function hasBearishInvertedHammerStick(data: CandleStickDTO[]) {
  return new BearishInvertedHammerStick().hasPattern(data)
}