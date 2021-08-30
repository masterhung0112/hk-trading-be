import { Observable } from 'rxjs'
import { CandleTickData } from 'hk-trading-contract'

import { CurrencyPair } from './CurrencyPair'

export interface IPriceGenerator {
    get CurrencyPair(): CurrencyPair
    get EffectiveDate(): Date
    get SourceName(): string
    get SampleRate(): number
    get PriceChanges(): Observable<CandleTickData>

    UpdateInitialValue(newValue: number, effectiveDate: Date, sourceName: string)
    UpdateWalkPrice()
}
