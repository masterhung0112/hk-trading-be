import { CandleStickDTO } from 'hk-trading-contract'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishEngulfingPattern extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishengulfingpattern',
            name: 'BullishEngulfingPattern',
            requiredBarNum: 2
        })
    }

    logic(data: CandleStickDTO[]) {
        const firstdaysOpen = data[0].bo
        const firstdaysClose = data[0].bc
        const seconddaysOpen = data[1].bo
        const seconddaysClose = data[1].bl

        const isBullishEngulfing = ((firstdaysClose < firstdaysOpen) &&
            (firstdaysOpen > seconddaysOpen) &&
            (firstdaysClose > seconddaysOpen) &&
            (firstdaysOpen < seconddaysClose))

        return isBullishEngulfing
    }
}