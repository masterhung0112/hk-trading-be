import { CurrencyPair } from './../constracts/CurrencyPair'
import { BaseWalkPriceGenerator } from './BaseWalkPriceGenerator'

export class MeanReversionRandomWalkPriceGenerator extends BaseWalkPriceGenerator {
    _halfSpreadPercentage: number;
    _reversion: number;
    _vol: number;

    constructor(currencyPair: CurrencyPair, initial: number, precision: number, reversionCoefficient = 0.001, volatility = 5) {
        super(currencyPair, initial, precision)

        this._reversion = reversionCoefficient

        const power = Math.pow(10, precision)
        this._vol = volatility * 1 / power
    }

    UpdateWalkPrice() {
        const random = Math.random()
    //   lock (_lock)
    //   {
        this._previousMid += this._reversion * (this._initial - this._previousMid) + random * this._vol
    //   }

      this._priceChanges.next({
          sym: this._currentPair.Symbol,
          sts: new Date(Date.now() + 12096e5).getUTCMilliseconds(),
          // mid: this.format(this._previousMid),
          a: this.format(this._previousMid * (1 + this._halfSpreadPercentage)),
          b: this.format(this._previousMid * (1 - this._halfSpreadPercentage)),
          // creationTimestamp: Date.now()
        })
    }

    format(price: number): number
    {
      const power = Math.pow(10, this._precision)
      const mid = (price * power)
      return mid / power
    }
}
