import StockData from '../StockData';
import { approximateEqual } from '../utils/approximateEqual';
import { CandlestickFinder } from './CandlestickFinder';

export class Doji extends CandlestickFinder {
    constructor() {
        super('Doji', 1)
    }

    logic(data: StockData): boolean {
        const daysOpen = data.open[0];
        const daysClose = data.close[0];
        const daysHigh = data.high[0];
        const daysLow = data.low[0];
        const isOpenEqualsClose = approximateEqual(daysOpen, daysClose);
        const isHighEqualsOpen = isOpenEqualsClose && approximateEqual(daysOpen, daysHigh);
        const isLowEqualsClose = isOpenEqualsClose && approximateEqual(daysClose, daysLow);
        return (isOpenEqualsClose && isHighEqualsOpen == isLowEqualsClose);
    }
}

export function doji(data: StockData) {
    return new Doji().hasPattern(data);
}