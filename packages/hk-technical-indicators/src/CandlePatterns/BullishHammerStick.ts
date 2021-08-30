import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export default class BullishHammerStick extends CandlestickFinder {
    constructor() {
        super('BullishHammerStick', 1)
    }
    logic(data: CandleMultiStickReversedDto) {
        const daysOpen = data.bo[0]
        const daysClose = data.bl[0]
        const daysHigh = data.bh[0]
        const daysLow = data.bl[0]

        let isBullishHammer = daysClose > daysOpen
        isBullishHammer = isBullishHammer && approximateEqual(daysClose, daysHigh)
        isBullishHammer = isBullishHammer && (daysClose - daysOpen) <= 2 * (daysOpen - daysLow)

        return isBullishHammer
    }
}

export function hasBullishHammerStick(data: CandleMultiStickReversedDto) {
    return new BullishHammerStick().hasPattern(data)
}