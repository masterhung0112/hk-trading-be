import { CandleStickDTO } from 'hk-trading-contract'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishHammerStick extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishhammer', 
            name: 'BullishHammerStick', 
            requiredBarNum: 1
        })
    }
    logic(data: CandleStickDTO[]) {
        const daysOpen = data[0].bo
        const daysClose = data[0].bl
        const daysHigh = data[0].bh
        const daysLow = data[0].bl

        let isBullishHammer = daysClose > daysOpen
        isBullishHammer = isBullishHammer && approximateEqual(daysClose, daysHigh)
        isBullishHammer = isBullishHammer && (daysClose - daysOpen) <= 2 * (daysOpen - daysLow)

        return isBullishHammer
    }
}

export function hasBullishHammerStick(data: CandleStickDTO[]) {
    return new BullishHammerStick().hasPattern(data)
}