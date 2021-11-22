import { IDataFrame } from 'hk-pd'
import { CandleStickDTO } from 'hk-trading-contract'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishHarami extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishharami',
            name: 'BullishHarami',
            requiredBarNum: 2
        })
    }

    logic(data: CandleStickDTO[]) {
        const firstdaysOpen = data[0].bo
        const firstdaysClose = data[0].bc
        const firstdaysHigh = data[0].bh
        const seconddaysOpen = data[1].bo
        const seconddaysClose = data[1].bc
        const seconddaysHigh = data[1].bh
        const seconddaysLow = data[1].bl

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