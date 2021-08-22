import StockData from '../StockData'
import { AverageGain } from '../utils/AverageGain'
import { AverageLoss } from '../utils/AverageLoss'
import { hasBearishHammerStick } from './BearishHammerStick'
import { hasBearishInvertedHammerStick } from './BearishInvertedHammerStick'
import { hasBullishHammerStick } from './BullishHammerStick'
import { hasBullishInvertedHammerStick } from './BullishInvertedHammerStick'
import { CandlestickFinder } from './CandlestickFinder'

export default class HammerPattern extends CandlestickFinder {
    constructor() {
        super('HammerPattern', 5)
    }

    logic(data: StockData) {
        let isPattern = this.downwardTrend(data)
        isPattern = isPattern && this.includesHammer(data)
        isPattern = isPattern && this.hasConfirmation(data)
        return isPattern
    }

    downwardTrend(data: StockData, confirm = true) {
        const end = confirm ? 3 : 4
        // Analyze trends in closing prices of the first three or four candlesticks
        const gains = AverageGain.calculate({ values: data.close.slice(0, end), period: end - 1 })
        const losses = AverageLoss.calculate({ values: data.close.slice(0, end), period: end - 1 })
        // Downward trend, so more losses than gains
        return losses > gains
    }

    includesHammer(data: StockData, confirm = true) {
        const start = confirm ? 3 : 4
        const end = confirm ? 4 : undefined
        const possibleHammerData = {
            open: data.open.slice(start, end),
            close: data.close.slice(start, end),
            low: data.low.slice(start, end),
            high: data.high.slice(start, end),
        }

        let isPattern = hasBearishHammerStick(possibleHammerData)
        isPattern = isPattern || hasBearishInvertedHammerStick(possibleHammerData)
        isPattern = isPattern || hasBullishHammerStick(possibleHammerData)
        isPattern = isPattern || hasBullishInvertedHammerStick(possibleHammerData)

        return isPattern
    }

    hasConfirmation(data: StockData) {
        const possibleHammer = {
            open: data.open[3],
            close: data.close[3],
            low: data.low[3],
            high: data.high[3],
        }
        const possibleConfirmation = {
            open: data.open[4],
            close: data.close[4],
            low: data.low[4],
            high: data.high[4],
        }
        // Confirmation candlestick is bullish
        const isPattern = possibleConfirmation.open < possibleConfirmation.close
        return isPattern && possibleHammer.close < possibleConfirmation.close
    }
}

export function hasHammerPattern(data: StockData) {
    return new HammerPattern().hasPattern(data)
}