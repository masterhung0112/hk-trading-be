import { DataFrame } from 'hk-pd'
import { CandleStickDTO } from 'hk-trading-contract'
import { AverageGain } from '../utils/AverageGain'
import { AverageLoss } from '../utils/AverageLoss'
import { hasBearishHammerStick } from './BearishHammerStick'
import { hasBearishInvertedHammerStick } from './BearishInvertedHammerStick'
import { hasBullishHammerStick } from './BullishHammerStick'
import { hasBullishInvertedHammerStick } from './BullishInvertedHammerStick'
import { CandlestickFinder } from './CandlestickFinder'

export class HammerPattern extends CandlestickFinder {
    constructor() {
        super({
            id: 'hammerpattern', 
            name: 'HammerPattern', 
            requiredBarNum: 5
        })
    }

    logic(data: CandleStickDTO[]) {
        let isPattern = this.downwardTrend(data)
        isPattern = isPattern && this.includesHammer(data)
        isPattern = isPattern && this.hasConfirmation(data)
        return isPattern
    }

    downwardTrend(data: CandleStickDTO[], confirm = true) {
        const end = confirm ? 3 : 4
        const dataDf = new DataFrame<number, CandleStickDTO>(data)
        const bcValue = dataDf.getSeries<number>('bc').take(end)
        // Analyze trends in closing prices of the first three or four candlesticks
        const gains = AverageGain.calculate({ values: bcValue, period: end - 1 })
        const losses = AverageLoss.calculate({ values: bcValue, period: end - 1 })
        // Downward trend, so more losses than gains
        return losses > gains
    }

    includesHammer(data: CandleStickDTO[], confirm = true) {
        const start = confirm ? 3 : 4
        const end = confirm ? 4 : undefined
        
        const possibleHammerData = new DataFrame(data).between(start, end).toArray()
        // const possibleHammerData: CandleStickDTO[] = {
        //     resolutionType: data[0].resolutionType,
        //     firstStickSts: data[0].firstStickSts,
        //     lastStickSts: data[0].lastStickSts,
        //     sym: data[0].sym,
        //     sts: data[0].sts,
        //     bo: data[0].bo.between(start, end),
        //     bc: data[0].bc.between(start, end),
        //     bl: data[0].bl.between(start, end),
        //     bh: data[0].bh.between(start, end),
        //     reversedInput: data[0].reversedInput
        // }

        let isPattern = hasBearishHammerStick(possibleHammerData)
        isPattern = isPattern || hasBearishInvertedHammerStick(possibleHammerData)
        isPattern = isPattern || hasBullishHammerStick(possibleHammerData)
        isPattern = isPattern || hasBullishInvertedHammerStick(possibleHammerData)

        return isPattern
    }

    hasConfirmation(data: CandleStickDTO[]) {
        const possibleHammer = {
            bo: data[3].bo,
            bc: data[3].bc,
            bl: data[3].bl,
            bh: data[3].bh,
        }
        const possibleConfirmation = {
            bo: data[3].bo,
            bc: data[3].bc,
            bl: data[3].bl,
            bh: data[3].bh,
        }
        // Confirmation candlestick is bullish
        const isPattern = possibleConfirmation.bo < possibleConfirmation.bc
        return isPattern && possibleHammer.bl < possibleConfirmation.bl
    }
}

export function hasHammerPattern(data: CandleStickDTO[]) {
    return new HammerPattern().hasPattern(data)
}