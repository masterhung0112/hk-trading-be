import { CurrencyPair } from "./../constracts/CurrencyPair";
import { BaseWalkPriceGenerator } from "./BaseWalkPriceGenerator";

export class MeanReversionRandomWalkPriceGenerator extends BaseWalkPriceGenerator {
    _halfSpreadPercentage: number;
    _reversion: number;
    _vol: number;

    constructor(currencyPair: CurrencyPair, initial: number, precision: number, reversionCoefficient: number = 0.001, volatility: number = 5) {
        super(currencyPair, initial, precision)

        this._reversion = reversionCoefficient

        let power = Math.pow(10, precision)
        this._vol = volatility * 1 / power
    }

    UpdateWalkPrice() {
        var random = Math.random()
    //   lock (_lock)
    //   {
        this._previousMid += this._reversion * (this._initial - this._previousMid) + random * this._vol;
    //   }
        
      this._priceChanges.next({
          symbol: this._currentPair.Symbol,
          valueDate: new Date(Date.now() + 12096e5).getUTCMilliseconds(),
          mid: this.format(this._previousMid),
          ask: this.format(this._previousMid * (1 + this._halfSpreadPercentage)),
          bid: this.format(this._previousMid * (1 - this._halfSpreadPercentage)),
          creationTimestamp: Date.now()
        })
    }

    format(price: number): number
    {
      let power = Math.pow(10, this._precision);
      let mid = (price * power);
      return mid / power;
    }
}