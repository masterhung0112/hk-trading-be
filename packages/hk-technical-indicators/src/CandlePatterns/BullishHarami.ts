import { IDataFrame } from 'hk-pd'
import { CandleStickDTO } from 'hk-trading-contract'
import { CandleMultiStickReversedDto } from '../Models'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishHarami extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishharami',
            name: 'BullishHarami',
            requiredBarNum: 2
        })
    }

    logic(data: CandleMultiStickReversedDto) {
        const firstdaysOpen = data.bo[0]
        const firstdaysClose = data.bc[0]
        const firstdaysHigh = data.bh[0]
        const seconddaysOpen = data.bo[1]
        const seconddaysClose = data.bc[1]
        const seconddaysHigh = data.bh[1]
        const seconddaysLow = data.bl[1]

        const isBullishHaramiPattern = ((firstdaysOpen > seconddaysOpen) &&
            (firstdaysClose < seconddaysOpen) &&
            (firstdaysClose < seconddaysClose) &&
            (firstdaysOpen > seconddaysLow) &&
            (firstdaysHigh > seconddaysHigh))

        return (isBullishHaramiPattern)
    }

    logicFirst(data: IDataFrame<number, CandleStickDTO>) {
        const firstStick = data.at(0)
        const secondStick = data.at(1)

        if (firstStick === undefined) {
            throw new Error('BullishHarami: first stick cannot be undefined')
        }
        
        if (secondStick === undefined) {
            throw new Error('BullishHarami: second stick cannot be undefined')
        }

        return ((firstStick.bo > secondStick.bo) &&
            (firstStick.bc < secondStick.bo) &&
            (firstStick.bc < secondStick.bc) &&
            (firstStick.bo > secondStick.bl) &&
            (firstStick.bh > secondStick.bh))
    }
}