import StockData from '../StockData'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export default class BullishHammerStick extends CandlestickFinder {
    constructor() {
        super('BullishHammerStick', 1)
    }
    logic(data: StockData) {
        const daysOpen = data.open[0]
        const daysClose = data.close[0]
        const daysHigh = data.high[0]
        const daysLow = data.low[0]

        let isBullishHammer = daysClose > daysOpen
        isBullishHammer = isBullishHammer && approximateEqual(daysClose, daysHigh)
        isBullishHammer = isBullishHammer && (daysClose - daysOpen) <= 2 * (daysOpen - daysLow)

        return isBullishHammer
    }
}

export function hasBullishHammerStick(data: StockData) {
    return new BullishHammerStick().hasPattern(data)
}