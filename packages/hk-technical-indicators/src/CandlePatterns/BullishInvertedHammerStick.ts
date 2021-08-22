import StockData from '../StockData'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export default class BullishInvertedHammerStick extends CandlestickFinder {
    constructor() {
        super('BullishInvertedHammerStick', 1)
    }
    
    logic(data: StockData) {
        const daysOpen = data.open[0]
        const daysClose = data.close[0]
        const daysHigh = data.high[0]
        const daysLow = data.low[0]

        let isBullishInvertedHammer = daysClose > daysOpen
        isBullishInvertedHammer = isBullishInvertedHammer && approximateEqual(daysOpen, daysLow)
        isBullishInvertedHammer = isBullishInvertedHammer && (daysClose - daysOpen) <= 2 * (daysHigh - daysClose)

        return isBullishInvertedHammer
    }
}

export function hasBullishInvertedHammerStick(data: StockData) {
    return new BullishInvertedHammerStick().hasPattern(data)
}