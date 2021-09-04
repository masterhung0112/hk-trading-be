import { CandleMultiStickReversedDto } from '../Models'
import { CandlestickFinder } from './CandlestickFinder'

export class BullishEngulfingPattern extends CandlestickFinder {
    constructor() {
        super({
            id: 'bullishengulfingpattern',
            name: 'BullishEngulfingPattern',
            requiredBarNum: 2
        })
    }

    logic(data: CandleMultiStickReversedDto) {
        const firstdaysOpen = data.bo[0]
        const firstdaysClose = data.bc[0]
        const seconddaysOpen = data.bo[1]
        const seconddaysClose = data.bl[1]

        const isBullishEngulfing = ((firstdaysClose < firstdaysOpen) &&
            (firstdaysOpen > seconddaysOpen) &&
            (firstdaysClose > seconddaysOpen) &&
            (firstdaysOpen < seconddaysClose))

        return isBullishEngulfing
    }
}