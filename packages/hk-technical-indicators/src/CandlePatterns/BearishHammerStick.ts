import { CandleMultiStickReversedDto } from '../Models/CandleMultiStickReversedDto'
import { approximateEqual } from '../utils/approximateEqual'
import { CandlestickFinder } from './CandlestickFinder'
import { IDataFrame } from 'hk-pd'
import { CandleStickDTO } from 'hk-trading-contract'

export class BearishHammerStick extends CandlestickFinder {
    constructor() {
        super({
            id: 'bearishhammer', 
            name: 'BearishHammerStick', 
            requiredBarNum: 1
        })
    }

    private _isBearishHammerByOCHL(o: number, c: number, h: number, l: number) {
        let isBearishHammer = o > c
        isBearishHammer = isBearishHammer && approximateEqual(o, h)
        isBearishHammer = isBearishHammer && (o - c) <= 2 * (c - l)

        return isBearishHammer
    }

    logic(data: CandleMultiStickReversedDto) {
        return this._isBearishHammerByOCHL(data.bo[0], data.bc[0], data.bh[0], data.bl[0])
    }

    logicFirst(data: IDataFrame<number, CandleStickDTO>) {
        const candleStickDTO = data.first()
        return this._isBearishHammerByOCHL(candleStickDTO.bo, candleStickDTO.bc, candleStickDTO.bh, candleStickDTO.bl)
    }
}

export function hasBearishHammerStick(data: CandleMultiStickReversedDto) {
    return new BearishHammerStick().hasPattern(data)
}