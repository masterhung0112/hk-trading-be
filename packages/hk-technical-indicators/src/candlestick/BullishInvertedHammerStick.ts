import StockData from '../StockData';
import { approximateEqual } from '../utils/approximateEqual';
import { CandlestickFinder } from './CandlestickFinder';

export default class BullishInvertedHammerStick extends CandlestickFinder {
    constructor() {
        super('BullishInvertedHammerStick', 1)
    }
    logic(data: StockData) {
        let daysOpen = data.open[0];
        let daysClose = data.close[0];
        let daysHigh = data.high[0];
        let daysLow = data.low[0];

        let isBullishInvertedHammer = daysClose > daysOpen;
        isBullishInvertedHammer = isBullishInvertedHammer && approximateEqual(daysOpen, daysLow);
        isBullishInvertedHammer = isBullishInvertedHammer && (daysClose - daysOpen) <= 2 * (daysHigh - daysClose);

        return isBullishInvertedHammer;
    }
}

export function hasBullishInvertedHammerStick(data: StockData) {
    return new BullishInvertedHammerStick().hasPattern(data);
}