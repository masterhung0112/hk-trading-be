import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export class BearishHammerStick extends CandlestickFinder {
    constructor() {
        super({
            id: 'bearishhammer', 
            name: 'BearishHammerStick', 
            requiredBarNum: 1
        })
    }

    logic(data: CandleMultiStickReversedDto) {
        const daysOpen = data.bo[0]
        const daysClose = data.bc[0]
        const daysHigh = data.bh[0]
        const daysLow = data.bl[0]

        let isBearishHammer = daysOpen > daysClose
        isBearishHammer = isBearishHammer && approximateEqual(daysOpen, daysHigh)
        isBearishHammer = isBearishHammer && (daysOpen - daysClose) <= 2 * (daysClose - daysLow)

        return isBearishHammer
    }
}

export function hasBearishHammerStick(data: CandleMultiStickReversedDto) {
    return new BearishHammerStick().hasPattern(data)
}