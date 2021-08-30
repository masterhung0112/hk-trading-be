import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export default class BullishInvertedHammerStick extends CandlestickFinder {
    constructor() {
        super('BullishInvertedHammerStick', 1)
    }
    
    logic(data: CandleMultiStickReversedDto) {
        const daysOpen = data.bo[0]
        const daysClose = data.bc[0]
        const daysHigh = data.bh[0]
        const daysLow = data.bl[0]

        let isBullishInvertedHammer = daysClose > daysOpen
        isBullishInvertedHammer = isBullishInvertedHammer && approximateEqual(daysOpen, daysLow)
        isBullishInvertedHammer = isBullishInvertedHammer && (daysClose - daysOpen) <= 2 * (daysHigh - daysClose)

        return isBullishInvertedHammer
    }
}

export function hasBullishInvertedHammerStick(data: CandleMultiStickReversedDto) {
    return new BullishInvertedHammerStick().hasPattern(data)
}