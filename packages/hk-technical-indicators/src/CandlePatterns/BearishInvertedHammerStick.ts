import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'
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
    
    logic (data: CandleMultiStickReversedDto) {
        const daysOpen  = data.bo[0]
        const daysClose = data.bc[0]
        const daysHigh  = data.bh[0]
        const daysLow   = data.bl[0]

        let isBearishInvertedHammer = daysOpen > daysClose
        isBearishInvertedHammer = isBearishInvertedHammer && approximateEqual(daysClose, daysLow)
        isBearishInvertedHammer = isBearishInvertedHammer && (daysOpen - daysClose) <= 2 * (daysHigh - daysOpen)

        return isBearishInvertedHammer
    }
}

export function hasBearishInvertedHammerStick(data:CandleMultiStickReversedDto) {
  return new BearishInvertedHammerStick().hasPattern(data)
}