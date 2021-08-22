import StockData from '../StockData'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'

export class BearishHammerStick extends CandlestickFinder {
    constructor() {
        super('BearishHammerStick', 1)
    }

    logic(data: StockData) {
        const daysOpen = data.open[0]
        const daysClose = data.close[0]
        const daysHigh = data.high[0]
        const daysLow = data.low[0]

        let isBearishHammer = daysOpen > daysClose
        isBearishHammer = isBearishHammer && approximateEqual(daysOpen, daysHigh)
        isBearishHammer = isBearishHammer && (daysOpen - daysClose) <= 2 * (daysClose - daysLow)

        return isBearishHammer
    }
}

export function hasBearishHammerStick(data: StockData) {
    return new BearishHammerStick().hasPattern(data)
}