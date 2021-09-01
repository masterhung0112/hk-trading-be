import { Observable, Subject } from 'rxjs'
import { CurrencyPair } from '../constracts/CurrencyPair'
import { CandleTickData } from 'hk-trading-contract'
import { IPriceGenerator } from '../constracts/IPriceGenerator'
import { HardCodedSourceName } from '../contants/PriceSource'

export abstract class BaseWalkPriceGenerator implements IPriceGenerator {
    _priceChanges: Subject<CandleTickData>
    _currentPair: CurrencyPair
    _effectiveDate: Date
    _sourceName: string
    _precision: number

    _initial: number
    _previousMid: number

    constructor(currencyPair: CurrencyPair, initial: number, precision: number) {
        this._currentPair = currencyPair

        this._initial = this._previousMid = initial
        this._precision = precision
        this._effectiveDate = new Date(2019, 1, 1)
        this._sourceName = HardCodedSourceName
    }

    get CurrencyPair(): CurrencyPair {
        return this._currentPair
    }
    get EffectiveDate(): Date {
        return this._effectiveDate
    }
    get SourceName(): string {
        return this._sourceName
    }
    get SampleRate(): number {
        return this._previousMid
    }

    get PriceChanges(): Observable<CandleTickData> {
        return this._priceChanges
    }

    UpdateInitialValue(newValue: number, effectiveDate: Date, sourceName: string)
    {
    //   lock (_lock)
    //   {
        this._initial = this._previousMid = newValue
        this._effectiveDate = effectiveDate
        this._sourceName = sourceName
    //   }
        this.UpdateWalkPrice()
    }

    abstract UpdateWalkPrice()
}
