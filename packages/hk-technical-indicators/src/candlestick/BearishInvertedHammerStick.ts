import StockData from '../StockData';
import { approximateEqual } from '../utils/approximateEqual';
import { CandlestickFinder } from './CandlestickFinder';

export default class BearishInvertedHammerStick extends CandlestickFinder {
    constructor() {
        super('BearishInvertedHammerStick', 1)
    }
    logic (data:StockData) {
        let daysOpen  = data.open[0];
        let daysClose = data.close[0];
        let daysHigh  = data.high[0];
        let daysLow   = data.low[0];

        let isBearishInvertedHammer = daysOpen > daysClose;
        isBearishInvertedHammer = isBearishInvertedHammer && approximateEqual(daysClose, daysLow);
        isBearishInvertedHammer = isBearishInvertedHammer && (daysOpen - daysClose) <= 2 * (daysHigh - daysOpen);

        return isBearishInvertedHammer;
    }
}

export function hasBearishInvertedHammerStick(data:StockData) {
  return new BearishInvertedHammerStick().hasPattern(data);
}