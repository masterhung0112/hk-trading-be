import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'
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

    logic(data: CandleMultiStickReversedDto) {
        let isPattern = this.downwardTrend(data)
        isPattern = isPattern && this.includesHammer(data)
        isPattern = isPattern && this.hasConfirmation(data)
        return isPattern
    }

    downwardTrend(data: CandleMultiStickReversedDto, confirm = true) {
        const end = confirm ? 3 : 4
        // Analyze trends in closing prices of the first three or four candlesticks
        const gains = AverageGain.calculate({ values: data.bc.slice(0, end), period: end - 1 })
        const losses = AverageLoss.calculate({ values: data.bc.slice(0, end), period: end - 1 })
        // Downward trend, so more losses than gains
        return losses > gains
    }

    includesHammer(data: CandleMultiStickReversedDto, confirm = true) {
        const start = confirm ? 3 : 4
        const end = confirm ? 4 : undefined
        const possibleHammerData: CandleMultiStickReversedDto = {
            sym: data.sym,
            sts: data.sts,
            bo: data.bo.slice(start, end),
            bc: data.bc.slice(start, end),
            bl: data.bl.slice(start, end),
            bh: data.bh.slice(start, end),
            reversedInput: data.reversedInput
        }

        let isPattern = hasBearishHammerStick(possibleHammerData)
        isPattern = isPattern || hasBearishInvertedHammerStick(possibleHammerData)
        isPattern = isPattern || hasBullishHammerStick(possibleHammerData)
        isPattern = isPattern || hasBullishInvertedHammerStick(possibleHammerData)

        return isPattern
    }

    hasConfirmation(data: CandleMultiStickReversedDto) {
        const possibleHammer = {
            bo: data.bo[3],
            bc: data.bc[3],
            bl: data.bl[3],
            bh: data.bh[3],
        }
        const possibleConfirmation = {
            bo: data.bo[4],
            bc: data.bc[4],
            bl: data.bl[4],
            bh: data.bh[4],
        }
        // Confirmation candlestick is bullish
        const isPattern = possibleConfirmation.bo < possibleConfirmation.bc
        return isPattern && possibleHammer.bl < possibleConfirmation.bl
    }
}

export function hasHammerPattern(data: CandleMultiStickReversedDto) {
    return new HammerPattern().hasPattern(data)
}