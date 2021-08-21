import { Observable, Subject } from "rxjs"
import { IMarketDataAdapter } from "../constracts/IMarketDataAdapter"
import { MarketData } from "../constracts/MarketData"
import { PriceSource } from "./PriceSource"

const requestUri = "http://localhost-test"

class TestMarketDataAdapter implements IMarketDataAdapter {
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

describe('PriceSource', () => {
    it('RefreshMarketRates run with empty adapter', () => {
        const dataAdapter = new TestMarketDataAdapter()
        const priceSource = new PriceSource([dataAdapter])
        // priceSource.RefreshMarketRates()
    })
})