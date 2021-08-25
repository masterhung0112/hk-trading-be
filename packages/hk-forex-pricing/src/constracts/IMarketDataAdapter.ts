import { Observable } from 'rxjs'
import { ForexTickData } from 'hk-trading-contract'

export interface IMarketDataAdapter {
    // get RequestUriString(): string
    // get marketDataObservable(): Observable<MarketData[]>

    createQuote(symbol: string): Observable<ForexTickData>

    // createCandlesStream(symbol: string, resolution: ResolutionType, option?: {
    //     fromTimestamp?: number
    //     toTimestamp?: number
    // }): Observable<MarketData>
}
