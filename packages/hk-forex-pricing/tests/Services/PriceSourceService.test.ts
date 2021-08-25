import { ForexTickData, ResolutionType, CandleStickDTO } from 'hk-trading-contract'
import { Observable, Subject } from 'rxjs'
import { IMarketDataAdapter } from '../../src/constracts/IMarketDataAdapter'
import { MarketData } from '../../src/constracts/MarketData'
import { PriceSourceService } from '../../src/services/PriceSourceService'

const requestUri = 'http://localhost-test'

class TestMarketDataAdapter implements IMarketDataAdapter {
    createQuote(symbol: string): Observable<ForexTickData> {
      throw new Error('Method not implemented.')
    }
    createCandlesStream(symbol: string, resolution: ResolutionType, option?: { fromTimestamp?: number; toTimestamp?: number }): Observable<CandleStickDTO> {
      throw new Error('Method not implemented.')
    }
    private _subject = new Subject<MarketData[]>()
    get RequestUriString(): string {
        return requestUri
    }

    get marketDataObservable(): Observable<MarketData[]> {
        return this._subject.asObservable()
    }
    // async GetMarketData(): Promise<MarketData[]> {
    //     return [new MarketData(
    //         new CurrencyPair("EURUSD"), 1 + Math.random(), Date.now(), ""
    //     )]
    // }

    subscribe(symbol: string) {

    }
    unsubscribe(symbol: string) {

    }

}

describe('PriceSourceService', () => {
    it('RefreshMarketRates run with empty adapter', () => {
        const dataAdapter = new TestMarketDataAdapter()
        const priceSource = new PriceSourceService([dataAdapter])
        // priceSource.RefreshMarketRates()
    })
})
